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

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', { email, password }),
  register: (username: string, email: string, password: string) =>
    api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', { username, email, password }),
  getProfile: () => api.get<ApiResponse<{ user: User }>>('/auth/profile'),
  updateProfile: (data: ProfileUpdateData) => api.put<ApiResponse<{ user: User }>>('/auth/profile', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put<ApiResponse<void>>('/auth/change-password', { currentPassword, newPassword }),
  setZerodhaCredentials: (apiKey: string, apiSecret: string) =>
    api.post<ApiResponse<{ loginUrl: string }>>('/auth/zerodha-credentials', { apiKey, apiSecret }),
  generateZerodhaSession: (requestToken: string) =>
    api.post<ApiResponse<{ expiryTime: string }>>('/auth/zerodha-session', { requestToken }),
  toggleAutoTrading: (enabled: boolean) =>
    api.post<ApiResponse<{ isAutoTradingEnabled: boolean }>>('/auth/toggle-auto-trading', { enabled }),
  createAdmin: (username: string, email: string, password: string) =>
    api.post<ApiResponse<{ token: string; user: User }>>('/auth/create-admin', { username, email, password }),
};

// Signals API
export const signalsAPI = {
  getSignals: (page = 1, limit = 10) =>
    api.get<ApiResponse<PaginatedResponse<Signal>>>(`/signals?page=${page}&limit=${limit}`),
  getSignalById: (id: string) => api.get<ApiResponse<Signal>>(`/signals/${id}`),
  getSignalStats: () => api.get<ApiResponse<{ stats: { totalSignals: number, activeSignals: number } }>>('/signals/stats'),
  generateSignal: () => api.post<ApiResponse<Signal>>('/signals/generate'),
};

// Orders API
export const ordersAPI = {
  getOrders: (page = 1, limit = 10) =>
    api.get<ApiResponse<PaginatedResponse<Order>>>(`/orders?page=${page}&limit=${limit}`),
  getOrderById: (id: string) => api.get<ApiResponse<Order>>(`/orders/${id}`),
  executeOrder: (signalId: string) => api.post<ApiResponse<Order>>('/orders/execute', { signalId }),
  cancelOrder: (orderId: string) => api.post<ApiResponse<{ success: boolean }>>('/orders/cancel', { orderId }),
};

// Market Data API
export const marketDataAPI = {
  getMarketData: (symbol: string) => api.get<ApiResponse<MarketData>>(`/market-data/${symbol}`),
  getHistoricalData: (symbol: string, from: string, to: string, interval = '1d') =>
    api.get<ApiResponse<HistoricalData>>(`/market-data/historical/${symbol}?interval=${interval}&from=${from}&to=${to}`),
  getTopGainers: () => api.get<ApiResponse<MarketData[]>>('/market-data/top-gainers'),
  getTopLosers: () => api.get<ApiResponse<MarketData[]>>('/market-data/top-losers'),
  getMarketStatus: () => api.get<ApiResponse<{ isOpen: boolean; nextOpenTime?: string }>>('/market-data/status'),
};

// Admin API
export const adminAPI = {
  getUsers: (page = 1, limit = 10) =>
    api.get<ApiResponse<PaginatedResponse<User>>>(`/admin/users?page=${page}&limit=${limit}`),
  getUserById: (id: string) => api.get<ApiResponse<User>>(`/admin/users/${id}`),
  updateUser: (id: string, data: ProfileUpdateData) => api.put<ApiResponse<User>>(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete<ApiResponse<{ success: boolean }>>(`/admin/users/${id}`),
  getSystemStatus: () => api.get<ApiResponse<SystemStatus>>('/admin/system-status'),
  refreshMarketData: () => api.post<ApiResponse<{ success: boolean }>>('/admin/refresh-market-data'),
  getAnalytics: (period = '1m') => api.get<ApiResponse<{ analytics: any }>>(`/admin/analytics?period=${period}`),
};

export default api;
