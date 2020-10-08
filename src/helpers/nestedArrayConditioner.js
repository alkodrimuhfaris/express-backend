const sanitize = require('./dataSanitizer')

module.exports = (data) => {
	return data = 
	data.map(item => {
	  item[1] = sanitize(item[1])
	  (Number(item[1]) > 0)
	    ? item = `${item[0]}=${Number(item[1])}` 
	    : item = `${item[0]}='${item[1]}'`
	  return item
	})
}
