import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Bookmark, ArrowRight, Calendar } from 'lucide-react';

export default function ArticleRow({ article }) {
  if (!article) return null;

  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      setIsBookmarked(saved.includes(article.slug));
    } catch {
      setIsBookmarked(false);
    }
  }, [article.slug]);

  const toggleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      let saved = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      if (saved.includes(article.slug)) {
        saved = saved.filter((s) => s !== article.slug);
        setIsBookmarked(false);
      } else {
        saved.push(article.slug);
        setIsBookmarked(true);
      }
      localStorage.setItem('bookmarks', JSON.stringify(saved));
    } catch (err) {
      console.error(err);
    }
  };

  const dateFormatted = new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const categoryName = typeof article.category === 'object' ? article.category.name : article.category;
  const coverUrl = article.coverImage || '/images/article-productivity.jpg';

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group p-4 sm:p-5 rounded-3xl bg-surface border border-subtle hover:border-crimson/30 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center min-w-0 w-full sm:w-auto">
        {/* Thumbnail */}
        <Link
          to={`/blog/${article.slug}`}
          className="relative w-full sm:w-44 h-40 sm:h-28 rounded-2xl overflow-hidden shrink-0 block bg-surface-elevated"
        >
          <img
            src={coverUrl}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/article-productivity.jpg';
            }}
          />
          {categoryName && (
            <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded-md bg-crimson text-white shadow">
              {categoryName}
            </span>
          )}
        </Link>

        {/* Content Details */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {dateFormatted}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readingTime || 5} min read
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold font-heading text-primary group-hover:text-crimson transition-colors line-clamp-1 leading-snug">
            <Link to={`/blog/${article.slug}`}>
              {article.title}
            </Link>
          </h3>

          <p className="text-xs sm:text-sm text-secondary line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-3 self-end sm:self-center">
        <button
          type="button"
          onClick={toggleBookmark}
          aria-label="Bookmark article"
          className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
            isBookmarked
              ? 'bg-crimson text-white border-crimson'
              : 'border-subtle text-secondary hover:text-crimson hover:bg-surface-elevated'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-white' : ''}`} />
        </button>

        <Link
          to={`/blog/${article.slug}`}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-elevated text-secondary group-hover:bg-crimson group-hover:text-white transition-all border border-subtle"
          aria-label="Read full article"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.article>
  );
}
