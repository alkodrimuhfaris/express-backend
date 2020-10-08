const { Router } = require('express')
const {
  viewUsers,
  getDetailUser,
  updateUser,
  deleteUser
} = require('../controllers/users')
const multerSingle = require('../middlewares/multerSingle')


const router = Router()

router.get('/all', viewUsers)
router.put('/', multerSingle('avatar',1), updateUser('put'))
router.patch('/', multerSingle('avatar'), updateUser('patch'))
router.delete('/', deleteUser)
router.get('/', getDetailUser)

module.exports = router
