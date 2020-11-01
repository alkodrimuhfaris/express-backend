const getFromDB = require('../helpers/promiseForSQL')

const table = 'user_address'
let query = ''

module.exports = {
  getAddressByID: async (where, tables = table) => {
    query = `SELECT *
            FROM ${tables}
            WHERE ?`
    return await getFromDB(query, where)
  },
  getAddressPlain: async (id, userId, tables = table) => {
    query = `SELECT *
            FROM ${tables} 
            WHERE id = ${id}
            AND user_id=${userId}`
    console.log(query)
    return await getFromDB(query)
  },
  viewAddresssModel: async (data, and = [], limiter = '', tables = table) => {
    let queryAnd = ''
    and.forEach(item => {
      queryAnd += ' AND ? '
      return item
    })
    !data.length && (data = [data])
    and.length && (data = [...data, ...and])
    query = `SELECT *
            FROM ${tables}
            WHERE ? 
            ${queryAnd}
            ORDER BY primary_address DESC, created_at DESC
            ${limiter}`
    console.log(query)
    return await getFromDB(query, data)
  },
  viewCountAddresssModel: async (userId, tables = table) => {
    query = `SELECT
            COUNT(*) AS count
            FROM ${tables} 
            WHERE user_id = ${userId}`
    console.log(query)
    return await getFromDB(query)
  },
  createAddressModel: async (data, tables = table) => {
    query = `INSERT INTO ${tables}
            SET ?`
    return await getFromDB(query, [data])
  },
  updateAddressModel: async (data, and = [], tables = table) => {
    let queryAnd = ''
    and.forEach(item => {
      queryAnd += 'AND ? '
      return item
    })
    !data.length && (data = [data])
    and.length && (data = [...data, ...and])
    query = `UPDATE ${tables}
            SET ?
            WHERE ?
            ${queryAnd}`
    return await getFromDB(query, data)
  },
  deleteAddressModel: async (data, and = [], tables = table) => {
    let queryAnd = ''
    and.forEach(item => {
      queryAnd += 'AND ? '
      return item
    })
    !data.length && (data = [data])
    and.length && (data = [...data, ...and])
    query = `DELETE
            FROM ${tables}
            WHERE ?
            ${queryAnd}`
    return await getFromDB(query, data)
  },
  getCityId: async (user_id = {}, primaryOrAddressId = { primary_address: 1 }, tables = table) => {
    query = `SELECT city_id
            FROM ${tables}
            WHERE ?
            AND ?`
    return await getFromDB(query, [user_id, primaryOrAddressId])
  },
  getAddress: async (user_id = {}, primaryOrAddressId = { primary_address: 1 }, tables = table) => {
    query = `SELECT *
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
