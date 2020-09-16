const qs = require('querystring')

module.exports = {
  paging: (count = 0, page = 1, limit = 5, tables, req) => {
    Number(limit) && limit > 0 ? limit = Number(limit) : limit = 5
    Number(page) && page > 0 ? page = Number(page) : page = 1
    const pages = Math.ceil(count / limit) || 1
    let nextLink = null
    let prefLink = null
    if (page < pages) {
      nextLink = `http://localhost:8080/${tables}?${qs.stringify({ ...req.query, ...{ page: page + 1 } })}`
    }
    if (page > 1) {
      prefLink = `http://localhost:8080/${tables}?${qs.stringify({ ...req.query, ...{ page: page - 1 } })}`
    }
    const pageInfo = {
      count: count,
      pages: pages,
      currentPage: page,
      dataPerPage: limit,
      nextLink: nextLink,
      prefLink: prefLink
    }
    return (
      {
        pageInfo: pageInfo
      }
    )
  },
  pagePrep: (req) => {
    let { page, limit } = req
    Number(limit) && limit > 0 ? limit = Number(limit) : limit = 5
    Number(page) && page > 0 ? page = Number(page) : page = 1
    const offset = (page - 1) * limit
    return ({
      page: page,
      limit: limit,
      offset: offset
    })
  }
}
