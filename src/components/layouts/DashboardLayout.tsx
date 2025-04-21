import { useNavigate, Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiHome, FiTrendingUp, FiBarChart2, FiShoppingBag, FiSettings, FiUsers, FiLogOut, FiActivity, FiServer, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

interface DashboardLayoutProps {
  isAdmin?: boolean;
}

const DashboardLayout = ({ isAdmin = false }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  // Get the first character of the username instead of name
  const getUserInitial = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';  // Default to 'U' for User
  };

  // Navigation items depend on isAdmin
  const userNavLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { href: '/signals', label: 'Signals', icon: <FiTrendingUp /> },
    { href: '/orders', label: 'Orders', icon: <FiShoppingBag /> },
    { href: '/analytics', label: 'Analytics', icon: <FiBarChart2 /> },
    { href: '/settings', label: 'Settings', icon: <FiSettings /> },
  ];

  const adminNavLinks = [
    { href: '/admin', label: 'Admin Dashboard', icon: <FiHome /> },
    { href: '/admin/users', label: 'Users', icon: <FiUsers /> },
    { href: '/admin/system', label: 'System Status', icon: <FiServer /> },
  ];

  const navigationItems = isAdmin ? adminNavLinks : userNavLinks;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-indigo-600 transition-transform duration-300 ease-in-out md:translate-x-0 md:static`}
      >
        <div className="flex h-20 items-center justify-center">
          <h1 className="text-xl font-bold text-white">Smart F&O Trade</h1>
        </div>
        <nav className="mt-5 px-2">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                      isActive
                        ? 'bg-indigo-700 text-white'
                        : 'text-indigo-100 hover:bg-indigo-500 hover:text-white'
                    }`
                  }
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center rounded-md bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800"
          >
            <FiLogOut className="mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white shadow">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 focus:outline-none md:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            <div className="flex items-center">
              <div className="relative">
                <div className="flex items-center">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-medium text-white">
                    {getUserInitial()}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-800">{user?.username || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.role || 'user'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
