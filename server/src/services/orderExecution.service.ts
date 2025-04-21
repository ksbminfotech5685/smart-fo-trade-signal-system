import User from '../models/user.model';
import Signal from '../models/signal.model';
import Order from '../models/order.model';
import { DailyAnalytics } from '../models/analytics.model';
import * as KiteService from './kite.service';
import * as TelegramService from './telegram.service';
import { isMarketHours, getStartOfDay } from '../utils/date.util';

// Configuration
const MAX_TRADE_ATTEMPTS = 3;
const ORDER_CHECK_INTERVAL_MS = 5000; // 5 seconds
const MAX_ORDER_CHECK_ATTEMPTS = 36; // Check for 3 minutes max (36 * 5 seconds)

/**
 * Process signals and execute trades
 */
export const processPendingSignals = async (): Promise<void> => {
  try {
    // Check if market is open
    if (!isMarketHours()) {
      console.log('Market is closed. Order execution skipped.');
      return;
    }

    // Find admin user with auto-trading enabled
    const adminUser = await User.findOne({
      role: 'admin',
      isAutoTradingEnabled: true,
      zerodhaAccessToken: { $exists: true },
    });

    if (!adminUser) {
      console.log('No admin user with auto-trading enabled. Order execution skipped.');
      return;
    }

    // Check if we've reached the max trades limit for today
    const today = new Date();
    const startOfDay = getStartOfDay(today);

    // Changed from const to let to allow modification
    let ordersToday = await Order.countDocuments({
      userId: adminUser._id,
      orderTimestamp: { $gte: startOfDay },
    });

    if (ordersToday >= adminUser.maxTradesPerDay) {
      console.log(`Maximum trades for today (${adminUser.maxTradesPerDay}) already executed. Skipping.`);
      return;
    }

    // Find pending signals that haven't been executed
    const pendingSignals = await Signal.find({
      generatedAt: { $gte: startOfDay },
      sentToTelegram: true,
      executedOrder: false,
    }).sort({ generatedAt: 1 });

    if (pendingSignals.length === 0) {
      console.log('No pending signals to execute.');
      return;
    }

    console.log(`Found ${pendingSignals.length} pending signals to process.`);

    // Execute each signal
    for (const signal of pendingSignals) {
      if (ordersToday >= adminUser.maxTradesPerDay) {
        break;
      }

      // Execute the order for this signal
      const executionResult = await executeOrder(signal, adminUser);

      if (executionResult.success) {
        // Update count if order was executed
        if (executionResult.orderExecuted) {
          ordersToday++;
        }
      }
    }
  } catch (error) {
    console.error('Error processing pending signals:', error);
    await TelegramService.sendSystemAlert('error', 'Error in order execution process. Check server logs for details.');
  }
};

/**
 * Execute an order for a signal
 */
