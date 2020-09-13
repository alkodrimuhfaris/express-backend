const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const sanitize = require('../helpers/dataSanitizer')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

const qs = require('querystring')

const {
  getItemModel,
  viewItemsModel,
  viewCountItemsModel,
  createItemModel,
  updateItemModel,
  deleteItemModel
} = require('../models/items')

module.exports = {
  viewItems: (req, res) => {
    let { page = 1, limit = 5, search = { name: '' }, sort = { id: 0 } } = req.query
    const searchKey = Object.keys(search)[0] || 'name'
    const searchValue = Object.values(search)[0] || ''
    const sortKey = Object.keys(sort)[0] || 'id'
    let sortValue = Number(Object.values(sort)[0]) || 0
    !sortValue ? sortValue = 'ASC' : sortValue = 'DESC'
    Number(limit) && limit > 0 ? limit = Number(limit) : limit = 5
    Number(page) && page > 0 ? page = Number(page) : page = 1
    const offset = (page - 1) * limit
    viewItemsModel(searchKey, searchValue, sortKey, sortValue, limit, offset, (err, result) => {
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
          viewCountItemsModel(searchKey, searchValue, (_err, data) => {
            // console.log(data)
            const { count } = data[0]
            // console.log(count)
            pageInfo.count = count
            pageInfo.pages = Math.ceil(count / limit)
            const { pages, currentPage } = pageInfo
            if (currentPage < pages) {
              pageInfo.nextLink = `http://localhost:8080/items?${qs.stringify({ ...req.query, ...{ page: page + 1 } })}`
            }
            if (currentPage > 1) {
              pageInfo.prefLink = `http://localhost:8080/items?${qs.stringify({ ...req.query, ...{ page: page - 1 } })}`
            }
            res.status(201).send({
              success: true,
              message: 'List of items',
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
    const colValue = Object.values(req.body).filter(item => item.trim()).map(item => {
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
      const data = Object.entries(req.body).filter(item => item[1].trim()).map(item => {
        item[1] = sanitize(item[1])
        return (Number(item[1]) > 0) ? `${item[0]}=${Number(item[1])}` : `${item[0]}='${item[1]}'`
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
