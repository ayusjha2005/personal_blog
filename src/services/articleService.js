const mongoose = require('mongoose');
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
    const [totalPublished, totalDrafts, totalViews, commentsResult] = await Promise.all([
      Article.countDocuments({ status: 'published' }),
      Article.countDocuments({ status: 'draft' }),
      Article.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      Article.aggregate([
        { $project: { count: { $size: { $ifNull: ['$comments', []] } } } },
        { $group: { _id: null, total: { $sum: '$count' } } },
      ]),
    ]);

    return {
      totalPublished,
      totalDrafts,
      totalArticles: totalPublished + totalDrafts,
      totalViews: totalViews[0]?.total || 0,
      totalComments: commentsResult[0]?.total || 0,
    };
  }

  async getTotalCommentsCount() {
    const result = await Article.aggregate([
      { $project: { count: { $size: { $ifNull: ['$comments', []] } } } },
      { $group: { _id: null, total: { $sum: '$count' } } },
    ]);
    return result[0]?.total || 0;
  }

  async getAllComments({ page = 1, limit = 15, search = null, articleId = null }) {
    const matchStage = {};
    if (articleId && mongoose.Types.ObjectId.isValid(articleId)) {
      matchStage._id = new mongoose.Types.ObjectId(articleId);
    }

    const pipeline = [];
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push({ $unwind: '$comments' });

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const cleanSearch = search.trim();
      const searchRegex = new RegExp(cleanSearch.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      pipeline.push({
        $match: {
          $or: [
            { 'comments.name': searchRegex },
            { 'comments.email': searchRegex },
            { 'comments.body': searchRegex },
            { title: searchRegex },
          ],
        },
      });
    }

    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Article.aggregate(countPipeline);
    const totalComments = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalComments / limit) || 1;
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * limit;

    pipeline.push(
      { $sort: { 'comments.createdAt': -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: '$comments._id',
          articleId: '$_id',
          articleTitle: '$title',
          articleSlug: '$slug',
          name: '$comments.name',
          email: '$comments.email',
          body: '$comments.body',
          approved: '$comments.approved',
          createdAt: '$comments.createdAt',
        },
      }
    );

    const comments = await Article.aggregate(pipeline);

    return {
      comments,
      totalComments,
      totalPages,
      currentPage: Math.max(1, parseInt(page, 10)),
    };
  }

  async deleteComment(commentId) {
    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
      return { success: false, reason: 'invalid_id' };
    }

    const objectId = new mongoose.Types.ObjectId(commentId);
    const article = await Article.findOne({ 'comments._id': objectId });
    if (!article) {
      return { success: false, reason: 'not_found' };
    }

    article.comments.pull({ _id: objectId });
    await article.save();

    return {
      success: true,
      commentId: commentId.toString(),
      articleId: article._id.toString(),
      articleSlug: article.slug,
      articleTitle: article.title,
    };
  }
}

module.exports = new ArticleService();
