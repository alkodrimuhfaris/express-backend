function features (req, defSearch, defSort) {
  const { search, sort } = req
  console.log(!search)
  console.log(!sort)
  let searchKey = ''
  let searchValue = ''
  let sortKey = ''
  let sortValue = 0
  !search ? searchKey = `${defSearch}` : searchKey = Object.keys(search)[0]
  !search ? searchValue = '' : searchValue = Object.values(search)[0]
  !sort ? sortKey = `${defSort}` : sortKey = Object.keys(sort)[0]
  !sort ? sortValue = 0 : sortValue = Number(Object.values(sort)[0])
  !sortValue ? sortValue = 'ASC' : sortValue = 'DESC'
  console.log(sortValue)
  console.log(sortKey)
  return ({
    searchKey: searchKey,
    searchValue: searchValue,
    sortKey: sortKey,
    sortValue: sortValue
  })
}

// const req = {
//   search: {name: 'aborigin'},
//   sort: {date_at: 0}
// }
// const table = 'items'

// const defSearch = 'name'
// const defSort = 'id'

// const result = features(req, table, defSearch, defSort)
// console.log(result.searchKey)

module.exports = features
