const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const rateLimitMiddleware = require('../middlewares/rateLimit.middleware');

// Optional auth helper: attaches user if logged in, but allows guest feedback if session cookie expired
const optionalAuth = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const config = require('../config/config');
      const decoded = jwt.verify(token, config.JWT_SECRET);
      req.user = decoded;
    } catch {
      // Token expired or invalid, proceed as guest
    }
  }
  next();
};

router.post('/', rateLimitMiddleware.apiLimiter, optionalAuth, feedbackController.submitFeedback);
router.get('/testimonials', rateLimitMiddleware.apiLimiter, feedbackController.getPublicTestimonials);

module.exports = router;
