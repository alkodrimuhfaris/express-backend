const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const sanitize = require('../helpers/dataSanitizer')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

const {
  getItemModel,
  viewItemsModel,
  viewCountItemsModel,
  createItemModel,
  updateItemModel,
  deleteItemModel
} = require('../models/items')

const pagination = require('../helpers/pagination')
const features = require('../helpers/features')
const table = 'items'

module.exports = {
  viewItems: (req, res) => {
    const count = 0
    const defSearch = 'name'
    const defSort = 'id'
    const { searchKey, searchValue, sortKey, sortValue } = features(req.query, defSearch, defSort)
    const { page, limit, offset } = pagination.pagePrep(req.query)
    viewItemsModel(searchKey, searchValue, sortKey, sortValue, limit, offset, (err, result) => {
      if (!err) {
        if (result.length) {
          viewCountItemsModel(searchKey, searchValue, (_err, data) => {
            // console.log(data)
            const { count } = data[0]
            // console.log(count)
            const pageInfo = pagination.paging(count, page, limit, table, req)
            res.status(201).send({
              success: true,
              message: 'List of items',
              data: result,
              pageInfo
            })
          })
        } else {
          const pageInfo = pagination.paging(count, page, limit, table, req)
          res.status(201).send({
            success: true,
            message: 'There is no item in the list',
            pageInfo
          })
        }
      } else {
        // console.log(err)
        res.status(500).send({
          sucess: false,
          message: 'Internal Server Error'
        })
      }
    })
  },
  getDetailItem: (req, res) => {
    const { id } = req.params
    getItemModel(id, (err, result) => {
      const choosenData = result[0]
      if (result[0]) {
        if (!err) {
          res.status(201).send({
            success: true,
            message: `Get data from id = ${req.params.id} is success`,
            choosenData
          })
        } else {
          // console.log(err0)
          res.status(500).send({
            success: false,
            message: 'Internal Server Error'
          })
        }
      } else {
        res.status(201).send({
          success: true,
          message: 'The id you choose is invalid!'
        })
      }
    })
  },
  createItem: (req, res) => {
    const colName = Object.keys(req.body)
    const colValue = Object.values(req.body)
      .filter(item => item.trim())
      .map(item => {
        item = sanitize(item)
        return (Number(item) > 0) ? Number(item) : `'${item}'`
      })
    if (colName.length === colValue.length) {
      createItemModel(colName, colValue, (err, result) => {
        // if (error) throw err
        console.log(colName)
        console.log(colValue)
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
        message: 'All field must be filled!'
      })
    }
  },
  updateItem: (req, res) => {
    const { price = '' } = req.body
    const { id } = req.params
    const keyLength = Object.keys(req.body).length
    const valLength = Object.values(req.body).filter(item => item.trim()).length
    if ((keyLength === valLength) && ((price > 0) || price === '')) {
      const data = Object.entries(req.body)
        .filter(item => item[1].trim())
        .map(item => {
          item[1] = sanitize(item[1])
          return (
            (Number(item[1]) > 0)
              ? `${item[0]}=${Number(item[1])}`
              : `${item[0]}='${item[1]}'`
          )
        })
      const whereId = `id = ${id}`
      updateItemModel(data, whereId, (err, result) => {
        if (result.affectedRows) {
          res.status(201).send({
            success: true,
            message: 'item has been updated',
            newData: req.body
          })
        } else {
          console.log(err)
          res.status(500).send({
            success: false,
            message: 'The id you choose is invalid!'
          })
        }
      })
    } else {
      res.status(201).send({
        success: false,
        message: 'There is no updates on data. All field must be filled with the correct data type!'
      })
    }
  },
  updatePartialItem: (req, res) => {
    const { price = '' } = req.body
    const { id } = req.params
    const bodyInput = Object.entries(req.body).filter(item => item[1].trim())
    if (bodyInput.length && ((price > 0) || price === '')) {
      const data = bodyInput.map(item => {
        item[1] = sanitize(item[1])
        return (Number(item[1]) > 0) ? `${item[0]}=${Number(item[1])}` : `${item[0]}='${item[1]}'`
      })
      const whereId = `id = ${id}`
      console.log(data)
      updateItemModel(data, whereId, (err, result) => {
        if (!err) {
          res.status(201).send({
            success: true,
            message: 'Your item\'s property has been updated'
          })
        } else {
          console.log(err)
          res.status(400).send({
            success: false,
            message: 'Internal Server Error'
          })
        }
      })
    } else {
      let message = ''
      const message1 = 'At least one property is updatted'
      const message2 = 'Price must be number and not zero'
      !(bodyInput.length) ? message = message1 : message = message2
      res.status(500).send({
        success: false,
        message: message
      })
    }
  },
  deleteItem: (req, res) => {
    const { id } = req.params
    console.log(id)
    deleteItemModel(id, (err, result) => {
      if (result.affectedRows) {
        console.log(result)
        res.status(201).send({
          success: true,
          message: `Item with id ${id} has been deleted`
        })
      } else {
        console.log(err)
        res.status(400).send({
          success: false,
          message: 'The id you choose is invalid!'
        })
      }
    })
  }
}
