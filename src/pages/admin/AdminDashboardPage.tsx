import { useState, useEffect } from 'react';
import { FiUsers, FiServer, FiAlertCircle, FiCheck, FiBarChart2, FiClock, FiSettings } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

// Sample data for active users chart
const sampleActiveUsersData = [
  { date: '2023-01-01', count: 120 },
  { date: '2023-02-01', count: 145 },
  { date: '2023-03-01', count: 162 },
  { date: '2023-04-01', count: 173 },
  { date: '2023-05-01', count: 191 },
  { date: '2023-06-01', count: 210 },
  { date: '2023-07-01', count: 235 },
];

// Sample system status data
const sampleSystemStatus = {
  cpuUsage: 28,
  memoryUsage: 42,
  diskUsage: 36,
  apiRequests: 1254,
  signalsGenerated: 184,
  ordersExecuted: 102,
  uptime: '27 days, 12 hours',
  lastRestart: '2023-06-20 04:30 AM',
  averageResponseTime: 124, // ms
  activeJobs: 5
};

// Sample recent activity
const sampleRecentActivity = [
  { id: 1, type: 'USER_REGISTERED', user: 'rahul.sharma@example.com', timestamp: '2023-07-18T12:30:00Z' },
  { id: 2, type: 'ZERODHA_API_UPDATED', user: 'priya.patel@example.com', timestamp: '2023-07-18T10:15:00Z' },
  { id: 3, type: 'TRADING_ENABLED', user: 'amit.kumar@example.com', timestamp: '2023-07-18T09:45:00Z' },
  { id: 4, type: 'PASSWORD_RESET', user: 'neha.gupta@example.com', timestamp: '2023-07-18T08:20:00Z' },
  { id: 5, type: 'SIGNAL_ALGORITHM_UPDATED', user: 'admin', timestamp: '2023-07-17T17:10:00Z' },
];

const AdminDashboardPage = () => {
  const [timeframe, setTimeframe] = useState('month');
  const [activeUsersData, setActiveUsersData] = useState(sampleActiveUsersData);
  const [systemStatus, setSystemStatus] = useState(sampleSystemStatus);
  const [recentActivity, setRecentActivity] = useState(sampleRecentActivity);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 235,
    activeUsers: 178,
    revenueThisMonth: 14500,
    activeSubscriptions: 162
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // In a real app, fetch data from API
        // const response = await axios.get('/api/admin/dashboard', {
        //   params: { timeframe }
        // });
        // setActiveUsersData(response.data.activeUsersData);
        // setSystemStatus(response.data.systemStatus);
        // setRecentActivity(response.data.recentActivity);
        // setStats(response.data.stats);

        // Simulate API call with timeout
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeframe]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatActivityType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getStatusIndicator = (percentage: number) => {
    if (percentage < 50) {
      return <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2" />;
    } else if (percentage < 80) {
      return <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2" />;
    } else {
      return <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'USER_REGISTERED':
        return <FiUsers className="h-5 w-5 text-indigo-500" />;
      case 'ZERODHA_API_UPDATED':
      case 'SIGNAL_ALGORITHM_UPDATED':
        return <FiSettings className="h-5 w-5 text-purple-500" />;
      case 'TRADING_ENABLED':
        return <FiBarChart2 className="h-5 w-5 text-green-500" />;
      case 'PASSWORD_RESET':
        return <FiCheck className="h-5 w-5 text-blue-500" />;
      default:
        return <FiClock className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => handleTimeframeChange('week')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeframe === 'week'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => handleTimeframeChange('month')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeframe === 'month'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => handleTimeframeChange('year')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeframe === 'year'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <FiUsers className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {isLoading ? '---' : stats.totalUsers}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <FiUsers className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {isLoading ? '---' : stats.activeUsers}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <FiBarChart2 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Revenue (This Month)</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {isLoading ? '---' : formatCurrency(stats.revenueThisMonth)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <FiCheck className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Subscriptions</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {isLoading ? '---' : stats.activeSubscriptions}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Chart */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">User Growth</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="h-80">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={activeUsersData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Users']} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Active Users"
                    stroke="#6366F1"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* System Status and Recent Activity */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* System Status */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">System Status</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center">
                      {getStatusIndicator(systemStatus.cpuUsage)}
                      <span className="text-sm font-medium text-gray-500">CPU Usage</span>
                    </div>
                    <p className="mt-1 text-lg font-semibold">{systemStatus.cpuUsage}%</p>
                  </div>
                  <div>
                    <div className="flex items-center">
                      {getStatusIndicator(systemStatus.memoryUsage)}
                      <span className="text-sm font-medium text-gray-500">Memory Usage</span>
                    </div>
                    <p className="mt-1 text-lg font-semibold">{systemStatus.memoryUsage}%</p>
                  </div>
                  <div>
                    <div className="flex items-center">
                      {getStatusIndicator(systemStatus.diskUsage)}
                      <span className="text-sm font-medium text-gray-500">Disk Usage</span>
                    </div>
                    <p className="mt-1 text-lg font-semibold">{systemStatus.diskUsage}%</p>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500">API Requests (24h)</span>
                    </div>
                    <p className="mt-1 text-lg font-semibold">{systemStatus.apiRequests}</p>
                  </div>
                </div>

                <hr className="my-4" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500">System Uptime</span>
                    </div>
                    <p className="mt-1 text-sm font-medium">{systemStatus.uptime}</p>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500">Last Restart</span>
                    </div>
                    <p className="mt-1 text-sm font-medium">{systemStatus.lastRestart}</p>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500">Avg Response Time</span>
                    </div>
                    <p className="mt-1 text-sm font-medium">{systemStatus.averageResponseTime} ms</p>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500">Active Jobs</span>
                    </div>
                    <p className="mt-1 text-sm font-medium">{systemStatus.activeJobs}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
              </div>
            ) : (
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentActivity.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== recentActivity.length - 1 ? (
                          <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex items-start space-x-3">
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                              {getActivityIcon(activity.type)}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-900">{activity.user}</span>
                              </div>
                              <p className="mt-0.5 text-sm text-gray-500">
                                {formatActivityType(activity.type)}
                              </p>
                            </div>
                            <div className="mt-1 text-sm text-gray-500">
                              <p>{formatTimestamp(activity.timestamp)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
