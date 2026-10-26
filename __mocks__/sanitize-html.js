// Test mock for sanitize-html in Jest environment to avoid ESM htmlparser2 transpilation issue
module.exports = function sanitizeHtml(html, options) {
  if (!html) return '';
  // Basic script tag stripper for test runs
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};
