import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, loading, logout, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[50vh] flex items-center justify-center"
      >
        <p className="text-gray-500">Loading...</p>
      </motion.div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto px-4 py-12"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="glass-card p-8 text-center"
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center text-white">
          <UserIcon size={36} />
        </div>
        <h1 className="text-2xl font-display font-bold dark:text-white">
          {user.firstName ? `Hi, ${user.firstName}!` : 'Your Profile'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">{user.email}</p>
        <p className="text-sm text-green-600 dark:text-green-400 mt-4 font-medium">
          You are logged in successfully.
        </p>
        <button
          type="button"
          onClick={logout}
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:text-white"
        >
          <LogOut size={18} />
          Log out
        </button>
      </motion.div>
    </motion.div>
  );
};

export default Profile;
