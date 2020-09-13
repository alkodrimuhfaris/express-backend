const { Router } = require('express')
const {
  viewItems,
  getDetailItem,
  createItem,
  updateItem,
  updatePartialItem,
  deleteItem
} = require('../controllers/items')

const router = Router()

router.post('/', createItem)
router.get('/', viewItems)
router.put('/:id', updateItem)
router.patch('/:id', updatePartialItem)
router.delete('/:id', deleteItem)
router.get('/:id', getDetailItem)

module.exports = router
