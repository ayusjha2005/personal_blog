const Article = require('../models/Article');
const { SLUG_TO_NAME } = require('../config/categories');

class ArticleService {
  async getFeaturedArticle() {
    let featured = await Article.findOne({ isFeatured: true, status: 'published' })
      .lean();

    if (!featured) {
      featured = await Article.findOne({ status: 'published' })
        .sort({ publishedAt: -1, createdAt: -1 })
        .lean();
    }
    return featured;
  }

  async getLatestArticles(limit = 3, excludeId = null) {
    const query = { status: 'published' };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    return Article.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async getArticles({ page = 1, limit = 6, category = null, search = null, sort = 'newest' }) {
    const query = { status: 'published' };

    // Filter by Category slug if provided
    if (category && category !== 'all') {
      const catName = SLUG_TO_NAME[category.toLowerCase()];
      if (catName) {
        query.category = catName;
      } else {
        // If non-existent category queried, return empty
        return { articles: [], totalArticles: 0, totalPages: 0, currentPage: page };
      }
    }

    // Safe search filter
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const cleanSearch = search.trim();
      const searchRegex = new RegExp(cleanSearch.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { tags: searchRegex },
      ];
    }

    // Sort order
    const sortCriteria = sort === 'oldest' ? { publishedAt: 1, createdAt: 1 } : { publishedAt: -1, createdAt: -1 };

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * limit;
    const totalArticles = await Article.countDocuments(query);
    const totalPages = Math.ceil(totalArticles / limit) || 1;

    const articles = await Article.find(query)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      articles,
      totalArticles,
      totalPages,
      currentPage: Math.max(1, parseInt(page, 10)),
    };
  }

  async getArticleBySlug(slug, isAdmin = false) {
    const query = { slug };
    if (!isAdmin) {
      query.status = 'published';
    }
    return Article.findOne(query);
  }

  async getRelatedArticles(currentArticle, limit = 3) {
    return Article.find({
      _id: { $ne: currentArticle._id },
      status: 'published',
      $or: [
        { category: currentArticle.category },
        { tags: { $in: currentArticle.tags || [] } },
      ],
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();
  }

  async getPrevNextArticles(currentArticle) {
    const prev = await Article.findOne({
      status: 'published',
      publishedAt: { $lt: currentArticle.publishedAt || currentArticle.createdAt },
    })
      .sort({ publishedAt: -1, createdAt: -1 })
      .select('title slug coverImage publishedAt')
      .lean();

    const next = await Article.findOne({
      status: 'published',
      publishedAt: { $gt: currentArticle.publishedAt || currentArticle.createdAt },
    })
      .sort({ publishedAt: 1, createdAt: 1 })
      .select('title slug coverImage publishedAt')
      .lean();

    return { prev, next };
  }

  async getAdminArticles({ page = 1, limit = 10, status = null, search = null }) {
    const query = {};
    if (status && ['draft', 'published'].includes(status)) {
      query.status = status;
    }
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchRegex = new RegExp(search.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      query.$or = [{ title: searchRegex }, { excerpt: searchRegex }];
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * limit;
    const totalArticles = await Article.countDocuments(query);
    const totalPages = Math.ceil(totalArticles / limit) || 1;

    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      articles,
      totalArticles,
      totalPages,
      currentPage: Math.max(1, parseInt(page, 10)),
    };
  }

  async createArticle(data) {
    if (data.isFeatured) {
      await Article.updateMany({}, { isFeatured: false });
    }
    return Article.create(data);
  }

  async updateArticle(id, data) {
    if (data.isFeatured) {
      await Article.updateMany({ _id: { $ne: id } }, { isFeatured: false });
    }
    return Article.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteArticle(id) {
    return Article.findByIdAndDelete(id);
  }

  async getStats() {
    const [totalPublished, totalDrafts, totalViews] = await Promise.all([
      Article.countDocuments({ status: 'published' }),
      Article.countDocuments({ status: 'draft' }),
      Article.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    ]);

    return {
      totalPublished,
      totalDrafts,
      totalArticles: totalPublished + totalDrafts,
      totalViews: totalViews[0]?.total || 0,
    };
  }
}

module.exports = new ArticleService();
