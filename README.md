# Ayush Jha — Personal Tech Blog

A full-stack, production-ready personal technology blog website built for **Ayush Jha** using **Node.js**, **Express.js**, **EJS**, and **MongoDB / Mongoose**. Designed with meticulous visual fidelity to match the editorial, warm aesthetic with cinematic hero imagery, clean typography, dark/light themes, an administrative dashboard, and responsive layouts.

---

## 🌟 Key Features

### 1. Frontend & User Experience
- **Cinematic Hero**: Mountain summit photography with headline *"Ideas. Code. Progress."*, personal introduction, call-to-action buttons (*"Read Latest Post"* and *"About Me"*), and the signature cursive phrase *"Better Code, Brighter Days"*.
- **Topic Navigation**: Quick category filters for *Web Development*, *DSA & Algorithms*, *Linux & Tools*, *Projects & Hackathons*, and *Career & Internships*.
- **Featured Article Card**: Prominently displays the featured post with reading time, category badge, excerpt, and smooth hover elevation.
- **Latest Posts Grid**: 3-card responsive grid highlighting recent writings.
- **Blog Listing Page (`/blog`)**:
  - Live server-side full-text search against title, excerpt, and tags.
  - Category selector dropdown and interactive filter chips.
  - Compact article rows with thumbnails, category badges, reading time, and interactive bookmarks.
  - Server-side pagination with query parameter preservation.
- **Article Reading Page (`/blog/:slug`)**:
  - Top sticky reading progress bar calculated dynamically from page scroll.
  - Clean breadcrumbs navigation (`Home > Blog > Category`).
  - Table of Contents sidebar with active intersection observer tracking.
  - Syntax-highlighted code blocks with top file badge (e.g. `< settings.json`) and a one-click clipboard **Copy** button with state feedback.
  - Related articles and adjacent previous/next article preview cards.
- **About Page (`/about`)**:
  - Profile photo card with carousel dots and handwritten quote *"Just a guy who loves building things."*
  - Detailed bio, education badge (*B.Tech CSE (CSBS) @ VIT-AP*), location (*Based in India*), and status (*Always learning*).
  - Configurable social links (GitHub, LinkedIn, Twitter/X, Instagram).
  - *"What I Write About"* cards with dedicated color palettes and SVG icons.
- **Contact Page (`/contact`)**:
  - Split editorial layout with a moody mountain card and handwritten quote *"Let's Build Something Amazing."*
  - Robust form with client-side and server-side validation (rate limiting, email normalization, spam honeypot protection).
  - Persists directly to MongoDB with success/error alerts.
- **Zero-FOUC Dark/Light Mode**:
  - Warm light theme: `#FAF9F6` background, `#FFFFFF` surface, `#171717` text.
  - Sophisticated dark theme: `#0E1010` background, `#17191D` surface, `#F3F4F6` text.
  - Early inline `<head>` detection to eliminate any flash of unstyled content.

### 2. Administrative Control Panel (`/admin`)
- **Secure Authentication**:
  - Persistent server sessions stored in MongoDB via `connect-mongo`.
  - Passwords hashed with `bcryptjs`.
  - Brute-force rate limiting on `/admin/login`.
  - Automatic session regeneration upon login.
- **Live Statistics Overview**: Total published articles, drafts, views, and unread contact messages.
- **Article Management (`/admin/articles`)**:
  - Create, edit, and delete articles.
  - Draft vs. published status toggling.
  - Mark single featured article.
  - Split Markdown editor with instant live client-side preview.
  - Automatic slug generation with uniqueness validation.
- **Site & Profile Settings (`/admin/profile`)**:
  - Modify author bio, hero headline, personal tagline, cursive quotes, education, location, social links, and SEO defaults without touching source code.
- **Contact Inbox (`/admin/messages`)**:
  - View incoming messages with full detail modal.
  - Mark messages as read/unread or delete with confirmation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Runtime & Backend** | Node.js (v24), Express.js |
| **Database & ODM** | MongoDB, Mongoose |
| **Session & Auth** | `express-session`, `connect-mongo`, `bcryptjs` |
| **Templates** | EJS (Server-rendered with modular partials) |
| **Styling** | Vanilla CSS3 (Custom CSS variables, responsive design, zero frontend frameworks) |
| **Typography** | Google Fonts: *Plus Jakarta Sans*, *Caveat* (cursive script), *JetBrains Mono* (code) |
| **Security & Utilities** | `helmet`, `express-rate-limit`, `express-validator`, `marked`, `sanitize-html`, `slugify` |
| **Testing** | Jest, Supertest (15 automated integration tests) |

---

## 📁 Project Directory Structure

