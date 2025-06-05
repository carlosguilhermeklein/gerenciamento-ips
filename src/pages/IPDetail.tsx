import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useIPStore, IPStatus } from '../stores/ipStore';
import { 
  ArrowLeft, 
  Plus, 
  Filter, 
  Search, 
  X,
  HardDrive, 
  CheckCircle, 
  Clock,
  Tag
} from 'lucide-react';

const IPDetail = () => {
  const { rangeId } = useParams<{ rangeId: string }>();
  const { 
    ranges, 
    categories, 
    fetchRanges, 
    fetchCategories, 
    addAddress, 
    updateAddress, 
    selectRange, 
    selectedRange 
  } = useIPStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<IPStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    ip: '',
    status: 'available' as IPStatus,
    category: '',
    notes: ''
  });
  const [editAddress, setEditAddress] = useState({
    ip: '',
    status: 'available' as IPStatus,
    category: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchRanges();
    fetchCategories();
  }, [fetchRanges, fetchCategories]);

  useEffect(() => {
    if (rangeId && ranges.length > 0) {
      selectRange(rangeId);
    }
  }, [rangeId, ranges, selectRange]);

  if (!selectedRange) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading...</h2>
        </div>
      </div>
    );
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const newErrors: Record<string, string> = {};
    
    if (!newAddress.ip.trim()) {
      newErrors.ip = 'IP address is required';
    } else if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(newAddress.ip)) {
      newErrors.ip = 'Invalid IP format (e.g., 192.168.1.100)';
    } else if (selectedRange.addresses.some(addr => addr.ip === newAddress.ip)) {
      newErrors.ip = 'This IP address already exists in this range';
    }
    
    if (!newAddress.category) {
      newErrors.category = 'Category is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    await addAddress(selectedRange.id, newAddress);
    setShowAddModal(false);
    setNewAddress({
      ip: '',
      status: 'available',
      category: '',
      notes: ''
    });
    setErrors({});
  };

  const handleEditAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const newErrors: Record<string, string> = {};
    
    if (!editAddress.category) {
      newErrors.category = 'Category is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    await updateAddress(selectedRange.id, editAddress.ip, {
      status: editAddress.status,
      category: editAddress.category,
      notes: editAddress.notes
    });
    
    setShowEditModal(false);
    setErrors({});
  };

  const openEditModal = (address: {
    ip: string;
    status: IPStatus;
    category: string;
    notes: string;
  }) => {
    setEditAddress({
      ip: address.ip,
      status: address.status,
      category: address.category,
      notes: address.notes
    });
    setShowEditModal(true);
  };

  const getStatusIcon = (status: IPStatus) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'occupied':
        return <HardDrive className="h-4 w-4 text-red-500" />;
      case 'reserved':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
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

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : '#6B7280';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Other';
  };

  const filteredAddresses = selectedRange.addresses.filter(address => {
    const matchesSearch = searchTerm === '' || 
      address.ip.includes(searchTerm) || 
      address.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || address.status === statusFilter;
    
    const matchesCategory = categoryFilter === 'all' || address.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center">
        <Link 
          to="/ip-ranges"
          className="inline-flex items-center mr-4 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to IP Ranges
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedRange.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Network: {selectedRange.network}/{selectedRange.subnet}
            {selectedRange.isDhcp && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                DHCP
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-2 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add IP
        </button>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
            placeholder="Search IP or notes"
          />
          {searchTerm && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as IPStatus | 'all')}
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>

        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Tag className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* IP Addresses */}
      {filteredAddresses.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <HardDrive className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No IP addresses found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try different filter settings or'
                : 'Get started by'} adding a new IP address.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add IP
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Notes
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAddresses.map((address) => (
                  <tr 
                    key={address.ip} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => openEditModal(address)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {address.ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(address.status)}`}>
                        {getStatusIcon(address.status)}
                        <span className="ml-1 capitalize">{address.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <div className="h-2.5 w-2.5 rounded-full mr-2" style={{ backgroundColor: getCategoryColor(address.category) }}></div>
                        {getCategoryName(address.category)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {address.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(address.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add IP Address Modal */}
      {showAddModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddAddress}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 sm:mx-0 sm:h-10 sm:w-10">
                      <Plus className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Add New IP Address
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="ip" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            IP Address
                          </label>
                          <input
                            type="text"
                            id="ip"
                            value={newAddress.ip}
                            onChange={(e) => setNewAddress({ ...newAddress, ip: e.target.value })}
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                              errors.ip ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                            placeholder="e.g., 192.168.1.100"
                          />
                          {errors.ip && (
                            <p className="mt-1 text-sm text-red-600">{errors.ip}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Status
                          </label>
                          <select
                            id="status"
                            value={newAddress.status}
                            onChange={(e) => setNewAddress({ ...newAddress, status: e.target.value as IPStatus })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                          >
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                            <option value="reserved">Reserved</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Category
                          </label>
                          <select
                            id="category"
                            value={newAddress.category}
                            onChange={(e) => setNewAddress({ ...newAddress, category: e.target.value })}
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                              errors.category ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                          >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                          {errors.category && (
                            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Notes (Optional)
                          </label>
                          <textarea
                            id="notes"
                            rows={3}
                            value={newAddress.notes}
                            onChange={(e) => setNewAddress({ ...newAddress, notes: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            placeholder="Add any notes about this IP address"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setErrors({});
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit IP Address Modal */}
      {showEditModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleEditAddress}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 sm:mx-0 sm:h-10 sm:w-10">
                      <HardDrive className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Edit IP: {editAddress.ip}
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Status
                          </label>
                          <select
                            id="edit-status"
                            value={editAddress.status}
                            onChange={(e) => setEditAddress({ ...editAddress, status: e.target.value as IPStatus })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                          >
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                            <option value="reserved">Reserved</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Category
                          </label>
                          <select
                            id="edit-category"
                            value={editAddress.category}
                            onChange={(e) => setEditAddress({ ...editAddress, category: e.target.value })}
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                              errors.category ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                          >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                          {errors.category && (
                            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="edit-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Notes
                          </label>
                          <textarea
                            id="edit-notes"
                            rows={3}
                            value={editAddress.notes}
                            onChange={(e) => setEditAddress({ ...editAddress, notes: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            placeholder="Add any notes about this IP address"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setErrors({});
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
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

export default IPDetail;