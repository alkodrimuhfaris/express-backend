const getFromDB = require('../helpers/promiseForSQL')

const table = 'user_address'
let query = ''

module.exports = {
  getAddressByID: async (where, tables=table) => {
    query = `SELECT *
            FROM ${tables}
            WHERE ?`
    return await getFromDB(query, where)
  },
  getAddressPlain: async (id, userId, tables=table) => {
    query = `SELECT *
            FROM ${tables} 
            WHERE id = ${id}
            AND user_id=${userId}`
    console.log(query)
    return await getFromDB(query)
  },
  viewAddresssModel: async (data, and=[], limiter='', tables=table) => {
    let queryAnd = ''
    and.forEach( item => queryAnd += 'AND ? ')
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
  viewCountAddresssModel: async (user_id, tables=table) => {
    query = `SELECT
            COUNT(*) AS count
            FROM ${tables}
            WHERE user_id = ${user_id}`
    console.log(query)
    return await getFromDB(query)
  },
  createAddressModel: async (data, tables=table) => {
    query = `INSERT INTO ${tables}
            SET ?`
    return await getFromDB(query, [data])
  },
  updateAddressModel: async (data, and=[], tables=table) => {
    let queryAnd = ''
    and.forEach( item => queryAnd += 'AND ? ')
    !data.length && (data = [data])
    and.length && (data = [...data, ...and])
    query = `UPDATE ${tables}
            SET ?, updated_at=NOW()
            WHERE ?
            ${queryAnd}`
    return await getFromDB(query, data)
  },
  deleteAddressModel: async (data, and=[], tables=table) => {
    let queryAnd = ''
    and.forEach( item => queryAnd += 'AND ? ')
    !data.length && (data = [data])
    and.length && (data = [...data, ...and])
    query = `DELETE
            FROM ${tables}
            WHERE ?
            ${queryAnd}`
    return await getFromDB(query, data)
  }
}