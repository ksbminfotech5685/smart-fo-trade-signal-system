import express from 'express';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { auth, admin } from '../middleware/auth.middleware';
import { marketHoursCheck } from '../middleware/error.middleware';
import Order from '../models/order.model';
import Signal from '../models/signal.model';
import * as KiteService from '../services/kite.service';
import * as TelegramService from '../services/telegram.service';
import * as OrderExecution from '../services/orderExecution.service';

const router = express.Router();

/**
 * Get user's order history
 * @route GET /api/orders
 * @access Private
 */
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ orderTimestamp: -1 })
      .populate('signalId', 'stock option type');

    res.json({ orders });
  } catch (error) {
    console.error('Get order history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get order by ID
 * @route GET /api/orders/:id
 * @access Private
 */
router.get('/:id', auth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    // Get order
    const order = await Order.findOne({
      _id: id,
      userId: req.user.id,
    }).populate('signalId', 'stock option type entryPrice targetPrice stopLoss');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Execute order manually
 * @route POST /api/orders/execute/:signalId
 * @access Private
 */
router.post('/execute/:signalId', auth, marketHoursCheck, async (req: Request, res: Response) => {
  try {
    const { signalId } = req.params;
    const { quantity, price } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(signalId)) {
      return res.status(400).json({ message: 'Invalid signal ID' });
    }

    // Get signal
    const signal = await Signal.findById(signalId);

    if (!signal) {
      return res.status(404).json({ message: 'Signal not found' });
    }

    // Check if signal already executed
    if (signal.executedOrder) {
      return res.status(400).json({ message: 'Signal already executed' });
    }

    // Parse the option string to get components
    const optionParts = signal.option.split(' ');
    if (optionParts.length < 3) {
      return res.status(400).json({ message: 'Invalid option format' });
    }

    const symbol = optionParts[0];
    const strikePrice = optionParts[1];
    const optionType = optionParts[2];

    // Construct trading symbol
    const tradingSymbol = `${symbol}${getExpiryCode()}${strikePrice}${optionType}`;

    // Place the order
    const orderResponse = await KiteService.placeOrder(
      req.user.id,
      'NFO',
      tradingSymbol,
      signal.type,
      quantity,
      price || null, // Use price if provided, otherwise market order
      'MIS',
      price ? 'LIMIT' : 'MARKET',
      'DAY',
      0,
      0,
      null,
      null,
      null,
      `MANUAL_${signalId}`
    );

    if (!orderResponse || !orderResponse.order_id) {
      return res.status(500).json({
        message: 'Failed to place order',
        error: orderResponse?.message || 'Unknown error',
      });
    }

    // Create order record
    const order = new Order({
      signalId,
      userId: req.user.id,
      kiteOrderId: orderResponse.order_id,
      status: 'OPEN',
      transactionType: signal.type,
      exchange: 'NFO',
      tradingSymbol,
      quantity,
      price: price || undefined,
      product: 'MIS',
      orderType: price ? 'LIMIT' : 'MARKET',
      variety: 'regular',
      validity: 'DAY',
      filledQuantity: 0,
      pendingQuantity: quantity,
      orderTimestamp: new Date(),
      cancelledQuantity: 0,
    });

    await order.save();

    // Update signal
    signal.executedOrder = true;
    signal.executedAt = new Date();
    signal.orderStatus = 'PENDING';
    signal.orderDetails = {
      orderId: orderResponse.order_id,
      orderPrice: price || signal.currentMarketPrice,
      quantity,
    };
    await signal.save();

    // Send notification
    await TelegramService.sendOrderUpdate(
      signal,
      true,
      `Manual order placed for ${quantity} shares at ${price ? `limit price ₹${price}` : 'market price'}.`
    );

    res.json({
      message: 'Order placed successfully',
      order: {
        id: order._id,
        kiteOrderId: orderResponse.order_id,
        status: 'OPEN',
      },
    });
  } catch (error) {
    console.error('Execute order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Cancel an order
 * @route POST /api/orders/cancel/:id
 * @access Private
 */
router.post('/cancel/:id', auth, marketHoursCheck, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    // Get order
    const order = await Order.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order can be cancelled
    if (order.status !== 'OPEN') {
      return res.status(400).json({ message: `Cannot cancel order with status ${order.status}` });
    }

    // Cancel the order
    const cancelResponse = await KiteService.cancelOrder(
      req.user.id.toString(),
      order.kiteOrderId,
      order.variety
    );

    if (!cancelResponse) {
      return res.status(500).json({ message: 'Failed to cancel order' });
    }

    // Update order status
    order.status = 'CANCELLED';
    order.pendingQuantity = 0;
    order.cancelledQuantity = order.quantity;
    await order.save();

    // Update signal
    const signal = await Signal.findById(order.signalId);
    if (signal) {
      signal.orderStatus = 'CANCELLED';
      await signal.save();

      // Send notification
      await TelegramService.sendOrderUpdate(
        signal,
        false,
        `Order cancelled for ${signal.stock} (${signal.option}).`
      );
    }

    res.json({
      message: 'Order cancelled successfully',
      order: {
        id: order._id,
        status: 'CANCELLED',
      },
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Process pending orders manually (admin only)
 * @route POST /api/orders/process-pending
 * @access Private (Admin only)
 */
router.post('/process-pending', auth, admin, marketHoursCheck, async (req: Request, res: Response) => {
  try {
    await OrderExecution.processPendingSignals();

    res.json({ message: 'Pending orders processed successfully' });
  } catch (error) {
    console.error('Process pending orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get expiry code for option symbol
 * This is a simplified version and will need to be adapted to the actual broker's format
 */
const getExpiryCode = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');

  // In reality, you'd need to calculate the actual expiry date
  // This is just a placeholder
  return `${month}${year}`;
};

export default router;
