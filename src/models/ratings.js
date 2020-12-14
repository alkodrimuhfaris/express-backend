const getFromDB = require('../helpers/promiseForSQL')

const table = 'item_ratings'
let query = ''
const queryGenerator = require('../helpers/queryGenerator')
const pagination = require('../helpers/pagination')

module.exports = {
  createRatings: async (data = {}, tables = table) => {
    query = `INSERT INTO ${tables} SET ?`
    return await getFromDB(query, data)
  },
  updateRatings: async (data = {}, where = {}, tables = table) => {
    const { dataArr, prepStatement } = queryGenerator({ data: where })
    query = `INSERT INTO ${tables}
            SET ?
            WHERE ${dataArr}`
    return await getFromDB(query, [data, ...prepStatement])
  },
  deleteRatings: async (where = {}, tables = table) => {
    const { dataArr, prepStatement } = queryGenerator({ data: where })
    query = `DELETE FROM ${tables} WHERE ${dataArr}`
    return await getFromDB(query, prepStatement)
  },
  getOneRatings: async (where = {}, tables = table) => {
    const { dataArr, prepStatement } = queryGenerator({ data: where })
    query = `SELECT * FROM ${tables} WHERE ${dataArr}`
    return await getFromDB(query, prepStatement)
  },
  getAllRatings: async (reqQuery, whereData = {}, tables = table) => {
    const { searchArr, date, orderArr, dataArr, prepStatement } = queryGenerator({ ...reqQuery, data: whereData })
    // query for search and limit
    const additionalQuery = [searchArr, date, dataArr].filter(item => item).map(item => `(${item})`).join(' AND ')

    // query for where (if it exist)
    const where = additionalQuery ? ' WHERE ' : ''

    const { limiter } = pagination.pagePrep(reqQuery)

    query = `SELECT * 
            FROM ${tables}
            LEFT JOIN (
              SELECT id as user_id, name, avatar
              FROM users
              LEFT JOIN (
                SELECT user_id, avatar
                FROM user_details
              ) AS user_details
              ON users.id = user_details.user_id
            ) AS users
            ON users.user_id = ${tables}.user_id
            ${where}
            ${additionalQuery}
            ORDER BY
              ${orderArr}
            ${limiter}`
    const results = await getFromDB(query, prepStatement)

    query = `SELECT count(*) as count 
            FROM ${tables}
            LEFT JOIN (
              SELECT id as user_id, name, avatar
              FROM users
              LEFT JOIN (
                SELECT user_id, avatar
                FROM user_details
              ) AS user_details
              ON users.id = user_details.user_id
            ) AS users
            ON users.user_id = ${tables}.user_id
            ${where}
            ${additionalQuery}`
    const [{ count }] = await getFromDB(query, prepStatement)

    return { results, count }
  },
  getRatings: async (item_id, tables = table) => {
    query = `SELECT
            ROUND(AVG(rating), 2) AS ratingAvg
            , COUNT(rating = 5 OR NULL) AS stars5
            , ROUND((COUNT(rating = 5 or null)*100/COUNT(rating)), 0) AS star5bar
            , COUNT(rating = 4 OR NULL) AS stars4
            , ROUND((COUNT(rating = 4 or null)*100/COUNT(rating)), 0) AS star4bar
            , COUNT(rating = 3 OR NULL) AS stars3
            , ROUND((COUNT(rating = 3 or null)*100/COUNT(rating)), 0) AS star3bar
            , COUNT(rating = 2 OR NULL) AS stars2
            , ROUND((COUNT(rating = 2 or null)*100/COUNT(rating)), 0) AS star2bar
            , COUNT(rating = 1 OR NULL) AS stars1
            , ROUND((COUNT(rating = 1 or null)*100/COUNT(rating)), 0) AS star1bar
            , COUNT(rating) AS ratingCount
            FROM ${tables}
            WHERE item_id = ${item_id}
            GROUP BY item_id`
    return await getFromDB(query)
  }
}
