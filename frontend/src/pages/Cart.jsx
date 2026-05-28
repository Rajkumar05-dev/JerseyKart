import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, Minus, Plus, MapPin, Edit2, CheckCircle2, Home, Briefcase, PlusCircle, X, CreditCard, Banknote } from 'lucide-react';
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
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    id: null,
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    mobile: user?.mobile || '',
    label: 'Home',
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressSaved, setAddressSaved] = useState(false);

  // Load saved addresses from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('jerseykartSavedAddresses');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAddresses(parsed);
          
          // Auto-select the first complete address or previously selected one
          const prevSelectedId = localStorage.getItem('jerseykartSelectedAddressId');
          let selected = parsed.find(addr => addr.id === Number(prevSelectedId)) || parsed[0];
          
          if (selected) {
            setSelectedAddressId(selected.id);
            setShippingAddress(selected);
            setAddressSaved(true);
            setShowAddressForm(false);
          } else {
            setShowAddressForm(true);
          }
        } else {
          setShowAddressForm(true);
        }
      } catch (err) {
        setShowAddressForm(true);
      }
    } else {
      // Fallback: If there is a single old address saved in localStorage under old key
      const oldSaved = localStorage.getItem('jerseykartShippingAddress');
      if (oldSaved) {
        try {
          const parsed = JSON.parse(oldSaved);
          const isComplete = parsed?.streetAddress?.trim() && parsed?.city?.trim() && parsed?.zipCode?.trim() && parsed?.mobile?.trim();
          if (isComplete) {
            const initialAddr = {
              id: Date.now(),
              firstName: parsed.firstName || user?.firstName || '',
              lastName: parsed.lastName || user?.lastName || '',
              streetAddress: parsed.streetAddress || '',
              city: parsed.city || '',
              state: parsed.state || '',
              zipCode: parsed.zipCode || '',
              mobile: parsed.mobile || user?.mobile || '',
              label: 'Home',
            };
            setAddresses([initialAddr]);
            setSelectedAddressId(initialAddr.id);
            setShippingAddress(initialAddr);
            setAddressSaved(true);
            setShowAddressForm(false);
            localStorage.setItem('jerseykartSavedAddresses', JSON.stringify([initialAddr]));
          } else {
            setShowAddressForm(true);
          }
        } catch {
          setShowAddressForm(true);
        }
      } else {
        setShowAddressForm(true);
      }
    }
  }, [user]);

  // Keep first/last name updated from user if form is empty and we just loaded user
  useEffect(() => {
    if (user && !editingAddressId && !shippingAddress.streetAddress) {
      setShippingAddress((prev) => ({
        ...prev,
        firstName: prev.firstName || user.firstName || '',
        lastName: prev.lastName || user.lastName || '',
        mobile: prev.mobile || user.mobile || '',
      }));
    }
  }, [user, editingAddressId]);

  const handleSaveAddress = () => {
    setCheckoutError('');
    const requiredFields = ['firstName', 'streetAddress', 'city', 'zipCode', 'mobile'];
    const missingField = requiredFields.find((field) => !shippingAddress[field]?.trim());
    if (missingField) {
      setCheckoutError('Please fill in all required address fields before saving.');
      return false;
    }

    let updatedList;
    if (editingAddressId) {
      // Update existing address
      updatedList = addresses.map(addr => addr.id === editingAddressId ? { ...shippingAddress, id: editingAddressId } : addr);
    } else {
      // Add new address
      const newAddress = { ...shippingAddress, id: Date.now() };
      updatedList = [...addresses, newAddress];
      setSelectedAddressId(newAddress.id);
      setShippingAddress(newAddress);
    }

    setAddresses(updatedList);
    localStorage.setItem('jerseykartSavedAddresses', JSON.stringify(updatedList));
    localStorage.setItem('jerseykartSelectedAddressId', String(shippingAddress.id || Date.now()));
    
    setAddressSaved(true);
    setShowAddressForm(false);
    setEditingAddressId(null);
    return true;
  };

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setShippingAddress(addr);
    setAddressSaved(true);
    localStorage.setItem('jerseykartSelectedAddressId', String(addr.id));
  };

  const handleAddNewClick = () => {
    setShippingAddress({
      id: null,
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      mobile: user?.mobile || '',
      label: 'Home',
    });
    setEditingAddressId(null);
    setShowAddressForm(true);
    setAddressSaved(false);
  };

  const handleEditClick = (addr, e) => {
    e.stopPropagation(); // Avoid triggering selection
    setShippingAddress(addr);
    setEditingAddressId(addr.id);
    setShowAddressForm(true);
    setAddressSaved(false);
  };

  const handleDeleteClick = (id, e) => {
    e.stopPropagation(); // Avoid triggering selection
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    const updatedList = addresses.filter(addr => addr.id !== id);
    setAddresses(updatedList);
    localStorage.setItem('jerseykartSavedAddresses', JSON.stringify(updatedList));
    
    if (selectedAddressId === id) {
      if (updatedList.length > 0) {
        setSelectedAddressId(updatedList[0].id);
        setShippingAddress(updatedList[0]);
        localStorage.setItem('jerseykartSelectedAddressId', String(updatedList[0].id));
      } else {
        setSelectedAddressId(null);
        setShippingAddress({
          id: null,
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          streetAddress: '',
          city: '',
          state: '',
          zipCode: '',
          mobile: user?.mobile || '',
          label: 'Home',
        });
        setAddressSaved(false);
        setShowAddressForm(true);
      }
    }
  };

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

    if (!addressSaved && !handleSaveAddress()) {
      return;
    }

    setCheckoutLoading(true);

    try {
      const addressPayload = {
        shippingAddress: {
          ...shippingAddress,
          firstName: shippingAddress.firstName || user?.firstName || 'Customer',
          lastName: shippingAddress.lastName || user?.lastName || '',
        },
      };

      if (paymentMethod === 'COD') {
        // Call Cash on Delivery placement endpoint
        await api.post('/api/payment/cod', addressPayload);
        await refreshCart();
        window.alert('Order placed successfully using Cash on Delivery!');
      } else {
        // Online Payment using Razorpay
        const { data } = await api.post('/api/payment/create-order', addressPayload);

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
      }
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
          {showAddressForm ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 mb-6 border border-primary/20 dark:border-primary/10"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-display dark:text-white flex items-center gap-2">
                  <MapPin className="text-primary" />
                  {editingAddressId ? 'Edit Shipping Address' : 'Add New Shipping Address'}
                </h2>
                {addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    aria-label="Cancel Address Form"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                )}
              </div>
              
              {/* Address Label Selector */}
              <div className="mb-6">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-3">Address Label</span>
                <div className="flex gap-3">
                  {['Home', 'Work', 'Other'].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setShippingAddress(prev => ({ ...prev, label: lbl }))}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-300 ${
                        shippingAddress.label === lbl
                          ? 'border-primary bg-primary/5 text-primary shadow-sm shadow-primary/5'
                          : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    >
                      {lbl === 'Home' && <Home size={15} />}
                      {lbl === 'Work' && <Briefcase size={15} />}
                      {lbl === 'Other' && <MapPin size={15} />}
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">First Name <span className="text-red-500">*</span></span>
                  <input
                    type="text"
                    required
                    value={shippingAddress.firstName}
                    onChange={(e) => setShippingAddress((prev) => ({ ...prev, firstName: e.target.value }))}
                    className="input-field mt-1.5 w-full"
                    placeholder="First name"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Last Name</span>
                  <input
                    type="text"
                    value={shippingAddress.lastName}
                    onChange={(e) => setShippingAddress((prev) => ({ ...prev, lastName: e.target.value }))}
                    className="input-field mt-1.5 w-full"
                    placeholder="Last name"
                  />
                </label>
                <label className="sm:col-span-2 block">
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Street Address <span className="text-red-500">*</span></span>
                  <input
                    type="text"
                    required
                    value={shippingAddress.streetAddress}
                    onChange={(e) => setShippingAddress((prev) => ({ ...prev, streetAddress: e.target.value }))}
                    className="input-field mt-1.5 w-full"
                    placeholder="Flat/House no., building, street, area"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">City <span className="text-red-500">*</span></span>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress((prev) => ({ ...prev, city: e.target.value }))}
                    className="input-field mt-1.5 w-full"
                    placeholder="City"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">State</span>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress((prev) => ({ ...prev, state: e.target.value }))}
                    className="input-field mt-1.5 w-full"
                    placeholder="State"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Zip Code <span className="text-red-500">*</span></span>
                  <input
                    type="text"
                    required
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress((prev) => ({ ...prev, zipCode: e.target.value }))}
                    className="input-field mt-1.5 w-full"
                    placeholder="Zip code"
                  />
                </label>
                <label className="sm:col-span-2 block">
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Mobile <span className="text-red-500">*</span></span>
                  <input
                    type="text"
                    required
                    value={shippingAddress.mobile}
                    onChange={(e) => setShippingAddress((prev) => ({ ...prev, mobile: e.target.value }))}
                    className="input-field mt-1.5 w-full"
                    placeholder="Mobile number for delivery updates"
                  />
                </label>
              </div>
              
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveAddress}
                  className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/95 transition-all font-semibold shadow-md shadow-primary/10"
                >
                  Save Address
                </button>
                {addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }}
                    className="px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 mb-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-display dark:text-white flex items-center gap-2">
                  <MapPin className="text-primary" />
                  Select Shipping Address
                </h2>
                <button
                  type="button"
                  onClick={handleAddNewClick}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/90 transition"
                >
                  <PlusCircle size={18} /> Add New Address
                </button>
              </div>

              {/* Saved Address Cards Grid */}
              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <motion.div
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr)}
                      className={`relative p-5 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all duration-300 group ${
                        isSelected
                          ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-lg shadow-primary/5'
                          : 'border-gray-150 dark:border-gray-800 bg-white/5 hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                      whileHover={{ y: -2 }}
                    >
                      <div>
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                              isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                            }`}>
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {addr.firstName} {addr.lastName}
                            </span>
                          </div>

                          {/* Label Badge */}
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isSelected
                              ? 'bg-primary/15 text-primary dark:bg-primary/20'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {addr.label === 'Home' && <Home size={12} />}
                            {addr.label === 'Work' && <Briefcase size={12} />}
                            {addr.label === 'Other' && <MapPin size={12} />}
                            {addr.label}
                          </span>
                        </div>

                        {/* Address Details */}
                        <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400 pl-6">
                          <p>{addr.streetAddress}</p>
                          <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                          <p className="font-medium text-gray-700 dark:text-gray-300 mt-2">📞 {addr.mobile}</p>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex justify-end gap-2 mt-4 pl-6 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => handleEditClick(addr, e)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-855 text-gray-500 hover:text-blue-500 transition"
                          title="Edit Address"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteClick(addr.id, e)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-855 text-gray-500 hover:text-red-500 transition"
                          title="Delete Address"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Show selected summary */}
              {selectedAddressId && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                  <CheckCircle2 className="text-green-500 shrink-0" size={18} />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Delivering to <strong className="text-gray-900 dark:text-white">{shippingAddress.firstName}</strong> at <span>{shippingAddress.streetAddress}, {shippingAddress.city}</span>
                  </p>
                </div>
              )}
            </motion.div>
          )}
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

            {/* Payment Method Selector */}
            <div className="mt-6 pt-6 border-t dark:border-gray-800">
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 block mb-3">Select Payment Method</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border text-sm font-semibold transition-all duration-300 gap-2 ${
                    paymentMethod === 'RAZORPAY'
                      ? 'border-primary bg-primary/5 text-primary shadow-sm shadow-primary/5'
                      : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <CreditCard size={20} />
                  <span>Online Payment</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border text-sm font-semibold transition-all duration-300 gap-2 ${
                    paymentMethod === 'COD'
                      ? 'border-primary bg-primary/5 text-primary shadow-sm shadow-primary/5'
                      : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <Banknote size={20} />
                  <span>Cash on Delivery</span>
                </button>
              </div>
            </div>
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
