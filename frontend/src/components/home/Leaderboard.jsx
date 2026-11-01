import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Heart, Eye, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

export default function Leaderboard() {
  const [data, setData] = useState({ topViewed: [], topLiked: [], categories: [] });
  const [activeTab, setActiveTab] = useState('views');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getLeaderboard()
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load leaderboard:', err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const list = activeTab === 'views' ? data.topViewed : data.topLiked;

  return (
    <section className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
            Article Leaderboard
          </h2>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 rounded-2xl bg-[#0E1116] border border-white/10 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('views')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'views'
                ? 'bg-crimson text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Most Read</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('likes')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'likes'
                ? 'bg-crimson text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Most Loved</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Ranked Articles List */}
        <div className="md:col-span-8 rounded-3xl bg-[#0E1116] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-4">
          {loading ? (
            <div className="space-y-4 py-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-[#181D26] animate-pulse" />
              ))}
            </div>
          ) : list && list.length > 0 ? (
            list.map((article, index) => {
              const rank = index + 1;
              const rankColor =
                rank === 1
                  ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                  : rank === 2
                  ? 'bg-slate-300 text-black shadow-[0_0_10px_rgba(203,213,225,0.4)]'
                  : rank === 3
                  ? 'bg-amber-700 text-white shadow-[0_0_10px_rgba(180,83,9,0.4)]'
                  : 'bg-[#181D26] text-slate-400 border border-white/5';

              return (
                <motion.div
                  key={article._id || article.slug}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#141820]/60 hover:bg-[#181D26] border border-white/5 hover:border-crimson/40 transition-all group"
                >
                  <div className="flex items-center gap-4 min-w-0 pr-4">
                    <span
                      className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-extrabold ${rankColor}`}
                    >
                      {rank}
                    </span>
                    <div className="min-w-0">
                      <Link
                        to={`/blog/${article.slug}`}
                        className="font-bold text-sm sm:text-base text-white group-hover:text-crimson transition-colors line-clamp-1"
                      >
                        {article.title}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="text-crimson font-medium">{article.category}</span>
                        <span>&bull;</span>
                        <span>{article.readingTime || 5} min read</span>
                      </div>
                    </div>
                  </div>

                  {/* Stat Counter */}
                  <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E1116] border border-white/10 text-xs font-mono font-bold text-slate-200">
                    {activeTab === 'views' ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-crimson" />
                        <span>{(article.views || 0).toLocaleString()}</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-3.5 h-3.5 text-crimson fill-crimson" />
                        <span>{article.likes || 0}</span>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <p className="text-center py-8 text-sm text-slate-400">No published articles yet.</p>
          )}
        </div>

        {/* Category Breakdown Sidebar */}
        <div className="md:col-span-4 rounded-3xl bg-[#0E1116] border border-white/10 p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-crimson" />
              <h3 className="font-bold text-base font-heading text-white">Topics Impact</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Distribution of published writings and overall reader engagement across key domains.
            </p>

            <div className="space-y-4">
              {(data.categories || []).slice(0, 5).map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{cat.name}</span>
                    <span className="text-slate-400 font-mono">{cat.count} article{cat.count === 1 ? '' : 's'}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#181D26] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-crimson to-rose-400 shadow-[0_0_8px_#E11D48]"
                      style={{
                        width: `${Math.min(100, Math.max(15, (cat.count / Math.max(1, (data.categories[0]?.count || 1))) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/10">
            <Link
              to="/blog"
              className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-crimson hover:text-white border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <span>Explore All Articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
