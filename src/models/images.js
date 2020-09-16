const db = require('../helpers/db')
// const getTime = require('../helpers/getMySQLTime')

const tables = 'images'

module.exports = {
  getImage: (itemId, cb) => {
    db.query(`
    SELECT *
    FROM ${tables}
    WHERE item_id = ${itemId}
    ORDER BY ${colom} ${sort}
    LIMIT ${offset}, ${limit}`,
    (err, result, _field) => {
      cb(err, result)
    })
  },
  viewItemsModel: (searchKey, searchValue, colom, sort, limit, offset, cb) => {
    db.query(`
    SELECT *
    FROM ${tables}
    WHERE ${searchKey}
    LIKE '%${searchValue}%'
    ORDER BY ${colom} ${sort}
    LIMIT ${limit}
    OFFSET ${offset}`,
    (err, result, _field) => {
      cb(err, result)
    })
  },
  viewCountItemsModel: (searchKey, searchValue, cb) => {
    db.query(`
    SELECT
    COUNT(*) AS count
    FROM ${tables}
    WHERE ${searchKey}
    LIKE '%${searchValue}%'`,
    (err, result, _field) => {
      cb(err, result)
    })
  },
  createItemModel: (colName, colValue, cb) => {
    db.query(`
    INSERT INTO ${tables} (${colName})
    VALUE (${colValue})`,
    (err, result, _field) => {
      cb(err, result)
    })
  },
  updateItemModel: (data, dataId, cb) => {
    db.query(`
    UPDATE ${tables}
    SET ${data}, updated_at=NOW()
    WHERE ${dataId}`,
    (err, result, _field) => {
      cb(err, result)
    })
  },
  deleteItemModel: (id, cb) => {
    db.query(`
    DELETE
    FROM ${tables}
    WHERE id = ${id}`,
    (err, result, _field) => {
      cb(err, result)
    })
  }
}
