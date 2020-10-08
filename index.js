require('dotenv').config() //setting environment
const express = require('express')
const app = express()
const upload = require('./src/helpers/multerHelper')
const cors = require('cors')

app.use(cors())

//import middleware
const authMiddleware = require('./src/middlewares/auth')

//import route
const authRouter = require('./src/routes/auth')
const itemsRouter = require('./src/routes/items')
const categoriesRouter = require('./src/routes/categories')
const mycartsRouter = require('./src/routes/mycart')
const usersRouter = require('./src/routes/users')
const addressRouter = require ('./src/routes/address')
const publicRouter = require ('./src/routes/public')
const checkoutRouter = require('./src/routes/checkout')

app.use(express.static('public'))

const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// provide static
app.use('/uploads', express.static('./Assets/Public/uploads'))

app.use('/items', itemsRouter)
app.use('/categories', categoriesRouter)

app.use('/address', authMiddleware, addressRouter)
app.use('/auth', authRouter)
app.use('/mycart', authMiddleware, mycartsRouter)
app.use('/users', authMiddleware, usersRouter)
app.use('/public', publicRouter )
app.use('/checkout', checkoutRouter)

app.listen(8080, () => {
  console.log('App listening on port 8080')
})

// nama repo: express-backend
