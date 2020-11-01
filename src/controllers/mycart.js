const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const joi = require('joi')
const responseStandard = require('../helpers/response')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

const {
  createMycartsModel,
  viewMycartsModel,
  viewCountMycartsModel,
  updateMycartModel,
  deleteMycartModel,
  getMyCartModel,
  getMyCartModelbyId
} = require('../models/mycart')

const {
  getDetailItem
} = require('../models/items')

const pagination = require('../helpers/pagination')
const table = 'carts'

// POST
module.exports = {
  createMycart: async (req, res) => {
    const { id: user_id, role_id } = req.user
    if (role_id === 4 || role_id === 1) {
      const carts = joi.object({
        itemdetails_id: joi.number().required(),
        quantity: joi.number().required()
      })
      const { value: data, error } = carts.validate(req.body)
      if (error) {
        return responseStandard(res, error.message, {}, 401, false)
      } else {
        try {
          const { itemdetails_id } = data
          const getRes = await getMyCartModel(user_id, itemdetails_id)
          console.log(getRes)
          if (getRes.length) {
            const update = await updateMycartModel(data, getRes[0].id)
            if (update.affectedRows) {
              return responseStandard(res, 'cart has been updated!', { data }, 201)
            } else {
              return responseStandard(res, 'Internal server error', 500, false)
            }
          }
          Object.assign(data, { user_id: user_id })
          const [{ item_id }] = await getDetailItem(data.itemdetails_id)
          Object.assign(data, { user_id, item_id })
          const result = await createMycartsModel(data)
          Object.assign(data, { id: result.insertId })
          return responseStandard(res, 'Item has been added to cart!', { data }, 201)
        } catch (err) {
          console.log(err)
          return responseStandard(res, err.message, {}, 500, false)
        }
      }
    } else {
      return responseStandard(res, 'Forbidden access!', {}, 500, false)
    }
  },
  updateMycart: (requires = 0) => {
    return async (req, res) => {
      const { id: user_id, role_id } = req.user
      const { id } = req.params

      try {
        const [cartId] = await getMyCartModelbyId(id)
        if (role_id === 1 ||
          user_id === cartId.user_id) {
          let carts = {
            itemdetails_id: joi.number(),
            quantity: joi.number()
          }
          carts = requires
            ? joi.object({ ...carts }).fork(Object.keys(carts), (item) => item.required())
            : joi.object({ ...carts })
          const { value: data, error } = carts.validate(req.body)
          if (error) {
            return responseStandard(res, error.message, {}, 401, false)
          } else {
            const { itemdetails_id } = data
            if (itemdetails_id) {
              const getRes = await getDetailItem(data.itemdetails_id)
              console.log(getRes[0].item_id)
              if (!getRes.length) {
                return responseStandard(res, 'there is no item in that id!', {}, 400, false)
              } else {
                Object.assign(data, { item_id: getRes[0].item_id })
              }
            }
            const result = await updateMycartModel(data, id)
            if (result.affectedRows) {
              return responseStandard(res, 'your cart has been updated!', { data }, 201)
            } else {
              return responseStandard(res, 'Internal server error', 500, false)
            }
          }
        } else {
          return responseStandard(res, 'Forbidden access!', {}, 500, false)
        }
      } catch (err) {
        console.log(err)
        return responseStandard(res, err.message, {}, 500, false)
      }
    }
  },
  viewMycart: (detail = 0) => {
    return async (req, res) => {
      const { id: user_id, role_id } = req.user
      if (role_id === 4 || role_id === 1) {
        const data = { user_id }
        const { item_id } = req.params
        Number(item_id) && Object.assign(data, { item_id: Number(item_id) })
        if (item_id && !Number(item_id)) { return responseStandard(res, 'item id must be a number', {}, 500, false) }

        const msg = detail ? `carts on item id ${item_id}` : 'All carts'
        const group = detail ? 'detail' : 0

        const { page, limit } = req.query
        try {
          const result = await viewMycartsModel(req.query, data, group)
          const [{ count }] = await viewCountMycartsModel(req.query, data, group) || 0
          const pageInfo = pagination.paging(count, page, limit, table, req)
          if (result.length) {
            return responseStandard(res, msg, { ...{ data: result }, ...{ pageInfo } })
          } else {
            return responseStandard(res, msg, pageInfo, 400, false)
          }
        } catch (err) {
          console.log(err)
          return responseStandard(res, err.message, {}, 500, false)
        }
      } else {
        return responseStandard(res, 'Forbidden access!', {}, 500, false)
      }
    }
  },
  deleteMycart: (delItem = 0) => {
    return async (req, res) => {
      const { id: user_id, role_id } = req.user
      if (role_id === 4 || role_id === 1) {
        const { id } = req.params
        let msg = ''
        delItem ? msg = 'Item has been removed from carts' : msg = 'Item details has been removed from carts'
        delItem ? delItem = { item_id: id } : delItem = { id }
        try {
          const result = deleteMycartModel(delItem, user_id)
          if (result.affectedRows) {
            return responseStandard(res, msg, {}, 201)
          } else {
            return responseStandard(res, 'Internal server error', 500, false)
          }
        } catch (err) {
          console.log(err)
          return responseStandard(res, err.message, {}, 500, false)
        }
      } else {
        return responseStandard(res, 'Forbidden access!', {}, 500, false)
      }
    }
  }
}
