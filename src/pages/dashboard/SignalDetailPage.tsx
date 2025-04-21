import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiAlertCircle, FiArrowUp, FiArrowDown, FiCheckCircle, FiClock, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { signalsAPI } from '../../services/api.service';
import type { Signal } from '../../types';
import axios from 'axios';

// Sample signal data
const sampleSignals = [
  {
    id: '1',
    symbol: 'NIFTY 25Jul 24000 CE',
    type: 'BUY',
    entryPrice: 120.5,
    currentPrice: 130.25,
    targetPrice: 145.0,
    stopLoss: 105.25,
    status: 'ACTIVE',
    probability: 75,
    createdAt: '2023-07-18T09:30:00Z',
    expiryDate: '2023-07-25T15:30:00Z',
    lotSize: 50,
    analysis: 'This call option is showing bullish momentum as the underlying index is breaking out of a consolidation pattern. The implied volatility is relatively low which makes this an attractive buy.',
    technicalIndicators: {
      rsi: 68,
      macd: 'Bullish Crossover',
      movingAverages: 'Above 20 EMA and 50 SMA',
      supportLevel: 23800,
      resistanceLevel: 24200
    },
    profitLoss: {
      potential: 12.25,
      potentialPercentage: 10.15,
      current: 9.75,
      currentPercentage: 8.09
    }
  },
  {
    id: '2',
    symbol: 'RELIANCE 27Jul 2800 PE',
    type: 'SELL',
    entryPrice: 85.75,
    currentPrice: 82.50,
    targetPrice: 65.50,
    stopLoss: 95.00,
    status: 'PENDING',
    probability: 68,
    createdAt: '2023-07-18T10:15:00Z',
    expiryDate: '2023-07-27T15:30:00Z',
    lotSize: 25,
    analysis: 'Reliance is showing signs of weakness after recent earnings. The stock is likely to face resistance at current levels with potential to move lower. The put option provides good risk-reward ratio.',
    technicalIndicators: {
      rsi: 42,
      macd: 'Bearish Divergence',
      movingAverages: 'Below 20 EMA',
      supportLevel: 2750,
      resistanceLevel: 2830
    },
    profitLoss: {
      potential: 20.25,
      potentialPercentage: 23.61,
      current: 3.25,
      currentPercentage: 3.79
    }
  },
  {
    id: '3',
    symbol: 'HDFC 26Jul 1650 CE',
    type: 'BUY',
    entryPrice: 45.25,
    currentPrice: 55.75,
    targetPrice: 60.00,
    stopLoss: 38.50,
    status: 'EXECUTED',
    probability: 72,
    createdAt: '2023-07-18T11:00:00Z',
    expiryDate: '2023-07-26T15:30:00Z',
    lotSize: 30,
    analysis: 'HDFC is showing strong momentum after breaking above a key resistance level. The banking sector as a whole is outperforming the broader market. This call option has good potential for further gains.',
    technicalIndicators: {
      rsi: 72,
      macd: 'Bullish Trend',
      movingAverages: 'Above all major MAs',
      supportLevel: 1635,
      resistanceLevel: 1680
    },
    profitLoss: {
      potential: 14.75,
      potentialPercentage: 32.60,
      current: 10.50,
      currentPercentage: 23.20
    }
  },
];

// Interface for the sample signal for the demo
interface SampleSignal {
  id: string;
  symbol: string;
  type: string;
  entryPrice: number;
  currentPrice: number;
  targetPrice: number;
  stopLoss: number;
  status: string;
  probability: number;
  createdAt: string;
  expiryDate: string;
  lotSize: number;
  analysis: string;
  technicalIndicators: {
    rsi: number;
    macd: string;
    movingAverages: string;
    supportLevel: number;
    resistanceLevel: number;
  };
  profitLoss: {
    potential: number;
    potentialPercentage: number;
    current: number;
    currentPercentage: number;
  };
}

// Type guard to check if signal is a sample signal
function isSampleSignal(signal: Signal | SampleSignal): signal is SampleSignal {
  return 'profitLoss' in signal && typeof (signal as SampleSignal).profitLoss === 'object';
}

// Extended Signal type with properties needed for the UI
interface ExtendedSignal extends Signal {
  symbol?: string;
  currentPrice?: number;
  status?: string;
}

