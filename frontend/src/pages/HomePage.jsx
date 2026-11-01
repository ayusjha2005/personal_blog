import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { pageVariants, staggerContainer } from '../animations/variants';
import HeroSection from '../components/home/HeroSection';
import ArticleCard from '../components/blog/ArticleCard';
import StepNavigator from '../components/layout/StepNavigator';

export default function HomePage() {
  const [data, setData] = useState({ featuredArticle: null, latestArticles: [], profile: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getHome()
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load homepage data:', err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative w-full overflow-hidden bg-[#07080B]"
    >
      {/* Left-Side Vertical Step Navigator (01 Home ... 05 Contact) */}
      <StepNavigator />

      {/* Cinematic Celestial Hero Section */}
      <HeroSection
        profile={data.profile}
        featuredArticle={data.featuredArticle}
        articleCount={data.latestArticles?.length || 42}
      />

      {/* Laser Wave Section Divider (Matching Reference Image) */}
      <div className="relative w-full py-4 overflow-hidden pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative flex items-center justify-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-crimson to-transparent opacity-60 shadow-[0_0_15px_#E11D48]" />
          <div className="absolute w-24 h-6 bg-crimson/20 rounded-full blur-xl" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 pb-24">
        {/* Recent Blogs Section (Exact Match to Reference Image) */}
        <section id="recent-blogs" className="scroll-mt-24">
          {/* Header Row: — LATEST ARTICLES | Recent Blogs | View All Blogs -> */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-0.5 bg-crimson shadow-[0_0_6px_#E11D48]" />
                <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                  LATEST ARTICLES
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-white tracking-tight">
                Recent Blogs
              </h2>
            </div>

            <Link
              to="/blog"
              className="text-sm font-semibold text-crimson hover:text-crimson-hover flex items-center gap-1.5 group transition-colors"
            >
              <span>View All Blogs</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          {/* 3-Column Blog Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 rounded-2xl bg-[#0E1116] border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {data.latestArticles.slice(0, 3).map((article, idx) => (
                <ArticleCard key={article._id || article.slug} article={article} index={idx} />
              ))}
            </motion.div>
          )}
        </section>
      </div>
    </motion.div>
  );
}
