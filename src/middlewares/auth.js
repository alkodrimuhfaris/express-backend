const jwt = require('jsonwebtoken')
const responseStandard = require('../helpers/response')

module.exports = async (req, res, next) => {
  const { authorization } = req.headers
  console.log(authorization)

  if (authorization && authorization.startsWith('Bearer ')) {
    const token = authorization.slice(7, authorization.length)
    try {
      console.log('jwt verify belum')
      req.user = jwt.verify(token, process.env.APP_KEY)
      console.log('jwt verify sudah')
      console.log(req.user)
      if (req.user) {
        return await next()
      } else {
        return responseStandard(res, 'Unauthorized', {}, 401, false)
      }
    } catch (err) {
      return responseStandard(res, err.message, {}, 500, false)
    }
  } else {
    return responseStandard(res, 'Forbidden access', {}, 403, false)
  }
}
