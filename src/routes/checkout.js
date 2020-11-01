const { Router } = require('express')
const checkoutModel = require('../controllers/checkout')
const authMiddleware = require('../middlewares/auth')

const router = Router()

router.get('/', authMiddleware, checkoutModel.getCheckout)
router.get('/deliveryfee', authMiddleware, checkoutModel.getDeliveryFee)
router.get('/seller/array', authMiddleware, checkoutModel.getSellerArr)
router.post('/', authMiddleware, checkoutModel.processToPayment)
router.post('/commit/payment/:id', authMiddleware, checkoutModel.commitPayment)
// router.patch('/:id', authMiddleware, multerFields('product_image'), updatePartialItem)
// router.patch('/detail/:id', authMiddleware, updatePartialItemDetail)

module.exports = router
