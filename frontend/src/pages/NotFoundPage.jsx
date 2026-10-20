import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Map } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F8F6F0] pt-16 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl font-bold text-[#B88A35]/20 mb-2">404</div>
        <h1 className="text-3xl font-bold text-[#172544] mb-3">Page Not Found</h1>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="flex items-center gap-2 bg-[#172544] text-white px-5 py-3 rounded-xl font-semibold hover:bg-[#101B35] transition">
            <Home size={18} /> Go Home
          </Link>
          <Link to="/explore-plots" className="flex items-center gap-2 border-2 border-[#B88A35] text-[#B88A35] px-5 py-3 rounded-xl font-semibold hover:bg-[#B88A35] hover:text-white transition">
            <Map size={18} /> Explore Plots
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
