import React, { useEffect, useState } from 'react';
import { useIPStore } from '../stores/ipStore';
import { 
  Plus, 
  Trash, 
  PaintBucket
} from 'lucide-react';

const Settings = () => {
  const { categories, fetchCategories, addCategory } = useIPStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#3B82F6'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const newErrors: Record<string, string> = {};
    
    if (!newCategory.name.trim()) {
      newErrors.name = 'Category name is required';
    }
    
    if (!newCategory.color) {
      newErrors.color = 'Color is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    await addCategory(newCategory);
    setShowAddModal(false);
    setNewCategory({
      name: '',
      color: '#3B82F6'
    });
    setErrors({});
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      {/* Categories */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              IP Categories
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Manage categories for grouping IP addresses
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </button>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 border-l-4"
                style={{ borderLeftColor: category.color }}
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                  </div>
                  <div 
                    className="w-8 h-8 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddCategory}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 sm:mx-0 sm:h-10 sm:w-10">
                      <PaintBucket className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Add New Category
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Category Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                              errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                            placeholder="e.g., Servers"
                          />
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Color
                          </label>
                          <div className="mt-1 flex items-center">
                            <input
                              type="color"
                              id="color"
                              value={newCategory.color}
                              onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                              className="h-10 w-10 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                              {newCategory.color}
                            </span>
                          </div>
                          {errors.color && (
                            <p className="mt-1 text-sm text-red-600">{errors.color}</p>
                          )}
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
    </div>
  );
};

export default Settings;