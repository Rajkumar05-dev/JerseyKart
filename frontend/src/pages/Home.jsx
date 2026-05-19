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
            <button className="btn-primary hover:-translate-y-1">
              Shop Now
            </button>
            <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20 hover:-translate-y-1">
              Explore Teams
            </button>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories (Placeholder) */}
      <section className="py-20 px-4 max-w-7xl mx-auto text-center">
         <h2 className="text-3xl font-display font-bold mb-12">Shop by Sport</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="h-80 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
            <div className="h-80 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
            <div className="h-80 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
         </div>
      </section>
    </div>
  );
};

export default Home;
