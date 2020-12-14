const responseStandard = require('../helpers/response')
const joi = require('joi')
const itemDetailModel = require('../models/itemDetails')
const colorModel = require('../models/colors')

module.exports = {
  createItemDetail: async (req, res) => {
    const { id: item_id } = req.params

    // validate data for item detail
    const schema = joi.object({
      colorName: joi.string().required(),
      hex: joi.string().pattern(new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i)).required(),
      available: joi.boolean().required()
    })
    const { value: data, error } = schema.validate(req.body)
    if (error) {
      console.log(error)
      return responseStandard(res, error.message, {}, 400, false)
    }

    Object.assign(data, { item_id })

    try {
      // search or create new color in color table
      const { results } = await colorModel.searchOrCreateColor({
        name: data.colorName,
        hex: data.hex
      })

      // get id from color table
      const color_id = results[0].insertId

      // validate object for updating the item data
      const schemaDetail = joi.object({
        item_id: joi.number().required(),
        color_id: joi.number().required(),
        available: joi.boolean().required()
      })
      const { value: dataDetail, err } = schemaDetail.validate({
        item_id,
        color_id,
        available: data.available
      })
      if (err) {
        console.log(err)
        return responseStandard(res, err.message, {}, 400, false)
      }
      const result = await itemDetailModel.createItemDetails(dataDetail)
      Object.assign(data, { id: result.insertId })
      return responseStandard(res, 'detail item has been created', { results: data })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  updateItemDetail: async (req, res) => {
    let { id, item_id } = req.params

    // cleaning id and item_id inputs
    if (!Number(id) || !Number(item_id)) {
      return responseStandard(res, 'id and item_id must be a number!', {}, 400, false)
    }
    id = Number(id)
    item_id = Number(item_id)

    // validate data for item detail
    const schema = joi.object({
      colorName: joi.string().required(),
      hex: joi.string().pattern(new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i)).required(),
      available: joi.boolean().required()
    })
    const { value: data, error } = schema.validate(req.body)
    if (error) {
      console.log(error)
      return responseStandard(res, error.message, {}, 400, false)
    }

    Object.assign(data, { id, item_id })

    try {
      // search or create new color in color table
      const { results } = await colorModel.searchOrCreateColor({
        name: data.colorName,
        hex: data.hex
      })

      // get id from color table
      const color_id = results[0].insertId

      // validate object for updating the item data
      const schemaDetail = joi.object({
        item_id: joi.number().required(),
        color_id: joi.number().required(),
        available: joi.boolean().required()
      })
      const { value: dataDetail, err } = schemaDetail.validate({
        item_id,
        color_id,
        available: data.available
      })
      if (err) {
        console.log(err)
        return responseStandard(res, err.message, {}, 400, false)
      }
      const check = await itemDetailModel.getItemDetailsById(id)
      if (!check.length) {
        return responseStandard(res, 'ID is invalid!', {}, 500, false)
      }
      await itemDetailModel.updateItemDetails(dataDetail, { id, item_id })
      return responseStandard(res, 'detail item has been updated!', { results: data })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  deleteItemDetail: async (req, res) => {
    let { id, item_id } = req.params
    if (!Number(id) || !Number(item_id)) {
      return responseStandard(res, 'id and item_id must be a number!', {}, 400, false)
    }
    id = Number(id)
    item_id = Number(item_id)
    try {
      const check = await itemDetailModel.getItemDetailsById(id)
      if (!check.length) {
        return responseStandard(res, 'ID is invalid!', {}, 500, false)
      }
      await itemDetailModel.deleteItemDetails({ id, item_id })
      return responseStandard(res, 'detail item has been deleted!', {})
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  getItemDetailByItemId: async (req, res) => {
    const { id: item_id } = req.params
    try {
      const results = await itemDetailModel.getItemDetailsByItemId(item_id)
      if (!results.length) {
        return responseStandard(res, 'There is no item id in the list', {})
      }
      return responseStandard(res, 'detail item on item with id: ' + item_id, { results })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  getItemDetailById: async (req, res) => {
    const { id } = req.params
    try {
      const results = await itemDetailModel.getItemDetailsById(id)
      if (!results.length) {
        return responseStandard(res, 'There is no item id in the list', {})
      }
      return responseStandard(res, 'detail item with id: ' + id, { results })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  }
}
