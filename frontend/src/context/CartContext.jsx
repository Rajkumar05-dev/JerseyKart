import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      setCartCount(0);
      return;
    }
    try {
      const { data } = await api.get('/api/cart');
      setCart(data);
      setCartCount(data?.totalItem || 0);
    } catch {
      setCart(null);
      setCartCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, size = 'M', quantity = 1) => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/cart/add', { productId, size, quantity });
      setCart(data);
      setCartCount(data?.totalItem || 0);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to add to cart';
      return { success: false, message: typeof msg === 'string' ? msg : 'Failed to add to cart' };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId) => {
    const { data } = await api.delete(`/api/cart/item/${cartItemId}`);
    setCart(data);
    setCartCount(data?.totalItem || 0);
  };

  const updateCartItem = async (cartItemId, quantity) => {
    const { data } = await api.put(`/api/cart/item/${cartItemId}`, { quantity });
    setCart(data);
    setCartCount(data?.totalItem || 0);
  };

  return (
    <CartContext.Provider
      value={{ cart, cartCount, loading, addToCart, removeFromCart, updateCartItem, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
