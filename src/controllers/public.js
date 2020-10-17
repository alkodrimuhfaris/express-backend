const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const responseStandard = require('../helpers/response')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

const {
  getItemPlain,
  viewItemsModel,
  viewCountItemsModel,
  viewAllItemsModel,
  viewAllItemsModelCount,
  getRatings,
  getDetailItem
} = require('../models/items')

const {
	getCategorybyID,
	viewAllCategories,
  countAllCategories,
  viewJoinAllCategories
} = require('../models/categories')


const {
	countItemsForSubCategories,
	countSubCategoryForCategories} = require ('../helpers/logicForTable')
const pagination = require('../helpers/pagination')
const features = require('../helpers/features')


module.exports =  {
  viewItems: (query=0) => {
	  return async (req, res) => {
	    const defSearch = 'items.name'
	    const defSort = 'items.created_at'
	    query ? query : query = req.query
	    let { searchKey, searchValue, sortKey, sortValue, and } = features(req.query, defSearch, defSort)
	    let { page, limit, limiter } = pagination.pagePrep(req.query)
      let tables = 'public/products'
     	if (query === 'new'){
	  		sortKey = 'created'
	  		sortValue = 'DESC'
        tables = 'public/new'
	  	} else if (query === 'popular') {
	  		sortKey = 'rating'
	  		sortValue = 'DESC'
        tables = 'public/popular'
	  	}
	    try {
	      const result = await viewAllItemsModel(searchKey, searchValue, sortKey, sortValue, limiter, and)
	      const [{count}] = await viewAllItemsModelCount(searchKey, searchValue, and) || 0
	      console.log(count)
	       if (result.length) {
	          const pageInfo = pagination.paging(count, page, limit, tables, req)
	          return responseStandard(res, 'List of Items', {...{data: result}, ...{pageInfo}})
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
          return responseStandard(res, 'Detail Items', {...{data: result}})
        } else {
          return responseStandard(res, 'There is no detail item in the list!', pageInfo, 400, false)
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
    and +=`and item_id = ${id}`
    let tables = 'public/products/'+id
    try {
      const [dataItem] = await getItemPlain(id)
      const result = await viewItemsModel(searchKey, searchValue, sortKey, sortValue, limiter, and, 'item_details')
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
        ratingCount:0}])
      let [{ratingAvg, ratingCount}] = rating
      let ratingBar=[rating[0].star5bar, rating[0].star4bar, rating[0].star3bar, rating[0].star2bar, rating[0].star1bar]
      let starCount=[rating[0].stars5, rating[0].stars4, rating[0].stars3, rating[0].stars2, rating[0].stars1]
      console.log(dataItem)
      const [{count}] = await viewCountItemsModel(searchKey, searchValue, and, 'item_details') || 0
      console.log(count)
       if (dataItem) {
          rating = [{
            ratingAvg,
            ratingBar,
            starCount,
            ratingCount
          }]
          const pageInfo = pagination.paging(count, page, limit, tables, req)
          return responseStandard(res, 'Detail Items', {...dataItem, ...{rating: rating}, ...{productDetails: result}, ...{pageInfo}})
        } else {
          const pageInfo = pagination.paging(count, page, limit, tables, req)
          return responseStandard(res, 'There is no item in the list', pageInfo, 400, false)
        }
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  getCategories: async (req, res) => {
		const defSearch = 'categories.name'
    const defSort = 'totalSubcategory'
    let { searchKey, searchValue, sortKey, sortValue, and } = features(req.query, defSearch, defSort)
    let { page, limit, limiter } = pagination.pagePrep(req.query)
    let joinTable = countSubCategoryForCategories({searchKey, searchValue})
    let tables = 'public/categories/'
  	try {
  		const result = await viewJoinAllCategories(searchKey, searchValue, sortKey, sortValue, limiter, joinTable, and)
  		const [{count}] = await countAllCategories(searchKey, searchValue, and) || 0
  		if (result.length){
  			const pageInfo = pagination.paging(count, page, limit, tables, req)
         return responseStandard(res, 'List of Categories', {...{data: result}, ...{pageInfo}})
  		} else {
  			const pageInfo = pagination.paging(count, page, limit, tables, req)
        return responseStandard(res, 'There is no item in the list', pageInfo, 400, false)
  		}
  	} catch (error) {
  		console.log(error)
      return responseStandard(res, error.message, {}, 500, false)
  	}
  },
  detailCategories: async (req, res) => {
    const { id } = req.params
  	const defSearch = 'subcategory_name'
  	const defSort = 'totalProducts'
  	let { searchKey, searchValue, sortKey, sortValue, and } = features(req.query, defSearch, defSort)
  	and +=`and sub_category.id = ${id}`
  	let { page, limit, limiter } = pagination.pagePrep(req.query)
  	let joinTable = countItemsForSubCategories({searchKey, searchValue})
    let tables = 'public/categories/'+id
  	try {
  		const result = await viewJoinAllCategories(searchKey, searchValue, sortKey, sortValue, limiter, joinTable, and, 'sub_category')
  		const [category] = await getCategorybyID(id)
  		and = `and category_id = ${id}`
  		const [{count}] = await countAllCategories(searchKey, searchValue, and, 'sub_category') || 0
  		if (result.length){
  			  const pageInfo = pagination.paging(count, page, limit, tables, req)
          return responseStandard(res, 'Subcategory on categories with id: '+id, {...category,...{data: result}, ...{pageInfo}})
  		} else {
  			const pageInfo = pagination.paging(count, page, limit, 'items', req)
        return responseStandard(res, 'There is no item in the list', pageInfo, 400, false)
  		}
  	} catch (err) {
  		console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
  	}
  },
  detailSubCategories: async (req, res) => {
    const { id } = req.params
  	const defSearch = 'name'
  	const defSort = 'price'
  	let { searchKey, searchValue, sortKey, sortValue, and } = features(req.query, defSearch, defSort)
  	and +=`and subcategory_id = ${id}`
  	let { page, limit, limiter } = pagination.pagePrep(req.query)
    let tables = 'public/categories/subcategory'+id
  	try {
  		const result = await viewAllItemsModel(searchKey, searchValue, sortKey, sortValue, limiter, and)
	    const [{count}] = await viewAllItemsModelCount(searchKey, searchValue, and) || 0
	    const [subcategory] = await getCategorybyID(id, 'sub_category')
  		if (subcategory){
  			  const pageInfo = pagination.paging(count, page, limit, tables, req)
          return responseStandard(res, 'items on subcategory with id: '+id, {...subcategory,...{data: result}, ...{pageInfo}})
  		} else {
  			const pageInfo = pagination.paging(count, page, limit, tables, req)
        return responseStandard(res, 'There is no item in the list', pageInfo, 400, false)
  		}
  	} catch (err) {
  		console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
  	}
  }
}