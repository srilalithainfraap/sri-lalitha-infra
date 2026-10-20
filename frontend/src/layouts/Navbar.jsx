import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, Shield, User, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../features/auth/AuthContext';
import { config } from '../data/config';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/explore-plots', label: 'Explore Plots' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const activeLinkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors duration-200 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B88A35] ${
      isActive
        ? 'text-[#B88A35]'
        : scrolled
          ? 'text-[#172544] hover:text-[#B88A35]'
          : 'text-white hover:text-[#D5B46B]'
    }`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-md'
          : 'bg-gradient-to-b from-[#101B35]/70 via-[#101B35]/25 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <img
              src="/assets/sri-lalitha-logo.jpeg"
              alt="Sri Lalitha Infra"
              className="h-10 w-10 rounded-full object-cover border-2 border-[#B88A35]"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <p className={`text-sm font-bold leading-tight ${scrolled ? 'text-[#172544]' : 'text-white'}`}>
                {config.company.name}
              </p>
              <p className="text-xs text-[#B88A35] font-medium tracking-wide">{config.company.tagline}</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.to === '/'} className={activeLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#B88A35] flex items-center justify-center text-xs font-bold text-white flex-shrink-0 select-none">
                    {currentUser.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                  </div>
                  <span className={`text-sm font-medium hidden xl:block ${scrolled ? 'text-[#172544]' : 'text-white/90'}`}>
                    {currentUser.name?.split(' ')[0]}
                  </span>
                </div>
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className="flex items-center gap-1.5 border border-[#B88A35] text-[#B88A35] px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-[#B88A35] hover:text-white transition"
                >
                  {isAdmin ? <Shield size={14} /> : <LayoutDashboard size={14} />}
                  {isAdmin ? 'Admin' : 'Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-1 text-sm font-medium ${scrolled ? 'text-[#172544]' : 'text-white/80'} hover:text-red-500 transition`}
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`flex items-center gap-1.5 border px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                    scrolled
                      ? 'border-[#172544] text-[#172544] hover:border-[#B88A35] hover:text-[#B88A35]'
                      : 'border-white/40 text-white hover:border-[#D5B46B] hover:text-[#D5B46B]'
                  }`}
                >
                  <User size={14} /> Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 bg-[#B88A35] hover:bg-[#D5B46B] text-white px-4 py-1.5 rounded-full text-sm font-semibold transition shadow-sm"
                >
                  <UserPlus size={14} /> Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={`lg:hidden p-2 rounded-lg ${scrolled ? 'text-[#172544]' : 'text-white'}`}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100 shadow-lg overflow-hidden"
          >
            <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive ? 'bg-[#B88A35]/10 text-[#B88A35]' : 'text-[#172544] hover:bg-gray-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="pt-2 border-t border-gray-100 mt-2 flex flex-col gap-2">
                {currentUser ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 mb-1">
                      <div className="w-8 h-8 rounded-full bg-[#B88A35] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {currentUser.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#172544] leading-tight">{currentUser.name}</p>
                        <p className="text-xs text-gray-400">{currentUser.email}</p>
                      </div>
                    </div>
                    <Link
                      to={isAdmin ? '/admin' : '/dashboard'}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-[#172544] hover:bg-gray-50 rounded-lg"
                    >
                      {isAdmin ? <Shield size={15} /> : <LayoutDashboard size={15} />}
                      {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="bg-[#B88A35] text-white text-center py-2.5 rounded-lg text-sm font-semibold"
                  >
                    Login / Register
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
