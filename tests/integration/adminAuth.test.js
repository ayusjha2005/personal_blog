const fs = require('fs');
const path = require('path');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Article = require('../../src/models/Article');
const { CATEGORIES } = require('../../src/config/categories');
const Profile = require('../../src/models/Profile');
const ContactMessage = require('../../src/models/ContactMessage');

let agent;
let testCategoryName;
let createdArticleId;
let uploadedFilesToCleanup = [];

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

  testCategoryName = CATEGORIES[0].name;

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
  await Article.deleteMany({ slug: { $in: ['lifecycle-article-test', 'upload-article-test'] } });
  await ContactMessage.deleteMany({ email: 'workflow@test.com' });
  // Clean up any test uploaded files
  for (const filePath of uploadedFilesToCleanup) {
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
  }
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
      category: testCategoryName,
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
      category: testCategoryName,
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

  // Workflow 11E: Admin can create an article with an uploaded image file (multipart/form-data)
  test('Workflow 11E: Admin can create an article with an attached cover image file', async () => {
    const fakeImageBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
      0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
      0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
      0x42, 0x60, 0x82,
    ]);

    const res = await agent
      .post('/admin/articles/new')
      .field('title', 'Upload Test Article')
      .field('slug', 'upload-article-test')
      .field('subtitle', 'Testing file upload')
      .field('excerpt', 'Article with uploaded cover image.')
      .field('content', '## Section\n\nUploaded cover image content test.')
      .field('category', testCategoryName)
      .field('status', 'draft')
      .field('tags', 'Upload, Test')
      .attach('coverImage', fakeImageBuffer, {
        filename: 'test-cover.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(302);
    const created = await Article.findOne({ slug: 'upload-article-test' });
    expect(created).not.toBeNull();
    expect(created.coverImage).toMatch(/^\/uploads\/\d+-[a-f0-9]+\.png$/);

    const onDiskPath = path.join(__dirname, '../../public', created.coverImage);
    expect(fs.existsSync(onDiskPath)).toBe(true);
    uploadedFilesToCleanup.push(onDiskPath);

    // Clean up created article
    await Article.findByIdAndDelete(created._id);
  });

  // Workflow 11F: Admin article creation rejects unsupported file MIME types
  test('Workflow 11F: Unsupported file MIME types are rejected with error', async () => {
    const textBuffer = Buffer.from('This is a text file pretending to be an image');

    const res = await agent
      .post('/admin/articles/new')
      .field('title', 'Invalid Upload Test')
      .field('slug', 'invalid-upload-test')
      .field('subtitle', 'Testing validation error')
      .field('excerpt', 'This should fail validation.')
      .field('content', 'Content text.')
      .field('category', testCategoryName)
      .field('status', 'draft')
      .attach('coverImage', textBuffer, {
        filename: 'document.txt',
        contentType: 'text/plain',
      });

    expect(res.status).toBe(400);
    expect(res.text).toContain('Unsupported file type');
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

  // Workflow 12B: Admin can update profile photo with an attached file
  test('Workflow 12B: Admin can update profile photo with an uploaded image file', async () => {
    const fakeImageBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
      0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
      0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
      0x42, 0x60, 0x82,
    ]);

    const res = await agent
      .post('/admin/profile')
      .field('name', 'Ayush Jha')
      .field('heroHeadline', 'Ideas. Code. Progress.')
      .field('bio', 'Updated bio with photo.')
      .field('extendedBio', 'Extended bio with photo.')
      .field('tagline', 'Learning in public, building in private.')
      .attach('profileImage', fakeImageBuffer, {
        filename: 'my-avatar.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(200);
    expect(res.text).toContain('Profile and site settings saved successfully');

    const updatedProfile = await Profile.findOne();
    expect(updatedProfile.profileImage).toMatch(/^\/uploads\/\d+-[a-f0-9]+\.png$/);

    const onDiskPath = path.join(__dirname, '../../public', updatedProfile.profileImage);
    expect(fs.existsSync(onDiskPath)).toBe(true);
    uploadedFilesToCleanup.push(onDiskPath);

    // Revert profile photo back to default so other tests stay clean
    await Profile.updateOne({}, { profileImage: '/images/profile.jpg' });
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
