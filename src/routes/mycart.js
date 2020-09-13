const { Router } = require('express')
const {
  createMycart,
  viewMycart,
  getDetailMyCart,
  updateCategories,
  deleteCategory
} = require('../controllers/mycart')

const router = Router()

router.post('/', createMycart)
router.get('/', viewMycart)
router.get('/:userId', getDetailMyCart)
router.put('/:id', updateCategories)
router.delete('/:id', deleteCategory)

module.exports = router
