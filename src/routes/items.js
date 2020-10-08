const { Router } = require('express')
const {
  viewItems,
  getDetailItem,
  createItem,
  createItemDetail,
  updateItem,
  updateItemDetail,
  updatePartialItem,
  updatePartialItemDetail,
  deleteItem,
  deleteItemDetail
} = require('../controllers/items')
const authMiddleware = require('../middlewares/auth')
const multerArray = require('../middlewares/multerArray')
const multerSingle = require('../middlewares/multerSingle')
const multerFields = require('../middlewares/multerFields')

const router = Router()

router.get('/', viewItems)
router.post('/', authMiddleware, multerArray('product_image'), createItem('create'))
router.put('/:id', authMiddleware, multerArray('product_image'), updateItem('put'))
router.patch('/:id', authMiddleware, multerArray('product_image'), updateItem('patch'))
router.delete('/:id', authMiddleware, deleteItem)
router.delete('/detail/:id', authMiddleware, deleteItemDetail)

// router.get('/:id', getDetailItem)
// router.put('/detail/:id', authMiddleware, updateItemDetail)
// router.patch('/:id', authMiddleware, multerFields('product_image'), updatePartialItem)
// router.patch('/detail/:id', authMiddleware, updatePartialItemDetail)

module.exports = router
