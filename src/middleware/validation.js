const { body, validationResult } = require('express-validator');

// Contact form validation rules
const contactValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters.')
    .escape(),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('subject')
    .trim()
    .optional({ checkFalsy: true })
    .isLength({ max: 200 })
    .withMessage('Subject cannot exceed 200 characters.')
    .escape(),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required.')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Message must be between 10 and 5000 characters.')
    .escape(),
  // Honeypot field (should be empty for real humans)
  body('website')
    .trim()
    .custom((val) => {
      if (val) {
        throw new Error('Spam detected');
      }
      return true;
    }),
];

// Article validation rules for admin
const articleValidationRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required.')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters.'),
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required.')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must be lowercase alphanumeric with hyphens.'),
  body('excerpt')
    .trim()
    .notEmpty()
    .withMessage('Excerpt is required.')
    .isLength({ max: 500 })
    .withMessage('Excerpt cannot exceed 500 characters.'),
  body('content')
    .notEmpty()
    .withMessage('Content is required.'),
  body('category')
    .notEmpty()
    .withMessage('Category is required.'),
  body('status')
    .isIn(['draft', 'published'])
    .withMessage('Status must be draft or published.'),
];

module.exports = {
  contactValidationRules,
  articleValidationRules,
  validationResult,
};
