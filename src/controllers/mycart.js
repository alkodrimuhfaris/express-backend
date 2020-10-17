const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const sanitize = require('../helpers/dataSanitizer')
const joi = require('joi')
const responseStandard = require('../helpers/response')


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

const {
  createMycartsModel,
  getMycartModel,
  viewMycartsModel,
  viewAllItemsModelCount,
  viewCountMycartsModel,
  getCountMycartModel,
  updateMycartModel,
  deleteMycartModel,
  getMyCartModel,
  getMyCartModelbyUserId

} = require('../models/mycart')

const {
  getDetailItem
} = require('../models/items')

const {
  getItemModel
} = require('../models/items')

const pagination = require('../helpers/pagination')
const features = require('../helpers/features')
const table = 'carts'

// POST
module.exports = {
  createMycart: async (req, res) => {
    let {id: user_id, role_id} = req.user
    if(role_id === 4 || role_id === 1) {
      let carts = joi.object({
        itemdetails_id: joi.number().required(),
        quantity: joi.number().required()
      })
      let {value: data, error} = carts.validate(req.body)
      if (error) {
        return responseStandard(res, error.message, {}, 401, false)
      } else {
        try {
          let {itemdetails_id} = data
          const getRes = await getMyCartModel(user_id, itemdetails_id)
          console.log(getRes)
          if (getRes.length) {
            const update = await updateMycartModel(data, getRes[0].id)
            if (update.affectedRows) {
              return responseStandard(res, 'cart has been updated!', {data}, 201) 
            } else {
              return responseStandard(res, 'Internal server error', 500, false)
            }
          }
          Object.assign(data, {user_id: user_id})
          const [{item_id}] = await getDetailItem(data.itemdetails_id)
          Object.assign(data, {user_id, item_id})
          const result = await createMycartsModel(data)
          Object.assign(data, {id: result.insertId})
          return responseStandard(res, 'Item has been added to cart!', {data}, 201) 
        } catch (err) {
          console.log(err)
          return responseStandard(res, err.message, {}, 500, false)
        }
      }
    } else {
      return responseStandard(res, 'Forbidden access!', {}, 500, false)
    }
  },
  updateMycart: (requires = 0)  => {
    return async (req, res) => {
      let {id: user_id, role_id} = req.user
      const {id} = req.params

      try {
        let [cartId] = await getMyCartModelbyUserId(id)
        if(role_id === 1 || 
          user_id === cartId.user_id) {
          let carts = {
            itemdetails_id: joi.number(),
            quantity: joi.number()
          }
          requires ? carts = joi.object({...carts}).fork(Object.keys(carts), (item) => item.required()) : carts= joi.object({...carts})
          let {value: data, error} = carts.validate(req.body)
          if (error) {
            return responseStandard(res, error.message, {}, 401, false)
          } else {
            let {itemdetails_id} = data
            if (itemdetails_id) {
              let getRes = await getDetailItem(data.itemdetails_id)
              console.log(getRes[0].item_id)
              if(!getRes.length){
                return responseStandard(res, 'there is no item in that id!', {}, 400, false)
              } else {
                Object.assign(data, {item_id: getRes[0].item_id})
              }
            }
            const result = await updateMycartModel(data, id)
            if(result.affectedRows){
              return responseStandard(res, 'your cart has been updated!', {data}, 201) 
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
  viewMycart: (detail=0) =>{
    return async (req, res) => {
      let {id: user_id, role_id} = req.user
      if(role_id === 4 || role_id === 1) {
        let{item_id} = req.params
        let msg= (detail ? 'All carts' : `carts on id ${item_id}`)
        let and=0
        let group=0
        item_id ? and = Number(item_id) : and
        detail ? group = 'detail' : group
        const defSearch = 'item_info.name'
        const defSort = 'date_added'
        const {searchValue} = features(req.query, defSearch, defSort)
        const { page, limit, limiter } = pagination.pagePrep(req.query)
        try {
          const result = await viewMycartsModel(user_id, searchValue, limiter, and, group)
          const [{count}] = await viewCountMycartsModel(user_id, searchValue, and, group) || 0
          if (result.length){
            const pageInfo = pagination.paging(count, page, limit, table, req)
            return responseStandard(res, 'Items in your carts', {...{data: result}, ...{pageInfo}})
          } else {
            const pageInfo = pagination.paging(count, page, limit, table, req)
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
  deleteMycart: (delItem=0) => {
    return async (req, res) => {
      let {id: user_id, role_id} = req.user
      if(role_id === 4 || role_id === 1) {
        const {id} = req.params
        let msg = ''
        delItem ? msg='Item has been removed from carts' : msg='Item details has been removed from carts'
        delItem ? delItem = {item_id: id} : delItem = {id}
        try {
          const result = deleteMycartModel(delItem, user_id) 
          if(result.affectedRows){
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