const executeOrder = async (signal: any, user: any): Promise<{ success: boolean; orderExecuted: boolean }> => {
  try {
    console.log(`Processing signal for ${signal.stock} (${signal.option})`);

    // Get the current price of the option
    const optionParts = signal.option.split(' ');
    if (optionParts.length < 3) {
      console.error(`Invalid option format for signal ${signal._id}: ${signal.option}`);
      return { success: false, orderExecuted: false };
    }

    const symbol = optionParts[0];
    const strikePrice = optionParts[1];
    const optionType = optionParts[2];

    // Construct the trading symbol for options (NFO exchange format)
    // This is an approximation; actual format may vary by broker
    const tradingSymbol = `${symbol}${getExpiryCode()}${strikePrice}${optionType}`;

    // Get current market price
    const quote = await KiteService.getQuote('NFO', tradingSymbol);
    if (!quote) {
      console.error(`Failed to get quote for ${tradingSymbol}`);
      return { success: false, orderExecuted: false };
    }

    const currentPrice = quote.last_price || 0;

    // Check if current price is within our buy range
    if (currentPrice < signal.entryPrice * 0.95 || currentPrice > signal.entryPrice * 1.05) {
      console.log(`Current price (${currentPrice}) is outside our buy range for ${signal.option}. Skipping.`);
      return { success: true, orderExecuted: false };
    }

    // Calculate quantity based on max capital per trade
    const quantity = Math.floor(user.maxCapitalPerTrade / currentPrice);

    if (quantity <= 0) {
      console.log(`Calculated quantity is zero for ${signal.option} at price ${currentPrice}. Skipping.`);
      return { success: true, orderExecuted: false };
    }

    // Place the order
    const orderResponse = await KiteService.placeOrder(
      user._id.toString(),
      'NFO',
      tradingSymbol,
      'BUY',
      quantity,
      null, // Market order
      'MIS', // Intraday
      'MARKET', // Order type
      'DAY', // Validity
      0, // Disclosed quantity
      0, // Trigger price
      null, // Squareoff
      null, // Stoploss
      null, // Trailing stoploss
      `AUTO_${signal._id}` // Tag
    );

    if (!orderResponse || !orderResponse.order_id) {
      console.error(`Failed to place order for ${signal.option}`);
      await TelegramService.sendOrderUpdate(
        signal,
        false,
        `Failed to place order for ${quantity} shares at market price. Error: ${orderResponse?.message || 'Unknown error'}`
      );
      return { success: false, orderExecuted: false };
    }

    // Order placed successfully
    console.log(`Order placed successfully for ${signal.option}. Order ID: ${orderResponse.order_id}`);

    // Create an order record
    const order = new Order({
      signalId: signal._id,
      userId: user._id,
      kiteOrderId: orderResponse.order_id,
      status: 'OPEN',
      transactionType: 'BUY',
      exchange: 'NFO',
      tradingSymbol,
      quantity,
      product: 'MIS',
      orderType: 'MARKET',
      variety: 'regular',
      validity: 'DAY',
      filledQuantity: 0,
      pendingQuantity: quantity,
      orderTimestamp: new Date(),
      cancelledQuantity: 0,
    });

    await order.save();

    // Wait for order execution
    const orderStatus = await waitForOrderExecution(orderResponse.order_id, user._id.toString());

    if (!orderStatus.executed) {
      await TelegramService.sendOrderUpdate(
        signal,
        false,
        `Order was placed but execution failed or timed out. Status: ${orderStatus.status}`
      );
      return { success: true, orderExecuted: false };
    }

    // Order executed successfully
    await TelegramService.sendOrderUpdate(
      signal,
      true,
      `Order executed successfully for ${quantity} shares at price ₹${orderStatus.averagePrice.toFixed(2)}.`
    );

    // Update signal as executed
    signal.executedOrder = true;
    signal.executedAt = new Date();
    signal.orderStatus = 'EXECUTED';
    signal.orderDetails = {
      orderId: orderResponse.order_id,
      orderPrice: orderStatus.averagePrice,
      quantity,
      filledQuantity: orderStatus.filledQuantity,
      status: orderStatus.status,
    };
    await signal.save();

    // Update order with execution details
    order.status = 'COMPLETE';
    order.filledQuantity = orderStatus.filledQuantity;
    order.pendingQuantity = 0;
    order.averagePrice = orderStatus.averagePrice;
    order.exchangeTimestamp = orderStatus.exchangeTimestamp;
    await order.save();

    // Place stop loss and target orders
    await placeStopLossAndTargetOrders(signal, order, user);

    // Update analytics
    await updateDailyAnalytics(signal);

    return { success: true, orderExecuted: true };
  } catch (error) {
    console.error(`Error executing order for signal ${signal._id}:`, error);
    await TelegramService.sendOrderUpdate(
      signal,
      false,
      `Error executing order: ${error.message || 'Unknown error'}`
    );
    return { success: false, orderExecuted: false };
  }
};

/**
 * Wait for an order to be executed
 */
