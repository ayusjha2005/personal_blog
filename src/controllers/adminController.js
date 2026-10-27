const User = require('../models/User');
const Category = require('../models/Category');
const Article = require('../models/Article');
const Profile = require('../models/Profile');
const SiteSettings = require('../models/SiteSettings');
const ContactMessage = require('../models/ContactMessage');
const articleService = require('../services/articleService');
const profileService = require('../services/profileService');
const contactService = require('../services/contactService');
const slugify = require('slugify');
const { deleteOldUpload } = require('../middleware/upload');

// Admin Auth
function getLogin(req, res) {
  res.render('admin/login', {
    title: 'Admin Login | Ayush Jha',
    error: null,
    email: '',
    layout: false,
  });
}

async function postLogin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).render('admin/login', {
        title: 'Admin Login | Ayush Jha',
        error: 'Please provide both email and password.',
        email: email || '',
        layout: false,
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).render('admin/login', {
        title: 'Admin Login | Ayush Jha',
        error: 'Invalid email or password credentials.',
        email,
        layout: false,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).render('admin/login', {
        title: 'Admin Login | Ayush Jha',
        error: 'Invalid email or password credentials.',
        email,
        layout: false,
      });
    }

    // Regenerate session to prevent session fixation
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
      }
      req.session.userId = user._id;
      req.session.userName = user.name;
      req.session.userRole = user.role;

      const returnTo = req.session.returnTo || '/admin';
      delete req.session.returnTo;
      res.redirect(returnTo);
    });
  } catch (error) {
    res.status(500).render('admin/login', {
      title: 'Admin Login | Ayush Jha',
      error: 'An unexpected server error occurred during login.',
      email: req.body.email || '',
      layout: false,
    });
  }
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/admin/login');
  });
}

// Dashboard
async function getDashboard(req, res, next) {
  try {
    const [stats, recentArticles, recentMessages, unreadCount] = await Promise.all([
      articleService.getStats(),
      Article.find().sort({ createdAt: -1 }).limit(5).populate('category').lean(),
      ContactMessage.find().sort({ createdAt: -1 }).limit(5).lean(),
      contactService.getUnreadCount(),
    ]);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard | Ayush Jha',
      activeAdmin: 'dashboard',
      stats,
      unreadCount,
      recentArticles,
      recentMessages,
      layout: false,
    });
  } catch (error) {
    next(error);
  }
}

// Articles List
async function getArticles(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const status = req.query.status || null;
    const search = req.query.q || null;

    const [result, unreadCount] = await Promise.all([
      articleService.getAdminArticles({ page, limit: 10, status, search }),
      contactService.getUnreadCount(),
    ]);

    res.render('admin/articles', {
      title: 'Manage Articles | Admin',
      activeAdmin: 'articles',
      articles: result.articles,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalArticles: result.totalArticles,
      currentStatus: status,
      searchQuery: search,
      unreadCount,
      layout: false,
    });
  } catch (error) {
    next(error);
  }
}

// New Article Form
async function getNewArticle(req, res, next) {
  try {
    const [categories, unreadCount] = await Promise.all([
      Category.find().sort({ order: 1, name: 1 }).lean(),
      contactService.getUnreadCount(),
    ]);

    res.render('admin/article-form', {
      title: 'Create New Article | Admin',
      activeAdmin: 'articles',
      article: {},
      categories,
      unreadCount,
      isEdit: false,
      error: null,
      layout: false,
    });
  } catch (error) {
    next(error);
  }
}

// Create Article Post
async function postNewArticle(req, res, next) {
  try {
    const { title, slug, subtitle, excerpt, content, category, tags, status, isFeatured } = req.body;
    const categories = await Category.find().sort({ order: 1, name: 1 }).lean();
    const unreadCount = await contactService.getUnreadCount();

    // Handle upload errors from middleware
    if (req.uploadError) {
      return res.status(400).render('admin/article-form', {
        title: 'Create New Article | Admin',
        activeAdmin: 'articles',
        article: req.body,
        categories,
        unreadCount,
        isEdit: false,
        error: req.uploadError,
        layout: false,
      });
    }

    // Check slug uniqueness
    const generatedSlug = slug ? slugify(slug, { lower: true, strict: true }) : slugify(title, { lower: true, strict: true });
    const existingSlug = await Article.findOne({ slug: generatedSlug });
    if (existingSlug) {
      return res.status(400).render('admin/article-form', {
        title: 'Create New Article | Admin',
        activeAdmin: 'articles',
        article: req.body,
        categories,
        unreadCount,
        isEdit: false,
        error: `An article with slug "${generatedSlug}" already exists. Please choose a unique slug.`,
        layout: false,
      });
    }

    const tagsArray = tags
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    // Determine cover image: uploaded file first, then fallback
    let coverImagePath = '/images/article-productivity.jpg';
    if (req.file) {
      coverImagePath = `/uploads/${req.file.filename}`;
    } else if (req.body.coverImage) {
      coverImagePath = req.body.coverImage;
    }

    await articleService.createArticle({
      title,
      slug: generatedSlug,
      subtitle: subtitle || '',
      excerpt,
      content,
      category,
      tags: tagsArray,
      coverImage: coverImagePath,
      status: status || 'draft',
      isFeatured: isFeatured === 'true' || isFeatured === true || isFeatured === 'on',
      publishedAt: status === 'published' ? new Date() : null,
    });

    res.redirect('/admin/articles');
  } catch (error) {
    next(error);
  }
}

