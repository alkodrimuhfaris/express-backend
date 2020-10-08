const router = require('express').Router()

const {
	loginController,
	signupController,
	adminController
} = require('../controllers/auth')
const authMiddleware = require('../middlewares/auth')

router.post('/login/:role_id', loginController)
router.post('/signup/:role_id', signupController)
router.post('/admin', authMiddleware, adminController)

module.exports = router
