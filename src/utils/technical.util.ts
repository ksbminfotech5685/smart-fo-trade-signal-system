import { RSI, EMA, MACD, BollingerBands } from 'technicalindicators';
import type { ICandleStick } from '../models/marketData.model';

// Note: The 'technicalindicators' library doesn't have SuperTrend
// So we implement a custom version

/**
 * Calculate RSI (Relative Strength Index)
 * @param candles Array of candles with close prices
 * @param period Period for RSI calculation
 * @returns RSI value or null if not enough data
 */
export const calculateRSI = (candles: ICandleStick[], period = 14): number | null => {
  if (candles.length < period + 1) {
    return null;
  }

  const values = candles.map(candle => candle.close);

  const rsi = RSI.calculate({
    values,
    period,
  });

  return rsi.length > 0 ? rsi[rsi.length - 1] : null;
};

/**
 * Calculate EMA (Exponential Moving Average)
 * @param candles Array of candles with close prices
 * @param period Period for EMA calculation
 * @returns EMA value or null if not enough data
 */
export const calculateEMA = (candles: ICandleStick[], period: number): number | null => {
  if (candles.length < period) {
    return null;
  }

  const values = candles.map(candle => candle.close);

  const ema = EMA.calculate({
    values,
    period,
  });

  return ema.length > 0 ? ema[ema.length - 1] : null;
};

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * @param candles Array of candles with close prices
 * @param fastPeriod Fast period for MACD calculation
 * @param slowPeriod Slow period for MACD calculation
 * @param signalPeriod Signal period for MACD calculation
 * @returns MACD object or null if not enough data
 */
