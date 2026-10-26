const Category = require('../models/Category');

async function getAboutPage(req, res, next) {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 }).lean();

    res.render('pages/about', {
      title: 'About | Ayush Jha',
      activePage: 'about',
      categories,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAboutPage,
};
