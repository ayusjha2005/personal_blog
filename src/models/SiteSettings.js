const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema(
  {
    websiteTitle: {
      type: String,
      default: 'Ayush Jha | Ideas. Code. Progress.',
      trim: true,
    },
    websiteDescription: {
      type: String,
      default:
        'Personal developer journal of Ayush Jha covering web development, DSA, Linux, databases, and practical software engineering.',
      trim: true,
    },
    postsPerPage: {
      type: Number,
      default: 6,
      min: 1,
      max: 50,
    },
    contactEmail: {
      type: String,
      default: 'ayushjha@gmail.com',
      trim: true,
      lowercase: true,
    },
    footerContent: {
      type: String,
      default: '© 2026 Ayush Jha. All rights reserved.',
      trim: true,
    },
    socialLinks: {
      github: { type: String, default: 'https://github.com/ayushjha' },
      linkedin: { type: String, default: 'https://linkedin.com/in/ayushjha' },
      twitter: { type: String, default: 'https://x.com/ayushjha' },
      instagram: { type: String, default: 'https://instagram.com/ayushjha' },
      youtube: { type: String, default: '' },
      email: { type: String, default: 'ayushjha@gmail.com' },
    },
    allowPublicIndexing: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
