const responseStandard = require('../helpers/response')
const joi = require('joi')
const arrayImagetoDB = require('../helpers/imagetoDB')
const qs = require('qs')

const itemModel = require('../models/items')
const categoryModel = require('../models/categories')
const itemDetailModel = require('../models/itemDetails')
const ratingModel = require('../models/ratings')
const colorModel = require('../models/colors')
const itemImages = require('../models/itemImages')

const pagination = require('../helpers/pagination')

module.exports = {
  viewItemSeller: async (req, res) => {
    const { id: seller_id } = req.user
    const path = 'items'
    const { limit, page } = req.query
    try {
      const { results, count } = await itemModel.getAllItem({ seller_id }, req.query)
      const pageInfo = pagination.paging(count, page, limit, path, req)
      const msg = count ? 'List of items' : 'There is no item in the list'
      return responseStandard(res, msg, { results, pageInfo })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  getDetailItemSeller: async (req, res) => {
    const { id } = req.params
    try {
      let items = await itemModel.getItem(id)
      items = [items]
      let category = await categoryModel.getCategorybyID(items.category_id)
      category = [category]
      let ratings = await ratingModel.getRatings(id)
      ratings = [ratings]
      const itemDetails = await itemDetailModel.getItemDetailsByItemId(id)
      return responseStandard(res, 'Detail Item', { results: { ...items, category, ratings, itemDetails } })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  createItem: async (req, res) => {
    const { id: seller_id } = req.user
    console.log(req.file)
    const {
      name, description, categoryName, condition_id, weight, price, stock, detailArr
    } = req.body
    const dataItem = {
      name, description, categoryName, condition_id, weight, price, stock
    }
    const schema = joi.object({
      name: joi.string().required(),
      description: joi.string(),
      categoryName: joi.string().required(),
      condition_id: joi.number().required(),
      weight: joi.number().required(),
      price: joi.number().required(),
      stock: joi.number().required()
    })
    const { value: data, error } = schema.validate(dataItem)
    if (error) {
      console.log(error)
      return responseStandard(res, error.message, {}, 400, false)
    }
    Object.assign(data, { seller_id })
    try {
      const { imgData } = req.files ? arrayImagetoDB(req.files) : undefined
      if (!imgData) {
        return responseStandard(res, 'Image cannot be empty', {}, 500, false)
      }
      const { results, created } = await categoryModel.searchOrCreateCategory({
        name: data.categoryName
      })
      const msgCreated = created ? ' and success created new category' : ''
      delete data.categoryName
      Object.assign(data, { category_id: results[0].id })
      const createItem = await itemModel.createItem(data)
      if (!createItem.insertId) {
        return responseStandard(res, 'internal server error', {}, 500, false)
      }
      Object.assign(data, { id: createItem.insertId })
      const item_id = createItem.insertId
      Object.assign(imgData, { item_id })
      await itemImages.insertImage(imgData)
      const detailResults = []
      if (detailArr.length) {
        const detailValueArr = []
        const detailKeyArr = [0]
        // insert item detail
        console.log(detailArr)
        const { detailArr: detailArrParse } = qs.parse(detailArr)
        console.log(detailArrParse)
        for (const detail of detailArrParse) {
          // validating item detail from form
          console.log('look at this!!')
          console.log(detail)
          const schema = joi.object({
            colorName: joi.string().required(),
            hex: joi.string().pattern(new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i)).required(),
            available: joi.boolean().required()
          })
          const { value: data, error } = schema.validate(detail)
          if (error) {
            console.log('line 99')
            console.log(error)
            return responseStandard(res, error.message, {}, 400, false)
          }

          const available = data.available ? 1 : 0

          // search or create new color in color table
          const { results } = await colorModel.searchOrCreateColor({
            name: data.colorName,
            hex: data.hex
          })

          // get id from color table
          const color_id = results[0].id

          const itemDetailObj = {
            item_id: item_id,
            color_id,
            available
          }

          // create object for detail data
          const schemaDetail = joi.object({
            item_id: joi.number().required(),
            color_id: joi.number().required(),
            available: joi.number().required()
          })
          const { value: dataDetail, err } = schemaDetail.validate(itemDetailObj)
          if (err) {
            console.log('line 127')
            console.log(err)
            return responseStandard(res, err.message, {}, 400, false)
          }
          console.log(dataDetail.available)
          detailResults.push(dataDetail)
          detailKeyArr[0] = Object.keys(dataDetail)
          detailValueArr.push(Object.values(dataDetail))
        }
        const createItemDetail = await itemDetailModel.createItemDetailsArray(detailKeyArr, detailValueArr)
        console.log('this is createItemDetail')
        console.log(createItemDetail)
      }
      return responseStandard(res, 'success created new item' + msgCreated, {
        results: {
          ...data,
          imgData,
          detailResults
        }
      })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  updateItem: async (req, res) => {
    const { id: seller_id } = req.user
    const { id: item_id } = req.params
    console.log(req.file)
    const {
      name, description, categoryName, condition_id, weight, price, stock, detailArr
    } = req.body
    const dataItem = {
      name, description, categoryName, condition_id, weight, price, stock
    }
    const schema = joi.object({
      name: joi.string(),
      description: joi.string(),
      categoryName: joi.string(),
      condition_id: joi.number(),
      weight: joi.number(),
      price: joi.number(),
      stock: joi.number()
    })
    const { value: data, error } = schema.validate(dataItem)
    if (error) {
      console.log(error)
      return responseStandard(res, error.message, {}, 400, false)
    }
    try {
      const { imgData } = req.files ? arrayImagetoDB(req.files) : undefined
      const { results, created } = await categoryModel.searchOrCreateCategory({
        name: data.categoryName
      })
      const msgCreated = created ? ' and success created new category' : ''
      delete data.categoryName
      Object.assign(data, { category_id: results[0].id })
      const updateItem = await itemModel.updateItem(data, { id: item_id, seller_id })
      if (!updateItem.affectedRows) {
        return responseStandard(res, 'internal server error', {}, 500, false)
      }
      Object.assign(data, { id: item_id })
      if (imgData) {
        Object.assign(imgData, { item_id })
        await itemImages.updateImage(imgData, { item_id })
      }
      const detailResults = []
      if (detailArr.length) {
        const detailValueArr = []
        const detailKeyArr = [0]
        // insert item detail
        console.log(detailArr)
        const { detailArr: detailArrParse } = qs.parse(detailArr)
        console.log(detailArrParse)
        for (const detail of detailArrParse) {
          // validating item detail from form
          const schema = joi.object({
            id: joi.number().integer().required(),
            colorName: joi.string().required(),
            hex: joi.string().pattern(new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i)).required(),
            available: joi.boolean().required()
          })
          const { value: data, error } = schema.validate(detail)
          if (error) {
            console.log('line 222')
            console.log(error)
            return responseStandard(res, error.message, {}, 400, false)
          }

          const available = data.available ? 1 : 0

          // search or create new color in color table
          const { results } = await colorModel.searchOrCreateColor({
            name: data.colorName,
            hex: data.hex
          })

          // get id from color table
          const color_id = results[0].id

          const itemDetailObj = {
            id: data.id,
            item_id: item_id,
            color_id,
            available
          }

          // create object for detail data
          const schemaDetail = joi.object({
            id: joi.number().integer().required(),
            item_id: joi.number().required(),
            color_id: joi.number().required(),
            available: joi.number().required()
          })
          const { value: dataDetail, err } = schemaDetail.validate(itemDetailObj)
          if (err) {
            console.log('line 127')
            console.log(err)
            return responseStandard(res, err.message, {}, 400, false)
          }
          console.log(dataDetail.available)
          detailResults.push(dataDetail)
          detailKeyArr[0] = Object.keys(dataDetail)
          detailValueArr.push(Object.values(dataDetail))
        }
        const createItemDetail = await itemDetailModel.updateAndInsert(detailKeyArr, detailValueArr)
        console.log('this is createItemDetail')
        console.log(createItemDetail)
      }
      return responseStandard(res, 'success created new item' + msgCreated, {
        results: {
          ...data,
          imgData,
          detailResults
        }
      })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  deleteItem: async (req, res) => {
    const { id: seller_id } = req.user
    const { id } = req.params
    try {
      const { results, count } = await itemModel.getItemByCondition({ id, seller_id })
      if (!count) {
        return responseStandard(res, 'item not found!', {}, 400, false)
      }
      await itemModel.deleteItem(results[0])
      return responseStandard(res, 'success delete id: ' + id, {})
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  getCondition: async (req, res) => {
    const { page, limit } = req.query
    const path = 'items/condition'
    try {
      const { results, count } = await itemModel.getConditionItem({}, req.query)
      const pageInfo = pagination.paging(count, page, limit, path, req)
      const message = count ? 'List of all condition' : 'condition is empty'
      return responseStandard(res, message, { results, pageInfo })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  }
}
