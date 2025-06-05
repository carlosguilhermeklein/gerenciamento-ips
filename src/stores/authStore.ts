import { create } from 'zustand';
import axios from 'axios';
import Cookies from 'js-cookie';

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
};

const API_URL = 'http://localhost:3001/api';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  
  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const user = response.data;
      
      // Save user to cookie
      Cookies.set('user', JSON.stringify(user), { expires: 7 });
      
      set({ user, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to login', 
        loading: false 
      });
    }
  },
  
  register: async (name: string, email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      const user = response.data;
      
      // Save user to cookie
      Cookies.set('user', JSON.stringify(user), { expires: 7 });
      
      set({ user, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to register', 
        loading: false 
      });
    }
  },
  
  logout: () => {
    // Remove user from cookie
    Cookies.remove('user');
    
    set({ user: null });
  },
  
  checkAuth: () => {
    const userCookie = Cookies.get('user');
    
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie);
        set({ user });
      } catch (error) {
        // Invalid cookie
        Cookies.remove('user');
        set({ user: null });
      }
    }
  }
}));