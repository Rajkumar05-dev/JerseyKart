import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist(null);
      setWishlistCount(0);
      return;
    }
    try {
      console.log('Fetching wishlist from /api/wishlist...');
      const { data } = await api.get('/api/wishlist');
      console.log('Wishlist loaded successfully:', data);
      setWishlist(data);
      setWishlistCount(data?.products?.length || 0);
    } catch (err) {
      console.error('Error fetching wishlist from server:', err.response || err);
      setWishlist(null);
      setWishlistCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const isInWishlist = useCallback((productId) => {
    if (!wishlist || !wishlist.products) return false;
    return wishlist.products.some((product) => product.id === productId);
  }, [wishlist]);

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) return { success: false, message: 'Please login first' };
    setLoading(true);
    try {
      const inWishlist = isInWishlist(productId);
      let response;
      if (inWishlist) {
        console.log(`Removing product ${productId} from wishlist...`);
        response = await api.delete(`/api/wishlist/remove/${productId}`);
      } else {
        console.log(`Adding product ${productId} to wishlist...`);
        response = await api.post(`/api/wishlist/add/${productId}`);
      }
      console.log('Wishlist updated successfully:', response.data);
      setWishlist(response.data);
      setWishlistCount(response.data?.products?.length || 0);
      return { success: true, added: !inWishlist };
    } catch (err) {
      console.error('Error toggling wishlist:', err.response || err);
      const msg = err.response?.data?.message || err.response?.data || 'Failed to update wishlist';
      return { success: false, message: typeof msg === 'string' ? msg : 'Failed to update wishlist' };
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      console.log(`Removing product ${productId} from wishlist page...`);
      const { data } = await api.delete(`/api/wishlist/remove/${productId}`);
      console.log('Product removed successfully:', data);
      setWishlist(data);
      setWishlistCount(data?.products?.length || 0);
      return { success: true };
    } catch (err) {
      console.error('Error removing from wishlist page:', err.response || err);
      return { success: false };
    }
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, wishlistCount, loading, isInWishlist, toggleWishlist, removeFromWishlist, refreshWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
