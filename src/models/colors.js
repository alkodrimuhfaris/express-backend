const getFromDB = require('../helpers/promiseForSQL')

const queryGenerator = require('../helpers/queryGenerator')
const pagination = require('../helpers/pagination')
const table = 'colors'
let query = ''

module.exports = {
  searchOrCreateColor: async (whereData = {}, tables = table) => {
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
  createColors: async (data, tables = table) => {
    query = `INSERT INTO ${tables} SET ?`
    return await getFromDB(query, data)
  },
  updateColors: async (data = {}, whereData = {}, tables = table) => {
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
  deleteColors: async (whereData = {}, tables = table) => {
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
  getColors: async (whereData = {}, reqQuery = {}, tables = table) => {
    reqQuery = {
      ...reqQuery,
      sort: {
        name: 'DESC'
      }
    }

    const { searchArr, date, price, orderArr, dataArr, prepStatement } = queryGenerator({ ...reqQuery, data: whereData })

    // query for search and limit
    const additionalQuery = [searchArr, date, price, dataArr].filter(item => item).map(item => `(${item})`).join(' AND ')

    // query for where (if it exist)
    const where = additionalQuery ? ' WHERE ' : ''

    const { limiter } = pagination.pagePrep(reqQuery)

    query = `SELECT * FROM ${tables}
            ${where}
            ${additionalQuery}
            ORDER BY
              ${orderArr}
            ${limiter}
            `
    const results = await getFromDB(query, prepStatement)

    query = `SELECT count(*) as count FROM ${tables}
            ${where}
            ${additionalQuery}`
    const [{ count }] = await getFromDB(query, prepStatement)

    return { results, count }
  }
}
