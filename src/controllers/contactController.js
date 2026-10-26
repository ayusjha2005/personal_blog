const contactService = require('../services/contactService');
const { validationResult } = require('../middleware/validation');

function getContactPage(req, res) {
  res.render('pages/contact', {
    title: "Let's Connect | Ayush Jha",
    activePage: 'contact',
    error: null,
    success: null,
    formData: {},
  });
}

async function postContactMessage(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('pages/contact', {
        title: "Let's Connect | Ayush Jha",
        activePage: 'contact',
        error: errors.array()[0].msg,
        success: null,
        formData: req.body,
      });
    }

    const { name, email, subject, message } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    await contactService.createMessage({
      name,
      email,
      subject: subject || 'Website Inquiry',
      message,
      ipAddress,
    });

    res.render('pages/contact', {
      title: "Let's Connect | Ayush Jha",
      activePage: 'contact',
      error: null,
      success: 'Thank you! Your message has been sent successfully. I will get back to you soon.',
      formData: {},
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getContactPage,
  postContactMessage,
};
