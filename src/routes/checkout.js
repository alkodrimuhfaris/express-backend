const { Router } = require('express')
const checkoutModel = require('../controllers/checkout')
const authMiddleware = require('../middlewares/auth')

const router = Router()

router.get('/', authMiddleware, checkoutModel.getCheckout)
router.get('/deliveryfee', authMiddleware, checkoutModel.getDeliveryFee)
// router.patch('/:id', authMiddleware, multerFields('product_image'), updatePartialItem)
// router.patch('/detail/:id', authMiddleware, updatePartialItemDetail)

module.exports = router
