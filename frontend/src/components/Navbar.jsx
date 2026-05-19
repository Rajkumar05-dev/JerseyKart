import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, Sun, Moon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ darkMode, setDarkMode }) => {
  const { isAuthenticated, logout, user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'glass-card py-3 sm:py-4 px-4 sm:px-8 shadow-sm backdrop-blur-lg' : 'bg-transparent py-5 px-4 sm:px-8'
    }`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 z-50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white font-display font-bold text-xl">
            JK
          </div>
          <span className="font-display font-bold text-2xl tracking-tighter hidden sm:block dark:text-white">
            JerseyKart<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 font-medium">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <Link to="/products?category=football" className="hover:text-primary transition-colors">Football</Link>
          <Link to="/products?category=cricket" className="hover:text-primary transition-colors">Cricket</Link>
          <Link to="/products?category=basketball" className="hover:text-primary transition-colors">Basketball</Link>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4 sm:gap-6 z-50">
          <button onClick={() => setDarkMode(!darkMode)} className="hover:text-primary transition-colors">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button className="hover:text-primary transition-colors hidden sm:block">
            <Search size={22} />
          </button>

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="hidden sm:flex items-center gap-2 hover:text-primary transition-colors text-sm font-medium dark:text-white"
                title={user?.email}
              >
                <User size={22} />
                <span className="max-w-[120px] truncate">{user?.firstName || 'Profile'}</span>
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden sm:flex items-center gap-3"
            >
              <Link
                to="/login"
                className="text-sm font-semibold hover:text-primary transition-colors dark:text-white"
              >
                Login
              </Link>
              <Link to="/register" className="btn-primary !px-4 !py-2 text-sm">
                Sign Up
              </Link>
            </motion.div>
          )}
          
          <Link to="/cart" className="relative hover:text-primary transition-colors">
            <ShoppingCart size={22} />
            <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex justify-center items-center">
              0
            </span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden block hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 w-full bg-white dark:bg-dark p-6 shadow-xl flex flex-col gap-4 z-40 md:hidden"
          >
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium py-2 border-b dark:border-gray-800">Home</Link>
            <Link to="/products?category=football" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium py-2 border-b dark:border-gray-800">Football</Link>
            <Link to="/products?category=cricket" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium py-2 border-b dark:border-gray-800">Cricket</Link>
            <Link to="/products?category=basketball" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium py-2 border-b dark:border-gray-800">Basketball</Link>
            <motion.div className="flex flex-col gap-3 pt-4 border-t dark:border-gray-800">
               <button className="flex items-center gap-2 hover:text-primary transition-colors">
                 <Search size={20} /> Search
               </button>
               {isAuthenticated ? (
                 <>
                   <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 hover:text-primary transition-colors">
                     <User size={20} /> Profile
                   </Link>
                   <button
                     type="button"
                     onClick={() => { logout(); setIsMobileMenuOpen(false); }}
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
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
