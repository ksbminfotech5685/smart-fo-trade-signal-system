import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiAlertCircle, FiArrowUp, FiArrowDown, FiCheckCircle, FiClock } from 'react-icons/fi';
import axios from 'axios';

// Sample signal data
const sampleSignals = [
  {
    id: '1',
    symbol: 'NIFTY 25Jul 24000 CE',
    type: 'BUY',
    entryPrice: 120.5,
    targetPrice: 145.0,
    stopLoss: 105.25,
    status: 'ACTIVE',
    probability: 75,
    createdAt: '2023-07-18T09:30:00Z',
    expiryDate: '2023-07-25T15:30:00Z',
  },
  {
    id: '2',
    symbol: 'RELIANCE 27Jul 2800 PE',
    type: 'SELL',
    entryPrice: 85.75,
    targetPrice: 65.50,
    stopLoss: 95.00,
    status: 'PENDING',
    probability: 68,
    createdAt: '2023-07-18T10:15:00Z',
    expiryDate: '2023-07-27T15:30:00Z',
  },
  {
    id: '3',
    symbol: 'HDFC 26Jul 1650 CE',
    type: 'BUY',
    entryPrice: 45.25,
    targetPrice: 60.00,
    stopLoss: 38.50,
    status: 'EXECUTED',
    probability: 72,
    createdAt: '2023-07-18T11:00:00Z',
    expiryDate: '2023-07-26T15:30:00Z',
  },
  {
    id: '4',
    symbol: 'INFY 28Jul 1600 PE',
    type: 'SELL',
    entryPrice: 52.30,
    targetPrice: 42.75,
    stopLoss: 57.50,
    status: 'ACTIVE',
    probability: 65,
    createdAt: '2023-07-18T12:30:00Z',
    expiryDate: '2023-07-28T15:30:00Z',
  },
  {
    id: '5',
    symbol: 'BANKNIFTY 26Jul 46000 CE',
    type: 'BUY',
    entryPrice: 210.25,
    targetPrice: 245.00,
    stopLoss: 190.50,
    status: 'TRIGGERED',
    probability: 70,
    createdAt: '2023-07-18T13:45:00Z',
    expiryDate: '2023-07-26T15:30:00Z',
  },
];

const SignalsPage = () => {
  const [signals, setSignals] = useState(sampleSignals);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSignals = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // In a real app, fetch signals from API
        // const response = await axios.get('/api/signals', {
        //   params: { status: selectedStatus, type: selectedType, search: searchTerm }
        // });
        // setSignals(response.data.signals);

        // Simulate API call with timeout and filtering
        setTimeout(() => {
          let filteredSignals = [...sampleSignals];

          if (searchTerm) {
            filteredSignals = filteredSignals.filter(signal =>
              signal.symbol.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }

          if (selectedStatus) {
            filteredSignals = filteredSignals.filter(signal =>
              signal.status === selectedStatus
            );
          }

          if (selectedType) {
            filteredSignals = filteredSignals.filter(signal =>
              signal.type === selectedType
            );
          }

          setSignals(filteredSignals);
          setIsLoading(false);
        }, 500);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load signals');
        setIsLoading(false);
      }
    };

    fetchSignals();
  }, [searchTerm, selectedStatus, selectedType]);

  const handleSignalClick = (signalId: string) => {
    navigate(`/signals/${signalId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price).replace('₹', '₹ ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            <FiCheckCircle className="mr-1 h-4 w-4" /> Active
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            <FiClock className="mr-1 h-4 w-4" /> Pending
          </span>
        );
      case 'EXECUTED':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            <FiCheckCircle className="mr-1 h-4 w-4" /> Executed
          </span>
        );
      case 'TRIGGERED':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
            <FiAlertCircle className="mr-1 h-4 w-4" /> Triggered
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
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Trading Signals</h1>
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
              placeholder="Search signals..."
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
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="EXECUTED">Executed</option>
                <option value="TRIGGERED">Triggered</option>
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

      {/* Signals Table */}
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
                  Probability
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Created
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
                        <div className="h-4 bg-gray-200 rounded w-16" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-24" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20" />
                      </td>
                    </tr>
                  ))
              ) : signals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500">
                    No signals found with the current filters
                  </td>
                </tr>
              ) : (
                signals.map((signal) => (
                  <tr
                    key={signal.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                    onClick={() => handleSignalClick(signal.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {signal.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        signal.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {signal.type === 'BUY' ? (
                          <FiArrowUp className="mr-1 h-3 w-3" />
                        ) : (
                          <FiArrowDown className="mr-1 h-3 w-3" />
                        )}
                        {signal.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPrice(signal.entryPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPrice(signal.targetPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPrice(signal.stopLoss)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              signal.probability >= 70 ? 'bg-green-500' :
                              signal.probability >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${signal.probability}%` }}
                          />
                        </div>
                        <span className="ml-2 text-xs text-gray-500">{signal.probability}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(signal.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(signal.status)}
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

export default SignalsPage;
