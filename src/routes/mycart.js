const { Router } = require('express')
const mycart = require('../controllers/mycart')
const roleChecker = require('../middlewares/roleChecker')

const router = Router()

router.post('/', mycart.createMyCart)
router.get('/', mycart.viewMycart)
router.patch('/:id', roleChecker.paramsNumber, mycart.updateMyCart)

router.delete('/bulk', mycart.deleteMyCartBulk)
router.delete('/items/:id', roleChecker.paramsNumber, mycart.deleteMyCartByItemId)
router.delete('/details/:id', roleChecker.paramsNumber, mycart.deleteMyCartById)

module.exports = router
