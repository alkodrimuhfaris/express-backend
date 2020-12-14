const getFromDB = require('../helpers/promiseForSQL')
const pagination = require('../helpers/pagination')

const queryGenerator = require('../helpers/queryGenerator')

const table = 'carts'
let query = ''
const storeTable = `
FROM carts
LEFT JOIN (
  SELECT id as item_id, name
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
ON carts.itemdetails_id = item_details.itemdetails_id`

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
  }
}
