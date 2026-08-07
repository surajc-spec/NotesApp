const express = require("express");
const router = express.Router();
const rateLimitMiddleware = require("../middlewares/rateLimit.middleware");
const contactController = require("../controllers/contact.controller");

// Apply rate limiting to prevent email spamming
router.post("/send", rateLimitMiddleware.apiLimiter, contactController.sendContactMessage);

module.exports = router;
