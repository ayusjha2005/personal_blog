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

module.exports = {
  formatDate,
  formatISODate,
  truncate,
};
