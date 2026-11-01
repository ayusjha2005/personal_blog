import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { api } from '../../services/api';
import { pageVariants } from '../../animations/variants';

export default function AdminArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStatus = searchParams.get('status') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [articles, setArticles] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [loading, setLoading] = useState(true);

  // Search input state
  const [searchQuery, setSearchQuery] = useState(currentSearch);

  // Delete modal state
  const [deletingArticle, setDeletingArticle] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadArticles = () => {
    setLoading(true);
    api.getAdminArticles({
      page: currentPage,
      limit: 10,
      status: currentStatus || null,
      search: currentSearch || null,
    })
      .then((res) => {
        setArticles(res.articles || []);
        setTotalPages(res.totalPages || 1);
        setTotalArticles(res.totalArticles || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load admin articles:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadArticles();
  }, [currentStatus, currentSearch, currentPage]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    if (key !== 'page') {
      params.set('page', '1');
    }
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchQuery.trim());
  };

  const handleToggleStatus = async (article) => {
    try {
      const res = await api.toggleArticleStatus(article._id);
      if (res.success) {
        setArticles((prev) =>
          prev.map((a) => (a._id === article._id ? { ...a, status: res.status } : a))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle article status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingArticle) return;
    setIsDeleting(true);
    try {
      await api.deleteArticle(deletingArticle._id);
      setArticles((prev) => prev.filter((a) => a._id !== deletingArticle._id));
      setDeletingArticle(null);
    } catch (err) {
      alert(err.message || 'Failed to delete article');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
    >
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-primary">
            Manage Articles
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Create, edit, toggle drafts, or delete articles across all publication categories.
          </p>
        </div>

        <Link
          to="/admin/articles/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-crimson hover:bg-crimson-hover text-white text-xs font-bold shadow-md shadow-crimson/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </Link>
      </div>

      {/* Controls: Search and Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface border border-subtle self-start text-xs">
          <button
            type="button"
            onClick={() => updateParam('status', '')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              !currentStatus
                ? 'bg-crimson text-white shadow-sm'
                : 'text-secondary hover:text-primary'
            }`}
          >
            All ({totalArticles})
          </button>
          <button
            type="button"
            onClick={() => updateParam('status', 'published')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              currentStatus === 'published'
                ? 'bg-crimson text-white shadow-sm'
                : 'text-secondary hover:text-primary'
            }`}
          >
            Published
          </button>
          <button
            type="button"
            onClick={() => updateParam('status', 'draft')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              currentStatus === 'draft'
                ? 'bg-crimson text-white shadow-sm'
                : 'text-secondary hover:text-primary'
            }`}
          >
            Drafts
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative sm:w-72">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search article titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-subtle focus:border-crimson focus:outline-none text-xs text-primary transition-colors"
          />
        </form>
      </div>

      {/* Articles Table (Desktop) / Cards (Mobile) */}
      <div className="rounded-3xl bg-surface border border-subtle shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-surface-elevated animate-pulse" />
            ))}
          </div>
        ) : articles.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-subtle bg-surface-elevated/40 text-muted font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-6">Article</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Views</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle/50">
                  {articles.map((art) => (
                    <tr key={art._id} className="hover:bg-surface-elevated/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={art.coverImage || '/images/article-productivity.jpg'}
                            alt={art.title}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 border border-subtle"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/images/article-productivity.jpg';
                            }}
                          />
                          <div className="min-w-0">
                            <Link
                              to={`/admin/articles/${art._id}/edit`}
                              className="font-bold text-primary hover:text-crimson transition-colors line-clamp-1"
                            >
                              {art.title}
                            </Link>
                            <span className="text-[11px] text-muted">
                              {new Date(art.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-semibold text-secondary">
                        {art.category}
                      </td>

                      <td className="py-4 px-4 text-muted">
                        {(art.views || 0).toLocaleString()}
                      </td>

                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(art)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            art.status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                          }`}
                          title="Click to toggle status"
                        >
                          {art.status}
                        </button>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {art.status === 'published' && (
                            <Link
                              to={`/blog/${art.slug}`}
                              target="_blank"
                              aria-label="View live article"
                              className="p-2 rounded-lg text-muted hover:text-primary hover:bg-surface-elevated transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}
                          <Link
                            to={`/admin/articles/${art._id}/edit`}
                            aria-label="Edit article"
                            className="p-2 rounded-lg text-secondary hover:text-crimson hover:bg-surface-elevated transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeletingArticle(art)}
                            aria-label="Delete article"
                            className="p-2 rounded-lg text-secondary hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-subtle p-4 space-y-4">
              {articles.map((art) => (
                <div key={art._id} className="pt-4 first:pt-0 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={art.coverImage || '/images/article-productivity.jpg'}
                      alt={art.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-subtle"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/admin/articles/${art._id}/edit`}
                        className="font-bold text-sm text-primary hover:text-crimson line-clamp-1"
                      >
                        {art.title}
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-muted mt-1">
                        <span className="text-crimson">{art.category}</span>
                        <span>&bull;</span>
                        <span>{art.views || 0} views</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(art)}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        art.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {art.status}
                    </button>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/articles/${art._id}/edit`}
                        className="px-3 py-1.5 rounded-lg bg-surface-elevated text-xs font-bold text-primary border border-subtle"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeletingArticle(art)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-12 text-center space-y-3 text-secondary text-xs">
            <FileCheck className="w-10 h-10 text-muted mx-auto" />
            <p className="font-bold text-sm text-primary">No articles found</p>
            <p>Try adjusting your search query or filters.</p>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-subtle flex items-center justify-between text-xs text-muted">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => updateParam('page', currentPage - 1)}
                className="px-3 py-1.5 rounded-lg border border-subtle disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => updateParam('page', currentPage + 1)}
                className="px-3 py-1.5 rounded-lg border border-subtle disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingArticle && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingArticle(null)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-3xl bg-surface border border-subtle z-50 shadow-2xl space-y-5"
            >
              <div className="flex items-center gap-3 text-rose-500">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg font-heading text-primary">Delete Article</h3>
                  <p className="text-xs text-muted">This action is permanent and cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-secondary">
                Are you sure you want to delete <strong className="text-primary">"{deletingArticle.title}"</strong>? Associated Cloudinary images will also be removed.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingArticle(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-secondary hover:text-primary border border-subtle"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteConfirm}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
