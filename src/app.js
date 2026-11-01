require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const helmet = require('helmet');

const Profile = require('./models/Profile');
const { formatDate, formatISODate, truncate, resolveImage } = require('./utils/helpers');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

// Route imports
const publicRoutes = require('./routes/publicRoutes');
const blogRoutes = require('./routes/blogRoutes');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

// Set Trust Proxy for correct IP retrieval behind reverse proxies (Render / Cloudflare)
app.set('trust proxy', 1);

// View engine setup for fallback EJS templates
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

// ──────────────────────────────────────────────────────────
// 1. FAST STATIC ASSETS (Served before session & DB queries)
// ──────────────────────────────────────────────────────────
// Public uploads, images, icons
app.use(express.static(path.join(__dirname, '../public'), { maxAge: '1d' }));

// React frontend production build assets
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist, { maxAge: '1d' }));
}

// ──────────────────────────────────────────────────────────
// 2. PARSERS & SESSIONS
// ──────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
if (process.env.NODE_ENV === 'production') {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.includes('dev')) {
    console.error('[FATAL CONFIG ERROR] Strong SESSION_SECRET environment variable is required in production.');
    process.exit(1);
  }
}

const mongoURI =
  process.env.MONGODB_URI ||
  process.env.MONGODB_ATLAS_URI ||
  'mongodb://127.0.0.1:27017/ayush_personal_blog';
const isAtlas = mongoURI.includes('+srv') || mongoURI.includes('mongodb.net');
const sessionStore =
  process.env.NODE_ENV === 'test'
    ? new session.MemoryStore()
    : MongoStore.create({
        mongoUrl: mongoURI,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60, // 14 days
        autoRemove: 'native',
        // Node.js v24 (OpenSSL 3.x) TLS compatibility for MongoDB Atlas
        ...(isAtlas && { mongoOptions: { tls: true, minDHSize: 1024 } }),
      });

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'ayush_blog_session_secret_dev',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    proxy: true, // Required for reverse proxies on Render
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 14 * 24 * 60 * 60 * 1000,
    },
  })
);

// ──────────────────────────────────────────────────────────
// 3. EJS TEMPLATE CONTEXT (Only runs for non-API, non-asset requests)
// ──────────────────────────────────────────────────────────
let cachedProfile = null;
let lastProfileFetch = 0;

const defaultProfile = {
  name: 'Ayush Jha',
  heroHeadline: 'Ideas. Code. Progress.',
  bio: "I'm Ayush Jha, a computer science student who loves building things, learning new technologies, and exploring how software can solve real-world problems.",
  tagline: 'Learning in public, building in private.',
  socialLinks: {
    github: 'https://github.com/ayusjha2005',
    linkedin: 'https://www.linkedin.com/in/kumar-ayush-322294385/',
    twitter: 'https://x.com/ayushjha',
    instagram: 'https://instagram.com/ayushjha',
    email: 'reach2kr.ayush@gmail.com',
  },
};

app.use(async (req, res, next) => {
  // Skip database query for API routes, health checks, sitemaps and static assets
  if (
    req.path.startsWith('/api') ||
    req.path.startsWith('/assets') ||
    req.path.startsWith('/images') ||
    req.path.startsWith('/uploads') ||
    req.path === '/health' ||
    req.path === '/robots.txt' ||
    req.path === '/sitemap.xml'
  ) {
    return next();
  }

  try {
    const now = Date.now();
    // Cache profile in memory for 30 seconds; maxTimeMS prevents slow queries from hanging
    if (!cachedProfile || now - lastProfileFetch > 30000) {
      cachedProfile = await Profile.findOne().lean().maxTimeMS(3000).catch(() => null);
      lastProfileFetch = now;
    }

    res.locals.profile = cachedProfile || defaultProfile;
    res.locals.currentPath = req.path;
    res.locals.activePage = req.path.split('/')[1] || 'home';
    res.locals.isAuth = Boolean(req.session && req.session.userId);
    res.locals.userName = req.session ? req.session.userName : null;

    // Helpers
    res.locals.formatDate = formatDate;
    res.locals.formatISODate = formatISODate;
    res.locals.truncate = truncate;
    res.locals.resolveImage = resolveImage;

    next();
  } catch (error) {
    // Graceful degradation: never block response if profile fetch fails
    res.locals.profile = defaultProfile;
    next();
  }
});

// ──────────────────────────────────────────────────────────
// 4. API ROUTES
// ──────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ──────────────────────────────────────────────────────────
// 5. REACT SPA SERVING & FALLBACK ROUTES
// ──────────────────────────────────────────────────────────
if (fs.existsSync(frontendDist)) {
  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/images') ||
      req.path.startsWith('/uploads') ||
      req.path.startsWith('/css') ||
      req.path.startsWith('/js') ||
      req.path === '/health' ||
      req.path === '/sitemap.xml' ||
      req.path === '/robots.txt'
    ) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Fallback to legacy server routes (when React build is absent or for direct POSTs)
app.use('/', publicRoutes);
app.use('/blog', blogRoutes);
app.use('/contact', contactRoutes);
app.use('/admin', adminRoutes);

// ──────────────────────────────────────────────────────────
// 6. 404 & GLOBAL ERROR HANDLING
// ──────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
