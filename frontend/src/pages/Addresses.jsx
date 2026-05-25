import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Addresses = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    mobile: '',
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAddresses();
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/addresses');
      setAddresses(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.streetAddress || !formData.city || !formData.zipCode) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/api/addresses/${editingId}`, formData);
      } else {
        await api.post('/api/addresses', formData);
      }
      setFormData({
        firstName: '',
        lastName: '',
        streetAddress: '',
        city: '',
        state: '',
        zipCode: '',
        mobile: '',
      });
      setEditingId(null);
      setShowForm(false);
      setError('');
      fetchAddresses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/api/addresses/${id}`);
      fetchAddresses();
    } catch (err) {
      setError('Failed to delete address');
    }
  };

  const handleEdit = (address) => {
    setFormData(address);
    setEditingId(address.id);
    setShowForm(true);
  };

  if (authLoading) {
    return <p className="text-center py-20 text-gray-500">Loading...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-display font-bold dark:text-white mb-8">My Addresses</h1>

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
        <p className="text-center text-gray-500">Loading addresses...</p>
      ) : (
        <>
          {addresses.length === 0 && !showForm ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-12 text-center mb-6"
            >
              <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-6">No addresses yet. Add one now!</p>
            </motion.div>
          ) : (
            <div className="space-y-4 mb-6">
              {addresses.map((address) => (
                <motion.div
                  key={address.id}
                  layout
                  className="glass-card p-6"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg dark:text-white">
                        {address.firstName} {address.lastName}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">{address.streetAddress}</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                      {address.mobile && (
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Phone: {address.mobile}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(address)}
                        className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(address.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!showForm ? (
            <button
              type="button"
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({
                  firstName: '',
                  lastName: '',
                  streetAddress: '',
                  city: '',
                  state: '',
                  zipCode: '',
                  mobile: '',
                });
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium"
            >
              <Plus size={20} /> Add New Address
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-6"
            >
              <h2 className="text-2xl font-bold dark:text-white mb-6">
                {editingId ? 'Edit Address' : 'Add New Address'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name *"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="px-4 py-3 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="px-4 py-3 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <input
                  type="text"
                  name="streetAddress"
                  placeholder="Street Address *"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    name="city"
                    placeholder="City *"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="px-4 py-3 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="px-4 py-3 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="Zip Code *"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="px-4 py-3 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <input
                  type="tel"
                  name="mobile"
                  placeholder="Mobile Number"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                />

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium"
                  >
                    {editingId ? 'Update Address' : 'Add Address'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="px-6 py-3 rounded-lg border dark:border-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default Addresses;
