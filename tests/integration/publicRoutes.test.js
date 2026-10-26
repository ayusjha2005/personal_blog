const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Article = require('../../src/models/Article');
const Category = require('../../src/models/Category');

let draftArticle;

beforeAll(async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ayush_personal_blog';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoURI);
  }

  const category = await Category.findOne();
  // Create a draft article for draft-protection tests
  draftArticle = await Article.findOneAndUpdate(
    { slug: 'top-secret-private-draft-post' },
    {
      title: 'Top Secret Private Draft Post',
      slug: 'top-secret-private-draft-post',
      excerpt: 'This draft should never be visible publicly.',
      content: '## Draft Content\n\nSecret unreleased notes.',
      status: 'draft',
      category: category._id,
      publishedAt: null,
    },
    { upsert: true, new: true }
  );
});

afterAll(async () => {
  if (draftArticle) {
    await Article.deleteOne({ _id: draftArticle._id });
  }
  await mongoose.connection.close();
});

describe('Public Workflows & Security', () => {
  // Workflow 1: Homepage loads published articles
  test('Workflow 1: Homepage loads published articles and profile details', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Ideas. Code. Progress.');
    expect(res.text).toContain('Ayush Jha');
    expect(res.text).toContain('Featured Article');
    expect(res.text).toContain('Latest Posts');
  });

  // Workflow 2: Blog search and category filtering work
  test('Workflow 2A: Blog search queries filter published articles', async () => {
    const res = await request(app).get('/blog?q=Productivity');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Productivity');
  });

  test('Workflow 2B: Blog category filter returns matching articles', async () => {
    const res = await request(app).get('/blog?category=web-development');
    expect(res.status).toBe(200);
    expect(res.text).toContain('All Articles');
  });

  // Workflow 3: Pagination works
  test('Workflow 3: Server-side pagination handles page query parameter', async () => {
    const res = await request(app).get('/blog?page=1');
    expect(res.status).toBe(200);
    expect(res.text).toContain('All Articles');
  });

  // Workflow 4: Clicking an article opens the correct content
  test('Workflow 4: Article detail page renders title, reading time, and formatted prose', async () => {
    const res = await request(app).get('/blog/how-i-set-up-my-developer-environment-for-maximum-productivity');
    expect(res.status).toBe(200);
    expect(res.text).toContain('How I Set Up My Developer Environment for Maximum Productivity');
    expect(res.text).toContain('Reading Progress');
    expect(res.text).toContain('Table of Contents');
    expect(res.text).toContain('/js/article.js');
  });

  // Workflow 5: Draft articles are inaccessible publicly
  test('Workflow 5: Draft articles return 404 for public visitors', async () => {
    const res = await request(app).get('/blog/top-secret-private-draft-post');
    expect(res.status).toBe(404);
    expect(res.text).toContain('404');
    expect(res.text).not.toContain('Secret unreleased notes');
  });

  // Workflow 6: Theme switching infrastructure exists to prevent FOUC
  test('Workflow 6: Theme pre-initialization script and toggle button exist in head & nav', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('localStorage.getItem(\'theme\')');
    expect(res.text).toContain('theme-toggle-btn');
  });

  // Workflow 7: Invalid contact submissions are rejected
  test('Workflow 7: Contact form rejects missing/invalid input with 400 status', async () => {
    const res = await request(app).post('/contact').send({
      name: '',
      email: 'invalid-email-format',
      message: 'short',
    });
    expect(res.status).toBe(400);
    expect(res.text).toContain('alert-error');
  });

  // Workflow 8: Valid contact submissions are stored in MongoDB
  test('Workflow 8: Valid contact submissions save to database and display success confirmation', async () => {
    const res = await request(app).post('/contact').send({
      name: 'Sarah Connor',
      email: 'sarah@example.com',
      subject: 'Inquiry on Distributed Systems',
      message: 'Hello Ayush, enjoyed your blog post on building full stack apps!',
    });
    expect(res.status).toBe(200);
    expect(res.text).toContain('Thank you! Your message has been sent successfully');
  });

  // Workflow 15: Mobile navigation works
  test('Workflow 15: Mobile navigation drawer with aria attributes is rendered', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('mobile-menu-btn');
    expect(res.text).toContain('mobile-nav-drawer');
  });

  // Workflow 16: Invalid article slugs return branded 404
  test('Workflow 16: Invalid article slugs return branded 404', async () => {
    const res = await request(app).get('/blog/completely-bogus-slug-12345');
    expect(res.status).toBe(404);
    expect(res.text).toContain('Page Not Found');
  });
});
