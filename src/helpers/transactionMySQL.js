const db = require('./db')
const getFromDB = require('./promiseForTransaction')


module.exports = async (res, arr, requires='create') => {
  return new Promise ((resolve, reject) => {
    db.beginTransaction(async function(err) {
      if (err) return reject(err)
      if  (!arr.length) {
        let err={
          message: 'Array is empty!'
        }
        return reject(err)
      }
      let result = []
      let setResult = {}
      for await (let el of arr) {
        try {
          if(requires === 'create'){
            if (!Array.isArray(el[1])){
              console.log(el[1])
              Boolean(el[1].login) && Object.assign (el[1], {user_id:result[0].insertId})
              Boolean(el[1].login) && delete el[1].login
              Boolean(el[1].create) && Object.assign (el[1], {item_id:result[0].insertId})
              Boolean(el[1].create) && delete el[1].create
            } else {
              console.log(el[1])
              el[1][0].forEach(element => { element.push(result[0].insertId) })
            }
          }
          setResult = await getFromDB(el[0], el[1])
          result.push(setResult)
        }
        catch (err) {
         return reject(err)
       }
      }
      db.commit(function(err) {
        if (err) {
          reject(err)
          return db.rollback(function() {
          })
        } resolve(result)
      })
    })
  })
}