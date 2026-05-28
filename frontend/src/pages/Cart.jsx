import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, Minus, Plus } from 'lucide-react';
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
  const { cart, removeFromCart, updateCartItem, refreshCart } = useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    mobile: user?.mobile || '',
  });

  useEffect(() => {
    if (user) {
      setShippingAddress((prev) => ({
        ...prev,
        firstName: prev.firstName || user.firstName || '',
        lastName: prev.lastName || user.lastName || '',
        mobile: prev.mobile || user.mobile || '',
      }));
    }
  }, [user]);

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

    const requiredFields = ['streetAddress', 'city', 'zipCode', 'mobile'];
    const missingField = requiredFields.find((field) => !shippingAddress[field]?.trim());
    if (missingField) {
      setCheckoutError('Please enter your shipping address and location before checkout.');
      return;
    }

    setCheckoutLoading(true);

    try {
      const { data } = await api.post('/api/payment/create-order', {
        shippingAddress: {
          ...shippingAddress,
          firstName: shippingAddress.firstName || user?.firstName || 'Customer',
          lastName: shippingAddress.lastName || user?.lastName || '',
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
          <div className="glass-card p-6 mb-6">
            <h2 className="text-2xl font-semibold dark:text-white mb-4">Shipping Address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-gray-500 dark:text-gray-400">First Name</span>
                <input
                  type="text"
                  value={shippingAddress.firstName}
                  onChange={(e) => setShippingAddress((prev) => ({ ...prev, firstName: e.target.value }))}
                  className="input-field mt-1 w-full"
                  placeholder="First name"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-500 dark:text-gray-400">Last Name</span>
                <input
                  type="text"
                  value={shippingAddress.lastName}
                  onChange={(e) => setShippingAddress((prev) => ({ ...prev, lastName: e.target.value }))}
                  className="input-field mt-1 w-full"
                  placeholder="Last name"
                />
              </label>
              <label className="sm:col-span-2 block">
                <span className="text-sm text-gray-500 dark:text-gray-400">Street Address</span>
                <input
                  type="text"
                  value={shippingAddress.streetAddress}
                  onChange={(e) => setShippingAddress((prev) => ({ ...prev, streetAddress: e.target.value }))}
                  className="input-field mt-1 w-full"
                  placeholder="Street address"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-500 dark:text-gray-400">City</span>
                <input
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress((prev) => ({ ...prev, city: e.target.value }))}
                  className="input-field mt-1 w-full"
                  placeholder="City"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-500 dark:text-gray-400">State</span>
                <input
                  type="text"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress((prev) => ({ ...prev, state: e.target.value }))}
                  className="input-field mt-1 w-full"
                  placeholder="State"
                />
              </label>
              <label className="block">
                <span className="text-sm text-gray-500 dark:text-gray-400">Zip Code</span>
                <input
                  type="text"
                  value={shippingAddress.zipCode}
                  onChange={(e) => setShippingAddress((prev) => ({ ...prev, zipCode: e.target.value }))}
                  className="input-field mt-1 w-full"
                  placeholder="Zip code"
                />
              </label>
              <label className="sm:col-span-2 block">
                <span className="text-sm text-gray-500 dark:text-gray-400">Mobile</span>
                <input
                  type="text"
                  value={shippingAddress.mobile}
                  onChange={(e) => setShippingAddress((prev) => ({ ...prev, mobile: e.target.value }))}
                  className="input-field mt-1 w-full"
                  placeholder="Mobile number"
                />
              </label>
            </div>
          </div>
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
                  <div className="mt-2 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>Size: {item.size}</span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-2 py-1">
                      <button
                        type="button"
                        onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1))}
                        className="p-1 text-gray-500 hover:text-primary transition-colors"
                        aria-label="Decrease quantity"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartItem(item.id, item.quantity + 1)}
                        className="p-1 text-gray-500 hover:text-primary transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </span>
                  </div>
                  <p className="text-primary font-bold mt-3">
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
