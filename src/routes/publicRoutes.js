const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const homeController = require('../controllers/homeController');
const pageController = require('../controllers/pageController');

router.get('/', homeController.getHomePage);
router.get('/about', pageController.getAboutPage);

// Lightweight Health Check Endpoint for Cloud Deployments / Load Balancers
router.get('/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const status = isDbConnected ? 200 : 503;
  res.status(status).json({
    status: isDbConnected ? 'ok' : 'degraded',
    uptime: Math.floor(process.uptime()),
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
