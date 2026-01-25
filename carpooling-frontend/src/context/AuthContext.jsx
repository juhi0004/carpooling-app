import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await auth.getProfile();
          setUser(response.user);
        } catch (err) {
          setToken(null);
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const register = async (data) => {
    try {
      setError(null);
      const response = await auth.register(data);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('authToken', response.token);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await auth.login({ email, password });
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('authToken', response.token);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
      setToken(null);
      setUser(null);
      localStorage.removeItem('authToken');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateProfile = async (data) => {
    try {
      setError(null);
      const response = await auth.updateProfile(data);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      register,
      login,
      logout,
      updateProfile,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};
