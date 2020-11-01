const getFromDB = require('../helpers/promiseForSQL')
const transactionMySQL = require('../helpers/transactionMySQL')

const table = 'items'
let query = ''
const queryGenerator = require('../helpers/queryGenerator')
const pagination = require('../helpers/pagination')

module.exports = {
  getItemPlain: async (id, tables = table) => {
    query = `SELECT *
            FROM ${tables}
            LEFT join (
                select 
                    item_id, 
                    max(case when name = 'product_image_1' then image_url end) 'product_image_1',
                    max(case when name = 'product_image_2' then image_url end) 'product_image_2',
                    max(case when name = 'product_image_3' then image_url end) 'product_image_3',
                    max(case when name = 'product_image_4' then image_url end) 'product_image_4'
                from item_images
                group by item_id
              ) as images
            ON items.id = images.item_id
            LEFT JOIN (
              SELECT user_id, store_name
              FROM user_details
            ) as user_details
            ON ${tables}.seller_id = user_details.user_id
            LEFT JOIN (
              SELECT min(price) as price, item_id
              FROM item_details
              GROUP BY item_id
            ) as item_details
            ON ${tables}.id = item_details.item_id
            LEFT JOIN item_condition
            ON ${tables}.condition_id = item_condition.id
            WHERE items.id = ${id}`
    console.log(query)
    return await getFromDB(query)
  },
  getRatings: async (id, tables = 'item_ratings') => {
    query = `SELECT
            AVG(rating) AS ratingAvg
           , COUNT(rating = 5 OR NULL) AS stars5
           , (COUNT(rating = 5 or null)/COUNT(rating)) AS star5bar
           , COUNT(rating = 4 OR NULL) AS stars4
           , (COUNT(rating = 4 or null)/COUNT(rating)) AS star4bar
           , COUNT(rating = 3 OR NULL) AS stars3
           , (COUNT(rating = 3 or null)/COUNT(rating)) AS star3bar
           , COUNT(rating = 2 OR NULL) AS stars2
           , (COUNT(rating = 2 or null)/COUNT(rating)) AS star2bar
           , COUNT(rating = 1 OR NULL) AS stars1
           , (COUNT(rating = 1 or null)/COUNT(rating)) AS star1bar
           , COUNT(rating) AS ratingCount
          FROM   ${tables}
          WHERE item_id = ${id}
          GROUP  BY item_id`
    return await getFromDB(query)
  },
  getDetailItem: async (id, tables = 'item_details') => {
    query = `SELECT *
            FROM ${tables}
            WHERE id = ${id}`
    return await getFromDB(query)
  },
  getFromItemDetails: async (itemId, tables = 'item_details') => {
    query = `SELECT *
            FROM ${tables}
            WHERE item_id = ${itemId}`
    return await getFromDB(query)
  },
  viewItemsModel: async (searchKey, searchValue, colom, sort, limiter, and, tables = table) => {
    query = `SELECT *
            FROM ${tables}
            WHERE ${searchKey}
            LIKE '%${searchValue}%'
            ${and}
            ORDER BY ${colom} ${sort}
            ${limiter}`
    console.log(query)
    return await getFromDB(query)
  },
  viewDetailItem: async (req, item_id, tables = 'item_details') => {
    const { orderArr } = queryGenerator(req)

    const { limiter } = pagination.pagePrep(req)
    query = `SELECT *
            FROM ${tables}
            WHERE item_id = ?
            ORDER BY ${orderArr}
            ${limiter}`
    console.log(query)
    return await getFromDB(query, item_id)
  },
  viewDetailItemCount: async (item_id, tables = 'item_details') => {
    query = `SELECT count(*) as count
            FROM ${tables}
            WHERE item_id = ?`
    console.log(query)
    return await getFromDB(query, item_id)
  },
  viewCountItemsModel: async (searchKey, searchValue, and, tables = table) => {
    query = `SELECT
            COUNT(*) AS count
            FROM ${tables}
            WHERE ${searchKey}
            LIKE '%${searchValue}%'
            ${and}`
    console.log(query)
    return await getFromDB(query)
  },
  viewAllImage: async (itemId, or, tables = 'item_images') => {
    let andOrQuery = ''
    let orQuery = []
    or.forEach(el => orQuery.push(' ? '))
    orQuery = orQuery.join(' or ')
    or.length && (andOrQuery = `AND (${orQuery})`)
    query = `SELECT *
            FROM ${tables}
            WHERE item_id = ${itemId}
            ${andOrQuery}`
    return await getFromDB(query, or)
  },
  createItemModel: async (res, keys, items, itemDetails, itemImages) => {
    const query2 = `INSERT INTO item_details (${keys[0]},item_id) VALUES ?`
    const query3 = `INSERT INTO item_images (${keys[1]}) VALUES ?`
    query = [
      ['INSERT INTO items SET ?', items],
      [query2, itemDetails],
      [query3, itemImages]
    ]
    return await transactionMySQL(res, query)
  },
  updateItemModelNew: async (res, keys, items, itemDetails, itemDetailsAdd = [], itemImages, imagesAdd = [], id, requires) => {
    const datas = [itemDetails, itemDetailsAdd, itemImages, imagesAdd]
    const keyValues = []
    for (const element of keys) {
      const keyValue = []
      element.length
        ? element.forEach(el => {
            const value = `${el} = values(${el})`
            keyValue.push(value)
          })
        : keyValue.push(null)
      keyValues.push(keyValue)
    }

    const query1 = `UPDATE items SET ? WHERE id = ${id}`
    const query2 = `INSERT INTO item_details (${keys[0]}) VALUES ? ON DUPLICATE KEY UPDATE ${keyValues[0]}`
    const query3 = `INSERT INTO item_details (${keys[1]},item_id) VALUES ?`
    const query4 = `INSERT INTO item_images (${keys[2]}) VALUES ? ON DUPLICATE KEY UPDATE ${keyValues[2]}`
    const query5 = `INSERT INTO item_images (${keys[3]}) VALUES ?`
    const queries = [query2, query3, query4, query5]

    query = [[query1, items]]
    for (const [n, data] of datas.entries()) {
      data[0].length && query.push([queries[n], data])
    }

    return await transactionMySQL(res, query, requires)
  },
  createItemImgModel: async (data, tables = table) => {
    query = `INSERT INTO ${tables} ?
            VALUES ?`
    return await getFromDB(query, data)
  },
  updateItemModel: async (data, dataId, tables = table) => {
    query = `UPDATE ${tables}
            SET ?
            WHERE ${dataId}`
    return await getFromDB(query, data)
  },
  deleteItemModel: async (id, tables = table) => {
    query = `DELETE
            FROM ${tables}
            WHERE id = ${id}`
    return await getFromDB(query)
  },
  viewAllItemsModel: async (req, query = '', data = {}, tables = table) => {
    if (query === 'new') {
      req = {
        ...req,
        sort: {
          created_at: 'DESC'
        }
      }
    } else if (query === 'popular') {
      req = {
        ...req,
        sort: {
          rating: 'DESC'
        }
      }
    }

    const { searchArr, date, orderArr, dataArr, prepStatement } = queryGenerator({ ...req, data })

    // query for search and limit
    const additionalQuery = [searchArr, date, dataArr].filter(item => item).map(item => `(${item})`).join(' AND ')

    // query for where (if it exist)
    const where = additionalQuery ? ' WHERE ' : ''

    const { limiter } = pagination.pagePrep(req)

    query = `SELECT
            items.id, items.name as name, 
            items.description, stock, price, items.created_at as created, rating, ratingCount,
            product_image_1, product_image_2, product_image_3, product_image_4, store_name
            FROM items 
              LEFT join (
                SELECT sum(stock) as stock, min(price) as price, item_id
                FROM item_details
                GROUP BY item_id
              ) as item_details ON items.id = item_details.item_id 
              LEFT join (
                SELECT 
                    item_id, 
                    max(case when name = 'product_image_1' then image_url end) 'product_image_1',
                    max(case when name = 'product_image_2' then image_url end) 'product_image_2',
                    max(case when name = 'product_image_3' then image_url end) 'product_image_3',
                    max(case when name = 'product_image_4' then image_url end) 'product_image_4'
                FROM item_images
                GROUP BY item_id
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
            ${where}
            ${additionalQuery}
            ORDER BY 
              ${orderArr}
            ${limiter}`
    return await getFromDB(query, prepStatement)
  },
  viewAllItemsModelCount: async (req, query = '', data = {}, tables = table) => {
    if (query === 'new') {
      req = {
        ...req,
        sort: {
          created_at: 'DESC'
        }
      }
    } else if (query === 'popular') {
      req = {
        ...req,
        sort: {
          rating: 'DESC'
        }
      }
    }

    const { searchArr, date, dataArr, prepStatement } = queryGenerator({ ...req, data })

    // query for search and limit
    const additionalQuery = [searchArr, date, dataArr].filter(item => item).map(item => `(${item})`).join(' AND ')

    // query for where (if it exist)
    const where = additionalQuery ? ' WHERE ' : ''

    query = `SELECT COUNT(*) AS 'count'
            FROM items 
            LEFT join (
              SELECT sum(stock) as stock, min(price) as price, item_id
              FROM item_details
              GROUP BY item_id
            ) as item_details ON items.id = item_details.item_id 
            LEFT join (
              SELECT 
                  item_id, 
                  max(case when name = 'product_image_1' then image_url end) 'product_image_1',
                  max(case when name = 'product_image_2' then image_url end) 'product_image_2',
                  max(case when name = 'product_image_3' then image_url end) 'product_image_3',
                  max(case when name = 'product_image_4' then image_url end) 'product_image_4'
              FROM item_images
              GROUP BY item_id
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
          ${where}
          ${additionalQuery}`
    return await getFromDB(query, prepStatement)
  },
  getItemWeight: async (itemDetailsId) => {
    query = `SELECT weight 
            FROM item_details
            LEFT JOIN items
            ON item_details.item_id = items.id
            WHERE item_details.id = ${itemDetailsId}`
    return await getFromDB(query)
  },
  getBookingItem: async (itemDetailsId) => {
    query = `SELECT id, item_details.item_id as item_id, name, color_name, store_name, seller_id, price, weight, product_image
            FROM item_details
            LEFT JOIN (
              SELECT items.id as item_id, seller_id, store_name, name, weight, product_image
              FROM items
              LEFT JOIN user_details
              ON items.seller_id = user_details.user_id
              LEFT join (
                SELECT 
                    item_id, 
                    max(case when name = 'product_image_1' then image_url end) 'product_image'
                FROM item_images
                GROUP BY item_id
              ) as images
              ON items.id = images.item_id
            ) as items
            ON item_details.item_id = items.item_id
            WHERE id = ?`
    return await getFromDB(query, itemDetailsId)
  },
  updateStock: async (stock = {}, itemDetailsId = {}, tables = 'item_details') => {
    query = `UPDATE ${tables}
            SET ?
            WHERE ?`
    return await getFromDB(query, [stock, itemDetailsId])
  }
}
