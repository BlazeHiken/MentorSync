import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, fetchCurrentUser } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mentorsync_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('mentorsync_access_token');
    localStorage.removeItem('mentorsync_refresh_token');
    localStorage.removeItem('mentorsync_user');
    setUser(null);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('mentorsync_access_token');
      if (token) {
        try {
          const freshUserData = await fetchCurrentUser();
          const merged = {
            id: freshUserData.id,
            username: freshUserData.username,
            email: freshUserData.email,
            first_name: freshUserData.first_name,
            last_name: freshUserData.last_name,
            role: freshUserData.role,
            ...(freshUserData.profile || {}),
          };
          setUser(merged);
          localStorage.setItem('mentorsync_user', JSON.stringify(merged));
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    const handleAutoLogout = () => logout();
    window.addEventListener('auth:logout', handleAutoLogout);
    return () => window.removeEventListener('auth:logout', handleAutoLogout);
  }, [logout]);

  const login = async (username, password) => {
    const data = await loginUser(username, password);
    localStorage.setItem('mentorsync_access_token', data.access);
    localStorage.setItem('mentorsync_refresh_token', data.refresh);
    localStorage.setItem('mentorsync_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const getDashboardRoute = (role = user?.role) => {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'MENTOR':
        return '/mentor/dashboard';
      case 'STUDENT':
        return '/student/dashboard';
      default:
        return '/login';
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isMentor: user?.role === 'MENTOR',
    isStudent: user?.role === 'STUDENT',
    login,
    logout,
    getDashboardRoute,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
