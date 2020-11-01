module.exports = (query) => {
  let { search, sort, date, price, data = {} } = query
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
    ? date.map((item, i) => {
        item = !item
          ? ''
          : (i === 0)
              ? `created_at >= "${item}"`
              : `created_at <= "${item}"`
        return item
      }).filter(item => item).join(' AND ')
    : ''

  // filter price query
  price = price
    ? price.map((item, i) => {
        item = !item
          ? ''
          : (i === 0)
              ? `price >= ${Number(item)}`
              : `price <= ${Number(item)}`
        return item
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
