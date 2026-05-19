import { Link } from 'react-router-dom';


const Footer = () => {
  return (
    <footer className="bg-white dark:bg-dark border-t border-gray-200 dark:border-gray-800 pt-16 pb-8 mt-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        
        <div className="flex flex-col gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white font-display font-bold text-xl">
              JK
            </div>
            <span className="font-display font-bold text-2xl tracking-tighter dark:text-white">
              JerseyKart<span className="text-primary">.</span>
            </span>
          </Link>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            Premium quality sports jerseys delivered straight to your door. Show your team spirit with authentic designs.
          </p>
          <div className="flex gap-4">
            <span className="text-gray-600 dark:text-gray-300 uppercase font-bold tracking-wider text-xs">SOCIAL MEDIA LINKS</span>
          </div>
        </div>

        <div>
          <h3 className="font-display font-semibold text-lg mb-6 dark:text-white">Shop by Sport</h3>
          <ul className="flex flex-col gap-4 text-gray-500 dark:text-gray-400">
            <li><Link to="/products?category=football" className="hover:text-primary transition-colors">Football Jerseys</Link></li>
            <li><Link to="/products?category=cricket" className="hover:text-primary transition-colors">Cricket Jerseys</Link></li>
            <li><Link to="/products?category=basketball" className="hover:text-primary transition-colors">Basketball Jerseys</Link></li>
            <li><Link to="/products?category=retro" className="hover:text-primary transition-colors">Retro Collection</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display font-semibold text-lg mb-6 dark:text-white">Quick Links</h3>
          <ul className="flex flex-col gap-4 text-gray-500 dark:text-gray-400">
            <li><Link to="/track-order" className="hover:text-primary transition-colors">Track Order</Link></li>
            <li><Link to="/returns" className="hover:text-primary transition-colors">Returns & Exchanges</Link></li>
            <li><Link to="/sizing" className="hover:text-primary transition-colors">Sizing Guide</Link></li>
            <li><Link to="/faq" className="hover:text-primary transition-colors">FAQs</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display font-semibold text-lg mb-6 dark:text-white">Newsletter</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Subscribe to get special offers, free giveaways, and updates.
          </p>
          <div className="flex">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="px-4 py-3 w-full bg-gray-100 dark:bg-gray-800 rounded-l-lg border-0 focus:ring-2 focus:ring-primary outline-none dark:text-white"
            />
            <button className="bg-primary text-white px-6 py-3 rounded-r-lg font-semibold hover:bg-opacity-90 transition-all">
              Join
            </button>
          </div>
        </div>

      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-8 border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
        <p>&copy; {new Date().getFullYear()} JerseyKart. All rights reserved.</p>
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
