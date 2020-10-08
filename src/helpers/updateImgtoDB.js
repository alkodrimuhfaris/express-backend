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
  let n=0
  for (let item of arr){
    imageOrArr.push({name: item.fieldname+'_'+n})
    imageResult.push({name: item.fieldname+'_'+n, image_url:item.destination+'/'+item.filename})
    imageValsNew.push([item.fieldname+'_'+n, item.destination+'/'+item.filename, itemId])
    n++
  }
  const imgFromDB = await viewAllImage(itemId, imageOrArr)
  imgFromDB.length && imgFromDB.forEach(imgData => fs.unlinkSync(imgData.image_url))
  imageValsNew.splice(0, imgFromDB.length)
  let i = 0
  for (let item of imgFromDB) {
    imageValsUpdate.push([arr[i].fieldname, arr[i].destination+'/'+arr[i].filename, item.id, Date.now()])
    n++
  }
  return {imageKeysUpdate, imageValsUpdate:[imageValsUpdate], imageKeysNew, imageValsNew:[imageValsNew], imageResult}
}