const getFromDB = require('../helpers/promiseForSQL')
const transactionMySQL = require('../helpers/transactionMySQL')

const table = 'users'
let query = ''

module.exports = {
  checkUserExist: async (email = {}, tables = table) => {
    query = `SELECT * FROM ${tables}
            WHERE ?`
    return await getFromDB(query, email)
  },
  getUserBalance: async (id = {}, tables = table) => {
    query = `SELECT balance
            FROM ${tables}
            WHERE ?`
    return await getFromDB(query, id)
  },
  updateBalance: async (id = {}, balance = {}, tables = table) => {
    query = `UPDATE ${tables}
            SET ?
            WHERE ?`
    return await getFromDB(query, [balance, id])
  },
  getUserModel: async (credentials, tables = table) => {
    query = `SELECT *
            FROM ${tables}
            WHERE ${credentials}`
    return await getFromDB(query)
  },
  getUserModelByCred: async (credentials, tables = table) => {
    query = `SELECT *
            FROM ${tables}
            WHERE ?`
    return await getFromDB(query, credentials)
  },
  getUserModelNew: async (credentials, role_id, and = [], tables = table) => {
    let joinTable = ''
    if (role_id === 4) {
      joinTable = `(SELECT user_id, birthdate, gender, avatar, phone
                  FROM user_details)`
    } else if (role_id === 3) {
      joinTable = `(SELECT user_id, store_name, phone, 
                  store_description, avatar
                  FROM user_details)`
    } else if (role_id === 1) {
      joinTable = `(SELECT user_id, store_name, birthdate, gender,
                  avatar, phone, store_description
                  FROM user_details)`
    }
    let queryAnd = ''
    and.forEach(item => {
      queryAnd += 'AND ? '
      return item
    })
    !credentials.length && (credentials = [credentials])
    and.length && (credentials = [...credentials, ...and])
    console.log(credentials)
    query = `SELECT *
            FROM ${tables}
            LEFT JOIN ${joinTable} as details
            ON users.id = details.user_id
            WHERE ?
            ${queryAnd}`
    console.log(query)
    return await getFromDB(query, credentials)
  },
  getUserIDbyEmail: async (credentials, tables = table) => {
    query = `SELECT id, name, role_id
            FROM ${tables}
            WHERE email='${credentials.email}'`
    return await getFromDB(query)
  },
  getUserByCredential: async (credentials, tables = table) => {
    query = `SELECT *
            FROM ${tables}
            WHERE email='${credentials.email}'`
    return await getFromDB(query)
  },
  viewAllUsersModel: async (searchKey, searchValue, colom, sort, limiter, between, and = null, tables = table) => {
    let queryAnd = ''
    and.forEach(item => {
      queryAnd += 'AND ? '
      return item
    })
    !and.length && (and = [and])
    const joinTable = `(SELECT user_id, store_name, birthdate, 
                    gender, avatar, phone, store_description
                    FROM user_details)`
    query = `SELECT *
            FROM ${tables}
            JOIN (${joinTable}) as user_details
            ON users.id = user_details.user_id
            WHERE ${searchKey}
            LIKE '%${searchValue}%'
            ${queryAnd}
            ${between}
            ORDER BY ${colom} ${sort}, name ASC
            ${limiter}`
    console.log(query)
    return await getFromDB(query, and)
  },
  viewCountAllUsersModel: async (searchKey, searchValue, and, tables = table) => {
    query = `SELECT
            COUNT(*) AS count
            FROM ${tables}
            JOIN user_details
            ON users.id = user_details.user_id
            WHERE ${searchKey}
            LIKE '%${searchValue}%'
            ${and}`
    return await getFromDB(query)
  },
  createUserModel: async (userCredentials, userDetails, res) => {
    query = [
      ['INSERT INTO users SET ?', userCredentials],
      ['INSERT INTO user_details SET ?', userDetails]
    ]
    return await transactionMySQL(res, query)
  },
  updateUserModel: async (data, res, tables = table) => {
    let queries = [
      ['UPDATE users SET ? WHERE ?'],
      ['UPDATE user_details SET ? WHERE ?']
    ]
    let n = 0
    queries.forEach(query => {
      query.push(data[n])
      n++
    })
    queries = queries.filter(query => Object.keys(query[1][0]).length)
    console.log(queries)
    return await transactionMySQL(res, queries)
  },
  deleteUserModel: async (id, tables = table) => {
    query = `DELETE
            FROM ${tables}
            WHERE id = ${id}`
    return await getFromDB(query)
  },
  changePassword: async (password, id, tables = table) => {
    query = `UPDATE 
                ${tables} 
                SET ? 
                WHERE ?`

    return await getFromDB(query, [password, id])
  }
}
