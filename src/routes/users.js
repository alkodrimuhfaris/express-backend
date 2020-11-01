const { Router } = require('express')
const {
  viewUsers,
  getDetailUser,
  updateUser,
  deleteUser,
  updateBalance,
  changePassword
} = require('../controllers/users')
const multerSingle = require('../middlewares/multerSingle')

const router = Router()

router.get('/all', viewUsers)
router.post('/balance', updateBalance)
router.put('/', multerSingle('avatar'), updateUser('put'))
router.patch('/', multerSingle('avatar'), updateUser('patch'))
router.delete('/', deleteUser)
router.get('/', getDetailUser)
router.post('/password', changePassword)

module.exports = router
