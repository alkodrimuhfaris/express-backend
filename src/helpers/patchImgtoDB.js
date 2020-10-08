const arrValSanitizer = require('./arrayValueSanitizer')
const {
  updateItemModel
} = require('../models/items')

module.exports = async (id, arr, id) => {
  const colImgKey = ['item_id', 'image_type', 'image_url']
  let colImgVal = [id]
  const data = {}
  if (!arr.fieldname) {
    arr.forEach( async (item,n) => {
	  	n++
	    colImgVal[1] = item.fieldname+'_'+n
	    console.log(colImgVal[1])
	    colImgVal[2] = item.destination+'/'+item.filename
      const where = `id = ${id} AND image_url = '${colImgVal[2]}'`
    	colImgVal =  arrValSanitizer(colImgVal)
      let i = 1
      colImgKey.forEach(item => {
        Object.entries(data, {[item]: colImgVal[i]})
        i++
      })
	    const result = await updateItemModel(data, where, 'item_images')
	    console.log(result)
	    console.log(n)
	  })
  }
}