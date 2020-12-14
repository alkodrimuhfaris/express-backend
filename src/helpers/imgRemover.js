const fs = require('fs')

module.exports = (arr, del = 1) => {
  if (!arr) {
    return null
  } else {
    if (arr.length) {
      for (let item of arr) {
        del
          ? item = item.destination + '/' + item.filename
          : item = process.env.PUBLIC_UPLOAD_FOLDER + item.image_url
        fs.existsSync(item) && fs.unlinkSync(item)
      }
    } else {
      arr && (arr = Object.values(arr).map(item => {
        [item] = item
        return item
      }))
      arr = process.env.PUBLIC_UPLOAD_FOLDER + arr.filename
      fs.existsSync(arr) && fs.unlinkSync(arr)
    }
  }
}
