const { Router } = require('express')
const {
	getAllProvince,
	getAllCityInProvince
} = require('../controllers/address')

const router = Router()

router.get('/province', getAllProvince)
router.get('/province/:id', getAllCityInProvince)

module.exports = router
