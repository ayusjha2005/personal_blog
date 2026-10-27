const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Article = require('../../src/models/Article');
const { CATEGORIES, CATEGORY_NAMES } = require('../../src/config/categories');

let agent;
let createdArticleIds = [];

beforeAll(async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ayush_personal_blog';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoURI);
  }

  // Ensure test admin exists
  const adminEmail = 'ayush@example.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = new User({
      name: 'Ayush Jha',
      email: adminEmail,
      password: 'adminpassword123',
      role: 'admin',
    });
    await admin.save();
  }

  // Authenticate admin session
  agent = request.agent(app);
  await agent
    .post('/admin/login')
    .send({ email: adminEmail, password: 'adminpassword123' });
});

afterAll(async () => {
  for (const id of createdArticleIds) {
    await Article.findByIdAndDelete(id);
  }
  await mongoose.connection.close();
});

describe('Category System Verification', () => {
  test('Central category list defines all expected categories', () => {
    const expected = [
      'Web Development',
      'DSA & Algorithms',
      'Projects & Hackathons',
      'AI & Machine Learning',
      'College Life',
      'Personal',
    ];
    expect(CATEGORY_NAMES).toEqual(expected);
  });

  test('Admin new article form dropdown contains all centrally defined categories', async () => {
    const res = await agent.get('/admin/articles/new');
    expect(res.status).toBe(200);
    for (const catName of CATEGORY_NAMES) {
      const escapedName = catName.replace(/&/g, '&amp;');
      expect(res.text).toContain(`value="${escapedName}"`);
      expect(res.text).toContain(escapedName);
    }
  });

  test('Creating an article with a valid category persists string category in DB', async () => {
    const slug = 'test-category-article-' + Date.now();
    const res = await agent.post('/admin/articles/new').send({
      title: 'Category Creation Test',
      slug,
      subtitle: 'Testing category persistence',
      excerpt: 'Short excerpt for category test.',
      content: '## Content\n\nArticle body testing category.',
      category: 'AI & Machine Learning',
      status: 'published',
      publishedAt: new Date(),
    });

    expect(res.status).toBe(302);
    const created = await Article.findOne({ slug });
    expect(created).not.toBeNull();
    expect(created.category).toBe('AI & Machine Learning');
    createdArticleIds.push(created._id);
  });

  test('Creating an article with an invalid category is rejected by validation', async () => {
    const slug = 'test-invalid-category-' + Date.now();
    const res = await agent.post('/admin/articles/new').send({
      title: 'Invalid Category Test',
      slug,
      subtitle: 'Testing invalid category rejection',
      excerpt: 'Short excerpt.',
      content: '## Content',
      category: 'NonExistentCategory123',
      status: 'draft',
    });

    expect(res.status).toBe(400);
    const created = await Article.findOne({ slug });
    expect(created).toBeNull();
  });

  test('Editing an existing article updates its category correctly', async () => {
    const slug = 'test-edit-category-' + Date.now();
    const article = await Article.create({
      title: 'Article To Edit Category',
      slug,
      subtitle: 'Testing category edit',
      excerpt: 'Short excerpt.',
      content: '## Content',
      category: 'Web Development',
      status: 'draft',
    });
    createdArticleIds.push(article._id);

    // Edit to College Life
    const editRes = await agent.post(`/admin/articles/${article._id}/edit`).send({
      title: 'Article To Edit Category',
      slug,
      subtitle: 'Testing category edit',
      excerpt: 'Short excerpt.',
      content: '## Content',
      category: 'College Life',
      status: 'published',
    });

    expect(editRes.status).toBe(302);
    const updated = await Article.findById(article._id);
    expect(updated.category).toBe('College Life');

    // Verify edit form selects College Life
    const getEditRes = await agent.get(`/admin/articles/${article._id}/edit`);
    expect(getEditRes.status).toBe(200);
    expect(getEditRes.text).toContain('selected');
    expect(getEditRes.text).toContain('College Life');
  });

  test('Blog category filtering by slug returns matching articles', async () => {
    const slug = 'test-filter-article-' + Date.now();
    const article = await Article.create({
      title: 'Filtered DSA Article',
      slug,
      subtitle: 'DSA Subtitle',
      excerpt: 'DSA Excerpt for testing filtering.',
      content: '## Algorithms\n\nTesting category filter.',
      category: 'DSA & Algorithms',
      status: 'published',
      publishedAt: new Date(),
    });
    createdArticleIds.push(article._id);

    // Filter by DSA slug
    const res = await request(app).get('/blog?category=dsa-algorithms');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Filtered DSA Article');

    // Filter by AI & ML slug should NOT contain the DSA article
    const resOther = await request(app).get('/blog?category=ai-machine-learning');
    expect(resOther.status).toBe(200);
    expect(resOther.text).not.toContain('Filtered DSA Article');
  });
});
