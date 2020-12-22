const getFromDB = require('../helpers/promiseForSQL')

const table = 'items'
let query = ''
const queryGenerator = require('../helpers/queryGenerator')
const pagination = require('../helpers/pagination')

module.exports = {
  createItem: async (data, tables = table) => {
    query = `INSERT INTO ${tables} SET ?`
    return await getFromDB(query, data)
  },
  updateItem: async (data = {}, whereData = {}, tables = table) => {
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
  deleteItem: async (whereData = {}, tables = table) => {
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
  getItem: async (id, tables = table) => {
    query = `SELECT * FROM ${tables} WHERE id = ?`
    return await getFromDB(query, id)
  },
  getByQuery: async (tables = table, id, data) => {
    query = `SELECT ? FROM ${tables} WHERE id = ?`
    return await getFromDB(query, [data, id])
  },
  getItemByCondition: async (whereData = {}, reqQuery = {}, tables = table) => {
    const { searchArr, date, price, orderArr, dataArr, prepStatement } = queryGenerator({ ...reqQuery, data: whereData })

    // query for search and limit
    const additionalQuery = [searchArr, date, price, dataArr].filter(item => item).map(item => `(${item})`).join(' AND ')

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
    const count = await getFromDB(query, prepStatement)

    return { results, count }
  },
  getAllItem: async (whereData = {}, reqQuery = {}, querySort = '') => {
    if (querySort === 'new') {
      reqQuery = {
        ...reqQuery,
        sort: {
          created_at: 'DESC'
        }
      }
    } else if (querySort === 'popular') {
      reqQuery = {
        ...reqQuery,
        sort: {
          rating: 'DESC'
        }
      }
    }

    const { searchArr, date, price, orderArr, dataArr, prepStatement } = queryGenerator({ ...reqQuery, data: whereData })

    // query for search and limit
    const additionalQuery = [searchArr, date, price, dataArr].filter(item => item).map(item => `(${item})`).join(' AND ')

    // query for where (if it exist)
    const where = additionalQuery ? ' WHERE ' : ''

    const { limiter } = pagination.pagePrep(reqQuery)

    query = `SELECT *
            FROM items
              LEFT join (
                SELECT 
                    item_id, product_image_1, product_image_2, product_image_3, product_image_4
                FROM item_images
              ) as images
               ON items.id = images.item_id
              LEFT join (
                SELECT avg(rating) as rating, count(id) as ratingCount, item_id
                FROM item_ratings
                GROUP BY item_id
              ) item_ratings ON items.id = item_ratings.item_id
              LEFT JOIN (
                SELECT
                    user_id,
                    store_name
                FROM user_details
              ) AS  detailSeller
              ON items.seller_id = detailSeller.user_id
              LEFT JOIN (
                SELECT
                    id as condition_id,
                    item_condition
                FROM item_condition
              ) AS item_condition
              ON items.condition_id = item_condition.condition_id
              ${where}
              ${additionalQuery}
            ORDER BY 
              ${orderArr}
            ${limiter}`
    const results = await getFromDB(query, prepStatement)

    query = `SELECT count(*) as count
            FROM items
              LEFT join (
                SELECT 
                    item_id, product_image_1, product_image_2, product_image_3, product_image_4
                FROM item_images
              ) as images
              ON items.id = images.item_id
              LEFT join (
                SELECT avg(rating) as rating, count(id) as ratingCount, item_id
                FROM item_ratings
                GROUP BY item_id
              ) item_ratings ON items.id = item_ratings.item_id
              LEFT JOIN (
                SELECT
                    user_id,
                    store_name
                FROM user_details
              ) AS  detailSeller
              ON items.seller_id = detailSeller.user_id
              LEFT JOIN (
                SELECT
                    id as condition_id,
                    item_condition
                FROM item_condition
              ) AS item_condition
              ON items.condition_id = item_condition.condition_id
            ${where}
            ${additionalQuery}`
    const [{ count }] = await getFromDB(query, prepStatement)

    return { results, count }
  },
  getBookingItem: async (itemDetailsId) => {
    query = `SELECT id, item_details.item_id as item_id, name, color_name, store_name, seller_id, price, weight, product_image
            FROM item_details
            LEFT JOIN (
                SELECT id as color_id, name as color_name
                FROM colors
            ) as colors
            ON item_details.color_id = colors.color_id
            LEFT JOIN (
              SELECT items.id as item_id, price, seller_id, store_name, name, weight, product_image
              FROM items
              LEFT JOIN user_details
              ON items.seller_id = user_details.user_id
              LEFT join (
                SELECT item_id, product_image_1 as product_image
                FROM item_images
              ) as images
              ON items.id = images.item_id
            ) as items
            ON item_details.item_id = items.item_id
            WHERE id = ?`
    return await getFromDB(query, itemDetailsId)
  },
  getConditionItem: async (whereData = {}, reqQuery, tables = 'item_condition') => {
    const { searchArr, date, price, orderArr, dataArr, prepStatement } = queryGenerator({ ...reqQuery, data: whereData })

    // query for search and limit
    const additionalQuery = [searchArr, date, price, dataArr].filter(item => item).map(item => `(${item})`).join(' AND ')

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
    const count = await getFromDB(query, prepStatement)

    return { results, count }
  }
}
