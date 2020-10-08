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
  viewAllItemsModelCount
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
      console.log(dataItem)
      const [{count}] = await viewCountItemsModel(searchKey, searchValue, and, 'item_details') || 0
      console.log(count)
       if (dataItem) {
          const pageInfo = pagination.paging(count, page, limit, tables, req)
          return responseStandard(res, 'Detail Items', {...dataItem, ...{productDetails: result}, ...{pageInfo}})
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