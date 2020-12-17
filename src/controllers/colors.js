const response = require('../helpers/response')
const joi = require('joi')
const colorModel = require('../models/colors')
const pagination = require('../helpers/pagination')

module.exports = {
  addColor: async (req, res) => {
    const schema = joi.object({
      colorName: joi.string().required(),
      hex: joi.string().pattern(new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i)).required()
    })
    const { value: data, error } = schema.validate(req.body)
    if (error) {
      console.log(error)
      return response(res, error.message, {}, 400, false)
    }
    try {
      const { results } = await colorModel.searchOrCreateColor(data)
      return response(res, 'create color successfull', results)
    } catch (err) {
      console.log(err)
      return response(res, err.message, {}, 500, false)
    }
  },
  updateColor: async (req, res) => {
    const { id } = req.params
    const schema = joi.object({
      colorName: joi.string().required(),
      hex: joi.string().pattern(new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i)).required()
    })
    const { value: data, error } = schema.validate(req.body)
    if (error) {
      console.log(error)
      return response(res, error.message, {}, 400, false)
    }
    try {
      const { count } = await colorModel.getColors({ id })
      if (!count) {
        return response(res, 'color is not found!', {}, 400, false)
      }
      await colorModel.updateColors(data, { id })
      return response(res, 'update color successfull', {})
    } catch (err) {
      console.log(err)
      return response(res, err.message, {}, 500, false)
    }
  },
  deleteColor: async (req, res) => {
    const { id } = req.params
    try {
      const { count } = await colorModel.getColors({ id })
      if (!count) {
        return response(res, 'color is not found!', {}, 400, false)
      }
      await colorModel.deleteColors({ id })
      return response(res, 'delete color successfull', {})
    } catch (err) {
      console.log(err)
      return response(res, err.message, {}, 500, false)
    }
  },
  getAllColors: async (req, res) => {
    const { page, limit } = req.query
    const path = 'colors'
    try {
      const { results, count } = await colorModel.getColors({}, req.query)
      const pageInfo = pagination.paging(count, page, limit, path, req)
      const msg = count ? 'list of all colors' : 'there\'s no color in here'
      return response(res, msg, { results, pageInfo })
    } catch (err) {
      console.log(err)
      return response(res, err.message, {}, 500, false)
    }
  }
}
