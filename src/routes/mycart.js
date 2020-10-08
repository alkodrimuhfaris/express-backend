const { Router } = require('express')
const {
  createMycart,
  viewMycart,
  updateMycart,
  deleteMycart
} = require('../controllers/mycart')

const router = Router()

router.post('/', createMycart)
router.get('/', viewMycart(0))
router.get('/:item_id', viewMycart(1))
router.put('/:id', updateMycart(1))
router.patch('/:id', updateMycart(0))
router.delete('/items/:id', deleteMycart(1))
router.delete('/details/:id', deleteMycart(0))

module.exports = router
