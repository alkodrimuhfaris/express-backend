const getFromDB = require('../helpers/promiseForSQL')
const pagination = require('../helpers/pagination')

const queryGenerator = require('../helpers/queryGenerator')
const table = 'users'
let query = ''

module.exports = {
  createUser: async (data = {}, tables = table) => {
    query = `INSERT INTO ${tables} SET ?`
    return await getFromDB(query, data)
  },
  updateUser: async (data = {}, whereData = {}, tables = table) => {
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
  deleteUser: async (whereData = {}, tables = table) => {
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
  getuser: async (whereData = {}, tables = table) => {
    const { dataArr, prepStatement } = queryGenerator({ data: whereData })

    const additionalQuery = [dataArr].filter(item => item).map(item => `(${item})`)

    const where = additionalQuery ? ' WHERE ' : ''

    query = `SELECT *
            FROM ${tables}
            ${where}
            ${additionalQuery}`
    return await getFromDB(query, prepStatement)
  },
  getUserWithDetail: async (whereData = {}, reqQuery = {}, tables = table) => {
    const { searchArr, date, orderArr, dataArr, prepStatement } = queryGenerator({ ...reqQuery, data: whereData })

    // query for search and limit
    const additionalQuery = [searchArr, date, dataArr].filter(item => item).map(item => `(${item})`).join(' AND ')

    // query for where (if it exist)
    const where = additionalQuery ? ' WHERE ' : ''

    const { limiter } = pagination.pagePrep(reqQuery)

    query = `SELECT *
            FROM ${tables}
            LEFT JOIN (
              SELECT user_id, birthdate, avatar, gender, phone, store_description, store_name
              FROM user_details
            ) AS user_details
            ON ${tables}.id = user_details.user_id
            ${where}
            ${additionalQuery}
            ORDER BY
              ${orderArr}
            ${limiter}`

    const results = await getFromDB(query, prepStatement)

    query = `SELECT count(*) as count
            FROM ${tables}
            LEFT JOIN (
              SELECT user_id, birthdate, avatar, gender, phone, store_description, store_name
              FROM user_details
            ) AS user_details
            ON ${tables}.id = user_details.user_id
            ${where}
            ${additionalQuery}
            ORDER BY
              ${orderArr}
            ${limiter}`

    const [{ count }] = await getFromDB(query, prepStatement)

    return { results, count }
  }

}
