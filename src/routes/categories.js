const { Router } = require('express')
const {
  createCategory,
  viewCategories,
  viewCategoriesById,
  updateCategories,
  deleteCategory
} = require('../controllers/categories')

const router = Router()

const authMiddleware = require('../middlewares/auth')

const multerSingle = require('../middlewares/multerSingle')

router.post('/', authMiddleware, multerSingle('categories_image'), createCategory)
router.get('/', viewCategories)
router.get('/:id', viewCategoriesById)
router.patch('/:id', authMiddleware, multerSingle('categories_image'), updateCategories)
router.delete('/:id', authMiddleware, deleteCategory)

module.exports = router
