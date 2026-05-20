import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveSession = (authData) => {
    localStorage.setItem('jwt', authData.token);
    localStorage.setItem('userEmail', authData.email);
    localStorage.setItem('userFirstName', authData.firstName || '');
    localStorage.setItem('userLastName', authData.lastName || '');
    localStorage.setItem('userRole', authData.role || 'USER');
    setUser({
      email: authData.email,
      firstName: authData.firstName || '',
      lastName: authData.lastName || '',
      role: authData.role || 'USER',
    });
  };

  const clearSession = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userLastName');
    localStorage.removeItem('userRole');
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      saveSession({ ...data, token });
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/signin', { email, password });
    if (!data.token) throw new Error('Invalid login response');
    saveSession(data);
    return data;
  };

  const register = async ({ firstName, lastName, email, password }) => {
    const { data } = await api.post('/auth/signup', {
      firstName,
      lastName,
      email,
      password,
    });
    if (!data.token) throw new Error('Invalid registration response');
    saveSession(data);
    return data;
  };

  const adminRegister = async ({ firstName, lastName, email, password }) => {
    const { data } = await api.post('/auth/admin/signup', {
      firstName,
      lastName,
      email,
      password,
    });
    if (!data.token) throw new Error('Invalid admin registration response');
    saveSession(data);
    return data;
  };

  const logout = () => clearSession();

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        adminRegister,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
