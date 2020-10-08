const { Router } = require('express')
const {
  getCheckout
} = require('../controllers/checkout')
const authMiddleware = require('../middlewares/auth')


const router = Router()

router.get('/', getCheckout)

// router.get('/:id', getDetailItem)
// router.put('/detail/:id', authMiddleware, updateItemDetail)
// router.patch('/:id', authMiddleware, multerFields('product_image'), updatePartialItem)
// router.patch('/detail/:id', authMiddleware, updatePartialItemDetail)

module.exports = router
