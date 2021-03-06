const getFromDB = require('../helpers/promiseForSQL')
const pagination = require('../helpers/pagination')

const queryGenerator = require('../helpers/queryGenerator')

const table = 'carts'
let query = ''
const storeTable = `
FROM
(
  SELECT 
    carts.id as id, carts.user_id as user_id, carts.seller_id as seller_id,
    carts.item_id as item_id, carts.itemdetails_id, carts.quantity as quantity, created_at,
    updated_at, name, product_image_1, product_image_2, product_image_3,
    product_image_4, store_name, color_name, color_hex, price
  FROM carts
  LEFT JOIN (
    SELECT id as item_id, name, price
    FROM items
  ) AS items
  ON carts.item_id = items.item_id
  LEFT JOIN (
    SELECT item_id, product_image_1, product_image_2, product_image_3, product_image_4
    FROM item_images
  ) AS item_images
  ON carts.item_id = item_images.item_id
  LEFT JOIN (
    SELECT store_name, user_id AS seller_id
    FROM user_details
  ) AS store
  ON carts.seller_id = store.seller_id
  LEFT JOIN (
    SELECT id as itemdetails_id, item_id, colors.name as color_name, colors.hex as color_hex
    FROM item_details
    LEFT JOIN (
      SELECT id as colorsId, name, hex
      FROM colors
    ) AS colors
    ON item_details.color_id = colors.colorsId
  ) AS item_details
  ON carts.itemdetails_id = item_details.itemdetails_id
) AS cartTable`

// const selectArg = `
// carts.id as id, carts.user_id as user_id, carts.seller_id as seller_id,
// carts.item_id as item_id, carts.itemdetails_id, carts.quantity as quantity, created_at,
// updated_at, name, product_image_1, product_image_2, product_image_3,
// product_image_4, store_name, color_name, color_hex`

module.exports = {
  addToCart: async (data, tables = table) => {
    query = `INSERT INTO ${tables} SET ?`
    return await getFromDB(query, data)
  },
  updateCart: async (data = {}, whereData = {}, tables = table) => {
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
  deleteCart: async (whereData = {}, tables = table) => {
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
  getCartById: async (id) => {
    query = `${storeTable} WHERE id = ?`
    return await getFromDB(query, id)
  },
  getCart: async (whereData = {}, reqQuery = {}, tables = table) => {
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
    ${limiter}`
    const results = await getFromDB(query, prepStatement)

    query = `SELECT count(*) as count
            FROM ${tables}
            ${where}
            ${additionalQuery}`
    const [{ count }] = await getFromDB(query, prepStatement)

    return { results, count }
  },
  getAllCart: async (whereData = {}, reqQuery = {}) => {
    const { searchArr, date, price, orderArr, dataArr, prepStatement } = queryGenerator({ ...reqQuery, data: whereData })

    // query for search and limit
    const additionalQuery = [searchArr, date, price, dataArr].filter(item => item).map(item => `(${item})`).join(' AND ')

    // query for where (if it exist)
    const where = additionalQuery ? ' WHERE ' : ''

    const { limiter } = pagination.pagePrep(reqQuery)

    query = `SELECT *
            ${storeTable}
            ${where}
            ${additionalQuery}
            ORDER BY
              ${orderArr}
            ${limiter}
            `
    const results = await getFromDB(query, prepStatement)

    query = `SELECT count(*) as count
            ${storeTable}
            ${where}
            ${additionalQuery}`
    const [{ count }] = await getFromDB(query, prepStatement)

    return { results, count }
  },
  bulkDelete: async (data = [{}], tables = table) => {
    const whereData = Object.keys(data[0])
    const inData = []
    for (const delData of data) {
      const valData = Object.values(delData)
      inData.push(valData)
    }
    console.log(inData)
    query = `DELETE FROM ${tables} WHERE (${whereData}) IN ?`

    return getFromDB(query, [[inData]])
  }
}
