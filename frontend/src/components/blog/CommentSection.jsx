import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export default function CommentSection({ slug, initialComments = [] }) {
  const [comments, setComments] = useState(initialComments);
  const [formData, setFormData] = useState({ name: '', email: '', body: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.body.trim()) {
      setErrorMsg('Please enter your name and comment.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.commentArticle(slug, formData);
      if (res.success && res.comment) {
        setComments((prev) => [res.comment, ...prev]);
        setFormData({ name: '', email: '', body: '' });
        setSuccessMsg('Thank you! Your comment has been posted.');
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="comments" className="pt-12 mt-12 border-t border-subtle space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-crimson" />
        <h2 className="text-2xl font-bold font-heading text-primary">
          Comments ({comments.length})
        </h2>
      </div>

      {/* Comment Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-subtle shadow-md space-y-5">
        <h3 className="text-lg font-bold font-heading text-primary">Leave a Comment</h3>
        <p className="text-xs text-secondary">
          Join the conversation. Share your thoughts, feedback, or questions.
        </p>

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="commentName" className="block text-xs font-bold text-secondary mb-1.5">
                Your Name *
              </label>
              <input
                id="commentName"
                type="text"
                required
                maxLength={80}
                placeholder="e.g. Alex Rivera"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle focus:border-crimson focus:outline-none text-sm text-primary transition-colors"
              />
            </div>
            <div>
              <label htmlFor="commentEmail" className="block text-xs font-bold text-secondary mb-1.5">
                Email Address (Optional)
              </label>
              <input
                id="commentEmail"
                type="email"
                maxLength={200}
                placeholder="alex@example.com (never published)"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-subtle focus:border-crimson focus:outline-none text-sm text-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="commentBody" className="block text-xs font-bold text-secondary mb-1.5">
              Comment *
            </label>
            <textarea
              id="commentBody"
              rows={4}
              required
              maxLength={2000}
              placeholder="What are your thoughts on this topic?"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-subtle focus:border-crimson focus:outline-none text-sm text-primary transition-colors resize-y min-h-[90px]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-crimson hover:bg-crimson-hover disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-crimson/20 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
          </button>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment._id || comment.createdAt}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-5 rounded-2xl bg-surface border border-subtle space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-crimson/10 border border-crimson/20 text-crimson flex items-center justify-center font-bold text-xs uppercase">
                    {comment.name ? comment.name.charAt(0) : <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-primary">{comment.name}</h4>
                    <span className="text-[11px] text-muted">
                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-secondary leading-relaxed pl-10">
                {comment.body}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-surface/50 border border-subtle/50 text-muted text-xs">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </section>
  );
}
