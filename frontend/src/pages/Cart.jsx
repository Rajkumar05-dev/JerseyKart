import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import { getImageUrl } from '../utils/imageUrl';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const loadRazorpayScript = (src) =>
  new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Cart = () => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { cart, removeFromCart, refreshCart } = useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  if (authLoading) {
    return <p className="text-center py-20 text-gray-500">Loading...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const items = cart?.cartItems || [];

  const handleCheckout = async () => {
    setCheckoutError('');
    if (!cart || cart.totalDiscountedPrice <= 0) {
      setCheckoutError('Please add items to your cart before checkout.');
      return;
    }

    setCheckoutLoading(true);

    try {
      const { data } = await api.post('/api/payment/create-order', {
        shippingAddress: {
          firstName: user?.firstName || 'Customer',
          lastName: user?.lastName || '',
          streetAddress: 'Not provided',
          city: 'Not provided',
          state: 'Not provided',
          zipCode: '000000',
          mobile: '',
        },
      });

      const isLoaded = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!isLoaded) {
        setCheckoutError('Unable to load Razorpay checkout. Please try again.');
        return;
      }

      const options = {
        key: data.razorpayKey,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name: 'JerseyKart',
        description: 'Complete your payment',
        prefill: {
          name: data.userName,
          email: data.userEmail,
          contact: data.userContact || undefined,
        },
        theme: {
          color: '#2563eb',
        },
        handler: async function (response) {
          try {
            await api.post('/api/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            await refreshCart();
            window.alert('Payment successful! Your order is confirmed.');
          } catch (verifyError) {
            console.error('Payment verification failed', verifyError);
            setCheckoutError('Payment verification failed. Please contact support.');
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Checkout failed. Please try again.';
      setCheckoutError(msg);
    } finally {
      setCheckoutLoading(false);
    }
  };

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
            {checkoutError && (
              <p className="text-sm text-red-500 mt-4">{checkoutError}</p>
            )}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="btn-primary w-full mt-6"
            >
              {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Cart;
