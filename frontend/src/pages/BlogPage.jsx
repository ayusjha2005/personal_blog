import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronLeft, ChevronRight, X, Newspaper } from 'lucide-react';
import { api } from '../services/api';
import { pageVariants, staggerContainer } from '../animations/variants';
import ArticleRow from '../components/blog/ArticleRow';

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCategory = searchParams.get('category') || 'all';
  const currentQuery = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSort = searchParams.get('sort') || 'newest';

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [loading, setLoading] = useState(true);

 
  const [searchInput, setSearchInput] = useState(currentQuery);

  // Sync state if URL changes
  useEffect(() => {
    setSearchInput(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    document.title = 'Articles & Engineering Notes | Ayush Jha';
    let mounted = true;
    setLoading(true);

    api.getArticles({
      page: currentPage,
      limit: 6,
      category: currentCategory,
      q: currentQuery,
      sort: currentSort,
    })
      .then((res) => {
        if (mounted) {
          setArticles(res.articles || []);
          setTotalPages(res.totalPages || 1);
          setTotalArticles(res.totalArticles || 0);
          if (res.categories) setCategories(res.categories);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load articles:', err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [currentCategory, currentQuery, currentPage, currentSort]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (!value || value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // reset to page 1 on filter/search change
    if (key !== 'page') {
      params.set('page', '1');
    }
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('q', searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8"
    >
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson/10 text-crimson text-xs font-bold uppercase tracking-wider">
          <Newspaper className="w-3.5 h-3.5" />
          <span>The Archive</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-primary tracking-tight">
          All Articles
        </h1>
        <p className="text-sm sm:text-base text-secondary max-w-xl">
          Deep-dives, tutorials, architectural patterns, and lessons learned across web development, backend systems, and computer science.
        </p>
      </div>

      {/* Controls Bar: Search & Category Dropdown */}
      <div className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search articles, keywords, or topics..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-surface border border-subtle focus:border-crimson focus:outline-none text-sm text-primary transition-colors shadow-sm"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateParam('q', '');
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex gap-2">
            <select
              value={currentCategory}
              onChange={(e) => updateParam('category', e.target.value)}
              className="px-4 py-3 rounded-2xl bg-surface border border-subtle focus:border-crimson focus:outline-none text-xs sm:text-sm font-semibold text-primary transition-colors shadow-sm cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Sort Select */}
            <select
              value={currentSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="px-4 py-3 rounded-2xl bg-surface border border-subtle focus:border-crimson focus:outline-none text-xs sm:text-sm font-semibold text-primary transition-colors shadow-sm cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </form>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => updateParam('category', 'all')}
            className={`px-3.5 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap ${
              currentCategory === 'all'
                ? 'bg-crimson text-white shadow-sm'
                : 'bg-surface border border-subtle text-secondary hover:text-primary hover:bg-surface-elevated'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => updateParam('category', cat.slug)}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap ${
                currentCategory === cat.slug
                  ? 'bg-crimson text-white shadow-sm'
                  : 'bg-surface border border-subtle text-secondary hover:text-primary hover:bg-surface-elevated'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Listing */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-3xl bg-surface border border-subtle animate-pulse" />
            ))}
          </div>
        ) : articles.length > 0 ? (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
            {articles.map((article) => (
              <ArticleRow key={article._id || article.slug} article={article} />
            ))}
          </motion.div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-surface border border-subtle space-y-4 shadow-sm">
            <Filter className="w-10 h-10 text-muted mx-auto" />
            <h3 className="text-lg font-bold font-heading text-primary">No articles found</h3>
            <p className="text-xs sm:text-sm text-secondary max-w-sm mx-auto">
              We couldn't find any articles matching your search criteria. Try modifying your filters or clear them completely.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="px-5 py-2.5 rounded-full bg-crimson text-white text-xs font-bold hover:bg-crimson-hover transition-colors shadow-sm"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-6 flex items-center justify-between border-t border-subtle text-xs">
          <span className="text-muted">
            Page <strong className="text-primary">{currentPage}</strong> of <strong className="text-primary">{totalPages}</strong> ({totalArticles} articles)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => updateParam('page', currentPage - 1)}
              className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-surface border border-subtle text-secondary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => updateParam('page', currentPage + 1)}
              className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-surface border border-subtle text-secondary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
