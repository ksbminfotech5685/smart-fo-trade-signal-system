import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiAlertCircle, FiEdit, FiTrash2, FiCheck, FiX, FiPlus } from 'react-icons/fi';
import axios from 'axios';

// Sample users data
const sampleUsers = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    role: 'user',
    createdAt: '2023-04-12T09:30:00Z',
    status: 'active',
    subscription: 'premium',
    autoTrading: true
  },
  {
    id: '2',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    role: 'user',
    createdAt: '2023-05-18T14:20:00Z',
    status: 'active',
    subscription: 'basic',
    autoTrading: false
  },
  {
    id: '3',
    name: 'Amit Kumar',
    email: 'amit.kumar@example.com',
    role: 'admin',
    createdAt: '2023-01-05T11:15:00Z',
    status: 'active',
    subscription: 'premium',
    autoTrading: true
  },
  {
    id: '4',
    name: 'Neha Gupta',
    email: 'neha.gupta@example.com',
    role: 'user',
    createdAt: '2023-06-24T16:45:00Z',
    status: 'inactive',
    subscription: 'premium',
    autoTrading: false
  },
  {
    id: '5',
    name: 'Vijay Singh',
    email: 'vijay.singh@example.com',
    role: 'user',
    createdAt: '2023-03-10T08:50:00Z',
    status: 'active',
    subscription: 'basic',
    autoTrading: true
  },
];

const UsersPage = () => {
  const [users, setUsers] = useState(sampleUsers);
  const [filteredUsers, setFilteredUsers] = useState(sampleUsers);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // In a real app, fetch users from API
        // const response = await axios.get('/api/admin/users');
        // setUsers(response.data.users);

        // Simulate API call with timeout
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load users');
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;

    if (searchTerm) {
      result = result.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole) {
      result = result.filter(user => user.role === selectedRole);
    }

    if (selectedStatus) {
      result = result.filter(user => user.status === selectedStatus);
    }

    if (selectedSubscription) {
      result = result.filter(user => user.subscription === selectedSubscription);
    }

    setFilteredUsers(result);
  }, [users, searchTerm, selectedRole, selectedStatus, selectedSubscription]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const handleEditUser = (user: any) => {
    setEditingUser({...user});
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    setIsLoading(true);

    try {
      // In a real app, delete user via API
      // await axios.delete(`/api/admin/users/${userId}`);

      // Simulate API call and update local state
      setTimeout(() => {
        setUsers(users.filter(user => user.id !== userId));
        setIsLoading(false);
      }, 500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user');
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real app, update user via API
      // await axios.put(`/api/admin/users/${editingUser.id}`, editingUser);

      // Simulate API call and update local state
      setTimeout(() => {
        setUsers(users.map(user =>
          user.id === editingUser.id ? editingUser : user
        ));
        setIsLoading(false);
        setIsModalOpen(false);
      }, 500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user');
      setIsLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser({
      id: '',
      name: '',
      email: '',
      role: 'user',
      status: 'active',
      subscription: 'basic',
      autoTrading: false
    });
    setIsModalOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRole(null);
    setSelectedStatus(null);
    setSelectedSubscription(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Users Management</h1>
        <button
          onClick={handleAddUser}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FiPlus className="mr-2 -ml-1 h-4 w-4" />
          Add User
        </button>
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
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <select
                className="block w-full py-2 pl-3 pr-10 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedRole || ''}
                onChange={(e) => setSelectedRole(e.target.value || null)}
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <select
                className="block w-full py-2 pl-3 pr-10 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedStatus || ''}
                onChange={(e) => setSelectedStatus(e.target.value || null)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <select
                className="block w-full py-2 pl-3 pr-10 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedSubscription || ''}
                onChange={(e) => setSelectedSubscription(e.target.value || null)}
              >
                <option value="">All Subscriptions</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
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

      {/* Users Table */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Auto Trading
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
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
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200" />
                          <div className="ml-4">
                            <div className="h-4 bg-gray-200 rounded w-32" />
                            <div className="h-3 bg-gray-200 rounded w-24 mt-2" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-12" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-24" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="h-4 bg-gray-200 rounded w-16 ml-auto" />
                      </td>
                    </tr>
                  ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                    No users found matching the current filters
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                          {user.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.subscription === 'premium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.subscription}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.autoTrading ? (
                        <span className="text-green-500 flex items-center">
                          <FiCheck className="mr-1" /> Enabled
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center">
                          <FiX className="mr-1" /> Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <FiEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add User Modal */}
      {isModalOpen && editingUser && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleUpdateUser}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {editingUser.id ? 'Edit User' : 'Add New User'}
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            value={editingUser.name}
                            onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            value={editingUser.email}
                            onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                              Role
                            </label>
                            <select
                              id="role"
                              name="role"
                              value={editingUser.role}
                              onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                              Status
                            </label>
                            <select
                              id="status"
                              name="status"
                              value={editingUser.status}
                              onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="subscription" className="block text-sm font-medium text-gray-700">
                              Subscription
                            </label>
                            <select
                              id="subscription"
                              name="subscription"
                              value={editingUser.subscription}
                              onChange={(e) => setEditingUser({...editingUser, subscription: e.target.value})}
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="basic">Basic</option>
                              <option value="premium">Premium</option>
                            </select>
                          </div>
                          <div className="flex items-center mt-6">
                            <input
                              id="autoTrading"
                              name="autoTrading"
                              type="checkbox"
                              checked={editingUser.autoTrading}
                              onChange={(e) => setEditingUser({...editingUser, autoTrading: e.target.checked})}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="autoTrading" className="ml-2 block text-sm text-gray-900">
                              Enable Auto Trading
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isLoading ? 'Saving...' : (editingUser.id ? 'Update' : 'Add')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
