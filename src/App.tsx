import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layout components
import DashboardLayout from './components/layouts/DashboardLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Dashboard pages
import DashboardPage from './pages/dashboard/DashboardPage';
import SignalsPage from './pages/dashboard/SignalsPage';
import SignalDetailPage from './pages/dashboard/SignalDetailPage';
import OrdersPage from './pages/dashboard/OrdersPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UsersPage from './pages/admin/UsersPage';
import SystemStatusPage from './pages/admin/SystemStatusPage';

// Private route wrapper
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Toaster position="top-right" />
          <Routes>
            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* Dashboard routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/signals" element={<SignalsPage />} />
                <Route path="/signals/:id" element={<SignalDetailPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route element={<DashboardLayout isAdmin={true} />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<UsersPage />} />
                <Route path="/admin/system" element={<SystemStatusPage />} />
              </Route>
            </Route>

            {/* Redirect to dashboard if logged in, otherwise to login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
