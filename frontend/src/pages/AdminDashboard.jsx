import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ImageUp, Package, Plus, Trash2, Pencil, LogOut, Store } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUrl';

const emptyForm = {
  title: '',
  description: '',
  price: '',
  discountPrice: '',
  discountPercent: '',
  totalQuantity: '50',
  sizeXS: '0',
  sizeS: '10',
  sizeM: '20',
  sizeL: '15',
  sizeXL: '10',
  sizeXXL: '0',
  categoryName: 'football',
  teamName: '',
  jerseyType: 'Home',
  stockStatus: '',
  imageUrl: '',
};

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const isValidImagePath = (url) => /^https?:\/\//i.test(url) || url.startsWith('/uploads/');

const getStockStatusLabel = (product) => {
  if (product.stockStatus === 'OUT_OF_STOCK' || product.totalQuantity === 0) return 'Out of stock';
  if (product.stockStatus === 'COMING_SOON') return 'Stock coming soon';
  return 'Stock available';
};

const getSizeSummary = (sizes) => {
  if (!sizes) return '';
  return Object.entries(sizes)
    .filter(([, quantity]) => Number(quantity) > 0)
    .map(([size, quantity]) => `${size}: ${quantity}`)
    .join(', ');
};

const formatErrorDetails = (err) => {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (err.response) {
    const data = err.response.data;
    const message = typeof data === 'string' ? data : data?.message || data?.error || err.message;
    return `Status ${err.response.status}: ${message || 'Request failed'}`;
  }
  return err.message || 'Unknown error';
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const formRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadStatus, setImageUploadStatus] = useState('');
  const [imageUploadMessage, setImageUploadMessage] = useState('');
  const [errorLogs, setErrorLogs] = useState([]);

  const addErrorLog = (source, err) => {
    const details = formatErrorDetails(err);
    setErrorLogs((prev) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        time: new Date().toLocaleTimeString(),
        source,
        details,
      },
      ...prev,
    ].slice(0, 20));
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/admin/products/all');
      setProducts(data);
    } catch (err) {
      setError('Failed to load products. Check admin login.');
      addErrorLog('Load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleWindowError = (event) => {
      addErrorLog('Frontend error', event.error || event.message);
    };
    const handleUnhandledRejection = (event) => {
      addErrorLog('Frontend promise error', event.reason);
    };

    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    if (showForm) {
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    }
  }, [showForm]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === 'imageUrl') {
      setImageUploadStatus(isValidImagePath(e.target.value) ? 'success' : '');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);
    setImageUploadStatus('uploading');
    setImageUploadMessage('');
    setError('');

    try {
      const { data } = await api.post('/api/admin/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (!data.url) throw new Error('Image upload response missing URL');
      setForm((prev) => ({ ...prev, imageUrl: data.url }));
      setImageUploadStatus('success');
      setImageUploadMessage('Image uploaded successfully.');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data ||
        err.message ||
        'Image upload failed';
      const message = typeof msg === 'string' ? msg : 'Image upload failed';
      setError(message);
      setImageUploadStatus('error');
      setImageUploadMessage(message);
      addErrorLog('Image upload', err);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const buildProductPayload = () => ({
    title: form.title,
    description: form.description,
    price: parseFloat(form.price),
    discountPrice: parseFloat(form.discountPrice) || parseFloat(form.price),
    discountPercent: parseInt(form.discountPercent, 10) || 0,
    totalQuantity: parseInt(form.totalQuantity, 10) || 50,
    teamName: form.teamName,
    jerseyType: form.jerseyType,
    stockStatus: form.stockStatus,
    category: { name: form.categoryName },
    imageUrls: isValidImagePath(form.imageUrl) ? [form.imageUrl] : [],
    sizes: {
      XS: parseInt(form.sizeXS, 10) || 0,
      S: parseInt(form.sizeS, 10) || 0,
      M: parseInt(form.sizeM, 10) || 0,
      L: parseInt(form.sizeL, 10) || 0,
      XL: parseInt(form.sizeXL, 10) || 0,
      XXL: parseInt(form.sizeXXL, 10) || 0,
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = buildProductPayload();
      if (editingId) {
        await api.put(`/api/admin/products/${editingId}`, payload);
      } else {
        await api.post('/api/admin/products/', payload);
      }
      setForm(emptyForm);
      setImageUploadStatus('');
      setImageUploadMessage('');
      setEditingId(null);
      setShowForm(false);
      await fetchProducts();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data ||
        err.message ||
        'Failed to save product';
      setError(typeof msg === 'string' ? msg : 'Failed to save product');
      addErrorLog(editingId ? 'Update product' : 'Create product', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setImageUploadStatus(product.imageUrls?.[0] ? 'success' : '');
    setImageUploadMessage(product.imageUrls?.[0] ? 'Image uploaded successfully.' : '');
    setForm({
      title: product.title || '',
      description: product.description || '',
      price: String(product.price ?? ''),
      discountPrice: String(product.discountPrice ?? ''),
      discountPercent: String(product.discountPercent ?? ''),
      totalQuantity: String(product.totalQuantity ?? '50'),
      sizeXS: String(product.sizes?.XS ?? '0'),
      sizeS: String(product.sizes?.S ?? '10'),
      sizeM: String(product.sizes?.M ?? '20'),
      sizeL: String(product.sizes?.L ?? '15'),
      sizeXL: String(product.sizes?.XL ?? '10'),
      sizeXXL: String(product.sizes?.XXL ?? '0'),
      categoryName: product.category?.name || 'football',
      teamName: product.teamName || '',
      jerseyType: product.jerseyType || 'Home',
      stockStatus: product.stockStatus || '',
      imageUrl: product.imageUrls?.[0] || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/admin/products/${id}`);
      await fetchProducts();
    } catch (err) {
      setError('Failed to delete product');
      addErrorLog('Delete product', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold dark:text-white flex items-center gap-2">
            <Package className="text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Welcome, {user?.firstName || user?.email}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border dark:border-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
            <Store size={18} /> Store
          </Link>
          <button type="button" onClick={logout} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border dark:border-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
            <LogOut size={18} /> Logout
          </button>
          <button
            type="button"
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); setImageUploadStatus(''); setImageUploadMessage(''); }}
            className="btn-primary inline-flex items-center gap-2 !py-2"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-3xl font-bold text-primary mt-1">{products.length}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-gray-500">Role</p>
          <p className="text-xl font-bold dark:text-white mt-1">ADMIN</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-gray-500">Admin Email</p>
          <p className="text-sm font-medium dark:text-white mt-1 truncate">{user?.email}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 text-sm">{error}</div>
      )}

      <div className="glass-card p-5 mb-8">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="font-bold dark:text-white">Error Log</h2>
            <p className="text-sm text-gray-500">Frontend aur backend errors yaha dikhenge</p>
          </div>
          {errorLogs.length > 0 && (
            <button
              type="button"
              onClick={() => setErrorLogs([])}
              className="px-3 py-1.5 rounded-lg border text-sm dark:border-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Clear
            </button>
          )}
        </div>
        {errorLogs.length === 0 ? (
          <p className="text-sm text-gray-500">No errors yet.</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {errorLogs.map((log) => (
              <div key={log.id} className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
                <div className="flex flex-wrap items-center gap-2 font-semibold">
                  <span>{log.time}</span>
                  <span>{log.source}</span>
                </div>
                <p className="mt-1 break-words">{log.details}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <motion.div
          ref={formRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-8"
        >
          <h2 className="text-xl font-bold dark:text-white mb-4">
            {editingId ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Title</label>
              <input name="title" required value={form.title} onChange={handleChange} placeholder="Manchester United Home Jersey 2026" className="input-field" />
            </div>
            <div>
              <label className="form-label">Team name</label>
              <input name="teamName" required value={form.teamName} onChange={handleChange} placeholder="Manchester United" className="input-field" />
            </div>
            <div>
              <label className="form-label">Price</label>
              <input name="price" type="number" required value={form.price} onChange={handleChange} placeholder="2999" className="input-field" />
            </div>
            <div>
              <label className="form-label">Discount price</label>
              <input name="discountPrice" type="number" value={form.discountPrice} onChange={handleChange} placeholder="2499" className="input-field" />
            </div>
            <div>
              <label className="form-label">Discount %</label>
              <input name="discountPercent" type="number" value={form.discountPercent} onChange={handleChange} placeholder="17" className="input-field" />
            </div>
            <div>
              <label className="form-label">Total quantity</label>
              <input name="totalQuantity" type="number" value={form.totalQuantity} onChange={handleChange} placeholder="50" className="input-field" />
            </div>
            <div>
              <label className="form-label">Stock status</label>
              <select name="stockStatus" value={form.stockStatus} onChange={handleChange} className="select-field">
                <option value="">Stock available</option>
                <option value="OUT_OF_STOCK">Out of stock</option>
                <option value="COMING_SOON">Stock coming soon</option>
              </select>
            </div>
            <div>
              <label className="form-label">Category</label>
              <select name="categoryName" value={form.categoryName} onChange={handleChange} className="select-field">
                <option value="football">Football</option>
                <option value="cricket">Cricket</option>
                <option value="basketball">Basketball</option>
                <option value="retro">Retro</option>
              </select>
            </div>
            <div className="md:col-span-2 field-card">
              <label className="form-label">Size quantity</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <input name="sizeXS" type="number" min="0" value={form.sizeXS} onChange={handleChange} placeholder="XS" className="input-field" />
                <input name="sizeS" type="number" min="0" value={form.sizeS} onChange={handleChange} placeholder="S" className="input-field" />
                <input name="sizeM" type="number" min="0" value={form.sizeM} onChange={handleChange} placeholder="M" className="input-field" />
                <input name="sizeL" type="number" min="0" value={form.sizeL} onChange={handleChange} placeholder="L" className="input-field" />
                <input name="sizeXL" type="number" min="0" value={form.sizeXL} onChange={handleChange} placeholder="XL" className="input-field" />
                <input name="sizeXXL" type="number" min="0" value={form.sizeXXL} onChange={handleChange} placeholder="XXL" className="input-field" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Jersey type</label>
              <input name="jerseyType" value={form.jerseyType} onChange={handleChange} placeholder="Home / Away / Third" className="input-field" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5 dark:text-gray-200">Product image</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <label
                  className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed cursor-pointer transition ${
                    imageUploadStatus === 'success'
                      ? 'border-green-500 bg-green-50 text-green-700 hover:border-green-600 hover:text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      : imageUploadStatus === 'error'
                        ? 'border-red-400 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 dark:border-gray-700 dark:text-white'
                  }`}
                >
                  {imageUploadStatus === 'success' ? <CheckCircle2 size={18} /> : <ImageUp size={18} />}
                  {uploadingImage ? 'Uploading...' : imageUploadStatus === 'success' ? 'Image uploaded' : 'Upload from storage'}
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
                </label>
                <div className="input-field flex-1 min-h-[50px] flex items-center text-sm text-gray-500 break-all">
                  {isValidImagePath(form.imageUrl) ? form.imageUrl : 'No image uploaded yet'}
                </div>
              </div>
              {isValidImagePath(form.imageUrl) && (
                <div className="mt-3 flex items-center gap-3">
                  <img src={getImageUrl(form.imageUrl)} alt="" className="w-16 h-16 rounded object-cover border dark:border-gray-700" />
                  <span className="text-sm text-gray-500 break-all">{form.imageUrl}</span>
                </div>
              )}
              {imageUploadStatus === 'success' && (
                <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-300">{imageUploadMessage}</p>
              )}
              {imageUploadStatus === 'error' && (
                <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-300">{imageUploadMessage}</p>
              )}
            </div>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows={3} className="input-field md:col-span-2" />
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
                {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border dark:border-gray-700 dark:text-white">
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <p className="text-center text-gray-500 py-12">Loading products...</p>
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b dark:border-gray-700">
              <tr className="dark:text-gray-300">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b dark:border-gray-800 dark:text-white">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {p.imageUrls?.[0] && (
                        <img src={getImageUrl(p.imageUrls[0])} alt="" className="w-10 h-10 rounded object-cover" />
                      )}
                      <span className="font-medium">{p.title}</span>
                    </div>
                  </td>
                  <td className="p-4 capitalize">{p.category?.name}</td>
                  <td className="p-4">{formatPrice(p.discountPrice ?? p.price)}</td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          getStockStatusLabel(p) === 'Out of stock'
                            ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300'
                            : getStockStatusLabel(p) === 'Stock coming soon'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                              : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                        }`}
                      >
                        {getStockStatusLabel(p)}
                      </span>
                      {getSizeSummary(p.sizes) && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{getSizeSummary(p.sizes)}</p>
                      )}
                      <p className="text-xs text-gray-400">Qty: {p.totalQuantity}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleEdit(p)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
                        <Pencil size={16} />
                      </button>
                      <button type="button" onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className="text-center text-gray-500 py-8">No products yet. Add your first product.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
