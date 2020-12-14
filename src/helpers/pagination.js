const stringify = require('./stringifyObj')

module.exports = {
  paging: (count = 0, page = 1, limit = 5, tables, req) => {
    let pages = 1
    if (limit === '-') {
      page = 1
    } else {
      Number(limit) && (limit > 0) ? limit = Number(limit) : limit = 5
      Number(page) && (page > 0) ? page = Number(page) : page = 1
      pages = Math.ceil(count / limit) || 1
    }
    let nextLink = null
    let prefLink = null
    if (page < pages) {
      nextLink = process.env.APP_URL + tables + '?' + stringify({ ...req.query, ...{ page: page + 1 } })
    }
    if (page > 1) {
      prefLink = process.env.APP_URL + tables + '?' + stringify({ ...req.query, ...{ page: page - 1 } })
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
      pageInfo
    )
  },
  pagePrep: (req) => {
    let { page = 1, limit = 5 } = req
    let offset = 0
    let limiter = ''
    if (limit === '-') {
      page = 1
    } else {
      Number(limit) && limit > 0 ? limit = Number(limit) : limit = 5
      Number(page) && page > 0 ? page = Number(page) : page = 1
      offset = (page - 1) * limit
      limiter = `LIMIT ${offset}, ${limit}`
    }
    return ({
      page: page,
      limit: limit,
      offset: offset,
      limiter: limiter
    })
  }
}
