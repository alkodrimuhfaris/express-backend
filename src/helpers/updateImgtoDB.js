const arrValSanitizer = require('./arrayValueSanitizer')
const {
  updateItemModel,
  viewItemsModel,
  viewAllImage
} = require('../models/items')
const fs = require('fs')
const responseStandard = require('./response')

module.exports = async (itemId, arr) => {
  let imageOrArr = []
  let imageResult = []
  let imageKeysUpdate = ['name', 'image_url', 'id', 'updated_at']
  let imageValsUpdate = []
  let imageKeysNew = ['name', 'image_url', 'item_id']
  let imageValsNew = []
  let n=1
  for (let item of arr){
    imageOrArr.push({name: item.fieldname+'_'+n})
    imageResult.push({name: item.fieldname+'_'+n, image_url:'Uploads/'+item.filename})
    imageValsNew.push([item.fieldname+'_'+n, 'Uploads/'+item.filename, itemId])
    n++
  }
  const imgFromDB = await viewAllImage(itemId, imageOrArr)
  imgFromDB.length && imgFromDB.forEach(imgData => fs.unlinkSync(process.env.PUBLIC_UPLOAD_FOLDER+imgData.image_url))
  imageValsNew.splice(0, imgFromDB.length)
  let i = 0
  for (let item of imgFromDB) {
    let dateNow = new Date().toISOString().slice(0, 19).replace('T', ' ')
    console.log(dateNow)
    imageValsUpdate.push([arr[i].fieldname, 'Uploads/'+arr[i].filename, item.id, dateNow])
    n++
  }
  return {imageKeysUpdate, imageValsUpdate:[imageValsUpdate], imageKeysNew, imageValsNew:[imageValsNew], imageResult}
}