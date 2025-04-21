import axios from 'axios';
import {
  type User,
  type ProfileUpdateData,
  LoginCredentials,
  RegisterData,
  ZerodhaCredentials,
  ChangePasswordData,
  type Signal,
  type Order,
  type MarketData,
  type HistoricalData,
  type SystemStatus,
  type ApiResponse,
  type PaginatedResponse
} from '../types';

// Check if we're in development mode or if the API is unavailable
const useMockApi = true; // Always use mock data for now

// API URL from environment variable or default
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token in all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock data for testing when API is not available
const mockUsers = {
  admin: {
    id: '1',
    username: 'admin',
    email: 'admin@fosignals.com',
    role: 'admin',
    isAutoTradingEnabled: false,
    maxTradesPerDay: 10,
    maxCapitalPerTrade: 50000,
  },
  user: {
    id: '2',
    username: 'testuser',
    email: 'user@fosignals.com',
    role: 'user',
    isAutoTradingEnabled: true,
    maxTradesPerDay: 5,
    maxCapitalPerTrade: 10000,
  }
};

// Mock implementation of login for testing
const mockLogin = async (email: string, password: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  if (email === 'admin@fosignals.com' && password === 'Admin@123') {
    const token = 'mock-admin-token-' + Date.now();
    localStorage.setItem('token', token);
    return {
      data: {
        message: 'Login successful',
        token,
        user: mockUsers.admin
      }
    };
  } else if (email === 'user@fosignals.com' && password === 'User@123') {
    const token = 'mock-user-token-' + Date.now();
    localStorage.setItem('token', token);
    return {
      data: {
        message: 'Login successful',
        token,
        user: mockUsers.user
      }
    };
  } else {
    throw {
      response: {
        status: 400,
        data: { message: 'Invalid credentials' }
      }
    };
  }
};

// Mock implementation for getProfile
const mockGetProfile = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const token = localStorage.getItem('token');
  if (!token) {
    throw {
      response: {
        status: 401,
        data: { message: 'Unauthorized' }
      }
    };
  }
  // Determine user from token
  if (token.startsWith('mock-admin-token-')) {
    return { data: { user: mockUsers.admin } };
  } else if (token.startsWith('mock-user-token-')) {
    return { data: { user: mockUsers.user } };
  } else {
    throw {
      response: {
        status: 401,
        data: { message: 'Unauthorized' }
      }
    };
  }
};

// Mock implementation for updateProfile
const mockUpdateProfile = async (data: ProfileUpdateData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const token = localStorage.getItem('token');
  if (!token) {
    throw {
      response: {
        status: 401,
        data: { message: 'Unauthorized' }
      }
    };
  }
  let user;
  if (token.startsWith('mock-admin-token-')) {
    user = { ...mockUsers.admin, ...data };
    mockUsers.admin = user;
  } else if (token.startsWith('mock-user-token-')) {
    user = { ...mockUsers.user, ...data };
    mockUsers.user = user;
  } else {
    throw {
      response: {
        status: 401,
        data: { message: 'Unauthorized' }
      }
    };
  }
  return { data: { user } };
};

// Mock implementation for changePassword
const mockChangePassword = async (currentPassword: string, newPassword: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  // Accept any change for mock
  if (!localStorage.getItem('token')) {
    throw {
      response: {
        status: 401,
        data: { message: 'Unauthorized' }
      }
    };
  }
  return { data: {} };
};

// Mock implementation for toggleAutoTrading
const mockToggleAutoTrading = async (enabled: boolean) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const token = localStorage.getItem('token');
  if (!token) {
    throw {
      response: {
        status: 401,
        data: { message: 'Unauthorized' }
      }
    };
  }
  if (token.startsWith('mock-admin-token-')) {
    mockUsers.admin.isAutoTradingEnabled = enabled;
    return { data: { isAutoTradingEnabled: enabled } };
  } else if (token.startsWith('mock-user-token-')) {
    mockUsers.user.isAutoTradingEnabled = enabled;
    return { data: { isAutoTradingEnabled: enabled } };
  } else {
    throw {
      response: {
        status: 401,
        data: { message: 'Unauthorized' }
      }
    };
  }
};

