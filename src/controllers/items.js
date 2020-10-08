const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const responseStandard = require('../helpers/response')
const arrayValSanitizer = require('../helpers/arrayValueSanitizer')
const joi = require('joi')
const arrayImagetoDB = require ('../helpers/imagetoDB')
const updateImgtoDB = require ('../helpers/updateImgtoDB')
const imgRemover = require ('../helpers/imgRemover')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

const {
  viewItemsModel,
  viewCountItemsModel,
  getDetailItem,
  createItemModel,
  deleteItemModel,
  getItemPlain,
  viewAllItemsModel,
  viewAllItemsModelCount,
  getFromItemDetails,
  updateItemModelNew
} = require('../models/items')
const {
  itemFormController
} = require('../helpers/joiControllerForm')


const pagination = require('../helpers/pagination')
const features = require('../helpers/features')
const table = 'items'

module.exports = {
  viewItems: async (req, res) => {
    const defSearch = 'items.name'
    const defSort = 'items.created_at'
    const { searchKey,searchValue,sortKey,sortValue,and} = features(req.query, defSearch, defSort)
    const {page,limit,limiter} = pagination.pagePrep(req.query)
    try {
      const result = await viewAllItemsModel(searchKey, searchValue, sortKey, sortValue, limiter, and)
      const [{count}] = await viewAllItemsModelCount(searchKey, searchValue, and) || 0
      console.log(count)
       if (result.length) {
          const pageInfo = pagination.paging(count, page, limit, table, req)
          return responseStandard(res, 'List of Items', {...{data: result}, ...{pageInfo}})
        } else {
          const pageInfo = pagination.paging(count, page, limit, table, req)
          return responseStandard(res, 'There is no item in the list', pageInfo, 400, false)
        }
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  getDetailItem: async (req, res) => {
    const { id } = req.params
    const defSearch = 'color_name'
    const defSort = 'created_at'
    let { searchKey, searchValue, sortKey, sortValue, and } = features(req.query, defSearch, defSort)
    const { page, limit, limiter } = pagination.pagePrep(req.query)
    and =`and item_id = ${id}`
    try {
      const [{name, description, seller_id, subcategory_id, created_at}] = await getItemPlain(id)
      const result = await viewItemsModel(searchKey, searchValue, sortKey, sortValue, limiter, and, 'item_details')
      const dataItem = {name, description, seller_id, subcategory_id, created_at}
      console.log(dataItem)
      const [{count}] = await viewCountItemsModel(searchKey, searchValue, and, 'item_details') || 0
      console.log(count)
       if (result.length) {
          const pageInfo = pagination.paging(count, page, limit, table, req)
          return responseStandard(res, 'Detail Items', {...dataItem, ...{data: result}, ...{pageInfo}})
        } else {
          const pageInfo = pagination.paging(count, page, limit, table, req)
          return responseStandard(res, 'There is no item in the list', pageInfo, 400, false)
        }
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  createItem: (requires) => {
    return async (req, res) => {
      const {role_id, id:user_id} = req.user
      console.log('we are on create Item')
      try {
        if ((role_id === 1) || (role_id === 3)) {
          console.log('coba gini')
          let form = itemFormController(req.body, requires)
          let {itemDetails} = form
          let keys = [form.detailKey]
          form = form.form
          Object.assign(form[0], {seller_id: user_id})
          let img = arrayImagetoDB(req.files)
          console.log('INI IMG!')
          console.log(img)
          keys.push(img.keys)
          form.push(img.imagePrep)
          const result = await createItemModel(res, keys, ...form)
          if (result.length){
            return responseStandard(res, 'item has been created', {data:{...{item_id: result[0].insertId},...form[0],itemDetails,...img.imgData}}, 201)
          } else {
            req.files && imgRemover(res, req.files)
            return responseStandard(res, 'internal server error', {}, 500, false)
          }
        } else {
          req.files && imgRemover(res, req.files)
          return responseStandard(res, 'Forbidden access!', {}, 500, false)
        }
      } catch (err) {
        console.log(err)
        req.files && imgRemover(res, req.files)
        return responseStandard(res, err.message, {}, 500, false)
      }
    }
  },
  createItemDetail: async (req, res) => {
    const {role_id, adminId} = req.user
    console.log(role_id)
    console.log(adminId)
    if (((role_id === 1 || role_id === 2) && adminId) || (role_id === 3)) {
      const schema = joi.object({
        item_id: joi.number().integer().required(),
        color_name: joi.string().required(),
        stock: joi.number().required(),
        hex: joi.string().required(),
        price: joi.number().integer().required()
      })
      const {value: data, error} = schema.validate(req.body)
      const colName = Object.keys(data)
      const colValue = arrayValSanitizer(Object.values(data))
      console.log(data)
      if (error){
        console.log(error)
        return responseStandard(res, error.message, {}, 400, false)
      } else {
        try {
          const result = await createItemModel(colName, colValue, 'item_details')
          Object.assign(data, {id: result.insertId})
          return responseStandard(res, 'detail item has been created', {data}, 201)
        } catch (err) {
          console.log(err)
          return responseStandard(res, err.message, {}, 500, false)
        }
      }
    } else {
      return responseStandard(res, 'Forbidden access!', {}, 500, false)
    }
  },
  updateItem: requires => {
    return async (req, res) => {
      const {id: user_id, role_id, adminId} = req.user
      try {
        let {id} = req.params
        let itemData = await getDetailItem(id, table)
        let detailRows = await getFromItemDetails(id)
        let {seller_id} = itemData[0]
        console.log(detailRows)
        if (((role_id === 1 || role_id === 2) && adminId) 
          || (role_id === 3) && (seller_id === user_id)) {
          
          console.log('this is req.files')
          console.log(req.files)
          console.log(detailRows)
          let data = itemFormController(req.body, requires, detailRows, Number(id))
          let {form, keys} = data
          let {imageKeysUpdate, imageValsUpdate, imageKeysNew, imageValsNew, imageResult} = await updateImgtoDB(id, req.files)
          console.log(imageKeysUpdate)
          form.push(imageValsUpdate, imageValsNew)
          keys.push(imageKeysUpdate, imageKeysNew)
          let result = await updateItemModelNew(res, keys, ...form, id, requires)
          console.log(result)
          if (result.length){
            return responseStandard(res, 'item has been updated', {updatedItem:{...data.form[0],
              itemDetailsUpdate: data.itemDetailsUpdate,
              itemDetailsNew: data.itemDetailsNew,
              imageResult}}, 201)
          } else {
            responseStandard(res, 'internal server error', {}, 500, false)
          }
        
        } else {
          req.files && imgRemover(res, req.files)
          return responseStandard(res, 'Forbidden access!', {}, 500, false)
        }
      } catch (err) {
        console.log(err)
        req.files && imgRemover(res, req.files)
        return responseStandard(res, err.message, {}, 500, false)
      }
    }
  },
  deleteItem: async (req, res) => {
    const {id: user_id, role_id, adminId} = req.user
    try{
      const { id } = req.params
      let itemData = await getDetailItem(id, table)
      let {seller_id} = itemData[0]
      if (((role_id === 1 || role_id === 2) && adminId) 
        || (role_id === 3) && (seller_id === user_id)) {
        const searchKey = `item_id = ${id} AND name`
        const delImages = await viewItemsModel(searchKey, '', 'created_at', 'DESC', '', '', 'item_images')
        const result = await deleteItemModel(id) 
        if(result.affectedRows){
          console.log(delImages)
          imgRemover(res, delImages, 0)
          return responseStandard(res, 'item on id: '+id+' has been deleted', {})
        } else {
          return responseStandard(res, 'The id you choose is invalid', {}, 400, false)
        }
      } else {
        return responseStandard(res, 'Forbidden access!', {}, 500, false)
      }
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  deleteItemDetail: async (req, res) => {
    const {id: user_id, role_id, adminId} = req.user
    try{
      const { id } = req.params
      let {item_id} = await getFromItemDetails(id)
      let {seller_id} = await getDetailItem(item_id, table)
      if (((role_id === 1 || role_id === 2) && adminId) 
        || (role_id === 3) && (seller_id === user_id)) {
        const result = await deleteItemModel(id, 'item_details') 
        if(result.affectedRows){
          return responseStandard(res, 'Detail item has been deleted', {})
        } else {
          return responseStandard(res, 'The id you choose is invalid', {}, 400, false)
        }
      } else {
        return responseStandard(res, 'Forbidden access!', {}, 500, false)
      }
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  }
}
