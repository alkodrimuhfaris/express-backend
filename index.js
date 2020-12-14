require('dotenv').config() // setting environment
const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors())

// import middleware
const authMiddleware = require('./src/middlewares/auth')
const roleChecker = require('./src/middlewares/roleChecker')

// import route
const authRouter = require('./src/routes/auth')
const itemsRouter = require('./src/routes/items')
const categoriesRouter = require('./src/routes/categories')
const mycartsRouter = require('./src/routes/mycart')
const usersRouter = require('./src/routes/users')
const addressRouter = require('./src/routes/address')
const publicRouter = require('./src/routes/public')
const checkoutRouter = require('./src/routes/checkout')
const transactionRouter = require('./src/routes/transaction')
const cityRouter = require('./src/routes/city')

const response = require('./src/helpers/response')

app.use(express.static('public'))

const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// provide static
app.use('/Uploads', express.static('./Assets/Public/Uploads'))

app.use('/items', authMiddleware, roleChecker.seller, itemsRouter)
app.use('/categories', categoriesRouter)

app.use('/address', authMiddleware, addressRouter)
app.use('/auth', authRouter)
app.use('/mycart', authMiddleware, mycartsRouter)
app.use('/users', authMiddleware, usersRouter)
app.use('/public', publicRouter)
app.use('/checkout', checkoutRouter)
app.use('/city', cityRouter)
app.use('/transaction', authMiddleware, transactionRouter)

app.use('/', (req, res) => {
  console.log('some one opened home')
  return response(res, 'TUKU APP backend', {})
})

app.listen(8989, () => {
  console.log('App listening on port 8989')
})

// nama repo: express-backend
