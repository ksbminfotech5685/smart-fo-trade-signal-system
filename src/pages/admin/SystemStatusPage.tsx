import { useState, useEffect } from 'react';
import { FiServer, FiDatabase, FiWifi, FiCpu, FiAlertCircle, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { adminAPI } from '../../services/api.service';
import toast from 'react-hot-toast';

interface SystemStatus {
  serverStatus: 'online' | 'offline' | 'error';
  databaseStatus: 'connected' | 'disconnected' | 'error';
  zerodhaApiStatus: 'connected' | 'disconnected' | 'error';
  telegramBotStatus: 'active' | 'inactive' | 'error';
  marketDataStatus: 'active' | 'inactive' | 'error';
  webSocketStatus: 'connected' | 'disconnected' | 'error';
  lastUpdated: string;
  activeUsers: number;
  systemLoad: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

const defaultStatus: SystemStatus = {
  serverStatus: 'online',
  databaseStatus: 'connected',
  zerodhaApiStatus: 'disconnected',
  telegramBotStatus: 'active',
  marketDataStatus: 'inactive',
  webSocketStatus: 'disconnected',
  lastUpdated: new Date().toISOString(),
  activeUsers: 0,
  systemLoad: {
    cpu: 0,
    memory: 0,
    disk: 0
  }
};

const SystemStatusPage = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(defaultStatus);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemStatus = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call the backend API
      // const response = await adminAPI.getSystemStatus();
      // setSystemStatus(response.data);

      // For now, we'll use simulated data
      setTimeout(() => {
        const mockStatus: SystemStatus = {
          serverStatus: 'online',
          databaseStatus: 'connected',
          zerodhaApiStatus: Math.random() > 0.3 ? 'connected' : 'disconnected',
          telegramBotStatus: 'active',
          marketDataStatus: Math.random() > 0.5 ? 'active' : 'inactive',
          webSocketStatus: Math.random() > 0.4 ? 'connected' : 'disconnected',
          lastUpdated: new Date().toISOString(),
          activeUsers: Math.floor(Math.random() * 10),
          systemLoad: {
            cpu: Math.floor(Math.random() * 80),
            memory: Math.floor(Math.random() * 70),
            disk: 45
          }
        };

        setSystemStatus(mockStatus);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error fetching system status:', err);
      setError('Failed to fetch system status. Please try again.');
      setIsLoading(false);
    }
  };

  const refreshMarketData = async () => {
    try {
      toast.loading('Refreshing market data...');
      // In a real implementation, this would call the backend API
      // await adminAPI.refreshMarketData();

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.dismiss();
      toast.success('Market data refreshed successfully');
      fetchSystemStatus();
    } catch (err) {
      toast.dismiss();
      toast.error('Failed to refresh market data');
    }
  };

  useEffect(() => {
    fetchSystemStatus();

    // Poll for status updates every 30 seconds
    const interval = setInterval(() => {
      fetchSystemStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    if (status === 'online' || status === 'connected' || status === 'active') {
      return <FiCheckCircle className="text-green-500 h-5 w-5" />;
    } else if (status === 'error') {
      return <FiAlertCircle className="text-red-500 h-5 w-5" />;
    } else {
      return <FiAlertCircle className="text-yellow-500 h-5 w-5" />;
    }
  };

  const getStatusClass = (status: string) => {
    if (status === 'online' || status === 'connected' || status === 'active') {
      return 'bg-green-100 text-green-800';
    } else if (status === 'error') {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">System Status</h1>
        <div className="flex space-x-2">
          <button
            onClick={fetchSystemStatus}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiRefreshCw className="mr-2 -ml-1 h-4 w-4" />
            Refresh Status
          </button>
          <button
            onClick={refreshMarketData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiRefreshCw className="mr-2 -ml-1 h-4 w-4" />
            Refresh Market Data
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
        </div>
      ) : error ? (
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
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Core Services</h3>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Server Status */}
                <div className="bg-white overflow-hidden shadow rounded-lg border">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                        <FiServer className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Server Status</dt>
                          <dd className="flex items-center mt-1">
                            {getStatusIcon(systemStatus.serverStatus)}
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(systemStatus.serverStatus)}`}>
                              {systemStatus.serverStatus.toUpperCase()}
                            </span>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Database Status */}
                <div className="bg-white overflow-hidden shadow rounded-lg border">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                        <FiDatabase className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Database Status</dt>
                          <dd className="flex items-center mt-1">
                            {getStatusIcon(systemStatus.databaseStatus)}
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(systemStatus.databaseStatus)}`}>
                              {systemStatus.databaseStatus.toUpperCase()}
                            </span>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WebSocket Status */}
                <div className="bg-white overflow-hidden shadow rounded-lg border">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                        <FiWifi className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">WebSocket Status</dt>
                          <dd className="flex items-center mt-1">
                            {getStatusIcon(systemStatus.webSocketStatus)}
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(systemStatus.webSocketStatus)}`}>
                              {systemStatus.webSocketStatus.toUpperCase()}
                            </span>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Integration Services</h3>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Zerodha API Status */}
                <div className="bg-white overflow-hidden shadow rounded-lg border">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                        <FiServer className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Zerodha API Status</dt>
                          <dd className="flex items-center mt-1">
                            {getStatusIcon(systemStatus.zerodhaApiStatus)}
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(systemStatus.zerodhaApiStatus)}`}>
                              {systemStatus.zerodhaApiStatus.toUpperCase()}
                            </span>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Telegram Bot Status */}
                <div className="bg-white overflow-hidden shadow rounded-lg border">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-cyan-500 rounded-md p-3">
                        <FiWifi className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Telegram Bot Status</dt>
                          <dd className="flex items-center mt-1">
                            {getStatusIcon(systemStatus.telegramBotStatus)}
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(systemStatus.telegramBotStatus)}`}>
                              {systemStatus.telegramBotStatus.toUpperCase()}
                            </span>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Market Data Status */}
                <div className="bg-white overflow-hidden shadow rounded-lg border">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                        <FiDatabase className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Market Data Status</dt>
                          <dd className="flex items-center mt-1">
                            {getStatusIcon(systemStatus.marketDataStatus)}
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(systemStatus.marketDataStatus)}`}>
                              {systemStatus.marketDataStatus.toUpperCase()}
                            </span>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">System Load</h3>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                {/* CPU Usage */}
                <div className="bg-white overflow-hidden shadow rounded-lg border">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                        <FiCpu className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">CPU Usage</dt>
                          <dd>
                            <div className="mt-1">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className={`h-2.5 rounded-full ${
                                      systemStatus.systemLoad.cpu > 80 ? 'bg-red-500' :
                                      systemStatus.systemLoad.cpu > 50 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${systemStatus.systemLoad.cpu}%` }}
                                  />
                                </div>
                                <span className="ml-2 text-sm text-gray-600">{systemStatus.systemLoad.cpu}%</span>
                              </div>
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Memory Usage */}
                <div className="bg-white overflow-hidden shadow rounded-lg border">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                        <FiServer className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Memory Usage</dt>
                          <dd>
                            <div className="mt-1">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className={`h-2.5 rounded-full ${
                                      systemStatus.systemLoad.memory > 80 ? 'bg-red-500' :
                                      systemStatus.systemLoad.memory > 50 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${systemStatus.systemLoad.memory}%` }}
                                  />
                                </div>
                                <span className="ml-2 text-sm text-gray-600">{systemStatus.systemLoad.memory}%</span>
                              </div>
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disk Usage */}
                <div className="bg-white overflow-hidden shadow rounded-lg border">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                        <FiDatabase className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Disk Usage</dt>
                          <dd>
                            <div className="mt-1">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className={`h-2.5 rounded-full ${
                                      systemStatus.systemLoad.disk > 80 ? 'bg-red-500' :
                                      systemStatus.systemLoad.disk > 50 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${systemStatus.systemLoad.disk}%` }}
                                  />
                                </div>
                                <span className="ml-2 text-sm text-gray-600">{systemStatus.systemLoad.disk}%</span>
                              </div>
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Additional Info</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    System information and statistics
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Last updated: {new Date(systemStatus.lastUpdated).toLocaleString()}
                </div>
              </div>
              <div className="mt-5 border-t border-gray-200">
                <dl className="divide-y divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Active Users</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{systemStatus.activeUsers}</dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Environment</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">Production</dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Server Time</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{new Date().toLocaleString()}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SystemStatusPage;
