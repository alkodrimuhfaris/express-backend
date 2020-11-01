const jwt = require('jsonwebtoken')
const {
  getUserByCredential,
  createUserModel,
  getUserIDbyEmail
} = require('../models/users')

const { userValidate } = require('../helpers/joiControllerForm')
const responseStandard = require('../helpers/response')
const bcrypt = require('bcryptjs')
const joi = require('joi')

module.exports = {
  loginController: async (req, res) => {
    const {
      email,
      password
    } = req.body
    const credentials = {
      email, password
    }
    const { role_id } = req.params
    let paramsRole = 0
    try {
      const data = await getUserByCredential(credentials)
      if (role_id === 'customer') paramsRole = 4
      else if (role_id === 'seller') paramsRole = 3
      if (data[0]) {
        if (paramsRole !== data[0].role_id) return responseStandard(res, 'Please select the right role!', {}, 400, false)
        const passCheck = await bcrypt.compare(credentials.password, data[0].password)
        console.log(passCheck)
        if (passCheck) {
          jwt.sign({
            id: data[0].id,
            role_id: data[0].role_id,
            login_as: data[0].role_id
          }, process.env.APP_KEY, (err, token) => {
            if (err) {
              return responseStandard(res, err.message, {}, 400, false)
            }
            console.log(token)
            return responseStandard(res, 'login Success!', { token })
          })
        } else {
          return responseStandard(res, 'Wrong Password!', {}, 400, false)
        }
      } else {
        return responseStandard(res, 'The email you input is invalid', {}, 400, false)
      }
    } catch (err) {
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  adminController: async (req, res) => {
    let { id, role_id, adminId } = req.user
    console.log(adminId)
    adminId && (adminId = id)
    console.log(adminId)
    if (role_id === 1 | 2) {
      const schema = joi.object({
        email: joi.string().required()
      })
      const { value: credentials, error } = schema.validate(req.body)
      if (error) {
        return responseStandard(res, error.message, {}, 401, false)
      } else {
        const userData = await getUserIDbyEmail(credentials)
        if (userData[0]) {
          const { id, name } = userData[0]
          console.log(userData[0].role_id)
          jwt.sign({
            id,
            role_id,
            login_as: userData[0].role_id,
            adminId
          }, process.env.APP_KEY, (err, token) => {
            if (err) {
              return responseStandard(res, err.message, {}, 400, false)
            }
            console.log(token)
            console.log(req.user)
            const msg = `Admin login to edit user: ${name} with id ${id} is success!`
            return responseStandard(res, msg, { token })
          })
        } else {
          return responseStandard(res, 'The email you input is invalid', {}, 400, false)
        }
      }
    } else {
      return responseStandard(res, 'Forbidden access', {}, 403, false)
    }
  },
  signupController: async (req, res) => {
    let { role_id } = req.params
    if (role_id === 'customer') { role_id = 4 } else if (role_id === 'seller') { role_id = 3 } else { return responseStandard(res, 'Forbidden input!', {}, 500, false) }
    try {
      const form = await userValidate(req.body, role_id)
      console.log(form)
      const [userCredentials, userDetails] = form
      Object.assign(userDetails, { login: true, role_id })
      console.log(userCredentials)
      Object.assign(userCredentials, { role_id })
      const result = await createUserModel(userCredentials, userDetails, res)
      if (result.length) {
        delete userCredentials.password
        delete userDetails.login
        Object.assign(userCredentials, { id: result[0].insertId })
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
