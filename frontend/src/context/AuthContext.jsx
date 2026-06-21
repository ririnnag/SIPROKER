import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('siproker_token');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        // Check expiry
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser(decoded);
        } else {
          localStorage.removeItem('siproker_token');
        }
      } catch {
        localStorage.removeItem('siproker_token');
      }
    }
    setLoading(false);
  }, []);

  const login = (tokenData, userData) => {
    localStorage.setItem('siproker_token', tokenData);
    setToken(tokenData);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('siproker_token');
    setToken(null);
    setUser(null);
  };

  // Convenience role checks
  const isAdmin = user?.id_role === 1;
  const isEditor = user?.id_role === 2;
  const isViewer = user?.id_role === 3;
  const isAdminOrEditor = user?.id_role === 1 || user?.id_role === 2;

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, logout,
      isAdmin, isEditor, isViewer, isAdminOrEditor
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
