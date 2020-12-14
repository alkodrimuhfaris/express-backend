const {
  viewAllImage
} = require('../models/itemsOld')
const fs = require('fs')

module.exports = async (itemId, arr) => {
  const imageOrArr = []
  const imageResult = []
  const imageKeysUpdate = ['name', 'image_url', 'id', 'updated_at']
  const imageValsUpdate = []
  const imageKeysNew = ['name', 'image_url', 'item_id']
  const imageValsNew = []
  let n = 1
  for (const item of arr) {
    imageOrArr.push({ name: item.fieldname + '_' + n })
    imageResult.push({ name: item.fieldname + '_' + n, image_url: 'Uploads/' + item.filename })
    imageValsNew.push([item.fieldname + '_' + n, 'Uploads/' + item.filename, itemId])
    n++
  }
  const imgFromDB = await viewAllImage(itemId, imageOrArr)
  imgFromDB.length && imgFromDB.forEach(imgData => fs.unlinkSync(process.env.PUBLIC_UPLOAD_FOLDER + imgData.image_url))
  imageValsNew.splice(0, imgFromDB.length)
  const i = 0
  for (const item of imgFromDB) {
    const dateNow = new Date().toISOString().slice(0, 19).replace('T', ' ')
    console.log(dateNow)
    imageValsUpdate.push([arr[i].fieldname, 'Uploads/' + arr[i].filename, item.id, dateNow])
    n++
  }
  return { imageKeysUpdate, imageValsUpdate: [imageValsUpdate], imageKeysNew, imageValsNew: [imageValsNew], imageResult }
}
