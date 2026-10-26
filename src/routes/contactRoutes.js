const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { contactLimiter } = require('../middleware/rateLimiter');
const { contactValidationRules } = require('../middleware/validation');

router.get('/', contactController.getContactPage);
router.post('/', contactLimiter, contactValidationRules, contactController.postContactMessage);

module.exports = router;
