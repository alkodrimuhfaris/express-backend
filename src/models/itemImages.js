const getFromDB = require('../helpers/promiseForSQL')

const table = 'item_images'
let query = ''
const queryGenerator = require('../helpers/queryGenerator')
// const pagination = require('../helpers/pagination')

module.exports = {
  insertImage: async (data, tables = table) => {
    query = `INSERT INTO ${tables} SET ?`
    return await getFromDB(query, data)
  },
  updateImage: async (data = {}, whereData = {}, tables = table) => {
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
  deleteImage: async (whereData = {}, tables = table) => {
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
  getImage: async (item_id, tables = table) => {
    query = `SELECT * FROM ${tables} WHERE item_id = ?`
    return await getFromDB(query, item_id)
  }
}
