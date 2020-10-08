const { Router } = require('express')
const {
  viewItems,
  getDetailItem,
  getCategories,
  detailCategories,
  detailSubCategories
} = require('../controllers/public')


const router = Router()

router.get('/products/:id', getDetailItem)
router.get('/products', viewItems(0))
router.get('/new', viewItems('new'))
router.get('/popular', viewItems('popular'))
router.get('/categories', getCategories)
router.get('/categories/:id', detailCategories)
router.get('/categories/subcategory/:id', detailSubCategories)

module.exports = router
