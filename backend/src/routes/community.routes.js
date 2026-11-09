const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const rateLimitMiddleware = require('../middlewares/rateLimit.middleware');
const communityController = require('../controllers/community.controller');

// Fetch messages for the user's isolated branch & sem (or query-specified for admins)
router.get('/messages', authMiddleware.authUser, communityController.getMessages);

// Send message (strictly verified by user's branch/sem, or targeted by admin)
router.post('/messages', authMiddleware.authUser, rateLimitMiddleware.apiLimiter, communityController.postMessage);

// Delete message (author or admin)
router.delete('/messages/:id', authMiddleware.authUser, communityController.deleteMessage);

// Admin-only summary of activity across all class channels
router.get('/channels', authMiddleware.authAdmin, communityController.getAdminChannels);

module.exports = router;
