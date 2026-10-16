import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('aegis_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('aegis_access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data.user);
          localStorage.setItem('aegis_user', JSON.stringify(res.data.data.user));
        } catch (error) {
          console.error('Session expired or invalid', error);
          setUser(null);
          setToken(null);
          localStorage.removeItem('aegis_user');
          localStorage.removeItem('aegis_access_token');
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, accessToken } = res.data.data;

    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('aegis_user', JSON.stringify(userData));
    localStorage.setItem('aegis_access_token', accessToken);
    return userData;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore network errors on logout
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('aegis_user');
    localStorage.removeItem('aegis_access_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isSuperadmin: user?.role === 'SUPERADMIN',
        isAdmin: user?.role === 'ADMIN',
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
