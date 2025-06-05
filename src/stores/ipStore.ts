import { create } from 'zustand';
import axios from 'axios';

export type IPStatus = 'available' | 'occupied' | 'reserved';

export type IPAddress = {
  ip: string;
  status: IPStatus;
  category: string;
  notes: string;
  updatedAt: string;
};

export type IPRange = {
  id: string;
  name: string;
  network: string;
  subnet: string;
  isDhcp: boolean;
  createdAt: string;
  addresses: IPAddress[];
};

export type Category = {
  id: string;
  name: string;
  color: string;
};

type IPState = {
  ranges: IPRange[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  selectedRange: IPRange | null;
  
  fetchRanges: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  addRange: (range: Omit<IPRange, 'id' | 'createdAt' | 'addresses'>) => Promise<void>;
  addAddress: (rangeId: string, address: Omit<IPAddress, 'updatedAt'>) => Promise<void>;
  updateAddress: (rangeId: string, ip: string, data: Partial<Omit<IPAddress, 'ip' | 'updatedAt'>>) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  exportData: (format: 'json' | 'csv') => Promise<void>;
  selectRange: (rangeId: string | null) => void;
};

const API_URL = 'http://localhost:3001/api';

export const useIPStore = create<IPState>((set, get) => ({
  ranges: [],
  categories: [],
  loading: false,
  error: null,
  selectedRange: null,
  
  fetchRanges: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/ip-ranges`);
      set({ ranges: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch IP ranges', 
        loading: false 
      });
    }
  },
  
  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/categories`);
      set({ categories: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch categories', 
        loading: false 
      });
    }
  },
  
  addRange: async (range) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/ip-ranges`, range);
      set((state) => ({ 
        ranges: [...state.ranges, response.data], 
        loading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add IP range', 
        loading: false 
      });
    }
  },
  
  addAddress: async (rangeId, address) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/ip-ranges/${rangeId}/addresses`, address);
      
      set((state) => {
        const ranges = [...state.ranges];
        const rangeIndex = ranges.findIndex(r => r.id === rangeId);
        
        if (rangeIndex !== -1) {
          ranges[rangeIndex] = {
            ...ranges[rangeIndex],
            addresses: [...ranges[rangeIndex].addresses, response.data]
          };
        }
        
        return { ranges, loading: false };
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add IP address', 
        loading: false 
      });
    }
  },
  
  updateAddress: async (rangeId, ip, data) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/ip-ranges/${rangeId}/addresses/${ip}`, data);
      
      set((state) => {
        const ranges = [...state.ranges];
        const rangeIndex = ranges.findIndex(r => r.id === rangeId);
        
        if (rangeIndex !== -1) {
          const addressIndex = ranges[rangeIndex].addresses.findIndex(a => a.ip === ip);
          
          if (addressIndex !== -1) {
            ranges[rangeIndex].addresses[addressIndex] = response.data;
          }
        }
        
        return { ranges, loading: false };
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update IP address', 
        loading: false 
      });
    }
  },
  
  addCategory: async (category) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/categories`, category);
      
      set((state) => ({ 
        categories: [...state.categories, response.data], 
        loading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add category', 
        loading: false 
      });
    }
  },
  
  exportData: async (format) => {
    try {
      if (format === 'json') {
        const response = await axios.get(`${API_URL}/export/json`);
        
        // Create a blob and download
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ip-ranges.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        // Use browser to download CSV
        window.open(`${API_URL}/export/csv`, '_blank');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : `Failed to export data as ${format}`, 
      });
    }
  },
  
  selectRange: (rangeId) => {
    if (!rangeId) {
      set({ selectedRange: null });
      return;
    }
    
    const { ranges } = get();
    const range = ranges.find(r => r.id === rangeId);
    
    if (range) {
      set({ selectedRange: range });
    }
  }
}));