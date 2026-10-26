const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAuthenticated, redirectIfAuthenticated } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');
const { articleValidationRules } = require('../middleware/validation');

// Auth routes (public)
router.get('/login', redirectIfAuthenticated, adminController.getLogin);
router.post('/login', loginLimiter, adminController.postLogin);
router.get('/logout', adminController.logout);

// Protected Admin Routes
router.use(ensureAuthenticated);

router.get('/', adminController.getDashboard);

// Article management
router.get('/articles', adminController.getArticles);
router.get('/articles/new', adminController.getNewArticle);
router.post('/articles/new', articleValidationRules, adminController.postNewArticle);
router.get('/articles/edit/:id', adminController.getEditArticle);
router.get('/articles/:id/edit', adminController.getEditArticle); // Route alias requested in prompt
router.post('/articles/edit/:id', articleValidationRules, adminController.postEditArticle);
router.post('/articles/:id/edit', articleValidationRules, adminController.postEditArticle); // Route alias requested in prompt
router.post('/articles/:id/toggle', adminController.postToggleStatus);
router.post('/articles/delete/:id', adminController.postDeleteArticle);

// Profile and site settings
router.get('/profile', adminController.getProfile);
router.post('/profile', adminController.postProfile);
router.get('/settings', adminController.getSettings);
router.post('/settings', adminController.postSettings);

// Messages inbox
router.get('/messages', adminController.getMessages);
router.post('/messages/:id/mark', adminController.postMarkMessage);
router.post('/messages/:id/delete', adminController.postDeleteMessage);

module.exports = router;
