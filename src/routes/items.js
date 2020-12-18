const { Router } = require('express')
const {
  viewItemSeller,
  createItem,
  updateItem,
  deleteItem,
  getCondition
} = require('../controllers/items')
const itemDetail = require('../controllers/itemDetail')
const itemImages = require('../controllers/itemImages')
const multerArray = require('../middlewares/multerArray')
const roleChecker = require('../middlewares/roleChecker')
const multerSingle = require('../middlewares/multerSingle')

const router = Router()

// item
router.get('/', viewItemSeller)
router.post('/', multerArray('product_image'), createItem)
router.patch('/update/:id', roleChecker.paramsNumber, multerArray('product_image'), updateItem)
router.delete('/delete/:id', roleChecker.paramsNumber, deleteItem)

// get condition item
router.get('/condition', getCondition)

// item detail
router.get('/detail/:id', roleChecker.paramsNumber, itemDetail.getItemDetailByItemId)
router.post('/detail', itemDetail.createItemDetail)
router.patch('/detail/update/:item_id/:id', roleChecker.paramsItemId, itemDetail.updateItemDetail)
router.delete('/detail/delete/:item_id/:id', roleChecker.paramsItemId, itemDetail.deleteItemDetail)

// image
router.get('/image', roleChecker.paramsNumber, itemImages.getImage)

// image single
router.post('/image/single', multerSingle('product_image'), itemImages.insertImageArr)
router.patch('/image/update/single/:item_id/:id', roleChecker.paramsItemId, multerSingle('product_image'), itemImages.updateImage)
router.delete('/image/delete/single/:item_id/:id', roleChecker.paramsItemId, itemImages.deleteImage)

// image array
router.post('/image/array', multerArray('product_image'), itemImages.insertImageArr)
router.patch('/image/update/array/:id', roleChecker.paramsNumber, multerArray('product_image'), itemImages.updateImageArr)
router.delete('/image/delete/array/:id', roleChecker.paramsNumber, itemImages.deleteImageArr)

module.exports = router
