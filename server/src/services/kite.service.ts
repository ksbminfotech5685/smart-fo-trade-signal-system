import KiteConnect from 'kiteconnect';
import WebSocket from 'ws';
import User from '../models/user.model';
import MarketData from '../models/marketData.model';
import StockUniverse from '../models/stockUniverse.model';
import { decrypt, encrypt } from '../utils/encryption.util';
import { isMarketHours, getNextMarketDay, formatAPIDateTime } from '../utils/date.util';

let kiteInstance: any = null;
let tickerInstance: any = null;
let isConnected = false;
let instrumentTokens: number[] = [];
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Initialize the Kite API service
 */
export const initializeKiteService = async () => {
  console.log('Initializing Kite API service...');

  try {
    // Find admin user to get API credentials
    const adminUser = await User.findOne({ role: 'admin' });

    if (!adminUser || !adminUser.zerodhaApiKey || !adminUser.zerodhaAccessToken) {
      console.warn('Admin user or Zerodha API credentials not found. Kite service not initialized.');
      return;
    }

    // Initialize Kite Connect instance
    kiteInstance = new KiteConnect.KiteConnect({
      api_key: adminUser.zerodhaApiKey,
    });

    // Set access token
    const decryptedToken = decrypt(adminUser.zerodhaAccessToken);
    kiteInstance.setAccessToken(decryptedToken);

    console.log('Kite API service initialized successfully.');

    // Fetch instruments and stock universe
    await fetchInstruments();

    // Connect to WebSocket if market is open
    if (isMarketHours()) {
      await connectWebSocket();
    } else {
      console.log('Market is closed. WebSocket connection not established.');

      // Schedule connection for next market day
      const nextMarketDay = getNextMarketDay();
      const marketOpenTime = new Date(nextMarketDay);
      marketOpenTime.setHours(9, 15, 0, 0);

      const timeToNextMarketOpen = marketOpenTime.getTime() - Date.now();

      console.log(`Scheduling WebSocket connection for next market day: ${marketOpenTime.toLocaleString()}`);

      setTimeout(() => {
        connectWebSocket();
      }, timeToNextMarketOpen);
    }
  } catch (error) {
    console.error('Error initializing Kite service:', error);
  }
};

/**
 * Connect to Kite WebSocket for real-time data
 */
