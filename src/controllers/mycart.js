const joi = require('joi')
const responseStandard = require('../helpers/response')

const myCart = require('../models/myCart')
const itemModel = require('../models/items')

const pagination = require('../helpers/pagination')

// POST
module.exports = {
  createMyCart: async (req, res) => {
    const { id: user_id } = req.user
    const carts = joi.object({
      item_id: joi.number().required(),
      itemdetails_id: joi.number().required(),
      quantity: joi.number().required()
    })
    const { value: data, error } = carts.validate(req.body)
    if (error) {
      return responseStandard(res, error.message, {}, 401, false)
    }
    try {
      const results = await itemModel.getItem(data.item_id)
      const [{ seller_id }] = results
      console.log(seller_id)
      const { itemdetails_id, item_id } = data
      const { results: getRes, count } = await myCart.getCart({ user_id, item_id, itemdetails_id })
      console.log(getRes)
      if (count) {
        const update = await myCart.updateCart(data, getRes[0])
        if (update.affectedRows) {
          return responseStandard(res, 'cart has been updated!', { results: data })
        } else {
          return responseStandard(res, 'Internal server error', 500, false)
        }
      }
      Object.assign(data, { user_id: user_id, seller_id })
      const result = await myCart.addToCart(data)
      Object.assign(data, { id: result.insertId })
      return responseStandard(res, 'Item has been added to cart!', { data }, 201)
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  updateMyCart: async (req, res) => {
    const { id: user_id } = req.user
    const { id } = req.params
    const carts = joi.object({
      item_id: joi.number(),
      itemdetails_id: joi.number(),
      quantity: joi.number()
    })
    const { value: data, error } = carts.validate(req.body)
    if (error) {
      return responseStandard(res, error.message, {}, 401, false)
    }
    try {
      const { count } = await myCart.getAllCart({ id, user_id })
      if (!count) {
        return responseStandard(res, 'there is no item in that id!', {}, 400, false)
      }
      Object.assign(data, { user_id })
      const results = await myCart.updateCart(data, { id, user_id })
      if (!results.affectedRows) {
        return responseStandard(res, 'Error updating cart', {}, 400, false)
      }
      return responseStandard(res, 'Cart has been updated!', { data }, 201)
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  viewMycart: async (req, res) => {
    const { id: user_id } = req.user
    const { limit, page } = req.query
    const path = 'mycart'
    try {
      const { results, count } = await myCart.getAllCart({ user_id })
      const pageInfo = pagination.paging(count, page, limit, path, req)
      const msg = count ? 'list of item in your cart' : 'there is no item in the list'
      return responseStandard(res, msg, { results, pageInfo })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  deleteMyCartById: async (req, res) => {
    const { id: user_id } = req.user
    const { id } = req.params
    try {
      const deleteCart = myCart.deleteCart({ id, user_id })
      if (!deleteCart.affectedRows) {
        return responseStandard(res, 'Error deleting cart', {}, 400, false)
      }
      return responseStandard(res, 'Success delete cart', {})
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  deleteMyCartByItemId: async (req, res) => {
    const { id: user_id } = req.user
    const { id: item_id } = req.params
    try {
      const deleteCart = myCart.deleteCart({ item_id, user_id })
      if (!deleteCart.affectedRows) {
        return responseStandard(res, 'Error deleting cart', {}, 400, false)
      }
      return responseStandard(res, 'Success delete cart', {})
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  }
}
