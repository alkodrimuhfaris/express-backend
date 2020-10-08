const sanitize = require('./dataSanitizer')

module.exports = (arrMain, arrSecondary=[] )=> {
  let index = 0
  let passIndex = arrSecondary.findIndex(item => {
  	return item==='password'
  })
  return arrMain = arrMain
  .filter(item => {
    (typeof(item) === 'string') ? item = item.trim() : item = true
    return item
  })
  .map(item => {
  	if (index===passIndex){
  		item = `'${sanitize(item)}'`
  		return item 
  	} else {
	    (Number(item) > 0)
	    ? item = Number(item) 
	    : item = `'${sanitize(item)}'`
	    return item
  	}
  	index++
  })
}