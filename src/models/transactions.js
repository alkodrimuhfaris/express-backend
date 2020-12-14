const getFromDB = require('../helpers/promiseForSQL')

let query = ''
const table = 'transaction_total'
const table2 = 'transaction_merchant'
const table3 = 'transaction_details'

const queryGenerator = require('../helpers/queryGenerator')

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
  getAllMerchantTransaction: async (req, customer_id, transaction_id, tables = table2) => {
    const { limiter } = pagination.pagePrep(req)

    query = `SELECT * FROM ${tables}
            LEFT JOIN (
              SELECT SUM(quantity) invoice ${table3}
              GROUP BY invoice
            ) AS ${table3}
            ON ${tables}.invoice = ${table3}.invoice
            WHERE customer_id = ?
            AND transaction_id = ?
            ORDER BY created_at DESC
            ${limiter}`
    return await getFromDB(query, [customer_id, transaction_id])
  },
  countAllMerchantTransaction: async (customer_id, transaction_id, tables = table2) => {
    query = `SELECT count(*) as count
            FROM ${tables}
            LEFT JOIN (
              SELECT SUM(quantity) invoice ${table3}
              GROUP BY invoice
            ) AS ${table3}
            ON ${tables}.invoice = ${table3}.invoice
            WHERE customer_id = ?
            AND transaction_id = ?`
    return await getFromDB(query, [customer_id, transaction_id])
  },
  getMerchantTransactionById: async (transactionMerchantId, customer_id, tables = table2) => {
    query = `SELECT * 
            FROM ${tables}
            WHERE customer_id = ?
            AND id = ?`
    return await getFromDB(query, [transactionMerchantId, customer_id])
  },
  getAllMerchantDetailTransaction: async (req, transactionMerchantId, customer_id, tables = table3) => {
    const { limiter } = pagination.pagePrep(req)

    query = `SELECT *
            FROM ${tables}
            WHERE transaction_merchant_id = ?
            ${limiter}`
    return await getFromDB(query, [customer_id, transactionMerchantId])
  },
  countAllMerchantDetailTransaction: async (transactionMerchantId, customer_id, tables = table3) => {
    query = `SELECT count(*) as count
            FROM ${tables}
            WHERE transaction_merchant_id = ?`
    return await getFromDB(query, [customer_id, transactionMerchantId])
  },
  getAllMerchantDetailTransactionById: async (transactionMerchantId, customer_id, tables = table3) => {
    query = `SELECT *
            FROM ${tables}
            WHERE customer_id = ?
            WHERE transaction_merchant_id = ?`
    return await getFromDB(query, [customer_id, transactionMerchantId])
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
  },
  updateTransaction: async (data = {}, whereData = {}, tables = table) => {
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
  deleteTransaction: async (whereData = {}, tables = table) => {
    const { dataArr, prepStatement } = queryGenerator({ data: whereData })

    // query for where
    const additionalQuery = [dataArr].filter(item => item).map(item => `(${item})`)

    // query for where (if it exist)
    const where = additionalQuery ? ' WHERE ' : ''

    query = `DELETE FROM ${tables}
            ${where}
            ${additionalQuery}`
    return await getFromDB(query, prepStatement)
  }
}
