import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, passengerApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Sync state on initial load
  useEffect(() => {
    const verifyUserSession = async () => {
      if (token) {
        try {
          const res = await authApi.getProfile();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUserSession();
  }, [token]);

  // Fetch unread notifications count when user is logged in
  const refreshNotificationsCount = async () => {
    if (token) {
      try {
        const res = await passengerApi.getNotifications();
        if (res.success) {
          setUnreadNotifications(res.unreadCount || 0);
        }
      } catch (err) {
        // Quietly fail
      }
    }
  };

  useEffect(() => {
    if (user && token) {
      refreshNotificationsCount();
    } else {
      setUnreadNotifications(0);
    }
  }, [user, token]);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authApi.register(userData);
    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setUnreadNotifications(0);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateUser,
        unreadNotifications,
        refreshNotificationsCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