// Mock implementation for createAdmin
const mockCreateAdmin = async (username: string, email: string, password: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // Return a new admin user with a mock token
  const newAdmin = {
    id: String(Date.now()),
    username,
    email,
    role: 'admin',
    isAutoTradingEnabled: false,
    maxTradesPerDay: 10,
    maxCapitalPerTrade: 50000,
  };
  const token = 'mock-admin-token-' + Date.now();
  localStorage.setItem('token', token);
  return {
    data: {
      message: 'Admin created successfully',
      token,
      user: newAdmin
    }
  };
};

// Signals mock data
const mockSignals: Signal[] = [
  {
    id: 'signal1',
    symbol: 'AAPL',
    type: 'buy',
    price: 150,
    quantity: 10,
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'signal2',
    symbol: 'GOOGL',
    type: 'sell',
    price: 2800,
    quantity: 5,
    status: 'closed',
    createdAt: new Date().toISOString(),
  },
];

// Mock implementation for signalsAPI
const mockGetSignals = async (page = 1, limit = 10) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedSignals = mockSignals.slice(start, end);
  return {
    data: {
      items: paginatedSignals,
      total: mockSignals.length,
      page,
      limit,
    }
  };
};

const mockGetSignalById = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const signal = mockSignals.find(s => s.id === id);
  if (!signal) {
    throw {
      response: {
        status: 404,
        data: { message: 'Signal not found' }
      }
    };
  }
  return { data: signal };
};

const mockGetSignalStats = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const totalSignals = mockSignals.length;
  const activeSignals = mockSignals.filter(s => s.status === 'active').length;
  return { data: { stats: { totalSignals, activeSignals } } };
};

const mockGenerateSignal = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newSignal: Signal = {
    id: 'signal' + (mockSignals.length + 1),
    symbol: 'MSFT',
    type: 'buy',
    price: 300,
    quantity: 20,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  mockSignals.push(newSignal);
  return { data: newSignal };
};

// Orders mock data
const mockOrders: Order[] = [
  {
    id: 'order1',
    signalId: 'signal1',
    status: 'executed',
    executedAt: new Date().toISOString(),
    quantity: 10,
    price: 150,
  },
  {
    id: 'order2',
    signalId: 'signal2',
    status: 'cancelled',
    executedAt: null,
    quantity: 5,
    price: 2800,
  },
];

// Mock implementation for ordersAPI
const mockGetOrders = async (page = 1, limit = 10) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedOrders = mockOrders.slice(start, end);
  return {
    data: {
      items: paginatedOrders,
      total: mockOrders.length,
      page,
      limit,
    }
  };
};

const mockGetOrderById = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const order = mockOrders.find(o => o.id === id);
  if (!order) {
    throw {
      response: {
        status: 404,
        data: { message: 'Order not found' }
      }
    };
  }
  return { data: order };
};

const mockExecuteOrder = async (signalId: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const signal = mockSignals.find(s => s.id === signalId);
  if (!signal) {
    throw {
      response: {
        status: 404,
        data: { message: 'Signal not found' }
      }
    };
  }
  const newOrder: Order = {
    id: 'order' + (mockOrders.length + 1),
    signalId,
    status: 'executed',
    executedAt: new Date().toISOString(),
    quantity: signal.quantity,
    price: signal.price,
  };
  mockOrders.push(newOrder);
  return { data: newOrder };
};

const mockCancelOrder = async (orderId: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const order = mockOrders.find(o => o.id === orderId);
  if (!order) {
    throw {
      response: {
        status: 404,
        data: { message: 'Order not found' }
      }
    };
  }
  if (order.status === 'executed') {
    return { data: { success: false } };
  }
  order.status = 'cancelled';
  return { data: { success: true } };
};

// Market Data mock
const mockMarketData: MarketData = {
  symbol: 'AAPL',
  price: 150,
  change: 1.2,
  percentChange: 0.8,
  volume: 1000000,
};

const mockHistoricalData: HistoricalData = {
  symbol: 'AAPL',
  data: [
    { date: '2023-01-01', open: 140, high: 145, low: 139, close: 144, volume: 100000 },
    { date: '2023-01-02', open: 144, high: 150, low: 143, close: 149, volume: 120000 },
  ],
};

const mockTopGainers: MarketData[] = [
  { symbol: 'TSLA', price: 900, change: 20, percentChange: 2.3, volume: 500000 },
  { symbol: 'NVDA', price: 600, change: 15, percentChange: 2.6, volume: 300000 },
];

