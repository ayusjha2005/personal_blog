const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const pageController = require('../controllers/pageController');

router.get('/', homeController.getHomePage);
router.get('/about', pageController.getAboutPage);

module.exports = router;
