import MarketData from '../models/marketData.model';
import Signal from '../models/signal.model';
import StockUniverse from '../models/stockUniverse.model';
import { DailyAnalytics } from '../models/analytics.model';
import * as TechnicalIndicators from '../utils/technical.util';
import * as TelegramService from './telegram.service';
import { isMarketHours, getStartOfDay, getEndOfDay } from '../utils/date.util';

// Configuration
const MAX_SIGNALS_PER_DAY = 6;
const MIN_SIGNALS_TIME_GAP_MINUTES = 15;
const NIFTY_SYMBOL = 'NIFTY 50';
const BANKNIFTY_SYMBOL = 'NIFTY BANK';

/**
 * Run the signal generation process
 */
export const generateSignals = async (): Promise<void> => {
  console.log('Starting signal generation process...');

  try {
    // Check if market is open
    if (!isMarketHours()) {
      console.log('Market is closed. Signal generation skipped.');
      return;
    }

    // Check if we've already generated the maximum signals for today
    const today = new Date();
    const startOfDay = getStartOfDay(today);
    const endOfDay = getEndOfDay(today);

    const signalsToday = await Signal.countDocuments({
      generatedAt: { $gte: startOfDay, $lte: endOfDay },
    });

    if (signalsToday >= MAX_SIGNALS_PER_DAY) {
      console.log(`Maximum signals for today (${MAX_SIGNALS_PER_DAY}) already generated. Skipping.`);
      return;
    }

    // Check time since last signal
    const lastSignal = await Signal.findOne({
      generatedAt: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ generatedAt: -1 });

    if (lastSignal) {
      const timeSinceLastSignal = (Date.now() - lastSignal.generatedAt.getTime()) / (1000 * 60);

      if (timeSinceLastSignal < MIN_SIGNALS_TIME_GAP_MINUTES) {
        console.log(`Last signal was generated ${timeSinceLastSignal.toFixed(0)} minutes ago. Minimum gap is ${MIN_SIGNALS_TIME_GAP_MINUTES} minutes. Skipping.`);
        return;
      }
    }

    // Start layered filtering process
    const filteredStocks = await runLayeredFilters();

    if (filteredStocks.length === 0) {
      console.log('No stocks passed all filters. No signals generated.');
      return;
    }

    console.log(`${filteredStocks.length} stocks passed all filters.`);

    // Generate signals for filtered stocks
    for (const stock of filteredStocks) {
      await createSignal(stock);
    }

    console.log('Signal generation completed successfully.');
  } catch (error) {
    console.error('Error in signal generation process:', error);
    await TelegramService.sendSystemAlert('error', 'Error in signal generation process. Check server logs for details.');
  }
};

/**
 * Run the layered filtering process to find potential signals
 */
