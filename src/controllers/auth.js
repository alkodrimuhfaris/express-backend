const jwt = require('jsonwebtoken')
const user = require('../models/users')
const userDetails = require('../models/userDetails')

const { userValidate } = require('../helpers/joiControllerForm')
const responseStandard = require('../helpers/response')
const bcrypt = require('bcryptjs')

module.exports = {
  loginController: async (req, res) => {
    const {
      email,
      password
    } = req.body
    const credentials = {
      email, password
    }
    let { role_id } = req.params
    role_id = role_id === 'customer'
      ? 4
      : role_id === 'seller'
        ? 3
        : null
    if (!role_id) {
      return responseStandard(res, 'Forbidden role!', {}, 400, false)
    }
    try {
      const data = await user.getuser({ email: credentials.email })

      // checking is there any user data with email
      if (!data[0]) {
        return responseStandard(res, 'The email you input is invalid', {}, 400, false)
      }

      // checking the role for login
      if (role_id !== data[0].role_id) {
        return responseStandard(res, 'Please select the right role!', {}, 400, false)
      }

      // comparing password with bcrypt
      const passCheck = await bcrypt.compare(credentials.password, data[0].password)

      // checking password
      if (!passCheck) {
        return responseStandard(res, 'Wrong Password!', {}, 400, false)
      }

      // jwt sign
      jwt.sign({
        id: data[0].id,
        role_id: data[0].role_id
      }, process.env.APP_KEY, (err, token) => {
        if (err) {
          return responseStandard(res, err.message, {}, 400, false)
        }
        console.log(token)
        return responseStandard(res, 'login Success!', { token })
      })
    } catch (err) {
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  signupController: async (req, res) => {
    let { role_id } = req.params
    role_id = role_id === 'customer'
      ? 4
      : role_id === 'seller'
        ? 3
        : null
    if (!role_id) {
      return responseStandard(res, 'Forbidden role!', {}, 400, false)
    }
    try {
      const form = await userValidate(req.body, role_id)
      console.log(form)

      // get validation from helpers
      const [userCredentials, userDetail] = form

      // create user
      const results = await user.createUser(userCredentials)

      // add user_id for user detail
      Object.assign(userDetail, { user_id: results[0].insertId })

      // add user detail to database
      const userDetailResults = await userDetails.createUserDetails(userDetail)
      if (results.length && userDetailResults.length) {
        delete userCredentials.password
        delete userDetails.login
        Object.assign(userCredentials, { id: results[0].insertId })
        return responseStandard(res, 'user has been created', { data: { ...userCredentials, ...userDetails } }, 201)
      } else {
        return responseStandard(res, 'Internal server error', {}, 500, false)
      }
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  }
}
