const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const rateLimitMiddleware = require('../middlewares/rateLimit.middleware')

router.post('/register', rateLimitMiddleware.registerLimiter,authController.userRegister)
router.post('/login', rateLimitMiddleware.loginLimiter,authController.userLogin)

module.exports = router;