import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { User, type ProfileUpdateData } from '../../types';
import axios from 'axios';

// Form data interface that matches expected fields in settings
interface FormData {
  username: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  zerodhaApiKey: string;
  zerodhaSecret: string;
  zerodhaAccessToken: string | boolean;
  isAutoTradingEnabled: boolean;
  maxTradesPerDay: number;
  maxCapitalPerTrade: number;
  preferredSegments: string[];
  riskLevel: string;
}

const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    zerodhaApiKey: '',
    zerodhaSecret: '',
    zerodhaAccessToken: false,
    isAutoTradingEnabled: false,
    maxTradesPerDay: 3,
    maxCapitalPerTrade: 5000,
    preferredSegments: ['FO', 'NIFTY', 'BANKNIFTY'],
    riskLevel: 'medium'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        username: user.username || '',
        email: user.email || '',
        zerodhaApiKey: user.zerodhaApiKey ? 'CONFIGURED' : '',
        zerodhaAccessToken: !!user.zerodhaAccessToken,
        isAutoTradingEnabled: user.isAutoTradingEnabled || false,
        maxTradesPerDay: user.maxTradesPerDay || 3,
        maxCapitalPerTrade: user.maxCapitalPerTrade || 5000,
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleSegment = (segment: string) => {
    setFormData(prevData => {
      const segments = [...prevData.preferredSegments];

      if (segments.includes(segment)) {
        return {
          ...prevData,
          preferredSegments: segments.filter(s => s !== segment)
        };
      }

      return {
        ...prevData,
        preferredSegments: [...segments, segment]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Prepare the update data
      const updateData: ProfileUpdateData = {
        username: formData.username,
        email: formData.email,
        maxTradesPerDay: formData.maxTradesPerDay,
        maxCapitalPerTrade: formData.maxCapitalPerTrade,
      };

      // Update profile
      await updateProfile(updateData);

      toast.success('Settings updated successfully');

      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to update settings');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your account details.</p>
          </div>
          <div className="px-4 py-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Password</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Change your password.</p>
          </div>
          <div className="px-4 py-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  id="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Trading Settings */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Trading Settings</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Configure your trading preferences.</p>
          </div>
          <div className="px-4 py-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="maxTradesPerDay" className="block text-sm font-medium text-gray-700">
                  Maximum Trades Per Day
                </label>
                <input
                  type="number"
                  name="maxTradesPerDay"
                  id="maxTradesPerDay"
                  min="1"
                  max="10"
                  value={formData.maxTradesPerDay}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="maxCapitalPerTrade" className="block text-sm font-medium text-gray-700">
                  Maximum Capital Per Trade (₹)
                </label>
                <input
                  type="number"
                  name="maxCapitalPerTrade"
                  id="maxCapitalPerTrade"
                  min="1000"
                  step="500"
                  value={formData.maxCapitalPerTrade}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Level
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <label className={`flex items-center p-3 border rounded-md cursor-pointer ${formData.riskLevel === 'low' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}>
                  <input
                    type="radio"
                    name="riskLevel"
                    value="low"
                    checked={formData.riskLevel === 'low'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span>Low Risk</span>
                </label>
                <label className={`flex items-center p-3 border rounded-md cursor-pointer ${formData.riskLevel === 'medium' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}>
                  <input
                    type="radio"
                    name="riskLevel"
                    value="medium"
                    checked={formData.riskLevel === 'medium'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span>Medium Risk</span>
                </label>
                <label className={`flex items-center p-3 border rounded-md cursor-pointer ${formData.riskLevel === 'high' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}>
                  <input
                    type="radio"
                    name="riskLevel"
                    value="high"
                    checked={formData.riskLevel === 'high'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span>High Risk</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Segments
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {['FO', 'NIFTY', 'BANKNIFTY', 'MIDCAP', 'FINNIFTY', 'SENSEX'].map((segment) => (
                  <div
                    key={segment}
                    onClick={() => toggleSegment(segment)}
                    className={`cursor-pointer p-2 border rounded-md text-center ${
                      formData.preferredSegments.includes(segment)
                        ? 'bg-indigo-100 border-indigo-500'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {segment}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isAutoTradingEnabled"
                  id="isAutoTradingEnabled"
                  checked={formData.isAutoTradingEnabled}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isAutoTradingEnabled" className="ml-2 block text-sm text-gray-900">
                  Enable Auto Trading
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                When enabled, signals will be automatically executed based on your trading settings.
              </p>
            </div>
          </div>
        </div>

        {/* Broker Settings */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Zerodha API Connection</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Connect your Zerodha account for automated trading.</p>
          </div>
          <div className="px-4 py-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="zerodhaApiKey" className="block text-sm font-medium text-gray-700">
                  API Key
                </label>
                <input
                  type="text"
                  name="zerodhaApiKey"
                  id="zerodhaApiKey"
                  value={formData.zerodhaApiKey}
                  onChange={handleInputChange}
                  placeholder={formData.zerodhaApiKey === 'CONFIGURED' ? '••••••••••••••••' : 'Enter your Zerodha API key'}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="zerodhaSecret" className="block text-sm font-medium text-gray-700">
                  API Secret
                </label>
                <input
                  type="password"
                  name="zerodhaSecret"
                  id="zerodhaSecret"
                  value={formData.zerodhaSecret}
                  onChange={handleInputChange}
                  placeholder="Enter your Zerodha API secret"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${formData.zerodhaAccessToken ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-700">
                {formData.zerodhaAccessToken ? 'Connected to Zerodha' : 'Not connected to Zerodha'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
