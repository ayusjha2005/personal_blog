import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Calendar, Clock, Eye } from 'lucide-react';

export default function ArticleCard({ article, index = 0 }) {
  if (!article) return null;

  // Formatting helpers
  const dateFormatted = new Date(article.publishedAt || article.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const categoryName = typeof article.category === 'object' ? article.category?.name : (article.category || 'Tech');
  
  // High-fidelity fallback mapping based on title or category
  const getCoverImage = () => {
    if (article.coverImage && !article.coverImage.includes('hero-mountain')) {
      return article.coverImage;
    }
    const cat = (categoryName || '').toLowerCase();
    const title = (article.title || '').toLowerCase();
    if (title.includes('mern') || title.includes('web') || cat.includes('web')) return '/images/blog-mern.jpg';
    if (title.includes('render') || title.includes('devops') || title.includes('cloud') || cat.includes('devops')) return '/images/blog-devops.jpg';
    if (title.includes('ai') || title.includes('machine') || cat.includes('ai')) return '/images/blog-ai.jpg';
    const fallbacks = ['/images/blog-mern.jpg', '/images/blog-devops.jpg', '/images/blog-ai.jpg'];
    return fallbacks[index % fallbacks.length];
  };

  const coverUrl = getCoverImage();
  const viewsCount = typeof article.views === 'number' ? (article.views >= 1000 ? `${(article.views / 1000).toFixed(1)}K` : article.views) : 0;

  return (
    <motion.article
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[#0E1116] border border-white/10 hover:border-crimson/50 hover:shadow-[0_0_25px_rgba(225,29,72,0.2)] transition-all duration-300"
    >
      <div className="p-4 sm:p-5">
        {/* Cover Image Container with Diagonal Arrow Button */}
        <Link to={`/blog/${article.slug}`} className="relative block aspect-[16/10] overflow-hidden rounded-xl mb-4">
          <img
            src={coverUrl}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/blog-mern.jpg';
            }}
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E1116]/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

          {/* Top-Right Diagonal Arrow Link Button (Exact Match to Reference Image) */}
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#07080B]/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-crimson group-hover:border-crimson transition-colors shadow-lg">
            <ArrowUpRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </div>
        </Link>

        {/* Category Pill Tag */}
        <div className="mb-3">
          <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-crimson text-white shadow-[0_0_8px_rgba(225,29,72,0.4)]">
            {categoryName}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold font-heading text-white group-hover:text-crimson transition-colors line-clamp-2 leading-snug mb-4">
          <Link to={`/blog/${article.slug}`}>
            {article.title}
          </Link>
        </h3>
      </div>

      {/* Card Footer: Date, Reading Time, and Views */}
      <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono">
        {/* Date */}
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{dateFormatted}</span>
        </div>

        {/* Read Time */}
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{article.readingTime || 6} min read</span>
        </div>

        {/* Views */}
        <div className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>{viewsCount}</span>
        </div>
      </div>
    </motion.article>
  );
}
