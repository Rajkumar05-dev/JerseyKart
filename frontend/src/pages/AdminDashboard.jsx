import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ImageUp, Package, Plus, Trash2, Pencil, LogOut, Store } from 'lucide-react';
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
  categoryName: 'football',
  teamName: '',
  jerseyType: 'Home',
  imageUrl: '',
};

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

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

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/admin/products/all');
      setProducts(data);
    } catch {
      setError('Failed to load products. Check admin login.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (showForm) {
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    }
  }, [showForm]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);
    setError('');

    try {
      const { data } = await api.post('/api/admin/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((prev) => ({ ...prev, imageUrl: data.url }));
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data ||
        err.message ||
        'Image upload failed';
      setError(typeof msg === 'string' ? msg : 'Image upload failed');
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
    category: { name: form.categoryName },
    imageUrls: form.imageUrl ? [form.imageUrl] : [],
    sizes: { S: 10, M: 20, L: 15, XL: 10 },
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      title: product.title || '',
      description: product.description || '',
      price: String(product.price ?? ''),
      discountPrice: String(product.discountPrice ?? ''),
      discountPercent: String(product.discountPercent ?? ''),
      totalQuantity: String(product.totalQuantity ?? '50'),
      categoryName: product.category?.name || 'football',
      teamName: product.teamName || '',
      jerseyType: product.jerseyType || 'Home',
      imageUrl: product.imageUrls?.[0] || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/admin/products/${id}`);
      await fetchProducts();
    } catch {
      setError('Failed to delete product');
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
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
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
            <input name="title" required value={form.title} onChange={handleChange} placeholder="Title" className="input-field" />
            <input name="teamName" required value={form.teamName} onChange={handleChange} placeholder="Team name" className="input-field" />
            <input name="price" type="number" required value={form.price} onChange={handleChange} placeholder="Price" className="input-field" />
            <input name="discountPrice" type="number" value={form.discountPrice} onChange={handleChange} placeholder="Discount price" className="input-field" />
            <input name="discountPercent" type="number" value={form.discountPercent} onChange={handleChange} placeholder="Discount %" className="input-field" />
            <input name="totalQuantity" type="number" value={form.totalQuantity} onChange={handleChange} placeholder="Stock" className="input-field" />
            <select name="categoryName" value={form.categoryName} onChange={handleChange} className="input-field">
              <option value="football">Football</option>
              <option value="cricket">Cricket</option>
              <option value="basketball">Basketball</option>
              <option value="retro">Retro</option>
            </select>
            <input name="jerseyType" value={form.jerseyType} onChange={handleChange} placeholder="Jersey type (Home/Away)" className="input-field" />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5 dark:text-gray-200">Product image</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 dark:text-white cursor-pointer hover:border-primary hover:text-primary transition">
                  <ImageUp size={18} />
                  {uploadingImage ? 'Uploading...' : 'Upload from storage'}
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
                </label>
                <input
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="Uploaded image path"
                  className="input-field flex-1"
                />
              </div>
              {form.imageUrl && (
                <div className="mt-3 flex items-center gap-3">
                  <img src={getImageUrl(form.imageUrl)} alt="" className="w-16 h-16 rounded object-cover border dark:border-gray-700" />
                  <span className="text-sm text-gray-500 break-all">{form.imageUrl}</span>
                </div>
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
                  <td className="p-4">{p.totalQuantity}</td>
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
