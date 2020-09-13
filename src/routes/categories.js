const { Router } = require('express')
const {
  createCategory,
  viewCategories,
  getDetailCategories,
  updateCategories,
  deleteCategory
} = require('../controllers/categories')

const router = Router()

router.post('/', createCategory)
router.get('/', viewCategories)
router.get('/:id', getDetailCategories)
router.put('/:id', updateCategories)
router.delete('/:id', deleteCategory)

module.exports = router
