const mongoose = require('mongoose');
const slugify = require('slugify');
const { CATEGORY_NAMES } = require('../config/categories');

const commentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, trim: true, maxlength: 200, default: '' },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    approved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      trim: true,
      maxlength: 500,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    coverImage: {
      type: String,
      default: '/images/hero-desktop.jpg',
    },
    coverImagePublicId: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: { values: CATEGORY_NAMES, message: '"{VALUE}" is not a valid category' },
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    readingTime: {
      type: Number,
      default: 5,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

// Auto-calculate reading time and publishedAt before save
articleSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  if (this.content) {
    const wordCount = this.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
    this.readingTime = Math.max(1, Math.ceil(wordCount / 200));
  }

  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// Index for search & queries
articleSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ isFeatured: 1, status: 1 });

module.exports = mongoose.model('Article', articleSchema);
