const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const sanitize = require('../helpers/dataSanitizer')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

const qs = require('querystring')

const {
  createMycartsModel,
  getMycartModel,
  viewMycartsModel,
  viewCountMycartsModel,
  getCountMycartModel,
  updateMycartModel,
  deleteMycartModel

} = require('../models/mycart')

const {
  updateItemModel,
  getItemModel
} = require('../models/items')

// POST
module.exports = {
  createMycart: (req, res) => {
    const itemId = Number(req.body.item_id.trim())
    const userId = Number(req.body.user_id.trim())
    const andValue = `AND (item_id = ${itemId})`
    console.log(itemId)
    console.log(userId)
    getItemModel(itemId, (_err, result) => {
      if (result.length) {
        getMycartModel(userId, andValue, 0, 5, (_err0, result0) => {
          if (!result0.length) {
            const dataKey = Object.keys(req.body)
            const dataValue = Object.values(req.body)
              .filter(item => Number(item.trim()) > 0)
              .map(item => Number(item.trim()))
            // console.log(name)
            if (dataKey.length === dataValue.length) {
              createMycartsModel(dataKey, dataValue, (err, result) => {
                if (!err) {
                  res.status(201).send({
                    success: true,
                    message: 'item has been created',
                    data: {
                      id: result.insertId,
                      ...req.body
                    }
                  })
                } else {
                  console.log(err)
                  res.status(500).send({
                    success: false,
                    message: 'Internal Server Error'
                  })
                }
              })
            } else {
              res.status(400).send({
                success: false,
                message: 'Quantity should not be 0!'
              })
            }
          } else {
            res.status(400).send({
              success: false,
              message: 'product is already being added! use patch or put instead'
            })
          }
        })
      } else {
        res.status(400).send({
          success: false,
          message: 'product is null!'
        })
      }
    })
  },

  viewMycart: (req, res) => {
    let { page = 1, limit = 5, search = { 'items.name': '' }, sort = { date_added: 0 } } = req.query
    const searchKey = Object.keys(search)[0] || 'items.name'
    const searchValue = Object.values(search)[0] || ''
    const sortKey = Object.keys(sort)[0] || 'date_added'
    let sortValue = Number(Object.values(sort)[0]) || 0
    sortValue ? sortValue = 'ASC' : sortValue = 'DESC'
    Number(limit) && limit > 0 ? limit = Number(limit) : limit = 5
    Number(page) && page > 0 ? page = Number(page) : page = 1
    const offset = (page - 1) * limit
    viewMycartsModel(searchKey, searchValue, sortKey, sortValue, limit, offset, (err, result) => {
      if (!err) {
        const pageInfo = {
          count: 0,
          pages: 1,
          currentPage: page,
          dataPerPage: limit,
          nextLink: null,
          prefLink: null
        }
        if (result.length) {
          viewCountMycartsModel(searchKey, searchValue, (_err, data) => {
            // console.log(data)
            const { count } = data[0]
            // console.log(count)
            pageInfo.count = count
            pageInfo.pages = Math.ceil(count / limit)
            const { pages, currentPage } = pageInfo
            if (currentPage < pages) {
              pageInfo.nextLink = `http://localhost:8080/categories?${qs.stringify({ ...req.query, ...{ page: page + 1 } })}`
            }
            if (currentPage > 1) {
              pageInfo.prefLink = `http://localhost:8080/categories?${qs.stringify({ ...req.query, ...{ page: page - 1 } })}`
            }
            res.status(201).send({
              success: true,
              message: 'List of Carts',
              data: result,
              pageInfo
            })
          })
        } else {
          res.status(201).send({
            success: true,
            message: 'There is no item in the list',
            pageInfo
          })
        }
      } else {
        console.log(err)
        res.status(500).send({
          sucess: false,
          message: 'Internal Server Error'
        })
      }
    })
  },

  getDetailMyCart: (req, res) => {
    const { userId } = req.params
    console.log(userId)
    let { page = 1, limit = 5, filter = { item_id: 0 } } = req.query
    const andValue = Object.entries(filter)
      .filter(item => (Number(item[1])) || !(item[1] == 0))
      .map(item =>
        (Number(item[1]))
          ? `AND ${item[0]} = ${Number(item[1])}`
          : `AND ${item[0]} = '${sanitize(item[1])}'`)
      .join(' ') || ''
    console.log('andValue :' + andValue)
    Number(limit) && limit > 0 ? limit = Number(limit) : limit = 5
    Number(page) && page > 0 ? page = Number(page) : page = 1
    const offset = (page - 1) * limit
    getMycartModel(userId, andValue, offset, limit, (err, result) => {
      if (!err) {
        const pageInfo = {
          count: 0,
          pages: 1,
          currentPage: page,
          dataPerPage: limit,
          nextLink: null,
          prefLink: null
        }
        if (result.length) {
          getCountMycartModel(userId, andValue, (_err, data) => {
            console.log(data)
            const { count } = data[0]
            // console.log(count)
            pageInfo.count = count
            pageInfo.pages = Math.ceil(count / limit)
            const { pages, currentPage } = pageInfo
            if (currentPage < pages) {
              pageInfo.nextLink = `http://localhost:8080/mycart/${userId}?${qs.stringify({ ...req.query, ...{ page: page + 1 } })}`
            }
            if (currentPage > 1) {
              pageInfo.prefLink = `http://localhost:8080/mycart/${userId}?${qs.stringify({ ...req.query, ...{ page: page - 1 } })}`
            }
            res.status(201).send({
              success: true,
              message: `List of items from the user id number ${userId}'s cart`,
              totalPrice: data[0].totalPrice,
              data: result,
              pageInfo

            })
          })
        } else {
          res.status(201).send({
            success: true,
            message: 'There is no items in the list',
            pageInfo
          })
        }
      } else {
        console.log(err)
        res.status(500).send({
          sucess: false,
          message: 'Internal Server Error'
        })
      }
    })
  },

  updateMycart: (req, res) => {
    let { qty = { add: 1 }, itemId = 0 } = req.body
    itemId = Number(itemId)
    const { cartId } = req.query
    const { userId } = req.params
    let andValue = `and carts.id = ${cartId}`
    qty = Object.entries(qty).filter(item => Number(item[1]) > 0)
    if (qty.length === 1 && itemId) {
      getMycartModel(userId, andValue, 0, 1, (_err, result) => {
        console.log(result[0].quantity)
        const quantity = result[0].quantity
        if (qty[0] === 'add') {
          qty[1] = quantity + qty[1]
          qty[0] = 'quantity'
        } else if (arr[0] === 'subtract') {
          qty[1] = quantity - qty[1]
          qty[0] = 'quantity'
        } else {
          qty[0] = 'quantity'
        }
        andValue = `AND (item_id = ${itemId})`
        getMycartModel(userId, andValue, 0, 1, (_err0, result0) => {
          if (!result0.length) {
            const queryUpdate = `(${qty[0]} = ${qty[1]})`
            updateMycartModel(queryUpdate, cartId, (err1, result1) => {
              if (result1.affectedRows) {
                res.status(201).send({
                  success: true,
                  message: 'item has been updated',
                  newData: req.body
                })
              } else {
                console.log(err1)
                res.status(500).send({
                  success: false,
                  message: 'The id you choose is invalid!'
                })
              }
            })
          }
        })
      })
    } else {
      res.status(201).send({
        success: false,
        message: 'There is no updates on data. All field must be filled with the correct data type!'
      })
    }
  },
  deleteMycart: (req, res) => {
    const { id } = req.params
    console.log(id)
    deleteMycartModel(id, (err, result) => {
      if (result.affectedRows) {
        res.status(201).send({
          success: true,
          message: `Cart with id ${id} has been deleted`
        })
      } else {
        console.log(err)
        res.status(400).send({
          success: false,
          message: 'The id cart you choose is invalid!'
        })
      }
    })
  }
}
