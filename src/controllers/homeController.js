const articleService = require('../services/articleService');
const Category = require('../models/Category');

async function getHomePage(req, res, next) {
  try {
    const [featuredArticle, latestArticles, categories] = await Promise.all([
      articleService.getFeaturedArticle(),
      articleService.getLatestArticles(3),
      Category.find().sort({ order: 1, name: 1 }).lean(),
    ]);

    res.render('pages/home', {
      title: 'Ayush Jha | Ideas. Code. Progress.',
      activePage: 'home',
      featuredArticle,
      latestArticles,
      categories,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHomePage,
};
