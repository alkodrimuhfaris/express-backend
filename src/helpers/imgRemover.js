const { createItemModel } = require('../models/items')
const fs = require('fs')
const responseStandard = require('../helpers/response')

module.exports = (res, arr, del = 1) => {
	if (!arr) {
		return null
	} else {
	  if (arr.length) {
		  for (let item of arr) {
		  	del
		    ? item = item.destination+'/'+item.filename
		    : item = process.env.PUBLIC_UPLOAD_FOLDER+item.image_url
		    fs.unlinkSync(item)
			}
	  } else {
	  	arr && (arr = Object.values(arr).map(item => {
	  		        [item] = item
	  		        return item
	  		      }))
	  	arr = process.env.PUBLIC_UPLOAD_FOLDER+arr.filename
		  fs.unlinkSync(arr)
		}
	}
}