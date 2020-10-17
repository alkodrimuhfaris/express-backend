const arrValSanitizer = require('./arrayValueSanitizer')
const {
  createItemImgModel
} = require('../models/items')

module.exports = (arr) => {
  const colImgKey = ['name', 'image_url', 'item_id']
  let img = {}
  let imgArrVal = []
  let angka = []
  if (!arr.fieldname) {
	  let n = 1
	  for (let item of arr){
      Object.assign(img, {[item.fieldname+'_'+n]: 'Uploads/'+item.filename})
      imgArrVal.push([item.fieldname+'_'+n, 'Uploads/'+item.filename])
      angka.push(n)
      console.log(imgArrVal)
      console.log(angka)
      n++
	  }
    let data = [imgArrVal]
    console.log(data)
    console.log('INI DATA DARI IMAGE TO DB')
    console.log(data)
    // const result = await createItemImgModel(data, 'item_images')
    // console.log(result)
    // console.log(n)
    return data = {imagePrep: data, imgData: img, keys: colImgKey}
  } else {
  	Object.assign(img, {[arr.fieldname]: 'Uploads/'+arr.filename})
    let data = [[arr.fieldname, 'Uploads/'+arr.filename]]
    // const result = await createItemImgModel(data, 'item_images')
    // console.log(result)
    return data = {imagePrep: data, imgData: img}
  }
}