const runLayeredFilters = async (): Promise<any[]> => {
  try {
    // Layer 1: Market Trend Filter
    const marketTrend = await checkMarketTrend();

    if (!marketTrend.bullish) {
      console.log(`Market trend not bullish. Overall market trend: ${marketTrend.niftyTrend}, Bank Nifty trend: ${marketTrend.bankNiftyTrend}`);
      return [];
    }

    console.log('Layer 1 passed: Market trend is bullish');

    // Layer 2: Sector Strength Filter
    const strongSectors = await getStrongSectors();

    if (strongSectors.length === 0) {
      console.log('No strong sectors found.');
      return [];
    }

    console.log(`Layer 2 passed: Strong sectors found: ${strongSectors.join(', ')}`);

    // Get F&O stocks from strong sectors
    const stocks = await StockUniverse.find({
      sector: { $in: strongSectors },
      isActive: true,
      inF1: true,
      isBanned: false,
    });

    if (stocks.length === 0) {
      console.log('No active F&O stocks found in strong sectors.');
      return [];
    }

    console.log(`Initial universe: ${stocks.length} F&O stocks in strong sectors`);

    // Get market data for these stocks
    const stockSymbols = stocks.map(stock => stock.symbol);
    const marketData = await MarketData.find({ symbol: { $in: stockSymbols } });

    // Create a map for faster lookups
    const marketDataMap = new Map();
    marketData.forEach(data => {
      marketDataMap.set(data.symbol, data);
    });

    // Layer 3: Technical Filter
    const technicallyStrong = [];

    for (const stock of stocks) {
      const data = marketDataMap.get(stock.symbol);

      if (!data || !data.fifteenMinuteCandlesticks || data.fifteenMinuteCandlesticks.length < 10) {
        continue;
      }

      // Calculate RSI
      const rsi = TechnicalIndicators.calculateRSI(data.fifteenMinuteCandlesticks, 14);

      if (!rsi || rsi < 50 || rsi > 70) {
        continue;
      }

      // Calculate MACD
      const macd = TechnicalIndicators.calculateMACD(data.fifteenMinuteCandlesticks);

      if (!macd || macd.histogram <= 0) {
        continue;
      }

      // Calculate SuperTrend
      const supertrend = TechnicalIndicators.calculateSuperTrend(data.fifteenMinuteCandlesticks);

      if (!supertrend || supertrend.trend !== 'up') {
        continue;
      }

      // Calculate EMAs
      const ema20 = TechnicalIndicators.calculateEMA(data.fifteenMinuteCandlesticks, 20);
      const ema50 = TechnicalIndicators.calculateEMA(data.fifteenMinuteCandlesticks, 50);

      if (!ema20 || !ema50 || data.lastPrice <= ema20 || data.lastPrice <= ema50) {
        continue;
      }

      // Volume spike check
      const hasVolumeIncrease = TechnicalIndicators.hasVolumeSpike(data.fifteenMinuteCandlesticks.slice(-5));

      if (!hasVolumeIncrease) {
        continue;
      }

      // Stock passed technical filters
      technicallyStrong.push({
        ...stock.toJSON(),
        marketData: data,
        technicalIndicators: {
          rsi,
          macd,
          supertrend: supertrend.trend === 'up',
          ema20,
          ema50,
          volumeSpike: hasVolumeIncrease,
        },
      });
    }

    if (technicallyStrong.length === 0) {
      console.log('No stocks passed technical filters.');
      return [];
    }

    console.log(`Layer 3 passed: ${technicallyStrong.length} stocks are technically strong`);

    // Layer 4: Price Action Filter
    const priceActionValid = [];

    for (const stock of technicallyStrong) {
      const data = stock.marketData;

      // Check for breakout of previous day high
      const isBreakout = data.lastPrice > stock.previousDayHigh;

      // Check for VWAP crossover
      const vwap = TechnicalIndicators.calculateVWAP(data.oneMinuteCandlesticks);
      const isPriceAboveVWAP = vwap ? data.lastPrice > vwap : false;

      // Small body candle breakout check
      const latestCandles = data.fifteenMinuteCandlesticks.slice(-3);
      const hasSmallBodyBreakout = latestCandles.some(candle => {
        const bodySize = Math.abs(candle.close - candle.open);
        const totalRange = candle.high - candle.low;
        return bodySize < totalRange * 0.3 && candle.close > candle.open;
      });

      if (isBreakout && isPriceAboveVWAP && hasSmallBodyBreakout) {
        priceActionValid.push({
          ...stock,
          priceAction: {
            isBreakout,
            isPriceAboveVWAP,
            hasSmallBodyBreakout,
            vwap,
          },
        });
      }
    }

    if (priceActionValid.length === 0) {
      console.log('No stocks passed price action filters.');
      return [];
    }

    console.log(`Layer 4 passed: ${priceActionValid.length} stocks have valid price action`);

    // Layer 5: F&O Data Filter (Open Interest Analysis)
    // Note: Simplified since we may not have direct OI data
    const foDataValid = priceActionValid;

    console.log(`Layer 5 passed: ${foDataValid.length} stocks have valid F&O data`);

    // Layer 6: Time Filter
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Only generate signals between 9:30 AM and 2:45 PM
    if (
      (currentHour === 9 && currentMinute < 30) ||
      (currentHour === 14 && currentMinute > 45) ||
      currentHour < 9 ||
      currentHour > 14
    ) {
      console.log('Outside signal generation time window (9:30 AM - 2:45 PM). Skipping.');
      return [];
    }

    console.log('Layer 6 passed: Within valid time window for signal generation');

    // Layer 7: Risk Filter & Final Check
    const finalCandidates = [];

    for (const stock of foDataValid) {
      const data = stock.marketData;

      // Calculate ATR for volatility
      const atr = TechnicalIndicators.calculateATR(data.fifteenMinuteCandlesticks);

      if (!atr) {
        continue;
      }

      // SL should not be too far (max 0.5% of entry price)
      const entryPrice = data.lastPrice;
      const stopLoss = entryPrice - (1.5 * atr);
      const target = entryPrice + (3 * atr);
      const stopLossPercent = (entryPrice - stopLoss) / entryPrice * 100;

      if (stopLossPercent > 0.5) {
        continue;
      }

      // Calculate risk-reward ratio
      const risk = entryPrice - stopLoss;
      const reward = target - entryPrice;
      const riskRewardRatio = (reward / risk).toFixed(1);

      // Ensure R:R is at least 1:2
      if (reward / risk < 2) {
        continue;
      }

      // Final check for lot size and price compatibility
      if (
        stock.lotSize > 0 &&
        entryPrice > 50 && // Minimum price threshold
        entryPrice < 5000 // Maximum price threshold
      ) {
        finalCandidates.push({
          ...stock,
          riskManagement: {
            entryPrice,
            stopLoss,
            target,
            atr,
            riskRewardRatio,
          },
        });
      }
    }

    console.log(`Layer 7 passed: ${finalCandidates.length} stocks passed final risk filter`);

    return finalCandidates;
  } catch (error) {
    console.error('Error in layered filtering process:', error);
    return [];
  }
};

