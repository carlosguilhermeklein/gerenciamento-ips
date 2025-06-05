import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Network, 
  LayoutDashboard, 
  Layers, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'IP Ranges', href: '/ip-ranges', icon: Layers },
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Network className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">IP Manager</span>
          </div>
          <button
            className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={closeSidebar}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                onClick={closeSidebar}
              >
                <item.icon
                  className={`mr-3 h-6 w-6 ${
                    isActive ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
          
          <button
            onClick={handleLogout}
            className="w-full group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            <LogOut className="mr-3 h-6 w-6 text-gray-500 dark:text-gray-400" />
            Logout
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white dark:bg-gray-800 shadow-lg">
            <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
              <Network className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">IP Manager</span>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 ${
                          isActive ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
                
                <button
                  onClick={handleLogout}
                  className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  <LogOut className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
                  Logout
                </button>
              </nav>
              
              {/* User info */}
              <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-blue-800 dark:text-blue-200 font-medium text-sm">
                        {user?.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 shadow-sm bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button
            className="p-2 rounded-md text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;