// Edit Article Form
async function getEditArticle(req, res, next) {
  try {
    const { id } = req.params;
    const [article, categories, unreadCount] = await Promise.all([
      Article.findById(id).lean(),
      Category.find().sort({ order: 1, name: 1 }).lean(),
      contactService.getUnreadCount(),
    ]);

    if (!article) {
      return res.redirect('/admin/articles');
    }

    res.render('admin/article-form', {
      title: `Edit: ${article.title} | Admin`,
      activeAdmin: 'articles',
      article,
      categories,
      unreadCount,
      isEdit: true,
      error: null,
      layout: false,
    });
  } catch (error) {
    next(error);
  }
}

// Edit Article Post
async function postEditArticle(req, res, next) {
  try {
    const { id } = req.params;
    const { title, slug, subtitle, excerpt, content, category, tags, status, isFeatured } = req.body;
    const categories = await Category.find().sort({ order: 1, name: 1 }).lean();
    const unreadCount = await contactService.getUnreadCount();

    // Handle upload errors from middleware
    if (req.uploadError) {
      const articleData = await Article.findById(id).lean();
      return res.status(400).render('admin/article-form', {
        title: `Edit Article | Admin`,
        activeAdmin: 'articles',
        article: { ...req.body, _id: id, coverImage: articleData ? articleData.coverImage : '' },
        categories,
        unreadCount,
        isEdit: true,
        error: req.uploadError,
        layout: false,
      });
    }

    const generatedSlug = slug ? slugify(slug, { lower: true, strict: true }) : slugify(title, { lower: true, strict: true });
    const existingSlug = await Article.findOne({ slug: generatedSlug, _id: { $ne: id } });
    if (existingSlug) {
      return res.status(400).render('admin/article-form', {
        title: `Edit Article | Admin`,
        activeAdmin: 'articles',
        article: { ...req.body, _id: id },
        categories,
        unreadCount,
        isEdit: true,
        error: `An article with slug "${generatedSlug}" already exists.`,
        layout: false,
      });
    }

    const tagsArray = tags
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const existingArticle = await Article.findById(id);
    let publishedAt = existingArticle.publishedAt;
    if (status === 'published' && !publishedAt) {
      publishedAt = new Date();
    }

    // Determine cover image: uploaded file > retain existing
    let coverImagePath = existingArticle.coverImage;
    if (req.file) {
      coverImagePath = `/uploads/${req.file.filename}`;
      // Clean up old uploaded file
      deleteOldUpload(existingArticle.coverImage);
    } else if (req.body.existingCoverImage) {
      coverImagePath = req.body.existingCoverImage;
    }

    await articleService.updateArticle(id, {
      title,
      slug: generatedSlug,
      subtitle: subtitle || '',
      excerpt,
      content,
      category,
      tags: tagsArray,
      coverImage: coverImagePath,
      status: status || 'draft',
      isFeatured: isFeatured === 'true' || isFeatured === true || isFeatured === 'on',
      publishedAt,
    });

    res.redirect('/admin/articles');
  } catch (error) {
    next(error);
  }
}

// Delete Article
async function postDeleteArticle(req, res, next) {
  try {
    const { id } = req.params;
    const article = await Article.findById(id).lean();
    if (article && article.coverImage) {
      deleteOldUpload(article.coverImage);
    }
    await articleService.deleteArticle(id);
    res.redirect('/admin/articles');
  } catch (error) {
    next(error);
  }
}

// Profile Settings
async function getProfile(req, res, next) {
  try {
    const [profile, unreadCount] = await Promise.all([
      profileService.getProfile(),
      contactService.getUnreadCount(),
    ]);

    res.render('admin/profile', {
      title: 'Site & Profile Settings | Admin',
      activeAdmin: 'profile',
      profile,
      unreadCount,
      success: null,
      error: null,
      layout: false,
    });
  } catch (error) {
    next(error);
  }
}

