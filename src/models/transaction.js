const getFromDB = require('../helpers/promiseForSQL')

let query = ''
const table = 'transaction_total'
const table2 = 'transaction_merchant'
const table3 = 'transaction_details'

const pagination = require('../helpers/pagination')

module.exports = {
  createBooking: async (data = {}, tables = table) => {
    query = `
    INSERT INTO ${tables}
    SET
    ?`
    return await getFromDB(query, data)
  },
  createBookingDetail: async (data = [{}], tables = table2) => {
    const key = Object.keys(data[0])

    const values = []
    for (let item of data) {
      item = Object.values(item)
      values.push(item)
    }

    query = `INSERT INTO ${tables}
            ?
            VALUES
            ?`
    return await getFromDB(query, [[key], values])
  },
  getTransactionById: async (id = {}, tables = table) => {
    query = `SELECT * FROM ${tables}
            WHERE ?`
    return await getFromDB(query, id)
  },
  updateStatus: async (id = {}, status, tables = table) => {
    query = `UPDATE ${tables}
            SET status = ?
            WHERE ?`
    return await getFromDB(query, [status, id])
  },
  getAllTransaction: async (req, user_id = {}, tables = table) => {
    const { limiter } = pagination.pagePrep(req)

    query = `SELECT * FROM ${tables}
            WHERE ?
            ORDER BY created_at DESC
            ${limiter}`
    return await getFromDB(query, user_id)
  },
  countAllTransaction: async (user_id = {}, tables = table) => {
    query = `SELECT count(*) as count FROM ${tables}
            WHERE ?`
    return await getFromDB(query, user_id)
  },
  getAllDetailTransaction: async (req, customer_id = {}, tables = table3) => {
    const { limiter } = pagination.pagePrep(req)

    query = `SELECT * FROM ${tables}
            LEFT JOIN (
              SELECT invoice, shipping_address, courier, service_name, delivery_fee, customer_id
              FROM ${table2}
            ) AS ${table2}
            ON ${tables}.invoice = ${table2}.invoice
            WHERE ?
            ORDER BY created_at DESC
            ${limiter}`
    return await getFromDB(query, customer_id)
  },
  countAllDetailTransaction: async (customer_id = {}, tables = table3) => {
    query = `SELECT count(*) as count
            FROM ${tables}
            LEFT JOIN (
              SELECT invoice, shipping_address, courier, service_name, delivery_fee, customer_id
              FROM ${table2}
            ) AS ${table2}
            ON ${tables}.invoice = ${table2}.invoice
            WHERE ?`
    return await getFromDB(query, customer_id)
  },
  getDetailTransactionById: async (customer_id, id, tables = table3) => {
    query = `SELECT * FROM ${tables}
            LEFT JOIN (
              SELECT invoice, shipping_address, courier, service_name, delivery_fee, customer_id
              FROM ${table2}
            ) AS ${table2}
            ON ${tables}.invoice = ${table2}.invoice
            WHERE customer_id = ?
            AND id = ?`
    return await getFromDB(query, [customer_id, id])
  },
  getTransactionId: async (user_id, id, tables = table) => {
    query = `SELECT * FROM ${tables}
            WHERE user_id = ?
            AND id = ?`
    return await getFromDB(query, [user_id, id])
  }
}
