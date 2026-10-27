const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Article = require('../../src/models/Article');
const { CATEGORIES } = require('../../src/config/categories');

let agent;
let testAdmin;
let testArticle;

beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ayush_personal_blog_test';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  agent = request.agent(app);

  // Clean and seed an admin
  await User.deleteMany({ email: 'responsive_admin@test.com' });
  testAdmin = new User({
    name: 'Responsive Admin',
    email: 'responsive_admin@test.com',
    password: 'Password123!',
    role: 'admin',
    bio: 'Admin for responsive tests'
  });
  await testAdmin.save();

  // Create a test article
  testArticle = new Article({
    title: 'Mobile Responsive Audit Guide',
    slug: 'mobile-responsive-audit-guide-' + Date.now(),
    excerpt: 'How we audited and optimized the blog for mobile viewports.',
    content: '## Heading\n\nResponsive reading content with a code block:\n\n```js\nconst x = 1;\n```',
    category: 'Web Development',
    tags: ['mobile', 'css'],
    status: 'published',
    publishedAt: new Date()
  });
  await testArticle.save();

  // Authenticate agent
  const loginRes = await agent
    .post('/admin/login')
    .send({ email: 'responsive_admin@test.com', password: 'Password123!' });
  expect([200, 302]).toContain(loginRes.status);
});

afterAll(async () => {
  if (testArticle) {
    await Article.findByIdAndDelete(testArticle._id);
  }
  if (testAdmin) {
    await User.findByIdAndDelete(testAdmin._id);
  }
  await mongoose.connection.close();
});

describe('Mobile Responsiveness & Viewport Audit', () => {
  test('Public pages include correct viewport meta tag', async () => {
    const pages = ['/', '/blog', '/about', '/contact', '/admin/login', `/blog/${testArticle.slug}`];
    for (const page of pages) {
      const res = await request(app).get(page);
      expect(res.status).toBe(200);
      expect(res.text).toMatch(/<meta\s+name=["']viewport["']\s+content=["']width=device-width,\s*initial-scale=1\.0["']/i);
    }
  });

  test('Public pages render mobile navigation elements', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('mobile-menu-btn');
    expect(res.text).toContain('mobile-nav-drawer');
    expect(res.text).toContain('mobile-nav-link');
  });

  test('Blog listing includes category filter chips and category dropdown', async () => {
    const res = await request(app).get('/blog');
    expect(res.status).toBe(200);
    expect(res.text).toContain('chips-bar');
    expect(res.text).toContain('category-dropdown-select');
    for (const cat of CATEGORIES) {
      const escaped = cat.name.replace(/&/g, '&amp;');
      expect(res.text).toContain(escaped);
    }
  });

  test('Admin pages include viewport meta tag and mobile sidebar drawer elements', async () => {
    const adminPages = ['/admin', '/admin/articles', '/admin/articles/new', '/admin/messages', '/admin/profile', '/admin/settings'];
    for (const page of adminPages) {
      const res = await agent.get(page);
      if (res.status === 302) {
        throw new Error(`Admin page ${page} redirected to ${res.headers.location}. Check authentication.`);
      }
      expect(res.status).toBe(200);
      expect(res.text).toMatch(/<meta\s+name=["']viewport["']\s+content=["']width=device-width,\s*initial-scale=1\.0["']/i);
      expect(res.text).toContain('admin-menu-btn');
      expect(res.text).toContain('admin-sidebar-overlay');
      expect(res.text).toContain('admin-sidebar-close');
    }
  });

  test('Admin new article form category dropdown is populated from central categories', async () => {
    const res = await agent.get('/admin/articles/new');
    expect(res.status).toBe(200);
    expect(res.text).toContain('name="category"');
    for (const cat of CATEGORIES) {
      const escaped = cat.name.replace(/&/g, '&amp;');
      expect(res.text).toContain(`value="${escaped}"`);
    }
  });

  test('Responsive stylesheet is served and contains mobile media queries', async () => {
    const res = await request(app).get('/css/responsive.css');
    expect(res.status).toBe(200);
    expect(res.text).toContain('@media (max-width: 1024px)');
    expect(res.text).toContain('@media (max-width: 768px)');
    expect(res.text).toContain('@media (max-width: 480px)');
    expect(res.text).toContain('@media (max-width: 375px)');
    expect(res.text).toContain('overflow-wrap: break-word');
  });
});
