const db = require('../helpers/db')
const getFromDB = require('../helpers/promiseForSQL')
const transactionMySQL = require ('../helpers/transactionMySQL')

const table = 'items'
let query = ''

module.exports = {
  getItemPlain: async (id, tables=table) => {
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
  getRatings: async (id, tables='item_ratings') => {
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
  getDetailItem: async (id, tables='item_details') => {
    query = `SELECT *
            FROM ${tables}
            WHERE id = ${id}`
    return await getFromDB(query)
  },
  getFromItemDetails: async (itemId, tables='item_details') => {
    query = `SELECT *
            FROM ${tables}
            WHERE item_id = ${itemId}`
    return await getFromDB(query)
  },
  viewItemsModel: async (searchKey, searchValue, colom, sort, limiter, and, tables=table) => {
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
  viewCountItemsModel: async (searchKey, searchValue, and, tables=table) => {
    query = `SELECT
            COUNT(*) AS count
            FROM ${tables}
            WHERE ${searchKey}
            LIKE '%${searchValue}%'
            ${and}`
    console.log(query)
    return await getFromDB(query)
  },
  viewAllImage: async (itemId, or, tables='item_images') => {
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
    let query2 = `INSERT INTO item_details (${keys[0]},item_id) VALUES ?`
    let query3 = `INSERT INTO item_images (${keys[1]}) VALUES ?`
    query = [ ['INSERT INTO items SET ?', items],
    [query2, itemDetails],
    [query3, itemImages]]
    return await transactionMySQL(res, query)
  },
  updateItemModelNew: async (res, keys, items, itemDetails, itemDetailsAdd=[], itemImages, imagesAdd=[], id, requires) => {
    let datas = [itemDetails, itemDetailsAdd, itemImages, imagesAdd]
    let keyValues = []
    for (let element of keys) {
      let keyValue=[]
      element.length ? element.forEach(el => { 
        let value = `${el} = values(${el})`
        keyValue.push(value)
      })
      : keyValue.push(null)
      keyValues.push(keyValue)
    }

    let query1 = `UPDATE items SET ? WHERE id = ${id}`
    let query2 = `INSERT INTO item_details (${keys[0]}) VALUES ? ON DUPLICATE KEY UPDATE ${keyValues[0]}`
    let query3 = `INSERT INTO item_details (${keys[1]},item_id) VALUES ?`
    let query4 = `INSERT INTO item_images (${keys[2]}) VALUES ? ON DUPLICATE KEY UPDATE ${keyValues[2]}`
    let query5 = `INSERT INTO item_images (${keys[3]}) VALUES ?`
    let queries = [query2,query3,query4,query5]

    query = [ [query1, items] ]
    let n=0
    for (let data of datas){
      data[0].length && query.push([queries[n], data])
      n++
    }

    return await transactionMySQL(res, query, requires)
  },
  createItemImgModel: async (data, tables=table) => {
    query = `INSERT INTO ${tables} ?
            VALUES ?`
    return await getFromDB(query, data)
  },
  updateItemModel: async (data, dataId, tables=table) => {
    query = `UPDATE ${tables}
            SET ?, updated_at=NOW()
            WHERE ${dataId}`
    return await getFromDB(query, data)
  },
  deleteItemModel: async (id, tables=table) => {
    query = `DELETE
            FROM ${tables}
            WHERE id = ${id}`
    return await getFromDB(query)
  },
  viewAllItemsModel: async (searchKey, searchValue, colom, sort, limiter, and, tables=table) => {
    query = `SELECT items.id, items.name as name, 
            items.description, stock, price, items.created_at as created, rating, ratingCount,
            product_image_1, product_image_2, product_image_3, product_image_4, store_name
            FROM items 
              LEFT join (
                SELECT sum(stock) as stock, min(price) as price, item_id
                FROM item_details
                GROUP BY item_id
              ) as item_details ON items.id = item_details.item_id 
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
            WHERE items.name
              LIKE '%${searchValue}%'
              ${and} 
            GROUP BY items.id 
            ORDER BY ${colom} ${sort}
            ${limiter}`
    return await getFromDB(query)
  },
  viewAllItemsModelCount: async (searchKey, searchValue, and, tables=table) => {
    query = `SELECT COUNT(newTable.id) AS 'count'
            FROM (
              SELECT items.id, items.name as name, 
                items.description, sum(stock) as stock, 
                min(price), items.created_at as created, avg(rating) as rating, product_image_1, product_image_2, product_image_3, product_image_4 
                FROM items 
                  LEFT join item_details ON items.id = item_details.item_id 
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
                  LEFT join item_ratings ON items.id = item_ratings.item_id
                WHERE items.name
                  LIKE '%${searchValue}%'
                  ${and} 
                GROUP BY items.id 
             ) as newTable`
    return await getFromDB(query)
  }
}
