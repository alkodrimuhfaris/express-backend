const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { userValidate } = require('../helpers/joiControllerForm')
const joi = require('joi')
const bcrypt = require('bcryptjs')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

const users = require('../models/users')
const userDetails = require('../models/userDetails')

const pagination = require('../helpers/pagination')
const response = require('../helpers/response')

module.exports = {
  viewAllUsers: async (req, res) => {
    const { limit, page } = req.query
    const path = 'users/admin/all'
    try {
      const { results, count } = users.getUserWithDetail({}, req.query)
      const { pageInfo } = pagination.paging(count, page, limit, path, req)
      return response(res, 'list of all users', { results, pageInfo })
    } catch (err) {
      console.log(err)
      return response(res, err.message, {}, 500, false)
    }
  },
  updateUser: async (req, res) => {
    const { id: user_id, role_id } = req.user
    const avatar = req.file ? 'Uploads/' + req.file.filename : null
    if (req.body.avatar) {
      delete req.body.avatar
    }
    try {
      const [userCredential, userDetail] = await userValidate(req.body, role_id, 'patch')
      avatar && Object.assign(userDetail, { avatar })
      if (Object.keys(userCredential).length) {
        await users.updateUser(userCredential, { id: user_id })
      }
      if (Object.keys(userDetail).length) {
        await userDetails.updateUserDetails(userDetail, { user_id })
      }
      return response(res, 'success update profile', { data: { ...userCredential, ...userDetail } })
    } catch (err) {
      console.log(err)
      return response(res, err.message, {}, 500, false)
    }
  },
  deleteUser: async (req, res) => {
    const { id: user_id } = req.user
    try {
      await users.deleteUser({ id: user_id })
      return response(res, 'success delete account', {})
    } catch (err) {
      console.log(err)
      return response(res, err.message, {}, 500, false)
    }
  },
  getUser: async (req, res) => {
    const { id: user_id } = req.user
    try {
      const { results } = await users.getUserWithDetail({ id: user_id })
      const [result] = results
      delete result.password
      return response(res, 'success get account', { results: result })
    } catch (err) {
      console.log(err)
      console.log('error goes here')
      return response(res, err.message, {}, 500, false)
    }
  },
  getUserById: async (req, res) => {
    const { id: user_id } = req.params
    try {
      const { results } = await users.getUserWithDetail({ id: user_id })
      const [result] = results
      delete result.password
      return response(res, 'success get profile from id: ' + user_id, { results })
    } catch (err) {
      console.log(err)
      return response(res, err.message, {}, 500, false)
    }
  },
  topUpBalance: async (req, res) => {
    const { id } = req.user
    let { nominal } = req.body
    if (!Number(nominal)) {
      return response(res, 'Input the right nominal!', {}, 400, false)
    }
    nominal = Number(nominal)
    try {
      let [{ balance }] = await users.getuser({ id })
      balance = balance + nominal
      const updateBal = await users.updateUser({ balance }, { id })
      if (!updateBal.affectedRows) {
        return response(res, 'internal server error', {}, 500, false)
      }
      return response(res, 'balance updated!', { balance })
    } catch (err) {
      console.log(err)
      return response(res, err.message, {}, 403, false)
    }
  },
  changePassword: async (req, res) => {
    const { id: user_id } = req.user
    const schema = joi.object({
      oldPassword: joi.string().required(),
      newPassword: joi.string().required(),
      confirmNewPassword: joi.string().required().valid(joi.ref('newPassword'))
    })
    const { value: credentials, error } = schema.validate(req.body)
    if (error) {
      return response(res, 'Error', { error: error.message }, 400, false)
    }
    try {
      let { oldPassword, newPassword } = credentials

      const data = await users.getuser({ id: user_id })
      if (!data.length) {
        return response(res, 'Forbidden Access!', {}, 403, false)
      }
      const passCheck = await bcrypt.compare(oldPassword, data[0].password)
      if (!passCheck) {
        return response(res, 'Your current password is wrong!', {}, 400, false)
      }
      newPassword = await bcrypt.hash(newPassword, 10)
      const patchPassword = await users.updateUser({ password: newPassword }, { id: user_id })
      if (!patchPassword.affectedRows) {
        return response(res, 'Update password failed!', {}, 500, false)
      }
      return response(res, 'Password updated!', {}, 200, true)
    } catch (err) {
      console.log(err)
      return response(res, err.message, {}, 500, false)
    }
  },
  deleteAvatar: async (req, res) => {
    const { id: user_id } = req.user
    const delAva = await users.updateUser({ avatar: null }, { user_id }, 'user_details')
    try {
      if (!delAva.affectedRows) {
        return response(res, 'Delete avatar failed!', {}, 500, false)
      }
      return response(res, 'Success delete avatar!', {})
    } catch (err) {
      console.log(err)
      return response(res, err.message, {}, 500, false)
    }
  }
}