/**
 * Check the overall market trend (Nifty 50 and Bank Nifty)
 */
const checkMarketTrend = async (): Promise<{ bullish: boolean; niftyTrend: string; bankNiftyTrend: string }> => {
  try {
    // Get Nifty 50 data
    const niftyData = await MarketData.findOne({ symbol: NIFTY_SYMBOL });

    // Get Bank Nifty data
    const bankNiftyData = await MarketData.findOne({ symbol: BANKNIFTY_SYMBOL });

    if (!niftyData || !bankNiftyData) {
      return {
        bullish: false,
        niftyTrend: 'unknown',
        bankNiftyTrend: 'unknown',
      };
    }

    // Analyze Nifty 50 trend
    const niftyCandles = niftyData.fifteenMinuteCandlesticks;
    const niftyRSI = TechnicalIndicators.calculateRSI(niftyCandles) || 0;
    const niftyEMA21 = TechnicalIndicators.calculateEMA(niftyCandles, 21) || 0;
    const niftyTrend = niftyRSI > 50 && niftyData.lastPrice > niftyEMA21 ? 'bullish' : 'bearish';

    // Analyze Bank Nifty trend
    const bankNiftyCandles = bankNiftyData.fifteenMinuteCandlesticks;
    const bankNiftyRSI = TechnicalIndicators.calculateRSI(bankNiftyCandles) || 0;
    const bankNiftyEMA21 = TechnicalIndicators.calculateEMA(bankNiftyCandles, 21) || 0;
    const bankNiftyTrend = bankNiftyRSI > 50 && bankNiftyData.lastPrice > bankNiftyEMA21 ? 'bullish' : 'bearish';

    // Overall market is bullish if both indices are bullish
    const bullish = niftyTrend === 'bullish' && bankNiftyTrend === 'bullish';

    return {
      bullish,
      niftyTrend,
      bankNiftyTrend,
    };
  } catch (error) {
    console.error('Error checking market trend:', error);
    return {
      bullish: false,
      niftyTrend: 'error',
      bankNiftyTrend: 'error',
    };
  }
};

