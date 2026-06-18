import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await authAPI.getMe();
          if (response.data && response.data.success) {
            const userData = response.data.data;
            // Normalize ID
            userData.id = userData._id;
            setUser(userData);
          } else {
            handleLogout();
          }
        } catch (error) {
          console.error('Session verification failed:', error);
          handleLogout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const handleLogin = (userToken, userData) => {
    const normalizedUser = {
      ...userData,
      id: userData.id || userData._id,
      _id: userData._id || userData.id,
    };
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setToken(userToken);
    setUser(normalizedUser);
  };

  const handleLogout = async () => {
    try {
      if (token) {
        await authAPI.logout();
      }
    } catch (err) {
      console.warn('Logout API failed but cleaning local session anyway:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  const updateUserInfo = (updatedUser) => {
    const normalizedUser = {
      ...updatedUser,
      id: updatedUser.id || updatedUser._id,
      _id: updatedUser._id || updatedUser.id,
    };
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login: handleLogin,
        logout: handleLogout,
        updateUserInfo,
        isSuperAdmin: user?.role === 'super_admin',
        isTeacher: user?.role === 'teacher',
        isStudent: user?.role === 'student',
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
