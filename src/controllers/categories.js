const sanitize = require('../helpers/dataSanitizer')
const response = require('../helpers/response')

const categoryModel = require('../models/categories')
const itemModel = require('../models/items')

const pagination = require('../helpers/pagination')
const joi = require('joi')

module.exports = {
  viewCategories: async (req, res) => {
    const path = 'categories'
    const { page, limit } = req.query
    try {
      const { results, count } = await categoryModel.viewAllCategories({}, req.query)
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
    const path = 'categories/' + id
    const { limit, page } = req.query
    try {
      const { results: category, count: categoryCount } = await categoryModel.viewAllCategories({ id })
      if (categoryCount) {
        const { results: items, count } = await itemModel.getAllItem({ category_id: id })
        const pageInfo = pagination.paging(count, page, limit, path, req.query)
        const msg = count ? 'Items on category id: ' + id : 'There is no items in here'
        return response(res, msg, { category, items, pageInfo })
      } else {
        return response(res, 'There is no category in here')
      }
    } catch (error) {
      console.log(error)
      return response(res, 'Internal server error', {}, 500, false)
    }
  },
  createCategory: async (req, res) => {
    let categories_image = ''
    if (req.file) {
      categories_image = sanitize('Uploads/' + req.file.filename)
    } else {
      return response(res, 'insert image for category!', {}, 400, false)
    }
    const schema = joi.object({
      name: joi.string()
    })
    const { value: data, error } = schema.validate(req.body)
    if (error) {
      return response(res, error.message, {}, 400, false)
    }
    Object.assign(data, { categories_image })
    try {
      const result = await categoryModel.createCategoryModel(data)
      if (result.insertId) {
        return response(res, 'Category has been created', { data: { id: result.insertId, ...data } })
      } else {
        return response(res, 'Internal Server error', {}, 500, false)
      }
    } catch (error) {
      console.log(error)
      return response(res, error.message, {}, 500, false)
    }
  },
  updateCategories: async (req, res) => {
    const { id } = req.params
    let categories_image = ''
    if (req.file) {
      categories_image = sanitize('Uploads/' + req.file.filename)
    }
    const schema = joi.object({
      name: joi.string()
    })
    const { value: data, error } = schema.validate(req.body)
    if (error) {
      return response(res, error.message, {}, 400, false)
    }
    categories_image && Object.assign(data, { categories_image })
    try {
      const result = await categoryModel.updateCategoriesModel(data, { id })
      if (result.affectedRows) {
        return response(res, 'item has been updated!', { data })
      } else {
        return response(res, 'Internal server error', {}, 500, false)
      }
    } catch (error) {
      console.log(error)
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteCategory: async (req, res) => {
    const { id } = req.params
    try {
      const result = await categoryModel.deleteCategoryModel({ id })
      if (result.affectedRows) {
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
