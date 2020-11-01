const { Router } = require('express')
const {
  viewUsers,
  getDetailUser,
  updateUser,
  deleteUser,
  topUpBalance,
  changePassword
} = require('../controllers/users')
const multerSingle = require('../middlewares/multerSingle')

const router = Router()

router.get('/all', viewUsers)
router.post('/balance/topup', topUpBalance)
router.put('/', multerSingle('avatar'), updateUser('put'))
router.patch('/', multerSingle('avatar'), updateUser('patch'))
router.delete('/', deleteUser)
router.get('/', getDetailUser)
router.post('/password', changePassword)

module.exports = router
