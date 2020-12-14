const getFromDB = require('../helpers/promiseForSQL')
const pagination = require('../helpers/pagination')

const queryGenerator = require('../helpers/queryGenerator')

const table = 'user_address'
let query = ''

module.exports = {
  createAddress: async (data = {}, tables = table) => {
    query = `INSERT INTO ${tables} SET ?`
    return await getFromDB(query, data)
  },
  updateAddress: async (data = {}, whereData = {}, tables = table) => {
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
  deleteAddress: async (whereData = {}, tables = table) => {
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
  getAddress: async (whereData = {}, reqQuery, tables = table) => {
    const sortQuery = reqQuery.sort ? reqQuery.sort : {}
    reqQuery = {
      ...reqQuery,
      sort: {
        primary_address: 'DESC',
        created_at: 'DESC',
        ...sortQuery
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
            ${where}
            ${additionalQuery}
            ORDER BY
              ${orderArr}
            ${limiter}`
    const results = await getFromDB(query, prepStatement)

    query = `SELECT count(*) as count
            FROM ${tables}
            ${where}
            ${additionalQuery}`
    const [{ count }] = await getFromDB(query, prepStatement)

    return { results, count }
  },
  getCityId: async (user_id = {}, primaryOrAddressId = { primary_address: 1 }, tables = table) => {
    query = `SELECT city_id
            FROM ${tables}
            WHERE ?
            AND ?`
    return await getFromDB(query, [user_id, primaryOrAddressId])
  },
  getSellerCityId: async (item_details_id = {}, primaryOrAddressId = { primary_address: 1 }, tables = table) => {
    query = `SELECT city_id, item_details_id
            FROM user_address as ${tables}
            LEFT JOIN (
              SELECT seller_id, item_details.id as item_details_id 
              FROM item_details
              LEFT JOIN items
              ON item_details.item_id = items.id
            ) AS items
            ON user_address.user_id = items.seller_id
            WHERE ?
            AND ?`
    return await getFromDB(query, [item_details_id, primaryOrAddressId])
  }
}
