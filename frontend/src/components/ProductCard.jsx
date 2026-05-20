import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUrl';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const ProductCard = ({ product, index }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, loading } = useCart();
  const sizes = product.sizes ? Object.keys(product.sizes) : ['S', 'M', 'L', 'XL'];
  const [size, setSize] = useState(sizes[0] || 'M');
  const [feedback, setFeedback] = useState('');

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setFeedback('');
    const result = await addToCart(product.id, size, 1);
    if (result.success) {
      setFeedback('Added to cart!');
      setTimeout(() => setFeedback(''), 2000);
    } else {
      setFeedback(result.message || 'Could not add to cart');
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
        <motion.div className="flex items-center gap-2 mt-4" initial={false}>
          <span className="text-xl font-bold text-primary">
            {formatPrice(product.discountPrice ?? product.price)}
          </span>
          {product.discountPrice && product.discountPrice < product.price && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
          )}
        </motion.div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Size</label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary/50"
          >
            {sizes.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={loading}
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
