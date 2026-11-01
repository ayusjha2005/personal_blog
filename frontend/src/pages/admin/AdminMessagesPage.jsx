import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, Trash2, Eye, Calendar, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { pageVariants } from '../../animations/variants';

export default function AdminMessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStatus = searchParams.get('status') || '';

  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadMessages = () => {
    setLoading(true);
    api.getMessages(currentStatus ? currentStatus : '')
      .then((res) => {
        setMessages(res.messages || []);
        setUnreadCount(res.unreadCount || 0);
        setTotalMessages(res.totalMessages || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load messages:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadMessages();
  }, [currentStatus]);

  const handleToggleStatus = async (msg) => {
    try {
      const res = await api.markMessage(msg._id);
      if (res.success) {
        setMessages((prev) =>
          prev.map((m) => (m._id === msg._id ? { ...m, status: res.status } : m))
        );
        if (res.status === 'read') {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        } else {
          setUnreadCount((prev) => prev + 1);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to update message status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message permanently?')) return;
    try {
      await api.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      if (selectedMessage?._id === id) setSelectedMessage(null);
    } catch (err) {
      alert(err.message || 'Failed to delete message');
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-primary">
            Contact Inbox
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            {unreadCount} unread message{unreadCount === 1 ? '' : 's'} out of {totalMessages} total inquiries.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface border border-subtle self-start text-xs">
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              !currentStatus
                ? 'bg-crimson text-white shadow-sm'
                : 'text-secondary hover:text-primary'
            }`}
          >
            All ({totalMessages})
          </button>
          <button
            type="button"
            onClick={() => setSearchParams({ status: 'unread' })}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              currentStatus === 'unread'
                ? 'bg-crimson text-white shadow-sm'
                : 'text-secondary hover:text-primary'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setSearchParams({ status: 'read' })}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              currentStatus === 'read'
                ? 'bg-crimson text-white shadow-sm'
                : 'text-secondary hover:text-primary'
            }`}
          >
            Read
          </button>
        </div>
      </div>

      {/* Messages List / Table */}
      <div className="rounded-3xl bg-surface border border-subtle shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-surface-elevated animate-pulse" />
            ))}
          </div>
        ) : messages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-subtle bg-surface-elevated/40 text-muted font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6">Sender</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Preview</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle/50">
                {messages.map((msg) => (
                  <tr
                    key={msg._id}
                    className={`hover:bg-surface-elevated/40 transition-colors ${
                      msg.status === 'unread' ? 'bg-crimson/5 font-semibold' : ''
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-primary">{msg.name}</div>
                      <a href={`mailto:${msg.email}`} className="text-[11px] text-muted hover:text-crimson">
                        {msg.email}
                      </a>
                    </td>

                    <td className="py-4 px-4 text-primary font-medium">
                      {msg.subject || 'General Inquiry'}
                    </td>

                    <td className="py-4 px-4 text-secondary max-w-xs line-clamp-1">
                      {msg.message}
                    </td>

                    <td className="py-4 px-4 text-xs text-muted whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMessage(msg);
                            if (msg.status === 'unread') handleToggleStatus(msg);
                          }}
                          className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-surface-elevated transition-colors"
                          title="Read full message"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(msg)}
                          className={`p-2 rounded-lg transition-colors ${
                            msg.status === 'read'
                              ? 'text-muted hover:text-primary'
                              : 'text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                          title={msg.status === 'read' ? 'Mark unread' : 'Mark read'}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(msg._id)}
                          className="p-2 rounded-lg text-secondary hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete message"
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
            <Mail className="w-10 h-10 mx-auto text-muted" />
            <p className="font-bold text-sm text-primary">Inbox is clean</p>
            <p>No contact messages match your filter.</p>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMessage(null)}
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
                  <h3 className="font-bold text-base font-heading text-primary">Message Details</h3>
                  <div className="text-xs text-muted">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="p-1 rounded-lg text-muted hover:text-primary"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-muted font-bold uppercase tracking-wider">From:</div>
                <div className="text-sm font-bold text-primary">{selectedMessage.name}</div>
                <a href={`mailto:${selectedMessage.email}`} className="text-xs text-crimson">
                  {selectedMessage.email}
                </a>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-muted font-bold uppercase tracking-wider">Subject:</div>
                <div className="text-sm font-semibold text-primary">{selectedMessage.subject || 'General Inquiry'}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-muted font-bold uppercase tracking-wider">Message:</div>
                <div className="p-4 rounded-2xl bg-surface-elevated text-xs sm:text-sm text-secondary leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || 'Inquiry')}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-crimson hover:bg-crimson-hover text-white shadow-md shadow-crimson/20"
                >
                  Reply via Email
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-secondary hover:text-primary border border-subtle"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
