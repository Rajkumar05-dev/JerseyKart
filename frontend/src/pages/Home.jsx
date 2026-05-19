import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 z-0">
          <img 
            src="https://images.unsplash.com/photo-1577717903525-4c03ba88e734?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-sm font-semibold tracking-wider uppercase mb-6 inline-block border border-white/20">
              New Collection 2026
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight"
          >
            Wear Your Passion. <br/> <span className="text-primary italic">Defy the Odds.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl"
          >
            Discover the most authentic premium quality sports jerseys. Whether you're on the pitch or in the stands, feel the game.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex gap-4 flex-col sm:flex-row"
          >
            <Link to="/products" className="btn-primary hover:-translate-y-1 inline-block text-center">
              Shop Now
            </Link>
            <Link to="/products?category=football" className="px-6 py-3 bg-white/10 backdrop-blur-md text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20 hover:-translate-y-1 inline-block text-center">
              Explore Teams
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories (Placeholder) */}
      <section className="py-20 px-4 max-w-7xl mx-auto text-center">
         <h2 className="text-3xl font-display font-bold mb-12">Shop by Sport</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Football', slug: 'football', img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800' },
              { name: 'Cricket', slug: 'cricket', img: 'https://images.unsplash.com/photo-1531415071028-05b841bc90ef?w=800' },
              { name: 'Basketball', slug: 'basketball', img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800' },
            ].map((sport) => (
              <Link
                key={sport.slug}
                to={`/products?category=${sport.slug}`}
                className="group relative h-80 rounded-2xl overflow-hidden"
              >
                <img src={sport.img} alt={sport.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-8">
                  <span className="text-2xl font-display font-bold text-white">{sport.name}</span>
                </div>
              </Link>
            ))}
         </div>
      </section>
    </div>
  );
};

export default Home;
