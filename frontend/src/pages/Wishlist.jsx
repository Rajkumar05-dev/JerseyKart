import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ShoppingCart, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUrl';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const Wishlist = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { wishlist, removeFromWishlist, loading: wishlistLoading } = useWishlist();
  const { addToCart } = useCart();
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [selectedSizes, setSelectedSizes] = useState({});

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">Loading auth status...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const products = wishlist?.products || [];

  const handleAddToCart = async (product) => {
    const productId = product.id;
    const size = selectedSizes[productId] || 'M';
    setAddingToCartId(productId);
    setFeedback((prev) => ({ ...prev, [productId]: '' }));

    const result = await addToCart(productId, size, 1);
    if (result.success) {
      setFeedback((prev) => ({ ...prev, [productId]: 'Added to cart!' }));
      // Automatically remove from wishlist after a short delay
      setTimeout(async () => {
        await removeFromWishlist(productId);
        setFeedback((prev) => ({ ...prev, [productId]: '' }));
      }, 1500);
    } else {
      setFeedback((prev) => ({ ...prev, [productId]: result.message || 'Could not add to cart' }));
    }
    setAddingToCartId(null);
  };

  const handleSizeChange = (productId, size) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold dark:text-white flex items-center gap-3">
            Your Wishlist <Heart className="text-primary fill-primary" size={32} />
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Jerseys you've saved for later. Keep track of what you love.
          </p>
        </div>
        {products.length > 0 && (
          <Link to="/products" className="text-primary hover:underline text-sm font-semibold flex items-center gap-1">
            Continue Shopping <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-16 text-center max-w-md mx-auto mt-12"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Heart size={40} />
          </div>
          <h2 className="text-2xl font-bold dark:text-white mb-2">Wishlist is empty</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Explore our collection of authentic jerseys and click the heart icon to save your favorites!
          </p>
          <Link to="/products" className="btn-primary inline-flex">
            Explore Jerseys
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {products.map((product) => {
              const sizes = product.sizes ? Object.keys(product.sizes) : ['S', 'M', 'L', 'XL'];
              const sortedSizes = sizes.sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));
              const currentSize = selectedSizes[product.id] || 'M';
              const isOutOfStock = product.stockStatus === 'OUT_OF_STOCK' || product.totalQuantity === 0;

              return (
                <motion.article
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: 30 }}
                  className="glass-card overflow-hidden group relative flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-gray-900">
                      <img
                        src={getImageUrl(product.imageUrls?.[0]) || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800'}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(product.id)}
                        className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-900/90 text-red-500 hover:text-red-600 rounded-full shadow-md backdrop-blur-sm transition hover:scale-110"
                        title="Remove from Wishlist"
                      >
                        <Trash2 size={18} />
                      </button>
                      {product.discountPercent > 0 && (
                        <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                          {product.discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <p className="text-xs uppercase tracking-wider text-primary font-semibold">
                        {product.category?.name} · {product.jerseyType}
                      </p>
                      <h2 className="font-display font-bold text-lg mt-1 dark:text-white line-clamp-2">
                        {product.title}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{product.teamName}</p>

                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(product.discountPrice ?? product.price)}
                        </span>
                        {product.discountPrice && product.discountPrice < product.price && (
                          <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
                        )}
                      </div>

                      {/* Size Selector */}
                      {!isOutOfStock && (
                        <div className="mt-4 flex items-center justify-between">
                          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Size:
                          </label>
                          <select
                            value={currentSize}
                            onChange={(e) => handleSizeChange(product.id, e.target.value)}
                            className="text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 outline-none text-gray-700 dark:text-gray-200"
                          >
                            {sortedSizes.map((sizeName) => (
                              <option key={sizeName} value={sizeName}>
                                {sizeName}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0 mt-auto">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      disabled={addingToCartId === product.id || isOutOfStock}
                      className="btn-primary w-full flex items-center justify-center gap-2 !py-2.5 text-sm disabled:opacity-60"
                    >
                      <ShoppingCart size={16} />
                      {isOutOfStock ? 'Out of Stock' : addingToCartId === product.id ? 'Adding...' : 'Add to Cart'}
                    </button>
                    {feedback[product.id] && (
                      <p
                        className={`text-xs mt-2 text-center ${
                          feedback[product.id].includes('Added') ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {feedback[product.id]}
                      </p>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
