const responseStandard = require('../helpers/response')

const itemModel = require('../models/items')
const itemDetailModel = require('../models/itemDetails')
const ratings = require('../models/ratings')
const categoryModel = require('../models/categories')

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
        const { results, count} = await itemModel.getAllItem({}, req.query, query)
        const pageInfo = pagination.paging(count, page, limit, tables, req)
        if (count) {
          return responseStandard(res, 'List of Items', { data: results, pageInfo })
        } else {
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
      const results = await itemDetailModel.getItemDetailsById(id)
      if (results.length) {
        return responseStandard(res, 'Detail Items', { results })
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
    try {
      const { results: dataItems } = await itemModel.getAllItem({ id })
      const [dataItem] = dataItems
      const result = await itemDetailModel.getItemDetailsByItemId(id)
      let rating = await ratings.getRatings(id)
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
      if (dataItem) {
        rating = [{
          ratingAvg,
          ratingBar,
          starCount,
          ratingCount
        }]
        return responseStandard(res, 'Detail Items', { dataItem: { ...dataItem, rating }, productDetails: result })
      } else {
        return responseStandard(res, 'There is no item in the list')
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
      const { results, count } = await categoryModel.viewAllCategories({}, req.query)
      const pageInfo = pagination.paging(count, page, limit, tables, req)
      if (count) {
        return responseStandard(res, 'List of Categories', { results, pageInfo })
      } else {
        return responseStandard(res, 'There is no item in the list', pageInfo, 400, false)
      }
    } catch (error) {
      console.log(error)
      return responseStandard(res, error.message, {}, 500, false)
    }
  },
  detailCategories: async (req, res) => {
    const { id } = req.params
    const path = 'public/categories' + id
    const { limit, page } = req.query
    const sort = req.query.sort ? req.query.sort : {}
    req.query = {
      ...req.query,
      sort: {
        price: 'DESC',
        ...sort
      }
    }
    try {
      const { results: category, count: categoryCount } = await categoryModel.viewAllCategories({ id })
      if (categoryCount) {
        const { results: items, count } = await itemModel.getAllItem({ category_id: id })
        const pageInfo = pagination.paging(count, page, limit, path, req.query)
        const msg = count ? 'Items on category id: ' + id : 'There is no items in here'
        return responseStandard(res, msg, { category, items, pageInfo })
      } else {
        return responseStandard(res, 'There is no category in here')
      }
    } catch (error) {
      console.log(error)
      return responseStandard(res, 'Internal server error', {}, 500, false)
    }
  }
}
