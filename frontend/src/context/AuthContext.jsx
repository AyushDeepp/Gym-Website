import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../utils/api';

const AuthContext = createContext(null);

// Custom hook - must be exported as a named export for Fast Refresh
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Component - must be exported as a named export for Fast Refresh
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.getCurrentUser();
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.loginUser({ email, password });
      const { token, ...userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const response = await api.registerUser({ name, email, password, phone });
      const { token, ...userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const googleLogin = async (googleData) => {
    try {
      const response = await api.googleAuth(googleData);
      const { token, ...userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Google login failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Navigation will be handled by components that call logout
    // Using window.location as fallback
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isMember: user?.role === 'member',
    isVisitor: user?.role === 'visitor',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

