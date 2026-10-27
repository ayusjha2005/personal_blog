const articleService = require('../services/articleService');
const { CATEGORIES } = require('../config/categories');

async function getHomePage(req, res, next) {
  try {
    const [featuredArticle, latestArticles] = await Promise.all([
      articleService.getFeaturedArticle(),
      articleService.getLatestArticles(3),
    ]);

    res.render('pages/home', {
      title: 'Ayush Jha | Ideas. Code. Progress.',
      activePage: 'home',
      featuredArticle,
      latestArticles,
      categories: CATEGORIES,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHomePage,
};
