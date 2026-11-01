import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  FileCheck,
  Eye,
  Mail,
  MessageSquare,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { api } from '../../services/api';
import { pageVariants, fadeInUp, staggerContainer } from '../../animations/variants';

export default function AdminDashboardPage() {
  const [data, setData] = useState({
    stats: { totalPublished: 0, totalDrafts: 0, totalViews: 0, totalComments: 0 },
    unreadCount: 0,
    recentArticles: [],
    recentMessages: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getStats()
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load admin stats:', err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const statsCards = [
    {
      title: 'Published Articles',
      value: data.stats.totalPublished,
      icon: FileCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      link: '/admin/articles?status=published',
    },
    {
      title: 'Draft Articles',
      value: data.stats.totalDrafts,
      icon: FileText,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      link: '/admin/articles?status=draft',
    },
    {
      title: 'Total Views',
      value: (data.stats.totalViews || 0).toLocaleString(),
      icon: Eye,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      link: '/admin/articles',
    },
    {
      title: 'Contact Messages',
      value: data.unreadCount > 0 ? `${data.unreadCount} unread` : 'All read',
      icon: Mail,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      link: '/admin/messages',
    },
    {
      title: 'Total Comments',
      value: data.stats.totalComments || 0,
      icon: MessageSquare,
      color: 'text-crimson',
      bg: 'bg-crimson/10',
      link: '/admin/comments',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-60 rounded bg-surface-elevated" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-surface border border-subtle" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-primary">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            Welcome back, Ayush. Here is an overview of your publication activity and reader metrics.
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

      {/* 5 Stats Cards Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              variants={fadeInUp}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to={card.link}
                className="p-5 rounded-2xl bg-surface border border-subtle hover:border-crimson/30 transition-all block shadow-sm hover:shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-muted">{card.title}</div>
                  <div className={`w-8 h-8 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold font-heading text-primary mt-2">
                  {card.value}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Split Section: Recent Articles & Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Articles */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-surface border border-subtle shadow-md space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-crimson" />
              <h2 className="text-base sm:text-lg font-bold font-heading text-primary">
                Recent Articles
              </h2>
            </div>
            <Link
              to="/admin/articles"
              className="text-xs font-bold text-crimson hover:text-crimson-hover flex items-center gap-1"
            >
              <span>Manage all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data.recentArticles.map((art) => (
              <div
                key={art._id}
                className="p-3.5 rounded-2xl bg-surface-elevated/60 hover:bg-surface-elevated border border-subtle/50 transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <Link
                    to={`/admin/articles/${art._id}/edit`}
                    className="text-xs sm:text-sm font-bold text-primary hover:text-crimson transition-colors line-clamp-1"
                  >
                    {art.title}
                  </Link>
                  <div className="flex items-center gap-2 text-[11px] text-muted mt-0.5">
                    <span className="text-crimson">{art.category}</span>
                    <span>&bull;</span>
                    <span>{art.views || 0} views</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      art.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {art.status}
                  </span>
                  <Link
                    to={`/admin/articles/${art._id}/edit`}
                    className="text-xs font-semibold text-secondary hover:text-primary px-2 py-1 rounded bg-surface border border-subtle"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}

            {data.recentArticles.length === 0 && (
              <p className="text-xs text-muted text-center py-6">No articles yet. Click "New Article" to create one.</p>
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-surface border border-subtle shadow-md space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-crimson" />
              <h2 className="text-base sm:text-lg font-bold font-heading text-primary">
                Recent Inquiries
              </h2>
            </div>
            <Link
              to="/admin/messages"
              className="text-xs font-bold text-crimson hover:text-crimson-hover flex items-center gap-1"
            >
              <span>View inbox</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data.recentMessages.map((msg) => (
              <div
                key={msg._id}
                className="p-3.5 rounded-2xl bg-surface-elevated/60 border border-subtle/50 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">{msg.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      msg.status === 'unread'
                        ? 'bg-crimson/10 text-crimson border border-crimson/20'
                        : 'text-muted'
                    }`}
                  >
                    {msg.status}
                  </span>
                </div>
                <div className="text-[11px] text-muted">{msg.email}</div>
                <p className="text-xs text-secondary line-clamp-1 italic mt-1">"{msg.message}"</p>
              </div>
            ))}

            {data.recentMessages.length === 0 && (
              <p className="text-xs text-muted text-center py-6">No messages in inbox.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
