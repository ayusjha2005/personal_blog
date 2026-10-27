const { CATEGORIES } = require('../config/categories');

async function getAboutPage(req, res, next) {
  try {
    res.render('pages/about', {
      title: 'About | Ayush Jha',
      activePage: 'about',
      categories: CATEGORIES,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAboutPage,
};
