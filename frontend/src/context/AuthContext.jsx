import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, getMeApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const storedAdmin = localStorage.getItem('admin');
    return storedAdmin ? JSON.parse(storedAdmin) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const res = await getMeApi();
          if (res.success && res.data?.admin) {
            setAdmin(res.data.admin);
            localStorage.setItem('admin', JSON.stringify(res.data.admin));
          }
        } catch (error) {
          console.error('Session verification failed:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (email, password) => {
    const response = await loginApi(email, password);
    if (response.success && response.data?.token) {
      const jwtToken = response.data.token;
      const adminData = response.data.admin;

      localStorage.setItem('token', jwtToken);
      localStorage.setItem('admin', JSON.stringify(adminData));

      setToken(jwtToken);
      setAdmin(adminData);
      return response;
    } else {
      throw new Error(response.message || 'فشل تسجيل الدخول');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
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
