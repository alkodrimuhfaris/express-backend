module.exports = {
  features: (req, table, defSearch, defSort) => {
    const { search, sort } = req
    const searchKey = Object.keys(search)[0] || `${table}.${defSearch}`
    const searchValue = Object.values(search)[0] || ''
    const sortKey = Object.keys(sort)[0] || `${table}.${defSort}`
    let sortValue = Number(Object.values(sort)[0]) || 0
    !sortValue ? sortValue = 'ASC' : sortValue = 'DESC'
    return ({
      searchKey: searchKey,
      searchValue: searchValue,
      sortKey: sortKey,
      sortValue: sortValue
    })
  }
}
