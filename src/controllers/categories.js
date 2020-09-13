const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const sanitize = require('../helpers/dataSanitizer')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

const qs = require('querystring')

const {
  createCategoryModel,
  viewCategoriesModel,
  viewCountCategoriesModel,
  getCategoryModel,
  updateCategoriesModel,
  deleteCategoryModel

} = require('../models/categories')

const {
  updateItemModel
} = require('../models/items')

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
    let { page = 1, limit = 5, search = '' } = req.query
    Number(limit) && limit > 0 ? limit = Number(limit) : limit = 5
    Number(page) && page > 0 ? page = Number(page) : page = 1
    const offset = (page - 1) * limit
    viewCategoriesModel(search, limit, offset, (err, result) => {
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
          viewCountCategoriesModel(search, (_err, data) => {
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
              message: 'List of categories',
              data: result,
              pageInfo
            })
          })
        } else {
          res.status(201).send({
            success: true,
            message: 'There is no category in the list',
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
  getDetailCategories: (req, res) => {
    const { id } = req.params
    getCategoryModel(id, (err, result) => {
      const choosenData = result[0]
      if (result[0]) {
        if (!err) {
          res.status(201).send({
            success: true,
            message: `Get data from category = ${id} is success`,
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
        updateItemModel(`category_id = ${null}`, `category_id = ${id}`, (_err, _result) => {
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
