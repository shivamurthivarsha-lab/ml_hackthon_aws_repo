import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  // Load current user on initial mount
  useEffect(() => {
    async function initUser() {
      const token = getAuthToken();
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
          await refreshNotifications();
        } catch (err) {
          console.warn('Session expired or invalid, auto-logging into demo student');
          await switchRole('student');
        }
      } else {
        // Default to student for instant seamless demo
        await switchRole('student');
      }
      setLoading(false);
    }
    initUser();
  }, []);

  const refreshNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setUnreadNotifsCount(res.unread_count || 0);
    } catch (err) {
      // Ignore if not logged in
    }
  };

  const login = async (email, password) => {
    const res = await api.login(email, password);
    setAuthToken(res.token);
    setUser(res.user);
    await refreshNotifications();
    return res.user;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    setAuthToken(res.token);
    setUser(res.user);
    await refreshNotifications();
    return res.user;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const switchRole = async (role) => {
    try {
      setLoading(true);
      const res = await api.quickSwitch(role);
      setAuthToken(res.token);
      setUser(res.user);
      await refreshNotifications();
      return res.user;
    } catch (err) {
      console.error('Failed to quick-switch role:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        unreadNotifsCount,
        login,
        register,
        logout,
        switchRole,
        refreshNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
