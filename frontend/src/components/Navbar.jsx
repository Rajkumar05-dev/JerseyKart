import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, Sun, Moon, LogOut, Heart } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/products?search=${encodeURIComponent(q)}`);
    } else {
      navigate('/products');
    }
    setIsMobileMenuOpen(false);
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
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden sm:block text-sm font-semibold text-primary hover:underline"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/profile"
                className="hidden sm:flex items-center gap-2 hover:text-primary transition-colors text-sm font-medium dark:text-white"
                title={user?.email}
              >
                <User size={22} />
                <span className="max-w-[100px] truncate">{user?.firstName || 'Profile'}</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden sm:flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors dark:text-white"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
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

          {isAuthenticated && (
            <Link to="/wishlist" className="relative hover:text-primary transition-colors dark:text-white" title="Wishlist">
              <Heart size={22} className={wishlistCount > 0 ? "fill-primary text-primary" : ""} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex justify-center items-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
          )}

          <Link to="/cart" className="relative hover:text-primary transition-colors dark:text-white">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex justify-center items-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="md:hidden hover:text-primary transition-colors dark:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile search — always visible below header row */}
      <div className="md:hidden mt-3 px-0">{searchBar()}</div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white dark:bg-dark p-6 shadow-xl flex flex-col gap-4 z-40 md:hidden border-t dark:border-gray-800"
          >
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium py-2 text-primary">
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Heart size={20} /> Wishlist
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <User size={20} /> Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 hover:text-primary transition-colors text-left"
                >
                  <LogOut size={20} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium py-2">
                  Login
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary text-center">
                  Sign Up
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
