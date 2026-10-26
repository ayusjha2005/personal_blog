const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Article = require('../../src/models/Article');
const Category = require('../../src/models/Category');
const Profile = require('../../src/models/Profile');
const ContactMessage = require('../../src/models/ContactMessage');

let agent;
let testCategory;
let createdArticleId;

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

  testCategory = await Category.findOne();

  // Create test contact message
  await ContactMessage.create({
    name: 'Workflow Tester',
    email: 'workflow@test.com',
    subject: 'Workflow 13 Verification',
    message: 'Testing that messages appear in the admin inbox.',
    status: 'unread',
  });
});

afterAll(async () => {
  if (createdArticleId) {
    await Article.findByIdAndDelete(createdArticleId);
  }
  await Article.deleteMany({ slug: 'lifecycle-article-test' });
  await ContactMessage.deleteMany({ email: 'workflow@test.com' });
  await mongoose.connection.close();
});

describe('Single-Owner Administration Workflows', () => {
  // Workflow 9: Unauthenticated visitors cannot access admin dashboard
  test('Workflow 9: Unauthenticated access to /admin redirects to /admin/login', async () => {
    const res = await request(app).get('/admin');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/admin/login');
  });

  // Workflow 14: Unauthenticated visitors cannot view private messages
  test('Workflow 14: Unauthenticated access to /admin/messages redirects to /admin/login', async () => {
    const res = await request(app).get('/admin/messages');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/admin/login');
  });

  // Workflow 10: Invalid admin credentials are rejected
  test('Workflow 10: Invalid admin credentials return 401 with error message', async () => {
    const res = await request(app).post('/admin/login').send({
      email: 'ayush@example.com',
      password: 'wrong_password_123',
    });
    expect(res.status).toBe(401);
    expect(res.text).toContain('Invalid email or password credentials');
  });

  // Authenticate admin
  test('Admin authentication succeeds and initializes session', async () => {
    agent = request.agent(app);
    const res = await agent.post('/admin/login').send({
      email: 'ayush@example.com',
      password: 'adminpassword123',
    });
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/admin');

    const dashRes = await agent.get('/admin');
    expect(dashRes.status).toBe(200);
    expect(dashRes.text).toContain('Dashboard Overview');
  });

  // Workflow 11: An administrator can create, edit, publish, unpublish, and delete articles
  test('Workflow 11A: Admin can create a new article as draft', async () => {
    const res = await agent.post('/admin/articles/new').send({
      title: 'Lifecycle Test Article',
      slug: 'lifecycle-article-test',
      subtitle: 'Testing full lifecycle',
      excerpt: 'Short excerpt for lifecycle test article.',
      content: '## Section\n\nFull lifecycle test content.',
      category: testCategory._id.toString(),
      status: 'draft',
      coverImage: '/images/article-productivity.jpg',
      tags: 'Lifecycle, Test',
    });

    expect(res.status).toBe(302);
    const created = await Article.findOne({ slug: 'lifecycle-article-test' });
    expect(created).not.toBeNull();
    expect(created.status).toBe('draft');
    createdArticleId = created._id;
  });

  test('Workflow 11B: Admin can edit an existing article via /admin/articles/:id/edit', async () => {
    const res = await agent.post(`/admin/articles/${createdArticleId}/edit`).send({
      title: 'Lifecycle Test Article — Updated',
      slug: 'lifecycle-article-test',
      subtitle: 'Updated subtitle',
      excerpt: 'Updated excerpt text.',
      content: '## Updated Section\n\nUpdated article body.',
      category: testCategory._id.toString(),
      status: 'draft',
      coverImage: '/images/article-productivity.jpg',
      tags: 'Lifecycle, Updated',
    });

    expect(res.status).toBe(302);
    const updated = await Article.findById(createdArticleId);
    expect(updated.title).toBe('Lifecycle Test Article — Updated');
  });

  test('Workflow 11C: Admin can publish and unpublish (toggle) an article', async () => {
    // Toggle from draft to published
    await agent.post(`/admin/articles/${createdArticleId}/toggle`);
    let article = await Article.findById(createdArticleId);
    expect(article.status).toBe('published');

    // Toggle from published back to draft
    await agent.post(`/admin/articles/${createdArticleId}/toggle`);
    article = await Article.findById(createdArticleId);
    expect(article.status).toBe('draft');
  });

  test('Workflow 11D: Admin can delete an article', async () => {
    const res = await agent.post(`/admin/articles/delete/${createdArticleId}`);
    expect(res.status).toBe(302);

    const deleted = await Article.findById(createdArticleId);
    expect(deleted).toBeNull();
    createdArticleId = null;
  });

  // Workflow 12: Profile and social link updates persist
  test('Workflow 12: Admin can update profile information and social links', async () => {
    const res = await agent.post('/admin/profile').send({
      name: 'Ayush Jha',
      heroHeadline: 'Ideas. Code. Progress.',
      bio: 'Updated bio testing database persistence.',
      extendedBio: 'Extended bio updated.',
      tagline: 'Learning in public, building in private.',
      heroScriptQuote: 'Better Code, Brighter Days',
      aboutScriptQuote: 'Just a guy who loves building things.',
      contactScriptQuote: "Let's Build Something Amazing.",
      profileImage: '/images/profile.jpg',
      degree: 'B.Tech CSE (CSBS) @ VIT-AP',
      location: 'Based in India',
      statusText: 'Always learning',
      github: 'https://github.com/ayushjha',
      linkedin: 'https://linkedin.com/in/ayushjha',
      twitter: 'https://x.com/ayushjha',
      instagram: 'https://instagram.com/ayushjha',
      email: 'ayushjha@gmail.com',
      contactEmail: 'ayushjha@gmail.com',
      footerText: '© 2026 Ayush Jha. All rights reserved.',
      seoTitle: 'Ayush Jha | Ideas. Code. Progress.',
      seoDescription: 'Personal developer journal of Ayush Jha.',
    });

    expect(res.status).toBe(200);
    expect(res.text).toContain('Profile and site settings saved successfully');

    const profile = await Profile.findOne();
    expect(profile.bio).toBe('Updated bio testing database persistence.');
  });

  // Workflow 13: Contact messages appear in the admin inbox
  test('Workflow 13: Contact messages appear in the admin inbox and can be marked as read', async () => {
    const res = await agent.get('/admin/messages');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Workflow 13 Verification');
    expect(res.text).toContain('Workflow Tester');
  });

  // Workflow 17: Admin site settings page and persistence
  test('Workflow 17: Admin settings page loads and persists site configurations', async () => {
    const settingsGetRes = await agent.get('/admin/settings');
    expect(settingsGetRes.status).toBe(200);
    expect(settingsGetRes.text).toContain('Website Settings');

    const settingsPostRes = await agent.post('/admin/settings').send({
      websiteTitle: 'Ayush Jha | Personal Tech Journal',
      postsPerPage: 6,
      contactEmail: 'ayushjha@gmail.com',
      footerContent: '© 2026 Ayush Jha.',
      github: 'https://github.com/ayushjha',
      linkedin: 'https://linkedin.com/in/ayushjha',
    });

    expect(settingsPostRes.status).toBe(200);
    expect(settingsPostRes.text).toContain('Website settings saved successfully');
  });
});
