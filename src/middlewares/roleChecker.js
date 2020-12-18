const responseStandart = require('../helpers/response')

module.exports = {
  paramsItemId: (req, res, next) => {
    let { id, item_id } = req.params
    if (!Number(id) || !Number(item_id)) {
      return responseStandart(res, 'id params must be a number!', {}, 403, false)
    }
    id = Number(id)
    item_id = Number(item_id)
    req.params.id = id
    req.params.item_id = item_id
    next()
  },
  paramsNumber: (req, res, next) => {
    let { id } = req.params
    if (!Number(id)) {
      return responseStandart(res, 'id params must be a number!', {}, 403, false)
    }
    id = Number(id)
    req.params.id = id
    next()
  },
  admin: (req, res, next) => {
    if (req.user.role_id === 1 || req.user.role_id === 2) {
      next()
    } else {
      return responseStandart(res, 'Forbidden access', {}, 403, false)
    }
  },
  seller: (req, res, next) => {
    if (req.user.role_id === 3 || req.user.role_id === 1 || req.user.role_id === 2) {
      next()
    } else {
      return responseStandart(res, 'Forbidden access', {}, 403, false)
    }
  },
  customer: (req, res, next) => {
    if (req.user.role_id === 4 || req.user.role_id === 1 || req.user.role_id === 2) {
      next()
    } else {
      return responseStandart(res, 'Forbidden access', {}, 403, false)
    }
  }
}
