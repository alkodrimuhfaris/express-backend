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
    let { add = 0, subtract = 0, quantity = 0, itemId = 0 } = req.body
    let qty = { add: Number(add), subtract: Number(subtract), quantity: Number(quantity) }
    console.log(qty)
    itemId = Number(itemId)
    const { cartId } = req.query
    const { userId } = req.params
    let andValue = `and carts.id = ${cartId}`;
    [qty] = Object.entries(qty).filter(item => Number(item[1]) > 0)
    console.log('qty obj entries: ' + qty[0])
    if (qty.length === 2 && itemId) {
      getMycartModel(userId, andValue, 0, 1, (_err, result) => {
        console.log(_err)
        if (result[0].quantity) {
          console.log('quantity: ' + result[0].quantity)
          console.log('itemIdSelected: ' + result[0].item_id)
          const itemIdSelected = result[0].item_id
          const quantity = result[0].quantity
          if (qty[0] === 'add') {
            qty[1] = quantity + qty[1]
            qty[0] = 'quantity'
          } else if (qty[0] === 'subtract') {
            qty[1] = quantity - qty[1]
            qty[0] = 'quantity'
          }
          if ((itemId === 0) || (itemId === itemIdSelected)) {
            const queryUpdate = `${qty[0]} = ${qty[1]},`
            updateMycartModel(queryUpdate, cartId, (err1, result1) => {
              if (result1.affectedRows) {
                res.status(201).send({
                  success: true,
                  message: 'item has been updated',
                  quantity: qty[0],
                  newData: req.body
                })
              } else {
                console.log(err1)
                res.status(500).send({
                  success: false,
                  message: 'forbidden request'
                })
              }
            })
          } else {
            andValue = `AND (item_id = ${itemId})`
            getMycartModel(userId, andValue, 0, 1, (_err0, result0) => {
              if (!result0.length) {
                const qry2 = `, item_id = ${itemId},`
                const queryUpdate = `${qty[0]} = ${qty[1]} ${qry2}`
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
                      message: 'Can not update the item'
                    })
                  }
                })
              } else {
                res.status(500).send({
                  success: false,
                  message: 'You already have item with same id! do patch or chose another item!'
                })
              }
            })
          }
        } else {
          res.status(500).send({
            success: true,
            message: 'cart id you inputted is not here!'
          })
        }
      })
    } else {
      res.status(500).send({
        success: false,
        message: 'There is no updates on data. All field must be filled with the correct data type!'
      })
    }
  },

  updatePatchMycart: (req, res) => {
    let { add = 0, subtract = 0, quantity = 0, itemId = 0 } = req.body
    let qty = { add: Number(add), subtract: Number(subtract), quantity: Number(quantity) }
    console.log(qty)
    itemId = Number(itemId)
    const { cartId } = req.query
    const { userId } = req.params
    let andValue = `and carts.id = ${cartId}`
    console.log('qty before obj entries: ' + qty)
    qty = Object.entries(qty).filter(item => Number(item[1]) > 0)
      [qty] = qty
    console.log(qty)
    qty = qty || ['null', 0]
    if (qty.length <= 2 || itemId) {
      getMycartModel(userId, andValue, 0, 1, (_err, result) => {
        if (result[0]) {
          console.log(_err)
          console.log('quantity: ' + result[0].quantity)
          console.log('itemIdSelected: ' + result[0].item_id)
          const itemIdSelected = result[0].item_id
          const quantity = result[0].quantity
          let qry1 = ''
          let qry2 = ''
          const queryUpdate = `${qry1} ${qry2}`
          if (qty[0] === 'add') {
            qty[1] = quantity + qty[1]
            qty[0] = 'quantity'
            qry1 = `${qty[0]} = ${qty[1]},`
          } else if (qty[0] === 'subtract') {
            qty[1] = quantity - qty[1]
            qty[0] = 'quantity'
            qry1 = `${qty[0]} = ${qty[1]}`
          } else if (qty[0] === 'quantity') {
            qry1 = `${qty[0]} = ${qty[1]},`
          } else {
            qry1 = ''
          }
          console.log(qry1)
          if ((itemId === 0) || (itemId === itemIdSelected)) {
            qry2 = `item_id = ${itemIdSelected}`
            console.log(queryUpdate)
            updateMycartModel(queryUpdate, cartId, (err1, result1) => {
              console.log(err1)
              console.log(result1)
              if (!err1) {
                res.status(201).send({
                  success: true,
                  message: 'item has been updated',
                  quantity: qty[0],
                  newData: req.body
                })
              } else {
                console.log(err1)
                res.status(500).send({
                  success: false,
                  message: 'forbidden request'
                })
              }
            })
          } else {
            andValue = `AND (item_id = ${itemId})`
            getMycartModel(userId, andValue, 0, 1, (_err0, result0) => {
              if (!result0.length) {
                const qry2 = `item_id = ${itemId},`
                const queryUpdate = `${qry1} ${qry2}`
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
                      message: 'Can not update the item'
                    })
                  }
                })
              } else {
                res.status(500).send({
                  success: false,
                  message: 'You already have item with same id! do patch or chose another item!'
                })
              }
            })
          }
        } else {
          res.status(500).send({
            success: true,
            message: 'cart id you inputted is not here!'
          })
        }
      })
    } else {
      res.status(500).send({
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
