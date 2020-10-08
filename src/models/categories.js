const db = require('../helpers/db')
const getFromDB = require('../helpers/promiseForSQL')

const table = 'categories'
let query = ''

module.exports = {
  createCategoryModel: async (name, tables = table) => {
    query = `INSERT INTO ${tables} (name)
            VALUE ('${name}')`
    return await getFromDB(query) 
  },
  getCategorybyID: async (id, tables=table) => {
    query = `SELECT *
            FROM ${tables}
            where id = ${id}`
    return await getFromDB(query)
  },
  viewAllCategories: async (searchKey, searchValue, column, sort, limiter, and='', tables = table) => {
    query = `SELECT * 
            FROM ${tables}
            WHERE ${searchKey}
            LIKE '%${searchValue}%'
            ${and}
            ORDER BY ${column} ${sort}
            ${limiter}`
    return await getFromDB(query)
  },
  viewJoinAllCategories: async (searchKey, searchValue, column, sort, limiter, joinTable, and='', tables = table) => {
    query = `SELECT * 
            FROM ${tables}
            JOIN (${joinTable}) as count
            ON ${tables}.id = count.id
            WHERE ${searchKey}
            LIKE '%${searchValue}%'
            ${and}
            ORDER BY ${column} ${sort}
            ${limiter}`
    return await getFromDB(query)
  },
  countAllCategories: async (searchKey, searchValue, and='', tables=table) => {
    query = `SELECT count (*) as count
            FROM ${tables}
            WHERE ${searchKey}
            LIKE '%${searchValue}%'
            ${and}`
    return await getFromDB(query)
  },
  viewCategoriesModel: async (searchKey, searchValue, column, sort, limiter, cb, tables = table) => {
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
  updateCategoriesModel: async (name, id, tables = table) => {
    query = `UPDATE ${tables}
            SET name='${name}', updated_at=NOW()
            WHERE id=${id}`
    return await getFromDB(query)
  },
  deleteCategoryModel: async (id, tables = table) => {
    query = `DELETE
            FROM ${tables}
            WHERE id = ${id}`
    return await getFromDB(query)
  }
}
