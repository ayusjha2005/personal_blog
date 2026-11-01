const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Article = require('../../src/models/Article');
const Profile = require('../../src/models/Profile');
const { resolveImage } = require('../../src/utils/helpers');
const { processImageUpload } = require('../../src/middleware/upload');
const cloudinaryConfig = require('../../src/config/cloudinary');

let testArticle;

beforeAll(async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ayush_personal_blog';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoURI);
  }

  // Create an article with an orphaned ephemeral /uploads/ path simulating Render restart
  testArticle = await Article.findOneAndUpdate(
    { slug: 'test-broken-image-article' },
    {
      title: 'Test Broken Image Article',
      slug: 'test-broken-image-article',
      excerpt: 'Article with a missing ephemeral upload image.',
      content: '## Image Testing\n\nTesting fallback images.',
      category: 'Web Development',
      status: 'published',
      isFeatured: true,
      coverImage: '/uploads/non-existent-ephemeral-upload-12345.png',
      publishedAt: new Date(),
    },
    { upsert: true, new: true }
  );
});

afterAll(async () => {
  if (testArticle) {
    await Article.deleteOne({ _id: testArticle._id });
  }
  await mongoose.connection.close();
});

describe('Image Fallback & Cloudinary Resilience Tests', () => {
  describe('resolveImage Utility Function', () => {
    test('returns Cloudinary and HTTPS URLs untouched', () => {
      const cloudinaryUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
      expect(resolveImage(cloudinaryUrl)).toBe(cloudinaryUrl);
    });

    test('returns existing bundled static images in /images/', () => {
      expect(resolveImage('/images/article-productivity.jpg')).toBe('/images/article-productivity.jpg');
      expect(resolveImage('/images/profile.jpg')).toBe('/images/profile.jpg');
    });

    test('replaces non-existent /images/ files with fallback', () => {
      expect(resolveImage('/images/hero-desktop.jpg', '/images/article-productivity.jpg')).toBe(
        '/images/article-productivity.jpg'
      );
    });

    test('replaces missing ephemeral /uploads/ files with fallback', () => {
      const missingUpload = '/uploads/1793137649299-d469c39df6fe68a1867fae71d4d71ff0.png';
      expect(resolveImage(missingUpload, '/images/article-productivity.jpg')).toBe(
        '/images/article-productivity.jpg'
      );
    });

    test('handles null, undefined, or empty strings gracefully', () => {
      expect(resolveImage(null, '/images/article-productivity.jpg')).toBe(
        '/images/article-productivity.jpg'
      );
      expect(resolveImage('', '/images/profile.jpg')).toBe('/images/profile.jpg');
      expect(resolveImage(undefined)).toBe('/images/article-productivity.jpg');
    });
  });

  describe('Template Fallback Rendering', () => {
    test('Homepage replaces broken coverImage with fallback and includes onerror handler', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      // The featured article has coverImage: '/uploads/non-existent-ephemeral-upload-12345.png'
      // It must be resolved to a valid static image, not the dead 404 path
      expect(res.text).not.toContain('/uploads/non-existent-ephemeral-upload-12345.png');
      expect(res.text).toContain('/images/article-productivity.jpg');
      expect(res.text).toContain('onerror="this.onerror=null;this.src=');
    });

    test('Article detail page replaces broken coverImage with fallback and includes onerror handler', async () => {
      const res = await request(app).get('/blog/test-broken-image-article');
      expect(res.status).toBe(200);
      expect(res.text).not.toContain('/uploads/non-existent-ephemeral-upload-12345.png');
      expect(res.text).toContain('/images/article-productivity.jpg');
      expect(res.text).toContain('author-avatar');
      expect(res.text).toContain('onerror="this.onerror=null;this.src=');
    });

    test('About page renders profile photo with onerror handler', async () => {
      const res = await request(app).get('/about');
      expect(res.status).toBe(200);
      expect(res.text).toContain('about-photo-img');
      expect(res.text).toContain('onerror="this.onerror=null;this.src=\'/images/profile.jpg\';"');
    });
  });

  describe('Cloudinary & Local Upload Fallback', () => {
    test('processImageUpload falls back to local disk in dev when Cloudinary is not configured', async () => {
      // Mock isConfigured to return false
      const origIsConfigured = cloudinaryConfig.isConfigured;
      cloudinaryConfig.isConfigured = () => false;

      const dummyFile = {
        mimetype: 'image/png',
        originalname: 'test-icon.png',
        buffer: Buffer.from('fake-png-data'),
      };

      const result = await processImageUpload(dummyFile, 'personal-blog/test');
      expect(result).toBeDefined();
      expect(result.url).toMatch(/^\/uploads\/\d+-[a-f0-9]+\.png$/);
      expect(result.publicId).toBeNull();

      cloudinaryConfig.isConfigured = origIsConfigured;
    });

    test('processImageUpload uploads to Cloudinary when configured', async () => {
      const origIsConfigured = cloudinaryConfig.isConfigured;
      const origUploadBuffer = cloudinaryConfig.uploadBuffer;

      cloudinaryConfig.isConfigured = () => true;
      cloudinaryConfig.uploadBuffer = jest.fn().mockResolvedValue({
        secure_url: 'https://res.cloudinary.com/test-cloud/image/upload/v123456/personal-blog/articles/test.png',
        public_id: 'personal-blog/articles/test',
        bytes: 1024,
        format: 'png',
      });

      const dummyFile = {
        mimetype: 'image/png',
        originalname: 'test-cloudinary.png',
        buffer: Buffer.from('fake-png-data'),
      };

      const result = await processImageUpload(dummyFile, 'personal-blog/articles');
      expect(cloudinaryConfig.uploadBuffer).toHaveBeenCalledWith(dummyFile.buffer, { folder: 'personal-blog/articles' });
      expect(result.url).toBe('https://res.cloudinary.com/test-cloud/image/upload/v123456/personal-blog/articles/test.png');
      expect(result.publicId).toBe('personal-blog/articles/test');

      cloudinaryConfig.isConfigured = origIsConfigured;
      cloudinaryConfig.uploadBuffer = origUploadBuffer;
    });
  });
});
