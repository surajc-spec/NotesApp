const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const rateLimitMiddleware = require('../middlewares/rateLimit.middleware');
const { authUser } = require('../middlewares/auth.middleware');

router.post('/', rateLimitMiddleware.apiLimiter, authUser, feedbackController.submitFeedback);
router.get('/testimonials', rateLimitMiddleware.apiLimiter, feedbackController.getPublicTestimonials);

module.exports = router;
