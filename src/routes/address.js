const { Router } = require('express')
const {
	getAllAddress,
	getDetailAddress,
	createAddres,
	updateAddressModel,
	deleteAddress
} = require('../controllers/address')


const router = Router()

router.get('/', getAllAddress)
router.post('/', createAddres)
router.put('/:id', updateAddressModel(1))
router.patch('/:id', updateAddressModel(0))
router.delete('/:id', deleteAddress)
router.get('/:id', getDetailAddress)

module.exports = router
