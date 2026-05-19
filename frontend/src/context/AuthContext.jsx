import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    const email = localStorage.getItem('userEmail');
    const firstName = localStorage.getItem('userFirstName');
    if (token && email) {
      setUser({ email, firstName: firstName || '' });
    }
    setLoading(false);
  }, []);

  const saveSession = (token, email, firstName = '') => {
    localStorage.setItem('jwt', token);
    localStorage.setItem('userEmail', email);
    if (firstName) localStorage.setItem('userFirstName', firstName);
    setUser({ email, firstName });
  };

  const clearSession = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFirstName');
    setUser(null);
  };

  const login = async (email, password) => {
    const { data: token } = await api.post('/auth/signin', { email, password });
    saveSession(token, email);
    return token;
  };

  const register = async ({ firstName, lastName, email, password }) => {
    const { data: token } = await api.post('/auth/signup', {
      firstName,
      lastName,
      email,
      password,
    });
    saveSession(token, email, firstName);
    return token;
  };

  const logout = () => clearSession();

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
