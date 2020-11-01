const getFromDB = require('../helpers/promiseForSQL')
const pagination = require('../helpers/pagination')
const queryGenerator = require('../helpers/queryGenerator')

const logicForTable = require('../helpers/logicForTable')
const table = 'categories'
let query = ''

module.exports = {
  createCategoryModel: async (name, tables = table) => {
    query = `INSERT INTO ${tables} SET ?`
    return await getFromDB(query, name)
  },
  getCategorybyID: async (id, tables = table) => {
    query = `SELECT *
            FROM ${tables}
            where id = ${id}`
    return await getFromDB(query)
  },
  viewAllCategories: async (req, tables = table) => {
    const { searchArr, date, orderArr } = queryGenerator(req)

    // query for search and limit
    const additionalQuery = [searchArr, date].filter(item => item).map(item => `(${item})`).join(' AND ')

    // query for where (if it exist)
    const where = additionalQuery ? ' WHERE ' : ''

    const { limiter } = pagination.pagePrep(req)

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
    console.log(query)
    return await getFromDB(query)
  },
  viewAllCategoriesCount: async (req, tables = table) => {
    const { searchArr, date } = queryGenerator(req)

    // query for search and limit
    const additionalQuery = [searchArr, date].filter(item => item).map(item => `(${item})`).join(' AND ')

    // query for where (if it exist)
    const where = additionalQuery ? ' WHERE ' : ''

    query = `SELECT count(*) as count
            FROM ${tables}
            ${where}
            ${additionalQuery}`
    return await getFromDB(query)
  },
  viewJoinAllCategories: async (req, data = {}, tables = table) => {
    const joinTable = logicForTable.countItemsForCategories(req)

    req = {
      ...req,
      sort: {
        totalProducts: 'DESC'
      }
    }

    const { searchArr, date, orderArr, dataArr, prepStatement } = queryGenerator({ ...req, data })

    // query for search and limit
    const additionalQuery = [searchArr, date, dataArr].filter(item => item).map(item => `(${item})`).join(' AND ')

    // query for where (if it exist)
    const where = additionalQuery ? ' WHERE ' : ''

    const { limiter } = pagination.pagePrep(req)

    query = `SELECT * 
            FROM ${tables}
            JOIN (${joinTable}) as count
            ON ${tables}.id = count.id
            ${where}
            ${additionalQuery}
            ORDER BY 
            ${orderArr}
            ${limiter}`
    return await getFromDB(query, prepStatement)
  },
  countAllCategories: async (req, data = {}, tables = table) => {
    const { searchArr, date, dataArr, prepStatement } = queryGenerator({ ...req, data })

    // query for search and limit
    const additionalQuery = [searchArr, date, dataArr].filter(item => item).map(item => `(${item})`).join(' AND ')

    // query for where (if it exist)
    const where = additionalQuery ? ' WHERE ' : ''

    query = `SELECT count (*) as count
            FROM ${tables}
            ${where}
            ${additionalQuery}`
    return await getFromDB(query, prepStatement)
  },
  viewCategoriesModel: async (searchKey, searchValue, column, sort, page, limit, tables = table) => {
    const { limiter } = pagination.pagePrep({ page, limit })

    query = `SELECT ${tables}.id as id, ${tables}.name as category,
            ${tables}.created_at as 'created at', items.id as item_id, price, items.name as product,
            COUNT(${tables}.id) as 'total product'
            FROM ${tables}
            LEFT JOIN items
            ON ${tables}.id = items.category_id
            WHERE ${searchKey}
            LIKE '%${searchValue}%'
            GROUP BY ${tables}.id
            ORDER BY ${column} ${sort}
            ${limiter}`
    return await getFromDB(query)
  },
  viewCountCategoriesModel: async (searchKey, searchValue, tables = table) => {
    query = `SELECT COUNT(newTable.id) AS 'count'
            FROM (
              SELECT ${tables}.id as id, ${tables}.name as category, items.name as product,
              items.created_at as item_created, count(${tables}.id) as 'total product'
              FROM ${tables}
              LEFT JOIN items
              ON ${tables}.id = items.category_id
              WHERE ${searchKey}
              LIKE '%${searchValue}%'
              GROUP BY ${tables}.id
            ) as newTable`
    return await getFromDB(query)
  },
  getCategoryModel: async (id, column, sort, limit, offset, tables = table) => {
    query = `SELECT ${tables}.name as category,
            items.name as product,
            items.id as item_id, price,
            description, items.created_at as 'date added'
            FROM ${tables}
            LEFT JOIN items
            ON ${tables}.id = items.category_id
            WHERE ${tables}.id = ${id}
            ORDER BY ${column} ${sort}
            LIMIT ${offset}, ${limit}`
    return await getFromDB(query)
  },
  getCategoryCountModel: async (id, tables = table) => {
    query = `SELECT COUNT(newTable.product) as count
            FROM (
              SELECT ${tables}.name as category,
              items.name as product,
              items.id as item_id, price,
              description, items.created_at as 'date added'
              FROM ${tables}
              LEFT JOIN items
              ON ${tables}.id = items.category_id
              WHERE ${tables}.id = ${id}
            ) AS newTable`
    return await getFromDB(query)
  },
  updateCategoriesModel: async (data, id, tables = table) => {
    query = `UPDATE ${tables}
            SET ?
            WHERE ?`
    return await getFromDB(query, [data, id])
  },
  deleteCategoryModel: async (id, tables = table) => {
    query = `DELETE
            FROM ${tables}
            WHERE ?`
    return await getFromDB(query, [id])
  }
}
