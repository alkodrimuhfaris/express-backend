const { Router } = require('express')

const controllerTransaction = require('../controllers/transaction')

const router = Router()

router.get('/all', controllerTransaction.getAllTransaction)
router.get('/all/:id', controllerTransaction.getTransactionById)
router.get('/detail', controllerTransaction.getAllDetailTransaction)
router.get('/detail/:id', controllerTransaction.getDetailTransactionById)
router.get('/merchant/all/:id', controllerTransaction.getAllMerchantTransactionById)
router.get('/merchant/detail/:id', controllerTransaction.getAllMerchantDetailTransactionById)

module.exports = router