```
ayush-personal-blog/
├── src/
│   ├── app.js                 # Express application configuration & middlewares
│   ├── server.js              # Server entry point & DB connection
│   ├── config/
│   │   └── database.js        # Mongoose connection handler
│   ├── controllers/
│   │   ├── homeController.js   # Homepage logic
│   │   ├── blogController.js   # Article listing & reading pages
│   │   ├── pageController.js   # About page
│   │   ├── contactController.js# Contact form processing
│   │   └── adminController.js  # Dashboard, articles CRUD, profile, inbox
│   ├── models/
│   │   ├── Article.js         # Article schema, reading time calculation & indexes
│   │   ├── Category.js        # Category schema
│   │   ├── ContactMessage.js  # Messages schema
│   │   ├── Profile.js         # Site & profile configuration schema
│   │   └── User.js            # Admin user schema with bcrypt hashing
│   ├── routes/
│   │   ├── publicRoutes.js    # Routes for / and /about
│   │   ├── blogRoutes.js      # Routes for /blog and /blog/:slug
│   │   ├── contactRoutes.js   # Routes for /contact
│   │   └── adminRoutes.js     # Protected admin endpoints
│   ├── middleware/
│   │   ├── auth.js            # ensureAuthenticated & redirectIfAuthenticated
│   │   ├── errorHandler.js    # 404 & 500 branded handlers
│   │   ├── rateLimiter.js     # Rate limiters for login & contact form
│   │   └── validation.js      # Form validation rules
│   ├── services/
│   │   ├── articleService.js  # Article DB queries & business logic
│   │   ├── contactService.js  # Contact DB queries
│   │   └── profileService.js  # Profile settings service
│   ├── utils/
│   │   ├── helpers.js         # Date & text formatters
│   │   └── markdown.js        # Markdown renderer & XSS sanitizer
│   └── seed/
│       └── seed.js            # Initial database seeder
├── views/
│   ├── layouts/
│   ├── partials/
│   │   ├── head.ejs           # SEO & zero-FOUC theme script
│   │   ├── navbar.ejs         # Header navigation
│   │   ├── footer.ejs         # Footer
│   │   ├── article-card.ejs   # 3-grid card
│   │   ├── article-row.ejs    # Compact blog listing row
│   │   └── pagination.ejs     # Server-side pagination
│   ├── pages/
│   │   ├── home.ejs           # Home page
│   │   ├── blog.ejs           # Blog listing page
│   │   ├── article.ejs        # Single article reading page
│   │   ├── about.ejs          # About page
│   │   ├── contact.ejs        # Contact page
│   │   ├── 404.ejs            # Branded 404 page
│   │   └── 500.ejs            # Branded 500 page
│   └── admin/
│       ├── sidebar.ejs        # Admin navigation sidebar
│       ├── login.ejs          # Admin login
│       ├── dashboard.ejs      # Overview & statistics
│       ├── articles.ejs       # Article table & filters
│       ├── article-form.ejs   # Markdown editor with live preview
│       ├── profile.ejs        # Settings editor
│       └── messages.ejs       # Contact messages inbox
├── public/
│   ├── css/
│   │   ├── themes.css         # Theme variables (light & dark mode tokens)
│   │   ├── main.css           # Core styling
│   │   ├── responsive.css     # Mobile & tablet viewports
│   │   └── admin.css          # Admin portal styling
│   ├── js/
│   │   ├── theme.js           # Theme toggle & persistence
│   │   ├── main.js            # Nav, bookmarking, toasts, sharing
│   │   └── article.js         # Reading progress, code copying, TOC tracking
│   └── images/                # High-resolution photographic assets
├── tests/
│   └── integration/
│       ├── publicRoutes.test.js # Public route tests
│       └── adminAuth.test.js    # Auth & admin CRUD tests
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** running locally on default port `27017` (or MongoDB Atlas connection URI)

### 2. Installation
```bash
# Clone the repository and navigate into it
cd personal_blog

# Install dependencies
npm install
```

### 3. Environment Setup
Configure your `.env` file (copied from `.env.example`):
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ayush_personal_blog
SESSION_SECRET=ayush_super_secret_session_key_2026_dev
ADMIN_EMAIL=ayush@example.com
ADMIN_PASSWORD=adminpassword123
ADMIN_NAME="Ayush Jha"
SITE_URL=http://localhost:3000
```

### 4. Database Seeding
Populate the database with the initial articles, categories, admin credentials, and profile details matching the reference design:
```bash
npm run seed
```

### 5. Running the Application
```bash
# Start server in production mode
npm start

# Or run with live file reloading
npm run dev
```
Open your browser and visit **`http://localhost:3000`**.

### 6. Admin Login Credentials
- **URL**: `http://localhost:3000/admin/login`
- **Email**: `ayush@example.com`
- **Password**: `adminpassword123`

---

## ☁️ Production Deployment Guide

### 1. Production Environment Variables
Set the following on your hosting provider (Render, Railway, DigitalOcean, AWS):
```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ayush_personal_blog?retryWrites=true&w=majority
SESSION_SECRET=<generate_a_random_64_character_hex_string>
ADMIN_EMAIL=your-real-email@example.com
ADMIN_PASSWORD=your-secure-strong-password
ADMIN_NAME="Ayush Jha"
SITE_URL=https://yourdomain.com
```

### 2. Persistent Upload Storage
Uploaded cover images and profile pictures are written to `public/uploads/`.
- **Render / Railway / Fly.io**: Attach a **Persistent Disk** mounted at `public/uploads/`.
- **Docker / VPS**: Bind mount a host volume: `-v /var/data/blog-uploads:/app/public/uploads`.
- **Serverless / Ephemeral**: Connect cloud storage (e.g. AWS S3, Cloudinary) to replace local disk storage in `src/middleware/upload.js`.

### 3. Health Checks
The application exposes a lightweight health check endpoint for uptime monitors and load balancers:
- **`GET /health`** returns `200 OK` with `{ status: "ok", uptime: <seconds>, database: "connected" }`.

---

## 🧪 Running Automated Tests

Run the full automated test suite (Jest + Supertest):
```bash
node ./node_modules/jest/bin/jest.js --runInBand --detectOpenHandles
# Or:
npm test
```
All 25 integration tests covering public endpoints, article reading, search filtering, contact form validation, authentication, and article authoring will execute.
