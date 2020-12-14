module.exports = (query) => {
  let { search = {}, sort = { created_at: 'DESC' }, date = {}, price = {}, data = {} } = query
  let dataArr = []
  const prepStatement = []
  for (const prop in data) {
    dataArr.push(`${prop} = ?`)
    prepStatement.push(data[prop])
  }
  dataArr = dataArr.filter(item => item).map(item => `(${item})`).join(' AND ')

  search = search ? Object.entries(search) : []
  sort = sort ? Object.entries(sort) : [['created_at', 'DESC']]

  // search query
  let searchArr = []
  for (let [key, value] of search) {
    key = (key && value) ? `${key} LIKE "%${value}%"` : ''
    searchArr.push(key)
  }
  searchArr = searchArr.filter(item => item).map(item => `(${item})`).join(' AND ')

  // filter date query
  date = date
    ? Object.entries(date).map(([key, value]) => {
        key = !(key && value)
          ? ''
          : key === 'before'
            ? `created_at <= "${value}"`
            : key === 'after'
              ? `created_at >= "${value}"`
              : ''
        return key
      }).filter(item => item).join(' AND ')
    : ''

  // filter price query
  price = price
    ? Object.entries(price).map(([key, value]) => {
        key = !(key && value)
          ? ''
          : key === 'min'
            ? `price >= "${Number(value)}"`
            : key === 'max'
              ? `price <= "${Number(value)}"`
              : ''
        return key
      }).filter(item => item).join(' AND ')
    : ''

  // order feature
  const orderArr = []
  for (let [key, value] of sort) {
    key = (key && value) ? `${key} ${value}` : ''
    orderArr.push(key)
  }

  return ({
    searchArr,
    date,
    price,
    orderArr,
    dataArr,
    prepStatement
  })
}
