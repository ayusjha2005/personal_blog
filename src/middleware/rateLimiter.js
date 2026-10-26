const rateLimit = require('express-rate-limit');

// Rate limiter for contact form submissions (5 requests per 15 minutes per IP)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).render('pages/contact', {
      title: "Let's Connect | Ayush Jha",
      activePage: 'contact',
      error: 'Too many messages sent from this IP. Please wait a few minutes before trying again.',
      success: null,
      formData: req.body,
    });
  },
});

// Rate limiter for admin login attempts (5 requests per 15 minutes per IP)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).render('admin/login', {
      title: 'Admin Login | Ayush Jha',
      error: 'Too many login attempts. Please wait 15 minutes before trying again.',
      email: req.body.email || '',
      layout: false,
    });
  },
});

module.exports = {
  contactLimiter,
  loginLimiter,
};
