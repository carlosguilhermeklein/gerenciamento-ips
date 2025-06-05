import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import { Moon, Sun } from 'lucide-react';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import IPRanges from './pages/IPRanges';
import IPDetail from './pages/IPDetail';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Components
import Layout from './components/Layout';

function App() {
  const { user, checkAuth } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        {/* Theme Toggle - Fixed position */}
        <button
          onClick={toggleTheme}
          className="fixed top-4 right-4 z-50 p-2 rounded-full bg-opacity-80 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          
          {/* Protected Routes */}
          <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<Dashboard />} />
            <Route path="ip-ranges" element={<IPRanges />} />
            <Route path="ip-ranges/:rangeId" element={<IPDetail />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;