const mockTopLosers: MarketData[] = [
  { symbol: 'IBM', price: 120, change: -5, percentChange: -4, volume: 200000 },
  { symbol: 'GE', price: 80, change: -3, percentChange: -3.6, volume: 150000 },
];

// Mock implementation for marketDataAPI
const mockGetMarketData = async (symbol: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: { ...mockMarketData, symbol } };
};

const mockGetHistoricalData = async (symbol: string, from: string, to: string, interval = '1d') => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: { ...mockHistoricalData, symbol } };
};

const mockGetTopGainers = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: mockTopGainers };
};

const mockGetTopLosers = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: mockTopLosers };
};

const mockGetMarketStatus = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return { data: { isOpen: true, nextOpenTime: new Date(Date.now() + 3600000).toISOString() } };
};

// Admin mock users array (reusing mockUsers keys)
const mockAdminUsers: User[] = [
  mockUsers.admin,
  mockUsers.user,
];

// Mock implementation for adminAPI
const mockGetUsers = async (page = 1, limit = 10) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedUsers = mockAdminUsers.slice(start, end);
  return {
    data: {
      items: paginatedUsers,
      total: mockAdminUsers.length,
      page,
      limit,
    }
  };
};

const mockGetUserById = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const user = mockAdminUsers.find(u => u.id === id);
  if (!user) {
    throw {
      response: {
        status: 404,
        data: { message: 'User not found' }
      }
    };
  }
  return { data: user };
};

const mockUpdateUser = async (id: string, data: ProfileUpdateData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const index = mockAdminUsers.findIndex(u => u.id === id);
  if (index === -1) {
    throw {
      response: {
        status: 404,
        data: { message: 'User not found' }
      }
    };
  }
  const updatedUser = { ...mockAdminUsers[index], ...data };
  mockAdminUsers[index] = updatedUser;
  return { data: updatedUser };
};

const mockDeleteUser = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const index = mockAdminUsers.findIndex(u => u.id === id);
  if (index === -1) {
    throw {
      response: {
        status: 404,
        data: { message: 'User not found' }
      }
    };
  }
  mockAdminUsers.splice(index, 1);
  return { data: { success: true } };
};

const mockGetSystemStatus = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const status: SystemStatus = {
    serverUp: true,
    databaseConnected: true,
    activeUsers: 42,
  };
  return { data: status };
};

const mockRefreshMarketData = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { data: { success: true } };
};

const mockGetAnalytics = async (period = '1m') => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const analytics = {
    period,
    totalSignals: mockSignals.length,
    totalOrders: mockOrders.length,
    activeUsers: mockAdminUsers.length,
  };
  return { data: { analytics } };
};

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    useMockApi
      ? mockLogin(email, password)
      : api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', { email, password }),
  register: (username: string, email: string, password: string) =>
    useMockApi
      ? Promise.reject({ response: { status: 501, data: { message: 'Register not implemented in mock' } } })
      : api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', { username, email, password }),
  getProfile: () =>
    useMockApi
      ? mockGetProfile()
      : api.get<ApiResponse<{ user: User }>>('/auth/profile'),
  updateProfile: (data: ProfileUpdateData) =>
    useMockApi
      ? mockUpdateProfile(data)
      : api.put<ApiResponse<{ user: User }>>('/auth/profile', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    useMockApi
      ? mockChangePassword(currentPassword, newPassword)
      : api.put<ApiResponse<void>>('/auth/change-password', { currentPassword, newPassword }),
  setZerodhaCredentials: (apiKey: string, apiSecret: string) =>
    useMockApi
      ? Promise.resolve({ data: { loginUrl: 'https://mock.zerodha/login' } })
      : api.post<ApiResponse<{ loginUrl: string }>>('/auth/zerodha-credentials', { apiKey, apiSecret }),
  generateZerodhaSession: (requestToken: string) =>
    useMockApi
      ? Promise.resolve({ data: { expiryTime: new Date(Date.now() + 3600000).toISOString() } })
      : api.post<ApiResponse<{ expiryTime: string }>>('/auth/zerodha-session', { requestToken }),
  toggleAutoTrading: (enabled: boolean) =>
    useMockApi
      ? mockToggleAutoTrading(enabled)
      : api.post<ApiResponse<{ isAutoTradingEnabled: boolean }>>('/auth/toggle-auto-trading', { enabled }),
  createAdmin: (username: string, email: string, password: string) =>
    useMockApi
      ? mockCreateAdmin(username, email, password)
      : api.post<ApiResponse<{ token: string; user: User }>>('/auth/create-admin', { username, email, password }),
};

