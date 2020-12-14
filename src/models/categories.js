const getFromDB = require('../helpers/promiseForSQL')
const pagination = require('../helpers/pagination')
const queryGenerator = require('../helpers/queryGenerator')

const table = 'categories'
let query = ''

module.exports = {
  searchOrCreateCategory: async (whereData = {}, tables = table) => {
    const { dataArr, prepStatement } = queryGenerator({ data: whereData })

    // query for search and limit
    const additionalQuery = [dataArr].filter(item => item).map(item => `(${item})`)

    // query for where (if it exist)
    const where = additionalQuery ? ' WHERE ' : ''

    query = `SELECT * 
            FROM ${tables}
            ${where}
            ${additionalQuery}`
    let results = await getFromDB(query, prepStatement)

    const created = !results.length

    if (created) {
      query = `INSERT INTO ${tables} SET ?`
      await getFromDB(query, whereData)

      query = `SELECT * 
              FROM ${tables}
              ${where}
              ${additionalQuery}`
      results = await getFromDB(query, prepStatement)
    }
    return { results, created }
  },
  createCategoryModel: async (data = {}, tables = table) => {
    query = `INSERT INTO ${tables} SET ?`
    return await getFromDB(query, data)
  },
  getCategorybyID: async (id, tables = table) => {
    query = `SELECT *
            FROM ${tables}
            where id = ${id}`
    return await getFromDB(query)
  },
  viewAllCategories: async (whereData = {}, reqQuery = {}, tables = table) => {
    const sort = reqQuery.sort ? reqQuery.sort : {}

    reqQuery = {
      ...reqQuery,
      sort: {
        total_product: 'DESC',
        ...sort
      }
    }

    const { searchArr, date, orderArr, dataArr, prepStatement } = queryGenerator({ ...reqQuery, data: whereData })

    // query for search and limit
    const additionalQuery = [searchArr, date, dataArr].filter(item => item).map(item => `(${item})`).join(' AND ')

    // query for where (if it exist)
    const where = additionalQuery ? ' WHERE ' : ''

    const { limiter } = pagination.pagePrep(reqQuery)

    query = `SELECT * 
            FROM ${tables}
            LEFT JOIN (
              SELECT count(id) as total_product, category_id
              FROM items
              GROUP BY category_id
            ) as items
            ON ${tables}.id = items.category_id
            ${where}
            ${additionalQuery}
            ORDER BY
              ${orderArr}
            ${limiter}`
    const results = await getFromDB(query, prepStatement)

    query = `SELECT count(*) as count 
            FROM ${tables}
            LEFT JOIN (
              SELECT count(id) as total_product, category_id
              FROM items
              GROUP BY category_id
            ) as items
            ON ${tables}.id = items.category_id
            ${where}
            ${additionalQuery}`

    const count = await getFromDB(query, prepStatement)

    return { results, count }
  },
  updateCategoriesModel: async (data = {}, whereData = {}, tables = table) => {
    const { dataArr, prepStatement } = queryGenerator({ data: whereData })

    // query for where data
    const additionalQuery = [dataArr].filter(item => item).map(item => `(${item})`)

    // query for where (if it exist)
    const where = additionalQuery ? ' WHERE ' : ''

    query = `UPDATE ${tables} SET ?
            ${where}
            ${additionalQuery}`
    return await getFromDB(query, [data, ...prepStatement])
  },
  deleteCategoryModel: async (whereData = {}, tables = table) => {
    const { dataArr, prepStatement } = queryGenerator({ data: whereData })

    // query for where data
    const additionalQuery = [dataArr].filter(item => item).map(item => `(${item})`)

    // query for where (if it exist)
    const where = additionalQuery ? ' WHERE ' : ''

    query = `DELETE FROM ${tables} SET ?
            ${where}
            ${additionalQuery}`
    return await getFromDB(query, prepStatement)
  }
}