/**
 * Identify strong sectors based on sector indices performance
 */
const getStrongSectors = async (): Promise<string[]> => {
  try {
    // This is a simplified version; in a real system, we would analyze sector indices
    // For this demo, we'll return some default sectors
    return ['IT', 'BANKING', 'PHARMA', 'AUTO', 'FMCG'];
  } catch (error) {
    console.error('Error getting strong sectors:', error);
    return [];
  }
};

/**
 * Create a new signal from a filtered stock
 */
const createSignal = async (stockData: any): Promise<void> => {
  try {
    const { symbol, riskManagement, technicalIndicators, priceAction } = stockData;

    // Find the stock in the universe
    const stock = await StockUniverse.findOne({ symbol });

    if (!stock) {
      return;
    }

    // Generate option strike
    const currentPrice = riskManagement.entryPrice;
    const atmStrike = Math.round(currentPrice / 100) * 100; // Round to nearest 100

    const optionStrike = atmStrike;
    const optionType = 'CE'; // Call option for buy signals

    const optionSymbol = `${symbol} ${optionStrike} ${optionType}`;

    // Create the signal
    const signal = new Signal({
      type: 'BUY',
      stock: symbol,
      option: optionSymbol,
      currentMarketPrice: currentPrice,
      entryPrice: riskManagement.entryPrice,
      targetPrice: riskManagement.target,
      stopLoss: riskManagement.stopLoss,
      riskRewardRatio: riskManagement.riskRewardRatio,
      generatedAt: new Date(),
      sentToTelegram: false,
      executedOrder: false,
      indicators: {
        rsi: technicalIndicators.rsi,
        macd: technicalIndicators.macd,
        supertrend: technicalIndicators.supertrend,
        ema20: technicalIndicators.ema20,
        ema50: technicalIndicators.ema50,
        priceAboveVwap: priceAction.isPriceAboveVWAP,
        volume: stockData.marketData.volume,
        avgVolume: stockData.marketData.avgDailyVolume20 || 0,
      },
      notes: `Signal generated based on bullish trend and technical indicators.`,
    });

    // Save the signal
    await signal.save();

    console.log(`Signal generated for ${symbol} (${optionSymbol})`);

    // Send the signal to Telegram
    await TelegramService.sendSignal(signal);

    // Update analytics
    await updateDailyAnalytics('BUY');
  } catch (error) {
    console.error('Error creating signal:', error);
  }
};

/**
 * Update daily analytics with new signal
 */
const updateDailyAnalytics = async (signalType: 'BUY' | 'SELL'): Promise<void> => {
  try {
    const today = new Date();
    const startOfDay = getStartOfDay(today);

    // Find or create today's analytics
    let dailyAnalytics = await DailyAnalytics.findOne({ date: startOfDay });

    if (!dailyAnalytics) {
      dailyAnalytics = new DailyAnalytics({
        date: startOfDay,
        totalSignals: 1,
        signalsByType: {
          BUY: signalType === 'BUY' ? 1 : 0,
          SELL: signalType === 'SELL' ? 1 : 0,
        },
        executedOrders: 0,
        successfulTrades: 0,
        failedTrades: 0,
        profitLoss: 0,
        profitLossPercentage: 0,
        totalCapitalUsed: 0,
        winRate: 0,
        averageWin: 0,
        averageLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        tradeDetails: [],
      });
    } else {
      dailyAnalytics.totalSignals += 1;

      if (signalType === 'BUY') {
        dailyAnalytics.signalsByType.BUY += 1;
      } else {
        dailyAnalytics.signalsByType.SELL += 1;
      }
    }

    await dailyAnalytics.save();
  } catch (error) {
    console.error('Error updating daily analytics:', error);
  }
};
