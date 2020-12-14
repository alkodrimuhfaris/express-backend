const { Router } = require('express')
const checkoutModel = require('../controllers/checkout')
const authMiddleware = require('../middlewares/auth')
const roleChecker = require('../middlewares/roleChecker')

const router = Router()

router.post('/get', authMiddleware, checkoutModel.getCheckout)
router.get('/deliveryfee', authMiddleware, checkoutModel.getDeliveryFee)
router.get('/seller/array', authMiddleware, checkoutModel.getSellerArr)
router.post('/commit', authMiddleware, checkoutModel.processToPayment)
router.post('/commit/payment/:id', authMiddleware, roleChecker.paramsNumber, checkoutModel.commitPayment)
// router.patch('/:id', authMiddleware, multerFields('product_image'), updatePartialItem)
// router.patch('/detail/:id', authMiddleware, updatePartialItemDetail)

module.exports = router
