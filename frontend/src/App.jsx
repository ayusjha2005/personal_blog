import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';
import CustomCursor from './components/common/CustomCursor';

// Public Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Admin Pages (Code-split for high performance)
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminArticlesPage = lazy(() => import('./pages/admin/AdminArticlesPage'));
const AdminArticleEditorPage = lazy(() => import('./pages/admin/AdminArticleEditorPage'));
const AdminCommentsPage = lazy(() => import('./pages/admin/AdminCommentsPage'));
const AdminMessagesPage = lazy(() => import('./pages/admin/AdminMessagesPage'));
const AdminProfilePage = lazy(() => import('./pages/admin/AdminProfilePage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-crimson border-t-transparent animate-spin" />
    </div>
  );
}

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-primary text-primary transition-colors duration-200">
      <CustomCursor />
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Routes location={location} key={location.pathname}>
            {/* Public Website */}
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="blog" element={<BlogPage />} />
              <Route path="blog/:slug" element={<ArticleDetailPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Admin Login */}
            <Route path="admin/login" element={<AdminLoginPage />} />

            {/* Protected Admin Control Panel */}
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="articles" element={<AdminArticlesPage />} />
              <Route path="articles/new" element={<AdminArticleEditorPage />} />
              <Route path="articles/:id/edit" element={<AdminArticleEditorPage />} />
              <Route path="comments" element={<AdminCommentsPage />} />
              <Route path="messages" element={<AdminMessagesPage />} />
              <Route path="profile" element={<AdminProfilePage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  );
}
