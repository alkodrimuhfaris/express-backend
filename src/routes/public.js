const { Router } = require('express')
const {
  viewItems,
  getDetailItem,
  getCategories,
  detailCategories,
  getDetailColor
} = require('../controllers/public')

const router = Router()

router.get('/products/detail/:id', getDetailColor)
router.get('/products/:id', getDetailItem)
router.get('/products', viewItems(0))
router.get('/new', viewItems('new'))
router.get('/popular', viewItems('popular'))
router.get('/categories', getCategories)
router.get('/categories/:id', detailCategories)

module.exports = router
