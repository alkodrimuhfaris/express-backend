const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const sanitize = require('../helpers/dataSanitizer')
const response = require('../helpers/response')
const fs = require('fs')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

const categoryModel = require('../models/categories')

const pagination = require('../helpers/pagination')
const joi = require('joi')

// POST
module.exports = {
  viewCategories: async (req, res) => {
    const path = 'categories'
    const { page, limit } = req.query
    try {
      const results = await categoryModel.viewAllCategories(req.query)
      const [{ count }] = await categoryModel.viewAllCategoriesCount(req.query) || 0
      const pageInfo = pagination.paging(count, page, limit, path, req.query)
      if (results.length) {
        return response(res, 'List of Categories', { results, pageInfo })
      } else {
        return response(res, 'There is no item in the list', { pageInfo })
      }
    } catch (error) {
      console.log(error)
      return response(res, 'Internal server error', {}, 500, false)
    }
  },
  viewCategoriesById: async (req, res) => {
    const { id } = req.params
    if (!Number(id)) { return response(res, 'id must be a number', {}, 400, false) }
    try {
      const results = await categoryModel.getCategorybyID(Number(id))
      if (results.length) {
        return response(res, 'Categories on id: ' + id, { results })
      } else {
        return response(res, 'There is no category in here')
      }
    } catch (error) {
      console.log(error)
      return response(res, 'Internal server error', {}, 500, false)
    }
  },
  createCategory: async (req, res) => {
    let imgKey = ''
    let imgVal = ''
    if (req.file) {
      imgKey = req.file.fieldname
      imgVal = sanitize('Uploads/' + req.file.filename)
    }
    const { id: user_id, role_id } = req.user
    if (!user_id || !role_id || role_id === 4) {
      imgVal && fs.unlinkSync(process.env.PUBLIC_UPLOAD_FOLDER + imgVal)
      return response(res, 'Forbidden Access!', {}, 403, false)
    }
    const schema = joi.object({
      name: joi.string()
    })
    const { value: data, error } = schema.validate(req.body)
    if (error) {
      imgVal && fs.unlinkSync(process.env.PUBLIC_UPLOAD_FOLDER + imgVal)
      return response(res, error.message, {}, 400, false)
    }
    Object.assign(data, { [imgKey]: imgVal })
    try {
      const result = await categoryModel.createCategoryModel(data)
      if (result.insertId) {
        return response(res, 'Category has been created', { data: { id: result.insertId, ...data } })
      } else {
        imgVal && fs.unlinkSync(process.env.PUBLIC_UPLOAD_FOLDER + imgVal)
        return response(res, 'Internal Server error', {}, 500, false)
      }
    } catch (error) {
      console.log(error)
      imgVal && fs.unlinkSync(process.env.PUBLIC_UPLOAD_FOLDER + imgVal)
      return response(res, error.message, {}, 500, false)
    }
  },
  updateCategories: async (req, res) => {
    let imgKey = ''
    let imgVal = ''
    if (req.file) {
      imgKey = req.file.fieldname
      imgVal = sanitize('Uploads/' + req.file.filename)
    }
    const { id: user_id, role_id } = req.user
    if (!user_id || !role_id || role_id === 4) {
      imgVal && fs.unlinkSync(process.env.PUBLIC_UPLOAD_FOLDER + imgVal)
      return response(res, 'Forbidden Access!', {}, 403, false)
    }
    const { id } = req.params
    if (!Number(id)) { return response(res, 'Id must be a number!', {}, 400, false) }
    const schema = joi.object({
      name: joi.string()
    })
    const { value: data, error } = schema.validate(req.body)
    if (error) {
      imgVal && fs.unlinkSync(process.env.PUBLIC_UPLOAD_FOLDER + imgVal)
      return response(res, error.message, {}, 400, false)
    }
    Object.assign(data, { [imgKey]: imgVal })
    try {
      const [{ categories_image }] = categoryModel.getCategorybyID(Number(id))
      const result = await categoryModel.updateCategoriesModel(data, { id: Number(id) })
      if (result.affectedRows) {
        categories_image && fs.unlinkSync(process.env.PUBLIC_UPLOAD_FOLDER + categories_image)
        return response(res, 'item has been updated!', { data })
      } else {
        (imgVal) && fs.unlinkSync(process.env.PUBLIC_UPLOAD_FOLDER + imgVal)
        return response(res, 'Internal server error', {}, 500, false)
      }
    } catch (error) {
      imgVal && fs.unlinkSync(process.env.PUBLIC_UPLOAD_FOLDER + imgVal)
      console.log(error)
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteCategory: async (req, res) => {
    const { id } = req.params
    if (!Number(id)) { return response(res, 'Id must be a number!', {}, 400, false) }
    console.log(id)
    const { id: user_id, role_id } = req.user
    if (!user_id || !role_id || role_id === 4) {
      return response(res, 'Forbidden Access!', {}, 403, false)
    }
    try {
      const [{ categories_image }] = categoryModel.getCategorybyID(Number(id))
      const result = await categoryModel.deleteCategoryModel(Number(id))
      if (result.affectedRows) {
        categories_image && fs.unlinkSync(process.env.PUBLIC_UPLOAD_FOLDER + categories_image)
        return response(res, 'item has been deleted!')
      } else {
        return response(res, 'Internal server error', {}, 400, false)
      }
    } catch (error) {
      console.log(error)
      return response(res, error.message, {}, 500, false)
    }
  }
}
