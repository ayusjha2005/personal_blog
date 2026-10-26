const articleService = require('../services/articleService');
const Category = require('../models/Category');
const Article = require('../models/Article');
const { renderMarkdown, extractHeadings } = require('../utils/markdown');

async function getBlogListing(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const category = req.query.category || null;
    const search = req.query.q || req.query.search || null;
    const sort = req.query.sort || 'newest';

    const [categories, result] = await Promise.all([
      Category.find().sort({ order: 1, name: 1 }).lean(),
      articleService.getArticles({ page, limit: 6, category, search, sort }),
    ]);

    res.render('pages/blog', {
      title: 'All Articles | Ayush Jha',
      activePage: 'blog',
      articles: result.articles,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalArticles: result.totalArticles,
      categories,
      currentCategory: category,
      searchQuery: search,
      sortOrder: sort,
    });
  } catch (error) {
    next(error);
  }
}

async function getArticleDetail(req, res, next) {
  try {
    const { slug } = req.params;
    const isAdmin = Boolean(req.session && req.session.userId);

    const article = await articleService.getArticleBySlug(slug, isAdmin);

    if (!article) {
      return res.status(404).render('pages/404', {
        title: 'Article Not Found | Ayush Jha',
        activePage: 'blog',
        message: 'The requested article could not be found or has not been published yet.',
      });
    }

    // Increment views asynchronously
    if (article.status === 'published') {
      Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } }).exec();
    }

    // Render markdown content to sanitized HTML
    const contentHtml = renderMarkdown(article.content);
    const tableOfContents = extractHeadings(article.content);

    // Fetch related articles & previous/next
    const [relatedArticles, { prev, next: nextArticle }] = await Promise.all([
      articleService.getRelatedArticles(article, 3),
      articleService.getPrevNextArticles(article),
    ]);

    res.render('pages/article', {
      title: `${article.title} | Ayush Jha`,
      activePage: 'blog',
      article,
      contentHtml,
      tableOfContents,
      relatedArticles,
      prevArticle: prev,
      nextArticle: nextArticle,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBlogListing,
  getArticleDetail,
};
