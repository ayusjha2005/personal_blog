const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Ayush Jha',
      trim: true,
    },
    heroHeadline: {
      type: String,
      default: 'Ideas. Code. Progress.',
      trim: true,
    },
    bio: {
      type: String,
      default:
        "I'm Ayush Jha, a computer science student who loves building things, learning new technologies, and exploring how software can solve real-world problems.",
      trim: true,
    },
    extendedBio: {
      type: String,
      default:
        "I'm interested in software development, backend engineering, databases, Linux, and practical project building. I enjoy learning by experimenting, solving problems, and turning ideas into working applications.",
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Learning in public, building in private.',
      trim: true,
    },
    heroScriptQuote: {
      type: String,
      default: 'Better Code, Brighter Days',
      trim: true,
    },
    aboutScriptQuote: {
      type: String,
      default: 'Just a guy who loves building things.',
      trim: true,
    },
    contactScriptQuote: {
      type: String,
      default: "Let's Build Something Amazing.",
      trim: true,
    },
    profileImage: {
      type: String,
      default: '/images/profile.jpg',
    },
    profileImagePublicId: {
      type: String,
      default: null,
    },
    degree: {
      type: String,
      default: 'B.Tech CSE (CSBS) @ VIT-AP',
      trim: true,
    },
    location: {
      type: String,
      default: 'Based in India',
      trim: true,
    },
    statusText: {
      type: String,
      default: 'Always learning',
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
    contactEmail: {
      type: String,
      default: 'ayushjha@gmail.com',
      trim: true,
    },
    footerText: {
      type: String,
      default: '© 2026 Ayush Jha. All rights reserved.',
      trim: true,
    },
    seoTitle: {
      type: String,
      default: 'Ayush Jha | Ideas. Code. Progress.',
      trim: true,
    },
    seoDescription: {
      type: String,
      default:
        'Personal developer journal of Ayush Jha covering web development, DSA, Linux, databases, and projects.',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Profile', profileSchema);
