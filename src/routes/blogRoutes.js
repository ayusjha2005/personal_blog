const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { commentLimiter, likeLimiter } = require('../middleware/rateLimiter');

router.get('/', blogController.getBlogListing);
router.get('/:slug', blogController.getArticleDetail);

// Likes & Comments APIs (Rate limited)
router.post('/:slug/like', likeLimiter, blogController.postLike);
router.post('/:slug/comment', commentLimiter, blogController.postComment);

module.exports = router;
