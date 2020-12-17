const { Router } = require('express')
const colorCtl = require('../controllers/colors')
const authMiddleware = require('../middlewares/auth')
const roleChecker = require('../middlewares/roleChecker')

const router = Router()

router.get('/', colorCtl.getAllColors)
router.post('/', authMiddleware, roleChecker.seller, colorCtl.addColor)
router.patch('/:id', authMiddleware, roleChecker.seller, colorCtl.updateColor)
router.delete('/:id', authMiddleware, roleChecker.seller, colorCtl.deleteColor)

module.exports = router
