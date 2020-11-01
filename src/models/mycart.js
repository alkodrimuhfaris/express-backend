const getFromDB = require('../helpers/promiseForSQL')
const pagination = require('../helpers/pagination')
const queryGenerator = require('../helpers/queryGenerator')

const table = 'carts'
let query = ''
const itemStoreTable = `SELECT *
FROM (SELECT id as item_details_id, item_id as itemId, color_name, price FROM item_details ) as item_details
LEFT JOIN (
  SELECT id, name, product_image, store_name
  FROM items
  LEFT JOIN (
    SELECT 
      item_id, 
      max(case when name = 'product_image_1' then image_url end) 'product_image'
    FROM item_images
    GROUP BY item_id
  ) AS images
  ON items.id = images.item_id
  LEFT JOIN (
    SELECT user_id, store_name
    FROM user_details
    WHERE role_id = 3
  ) AS seller_detail
  ON items.seller_id = seller_detail.user_id
) AS items_store
ON item_details.itemId = items_store.id`

module.exports = {
  createMycartsModel: async (data, tables = table) => {
    query = `
    INSERT INTO ${tables}
    SET ?`
    return await getFromDB(query, data)
  },
  viewMycartsModel: async (req, data = {}, group = 0, tables = table) => {
    const { limiter } = pagination.pagePrep(req)

    const { searchArr, date, dataArr, prepStatement } = queryGenerator({ ...req, data })

    // query for search and limit
    const additionalQuery = [searchArr, date, dataArr].filter(item => item).map(item => `(${item})`).join(' AND ')

    // query for where (if it exist)
    const where = additionalQuery ? ' WHERE ' : ''

    if (group === 'detail') { group = 'itemdetails_id' } else { group = 'item_id' }

    query = `
            SELECT carts.id as cart_id, user_id, itemdetails_id, item_id,
            price, SUM(quantity) as quantity, name,
            color_name, created_at, product_image
            FROM carts
            LEFT JOIN (${itemStoreTable}) AS item_info
            ON carts.itemdetails_id = item_info.item_details_id
            ${where}
            ${additionalQuery}
            GROUP BY ${group}
            ORDER BY created_at DESC
            ${limiter}`
    console.log(query)
    console.log(prepStatement)
    return await getFromDB(query, prepStatement)
  },
  viewCountMycartsModel: async (req, data = {}, group = 0, tables = table) => {
    const { searchArr, date, dataArr, prepStatement } = queryGenerator({ ...req, data })

    // query for search and limit
    const additionalQuery = [searchArr, date, dataArr].filter(item => item).map(item => `(${item})`).join(' AND ')

    // query for where (if it exist)
    const where = additionalQuery ? ' WHERE ' : ''

    if (group === 'detail') { group = 'itemdetails_id' } else { group = 'item_id' }

    query = `SELECT COUNT(*) as count
            FROM
            (
              SELECT carts.id as cart_id, user_id, itemdetails_id, item_id,
              price, SUM(quantity) as quantity, name,
              color_name, created_at, product_image
              FROM carts
              LEFT JOIN (${itemStoreTable}) AS item_info
              ON carts.itemdetails_id = item_info.item_details_id
              ${where}
              ${additionalQuery}
              GROUP BY ${group}
            ) as newTable`
    console.log(query)
    console.log(prepStatement)
    return await getFromDB(query, prepStatement)
  },
  updateMycartModel: async (data, id, tables = table) => {
    query = `UPDATE ${tables} SET ? WHERE id=${id}`
    return await getFromDB(query, data)
  },
  deleteMycartModel: async (data, user_id, tables = table) => {
    query = `DELETE FROM ${tables} WHERE ? AND user_id = ${user_id}`
    return await getFromDB(query, data)
  },
  getMyCartModel: async (data, data2, tables = table) => {
    query = `SELECT * FROM ${tables} WHERE user_id = ${data} and itemdetails_id = ${data2}`
    return await getFromDB(query)
  },
  getMyCartModelbyId: async (data, tables = table) => {
    query = `SELECT * FROM ${tables} WHERE id = ${data}`
    return await getFromDB(query)
  }
}
