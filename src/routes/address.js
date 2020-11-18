const { Router } = require('express')
const {
	getAllAddress,
	getDetailAddress,
	createAddres,
	updateAddressModel,
	deleteAddress,
	getAllProvince,
	getAllCityInProvince
} = require('../controllers/address')


const router = Router()

router.get('/', getAllAddress)
router.post('/', createAddres)
router.put('/:id', updateAddressModel('put'))
router.patch('/:id', updateAddressModel('patch'))
router.delete('/:id', deleteAddress)
router.get('/:id', getDetailAddress)
router.get('/province/', getAllProvince)
router.get('/province/city/:id', getAllCityInProvince)

module.exports = router
