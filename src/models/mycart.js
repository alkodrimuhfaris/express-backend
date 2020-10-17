const db = require('../helpers/db')
const getFromDB = require('../helpers/promiseForSQL')

const table = 'carts'
let query = ''
const itemStoreTable = `SELECT *
      FROM (SELECT id as itemdetails_id, item_id, color_name, price FROM item_details ) as item_details
      LEFT JOIN (
        SELECT id, name, product_image_1, store_name
        FROM items
        LEFT JOIN (
          SELECT 
            item_id, 
            max(case when name = 'product_image_1' then image_url end) 'product_image_1'
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
      ON item_details.item_id = items_store.id`

const getDB = (query, data, data2) => {
  return new Promise((resolve, reject) => {
   db.query(query, data, data2, (err, results, _fields) => {
      if (err) {
        reject(err)
        console.log(err)
      } else {
        resolve(results)
        console.log(results)
      }
    })
  })  
}

module.exports = {
  createMycartsModel: async (data, tables=table) => {
    query = `
    INSERT INTO ${tables}
    SET ?`
    return await getFromDB(query, data)
  },
  viewMycartsModel: async (user_id, searchValue, limiter, and=0, group=0, tables=table) => {
    if (group === 'detail') {group = 'item_info.itemdetails_id'}
    else {group = 'item_info.item_id'}

    if (and) {
      and = `AND item_info.item_id = ${and}`
    } else {
      and = ''
    }
    query = `
    SELECT ${tables}.id as cart_id, user_id, item_info.itemdetails_id, item_info.item_id,
    price, SUM(quantity) as quantity, item_info.name as product_name,
    item_info.color_name as product_color, date_added, product_image_1 as cartImg
    FROM ${tables}
    LEFT JOIN (${itemStoreTable}) AS item_info
    ON ${tables}.itemdetails_id = item_info.itemdetails_id
    WHERE item_info.name
    LIKE '%${searchValue}%'
    AND user_id = ${user_id}
    ${and}
    GROUP BY ${group}
    ORDER BY date_added DESC
    ${limiter}`
    return await getFromDB(query)
  },
  viewCountMycartsModel: async (user_id, searchValue, and=0, group=0, tables=table) => {

    if (group === 'detail') {group = 'item_info.itemdetails_id'}
    else {group = 'item_info.item_id'}

    if (and) {
      and = `AND item_info.item_id = ${and}`
    } else {
      and = ''
    }

    query = `
    SELECT COUNT(newTable.cart_id) AS 'count'
    FROM (
         SELECT ${tables}.id as cart_id, user_id, item_info.itemdetails_id, item_info.item_id, SUM(price*quantity) as price, SUM(quantity) as quantity, item_info.name as product_name, item_info.color_name as product_color, date_added
        date_added
        FROM ${tables}
        LEFT JOIN (${itemStoreTable}) AS item_info
        ON ${tables}.itemdetails_id = item_info.itemdetails_id
        WHERE item_info.name
        LIKE '%${searchValue}%'
        AND user_id = ${user_id}
        ${and}
        GROUP BY ${group}
    ) as newTable`
    return await getFromDB(query)
  },
  updateMycartModel: async (data, id, tables=table) => {
    query = `UPDATE ${tables} SET ?, date_updated=NOW() WHERE id=${id}`
    return await getFromDB(query, data)
  },
  deleteMycartModel: async (data, user_id, tables=table) => {
    query = `DELETE FROM ${tables} WHERE ? AND user_id = ${user_id}`
    return await getFromDB(query, data)
  },
  getMyCartModel: async (data, data2, tables=table) => {
    query = `SELECT * FROM ${tables} WHERE user_id = ${data} and itemdetails_id = ${data2}`
    return await getFromDB(query)
  },
  getMyCartModelbyId: async (data, tables=table) => {
    query = `SELECT * FROM ${tables} WHERE id = ${data}`
    return await getFromDB(query)
  }
}