export const connectWebSocket = async () => {
  try {
    // Find admin user to get API credentials
    const adminUser = await User.findOne({ role: 'admin' });

    if (!adminUser || !adminUser.zerodhaApiKey || !adminUser.zerodhaAccessToken) {
      console.warn('Admin user or Zerodha API credentials not found. WebSocket connection not established.');
      return;
    }

    // Get instrument tokens for all F&O stocks
    const stocksUniverse = await StockUniverse.find({ isActive: true, inF1: true });
    instrumentTokens = stocksUniverse.map(stock => stock.instrumentToken);

    // Add Nifty 50 and Bank Nifty indices
    instrumentTokens.push(256265); // Nifty 50 instrument token
    instrumentTokens.push(260105); // Bank Nifty instrument token

    // Initialize WebSocket connection
    const decryptedToken = decrypt(adminUser.zerodhaAccessToken);
    tickerInstance = new KiteConnect.KiteTicker({
      api_key: adminUser.zerodhaApiKey,
      access_token: decryptedToken,
    });

    // Set up event handlers
    tickerInstance.on('ticks', processTicks);
    tickerInstance.on('connect', onConnect);
    tickerInstance.on('disconnect', onDisconnect);
    tickerInstance.on('error', onError);
    tickerInstance.on('reconnect', onReconnect);
    tickerInstance.on('noreconnect', onNoReconnect);
    tickerInstance.on('order_update', onOrderUpdate);

    // Connect to WebSocket
    tickerInstance.connect();

    console.log('Connecting to Kite WebSocket...');
  } catch (error) {
    console.error('Error connecting to WebSocket:', error);

    // Retry connection after a delay
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`Retrying WebSocket connection (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);

      setTimeout(() => {
        connectWebSocket();
      }, 5000 * reconnectAttempts); // Exponential backoff
    } else {
      console.error('Max reconnection attempts reached. WebSocket connection failed.');
      reconnectAttempts = 0;
    }
  }
};

/**
 * WebSocket connection established handler
 */
const onConnect = () => {
  isConnected = true;
  reconnectAttempts = 0;
  console.log('WebSocket connected!');

  // Subscribe to instrument tokens
  if (instrumentTokens.length > 0) {
    tickerInstance.subscribe(instrumentTokens);
    tickerInstance.setMode(tickerInstance.MODE_FULL, instrumentTokens);
    console.log(`Subscribed to ${instrumentTokens.length} instruments.`);
  }
};

/**
 * WebSocket disconnection handler
 */
const onDisconnect = (reason: string) => {
  isConnected = false;
  console.log(`WebSocket disconnected: ${reason}`);
};

/**
 * WebSocket error handler
 */
const onError = (error: any) => {
  console.error('WebSocket error:', error);
};

/**
 * WebSocket reconnection handler
 */
const onReconnect = (attemptCount: number) => {
  console.log(`WebSocket reconnecting: Attempt ${attemptCount}`);
};

/**
 * WebSocket no-reconnect handler
 */
const onNoReconnect = () => {
  console.error('WebSocket not reconnecting. Max attempts reached.');

  // Try to reconnect after some time (5 minutes)
  setTimeout(() => {
    if (!isConnected && isMarketHours()) {
      console.log('Attempting to re-establish WebSocket connection...');
      connectWebSocket();
    }
  }, 5 * 60 * 1000);
};

/**
 * Order update handler
 */
const onOrderUpdate = (order: any) => {
  console.log('Order update received:', order);
  // Process order update (to be implemented)
};

/**
 * Process ticks from WebSocket
 */
const processTicks = async (ticks: any[]) => {
  try {
    // Process each tick
    for (const tick of ticks) {
      // Update market data in database
      await updateMarketData(tick);
    }
  } catch (error) {
    console.error('Error processing ticks:', error);
  }
};

/**
 * Update market data in database
 */
const updateMarketData = async (tick: any) => {
  try {
    // Find stock by instrument token
    const stockInfo = await StockUniverse.findOne({ instrumentToken: tick.instrument_token });

    if (!stockInfo) {
      // Skip if stock not found in universe
      return;
    }

    // Find or create market data document
    let marketData = await MarketData.findOne({ symbol: stockInfo.symbol });

    if (!marketData) {
      // Create new market data document
      marketData = new MarketData({
        symbol: stockInfo.symbol,
        instrumentToken: tick.instrument_token,
        lastPrice: tick.last_price,
        dayHigh: tick.day_high_price || tick.last_price,
        dayLow: tick.day_low_price || tick.last_price,
        openPrice: tick.open_price || tick.last_price,
        closePrice: tick.last_price,
        volume: tick.volume || 0,
        averagePrice: tick.average_traded_price || tick.last_price,
        lastTradeTime: new Date(tick.last_trade_time * 1000) || new Date(),
        ohlc: {
          open: tick.ohlc?.open || tick.last_price,
          high: tick.ohlc?.high || tick.last_price,
          low: tick.ohlc?.low || tick.last_price,
          close: tick.ohlc?.close || tick.last_price,
        },
        change: tick.change || 0,
        lastUpdated: new Date(),
      });
    } else {
      // Update existing market data
      marketData.lastPrice = tick.last_price;
      marketData.dayHigh = tick.day_high_price || marketData.dayHigh;
      marketData.dayLow = tick.day_low_price || marketData.dayLow;
      marketData.openPrice = tick.open_price || marketData.openPrice;
      marketData.volume = tick.volume || marketData.volume;
      marketData.averagePrice = tick.average_traded_price || marketData.averagePrice;
      marketData.lastTradeTime = new Date(tick.last_trade_time * 1000) || new Date();
      marketData.ohlc = {
        open: tick.ohlc?.open || marketData.ohlc.open,
        high: tick.ohlc?.high || marketData.ohlc.high,
        low: tick.ohlc?.low || marketData.ohlc.low,
        close: tick.ohlc?.close || marketData.ohlc.close,
      };
      marketData.change = tick.change || marketData.change;
      marketData.lastUpdated = new Date();
    }

    // Generate 1-minute candlestick if needed
    await generateCandlestick(marketData, tick);

    // Save updated market data
    await marketData.save();
  } catch (error) {
    console.error('Error updating market data:', error);
  }
};

/**
 * Generate a candlestick from tick data
 */
const generateCandlestick = async (marketData: any, tick: any) => {
  const currentTime = new Date();
  const lastMinute = Math.floor(currentTime.getMinutes());

  // Check if we need to create a new 1-minute candle
  if (marketData.oneMinuteCandlesticks.length === 0 ||
      marketData.oneMinuteCandlesticks[marketData.oneMinuteCandlesticks.length - 1].timestamp.getMinutes() !== lastMinute) {

    // Create a new candle
    const newCandle = {
      timestamp: new Date(currentTime.setSeconds(0, 0)), // Start of the minute
      open: tick.last_price,
      high: tick.last_price,
      low: tick.last_price,
      close: tick.last_price,
      volume: tick.volume_traded || 0,
    };

    // Add the new candle
    marketData.oneMinuteCandlesticks.push(newCandle);

    // Limit the number of candles to keep (e.g., 60 minutes)
    if (marketData.oneMinuteCandlesticks.length > 60) {
      marketData.oneMinuteCandlesticks.shift();
    }

    // Generate 5-minute candle if needed
    await generateFiveMinuteCandle(marketData);

    // Generate 15-minute candle if needed
    await generateFifteenMinuteCandle(marketData);
  } else {
    // Update the current candle
    const currentCandle = marketData.oneMinuteCandlesticks[marketData.oneMinuteCandlesticks.length - 1];

    // Update high and low
    currentCandle.high = Math.max(currentCandle.high, tick.last_price);
    currentCandle.low = Math.min(currentCandle.low, tick.last_price);

    // Update close price
    currentCandle.close = tick.last_price;

    // Update volume
    currentCandle.volume += (tick.volume_traded || 0);
  }
};

/**
 * Generate a 5-minute candlestick from 1-minute data
 */
const generateFiveMinuteCandle = async (marketData: any) => {
  const currentTime = new Date();
  const currentMinute = currentTime.getMinutes();

  // Check if we need to create a new 5-minute candle (at minutes 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55)
  if (currentMinute % 5 === 0 && currentTime.getSeconds() < 10) {
    // Get the 1-minute candles for the last 5 minutes
    const oneMinCandles = marketData.oneMinuteCandlesticks.slice(-5);

    if (oneMinCandles.length === 0) {
      return;
    }

    // Create a new 5-minute candle
    const newCandle = {
      timestamp: new Date(currentTime.setSeconds(0, 0)),
      open: oneMinCandles[0].open,
      high: Math.max(...oneMinCandles.map(c => c.high)),
      low: Math.min(...oneMinCandles.map(c => c.low)),
      close: oneMinCandles[oneMinCandles.length - 1].close,
      volume: oneMinCandles.reduce((sum, c) => sum + c.volume, 0),
    };

    // Add the new candle
    marketData.fiveMinuteCandlesticks.push(newCandle);

    // Limit the number of candles to keep (e.g., 72 for 6 hours)
    if (marketData.fiveMinuteCandlesticks.length > 72) {
      marketData.fiveMinuteCandlesticks.shift();
    }
  }
};

/**
 * Generate a 15-minute candlestick from 5-minute data
 */
const generateFifteenMinuteCandle = async (marketData: any) => {
  const currentTime = new Date();
  const currentMinute = currentTime.getMinutes();

  // Check if we need to create a new 15-minute candle (at minutes 0, 15, 30, 45)
  if (currentMinute % 15 === 0 && currentTime.getSeconds() < 10) {
    // Get the 5-minute candles for the last 15 minutes (3 candles)
    const fiveMinCandles = marketData.fiveMinuteCandlesticks.slice(-3);

    if (fiveMinCandles.length === 0) {
      return;
    }

    // Create a new 15-minute candle
    const newCandle = {
      timestamp: new Date(currentTime.setSeconds(0, 0)),
      open: fiveMinCandles[0].open,
      high: Math.max(...fiveMinCandles.map(c => c.high)),
      low: Math.min(...fiveMinCandles.map(c => c.low)),
      close: fiveMinCandles[fiveMinCandles.length - 1].close,
      volume: fiveMinCandles.reduce((sum, c) => sum + c.volume, 0),
    };

    // Add the new candle
    marketData.fifteenMinuteCandlesticks.push(newCandle);

    // Limit the number of candles to keep (e.g., 30 for 7.5 hours)
    if (marketData.fifteenMinuteCandlesticks.length > 30) {
      marketData.fifteenMinuteCandlesticks.shift();
    }
  }
};

/**
 * Fetch all instruments from Kite API
 */
export const fetchInstruments = async () => {
  try {
    console.log('Fetching instruments from Kite API...');

    if (!kiteInstance) {
      console.warn('Kite instance not initialized. Cannot fetch instruments.');
      return;
    }

    // Fetch all instruments
    const instruments = await kiteInstance.getInstruments();

    console.log(`Fetched ${instruments.length} instruments.`);

    // Fetch F&O instruments
    const nseInstruments = instruments.filter((instrument: any) =>
      instrument.exchange === 'NSE' &&
      (instrument.segment === 'NFO-OPT' || instrument.segment === 'NFO-FUT')
    );

    console.log(`Found ${nseInstruments.length} F&O instruments.`);

    // Group instruments by underlying
    const instrumentsByUnderlying = nseInstruments.reduce((acc: any, instrument: any) => {
      const underlying = instrument.name;

      if (!acc[underlying]) {
        acc[underlying] = [];
      }

      acc[underlying].push(instrument);

      return acc;
    }, {});

    // Update stock universe
    for (const [underlying, instruments] of Object.entries(instrumentsByUnderlying)) {
      const stockInstrument = instruments[0];

      // Find or create stock in universe
      let stock = await StockUniverse.findOne({ symbol: underlying });

      if (!stock) {
        // Create new stock
        stock = new StockUniverse({
          symbol: underlying,
          name: stockInstrument.name,
          instrumentToken: stockInstrument.instrument_token,
          exchange: 'NSE',
          tradingSymbol: stockInstrument.tradingsymbol,
          inF1: true,
          lotSize: stockInstrument.lot_size || 0,
          tickSize: stockInstrument.tick_size || 0.05,
          isActive: true,
        });
      } else {
        // Update existing stock
        stock.name = stockInstrument.name;
        stock.instrumentToken = stockInstrument.instrument_token;
        stock.exchange = 'NSE';
        stock.tradingSymbol = stockInstrument.tradingsymbol;
        stock.inF1 = true;
        stock.lotSize = stockInstrument.lot_size || stock.lotSize;
        stock.tickSize = stockInstrument.tick_size || stock.tickSize;
      }

      // Extract expiry dates
      const expiryDates = Array.from(
        new Set(instruments.map((instrument: any) => instrument.expiry))
      ) as string[];

      // Update expiry dates
      stock.expiry = expiryDates.filter(Boolean);

      // Save stock
      await stock.save();
    }

    console.log('Stock universe updated successfully.');
  } catch (error) {
    console.error('Error fetching instruments:', error);
  }
};

/**
 * Fetch historical data for a stock
 */
export const fetchHistoricalData = async (
  symbol: string,
  interval: string,
  from: Date,
  to: Date
) => {
  try {
    if (!kiteInstance) {
      console.warn('Kite instance not initialized. Cannot fetch historical data.');
      return null;
    }

    // Find stock in universe
    const stock = await StockUniverse.findOne({ symbol });

    if (!stock) {
      console.warn(`Stock ${symbol} not found in universe.`);
      return null;
    }

    // Fetch historical data
    const historicalData = await kiteInstance.getHistoricalData(
      stock.instrumentToken,
      interval,
      formatAPIDateTime(from),
      formatAPIDateTime(to),
      false
    );

    return historicalData;
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    return null;
  }
};

/**
 * Place an order with Kite
 */
export const placeOrder = async (
  userId: string,
  exchange: string,
  tradingSymbol: string,
  transactionType: string,
  quantity: number,
  price: number | null,
  product: string,
  orderType: string,
  validity = 'DAY',
  disclosedQuantity = 0,
  triggerPrice = 0,
  squareoff: number | null = null,
  stoploss: number | null = null,
  trailingStoploss: number | null = null,
  tag: string | null = null
) => {
  try {
    if (!kiteInstance) {
      console.warn('Kite instance not initialized. Cannot place order.');
      return null;
    }

    // Find user
    const user = await User.findById(userId);

    if (!user || !user.zerodhaAccessToken) {
      console.warn(`User ${userId} not found or Zerodha access token missing.`);
      return null;
    }

    // Set access token for user
    const decryptedToken = decrypt(user.zerodhaAccessToken);
    kiteInstance.setAccessToken(decryptedToken);

    // Prepare order parameters
    const orderParams: any = {
      exchange,
      tradingsymbol: tradingSymbol,
      transaction_type: transactionType,
      quantity,
      product,
      order_type: orderType,
      validity,
      disclosed_quantity: disclosedQuantity,
      tag,
    };

    // Add price if specified (for LIMIT orders)
    if (price !== null) {
      orderParams.price = price;
    }

    // Add trigger price if specified (for SL and SL-M orders)
    if (triggerPrice > 0) {
      orderParams.trigger_price = triggerPrice;
    }

    // For bracket orders, add additional parameters
    if (squareoff !== null && stoploss !== null) {
      orderParams.variety = 'bo';
      orderParams.squareoff = squareoff;
      orderParams.stoploss = stoploss;

      if (trailingStoploss !== null) {
        orderParams.trailing_stoploss = trailingStoploss;
      }
    } else {
      orderParams.variety = 'regular';
    }

    // Place the order
    const orderResponse = await kiteInstance.placeOrder(orderParams.variety, orderParams);

    return orderResponse;
  } catch (error) {
    console.error('Error placing order:', error);
    return null;
  }
};

/**
 * Get order history
 */
export const getOrderHistory = async (userId: string, orderId: string | null = null) => {
  try {
    if (!kiteInstance) {
      console.warn('Kite instance not initialized. Cannot get order history.');
      return null;
    }

    // Find user
    const user = await User.findById(userId);

    if (!user || !user.zerodhaAccessToken) {
      console.warn(`User ${userId} not found or Zerodha access token missing.`);
      return null;
    }

    // Set access token for user
    const decryptedToken = decrypt(user.zerodhaAccessToken);
    kiteInstance.setAccessToken(decryptedToken);

    // Get orders
    if (orderId) {
      return await kiteInstance.getOrderHistory(orderId);
    } else {
      return await kiteInstance.getOrders();
    }
  } catch (error) {
    console.error('Error getting order history:', error);
    return null;
  }
};

/**
 * Cancel an order
 */
export const cancelOrder = async (userId: string, orderId: string, variety = 'regular') => {
  try {
    if (!kiteInstance) {
      console.warn('Kite instance not initialized. Cannot cancel order.');
      return null;
    }

    // Find user
    const user = await User.findById(userId);

    if (!user || !user.zerodhaAccessToken) {
      console.warn(`User ${userId} not found or Zerodha access token missing.`);
      return null;
    }

    // Set access token for user
    const decryptedToken = decrypt(user.zerodhaAccessToken);
    kiteInstance.setAccessToken(decryptedToken);

    // Cancel the order
    return await kiteInstance.cancelOrder(variety, orderId);
  } catch (error) {
    console.error('Error cancelling order:', error);
    return null;
  }
};

/**
 * Get quote for a trading symbol
 */
export const getQuote = async (exchange: string, tradingSymbol: string) => {
  try {
    if (!kiteInstance) {
      console.warn('Kite instance not initialized. Cannot get quote.');
      return null;
    }

    // Get quote
    return await kiteInstance.getQuote(`${exchange}:${tradingSymbol}`);
  } catch (error) {
    console.error(`Error getting quote for ${exchange}:${tradingSymbol}:`, error);
    return null;
  }
};

/**
 * Generate a Kite login URL for user authentication
 */
export const getLoginURL = (apiKey: string): string => {
  const kite = new KiteConnect.KiteConnect({ api_key: apiKey });
  return kite.getLoginURL();
};

/**
 * Generate a session from request token
 */
export const generateSession = async (apiKey: string, apiSecret: string, requestToken: string) => {
  try {
    const kite = new KiteConnect.KiteConnect({ api_key: apiKey });
    return await kite.generateSession(requestToken, apiSecret);
  } catch (error) {
    console.error('Error generating session:', error);
    throw error;
  }
};

/**
 * Get Kite connection status
 */
export const getKiteStatus = () => {
  return {
    isInitialized: !!kiteInstance,
    isWebSocketConnected: isConnected,
    reconnectAttempts,
    instrumentTokensCount: instrumentTokens.length,
  };
};
