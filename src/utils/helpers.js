const path = require('path');
const fs = require('fs');

const PUBLIC_DIR = path.join(__dirname, '../../public');

/**
 * Format a Date object to "Oct 20, 2026"
 * @param {Date|string} date
 * @returns {string}
 */
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format date to ISO for datetime attributes
 * @param {Date|string} date
 * @returns {string}
 */
function formatISODate(date) {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
}

/**
 * Truncate a string with ellipsis
 * @param {string} str
 * @param {number} length
 * @returns {string}
 */
function truncate(str, length = 140) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length).trim() + '...';
}

/**
 * Resolves an image path safely with fallbacks.
 * Handles Cloudinary/external URLs, bundled static images, and missing ephemeral uploads.
 * @param {string} imagePath - The stored image URL/path
 * @param {string} fallbackPath - The fallback image path if imagePath is invalid or missing
 * @returns {string} Safe image URL to render
 */
function resolveImage(imagePath, fallbackPath = '/images/article-productivity.jpg') {
  if (!imagePath || typeof imagePath !== 'string' || !imagePath.trim()) {
    return fallbackPath;
  }

  const cleanPath = imagePath.trim();

  // Full external or Cloudinary URL (e.g. https://res.cloudinary.com/...)
  if (/^https?:\/\//i.test(cleanPath) || cleanPath.startsWith('data:')) {
    return cleanPath;
  }

  // Bundled static images in public/images/
  if (cleanPath.startsWith('/images/')) {
    const relativePart = cleanPath.replace(/^\//, '');
    const fullDiskPath = path.join(PUBLIC_DIR, relativePart);
    if (fs.existsSync(fullDiskPath)) {
      return cleanPath;
    }
    return fallbackPath;
  }

  // Local uploads (/uploads/...) - verify physical existence on disk
  if (cleanPath.startsWith('/uploads/')) {
    const relativePart = cleanPath.replace(/^\//, '');
    const fullDiskPath = path.join(PUBLIC_DIR, relativePart);
    if (fs.existsSync(fullDiskPath)) {
      return cleanPath;
    }
    // File does not exist on disk (e.g. ephemeral Render storage reset)
    return fallbackPath;
  }

  return cleanPath;
}

module.exports = {
  formatDate,
  formatISODate,
  truncate,
  resolveImage,
};

