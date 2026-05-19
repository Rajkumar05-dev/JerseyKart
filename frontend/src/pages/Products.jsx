import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const params = category ? { category } : {};
        const { data } = await api.get('/api/products', { params });
        setProducts(data);
      } catch (err) {
        setError('Could not load products. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  const title = category
    ? `${category.charAt(0).toUpperCase() + category.slice(1)} Jerseys`
    : 'All Jerseys';

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-display font-bold dark:text-white">{title}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Premium jerseys for every fan. {products.length > 0 && `${products.length} items`}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3 mt-8 mb-10"
      >
        {['', 'football', 'cricket', 'basketball', 'retro'].map((cat) => (
          <Link
            key={cat || 'all'}
            to={cat ? `/products?category=${cat}` : '/products'}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === cat
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'All'}
          </Link>
        ))}
      </motion.div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-96 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="glass-card p-6 text-center text-red-600 dark:text-red-300">{error}</div>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="text-center text-gray-500 py-16">No products found in this category.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
