import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getImageUrl } from '../utils/imageUrl';
import { Heart } from 'lucide-react';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const ProductCard = ({ product, index }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, loading } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFav = isInWishlist(product.id);
  const sizes = useMemo(() => {
    const entries = product.sizes ? Object.entries(product.sizes) : [['S', 10], ['M', 10], ['L', 10], ['XL', 10]];
    return entries.sort(([a], [b]) => {
      const aIndex = SIZE_ORDER.indexOf(a);
      const bIndex = SIZE_ORDER.indexOf(b);
      return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
    });
  }, [product.sizes]);
  const firstAvailableSize = sizes.find(([, quantity]) => Number(quantity) > 0)?.[0] || sizes[0]?.[0] || 'M';
  const [size, setSize] = useState(firstAvailableSize);
  const [feedback, setFeedback] = useState('');
  const isUnavailable = product.stockStatus === 'OUT_OF_STOCK' || product.totalQuantity === 0;

  useEffect(() => {
    setSize(firstAvailableSize);
  }, [firstAvailableSize]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setFeedback('');
    if (isUnavailable) {
      setFeedback('This product is out of stock');
      return;
    }

    const result = await addToCart(product.id, size, 1);
    if (result.success) {
      setFeedback('Added to cart!');
      setTimeout(() => setFeedback(''), 2000);
    } else {
      setFeedback(result.message || 'Could not add to cart');
    }
  };

  const handleToggleWishlist = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const result = await toggleWishlist(product.id);
    if (result && !result.success) {
      setFeedback(result.message || 'Could not update wishlist');
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card overflow-hidden group"
    >
      <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-900">
        <img
          src={getImageUrl(product.imageUrls?.[0]) || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          type="button"
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-900/90 text-red-500 rounded-full shadow-md backdrop-blur-sm transition hover:scale-110 active:scale-95 z-10"
          aria-label="Toggle wishlist"
        >
          <Heart size={18} className={isFav ? "fill-red-500 text-red-500" : ""} />
        </button>
        {product.discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded">
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
        <motion.div className="flex items-center gap-2 mt-4" initial={false}>
          <span className="text-xl font-bold text-primary">
            {formatPrice(product.discountPrice ?? product.price)}
          </span>
          {product.discountPrice && product.discountPrice < product.price && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
          )}
        </motion.div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Size</label>
            {isUnavailable && <span className="text-xs font-semibold text-red-500">Out of stock</span>}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {sizes.map(([sizeName, quantity]) => {
              const disabled = isUnavailable || Number(quantity) <= 0;
              const selected = size === sizeName;
              return (
                <button
                  key={sizeName}
                  type="button"
                  onClick={() => setSize(sizeName)}
                  disabled={disabled}
                  className={`h-10 rounded-lg border text-sm font-semibold transition ${
                    selected
                      ? 'border-primary bg-primary text-white shadow-sm'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200'
                  } ${disabled ? 'cursor-not-allowed opacity-40 hover:border-gray-200 hover:text-gray-700' : ''}`}
                  title={`${quantity} in stock`}
                >
                  {sizeName}
                </button>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={loading || isUnavailable}
          className="btn-primary w-full mt-4 !py-2.5 text-sm disabled:opacity-60"
        >
          {loading ? 'Adding...' : 'Add to Cart'}
        </button>
        {feedback && (
          <p className={`text-xs mt-2 text-center ${feedback.includes('Added') ? 'text-green-600' : 'text-red-500'}`}>
            {feedback}
          </p>
        )}
        {!isAuthenticated && (
          <p className="text-xs text-gray-400 mt-2 text-center">Login required to add items</p>
        )}
      </div>
    </motion.article>
  );
};

export default ProductCard;
