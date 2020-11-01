module.exports = (req) => {
  let { search, sort, date = [null, null], price = [null, null] } = req
  search = Object.keys(search).length ? Object.entries(search) : []
  sort = Object.keys(sort).length ? Object.entries(sort) : []
  return ({
    search,
    sort,
    date,
    price
  })
}
