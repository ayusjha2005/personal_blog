const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Article = require('../models/Article');
const Profile = require('../models/Profile');
const ContactMessage = require('../models/ContactMessage');
const SiteSettings = require('../models/SiteSettings');
const User = require('../models/User');
const { CATEGORIES, SLUG_TO_NAME } = require('../config/categories');
const articleService = require('../services/articleService');
const { renderMarkdown, extractHeadings } = require('../utils/markdown');
const { ensureAuthenticated } = require('../middleware/auth');
const { commentLimiter, likeLimiter, contactLimiter, loginLimiter } = require('../middleware/rateLimiter');
const { contactValidationRules, articleValidationRules } = require('../middleware/validation');
const { handleUploadError, processImageUpload, deleteOldUpload } = require('../middleware/upload');
const { validationResult } = require('express-validator');

// Helper to resolve image paths
function resolveImage(imgUrl, fallback = '/images/article-productivity.jpg') {
  if (!imgUrl) return fallback;
  if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) return imgUrl;
  if (imgUrl.startsWith('/')) return imgUrl;
  return '/' + imgUrl;
}

// GET /api/health - Health check endpoint for cloud monitoring and deployment uptime
router.get('/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const status = isDbConnected ? 200 : 503;
  res.status(status).json({
    status: isDbConnected ? 'ok' : 'degraded',
    uptime: Math.floor(process.uptime()),
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// ──────────────────────────────────────────
// 1. PUBLIC API ROUTES
// ──────────────────────────────────────────

// GET /api/categories
router.get('/categories', (req, res) => {
  res.json({ categories: CATEGORIES });
});

// GET /api/profile
router.get('/profile', async (req, res, next) => {
  try {
    let profile = await Profile.findOne().lean();
    if (!profile) {
      profile = {
        name: 'Ayush Jha',
        heroHeadline: 'Ideas. Code. Progress.',
        bio: "I'm Ayush Jha, a computer science student who loves building things, learning new technologies, and exploring how software can solve real-world problems.",
        extendedBio: "I'm interested in software development, backend engineering, databases, Linux, and practical project building. I enjoy learning by experimenting, solving problems, and turning ideas into working applications.",
        tagline: 'Learning in public, building in private.',
        heroScriptQuote: 'Better Code, Brighter Days',
        aboutScriptQuote: 'Just a guy who loves building things.',
        contactScriptQuote: "Let's Build Something Amazing.",
        profileImage: '/images/profile.jpg',
        degree: 'B.Tech CSE (CSBS) @ VIT-AP',
        location: 'Based in India',
        statusText: 'Always learning',
        socialLinks: {
          github: 'https://github.com/ayusjha2005',
          linkedin: 'https://www.linkedin.com/in/kumar-ayush-322294385/',
          twitter: 'https://x.com/ayushjha',
          instagram: 'https://instagram.com/ayushjha',
          email: 'ayushjha@gmail.com',
        },
      };
    }
    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

// GET /api/home
router.get('/home', async (req, res, next) => {
  try {
    const [featuredArticle, latestArticles, profile] = await Promise.all([
      articleService.getFeaturedArticle(),
      articleService.getLatestArticles(3),
      Profile.findOne().lean(),
    ]);

    res.json({
      featuredArticle,
      latestArticles,
      categories: CATEGORIES,
      profile: profile || {},
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/articles - List with filters, search, sort, pagination
router.get('/articles', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const category = req.query.category || null;
    const search = req.query.q || req.query.search || null;
    const sort = req.query.sort || 'newest';

    const result = await articleService.getArticles({ page, limit, category, search, sort });
    res.json({
      ...result,
      categories: CATEGORIES,
      currentCategory: category,
      searchQuery: search,
      sortOrder: sort,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/articles/:slug - Detail
router.get('/articles/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const isAdmin = Boolean(req.session && req.session.userId);

    let article;
    if (!isAdmin) {
      article = await Article.findOneAndUpdate(
        { slug, status: 'published' },
        { $inc: { views: 1 } },
        { new: true }
      );
    } else {
      article = await Article.findOne({ slug });
    }

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const contentHtml = renderMarkdown(article.content);
    const tableOfContents = extractHeadings(article.content);

    const [relatedArticles, { prev, next: nextArticle }, profile] = await Promise.all([
      articleService.getRelatedArticles(article, 3),
      articleService.getPrevNextArticles(article),
      Profile.findOne().lean(),
    ]);

    const articleObj = article.toObject();
    const comments = (articleObj.comments || [])
      .filter((c) => c.approved !== false)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      article: articleObj,
      contentHtml,
      tableOfContents,
      relatedArticles,
      prevArticle: prev,
      nextArticle: nextArticle,
      comments,
      author: profile || {},
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/articles/:slug/like
router.post('/articles/:slug/like', likeLimiter, async (req, res, next) => {
  try {
    const { slug } = req.params;
    const article = await Article.findOne({ slug });
    if (!article) return res.status(404).json({ error: 'Article not found' });

    article.likes = (article.likes || 0) + 1;
    await article.save();

    res.json({ likes: article.likes });
  } catch (err) {
    next(err);
  }
});

// POST /api/articles/:slug/comment
router.post('/articles/:slug/comment', commentLimiter, async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { name, email, body } = req.body;

    if (!name || !name.trim() || !body || !body.trim()) {
      return res.status(400).json({ error: 'Name and comment body are required' });
    }

    const article = await Article.findOne({ slug });
    if (!article) return res.status(404).json({ error: 'Article not found' });

    const newComment = {
      name: name.trim().slice(0, 80),
      email: (email || '').trim().slice(0, 200),
      body: body.trim().slice(0, 2000),
      approved: true,
      createdAt: new Date(),
    };

    article.comments.push(newComment);
    await article.save();

    const created = article.comments[article.comments.length - 1];
    res.status(201).json({ success: true, comment: created });
  } catch (err) {
    next(err);
  }
});

// POST /api/contact - Submit contact form
router.post('/contact', contactLimiter, contactValidationRules, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, email, subject, message, honeypot } = req.body;

    // Honeypot check
    if (honeypot) {
      return res.json({ success: true, message: 'Message received' });
    }

    const newMsg = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: (subject || 'General Inquiry').trim(),
      message: message.trim(),
      ipAddress: req.ip || '',
    });

    res.status(201).json({ success: true, message: "Thank you! Your message has been sent successfully. I'll get back to you soon." });
  } catch (err) {
    next(err);
  }
});

// GET /api/activity - Developer Contribution Heatmap
router.get('/activity', async (req, res, next) => {
  try {
    const articles = await Article.find({}, 'title createdAt publishedAt status views').lean();
    
    // Generate dates for the past 365 days
    const today = new Date();
    const daysMap = {};
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      daysMap[dateStr] = 0;
    }

    // Populate activity from article publications & creations
    articles.forEach(art => {
      const d = (art.publishedAt || art.createdAt);
      if (d) {
        const dateStr = new Date(d).toISOString().split('T')[0];
        if (daysMap[dateStr] !== undefined) {
          daysMap[dateStr] += 3; // 3 points for article
        }
      }
    });

    // Add deterministic simulated daily coding / writing points based on day of week & month to create a realistic GitHub-style developer graph
    Object.keys(daysMap).forEach((dateStr, idx) => {
      const dt = new Date(dateStr);
      const day = dt.getDay();
      // higher activity on weekdays, random commit pulses
      const seed = (dt.getDate() * 13 + dt.getMonth() * 7 + day * 5) % 17;
      if (seed > 10) {
        daysMap[dateStr] += (seed % 4) + 1;
      }
    });

    const activityData = Object.keys(daysMap).map(date => ({
      date,
      count: daysMap[date],
    })).reverse();

    const totalContributions = activityData.reduce((acc, curr) => acc + curr.count, 0);

    res.json({
      totalContributions,
      activity: activityData,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/leaderboard - Top articles, views, reading time stats
router.get('/leaderboard', async (req, res, next) => {
  try {
    const [topViewed, topLiked, categoryCounts] = await Promise.all([
      Article.find({ status: 'published' }).sort({ views: -1 }).limit(5).select('title slug views likes readingTime category coverImage').lean(),
      Article.find({ status: 'published' }).sort({ likes: -1 }).limit(5).select('title slug views likes readingTime category coverImage').lean(),
      Article.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$category', count: { $sum: 1 }, totalViews: { $sum: '$views' } } },
        { $sort: { count: -1 } }
      ]),
    ]);

    res.json({
      topViewed,
      topLiked,
      categories: categoryCounts.map(c => ({
        name: c._id,
        count: c.count,
        totalViews: c.totalViews,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────
// 2. AUTHENTICATION API ROUTES
// ──────────────────────────────────────────

// GET /api/auth/me - Current user session check
router.get('/auth/me', (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({
      isAuthenticated: true,
      user: {
        id: req.session.userId,
        name: req.session.userName || 'Admin',
        role: req.session.userRole || 'admin',
      },
    });
  }
  res.json({ isAuthenticated: false, user: null });
});

// POST /api/auth/login
router.post('/auth/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Check email and password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Check email and password.' });
    }

    // Regenerate session to prevent session fixation
    req.session.regenerate((err) => {
      if (err) return next(err);

      req.session.userId = user._id;
      req.session.userName = user.name;
      req.session.userRole = user.role;

      res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/auth/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// ──────────────────────────────────────────
// 3. PROTECTED ADMIN API ROUTES
// ──────────────────────────────────────────

router.use('/admin', ensureAuthenticated);

// GET /api/admin/stats
router.get('/admin/stats', async (req, res, next) => {
  try {
    const [stats, unreadCount, recentArticles, recentMessages] = await Promise.all([
      articleService.getStats(),
      ContactMessage.countDocuments({ status: 'unread' }),
      Article.find().sort({ createdAt: -1 }).limit(5).lean(),
      ContactMessage.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    res.json({
      stats,
      unreadCount,
      recentArticles,
      recentMessages,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/articles
router.get('/admin/articles', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const status = req.query.status || null;
    const search = req.query.search || req.query.q || null;

    const result = await articleService.getAdminArticles({ page, limit, status, search });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/articles/:id
router.get('/admin/articles/:id', async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json({ article, categories: CATEGORIES });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/articles - Create article
router.post('/admin/articles', handleUploadError('coverImage'), articleValidationRules, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { title, subtitle, category, tags, isFeatured, status, excerpt, content, coverImage: coverImageUrl } = req.body;

    let coverImagePath = coverImageUrl || '/images/article-productivity.jpg';
    let coverImagePublicId = null;

    if (req.file) {
      try {
        const uploadResult = await processImageUpload(req.file, 'personal-blog/articles');
        if (uploadResult) {
          coverImagePath = uploadResult.url;
          coverImagePublicId = uploadResult.publicId;
        }
      } catch (uploadErr) {
        console.error('[Upload failed]:', uploadErr.message);
      }
    }

    const parsedTags = typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : (Array.isArray(tags) ? tags : []);

    const newArticle = await articleService.createArticle({
      title: title.trim(),
      subtitle: (subtitle || '').trim(),
      category: category.trim(),
      tags: parsedTags,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      status: status || 'draft',
      excerpt: excerpt.trim(),
      content: content.trim(),
      coverImage: coverImagePath,
      coverImagePublicId,
    });

    res.status(201).json({ success: true, article: newArticle });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/articles/:id - Update article
router.put('/admin/articles/:id', handleUploadError('coverImage'), articleValidationRules, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });

    const { title, subtitle, category, tags, isFeatured, status, excerpt, content, coverImage: coverImageUrl } = req.body;

    let coverImagePath = article.coverImage;
    let coverImagePublicId = article.coverImagePublicId;

    if (req.file) {
      try {
        const uploadResult = await processImageUpload(req.file, 'personal-blog/articles');
        if (uploadResult) {
          if (article.coverImage) {
            await deleteOldUpload(article.coverImage, article.coverImagePublicId);
          }
          coverImagePath = uploadResult.url;
          coverImagePublicId = uploadResult.publicId;
        }
      } catch (uploadErr) {
        console.error('[Upload error]:', uploadErr.message);
      }
    } else if (coverImageUrl && coverImageUrl !== article.coverImage) {
      coverImagePath = coverImageUrl;
    }

    const parsedTags = typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : (Array.isArray(tags) ? tags : article.tags);

    const updated = await articleService.updateArticle(req.params.id, {
      title: title.trim(),
      subtitle: (subtitle || '').trim(),
      category: category.trim(),
      tags: parsedTags,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      status: status || article.status,
      excerpt: excerpt.trim(),
      content: content.trim(),
      coverImage: coverImagePath,
      coverImagePublicId,
    });

    res.json({ success: true, article: updated });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/articles/:id/toggle - Toggle published/draft
router.post('/admin/articles/:id/toggle', async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });

    article.status = article.status === 'published' ? 'draft' : 'published';
    if (article.status === 'published' && !article.publishedAt) {
      article.publishedAt = new Date();
    }
    await article.save();

    res.json({ success: true, status: article.status });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/articles/:id
router.delete('/admin/articles/:id', async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });

    if (article.coverImage || article.coverImagePublicId) {
      await deleteOldUpload(article.coverImage, article.coverImagePublicId);
    }

    await articleService.deleteArticle(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/comments
router.get('/admin/comments', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const search = req.query.search || null;

    const result = await articleService.getAllComments({ page, limit, search });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/comments/:articleId/:commentId
router.delete('/admin/comments/:articleId/:commentId', async (req, res, next) => {
  try {
    const { articleId, commentId } = req.params;
    const article = await Article.findById(articleId);
    if (!article) return res.status(404).json({ error: 'Article not found' });

    const commentIndex = article.comments.findIndex(c => c._id.toString() === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Comment not found or already deleted' });
    }

    article.comments.splice(commentIndex, 1);
    await article.save();

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/messages
router.get('/admin/messages', async (req, res, next) => {
  try {
    const status = req.query.status || null;
    const query = {};
    if (status && ['read', 'unread'].includes(status)) {
      query.status = status;
    }

    const [messages, unreadCount, totalMessages] = await Promise.all([
      ContactMessage.find(query).sort({ createdAt: -1 }).lean(),
      ContactMessage.countDocuments({ status: 'unread' }),
      ContactMessage.countDocuments(),
    ]);

    res.json({ messages, unreadCount, totalMessages });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/messages/:id/mark
router.patch('/admin/messages/:id/mark', async (req, res, next) => {
  try {
    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    msg.status = msg.status === 'read' ? 'unread' : 'read';
    await msg.save();

    res.json({ success: true, status: msg.status });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/messages/:id
router.delete('/admin/messages/:id', async (req, res, next) => {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/profile
router.get('/admin/profile', async (req, res, next) => {
  try {
    let profile = await Profile.findOne().lean();
    res.json({ profile: profile || {} });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/profile
router.put('/admin/profile', handleUploadError('profileImage'), async (req, res, next) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) profile = new Profile();

    const {
      name,
      heroHeadline,
      bio,
      extendedBio,
      tagline,
      heroScriptQuote,
      aboutScriptQuote,
      contactScriptQuote,
      degree,
      location,
      statusText,
      contactEmail,
      footerText,
      seoTitle,
      seoDescription,
    } = req.body;

    if (name) profile.name = name.trim();
    if (heroHeadline) profile.heroHeadline = heroHeadline.trim();
    if (bio) profile.bio = bio.trim();
    if (extendedBio) profile.extendedBio = extendedBio.trim();
    if (tagline) profile.tagline = tagline.trim();
    if (heroScriptQuote) profile.heroScriptQuote = heroScriptQuote.trim();
    if (aboutScriptQuote) profile.aboutScriptQuote = aboutScriptQuote.trim();
    if (contactScriptQuote) profile.contactScriptQuote = contactScriptQuote.trim();
    if (degree) profile.degree = degree.trim();
    if (location) profile.location = location.trim();
    if (statusText) profile.statusText = statusText.trim();
    if (contactEmail) profile.contactEmail = contactEmail.trim().toLowerCase();
    if (footerText) profile.footerText = footerText.trim();
    if (seoTitle) profile.seoTitle = seoTitle.trim();
    if (seoDescription) profile.seoDescription = seoDescription.trim();

    // Parse social links
    if (req.body.github || req.body.linkedin || req.body.twitter || req.body.instagram) {
      profile.socialLinks = {
        github: req.body.github || profile.socialLinks.github,
        linkedin: req.body.linkedin || profile.socialLinks.linkedin,
        twitter: req.body.twitter || profile.socialLinks.twitter,
        instagram: req.body.instagram || profile.socialLinks.instagram,
        email: req.body.socialEmail || profile.socialLinks.email,
      };
    }

    if (req.file) {
      try {
        const uploadResult = await processImageUpload(req.file, 'personal-blog/profile');
        if (uploadResult) {
          if (profile.profileImage) {
            await deleteOldUpload(profile.profileImage, profile.profileImagePublicId);
          }
          profile.profileImage = uploadResult.url;
          profile.profileImagePublicId = uploadResult.publicId;
        }
      } catch (uploadErr) {
        console.error('[Upload failed]:', uploadErr.message);
      }
    }

    await profile.save();
    res.json({ success: true, profile });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/settings
router.get('/admin/settings', async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne().lean();
    res.json({ settings: settings || {} });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/settings
router.put('/admin/settings', async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = new SiteSettings();

    const { websiteTitle, websiteDescription, postsPerPage, contactEmail, footerContent, allowPublicIndexing } = req.body;

    if (websiteTitle) settings.websiteTitle = websiteTitle.trim();
    if (websiteDescription) settings.websiteDescription = websiteDescription.trim();
    if (postsPerPage) settings.postsPerPage = Math.max(1, parseInt(postsPerPage, 10));
    if (contactEmail) settings.contactEmail = contactEmail.trim().toLowerCase();
    if (footerContent) settings.footerContent = footerContent.trim();
    if (allowPublicIndexing !== undefined) settings.allowPublicIndexing = allowPublicIndexing === 'true' || allowPublicIndexing === true;

    await settings.save();
    res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
