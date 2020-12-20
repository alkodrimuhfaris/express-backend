const getFromDB = require('../helpers/promiseForSQL')

const table = 'item_details'
let query = ''
const queryGenerator = require('../helpers/queryGenerator')
// const pagination = require('../helpers/pagination')

module.exports = {
  createItemDetails: async (data, tables = table) => {
    query = `INSERT INTO ${tables} SET ?`
    return await getFromDB(query, data)
  },
  createItemDetailsArray: async (keyArr, valueArr, tables = table) => {
    query = `INSERT INTO ${tables} (${keyArr}) VALUES ?`
    return await getFromDB(query, [valueArr])
  },
  updateAndInsert: async (keyArr, valueArr, tables = table) => {
    const updateArr = []
    keyArr.forEach(item => {
      item = item === 'id' ? '' : `${item} = VALUES(${item})`
      item && updateArr.push(item)
    })
    query = `INSERT INTO ${tables} (${keyArr}) VALUES ?
            ON DUPLICATE KEY UPDATE ${updateArr}`
    return await getFromDB(query, [valueArr])
  },
  updateItemDetails: async (data = {}, whereData = {}, tables = table) => {
    const { dataArr, prepStatement } = queryGenerator({ data: whereData })

    // query for where
    const additionalQuery = [dataArr].filter(item => item).map(item => `(${item})`)

    // query for where (if it exist)
    const where = additionalQuery ? ' WHERE ' : ''

    query = `UPDATE ${tables} SET ?
            ${where}
            ${additionalQuery}`
    return await getFromDB(query, [data, ...prepStatement])
  },
  deleteItemDetails: async (whereData = {}, tables = table) => {
    const { dataArr, prepStatement } = queryGenerator({ data: whereData })

    // query for where
    const additionalQuery = [dataArr].filter(item => item).map(item => `(${item})`)

    // query for where (if it exist)
    const where = additionalQuery ? ' WHERE ' : ''

    query = `DELETE FROM ${tables}
            ${where}
            ${additionalQuery}`
    return await getFromDB(query, prepStatement)
  },
  getItemDetailsById: async (id, tables = table) => {
    query = `SELECT *
            FROM ${tables}
            LEFT JOIN (
              SELECT name, hex, id as color_id
              FROM colors
            ) AS colors
            ON ${tables}.color_id = colors.color_id
            WHERE id = ?`
    return await getFromDB(query, id)
  },
  getItemDetailsByItemId: async (item_id, tables = table) => {
    query = `SELECT *
            FROM ${tables}
            LEFT JOIN (
              SELECT name, hex, id as color_id
              FROM colors
            ) AS colors
            ON ${tables}.color_id = colors.color_id
            WHERE item_id = ?`
    return await getFromDB(query, item_id)
  }
}
