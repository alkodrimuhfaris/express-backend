function features (req, defSearch, defSort) {
  const { search, sort, dateFrom, dateTo } = req
  console.log(!search)
  console.log(!sort)
  console.log(defSearch)
  console.log('dateFrom :'+!dateFrom)
  console.log('dateTo :'+!dateTo)
  let and =[]
  let searchKey = ''
  let searchValue = ''
  let sortKey = ''
  let sortValue = 0
  !search ? searchKey = `${defSearch}` : searchKey = Object.keys(search)[0]
  !search ? searchValue = '' : searchValue = Object.values(search)[0]
  !sort ? sortKey = `${defSort}` : sortKey = Object.keys(sort)[0]
  !sort ? sortValue = 0 : sortValue = Number(Object.values(sort)[0])
  !sortValue ? sortValue = 'DESC' : sortValue = 'ASC'
  if (dateFrom) {
    !dateFrom.val ? and[0] = `` : and[0] = `and ${dateFrom.key} >= ${dateFrom.val}`
    !dateTo.val ? and[1] = `` : and[1] = `and ${dateTo.key} <= ${dateTo.val}`
  }
  and = and.join(' ')
  console.log(and)
  console.log(sortValue)
  console.log(sortKey)
  console.log(searchKey)
  return ({
    and: and,
    searchKey: searchKey,
    searchValue: searchValue,
    sortKey: sortKey,
    sortValue: sortValue
  })
}


module.exports = features
