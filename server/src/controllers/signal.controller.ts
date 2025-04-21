import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import Signal from '../models/signal.model';
import * as TelegramService from '../services/telegram.service';
import * as SignalGenerator from '../services/signalGenerator.service';
import { getStartOfDay, getEndOfDay } from '../utils/date.util';

/**
 * Get all signals with pagination
 * @route GET /api/signals
 * @access Private
 */
export const getAllSignals = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1;
    const limit = Number.parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get filters from query
    const type = req.query.type as string;
    const stock = req.query.stock as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const executedOnly = req.query.executedOnly === 'true';

    // Build filter object
    const filter: any = {};

    if (type) {
      filter.type = type;
    }

    if (stock) {
      filter.stock = { $regex: stock, $options: 'i' };
    }

    if (startDate || endDate) {
      filter.generatedAt = {};

      if (startDate) {
        filter.generatedAt.$gte = new Date(startDate);
      }

      if (endDate) {
        filter.generatedAt.$lte = new Date(endDate);
      }
    }

    if (executedOnly) {
      filter.executedOrder = true;
    }

    // Count total documents
    const total = await Signal.countDocuments(filter);

    // Get signals
    const signals = await Signal.find(filter)
      .sort({ generatedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      signals,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all signals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get signals for today
 * @route GET /api/signals/today
 * @access Private
 */
export const getTodaySignals = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const startOfDay = getStartOfDay(today);
    const endOfDay = getEndOfDay(today);

    // Get signals for today
    const signals = await Signal.find({
      generatedAt: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ generatedAt: -1 });

    res.json({ signals });
  } catch (error) {
    console.error('Get today signals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get signal by ID
 * @route GET /api/signals/:id
 * @access Private
 */
export const getSignalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid signal ID' });
    }

    // Get signal
    const signal = await Signal.findById(id);

    if (!signal) {
      return res.status(404).json({ message: 'Signal not found' });
    }

    res.json({ signal });
  } catch (error) {
    console.error('Get signal by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new signal (manual)
 * @route POST /api/signals
 * @access Private (Admin only)
 */
export const createSignal = async (req: Request, res: Response) => {
  try {
    const {
      type,
      stock,
      option,
      currentMarketPrice,
      entryPrice,
      targetPrice,
      stopLoss,
      riskRewardRatio,
      indicators,
      notes,
    } = req.body;

    // Validate signal type
    if (type !== 'BUY' && type !== 'SELL') {
      return res.status(400).json({ message: 'Signal type must be either BUY or SELL' });
    }

    // Create new signal
    const signal = new Signal({
      type,
      stock,
      option,
      currentMarketPrice,
      entryPrice,
      targetPrice,
      stopLoss,
      riskRewardRatio,
      generatedAt: new Date(),
      sentToTelegram: false,
      executedOrder: false,
      indicators,
      notes,
    });

    await signal.save();

    // Send signal to Telegram
    await TelegramService.sendSignal(signal);

    res.status(201).json({
      message: 'Signal created and sent successfully',
      signal,
    });
  } catch (error) {
    console.error('Create signal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update a signal
 * @route PUT /api/signals/:id
 * @access Private (Admin only)
 */
export const updateSignal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid signal ID' });
    }

    // Get signal
    const signal = await Signal.findById(id);

    if (!signal) {
      return res.status(404).json({ message: 'Signal not found' });
    }

    // Check if signal has been executed
    if (signal.executedOrder) {
      return res.status(400).json({ message: 'Cannot update a signal that has been executed' });
    }

    // Update signal
    const updatedSignal = await Signal.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    res.json({
      message: 'Signal updated successfully',
      signal: updatedSignal,
    });
  } catch (error) {
    console.error('Update signal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a signal
 * @route DELETE /api/signals/:id
 * @access Private (Admin only)
 */
export const deleteSignal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid signal ID' });
    }

    // Get signal
    const signal = await Signal.findById(id);

    if (!signal) {
      return res.status(404).json({ message: 'Signal not found' });
    }

    // Check if signal has been executed
    if (signal.executedOrder) {
      return res.status(400).json({ message: 'Cannot delete a signal that has been executed' });
    }

    // Delete signal
    await Signal.findByIdAndDelete(id);

    res.json({ message: 'Signal deleted successfully' });
  } catch (error) {
    console.error('Delete signal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get signals performance statistics
 * @route GET /api/signals/stats
 * @access Private
 */
export const getSignalStats = async (req: Request, res: Response) => {
  try {
    // Get total signals
    const totalSignals = await Signal.countDocuments();

    // Get signals by type
    const buySignals = await Signal.countDocuments({ type: 'BUY' });
    const sellSignals = await Signal.countDocuments({ type: 'SELL' });

    // Get executed signals
    const executedSignals = await Signal.countDocuments({ executedOrder: true });

    // Get successful signals
    const successfulSignals = await Signal.countDocuments({
      executedOrder: true,
      profitLoss: { $gt: 0 },
    });

    // Get failed signals
    const failedSignals = await Signal.countDocuments({
      executedOrder: true,
      profitLoss: { $lte: 0 },
    });

    // Calculate win rate
    const winRate = executedSignals > 0 ? (successfulSignals / executedSignals) * 100 : 0;

    // Get average profit
    const profitQuery = await Signal.aggregate([
      {
        $match: {
          executedOrder: true,
          profitLoss: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          totalProfit: { $sum: '$profitLoss' },
          count: { $sum: 1 },
          avgProfit: { $avg: '$profitLoss' },
        },
      },
    ]);

    // Get average loss
    const lossQuery = await Signal.aggregate([
      {
        $match: {
          executedOrder: true,
          profitLoss: { $lte: 0 },
        },
      },
      {
        $group: {
          _id: null,
          totalLoss: { $sum: '$profitLoss' },
          count: { $sum: 1 },
          avgLoss: { $avg: '$profitLoss' },
        },
      },
    ]);

    const avgProfit = profitQuery.length > 0 ? profitQuery[0].avgProfit : 0;
    const avgLoss = lossQuery.length > 0 ? lossQuery[0].avgLoss : 0;
    const totalProfit = profitQuery.length > 0 ? profitQuery[0].totalProfit : 0;
    const totalLoss = lossQuery.length > 0 ? lossQuery[0].totalLoss : 0;
    const netPnL = totalProfit + totalLoss;

    res.json({
      totalSignals,
      byType: {
        buy: buySignals,
        sell: sellSignals,
      },
      executedSignals,
      successfulSignals,
      failedSignals,
      winRate,
      avgProfit,
      avgLoss,
      totalProfit,
      totalLoss,
      netPnL,
    });
  } catch (error) {
    console.error('Get signal stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Generate signals manually (admin only)
 * @route POST /api/signals/generate
 * @access Private (Admin only)
 */
export const generateSignals = async (req: Request, res: Response) => {
  try {
    // Run signal generation
    const signalBefore = await Signal.countDocuments();
    await SignalGenerator.generateSignals();
    const signalAfter = await Signal.countDocuments();

    const newSignalsCount = signalAfter - signalBefore;

    res.json({
      message: `Signal generation completed successfully. ${newSignalsCount} new signals generated.`,
      newSignalsCount,
    });
  } catch (error) {
    console.error('Generate signals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
