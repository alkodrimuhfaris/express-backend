const { Router } = require('express')
const address = require('../controllers/address')

const router = Router()

const roleChecker = require('../middlewares/roleChecker')

// get all address by admin
router.get('/admin/all', roleChecker.admin, address.getAllAddress)

//
router.post('/', address.createAddress)
router.put('/:id', roleChecker.paramsNumber, address.updateAddressModel('put'))
router.patch('/:id', roleChecker.paramsNumber, address.updateAddressModel('patch'))
router.delete('/:id', roleChecker.paramsNumber, address.deleteAddress)
router.get('/detail/:id', roleChecker.paramsNumber, address.getDetailAddress)
router.get('/', address.getAddress)

// get province
router.get('/province/', address.getAllProvince)
router.get('/province/city/:id', roleChecker.paramsNumber, address.getAllCityInProvince)

module.exports = router
