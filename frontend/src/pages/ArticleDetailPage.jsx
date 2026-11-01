import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Eye, Calendar, Share2, Bookmark, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { api } from '../services/api';
import { pageVariants } from '../animations/variants';
import ReadingProgress from '../components/blog/ReadingProgress';
import TableOfContents from '../components/blog/TableOfContents';
import LikeButton from '../components/blog/LikeButton';
import CommentSection from '../components/blog/CommentSection';

export default function ArticleDetailPage() {
  const { slug } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    api.getArticle(slug)
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
          if (res.article?.title) {
            document.title = `${res.article.title} | Ayush Jha`;
          }
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || 'Article not found');
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
      document.title = 'Ayush Jha | Ideas. Code. Progress.';
    };
  }, [slug]);

  // Sync bookmark state
  useEffect(() => {
    if (!slug) return;
    try {
      const saved = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      setIsBookmarked(saved.includes(slug));
    } catch {
      setIsBookmarked(false);
    }
  }, [slug]);

  const toggleBookmark = () => {
    try {
      let saved = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      if (saved.includes(slug)) {
        saved = saved.filter((s) => s !== slug);
        setIsBookmarked(false);
      } else {
        saved.push(slug);
        setIsBookmarked(true);
      }
      localStorage.setItem('bookmarks', JSON.stringify(saved));
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data?.article?.title,
          url: window.location.href,
        });
        return;
      } catch {
        // user cancelled or failed, fallback to clipboard
      }
    }
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Add copy buttons to rendered code blocks inside prose
  useEffect(() => {
    if (!data?.contentHtml) return;

    const timer = setTimeout(() => {
      const codeBlocks = document.querySelectorAll('.prose pre');
      codeBlocks.forEach((pre) => {
        if (pre.querySelector('.copy-code-btn')) return;

        const btn = document.createElement('button');
        btn.className = 'copy-code-btn absolute top-3 right-3 px-2.5 py-1 text-[11px] font-mono rounded bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all flex items-center gap-1 cursor-pointer';
        btn.innerHTML = '<span>Copy</span>';

        btn.onclick = () => {
          const code = pre.querySelector('code')?.innerText || pre.innerText;
          navigator.clipboard.writeText(code);
          btn.innerHTML = '<span class="text-emerald-400 font-bold">Copied!</span>';
          setTimeout(() => {
            btn.innerHTML = '<span>Copy</span>';
          }, 2000);
        };

        pre.style.position = 'relative';
        pre.appendChild(btn);
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [data?.contentHtml]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-8 animate-pulse">
        <div className="h-6 w-48 rounded bg-surface-elevated" />
        <div className="h-12 w-3/4 rounded bg-surface-elevated" />
        <div className="h-96 rounded-3xl bg-surface-elevated" />
        <div className="space-y-4">
          <div className="h-4 rounded bg-surface-elevated w-full" />
          <div className="h-4 rounded bg-surface-elevated w-5/6" />
          <div className="h-4 rounded bg-surface-elevated w-4/6" />
        </div>
      </div>
    );
  }

  if (error || !data?.article) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-3xl font-bold font-heading text-primary">Article Not Found</h1>
        <p className="text-secondary text-sm">
          {error || "The article you're looking for doesn't exist or is currently in draft mode."}
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-crimson text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all articles</span>
        </Link>
      </div>
    );
  }

  const { article, contentHtml, tableOfContents, relatedArticles, prevArticle, nextArticle, comments, author } = data;
  const dateFormatted = new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <ReadingProgress />

      <motion.article
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8"
      >
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-muted">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-crimson font-medium">{article.category}</span>
        </nav>

        {/* Article Header */}
        <header className="space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-primary tracking-tight leading-tight">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-base sm:text-xl text-secondary leading-relaxed">
              {article.subtitle}
            </p>
          )}

          {/* Author and Metadata Bar */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-y border-subtle py-4">
            <div className="flex items-center gap-3">
              <img
                src={author.profileImage || '/images/profile.jpg'}
                alt={author.name || 'Ayush Jha'}
                className="w-11 h-11 rounded-full object-cover border border-subtle"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/profile.jpg';
                }}
              />
              <div>
                <div className="text-sm font-bold text-primary">{author.name || 'Ayush Jha'}</div>
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
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.views || 0} views
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Action Controls */}
            <div className="flex items-center gap-2">
              <LikeButton slug={article.slug} initialLikes={article.likes || 0} />

              <button
                type="button"
                onClick={toggleBookmark}
                aria-label="Bookmark article"
                className={`p-2.5 rounded-full border transition-all ${
                  isBookmarked
                    ? 'bg-crimson text-white border-crimson'
                    : 'bg-surface text-secondary hover:text-primary hover:border-crimson/30 border-subtle'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-white' : ''}`} />
              </button>

              <button
                type="button"
                onClick={handleShare}
                aria-label="Share article"
                className="p-2.5 rounded-full border border-subtle bg-surface text-secondary hover:text-primary hover:border-crimson/30 transition-all relative"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                {copied && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black text-white text-[10px] font-bold whitespace-nowrap shadow">
                    Link Copied!
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Full-width Hero Cover Image */}
        {article.coverImage && (
          <div className="overflow-hidden rounded-3xl max-h-[460px] border border-subtle shadow-xl bg-surface-elevated">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/article-productivity.jpg';
              }}
            />
          </div>
        )}

        {/* Reading Grid: Main Prose + Sticky TOC Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Article Prose Content */}
          <div className="lg:col-span-8 min-w-0">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            {/* Tags footer */}
            {article.tags && article.tags.length > 0 && (
              <div className="pt-8 mt-10 border-t border-subtle flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-muted mr-1">Tags:</span>
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/blog?q=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 rounded-lg bg-surface-elevated border border-subtle hover:border-crimson/40 text-xs font-semibold text-secondary hover:text-crimson transition-all"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sticky Sidebar (TOC & Related Articles) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Table of Contents */}
            <TableOfContents items={tableOfContents} />

            {/* Related Articles */}
            {relatedArticles && relatedArticles.length > 0 && (
              <div className="p-6 rounded-3xl bg-surface border border-subtle shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
                  Related Articles
                </h3>
                <div className="space-y-3">
                  {relatedArticles.map((rel) => (
                    <Link
                      key={rel.slug}
                      to={`/blog/${rel.slug}`}
                      className="flex items-center gap-3 group"
                    >
                      <img
                        src={rel.coverImage || '/images/article-productivity.jpg'}
                        alt={rel.title}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-subtle group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/article-productivity.jpg';
                        }}
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-primary group-hover:text-crimson transition-colors line-clamp-2 leading-snug">
                          {rel.title}
                        </h4>
                        <span className="text-[11px] text-muted">
                          {new Date(rel.publishedAt || rel.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Prev / Next Articles Navigation */}
        {(prevArticle || nextArticle) && (
          <nav className="pt-8 mt-10 border-t border-subtle grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevArticle ? (
              <Link
                to={`/blog/${prevArticle.slug}`}
                className="p-5 rounded-2xl bg-surface border border-subtle hover:border-crimson/30 transition-all flex items-center gap-3 group"
              >
                <ArrowLeft className="w-5 h-5 text-crimson group-hover:-translate-x-1 transition-transform shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Previous</div>
                  <div className="text-sm font-bold text-primary group-hover:text-crimson transition-colors line-clamp-1">
                    {prevArticle.title}
                  </div>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextArticle && (
              <Link
                to={`/blog/${nextArticle.slug}`}
                className="p-5 rounded-2xl bg-surface border border-subtle hover:border-crimson/30 transition-all flex items-center justify-end text-right gap-3 group sm:col-start-2"
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Next</div>
                  <div className="text-sm font-bold text-primary group-hover:text-crimson transition-colors line-clamp-1">
                    {nextArticle.title}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-crimson group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
            )}
          </nav>
        )}

        {/* Comments Section */}
        <CommentSection slug={article.slug} initialComments={comments || []} />
      </motion.article>
    </>
  );
}
