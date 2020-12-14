const { Router } = require('express')
const user = require('../controllers/users')
const multerSingle = require('../middlewares/multerSingle')
const roleChecker = require('../middlewares/roleChecker')

const router = Router()

// admin get all user
router.get('admin/all', roleChecker.admin, user.viewAllUsers)

// user
router.post('/balance/topup', user.topUpBalance)
router.patch('/', multerSingle('avatar'), user.updateUser)
router.delete('/', user.deleteUser)
router.get('/', user.getUser)
router.post('/password', user.changePassword)
router.get('/detail/:id', roleChecker.paramsNumber, user.getUserById)

module.exports = router
