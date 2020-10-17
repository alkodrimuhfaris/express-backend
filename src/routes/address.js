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
router.put('/:id', updateAddressModel('put'))
router.patch('/:id', updateAddressModel('patch'))
router.delete('/:id', deleteAddress)
router.get('/:id', getDetailAddress)

module.exports = router
