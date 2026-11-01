import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X, ArrowUpRight, Search, User } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import SearchModal from '../common/SearchModal';

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Blogs', path: '/blog' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#07080B]/80 border-b border-white/5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Brand Logo: </> Ayush Jha */}
          <Link to="/" className="flex items-center gap-2 group" aria-label="Ayush Jha Home">
            <span className="text-crimson font-mono font-bold text-xl tracking-tighter drop-shadow-[0_0_8px_rgba(225,29,72,0.6)]">
              &lt;/&gt;
            </span>
            <span className="font-extrabold text-xl tracking-tight text-white font-heading group-hover:text-crimson transition-colors">
              Ayush <span className="text-crimson">Jha</span>
            </span>
          </Link>

          {/* Center Navigation Links with Glowing Red Active Indicator */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isHome = link.path === '/' && location.pathname === '/';
              const isBlog = link.path === '/blog' && (location.pathname === '/blog' || location.pathname.startsWith('/blog/'));
              const isAbout = link.path === '/about' && location.pathname === '/about';
              const isContact = link.path === '/contact' && location.pathname === '/contact';
              const isLeaderboard = link.path === '/#leaderboard' && location.hash === '#leaderboard';
              const isActive = isHome || isBlog || isAbout || isContact || isLeaderboard;

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-1 left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-crimson to-transparent shadow-[0_0_12px_#E11D48]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons: Search, Theme Toggle Pill, User */}
          <div className="flex items-center gap-3">
            {/* Search Trigger Icon */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search articles"
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-white/5"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Futuristic Theme Switcher Pill (Matching Reference Image) */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="relative w-14 h-7 rounded-full bg-[#12151B] border border-white/10 p-0.5 flex items-center justify-between cursor-pointer transition-colors shadow-inner"
            >
              <Sun className="w-3.5 h-3.5 ml-1 text-slate-400" />
              <Moon className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <motion.div
                className="absolute top-0.5 w-6 h-6 rounded-full bg-crimson flex items-center justify-center shadow-[0_0_10px_rgba(225,29,72,0.8)]"
                animate={{
                  left: isDark ? 'calc(100% - 1.65rem)' : '0.15rem',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {isDark ? (
                  <Moon className="w-3 h-3 text-white" />
                ) : (
                  <Sun className="w-3 h-3 text-white" />
                )}
              </motion.div>
            </button>

            {/* User / Admin Access Button */}
            <Link
              to={isAuthenticated ? '/admin' : '/admin/login'}
              aria-label="Admin Profile"
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-white/5 relative"
            >
              <User className="w-4 h-4" />
              {isAuthenticated && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-crimson animate-ping" />
              )}
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors border border-white/10"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-crimson" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden border-b border-white/10 bg-[#0A0C10] px-6 py-6 overflow-hidden shadow-2xl"
            >
              <div className="flex flex-col gap-3">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <span>{link.name}</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-500" />
                    </Link>
                  </motion.div>
                ))}

                <Link
                  to={isAuthenticated ? '/admin' : '/admin/login'}
                  className="mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-crimson/15 text-crimson border border-crimson/30 hover:bg-crimson hover:text-white transition-all"
                >
                  <User className="w-4 h-4" />
                  <span>{isAuthenticated ? 'Admin Dashboard' : 'Admin Login'}</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Instant Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