async function postProfile(req, res, next) {
  try {
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
      github,
      linkedin,
      twitter,
      instagram,
      youtube,
      email,
      contactEmail,
      footerText,
      seoTitle,
      seoDescription,
    } = req.body;

    // Handle upload errors from middleware
    if (req.uploadError) {
      const [currentProfile, unreadCount] = await Promise.all([
        profileService.getProfile(),
        contactService.getUnreadCount(),
      ]);
      return res.status(400).render('admin/profile', {
        title: 'Site & Profile Settings | Admin',
        activeAdmin: 'profile',
        profile: currentProfile,
        unreadCount,
        success: null,
        error: req.uploadError,
        layout: false,
      });
    }

    // Determine profile image: uploaded file > existing
    const existingProfile = await profileService.getProfile();
    let profileImagePath = existingProfile.profileImage || '/images/profile.jpg';
    if (req.file) {
      profileImagePath = `/uploads/${req.file.filename}`;
      deleteOldUpload(existingProfile.profileImage);
    } else if (req.body.existingProfileImage) {
      profileImagePath = req.body.existingProfileImage;
    } else if (req.body.profileImage) {
      profileImagePath = req.body.profileImage;
    }

    await profileService.updateProfile({
      name,
      heroHeadline,
      bio,
      extendedBio,
      tagline,
      heroScriptQuote,
      aboutScriptQuote,
      contactScriptQuote,
      profileImage: profileImagePath,
      degree,
      location,
      statusText,
      socialLinks: {
        github,
        linkedin,
        twitter,
        instagram,
        youtube: youtube || '',
        email,
      },
      contactEmail,
      footerText,
      seoTitle,
      seoDescription,
    });

    const [updatedProfile, unreadCount] = await Promise.all([
      profileService.getProfile(),
      contactService.getUnreadCount(),
    ]);

    res.render('admin/profile', {
      title: 'Site & Profile Settings | Admin',
      activeAdmin: 'profile',
      profile: updatedProfile,
      unreadCount,
      success: 'Profile and site settings saved successfully!',
      error: null,
      layout: false,
    });
  } catch (error) {
    next(error);
  }
}

// Messages Inbox
async function getMessages(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const status = req.query.status || null;

    const result = await contactService.getMessages({ page, limit: 15, status });

    res.render('admin/messages', {
      title: 'Contact Messages | Admin',
      activeAdmin: 'messages',
      messages: result.messages,
      totalMessages: result.totalMessages,
      unreadCount: result.unreadCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      currentStatus: status,
      layout: false,
    });
  } catch (error) {
    next(error);
  }
}

async function postMarkMessage(req, res, next) {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (action === 'unread') {
      await contactService.markAsUnread(id);
    } else {
      await contactService.markAsRead(id);
    }

    res.redirect('/admin/messages');
  } catch (error) {
    next(error);
  }
}

async function postDeleteMessage(req, res, next) {
  try {
    const { id } = req.params;
    await contactService.deleteMessage(id);
    res.redirect('/admin/messages');
  } catch (error) {
    next(error);
  }
}

// Toggle article draft / published status
async function postToggleStatus(req, res, next) {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);
    if (article) {
      article.status = article.status === 'published' ? 'draft' : 'published';
      if (article.status === 'published' && !article.publishedAt) {
        article.publishedAt = new Date();
      }
      await article.save();
    }
    res.redirect('/admin/articles');
  } catch (error) {
    next(error);
  }
}

// Dedicated Site Settings Page
async function getSettings(req, res, next) {
  try {
    let settings = await SiteSettings.findOne().lean();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    const unreadCount = await contactService.getUnreadCount();

    res.render('admin/settings', {
      title: 'Site Settings | Admin',
      activeAdmin: 'settings',
      settings,
      unreadCount,
      success: null,
      error: null,
      layout: false,
    });
  } catch (error) {
    next(error);
  }
}

async function postSettings(req, res, next) {
  try {
    const {
      websiteTitle,
      websiteDescription,
      postsPerPage,
      contactEmail,
      footerContent,
      github,
      linkedin,
      twitter,
      instagram,
      youtube,
      email,
    } = req.body;

    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings();
    }

    settings.websiteTitle = websiteTitle || 'Ayush Jha | Ideas. Code. Progress.';
    settings.websiteDescription = websiteDescription || '';
    settings.postsPerPage = Math.max(1, parseInt(postsPerPage, 10) || 6);
    settings.contactEmail = contactEmail || 'ayushjha@gmail.com';
    settings.footerContent = footerContent || '© 2026 Ayush Jha. All rights reserved.';
    settings.socialLinks = {
      github: github || '',
      linkedin: linkedin || '',
      twitter: twitter || '',
      instagram: instagram || '',
      youtube: youtube || '',
      email: email || '',
    };

    await settings.save();
    const unreadCount = await contactService.getUnreadCount();

    res.render('admin/settings', {
      title: 'Site Settings | Admin',
      activeAdmin: 'settings',
      settings: settings.toObject(),
      unreadCount,
      success: 'Website settings saved successfully!',
      error: null,
      layout: false,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLogin,
  postLogin,
  logout,
  getDashboard,
  getArticles,
  getNewArticle,
  postNewArticle,
  getEditArticle,
  postEditArticle,
  postDeleteArticle,
  postToggleStatus,
  getProfile,
  postProfile,
  getSettings,
  postSettings,
  getMessages,
  postMarkMessage,
  postDeleteMessage,
};
