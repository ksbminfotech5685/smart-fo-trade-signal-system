import type { Request, Response } from 'express';
import User from '../models/user.model';
import Signal from '../models/signal.model';
import Order from '../models/order.model';
import { DailyAnalytics, PeriodAnalytics } from '../models/analytics.model';
import * as KiteService from '../services/kite.service';
import * as TelegramService from '../services/telegram.service';
import * as SchedulerService from '../services/scheduler.service';
import { getStartOfDay, getEndOfDay, getStartOfWeek, getEndOfWeek, getStartOfMonth, getEndOfMonth } from '../utils/date.util';

/**
 * Get system status
 * @route GET /api/admin/status
 * @access Private (Admin only)
 */
export const getSystemStatus = async (req: Request, res: Response) => {
  try {
    // Get Kite status
    const kiteStatus = KiteService.getKiteStatus();

    // Get Telegram status
    const telegramStatus = TelegramService.getTelegramStatus();

    // Get user counts
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const activeAutoTrading = await User.countDocuments({ isAutoTradingEnabled: true });

    // Get signal counts for today
    const today = new Date();
    const startOfDay = getStartOfDay(today);
    const endOfDay = getEndOfDay(today);

    const signalsToday = await Signal.countDocuments({
      generatedAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const executedOrdersToday = await Signal.countDocuments({
      generatedAt: { $gte: startOfDay, $lte: endOfDay },
      executedOrder: true,
    });

    // Get system uptime
    const uptime = process.uptime();
    const uptimeFormatted = formatUptime(uptime);

    res.json({
      status: 'ok',
      uptime: uptimeFormatted,
      kite: kiteStatus,
      telegram: telegramStatus,
      users: {
        total: totalUsers,
        admin: adminUsers,
        autoTrading: activeAutoTrading,
      },
      today: {
        signals: signalsToday,
        executedOrders: executedOrdersToday,
        date: today.toISOString(),
      },
      environment: process.env.NODE_ENV,
      memory: process.memoryUsage(),
    });
  } catch (error) {
    console.error('Get system status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all users (admin only)
 * @route GET /api/admin/users
 * @access Private (Admin only)
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');

    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get user by ID (admin only)
 * @route GET /api/admin/users/:id
 * @access Private (Admin only)
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user (admin only)
 * @route PUT /api/admin/users/:id
 * @access Private (Admin only)
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, email, role, isAutoTradingEnabled, maxTradesPerDay, maxCapitalPerTrade } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isAutoTradingEnabled !== undefined) user.isAutoTradingEnabled = isAutoTradingEnabled;
    if (maxTradesPerDay) user.maxTradesPerDay = maxTradesPerDay;
    if (maxCapitalPerTrade) user.maxCapitalPerTrade = maxCapitalPerTrade;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isAutoTradingEnabled: user.isAutoTradingEnabled,
        maxTradesPerDay: user.maxTradesPerDay,
        maxCapitalPerTrade: user.maxCapitalPerTrade,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete user (admin only)
 * @route DELETE /api/admin/users/:id
 * @access Private (Admin only)
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent deleting the last admin
    const isAdmin = await User.findOne({ _id: id, role: 'admin' });

    if (isAdmin) {
      const adminCount = await User.countDocuments({ role: 'admin' });

      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' });
      }
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get analytics
 * @route GET /api/admin/analytics
 * @access Private (Admin only)
 */
export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const period = req.query.period as string || 'day';
    const date = req.query.date ? new Date(req.query.date as string) : new Date();

    let startDate: Date;
    let endDate: Date;

    // Set date range based on period
    if (period === 'day') {
      startDate = getStartOfDay(date);
      endDate = getEndOfDay(date);
    } else if (period === 'week') {
      startDate = getStartOfWeek(date);
      endDate = getEndOfWeek(date);
    } else if (period === 'month') {
      startDate = getStartOfMonth(date);
      endDate = getEndOfMonth(date);
    } else {
      return res.status(400).json({ message: 'Invalid period. Must be day, week, or month' });
    }

    // Get analytics data
    let analyticsData;

    if (period === 'day') {
      analyticsData = await DailyAnalytics.findOne({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      });
    } else if (period === 'week' || period === 'month') {
      analyticsData = await PeriodAnalytics.findOne({
        periodType: period.toUpperCase(),
        startDate: {
          $lte: endDate,
        },
        endDate: {
          $gte: startDate,
        },
      });
    }

    // If no analytics data found, get raw data from signals
    if (!analyticsData) {
      const signals = await Signal.find({
        generatedAt: {
          $gte: startDate,
          $lte: endDate,
        },
      });

      const executedSignals = signals.filter(signal => signal.executedOrder);
      const successfulSignals = executedSignals.filter(signal => signal.profitLoss && signal.profitLoss > 0);
      const failedSignals = executedSignals.filter(signal => signal.profitLoss && signal.profitLoss <= 0);

      const totalProfit = successfulSignals.reduce((sum, signal) => sum + (signal.profitLoss || 0), 0);
      const totalLoss = failedSignals.reduce((sum, signal) => sum + (signal.profitLoss || 0), 0);

      analyticsData = {
        period: period === 'day' ? date.toISOString().split('T')[0] : `${period}-${date.getFullYear()}-${date.getMonth() + 1}`,
        totalSignals: signals.length,
        executedOrders: executedSignals.length,
        successfulTrades: successfulSignals.length,
        failedTrades: failedSignals.length,
        profitLoss: totalProfit + totalLoss,
        profitLossPercentage: executedSignals.length > 0 ? ((successfulSignals.length / executedSignals.length) * 100) : 0,
        winRate: executedSignals.length > 0 ? (successfulSignals.length / executedSignals.length) * 100 : 0,
        tradeDetails: executedSignals.map(signal => ({
          signalId: signal._id,
          stock: signal.stock,
          type: signal.type,
          entryPrice: signal.entryPrice,
          exitPrice: signal.exitPrice || 0,
          profitLoss: signal.profitLoss || 0,
          profitLossPercentage: signal.profitLoss && signal.entryPrice ? (signal.profitLoss / signal.entryPrice) * 100 : 0,
          duration: signal.exitAt && signal.executedAt
            ? Math.floor((signal.exitAt.getTime() - signal.executedAt.getTime()) / (1000 * 60))
            : 0,
        })),
      };
    }

    res.json({ analytics: analyticsData });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Send a manual notification via Telegram
 * @route POST /api/admin/send-notification
 * @access Private (Admin only)
 */
export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { message, type = 'info' } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Send notification via Telegram
    const sent = await TelegramService.sendSystemAlert(
      type as 'info' | 'warning' | 'error',
      message
    );

    if (!sent) {
      return res.status(500).json({ message: 'Failed to send notification' });
    }

    res.json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Start or stop schedulers
 * @route POST /api/admin/scheduler
 * @access Private (Admin only)
 */
export const controlScheduler = async (req: Request, res: Response) => {
  try {
    const { action } = req.body;

    if (action === 'start') {
      SchedulerService.initializeSchedulers();
      res.json({ message: 'Schedulers started successfully' });
    } else if (action === 'stop') {
      SchedulerService.stopAllSchedulers();
      res.json({ message: 'Schedulers stopped successfully' });
    } else {
      res.status(400).json({ message: 'Invalid action. Must be start or stop' });
    }
  } catch (error) {
    console.error('Control scheduler error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get order history with filtering and pagination
 * @route GET /api/admin/orders
 * @access Private (Admin only)
 */
export const getOrderHistory = async (req: Request, res: Response) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1;
    const limit = Number.parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get filters from query
    const userId = req.query.userId as string;
    const status = req.query.status as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    // Build filter object
    const filter: any = {};

    if (userId) {
      filter.userId = userId;
    }

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.orderTimestamp = {};

      if (startDate) {
        filter.orderTimestamp.$gte = new Date(startDate);
      }

      if (endDate) {
        filter.orderTimestamp.$lte = new Date(endDate);
      }
    }

    // Count total documents
    const total = await Order.countDocuments(filter);

    // Get orders
    const orders = await Order.find(filter)
      .sort({ orderTimestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username email')
      .populate('signalId', 'stock option type');

    res.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get order history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Format uptime in a human-readable format
 */
const formatUptime = (uptime: number): string => {
  const days = Math.floor(uptime / (24 * 60 * 60));
  const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((uptime % (60 * 60)) / 60);
  const seconds = Math.floor(uptime % 60);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};
