const { Router } = require('express')
const categories = require('../controllers/categories')
const roleChecker = require('../middlewares/roleChecker')

const router = Router()

const authMiddleware = require('../middlewares/auth')

const multerSingle = require('../middlewares/multerSingle')

router.get('/', categories.viewCategories)
router.get('/:id', roleChecker.paramsNumber, categories.viewCategoriesById)
router.post('/', authMiddleware, roleChecker.seller, roleChecker.paramsNumber, multerSingle('categories_image'), categories.createCategory)
router.patch('/:id', authMiddleware, roleChecker.seller, roleChecker.paramsNumber, multerSingle('categories_image'), categories.updateCategories)
router.delete('/:id', authMiddleware, roleChecker.seller, roleChecker.paramsNumber, categories.deleteCategory)

module.exports = router
