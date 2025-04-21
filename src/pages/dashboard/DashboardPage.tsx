import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrendingUp, FiTrendingDown, FiAlertCircle, FiCheck, FiBarChart2 } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sample data for chart
const sampleData = [
  { date: '2023-01-01', profit: 1000 },
  { date: '2023-02-01', profit: 1500 },
  { date: '2023-03-01', profit: 1200 },
  { date: '2023-04-01', profit: 1800 },
  { date: '2023-05-01', profit: 2200 },
  { date: '2023-06-01', profit: 1900 },
  { date: '2023-07-01', profit: 2500 },
];

// Sample data for stats
const defaultStats = {
  totalProfit: 25000,
  winRate: 68,
  totalTrades: 245,
  activeTrades: 5,
  activeSignals: 8
};

const DashboardPage = () => {
  const [stats, setStats] = useState(defaultStats);
  const [chartData, setChartData] = useState(sampleData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('month');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // In a real app, fetch data from API
        // const response = await axios.get('/api/dashboard/stats');
        // setStats(response.data.stats);
        // setChartData(response.data.chartData);

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

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
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
          <button
            onClick={() => handleTimeframeChange('all')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeframe === 'all'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Time
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Profit Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <FiBarChart2 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Profit</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {isLoading ? '---' : formatCurrency(stats.totalProfit)}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Win Rate Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-md p-3 ${stats.winRate > 50 ? 'bg-green-500' : 'bg-red-500'}`}>
                {stats.winRate > 50 ? (
                  <FiTrendingUp className="h-6 w-6 text-white" />
                ) : (
                  <FiTrendingDown className="h-6 w-6 text-white" />
                )}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Win Rate</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {isLoading ? '---' : `${stats.winRate}%`}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Trades Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <FiCheck className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Trades</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {isLoading ? '---' : stats.totalTrades}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Active Trades Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <FiTrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Trades</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {isLoading ? '---' : stats.activeTrades}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Active Signals Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <FiAlertCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Signals</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {isLoading ? '---' : stats.activeSignals}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profit Chart */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Profit Over Time</h3>
          <div className="mt-4 h-80">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
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
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#6366F1"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Signals Section */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Signals</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Symbol
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Entry
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Target
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Stop Loss
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  Array(3)
                    .fill(0)
                    .map((_, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </td>
                      </tr>
                    ))
                ) : (
                  <>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">NIFTY 25Jul 24000 CE</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">BUY</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹120.50</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹145.00</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹105.25</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">RELIANCE 27Jul 2800 PE</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">SELL</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹85.75</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹65.50</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹95.00</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">HDFC 26Jul 1650 CE</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">BUY</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹45.25</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹60.00</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹38.50</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Executed
                        </span>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
