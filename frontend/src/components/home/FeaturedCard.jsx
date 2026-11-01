import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Eye, ArrowRight, Calendar } from 'lucide-react';

export default function FeaturedCard({ article }) {
  if (!article) return null;

  const dateFormatted = new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const categoryName = typeof article.category === 'object' ? article.category.name : article.category;
  const coverUrl = article.coverImage || '/images/article-productivity.jpg';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-crimson" />
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-primary">Featured Article</h2>
        </div>
        <Link
          to="/blog"
          className="text-xs sm:text-sm font-semibold text-crimson hover:text-crimson-hover flex items-center gap-1 group"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25 }}
        className="group relative overflow-hidden rounded-3xl bg-surface border border-subtle hover:border-crimson/30 shadow-md transition-all grid grid-cols-1 md:grid-cols-12"
      >
        {/* Cover Image Container */}
        <Link
          to={`/blog/${article.slug}`}
          className="relative md:col-span-7 h-64 sm:h-80 md:h-auto overflow-hidden block"
        >
          <img
            src={coverUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/article-productivity.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
          {categoryName && (
            <span className="absolute top-4 left-4 px-3 py-1 text-xs font-bold rounded-full bg-crimson text-white shadow-md">
              {categoryName}
            </span>
          )}
        </Link>

        {/* Content Details */}
        <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-muted flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {dateFormatted}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.readingTime || 5} min read
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {article.views || 0} views
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-primary group-hover:text-crimson transition-colors leading-snug">
              <Link to={`/blog/${article.slug}`}>
                {article.title}
              </Link>
            </h3>

            {/* Excerpt */}
            <p className="text-sm text-secondary line-clamp-3 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          <div className="pt-2">
            <Link
              to={`/blog/${article.slug}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-crimson hover:text-crimson-hover group/link"
            >
              <span>Read article</span>
              <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
