import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiAlertCircle, FiArrowUp, FiArrowDown, FiCheckCircle, FiClock, FiX } from 'react-icons/fi';
import axios from 'axios';

// Sample orders data
const sampleOrders = [
  {
    id: '1',
    symbol: 'NIFTY 25Jul 24000 CE',
    type: 'BUY',
    quantity: 50,
    price: 120.5,
    status: 'EXECUTED',
    orderTime: '2023-07-18T09:35:00Z',
    executionTime: '2023-07-18T09:35:02Z',
    signalId: '1',
    pnl: 485.0,
    pnlPercentage: 8.02
  },
  {
    id: '2',
    symbol: 'RELIANCE 27Jul 2800 PE',
    type: 'SELL',
    quantity: 25,
    price: 85.75,
    status: 'PENDING',
    orderTime: '2023-07-18T10:20:00Z',
    executionTime: null,
    signalId: '2',
    pnl: 0,
    pnlPercentage: 0
  },
  {
    id: '3',
    symbol: 'HDFC 26Jul 1650 CE',
    type: 'BUY',
    quantity: 30,
    price: 45.25,
    status: 'EXECUTED',
    orderTime: '2023-07-18T11:05:00Z',
    executionTime: '2023-07-18T11:05:01Z',
    signalId: '3',
    pnl: 315.0,
    pnlPercentage: 23.2
  },
  {
    id: '4',
    symbol: 'INFY 28Jul 1600 PE',
    type: 'SELL',
    quantity: 40,
    price: 52.30,
    status: 'REJECTED',
    orderTime: '2023-07-18T12:35:00Z',
    executionTime: null,
    signalId: '4',
    pnl: 0,
    pnlPercentage: 0
  },
  {
    id: '5',
    symbol: 'BANKNIFTY 26Jul 46000 CE',
    type: 'BUY',
    quantity: 20,
    price: 210.25,
    status: 'CANCELLED',
    orderTime: '2023-07-18T13:50:00Z',
    executionTime: null,
    signalId: '5',
    pnl: 0,
    pnlPercentage: 0
  },
];

const OrdersPage = () => {
  const [orders, setOrders] = useState(sampleOrders);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // In a real app, fetch orders from API
        // const response = await axios.get('/api/orders', {
        //   params: {
        //     status: selectedStatus,
        //     type: selectedType,
        //     search: searchTerm,
        //     startDate: dateRange.start,
        //     endDate: dateRange.end
        //   }
        // });
        // setOrders(response.data.orders);

        // Simulate API call with timeout and filtering
        setTimeout(() => {
          let filteredOrders = [...sampleOrders];

          if (searchTerm) {
            filteredOrders = filteredOrders.filter(order =>
              order.symbol.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }

          if (selectedStatus) {
            filteredOrders = filteredOrders.filter(order =>
              order.status === selectedStatus
            );
          }

          if (selectedType) {
            filteredOrders = filteredOrders.filter(order =>
              order.type === selectedType
            );
          }

          // Filter by date (TODO: implement in a real app)

          setOrders(filteredOrders);
          setIsLoading(false);
        }, 500);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load orders');
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [searchTerm, selectedStatus, selectedType, dateRange]);

  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price).replace('₹', '₹ ');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'EXECUTED':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            <FiCheckCircle className="mr-1 h-4 w-4" /> Executed
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            <FiClock className="mr-1 h-4 w-4" /> Pending
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            <FiX className="mr-1 h-4 w-4" /> Cancelled
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            <FiX className="mr-1 h-4 w-4" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus(null);
    setSelectedType(null);
    setDateRange({ start: '', end: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <label htmlFor="status-filter" className="sr-only">
                Filter by status
              </label>
              <select
                id="status-filter"
                className="block w-full py-2 pl-3 pr-10 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedStatus || ''}
                onChange={(e) => setSelectedStatus(e.target.value || null)}
              >
                <option value="">All Statuses</option>
                <option value="EXECUTED">Executed</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div>
              <label htmlFor="type-filter" className="sr-only">
                Filter by type
              </label>
              <select
                id="type-filter"
                className="block w-full py-2 pl-3 pr-10 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedType || ''}
                onChange={(e) => setSelectedType(e.target.value || null)}
              >
                <option value="">All Types</option>
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </select>
            </div>

            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
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

      {/* Orders Table */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
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
                  Quantity
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  P&L
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Order Time
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
                Array(5)
                  .fill(0)
                  .map((_, idx) => (
                    <tr key={`skeleton-${idx}`} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-32" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-12" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-24" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20" />
                      </td>
                    </tr>
                  ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                    No orders found with the current filters
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {order.type === 'BUY' ? (
                          <FiArrowUp className="mr-1 h-3 w-3" />
                        ) : (
                          <FiArrowDown className="mr-1 h-3 w-3" />
                        )}
                        {order.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(order.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.status === 'EXECUTED' ? (
                        <span className={`text-sm font-medium ${order.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(order.pnl)} ({order.pnl >= 0 ? '+' : ''}{order.pnlPercentage.toFixed(2)}%)
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.orderTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
