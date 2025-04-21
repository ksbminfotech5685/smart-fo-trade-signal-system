// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  zerodhaApiKey?: boolean;
  zerodhaAccessToken?: boolean;
  isAutoTradingEnabled?: boolean;
  maxTradesPerDay?: number;
  maxCapitalPerTrade?: number;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface ProfileUpdateData {
  username?: string;
  email?: string;
  maxTradesPerDay?: number;
  maxCapitalPerTrade?: number;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ZerodhaCredentials {
  apiKey: string;
  apiSecret: string;
}

// Signal Types
export interface Signal {
  id: string;
  type: 'BUY' | 'SELL';
  stock: string;
  option: string;
  currentMarketPrice: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  riskRewardRatio: string;
  generatedAt: string;
  sentToTelegram: boolean;
  sentAt?: string;
  executedOrder: boolean;
  executedAt?: string;
  orderStatus?: 'PENDING' | 'EXECUTED' | 'REJECTED' | 'CANCELLED';
  orderDetails?: {
    orderId?: string;
    orderPrice?: number;
    quantity?: number;
    filledQuantity?: number;
    status?: string;
    statusMessage?: string;
  };
  profitLoss?: number;
  exitPrice?: number;
  exitAt?: string;
  exitReason?: 'TARGET_HIT' | 'SL_HIT' | 'MANUAL_EXIT' | 'MARKET_CLOSE';
  indicators: {
    rsi?: number;
    macd?: {
      line: number;
      signal: number;
      histogram: number;
    };
    supertrend?: boolean;
    ema20?: number;
    ema50?: number;
    priceAboveVwap?: boolean;
    volume?: number;
    avgVolume?: number;
    highestOI?: string;
    ivChange?: number;
  };
  notes?: string;
}

export interface SignalStats {
  totalSignals: number;
  activeSignals: number;
  successfulSignals: number;
  failedSignals: number;
  winRate: number;
  averageProfit: number;
  totalProfit: number;
}

// Order Types
export interface Order {
  id: string;
  userId: string;
  signalId: string;
  type: 'BUY' | 'SELL';
  symbol: string;
  quantity: number;
  price: number;
  status: 'PENDING' | 'EXECUTED' | 'REJECTED' | 'CANCELLED';
  orderId?: string;
  brokerOrderId?: string;
  transactionType: string;
  product: string;
  exchange: string;
  orderType: string;
  triggerPrice?: number;
  createdAt: string;
  updatedAt: string;
  executedAt?: string;
  cancelledAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  profitLoss?: number;
}

// Market Data Types
export interface MarketData {
  symbol: string;
  instrumentToken: number;
  lastPrice: number;
  dayHigh: number;
  dayLow: number;
  openPrice: number;
  closePrice: number;
  volume: number;
  averagePrice: number;
  lastTradeTime: string;
  ohlc: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
  change: number;
  lastUpdated: string;
}

export interface CandleStick {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoricalData {
  symbol: string;
  interval: string;
  candles: CandleStick[];
  from: string;
  to: string;
}

// Analytics Types
export interface DailyAnalytics {
  date: string;
  totalSignals: number;
  signalsByType: {
    BUY: number;
    SELL: number;
  };
  executedOrders: number;
  successfulTrades: number;
  failedTrades: number;
  profitLoss: number;
  profitLossPercentage: number;
  totalCapitalUsed: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
}

// System Status Types
export interface SystemStatus {
  serverStatus: 'online' | 'offline' | 'error';
  databaseStatus: 'connected' | 'disconnected' | 'error';
  zerodhaApiStatus: 'connected' | 'disconnected' | 'error';
  telegramBotStatus: 'active' | 'inactive' | 'error';
  marketDataStatus: 'active' | 'inactive' | 'error';
  webSocketStatus: 'connected' | 'disconnected' | 'error';
  lastUpdated: string;
  activeUsers: number;
  systemLoad: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Response Types
export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}
