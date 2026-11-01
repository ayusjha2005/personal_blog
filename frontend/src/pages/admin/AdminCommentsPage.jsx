import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Search,
  Trash2,
  Eye,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  User,
} from 'lucide-react';
import { api } from '../../services/api';
import { pageVariants } from '../../animations/variants';

export default function AdminCommentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [comments, setComments] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [loading, setLoading] = useState(true);

  // Search input state
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Modals state
  const [viewingComment, setViewingComment] = useState(null);
  const [deletingComment, setDeletingComment] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadComments = () => {
    setLoading(true);
    api.getComments({
      page: currentPage,
      limit: 15,
      search: currentSearch || null,
    })
      .then((res) => {
        setComments(res.comments || []);
        setTotalPages(res.totalPages || 1);
        setTotalComments(res.totalComments || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load comments:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadComments();
  }, [currentSearch, currentPage]);

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
    updateParam('search', searchInput.trim());
  };

  const handleDeleteConfirm = async () => {
    if (!deletingComment) return;
    setIsDeleting(true);
    try {
      await api.deleteComment(deletingComment.articleId, deletingComment._id);
      setComments((prev) => prev.filter((c) => c._id !== deletingComment._id));
      setDeletingComment(null);
    } catch (err) {
      alert(err.message || 'Failed to delete comment');
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-primary">
            Manage Comments
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Review, inspect, and moderate comments posted across all published articles ({totalComments} total).
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative sm:w-72">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search author, comment, article..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-subtle focus:border-crimson focus:outline-none text-xs text-primary transition-colors"
          />
        </form>
      </div>

      {/* Comments Table */}
      <div className="rounded-3xl bg-surface border border-subtle shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-surface-elevated animate-pulse" />
            ))}
          </div>
        ) : comments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-subtle bg-surface-elevated/40 text-muted font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6">Author</th>
                  <th className="py-3.5 px-4">Comment</th>
                  <th className="py-3.5 px-4">Article</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle/50">
                {comments.map((comment) => (
                  <tr key={comment._id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-crimson/10 text-crimson font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                          {comment.name?.charAt(0) || <User className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="font-bold text-primary">{comment.name}</div>
                          {comment.email && <div className="text-[11px] text-muted">{comment.email}</div>}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-xs text-secondary line-clamp-2">
                        {comment.body}
                      </p>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <Link
                        to={`/blog/${comment.articleSlug}`}
                        target="_blank"
                        className="font-bold text-xs text-primary hover:text-crimson transition-colors line-clamp-1 inline-flex items-center gap-1"
                      >
                        <span>{comment.articleTitle}</span>
                        <ExternalLink className="w-3 h-3 text-muted shrink-0" />
                      </Link>
                    </td>

                    <td className="py-4 px-4 text-xs text-muted whitespace-nowrap">
                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingComment(comment)}
                          aria-label="View full comment"
                          className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-surface-elevated transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingComment(comment)}
                          aria-label="Delete comment"
                          className="p-2 rounded-lg text-secondary hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
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
        ) : (
          <div className="p-12 text-center space-y-3 text-muted text-xs">
            <MessageSquare className="w-10 h-10 mx-auto text-muted" />
            <p className="font-bold text-sm text-primary">No comments found</p>
            <p>No comments match your search criteria.</p>
          </div>
        )}

        {/* Pagination */}
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

      {/* View Comment Modal */}
      <AnimatePresence>
        {viewingComment && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingComment(null)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-surface border border-subtle z-50 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-subtle">
                <div>
                  <h3 className="font-bold text-base font-heading text-primary">Comment Detail</h3>
                  <div className="text-xs text-muted">From {viewingComment.name} ({viewingComment.email || 'No email'})</div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingComment(null)}
                  className="p-1 rounded-lg text-muted hover:text-primary"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted font-bold uppercase tracking-wider">Article:</div>
                <div className="text-sm font-semibold text-primary">{viewingComment.articleTitle}</div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted font-bold uppercase tracking-wider">Comment Body:</div>
                <div className="p-4 rounded-2xl bg-surface-elevated text-xs sm:text-sm text-secondary leading-relaxed whitespace-pre-wrap">
                  {viewingComment.body}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setViewingComment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-secondary hover:text-primary border border-subtle"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeletingComment(viewingComment);
                    setViewingComment(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Delete Comment
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingComment && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingComment(null)}
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
                  <h3 className="font-bold text-lg font-heading text-primary">Delete Comment</h3>
                  <p className="text-xs text-muted">Permanent removal from article.</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-secondary">
                Are you sure you want to permanently delete this comment by <strong className="text-primary">{deletingComment.name}</strong>?
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingComment(null)}
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
