import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial check on mount
    const storedToken = localStorage.getItem('prepmate-token');
    const storedUser = localStorage.getItem('prepmate-user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // Clear corrupt data
        localStorage.removeItem('prepmate-token');
        localStorage.removeItem('prepmate-user');
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken, userData) => {
    localStorage.setItem('prepmate-token', newToken);
    localStorage.setItem('prepmate-user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('prepmate-token');
    localStorage.removeItem('prepmate-user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated }}>
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
