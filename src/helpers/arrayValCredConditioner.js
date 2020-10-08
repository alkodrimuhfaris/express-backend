const sanitize = require('./dataSanitizer')

module.exports = (arrMain, arrSecondary )=> {
  let index = 0
  let roleIndex = arrSecondary.findIndex(item => {
  	return item==='role_id'
  })
  return arrMain = arrMain
  .map(item => {
  	if (index!==roleIndex){
  		item = `'${item}'`
  		return item 
  	} else {
	    item = Number(item) 
	    return item
  	}
  	index++
  })
}