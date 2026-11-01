const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const homeController = require('../controllers/homeController');
const pageController = require('../controllers/pageController');
const Article = require('../models/Article');

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

// Dynamic XML Sitemap for Search Engines
router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const baseUrl = (process.env.SITE_URL || 'https://ayushjha.dev').replace(/\/$/, '');
    const articles = await Article.find({ status: 'published' })
      .select('slug updatedAt publishedAt')
      .sort({ publishedAt: -1 })
      .lean();

    const staticRoutes = [
      { url: '/', changefreq: 'daily', priority: '1.0' },
      { url: '/blog', changefreq: 'daily', priority: '0.9' },
      { url: '/about', changefreq: 'monthly', priority: '0.8' },
      { url: '/contact', changefreq: 'yearly', priority: '0.6' },
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    staticRoutes.forEach((route) => {
      xml += '  <url>\n';
      xml += '    <loc>' + baseUrl + route.url + '</loc>\n';
      xml += '    <changefreq>' + route.changefreq + '</changefreq>\n';
      xml += '    <priority>' + route.priority + '</priority>\n';
      xml += '  </url>\n';
    });

    articles.forEach((art) => {
      const lastmod = (art.updatedAt || art.publishedAt || new Date()).toISOString().split('T')[0];
      xml += '  <url>\n';
      xml += '    <loc>' + baseUrl + '/blog/' + art.slug + '</loc>\n';
      xml += '    <lastmod>' + lastmod + '</lastmod>\n';
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
