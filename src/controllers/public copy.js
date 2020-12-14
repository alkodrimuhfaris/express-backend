
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const responseStandard = require('../helpers/response')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

const {
  getItemPlain,
  viewDetailItem,
  viewDetailItemCount,
  viewAllItemsModel,
  viewAllItemsModelCount,
  getRatings,
  getDetailItem
} = require('../models/items')

const {
  getCategorybyID,
  countAllCategories,
  viewJoinAllCategories
} = require('../models/categories')

const pagination = require('../helpers/pagination')

module.exports = {
  viewItems: (query = '') => {
    return async (req, res) => {
      const { page, limit } = req.query
      let tables = 'public/products'
      if (query === 'new') {
        tables = 'public/new'
      } else if (query === 'popular') {
        tables = 'public/popular'
      }
      try {
        const result = await viewAllItemsModel(req.query, query)
        const [{ count }] = await viewAllItemsModelCount(req.query, query) || 0
        console.log(count)
        if (result.length) {
          const pageInfo = pagination.paging(count, page, limit, tables, req)
          return responseStandard(res, 'List of Items', { data: result, pageInfo })
        } else {
          const pageInfo = pagination.paging(count, page, limit, tables, req)
          return responseStandard(res, 'There is no item in the list', pageInfo, 400, false)
        }
      } catch (err) {
        console.log(err)
        return responseStandard(res, err.message, {}, 500, false)
      }
    }
  },
  getDetailColor: async (req, res) => {
    const { id } = req.params
    try {
      const result = await getDetailItem(id, 'item_details')
      if (result.length) {
        return responseStandard(res, 'Detail Items', { ...{ data: result } })
      } else {
        return responseStandard(res, 'There is no detail item in the list!', 400, false)
      }
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  getDetailItem: async (req, res) => {
    let { id } = req.params
    id = Number(id)
    const tables = 'public/products/' + id
    const { page, limit } = req.query
    try {
      const [dataItem] = await getItemPlain(id)
      const result = await viewDetailItem(req.query, id)
      let rating = await getRatings(id)
      console.log('rating length')
      console.log(rating.length)
      !rating.length && (rating = [{
        ratingAvg: 0,
        stars5: 0,
        star5bar: 0,
        stars4: 0,
        star4bar: 0,
        stars3: 0,
        star3bar: 0,
        stars2: 0,
        star2bar: 0,
        stars1: 0,
        star1bar: 0,
        ratingCount: 0
      }])
      const [{ ratingAvg, ratingCount }] = rating
      const ratingBar = [rating[0].star5bar, rating[0].star4bar, rating[0].star3bar, rating[0].star2bar, rating[0].star1bar]
      const starCount = [rating[0].stars5, rating[0].stars4, rating[0].stars3, rating[0].stars2, rating[0].stars1]
      console.log(dataItem)
      const [{ count }] = await viewDetailItemCount(id) || 0
      const pageInfo = pagination.paging(count, page, limit, tables, req)
      console.log(count)
      if (dataItem) {
        rating = [{
          ratingAvg,
          ratingBar,
          starCount,
          ratingCount
        }]
        return responseStandard(res, 'Detail Items', { dataItem: { ...dataItem, rating }, productDetails: result, pageInfo })
      } else {
        return responseStandard(res, 'There is no item in the list', pageInfo, 400, false)
      }
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  getCategories: async (req, res) => {
    const tables = 'public/categories/'
    const { page, limit } = req.query
    try {
      const result = await viewJoinAllCategories(req.query)
      const [{ count }] = await countAllCategories(req.query) || 0
      const pageInfo = pagination.paging(count, page, limit, tables, req)
      if (result.length) {
        return responseStandard(res, 'List of Categories', { ...{ data: result }, ...{ pageInfo } })
      } else {
        return responseStandard(res, 'There is no item in the list', pageInfo, 400, false)
      }
    } catch (error) {
      console.log(error)
      return responseStandard(res, error.message, {}, 500, false)
    }
  },
  detailCategories: async (req, res) => {
    let { id } = req.params
    if (!Number(id)) { return responseStandard(res, 'Id must be a number!', {}, 400, false) }
    id = Number(id)
    const { page, limit } = req.query
    req.query = {
      ...req.query,
      sort: {
        price: 'DESC'
      }
    }
    const tables = 'public/categories' + id
    try {
      const result = await viewAllItemsModel(req.query, '', { category_id: id })
      const [{ count }] = await viewAllItemsModelCount(req.query, '', { category_id: id }) || 0
      const [category] = await getCategorybyID(id)
      const pageInfo = pagination.paging(count, page, limit, tables, req)
      if (category) {
        return responseStandard(res, 'items on subcategory with id: ' + id, { ...category, data: result, pageInfo })
      } else {
        return responseStandard(res, 'There is no item in the list', { pageInfo }, 400, false)
      }
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  }
}