export const calculateMACD = (
  candles: ICandleStick[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): { line: number; signal: number; histogram: number } | null => {
  if (candles.length < slowPeriod + signalPeriod) {
    return null;
  }

  const values = candles.map(candle => candle.close);

  const macd = MACD.calculate({
    values,
    fastPeriod,
    slowPeriod,
    signalPeriod,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });

  if (macd.length === 0) {
    return null;
  }

  const lastMACD = macd[macd.length - 1];

  return {
    line: lastMACD.MACD,
    signal: lastMACD.signal,
    histogram: lastMACD.histogram,
  };
};

/**
 * Calculate Bollinger Bands
 * @param candles Array of candles with close prices
 * @param period Period for Bollinger Bands calculation
 * @param stdDev Standard deviation for Bollinger Bands calculation
 * @returns Bollinger Bands object or null if not enough data
 */
export const calculateBollingerBands = (
  candles: ICandleStick[],
  period = 20,
  stdDev = 2
): { upper: number; middle: number; lower: number } | null => {
  if (candles.length < period) {
    return null;
  }

  const values = candles.map(candle => candle.close);

  const bb = BollingerBands.calculate({
    values,
    period,
    stdDev,
  });

  if (bb.length === 0) {
    return null;
  }

  const lastBB = bb[bb.length - 1];

  return {
    upper: lastBB.upper,
    middle: lastBB.middle,
    lower: lastBB.lower,
  };
};

/**
 * Calculate SuperTrend (custom implementation)
 * @param candles Array of candles with high, low, close prices
 * @param period Period for SuperTrend calculation
 * @param multiplier Multiplier for SuperTrend calculation
 * @returns SuperTrend value and trend direction or null if not enough data
 */
export const calculateSuperTrend = (
  candles: ICandleStick[],
  period = 10,
  multiplier = 3
): { value: number; trend: 'up' | 'down' } | null => {
  if (candles.length < period + 1) {
    return null;
  }

  // Calculate ATR
  const atr = calculateATR(candles, period);
  if (!atr) {
    return null;
  }

  // Get the last candle
  const lastCandle = candles[candles.length - 1];

  // Calculate basic bands
  const basicUpperBand = (lastCandle.high + lastCandle.low) / 2 + (multiplier * atr);
  const basicLowerBand = (lastCandle.high + lastCandle.low) / 2 - (multiplier * atr);

  // Determine trend based on close price compared to the previous SuperTrend value
  let prevSuperTrend = 0;
  let prevTrend: 'up' | 'down' = 'up';

  // If we have more than the minimum required candles, we can check previous SuperTrend
  if (candles.length > period + 1) {
    const prevCandles = candles.slice(0, -1);
    const prevResult = calculateSuperTrend(prevCandles, period, multiplier);

    if (prevResult) {
      prevSuperTrend = prevResult.value;
      prevTrend = prevResult.trend;
    }
  }

  // Determine current trend
  let currentTrend: 'up' | 'down';
  let superTrendValue: number;

  if (prevTrend === 'up') {
    // If previous trend was up
    if (lastCandle.close < prevSuperTrend) {
      // Trend has reversed down
      currentTrend = 'down';
      superTrendValue = basicUpperBand;
    } else {
      // Trend continues up
      currentTrend = 'up';
      superTrendValue = basicLowerBand;
    }
  } else {
    // If previous trend was down
    if (lastCandle.close > prevSuperTrend) {
      // Trend has reversed up
      currentTrend = 'up';
      superTrendValue = basicLowerBand;
    } else {
      // Trend continues down
      currentTrend = 'down';
      superTrendValue = basicUpperBand;
    }
  }

  // If this is the first calculation (no previous trend)
  if (prevSuperTrend === 0) {
    currentTrend = lastCandle.close > basicLowerBand ? 'up' : 'down';
    superTrendValue = currentTrend === 'up' ? basicLowerBand : basicUpperBand;
  }

  return {
    value: superTrendValue,
    trend: currentTrend,
  };
};

/**
 * Calculate VWAP (Volume Weighted Average Price)
 * @param candles Array of candles with high, low, close, volume
 * @returns VWAP value or null if not enough data
 */
export const calculateVWAP = (candles: ICandleStick[]): number | null => {
  if (candles.length === 0) {
    return null;
  }

  let cumulativeTPV = 0; // Total Price * Volume
  let cumulativeVolume = 0;

  for (const candle of candles) {
    const typicalPrice = (candle.high + candle.low + candle.close) / 3;
    const priceVolume = typicalPrice * candle.volume;

    cumulativeTPV += priceVolume;
    cumulativeVolume += candle.volume;
  }

  if (cumulativeVolume === 0) {
    return null;
  }

  return cumulativeTPV / cumulativeVolume;
};

/**
 * Calculate if a volume spike has occurred
 * @param candles Array of candles with volume
 * @param lookbackPeriod Number of candles to look back for average volume
 * @param threshold Multiplier threshold to consider a spike
 * @returns Boolean indicating if a volume spike occurred
 */
export const hasVolumeSpike = (
  candles: ICandleStick[],
  lookbackPeriod = 20,
  threshold = 2
): boolean => {
  if (candles.length < lookbackPeriod + 1) {
    return false;
  }

  const recentCandles = candles.slice(-lookbackPeriod - 1, -1);
  const currentCandle = candles[candles.length - 1];

  // Calculate average volume
  const avgVolume = recentCandles.reduce((sum, candle) => sum + candle.volume, 0) / recentCandles.length;

  // Check if current volume is significantly higher than average
  return currentCandle.volume > avgVolume * threshold;
};

/**
 * Calculate Average True Range (ATR)
 * @param candles Array of candles with high, low, close
 * @param period Period for ATR calculation
 * @returns ATR value or null if not enough data
 */
export const calculateATR = (candles: ICandleStick[], period = 14): number | null => {
  if (candles.length < period + 1) {
    return null;
  }

  // Calculate True Range for each candle
  const trueRanges: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;

    const tr1 = high - low;
    const tr2 = Math.abs(high - prevClose);
    const tr3 = Math.abs(low - prevClose);

    const trueRange = Math.max(tr1, tr2, tr3);
    trueRanges.push(trueRange);
  }

  // Calculate ATR as the average of true ranges over the period
  const atr = trueRanges.slice(-period).reduce((sum, tr) => sum + tr, 0) / period;

  return atr;
};

/**
 * Check if a stock has formed a price breakout
 * @param candles Array of candles with high, low, close
 * @param period Period to look back for resistance
 * @returns Boolean indicating if a breakout occurred
 */
export const hasPriceBreakout = (candles: ICandleStick[], period = 20): boolean => {
  if (candles.length < period + 1) {
    return false;
  }

  const recentCandles = candles.slice(-period - 1, -1);
  const currentCandle = candles[candles.length - 1];

  // Find the highest high in the recent period
  const highestHigh = Math.max(...recentCandles.map(candle => candle.high));

  // Check if current candle's close is above the previous highest high
  return currentCandle.close > highestHigh;
};
