import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Calendar, DollarSign, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getImageUrl } from '../utils/imageUrl';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'PLACED':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'CONFIRMED':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'SHIPPED':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    case 'DELIVERED':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
};

const Orders = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/orders');
        setOrders(data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  if (authLoading) {
    return <p className="text-center py-20 text-gray-500">Loading...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-display font-bold dark:text-white mb-8">Order History</h1>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-4 mb-6 text-red-600 dark:text-red-400"
        >
          {error}
        </motion.div>
      )}

      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">Loading your orders...</p>
      ) : orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't placed any orders yet.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              layout
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Order ID: #{order.id}</p>
                        <p className="font-semibold text-lg dark:text-white mt-1">
                          {formatPrice(order.totalDiscountedPrice)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(order.orderDate)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus === 'COMPLETED' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-right">
                    {order.totalItem} item{order.totalItem > 1 ? 's' : ''}
                  </p>
                </div>
              </button>

              {expandedOrder === order.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/30"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="font-semibold dark:text-white mb-4">Shipping Address</h3>
                      {order.shippingAddress ? (
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                          <p>{order.shippingAddress.streetAddress}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                          {order.shippingAddress.mobile && <p>Phone: {order.shippingAddress.mobile}</p>}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Not provided</p>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold dark:text-white mb-4">Order Details</h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                        <p>Method: {order.paymentMethod || 'Not specified'}</p>
                        <p>Items: {order.totalItem}</p>
                        <p>Subtotal: {formatPrice(order.totalPrice)}</p>
                        <p className="font-semibold text-primary">Total: {formatPrice(order.totalDiscountedPrice)}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold dark:text-white mb-4">Items</h3>
                    <div className="space-y-3">
                      {order.orderItems && order.orderItems.map((item) => (
                        <div key={item.id} className="flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                          {item.product?.imageUrls?.[0] && (
                            <img
                              src={getImageUrl(item.product.imageUrls[0])}
                              alt={item.product?.title}
                              className="w-16 h-16 rounded object-cover"
                            />
                          )}
                          <div className="flex-grow min-w-0">
                            <p className="font-medium dark:text-white truncate">{item.product?.title}</p>
                            <p className="text-sm text-gray-500">Size: {item.size} · Qty: {item.quantity}</p>
                            <p className="text-sm font-semibold text-primary mt-1">
                              {formatPrice(item.discountedPrice ?? item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