// Helper function to check if type is BUY
function isBuyType(type: string): boolean {
  return type.toUpperCase() === 'BUY';
}

// Helper function to check if type is SELL
function isSellType(type: string): boolean {
  return type.toUpperCase() === 'SELL';
}

const SignalDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [signal, setSignal] = useState<Signal | SampleSignal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSignalDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // In a real app, fetch signal details from API
        // const response = await signalsAPI.getSignalById(id as string);
        // setSignal(response.data.data);

        // Simulate API call with timeout
        setTimeout(() => {
          const foundSignal = sampleSignals.find(s => s.id === id);

          if (foundSignal) {
            setSignal(foundSignal);
          } else {
            setError('Signal not found');
          }

          setIsLoading(false);
        }, 800);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || 'Failed to load signal details');
        } else {
          setError('An unexpected error occurred');
        }
        setIsLoading(false);
      }
    };

    if (id) {
      fetchSignalDetails();
    } else {
      setError('Signal ID not provided');
      setIsLoading(false);
    }
  }, [id]);

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price).replace('₹', '₹ ');
  };

  const formatPercentage = (percentage: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(percentage / 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            <FiCheckCircle className="mr-1 h-5 w-5" /> Active
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            <FiClock className="mr-1 h-5 w-5" /> Pending
          </span>
        );
      case 'EXECUTED':
        return (
          <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            <FiCheckCircle className="mr-1 h-5 w-5" /> Executed
          </span>
        );
      case 'TRIGGERED':
        return (
          <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
            <FiAlertCircle className="mr-1 h-5 w-5" /> Triggered
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const handleGoBack = () => {
    navigate('/signals');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error || !signal) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiAlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error || 'Signal not found'}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={handleGoBack}
              >
                <FiArrowLeft className="mr-2 -ml-1 h-4 w-4" />
                Back to Signals
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get current price based on signal type
  const getCurrentPrice = (signal: Signal | SampleSignal): number => {
    if (isSampleSignal(signal)) {
      return signal.currentPrice;
    }
    // For API signals, use a default value or calculate from another field
    return (signal as ExtendedSignal).currentPrice || 0;
  };

  // Get symbol based on signal type
  const getSymbol = (signal: Signal | SampleSignal): string => {
    if (isSampleSignal(signal)) {
      return signal.symbol;
    }
    // For API signals, combine stock and option information
    const apiSignal = signal as Signal;
    return (signal as ExtendedSignal).symbol || `${apiSignal.stock} ${apiSignal.option}`;
  };

  // Get status based on signal type
  const getStatus = (signal: Signal | SampleSignal): string => {
    if (isSampleSignal(signal)) {
      return signal.status;
    }
    // For API signals, use orderStatus or derive from other fields
    return (signal as ExtendedSignal).status ||
           ((signal as Signal).orderStatus ||
           ((signal as Signal).executedOrder ? 'EXECUTED' : 'PENDING'));
  };

  // Get creation date based on signal type
  const getCreatedAt = (signal: Signal | SampleSignal): string => {
    if (isSampleSignal(signal)) {
      return signal.createdAt;
    }
    return (signal as Signal).generatedAt;
  };

  // Calculate profit/loss for the active signal
  const currentPrice = getCurrentPrice(signal);
  const isProfitable = currentPrice > signal.entryPrice ?
    isBuyType(signal.type) :
    isSellType(signal.type);

  const priceDifference = Math.abs(currentPrice - signal.entryPrice);
  const percentageDifference = (priceDifference / signal.entryPrice) * 100;

  // Get profit/loss values
  let currentProfit = 0;
  let currentProfitPercentage = 0;
  let potentialProfit = 0;
  let potentialProfitPercentage = 0;

  if (isSampleSignal(signal)) {
    const sampleSignalData = signal;
    currentProfit = sampleSignalData.profitLoss.current;
    currentProfitPercentage = sampleSignalData.profitLoss.currentPercentage;
    potentialProfit = sampleSignalData.profitLoss.potential;
    potentialProfitPercentage = sampleSignalData.profitLoss.potentialPercentage;
  } else {
    // For live signals
    if (isBuyType(signal.type)) {
      currentProfit = currentPrice - signal.entryPrice;
      potentialProfit = signal.targetPrice - signal.entryPrice;
    } else {
      currentProfit = signal.entryPrice - currentPrice;
      potentialProfit = signal.entryPrice - signal.targetPrice;
    }
    currentProfitPercentage = (currentProfit / signal.entryPrice) * 100;
    potentialProfitPercentage = (potentialProfit / signal.entryPrice) * 100;
  }

  // Get the signal status
  const status = getStatus(signal);
  // Get the symbol
  const symbol = getSymbol(signal);
  // Get created date
  const createdAt = getCreatedAt(signal);

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          type="button"
          className="mr-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={handleGoBack}
        >
          <FiArrowLeft className="mr-2 -ml-1 h-4 w-4" />
          Back
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 flex-grow">Signal Details</h1>
        {getStatusBadge(status)}
      </div>

      {/* Signal Summary */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg leading-6 font-medium text-gray-900">{symbol}</h2>
            {isSampleSignal(signal) && (
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Expiry: {formatDate(signal.expiryDate)}
              </p>
            )}
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isBuyType(signal.type) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isBuyType(signal.type) ? (
              <FiArrowUp className="mr-1 h-4 w-4" />
            ) : (
              <FiArrowDown className="mr-1 h-4 w-4" />
            )}
            {signal.type}
          </span>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Entry Price</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatPrice(signal.entryPrice)}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Current Price</dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2 flex items-center">
                <span className={`font-medium ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPrice(currentPrice)}
                </span>
                <span className={`ml-2 inline-flex items-center text-sm ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                  {isProfitable ? (
                    <FiTrendingUp className="mr-1 h-4 w-4" />
                  ) : (
                    <FiTrendingDown className="mr-1 h-4 w-4" />
                  )}
                  {formatPrice(priceDifference)} ({formatPercentage(percentageDifference)})
                </span>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Target Price</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatPrice(signal.targetPrice)}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Stop Loss</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatPrice(signal.stopLoss)}</dd>
            </div>
            {isSampleSignal(signal) && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Success Probability</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="flex items-center">
                    <div className="w-48 bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          signal.probability >= 70 ? 'bg-green-500' :
                          signal.probability >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${signal.probability}%` }}
                      />
                    </div>
                    <span className="ml-2">{signal.probability}%</span>
                  </div>
                </dd>
              </div>
            )}
            {isSampleSignal(signal) && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Lot Size</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{signal.lotSize}</dd>
              </div>
            )}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(createdAt)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* P&L Analysis */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Profit & Loss Analysis</h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4">
            <div className="bg-white px-4 py-5">
              <h4 className="text-sm font-medium text-gray-500 mb-4">Current P&L</h4>
              <div className="flex items-center">
                <span className={`text-2xl font-bold ${
                  currentProfit > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {currentProfit > 0 ? '+' : ''}{formatPrice(currentProfit)}
                </span>
                <span className={`ml-2 text-sm ${
                  currentProfit > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ({currentProfit > 0 ? '+' : ''}{formatPercentage(currentProfitPercentage)})
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Based on current market price compared to entry price
              </p>
            </div>
            <div className="bg-gray-50 px-4 py-5">
              <h4 className="text-sm font-medium text-gray-500 mb-4">Potential P&L</h4>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-indigo-600">
                  +{formatPrice(potentialProfit)}
                </span>
                <span className="ml-2 text-sm text-indigo-600">
                  (+{formatPercentage(potentialProfitPercentage)})
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Based on target price compared to entry price
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis */}
      {isSampleSignal(signal) && (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Analysis</h3>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:px-6">
              <p className="text-sm text-gray-700">{signal.analysis}</p>
            </div>
          </div>
        </div>
      )}

      {/* Technical Indicators */}
      {isSampleSignal(signal) && (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Technical Indicators</h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">RSI</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="flex items-center">
                    <div className="w-48 bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          signal.technicalIndicators.rsi > 70 ? 'bg-red-500' :
                          signal.technicalIndicators.rsi < 30 ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${signal.technicalIndicators.rsi}%` }}
                      />
                    </div>
                    <span className="ml-2">{signal.technicalIndicators.rsi}</span>
                  </div>
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">MACD</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{signal.technicalIndicators.macd}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Moving Averages</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{signal.technicalIndicators.movingAverages}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Support Level</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{signal.technicalIndicators.supportLevel}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Resistance Level</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{signal.technicalIndicators.resistanceLevel}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignalDetailPage;
