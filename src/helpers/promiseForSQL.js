const db = require('../helpers/db')

module.exports = (query, data = []) => {
  return new Promise((resolve, reject) => {
    db.query(query, data, (err, results, _fields) => {
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
