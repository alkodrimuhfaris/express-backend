const router = require('express').Router()

const {
  loginController,
  signupController,
  adminController
} = require('../controllers/auth')

const forgotPassword = require('../controllers/forgotPassword')

const authMiddleware = require('../middlewares/auth')

router.post('/login/:role_id', loginController)
router.post('/signup/:role_id', signupController)
router.post('/forgot', forgotPassword.resetPassword)
router.post('/forgot/reset', forgotPassword.matchResetCode)
router.post('/admin', authMiddleware, adminController)

module.exports = router
