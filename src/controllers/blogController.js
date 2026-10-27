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

    // If published, increment views and get the updated document
    let article;
    if (!isAdmin) {
      article = await Article.findOneAndUpdate(
        { slug, status: 'published' },
        { $inc: { views: 1 } },
        { new: true }
      ).populate('category');
    } else {
      article = await Article.findOne({ slug }).populate('category');
    }

    if (!article) {
      return res.status(404).render('pages/404', {
        title: 'Article Not Found | Ayush Jha',
        activePage: 'blog',
        message: 'The requested article could not be found or has not been published yet.',
      });
    }

    // Render markdown content to sanitized HTML
    const contentHtml = renderMarkdown(article.content);
    const tableOfContents = extractHeadings(article.content);

    // Fetch related articles & previous/next
    const [relatedArticles, { prev, next: nextArticle }] = await Promise.all([
      articleService.getRelatedArticles(article, 3),
      articleService.getPrevNextArticles(article),
    ]);

    // Convert to plain JS object so EJS has direct access to all properties
    const articleObj = article.toObject();

    // Load approved comments (most recent first)
    const comments = (articleObj.comments || [])
      .filter((c) => c.approved !== false)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.render('pages/article', {
      title: `${articleObj.title} | Ayush Jha`,
      activePage: 'blog',
      article: articleObj,
      contentHtml,
      tableOfContents,
      relatedArticles,
      prevArticle: prev,
      nextArticle: nextArticle,
      comments,
    });
  } catch (error) {
    next(error);
  }
}

// POST /blog/:slug/like — toggle-like via fetch (returns JSON)
async function postLike(req, res, next) {
  try {
    const { slug } = req.params;
    const article = await Article.findOne({ slug });
    if (!article) return res.status(404).json({ error: 'Not found' });

    article.likes = (article.likes || 0) + 1;
    await article.save();

    res.json({ likes: article.likes });
  } catch (error) {
    next(error);
  }
}

// POST /blog/:slug/comment — submit a comment (form POST, redirects back)
async function postComment(req, res, next) {
  try {
    const { slug } = req.params;
    const { name, email, body } = req.body;

    if (!name || !body) {
      return res.redirect(`/blog/${slug}#comments`);
    }

    const article = await Article.findOne({ slug });
    if (!article) return res.status(404).send('Article not found');

    article.comments.push({
      name: name.trim().slice(0, 80),
      email: (email || '').trim().slice(0, 200),
      body: body.trim().slice(0, 2000),
      approved: true,
    });
    await article.save();

    res.redirect(`/blog/${slug}#comments`);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBlogListing,
  getArticleDetail,
  postLike,
  postComment,
};
