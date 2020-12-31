const { Router } = require('express')

const controllerTransaction = require('../controllers/transaction')
const roleChecker = require('../middlewares/roleChecker')

const router = Router()

router.get('/all', controllerTransaction.getAllTransaction)
router.get('/all/:id', roleChecker.paramsNumber, controllerTransaction.detailTransaction)
router.get('/detail', controllerTransaction.getAllDetailTransaction)
router.get('/detail/:id', roleChecker.paramsNumber, controllerTransaction.getDetailTransactionById)
router.get('/merchant/all/:id', roleChecker.paramsNumber, controllerTransaction.getAllMerchantTransactionById)
router.get('/merchant/detail/:id', roleChecker.paramsNumber, controllerTransaction.getAllMerchantDetailTransactionById)

// admin total transaction
router.patch(
  '/admin/total/:id',
  roleChecker.admin,
  roleChecker.paramsNumber,
  controllerTransaction.updateTransaction
)
router.delete(
  '/admin/total/:id',
  roleChecker.admin,
  roleChecker.paramsNumber,
  controllerTransaction.deleteTransaction
)

// admin merchant transaction
router.patch(
  '/admin/merchant/:id',
  roleChecker.admin,
  roleChecker.paramsNumber,
  controllerTransaction.updateTransactionMerchant
)
router.delete(
  '/admin/merchant/:id',
  roleChecker.admin,
  roleChecker.paramsNumber,
  controllerTransaction.deleteTransactionMerchant
)

// admin detail transaction
router.patch(
  '/admin/detail/:id',
  roleChecker.admin,
  roleChecker.paramsNumber,
  controllerTransaction.updateTransactionDetail
)
router.delete(
  '/admin/detail/:id',
  roleChecker.admin,
  roleChecker.paramsNumber,
  controllerTransaction.deleteTransactionDetail
)

module.exports = router
