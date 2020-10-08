const qs = require('querystring')

module.exports = (params) => {
  if (Object.keys(params).length) {
    const newParams = Object.entries(params)
    Object.entries(params)
    .forEach( item => {
      let key = item[0]
      let val = item[1]
      if (typeof(val)==='object') {
        Object.entries(val).forEach( nestItem => {
          nestItem =[`${key}[${nestItem[0]}]`, nestItem[1]]
          newParams.push(nestItem)
        })
      } else {
        newParams.push(item)
      }
    })
    params = newParams.filter(item => {
      return typeof(item[1])!=='object'
    })
    console.log('params yang di-filter')
    console.log(params)

    let paramsObj = {}

    params.forEach(item => {
      Object.assign(paramsObj, {[item[0]]: item[1] })
    })
    params = paramsObj
    console.log('params yang di-object-kan')
    console.log(params)
    params = qs.stringify(params)
    return params
  } else {
    params = qs.stringify(params)
    return params
  }
}