const waitForOrderExecution = async (
  orderId: string,
  userId: string
): Promise<{ executed: boolean; status: string; averagePrice: number; filledQuantity: number; exchangeTimestamp: Date }> => {
  let attempts = 0;

  while (attempts < MAX_ORDER_CHECK_ATTEMPTS) {
    attempts++;

    try {
      // Get order history
      const orderHistory = await KiteService.getOrderHistory(userId, orderId);

      if (!orderHistory || orderHistory.length === 0) {
        await new Promise(resolve => setTimeout(resolve, ORDER_CHECK_INTERVAL_MS));
        continue;
      }

      const latestOrder = orderHistory[orderHistory.length - 1];

      if (latestOrder.status === 'COMPLETE') {
        return {
          executed: true,
          status: 'COMPLETE',
          averagePrice: latestOrder.average_price || 0,
          filledQuantity: latestOrder.filled_quantity || 0,
          exchangeTimestamp: new Date(latestOrder.exchange_timestamp || Date.now()),
        };
      } else if (latestOrder.status === 'REJECTED' || latestOrder.status === 'CANCELLED') {
        return {
          executed: false,
          status: latestOrder.status,
          averagePrice: 0,
          filledQuantity: 0,
          exchangeTimestamp: new Date(),
        };
      }

      // Order still in progress, wait and check again
      await new Promise(resolve => setTimeout(resolve, ORDER_CHECK_INTERVAL_MS));
    } catch (error) {
      console.error(`Error checking order status for ${orderId}:`, error);
      await new Promise(resolve => setTimeout(resolve, ORDER_CHECK_INTERVAL_MS));
    }
  }

  // Max attempts reached, consider the order as not executed
  return {
    executed: false,
    status: 'TIMEOUT',
    averagePrice: 0,
    filledQuantity: 0,
    exchangeTimestamp: new Date(),
  };
};

/**
 * Place stop loss and target orders
 */
const placeStopLossAndTargetOrders = async (signal: any, order: any, user: any): Promise<void> => {
  try {
    // Place stop loss order
    const stopLossOrder = await KiteService.placeOrder(
      user._id.toString(),
      'NFO',
      order.tradingSymbol,
      'SELL',
      order.filledQuantity,
      null, // Market price
      'MIS', // Intraday
      'SL-M', // Stop loss market order
      'DAY', // Validity
      0, // Disclosed quantity
      signal.stopLoss, // Trigger price
      null, // Squareoff
      null, // Stoploss
      null, // Trailing stoploss
      `SL_${signal._id}` // Tag
    );

    if (stopLossOrder && stopLossOrder.order_id) {
      console.log(`Stop loss order placed for ${signal.option}. Order ID: ${stopLossOrder.order_id}`);

      // Update order with SL details
      order.stopLossOrder = {
        orderId: stopLossOrder.order_id,
        triggerPrice: signal.stopLoss,
        status: 'OPEN',
      };
      await order.save();
    } else {
      console.error(`Failed to place stop loss order for ${signal.option}`);
    }

    // Place target order
    const targetOrder = await KiteService.placeOrder(
      user._id.toString(),
      'NFO',
      order.tradingSymbol,
      'SELL',
      order.filledQuantity,
      signal.targetPrice, // Limit price
      'MIS', // Intraday
      'LIMIT', // Limit order
      'DAY', // Validity
      0, // Disclosed quantity
      0, // Trigger price
      null, // Squareoff
      null, // Stoploss
      null, // Trailing stoploss
      `TARGET_${signal._id}` // Tag
    );

    if (targetOrder && targetOrder.order_id) {
      console.log(`Target order placed for ${signal.option}. Order ID: ${targetOrder.order_id}`);

      // Update order with target details
      order.targetOrder = {
        orderId: targetOrder.order_id,
        price: signal.targetPrice,
        status: 'OPEN',
      };
      await order.save();
    } else {
      console.error(`Failed to place target order for ${signal.option}`);
    }
  } catch (error) {
    console.error(`Error placing stop loss and target orders for ${signal.option}:`, error);
  }
};

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

