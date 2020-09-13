const { Router } = require('express')
const {
  createMycart,
  viewMycart,
  getDetailMyCart,
  updateMycart,
  updatePatchMycart,
  deleteMycart
} = require('../controllers/mycart')

const router = Router()

router.post('/', createMycart)
router.get('/', viewMycart)
router.get('/:userId', getDetailMyCart)
router.put('/:userId', updateMycart)
router.patch('/:userId', updatePatchMycart)
router.delete('/:id', deleteMycart)

module.exports = router
