const { Router } = require('express')
const {
  viewItems,
  createItem,
  updateItem,
  deleteItem
} = require('../controllers/items')
const authMiddleware = require('../middlewares/auth')
const multerArray = require('../middlewares/multerArray')
const roleChecker = require('../middlewares/roleChecker')

const router = Router()

router.get('/', viewItems)
router.post('/', authMiddleware, multerArray('product_image'), createItem)
router.patch('/:id', authMiddleware, roleChecker.paramsNumber, multerArray('product_image'), updateItem)
router.delete('/:id', authMiddleware, roleChecker.paramsNumber, deleteItem)

// router.get('/:id', getDetailItem)
// router.put('/detail/:id', authMiddleware, updateItemDetail)
// router.patch('/:id', authMiddleware, multerFields('product_image'), updatePartialItem)
// router.patch('/detail/:id', authMiddleware, updatePartialItemDetail)

module.exports = router
