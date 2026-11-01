import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  User,
  Settings,
  Mail,
  MessageSquare,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sun,
  Moon,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function AdminLayout() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If loading, show skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Guard: if not authenticated, redirect to login
  if (!isAuthenticated) {
    navigate('/admin/login', { replace: true });
    return null;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Articles', path: '/admin/articles', icon: FileText },
    { name: 'Site & Profile', path: '/admin/profile', icon: User },
    { name: 'Website Settings', path: '/admin/settings', icon: Settings },
    { name: 'Messages', path: '/admin/messages', icon: Mail },
    { name: 'Comments', path: '/admin/comments', icon: MessageSquare },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col justify-between h-full p-5 space-y-6">
      <div className="space-y-6">
        {/* Brand & Theme */}
        <div className="flex items-center justify-between pb-4 border-b border-subtle">
          <Link to="/admin" className="flex items-center gap-2 font-heading font-extrabold text-base text-primary">
            <span>Ayush Jha</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-crimson text-white tracking-wider uppercase">
              Admin
            </span>
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-8 h-8 rounded-full flex items-center justify-center border border-subtle text-secondary hover:text-primary transition-colors"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
          </button>
        </div>

        {/* Quick action: New Article */}
        <Link
          to="/admin/articles/new"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-crimson hover:bg-crimson-hover text-white text-xs font-bold shadow-md shadow-crimson/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </Link>

        {/* Navigation list */}
        <nav className="space-y-1 text-xs sm:text-sm font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-crimson/10 text-crimson font-bold border-l-3 border-crimson'
                    : 'text-secondary hover:text-primary hover:bg-surface-elevated'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-crimson' : 'text-muted'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-2 pt-4 border-t border-subtle text-xs">
        <Link
          to="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-secondary hover:text-primary hover:bg-surface-elevated transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-muted" />
            <span>View Live Site</span>
          </span>
          <span className="text-[10px] text-muted">&rarr;</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="font-semibold">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-primary flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r border-subtle bg-surface shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 h-16 border-b border-subtle bg-surface sticky top-0 z-30">
        <div className="flex items-center gap-2 font-heading font-extrabold text-sm text-primary">
          <span>Ayush Jha</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-crimson text-white uppercase">
            Admin
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="w-10 h-10 rounded-full flex items-center justify-center border border-subtle text-secondary"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5 text-crimson" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Slideout Sidebar Drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden fixed top-0 bottom-0 left-0 w-72 bg-surface z-50 shadow-2xl border-r border-subtle"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
}
