const express = require('express')
const app = express()

const itemsRouter = require('./src/routes/items')
const categoriesRouter = require('./src/routes/categories')
const mycartsRouter = require('./src/routes/mycart')

app.use(express.static('public'))

const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/items', itemsRouter)
app.use('/categories', categoriesRouter)
app.use('/mycart', mycartsRouter)

app.listen(8080, () => {
  console.log('App listening on port 8080')
})

// nama repo: express-backend
