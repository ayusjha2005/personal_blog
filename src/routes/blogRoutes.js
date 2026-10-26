const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

router.get('/', blogController.getBlogListing);
router.get('/:slug', blogController.getArticleDetail);

module.exports = router;