// Signals API
export const signalsAPI = {
  getSignals: (page = 1, limit = 10) =>
    useMockApi
      ? mockGetSignals(page, limit)
      : api.get<ApiResponse<PaginatedResponse<Signal>>>(`/signals?page=${page}&limit=${limit}`),
  getSignalById: (id: string) =>
    useMockApi
      ? mockGetSignalById(id)
      : api.get<ApiResponse<Signal>>(`/signals/${id}`),
  getSignalStats: () =>
    useMockApi
      ? mockGetSignalStats()
      : api.get<ApiResponse<{ stats: { totalSignals: number, activeSignals: number } }>>('/signals/stats'),
  generateSignal: () =>
    useMockApi
      ? mockGenerateSignal()
      : api.post<ApiResponse<Signal>>('/signals/generate'),
};

// Orders API
export const ordersAPI = {
  getOrders: (page = 1, limit = 10) =>
    useMockApi
      ? mockGetOrders(page, limit)
      : api.get<ApiResponse<PaginatedResponse<Order>>>(`/orders?page=${page}&limit=${limit}`),
  getOrderById: (id: string) =>
    useMockApi
      ? mockGetOrderById(id)
      : api.get<ApiResponse<Order>>(`/orders/${id}`),
  executeOrder: (signalId: string) =>
    useMockApi
      ? mockExecuteOrder(signalId)
      : api.post<ApiResponse<Order>>('/orders/execute', { signalId }),
  cancelOrder: (orderId: string) =>
    useMockApi
      ? mockCancelOrder(orderId)
      : api.post<ApiResponse<{ success: boolean }>>('/orders/cancel', { orderId }),
};

// Market Data API
export const marketDataAPI = {
  getMarketData: (symbol: string) =>
    useMockApi
      ? mockGetMarketData(symbol)
      : api.get<ApiResponse<MarketData>>(`/market-data/${symbol}`),
  getHistoricalData: (symbol: string, from: string, to: string, interval = '1d') =>
    useMockApi
      ? mockGetHistoricalData(symbol, from, to, interval)
      : api.get<ApiResponse<HistoricalData>>(`/market-data/historical/${symbol}?interval=${interval}&from=${from}&to=${to}`),
  getTopGainers: () =>
    useMockApi
      ? mockGetTopGainers()
      : api.get<ApiResponse<MarketData[]>>('/market-data/top-gainers'),
  getTopLosers: () =>
    useMockApi
      ? mockGetTopLosers()
      : api.get<ApiResponse<MarketData[]>>('/market-data/top-losers'),
  getMarketStatus: () =>
    useMockApi
      ? mockGetMarketStatus()
      : api.get<ApiResponse<{ isOpen: boolean; nextOpenTime?: string }>>('/market-data/status'),
};

// Admin API
export const adminAPI = {
  getUsers: (page = 1, limit = 10) =>
    useMockApi
      ? mockGetUsers(page, limit)
      : api.get<ApiResponse<PaginatedResponse<User>>>(`/admin/users?page=${page}&limit=${limit}`),
  getUserById: (id: string) =>
    useMockApi
      ? mockGetUserById(id)
      : api.get<ApiResponse<User>>(`/admin/users/${id}`),
  updateUser: (id: string, data: ProfileUpdateData) =>
    useMockApi
      ? mockUpdateUser(id, data)
      : api.put<ApiResponse<User>>(`/admin/users/${id}`, data),
  deleteUser: (id: string) =>
    useMockApi
      ? mockDeleteUser(id)
      : api.delete<ApiResponse<{ success: boolean }>>(`/admin/users/${id}`),
  getSystemStatus: () =>
    useMockApi
      ? mockGetSystemStatus()
      : api.get<ApiResponse<SystemStatus>>('/admin/system-status'),
  refreshMarketData: () =>
    useMockApi
      ? mockRefreshMarketData()
      : api.post<ApiResponse<{ success: boolean }>>('/admin/refresh-market-data'),
  getAnalytics: (period = '1m') =>
    useMockApi
      ? mockGetAnalytics(period)
      : api.get<ApiResponse<{ analytics: any }>>(`/admin/analytics?period=${period}`),
};

export default api;
