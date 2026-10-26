const { marked } = require('marked');
const sanitizeHtml = require('sanitize-html');

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Render Markdown content to safe HTML
 * @param {string} markdown - raw markdown text
 * @returns {string} sanitized HTML string
 */
function renderMarkdown(markdown) {
  if (!markdown) return '';

  const rawHtml = marked.parse(markdown);

  const cleanHtml = sanitizeHtml(rawHtml, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'p', 'a', 'ul', 'ol', 'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
      'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'span', 'img'
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      code: ['class'],
      pre: ['class'],
      div: ['class'],
      span: ['class'],
      h1: ['id'],
      h2: ['id'],
      h3: ['id'],
      h4: ['id'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });

  return cleanHtml;
}

/**
 * Extract Table of Contents headings from Markdown
 * @param {string} markdown
 * @returns {Array<{text: string, id: string, level: number}>}
 */
function extractHeadings(markdown) {
  if (!markdown) return [];
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings = [];
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    headings.push({ text, id, level });
  }
  return headings;
}

module.exports = {
  renderMarkdown,
  extractHeadings,
};
