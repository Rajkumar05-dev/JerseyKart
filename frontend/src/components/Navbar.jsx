import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, User, Sun, Moon, LogOut, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Navbar = ({ darkMode, setDarkMode }) => {
  const { isAuthenticated, logout, user, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('search') || '');
  }, [location.search]);

  useEffect(() => {
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/products?search=${encodeURIComponent(q)}`);
    } else {
      navigate('/products');
    }
  };

  const searchBar = (className = '') => (
    <form onSubmit={handleSearch} className={`relative flex items-center ${className}`}>
      <Search size={18} className="absolute left-3 text-gray-400 pointer-events-none" />
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search jerseys, teams..."
        className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
      />
    </form>
  );

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'glass-card py-3 sm:py-4 px-4 sm:px-8 shadow-sm backdrop-blur-lg'
          : 'bg-transparent py-5 px-4 sm:px-8'
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
        <Link to="/" className="flex items-center gap-2 z-50 shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white font-display font-bold text-xl">
            JK
          </div>
          <span className="font-display font-bold text-2xl tracking-tighter hidden sm:block dark:text-white">
            JerseyKart<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Desktop search */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">{searchBar()}</div>

        <div className="flex items-center gap-3 sm:gap-5 z-50 shrink-0">
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="hover:text-primary transition-colors dark:text-white"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-white hover:text-primary transition-colors"
                title="Profile menu"
              >
                <User size={20} />
              </button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-3 w-64 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark shadow-xl p-3 z-50"
                  >
                    <div className="flex flex-col gap-2">
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            navigate('/admin');
                            setIsProfileMenuOpen(false);
                          }}
                          className="text-left rounded-xl px-3 py-2 text-sm font-medium text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          Admin Dashboard
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/orders');
                          setIsProfileMenuOpen(false);
                        }}
                        className="text-left rounded-xl px-3 py-2 text-sm font-medium hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        Orders
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/wishlist');
                          setIsProfileMenuOpen(false);
                        }}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <span>Wishlist</span>
                        {wishlistCount > 0 && (
                          <span className="bg-primary text-white text-[10px] font-bold min-w-5 h-5 px-2 rounded-full flex items-center justify-center">
                            {wishlistCount > 9 ? '9+' : wishlistCount}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/cart');
                          setIsProfileMenuOpen(false);
                        }}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <span>Cart</span>
                        {cartCount > 0 && (
                          <span className="bg-primary text-white text-[10px] font-bold min-w-5 h-5 px-2 rounded-full flex items-center justify-center">
                            {cartCount > 9 ? '9+' : cartCount}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/profile');
                          setIsProfileMenuOpen(false);
                        }}
                        className="text-left rounded-xl px-3 py-2 text-sm font-medium hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="text-left rounded-xl px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-gray-800"
                      >
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-semibold hover:text-primary transition-colors dark:text-white"
              >
                Login
              </Link>
              <Link to="/register" className="btn-primary !px-4 !py-2 text-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search — always visible below header row */}
      <div className="md:hidden mt-3 px-0">{searchBar()}</div>
    </nav>
  );
};

export default Navbar;
