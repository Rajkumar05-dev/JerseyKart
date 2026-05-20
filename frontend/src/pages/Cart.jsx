import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/imageUrl';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const Cart = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { cart, removeFromCart } = useCart();

  if (authLoading) {
    return <p className="text-center py-20 text-gray-500">Loading...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const items = cart?.cartItems || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-display font-bold dark:text-white mb-8">Your Cart</h1>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-6">Your cart is empty.</p>
          <Link to="/products" className="btn-primary inline-block">
            Browse Jerseys
          </Link>
        </motion.div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                className="glass-card p-4 flex gap-4 items-center"
              >
                <img
                  src={getImageUrl(item.product?.imageUrls?.[0])}
                  alt={item.product?.title}
                  className="w-20 h-20 rounded-lg object-cover bg-gray-100 dark:bg-gray-900"
                />
                <div className="flex-grow min-w-0">
                  <h2 className="font-semibold dark:text-white truncate">{item.product?.title}</h2>
                  <p className="text-sm text-gray-500">Size: {item.size} · Qty: {item.quantity}</p>
                  <p className="text-primary font-bold mt-1">
                    {formatPrice(item.discountedPrice ?? item.price)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 size={20} />
                </button>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mt-8"
          >
            <div className="flex justify-between text-lg font-semibold dark:text-white">
              <span>Total ({cart.totalItem} items)</span>
              <span className="text-primary">{formatPrice(cart.totalDiscountedPrice)}</span>
            </div>
            {cart.totalPrice > cart.totalDiscountedPrice && (
              <p className="text-sm text-gray-400 line-through text-right mt-1">
                {formatPrice(cart.totalPrice)}
              </p>
            )}
            <button type="button" className="btn-primary w-full mt-6">
              Proceed to Checkout
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Cart;
