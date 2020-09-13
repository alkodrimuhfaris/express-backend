const {
  getItemModel
} = require('../models/items')

function itemChecking (itemId) {
  itemId = Number(itemId.trim())
  let a = null
  getItemModel(itemId, (_err, result) => {
    console.log(result)
    if (result.length) {
      console.log(true)
      a = true
    } else {
      console.log(false)
      a = false
    }
  })
  return a
}

module.exports = itemChecking
