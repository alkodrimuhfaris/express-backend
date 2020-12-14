const { Router } = require('express')
const {
  viewItems,
  getDetailItem,
  getCategories,
  detailCategories,
  getDetailColor
} = require('../controllers/public')
const roleChecker = require('../middlewares/roleChecker')

const router = Router()

router.get('/products/detail/:id', roleChecker.paramsNumber, getDetailColor)
router.get('/products/:id', roleChecker.paramsNumber, getDetailItem)
router.get('/products', viewItems(0))
router.get('/new', viewItems('new'))
router.get('/popular', viewItems('popular'))
router.get('/categories', getCategories)
router.get('/categories/:id', roleChecker.paramsNumber, detailCategories)

module.exports = router
