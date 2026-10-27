require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const helmet = require('helmet');

const Profile = require('./models/Profile');
const { formatDate, formatISODate, truncate } = require('./utils/helpers');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

// Route imports
const publicRoutes = require('./routes/publicRoutes');
const blogRoutes = require('./routes/blogRoutes');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Set Trust Proxy for correct IP retrieval behind reverse proxies
app.set('trust proxy', 1);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Security & Compression middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(compression());

// Body Parsers & Cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Files
app.use(express.static(path.join(__dirname, '../public'), { maxAge: '1d' }));

// Session configuration
if (process.env.NODE_ENV === 'production') {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.includes('dev')) {
    console.error('[FATAL CONFIG ERROR] Strong SESSION_SECRET environment variable is required in production.');
    process.exit(1);
  }
}

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ayush_personal_blog';
const isAtlas = mongoURI.includes('+srv') || mongoURI.includes('mongodb.net');
const sessionStore =
  process.env.NODE_ENV === 'test'
    ? new session.MemoryStore()
    : MongoStore.create({
        mongoUrl: mongoURI,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60, // 14 days
        autoRemove: 'native',
        // Workaround: Node.js v24 (OpenSSL 3.x) TLS compat for Atlas
        ...(isAtlas && { mongoOptions: { tls: true, minDHSize: 1024 } }),
      });

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'ayush_blog_session_secret_dev',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    proxy: true, // Crucial for reverse proxies / Heroku / Render / Cloudflare
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 14 * 24 * 60 * 60 * 1000,
    },
  })
);

// Global Template Context Middleware
let cachedProfile = null;
let lastProfileFetch = 0;

app.use(async (req, res, next) => {
  try {
    const now = Date.now();
    // Cache profile for 30 seconds to minimize unnecessary DB queries while allowing updates
    if (!cachedProfile || now - lastProfileFetch > 30000) {
      cachedProfile = await Profile.findOne().lean();
      lastProfileFetch = now;
    }

    res.locals.profile = cachedProfile || {
      name: 'Ayush Jha',
      heroHeadline: 'Ideas. Code. Progress.',
      bio: "I'm Ayush Jha, a computer science student who loves building things, learning new technologies, and exploring how software can solve real-world problems.",
      tagline: 'Learning in public, building in private.',
      socialLinks: {
        github: 'https://github.com/ayushjha',
        linkedin: 'https://linkedin.com/in/ayushjha',
        twitter: 'https://x.com/ayushjha',
        instagram: 'https://instagram.com/ayushjha',
        email: 'reach2kr.ayush@gmail.com',
      },
    };

    res.locals.currentPath = req.path;
    res.locals.activePage = req.path.split('/')[1] || 'home';
    res.locals.isAuth = Boolean(req.session && req.session.userId);
    res.locals.userName = req.session ? req.session.userName : null;

    // Helpers
    res.locals.formatDate = formatDate;
    res.locals.formatISODate = formatISODate;
    res.locals.truncate = truncate;

    next();
  } catch (error) {
    next(error);
  }
});

// Mount Routes
app.use('/', publicRoutes);
app.use('/blog', blogRoutes);
app.use('/contact', contactRoutes);
app.use('/admin', adminRoutes);

// 404 & Global Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
