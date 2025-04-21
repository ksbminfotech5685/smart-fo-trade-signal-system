import { useState, useEffect } from 'react';
import { FiCalendar, FiAlertCircle, FiTrendingUp, FiTrendingDown, FiPieChart, FiBarChart2 } from 'react-icons/fi';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import axios from 'axios';

// Sample analytics data
const samplePerformanceData = [
  { date: '2023-01-01', profit: 2500, trades: 15, winRate: 67 },
  { date: '2023-02-01', profit: -1200, trades: 12, winRate: 42 },
  { date: '2023-03-01', profit: 4500, trades: 18, winRate: 72 },
  { date: '2023-04-01', profit: 3200, trades: 14, winRate: 64 },
  { date: '2023-05-01', profit: 5100, trades: 20, winRate: 75 },
  { date: '2023-06-01', profit: -800, trades: 10, winRate: 40 },
  { date: '2023-07-01', profit: 6200, trades: 22, winRate: 82 },
];

const sampleSegmentData = [
  { name: 'NIFTY', value: 45 },
  { name: 'BANKNIFTY', value: 30 },
  { name: 'FINNIFTY', value: 15 },
  { name: 'STOCKS', value: 10 },
];

const sampleStrategyData = [
  { name: 'Trend Following', value: 40 },
  { name: 'Reversal', value: 25 },
  { name: 'Breakout', value: 20 },
  { name: 'Range Bound', value: 15 },
];

const sampleTimeframeData = [
  { name: 'Intraday', value: 70 },
  { name: 'Swing', value: 20 },
  { name: 'Positional', value: 10 },
];

const sampleMonthlyPerformance = [
  { month: 'Jan', profit: 2500 },
  { month: 'Feb', profit: -1200 },
  { month: 'Mar', profit: 4500 },
  { month: 'Apr', profit: 3200 },
  { month: 'May', profit: 5100 },
  { month: 'Jun', profit: -800 },
  { month: 'Jul', profit: 6200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#FFC300'];

const AnalyticsPage = () => {
  const [timeframe, setTimeframe] = useState('month');
  const [performanceData, setPerformanceData] = useState(samplePerformanceData);
  const [segmentData, setSegmentData] = useState(sampleSegmentData);
  const [strategyData, setStrategyData] = useState(sampleStrategyData);
  const [timeframeData, setTimeframeData] = useState(sampleTimeframeData);
  const [monthlyPerformance, setMonthlyPerformance] = useState(sampleMonthlyPerformance);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalProfit: 19500,
    winRate: 63,
    totalTrades: 111,
    profitFactor: 2.3,
    averageWin: 2350,
    averageLoss: 1050,
    maxDrawdown: 3800
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // In a real app, fetch analytics data from API
        // const response = await axios.get('/api/analytics', {
        //   params: { timeframe }
        // });
        // setPerformanceData(response.data.performanceData);
        // setSegmentData(response.data.segmentData);
        // setStrategyData(response.data.strategyData);
        // setTimeframeData(response.data.timeframeData);
        // setMonthlyPerformance(response.data.monthlyPerformance);
        // setStats(response.data.stats);

        // Simulate API call with timeout
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load analytics data');
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
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

  // Chart tooltip formatters
  const profitTooltipFormatter = (value: number) => [formatCurrency(value), 'Profit/Loss'];
  const percentTooltipFormatter = (value: number) => [`${value}%`, 'Value'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Trading Analytics</h1>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <FiTrendingUp className="h-6 w-6 text-white" />
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

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <FiPieChart className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Profit Factor</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {isLoading ? '---' : stats.profitFactor.toFixed(2)}
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
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <FiTrendingDown className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Max Drawdown</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {isLoading ? '---' : formatCurrency(stats.maxDrawdown)}
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
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Profit/Loss Over Time</h3>
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
                  data={performanceData}
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
                  <Tooltip formatter={profitTooltipFormatter} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    name="Profit/Loss"
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

      {/* Monthly Performance */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Monthly Performance</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="h-80">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyPerformance}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={profitTooltipFormatter} />
                  <Bar
                    dataKey="profit"
                    name="Profit/Loss"
                    fill="#6366F1"
                  >
                    {monthlyPerformance.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.profit >= 0 ? '#4ADE80' : '#F87171'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Segment Distribution */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Segment Distribution</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="h-64">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={segmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {segmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={percentTooltipFormatter} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Strategy Distribution */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Strategy Distribution</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="h-64">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={strategyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {strategyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={percentTooltipFormatter} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Timeframe Distribution */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Timeframe Distribution</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="h-64">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={timeframeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {timeframeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={percentTooltipFormatter} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Additional Metrics</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Total Trades</h4>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {isLoading ? '---' : stats.totalTrades}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Average Win</h4>
              <p className="mt-1 text-2xl font-semibold text-green-600">
                {isLoading ? '---' : formatCurrency(stats.averageWin)}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Average Loss</h4>
              <p className="mt-1 text-2xl font-semibold text-red-600">
                {isLoading ? '---' : formatCurrency(stats.averageLoss)}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Profit Factor</h4>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {isLoading ? '---' : stats.profitFactor.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">(Total profit / Total loss)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
