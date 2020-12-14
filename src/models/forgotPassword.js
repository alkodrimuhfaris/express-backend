const table = 'users'
const getFromDB = require('../helpers/promiseForSQL')
let query = ''

module.exports = {
  createResetCode: async (data = {}, user = {}, tables = table) => {
    query = `UPDATE 
                 ${tables} 
                 SET ? 
                 WHERE ?`
    return await getFromDB(query, [data, user])
  },
  changePassword: async (password, id, tables = table) => {
    query = `UPDATE 
                ${tables} 
                SET ? 
                WHERE ?`
    return await getFromDB(query, [password, id])
  }
}
