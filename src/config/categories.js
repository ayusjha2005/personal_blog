/**
 * Centrally defined list of valid article categories.
 *
 * Every category has a human-readable `name` and a URL-safe `slug`.
 * The same list is used for:
 *   • Admin article-form dropdowns (create & edit)
 *   • Server-side validation in the Article model
 *   • Blog listing & homepage filter chips
 *
 * To add or rename a category, edit this single file.
 */

const CATEGORIES = [
  { name: 'Web Development', slug: 'web-development' },
  { name: 'DSA & Algorithms', slug: 'dsa-algorithms' },
  { name: 'Projects & Hackathons', slug: 'projects-hackathons' },
  { name: 'AI & Machine Learning', slug: 'ai-machine-learning' },
  { name: 'College Life', slug: 'college-life' },
  { name: 'Personal', slug: 'personal' },
];

/** Just the name strings – used for Mongoose enum validation. */
const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);

/** Map slug → name for quick lookup during filtering. */
const SLUG_TO_NAME = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.name]));

module.exports = { CATEGORIES, CATEGORY_NAMES, SLUG_TO_NAME };
