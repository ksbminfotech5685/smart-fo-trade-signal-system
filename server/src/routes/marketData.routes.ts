import express from 'express';
import type { Request, Response } from 'express';
import { auth, admin } from '../middleware/auth.middleware';
import { marketHoursInfo } from '../middleware/error.middleware';
import MarketData from '../models/marketData.model';
import StockUniverse from '../models/stockUniverse.model';
import * as KiteService from '../services/kite.service';

const router = express.Router();

/**
 * Get market status
 * @route GET /api/market-data/status
 * @access Private
 */
router.get('/status', auth, marketHoursInfo, (req: Request, res: Response) => {
  res.json({
    marketOpen: !req.body.marketClosed,
    message: req.body.marketMessage,
    timestamp: new Date(),
  });
});

/**
 * Get all active F&O stocks
 * @route GET /api/market-data/stocks
 * @access Private
 */
router.get('/stocks', auth, async (req: Request, res: Response) => {
  try {
    const stocks = await StockUniverse.find({ isActive: true }).sort({ symbol: 1 });

    res.json({ stocks });
  } catch (error) {
    console.error('Get stocks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get market data for a specific stock
 * @route GET /api/market-data/stock/:symbol
 * @access Private
 */
router.get('/stock/:symbol', auth, async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;

    const marketData = await MarketData.findOne({ symbol });

    if (!marketData) {
      return res.status(404).json({ message: 'Market data not found for this stock' });
    }

    res.json({ marketData });
  } catch (error) {
    console.error('Get stock market data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get market data for index (Nifty, Bank Nifty)
 * @route GET /api/market-data/index/:symbol
 * @access Private
 */
router.get('/index/:symbol', auth, async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;

    const marketData = await MarketData.findOne({ symbol });

    if (!marketData) {
      return res.status(404).json({ message: 'Market data not found for this index' });
    }

    res.json({ marketData });
  } catch (error) {
    console.error('Get index market data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Get historical data for a stock
 * @route GET /api/market-data/historical/:symbol
 * @access Private
 */
router.get('/historical/:symbol', auth, async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const interval = req.query.interval as string || 'day';
    const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = req.query.to ? new Date(req.query.to as string) : new Date();

    // Fetch historical data
    const historicalData = await KiteService.fetchHistoricalData(symbol, interval, from, to);

    if (!historicalData) {
      return res.status(404).json({ message: 'Historical data not found' });
    }

    res.json({ historicalData });
  } catch (error) {
    console.error('Get historical data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Fetch stock instruments (admin only)
 * @route POST /api/market-data/fetch-instruments
 * @access Private (Admin only)
 */
router.post('/fetch-instruments', auth, admin, async (req: Request, res: Response) => {
  try {
    await KiteService.fetchInstruments();

    res.json({ message: 'Instruments fetched successfully' });
  } catch (error) {
    console.error('Fetch instruments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
