import { useEffect, useState } from 'react';
import { useIPStore, IPStatus } from '../stores/ipStore';
import { Link } from 'react-router-dom';
import { 
  Network, 
  HardDrive, 
  Wifi, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileDown
} from 'lucide-react';

const Dashboard = () => {
  const { ranges, categories, fetchRanges, fetchCategories, exportData } = useIPStore();
  const [stats, setStats] = useState({
    totalIPs: 0,
    available: 0,
    occupied: 0,
    reserved: 0,
    categoryStats: {} as Record<string, number>
  });

  useEffect(() => {
    fetchRanges();
    fetchCategories();
  }, [fetchRanges, fetchCategories]);

  useEffect(() => {
    if (ranges.length > 0 && categories.length > 0) {
      calculateStats();
    }
  }, [ranges, categories]);

  const calculateStats = () => {
    const newStats = {
      totalIPs: 0,
      available: 0,
      occupied: 0,
      reserved: 0,
      categoryStats: {} as Record<string, number>
    };

    // Initialize category stats
    categories.forEach(category => {
      newStats.categoryStats[category.id] = 0;
    });

    // Calculate stats
    ranges.forEach(range => {
      range.addresses.forEach(address => {
        newStats.totalIPs++;
        
        // Status stats
        if (address.status === 'available') {
          newStats.available++;
        } else if (address.status === 'occupied') {
          newStats.occupied++;
        } else if (address.status === 'reserved') {
          newStats.reserved++;
        }

        // Category stats
        if (address.category && newStats.categoryStats[address.category] !== undefined) {
          newStats.categoryStats[address.category]++;
        }
      });
    });

    setStats(newStats);
  };

  const getStatusColor = (status: IPStatus) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'occupied':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'reserved':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => exportData('json')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export JSON
          </button>
          <button
            onClick={() => exportData('csv')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Network className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total IP Addresses
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.totalIPs}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Available
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.available}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HardDrive className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Occupied
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.occupied}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Reserved
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.reserved}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IP Ranges Summary */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            IP Ranges
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Overview of your IP ranges and their status
          </p>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          {ranges.length === 0 ? (
            <div className="text-center py-10">
              <Wifi className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No IP ranges</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating a new IP range.
              </p>
              <div className="mt-6">
                <Link
                  to="/ip-ranges"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Network className="h-5 w-5 mr-2" />
                  Add IP Range
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {ranges.map((range) => {
                // Calculate range stats
                const totalIPs = range.addresses.length;
                const availableIPs = range.addresses.filter(addr => addr.status === 'available').length;
                const occupiedIPs = range.addresses.filter(addr => addr.status === 'occupied').length;
                const reservedIPs = range.addresses.filter(addr => addr.status === 'reserved').length;
                
                // Calculate percentage
                const availablePercentage = totalIPs > 0 ? (availableIPs / totalIPs) * 100 : 0;
                
                return (
                  <Link
                    key={range.id}
                    to={`/ip-ranges/${range.id}`}
                    className="block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-md p-3">
                          <Network className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                            {range.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {range.network}/{range.subnet}
                          </p>
                        </div>
                        {range.isDhcp && (
                          <div className="ml-4 flex-shrink-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              DHCP
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                          <span>Available: {availableIPs}/{totalIPs}</span>
                          <span>{availablePercentage.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className="bg-green-500 h-2.5 rounded-full"
                            style={{ width: `${availablePercentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex space-x-2">
                        <div className={`px-2 py-1 text-xs rounded-full ${getStatusColor('available')}`}>
                          {availableIPs} Available
                        </div>
                        <div className={`px-2 py-1 text-xs rounded-full ${getStatusColor('occupied')}`}>
                          {occupiedIPs} Occupied
                        </div>
                        <div className={`px-2 py-1 text-xs rounded-full ${getStatusColor('reserved')}`}>
                          {reservedIPs} Reserved
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Category Stats */}
      {categories.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Categories
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Distribution of IP addresses by category
            </p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(stats.categoryStats).map(([categoryId, count]) => {
                const category = getCategoryById(categoryId);
                if (!category) return null;
                
                return (
                  <div key={categoryId} className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 border-l-4" style={{ borderLeftColor: category.color }}>
                    <div className="flex items-center">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </h4>
                        <p className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
                          {count}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: category.color + '33' }}>
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }}></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;