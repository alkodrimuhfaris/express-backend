const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const sanitize = require('../helpers/dataSanitizer')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

const {
  createCategoryModel,
  viewCategoriesModel,
  viewCountCategoriesModel,
  getCategoryModel,
  getCategoryCountModel,
  updateCategoriesModel,
  deleteCategoryModel

} = require('../models/categories')

const {
  updateItemModel
} = require('../models/items')

const pagination = require('../helpers/pagination')
const features = require('../helpers/features')
const table = 'categories'

// POST
module.exports = {
  createCategory: (req, res) => {
    let { name } = req.body
    name = sanitize(name)
    console.log(name)
    if (name) {
      createCategoryModel(name, (err, result) => {
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
  viewCategories: (req, res) => {
    let count = 0
    const defSearch = 'name'
    const defSort = 'id'
    const { searchKey, searchValue, sortKey, sortValue } = features(req.query, table, defSearch, defSort)
    const { page, limit, offset } = pagination.pagePrep(req.query)
    viewCategoriesModel(searchKey, searchValue, sortKey, sortValue, limit, offset, (err, result) => {
      if (!err) {
        if (result.length) {
          viewCountCategoriesModel(searchKey, searchValue, (_err, data) => {
            console.log(_err)
            count = data[0]
            const pageInfo = pagination.paging(count, page, limit, table, req)
            res.status(201).send({
              success: true,
              message: 'List of categories',
              category: result[0].category,
              data: result,
              pageInfo
            })
          })
        } else {
          const pageInfo = pagination.paging(count, page, limit, table, req)
          res.status(201).send({
            success: true,
            message: 'There is no category in the list',
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
  getDetailCategories: (req, res) => {
    const { id } = req.params
    let count = 0
    const defSort = 'price'
    const defSearch = 'name'
    const { sortKey, sortValue } = features(req.query, table, defSearch, defSort)
    const { page, limit, offset } = pagination.pagePrep(req.query)
    getCategoryModel(id, sortKey, sortValue, limit, offset, (err, result) => {
      console.log(result[0])
      if (!err) {
        if (result.length) {
          getCategoryCountModel(id, (_err, data) => {
            count = data[0]
            const pageInfo = pagination.paging(count, page, limit, table, req)
            res.status(201).send({
              success: true,
              message: `List of items on ${result[0].category} category`,
              data: result,
              pageInfo
            })
          })
        } else {
          const pageInfo = pagination.paging(count, page, limit, table, req)
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
  updateCategories: (req, res) => {
    let { name } = req.body
    const { id } = req.params
    name = sanitize(name)
    console.log(name)
    if (name.trim()) {
      updateCategoriesModel(name, id, (err, result) => {
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
  deleteCategory: (req, res) => {
    const { id } = req.params
    console.log(id)
    deleteCategoryModel(id, (err, result) => {
      if (result.affectedRows) {
        const setCategory = `category_id = ${null}`
        const searchCategory = `category_id = ${id}`
        updateItemModel(setCategory, searchCategory, (_err, _result) => {
          console.log(result)
          res.status(201).send({
            success: true,
            message: `Category with id ${id} has been deleted`
          })
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
