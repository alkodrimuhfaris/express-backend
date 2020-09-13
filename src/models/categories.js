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
  viewCategoriesModel: (searchValue, limit, offset, cb) => {
    db.query(`
    SELECT *
    FROM ${tables}
    WHERE name
    LIKE '%${searchValue}%'
    LIMIT ${limit}
    OFFSET ${offset}`,
    (err, result, _field) => {
      cb(err, result)
    })
  },
  viewCountCategoriesModel: (searchValue, cb) => {
    db.query(`
    SELECT
    COUNT(*) AS count
    FROM ${tables}
    WHERE name
    LIKE '%${searchValue}%'`,
    (err, result, _field) => {
      cb(err, result)
    })
  },
  getCategoryModel: (id, cb) => {
    db.query(`
    SELECT *
    FROM ${tables}
    WHERE id = ${id}`, (err, result, _field) => {
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
