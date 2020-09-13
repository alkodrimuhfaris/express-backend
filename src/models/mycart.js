const db = require('../helpers/db')
// const getTime = require('../helpers/getMySQLTime')

const tables = 'carts'

module.exports = {
  createMycartsModel: (dataKey, dataValue, cb) => {
    db.query(`
    INSERT INTO ${tables} (${dataKey})
    VALUE (${dataValue})`,
    (err, result, _field) => {
      cb(err, result)
    })
  },
  viewMycartsModel: (searchKey, searchValue, colom, sort, limit, offset, cb) => {
    db.query(`
    SELECT user_id, SUM((price*quantity)) as 'total price',
    date_added
    FROM ${tables}
    LEFT JOIN items
    ON ${tables}.item_id = items.id
    WHERE ${searchKey}
    LIKE '%${searchValue}%'
    GROUP BY user_id
    ORDER BY ${colom} ${sort}
    LIMIT ${offset}, ${limit}`,
    (err, result, _field) => {
      cb(err, result)
    })
  },
  viewCountMycartsModel: (searchKey, searchValue, cb) => {
    db.query(`
    SELECT COUNT(newTable.id) AS 'count'
    FROM (
      SELECT items.id as item_id, ${tables}.id as id,
      items.name as 'product chosen',
      date_added, (price*quantity) as 'total price'
      FROM ${tables}
      LEFT JOIN items
      ON ${tables}.item_id = items.id
      WHERE ${searchKey}
      LIKE '%${searchValue}%'
      GROUP BY user_id
    ) as newTable`,
    (err, result, _field) => {
      cb(err, result)
    })
  },
  getMycartModel: (userId, andValue, offset, limit, cb) => {
    db.query(`
    SELECT ${tables}.id as cart_id, ${tables}.user_id as user_id, item_id,
    items.name as product, quantity, (price*quantity) as prices,
    ${tables}.date_added as 'date added',
    ${tables}.date_updated as 'date updated'
    FROM ${tables}
    LEFT JOIN items
    ON ${tables}.item_id = items.id
    WHERE (user_id = ${userId}) 
    ${andValue}
    ORDER BY ${tables}.date_added DESC
    LIMIT ${offset}, ${limit}`,
    (err, result, _field) => {
      cb(err, result)
    })
  },
  getCountMycartModel: (userId, andValue, cb) => {
    db.query(`
    SELECT COUNT(newTable.user_id) AS 'count', SUM(prices) as 'totalPrice'
    FROM (
      SELECT ${tables}.user_id as user_id, item_id,
      items.name as product, quantity, (price*quantity) as prices,
      ${tables}.date_added as 'date added',
      ${tables}.date_updated as 'date updated'
      FROM ${tables}
      LEFT JOIN items
      ON ${tables}.item_id = items.id
      WHERE (user_id = ${userId}) 
      ${andValue}
      ) as newTable`,
    (err, result, _field) => {
      cb(err, result)
    })
  },
  updateMycartModel: (data, id, cb) => {
    db.query(`
    UPDATE ${tables}
    SET ${data}, date_updated=NOW()
    WHERE id=${id}`,
    (err, result, _field) => {
      cb(err, result)
    })
  },
  deleteMycartModel: (id, cb) => {
    db.query(`
    DELETE
    FROM ${tables}
    WHERE id = ${id}`,
    (err, result, _field) => {
      cb(err, result)
    })
  }
}
