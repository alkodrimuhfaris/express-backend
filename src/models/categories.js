const db = require('../helpers/db')
// const getTime = require('../helpers/getMySQLTime')

const tables = 'categories'

module.exports = {
  createCategoryModel: (name, cb) => {
    db.query(`
    INSERT INTO ${tables} (name)
    VALUE ('${name}')`,
    (err, result, _field) => {
      cb(err, result)
    })
  },
  viewCategoriesModel: (searchKey, searchValue, column, sort, limit, offset, cb) => {
    db.query(`
    SELECT ${tables}.id as id, ${tables}.name as category,
    ${tables}.created_at as 'created at', items.id as item_id, price, items.name as product,
    COUNT(${tables}.id) as 'total product'
    FROM ${tables}
    LEFT JOIN items
    ON ${tables}.id = items.category_id
    WHERE ${searchKey}
    LIKE '%${searchValue}%'
    GROUP BY ${tables}.id
    ORDER BY ${column} ${sort}
    LIMIT ${offset}, ${limit}`,
    (err, result, _field) => {
      cb(err, result)
    })
  },
  viewCountCategoriesModel: (searchKey, searchValue, cb) => {
    db.query(`
    SELECT COUNT(newTable.id) AS 'count'
    FROM (
      SELECT ${tables}.id as id, ${tables}.name as category, items.name as product,
      items.created_at as item_created, count(${tables}.id) as 'total product'
      FROM ${tables}
      LEFT JOIN items
      ON ${tables}.id = items.category_id
      WHERE ${searchKey}
      LIKE '%${searchValue}%'
      GROUP BY ${tables}.id
    ) as newTable`,
    (err, result, _field) => {
      cb(err, result)
    })
  },
  getCategoryModel: (id, column, sort, limit, offset, cb) => {
    db.query(`
    SELECT ${tables}.name as category,
    items.name as product,
    items.id as item_id, price,
    description, items.created_at as 'date added'
    FROM ${tables}
    LEFT JOIN items
    ON ${tables}.id = items.category_id
    WHERE ${tables}.id = ${id}
    ORDER BY ${column} ${sort}
    LIMIT ${offset}, ${limit}`,
    (err, result, _field) => {
      cb(err, result)
    })
  },
  getCategoryCountModel: (id, cb) => {
    db.query(`
    SELECT COUNT(newTable.product) as count
    FROM (
      SELECT ${tables}.name as category,
      items.name as product,
      items.id as item_id, price,
      description, items.created_at as 'date added'
      FROM ${tables}
      LEFT JOIN items
      ON ${tables}.id = items.category_id
      WHERE ${tables}.id = ${id}
    ) AS newTable`,
    (err, result, _field) => {
      cb(err, result)
    })
  },
  updateCategoriesModel: (name, id, cb) => {
    db.query(`
    UPDATE ${tables}
    SET name='${name}', updated_at=NOW()
    WHERE id=${id}`,
    (err, result, _field) => {
      cb(err, result)
    })
  },
  deleteCategoryModel: (id, cb) => {
    db.query(`
    DELETE
    FROM ${tables}
    WHERE id = ${id}`,
    (err, result, _field) => {
      cb(err, result)
    })
  }
}
