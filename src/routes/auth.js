const router = require('express').Router()

const auth = require('../controllers/auth')

const forgotPassword = require('../controllers/forgotPassword')

router.post('/login/:role_id', auth.loginController)
router.post('/signup/:role_id', auth.signupController)
router.post('/forgot', forgotPassword.resetPassword)
router.post('/forgot/reset', forgotPassword.matchResetCode)

module.exports = router