/**
 * Update daily analytics with new execution
 */
const updateDailyAnalytics = async (signal: any): Promise<void> => {
  try {
    const today = new Date();
    const startOfDay = getStartOfDay(today);

    // Find or create today's analytics
    const dailyAnalytics = await DailyAnalytics.findOne({ date: startOfDay });

    if (dailyAnalytics) {
      dailyAnalytics.executedOrders += 1;
      await dailyAnalytics.save();
    }
  } catch (error) {
    console.error('Error updating daily analytics:', error);
  }
};

/**
 * Check for completed orders and update signals and analytics
 */
export const checkCompletedOrders = async (): Promise<void> => {
  try {
    // Check if market is open
    if (!isMarketHours()) {
      return;
    }

    console.log('Checking for completed orders...');

    // Find open orders with stop loss or target
    const openOrders = await Order.find({
      status: 'COMPLETE',
      $or: [
        { 'stopLossOrder.status': 'OPEN' },
        { 'targetOrder.status': 'OPEN' },
      ],
    });

    if (openOrders.length === 0) {
      return;
    }

    console.log(`Found ${openOrders.length} open orders to check.`);

    // Check each order
    for (const order of openOrders) {
      // Find the user
      const user = await User.findById(order.userId);

      if (!user) {
        continue;
      }

      // Check stop loss order
      if (order.stopLossOrder && order.stopLossOrder.status === 'OPEN') {
        const slOrderHistory = await KiteService.getOrderHistory(user._id.toString(), order.stopLossOrder.orderId);

        if (slOrderHistory && slOrderHistory.length > 0) {
          const latestSL = slOrderHistory[slOrderHistory.length - 1];

          if (latestSL.status === 'COMPLETE') {
            await handleOrderCompletion(order, 'SL_HIT', latestSL);
            continue; // Skip checking target if SL hit
          } else if (latestSL.status === 'REJECTED' || latestSL.status === 'CANCELLED') {
            order.stopLossOrder.status = latestSL.status;
            await order.save();
          }
        }
      }

      // Check target order
      if (order.targetOrder && order.targetOrder.status === 'OPEN') {
        const targetOrderHistory = await KiteService.getOrderHistory(user._id.toString(), order.targetOrder.orderId);

        if (targetOrderHistory && targetOrderHistory.length > 0) {
          const latestTarget = targetOrderHistory[targetOrderHistory.length - 1];

          if (latestTarget.status === 'COMPLETE') {
            await handleOrderCompletion(order, 'TARGET_HIT', latestTarget);
          } else if (latestTarget.status === 'REJECTED' || latestTarget.status === 'CANCELLED') {
            order.targetOrder.status = latestTarget.status;
            await order.save();
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking completed orders:', error);
  }
};

/**
 * Handle completion of a trade (either SL hit or target hit)
 */
const handleOrderCompletion = async (order: any, exitReason: 'SL_HIT' | 'TARGET_HIT' | 'MANUAL_EXIT' | 'MARKET_CLOSE', orderDetails: any): Promise<void> => {
  try {
    // Find the signal
    const signal = await Signal.findById(order.signalId);

    if (!signal) {
      return;
    }

    // Update the order
    if (exitReason === 'SL_HIT') {
      order.stopLossOrder.status = 'COMPLETE';

      // Cancel the target order
      if (order.targetOrder && order.targetOrder.status === 'OPEN') {
        const user = await User.findById(order.userId);

        if (user) {
          await KiteService.cancelOrder(user._id.toString(), order.targetOrder.orderId);
          order.targetOrder.status = 'CANCELLED';
        }
      }
    } else if (exitReason === 'TARGET_HIT') {
      order.targetOrder.status = 'COMPLETE';

      // Cancel the SL order
      if (order.stopLossOrder && order.stopLossOrder.status === 'OPEN') {
        const user = await User.findById(order.userId);

        if (user) {
          await KiteService.cancelOrder(user._id.toString(), order.stopLossOrder.orderId);
          order.stopLossOrder.status = 'CANCELLED';
        }
      }
    }

    await order.save();

    // Calculate P&L
    const entryPrice = order.averagePrice || signal.entryPrice;
    const exitPrice = orderDetails.average_price || (exitReason === 'SL_HIT' ? signal.stopLoss : signal.targetPrice);
    const quantity = order.filledQuantity;

    // For BUY orders, P&L = (exit_price - entry_price) * quantity
    // For SELL orders, P&L = (entry_price - exit_price) * quantity
    const profitLoss = signal.type === 'BUY'
      ? (exitPrice - entryPrice) * quantity
      : (entryPrice - exitPrice) * quantity;

    // Update the signal
    signal.profitLoss = profitLoss;
    signal.exitPrice = exitPrice;
    signal.exitAt = new Date(orderDetails.exchange_timestamp || Date.now());
    signal.exitReason = exitReason;
    await signal.save();

    // Update analytics
    await updateAnalyticsOnCompletion(signal, profitLoss, exitReason);

    // Send notification
    await TelegramService.sendPnLUpdate(signal, exitReason);

    console.log(`Trade completed for ${signal.option}. P&L: ${profitLoss}. Reason: ${exitReason}`);
  } catch (error) {
    console.error('Error handling order completion:', error);
  }
};

/**
 * Update analytics when a trade is completed
 */
const updateAnalyticsOnCompletion = async (signal: any, profitLoss: number, exitReason: string): Promise<void> => {
  try {
    const today = new Date();
    const startOfDay = getStartOfDay(today);

    // Find today's analytics
    const dailyAnalytics = await DailyAnalytics.findOne({ date: startOfDay });

    if (!dailyAnalytics) {
      return;
    }

    // Update analytics
    if (profitLoss > 0) {
      dailyAnalytics.successfulTrades += 1;

      if (profitLoss > dailyAnalytics.largestWin) {
        dailyAnalytics.largestWin = profitLoss;
      }

      const totalWins = dailyAnalytics.averageWin * (dailyAnalytics.successfulTrades - 1) + profitLoss;
      dailyAnalytics.averageWin = totalWins / dailyAnalytics.successfulTrades;
    } else {
      dailyAnalytics.failedTrades += 1;

      if (profitLoss < dailyAnalytics.largestLoss) {
        dailyAnalytics.largestLoss = profitLoss;
      }

      const totalLosses = dailyAnalytics.averageLoss * (dailyAnalytics.failedTrades - 1) + profitLoss;
      dailyAnalytics.averageLoss = totalLosses / dailyAnalytics.failedTrades;
    }

    // Update total P&L
    dailyAnalytics.profitLoss += profitLoss;

    // Calculate win rate
    const totalTrades = dailyAnalytics.successfulTrades + dailyAnalytics.failedTrades;
    dailyAnalytics.winRate = (dailyAnalytics.successfulTrades / totalTrades) * 100;

    // Update trade details
    const tradeDetail = {
      signalId: signal._id,
      stock: signal.stock,
      type: signal.type,
      entryPrice: signal.entryPrice,
      exitPrice: signal.exitPrice,
      profitLoss,
      profitLossPercentage: (profitLoss / (signal.entryPrice * signal.orderDetails.quantity)) * 100,
      duration: signal.exitAt && signal.executedAt
        ? Math.floor((signal.exitAt.getTime() - signal.executedAt.getTime()) / (1000 * 60))
        : 0,
    };

    dailyAnalytics.tradeDetails.push(tradeDetail);

    await dailyAnalytics.save();
  } catch (error) {
    console.error('Error updating analytics on completion:', error);
  }
};
