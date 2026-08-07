const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const rateLimitMiddleware = require('../middlewares/rateLimit.middleware')
const { authAdmin, authUser } = require('../middlewares/auth.middleware')

router.post('/send-otp', rateLimitMiddleware.registerLimiter, authController.sendOtp)
router.post('/register', rateLimitMiddleware.registerLimiter, authController.userRegister)
router.post('/login', rateLimitMiddleware.loginLimiter, authController.userLogin)
router.post('/forgot-password', rateLimitMiddleware.apiLimiter, authController.forgotPassword)
router.post('/reset-password', rateLimitMiddleware.apiLimiter, authController.resetPassword)
router.get('/users', authAdmin, authController.getAllUsers)
router.put('/profile', authUser, authController.updateProfile)

module.exports = router;