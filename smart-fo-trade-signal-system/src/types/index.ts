// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  zerodhaApiKey?: string;
  zerodhaAccessToken?: string;
  isAutoTradingEnabled: boolean;
  maxTradesPerDay: number;
  riskPercentage: number;
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
  symbol: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  status: 'ACTIVE' | 'EXECUTED' | 'PENDING' | 'TRIGGERED' | 'CLOSED' | 'EXPIRED';
  probability: number;
  createdAt: string;
  expiryDate: string;
  executedAt?: string;
  closedAt?: string;
  userId?: string;
  description?: string;
  pnl?: number;
  instrumentToken?: number;
  lots?: number;
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
  server: {
    status: 'UP' | 'DOWN';
    uptime: number;
    memoryUsage: number;
  };
  database: {
    status: 'CONNECTED' | 'DISCONNECTED';
    connectionCount: number;
  };
  zerodha: {
    status: 'CONNECTED' | 'DISCONNECTED';
    lastSyncTime?: string;
  };
  telegram: {
    status: 'CONNECTED' | 'DISCONNECTED';
    subscribers?: number;
  };
  signalGenerator: {
    status: 'RUNNING' | 'STOPPED';
    signals24h: number;
  };
  orderExecutor: {
    status: 'RUNNING' | 'STOPPED';
    orders24h: number;
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
  success: boolean;
  message?: string;
  data: T;
}
