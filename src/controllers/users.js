const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const sanitize = require('../helpers/dataSanitizer')
const responseStandard = require('../helpers/response')
const fs = require('fs')
const { userValidate } = require('../helpers/joiControllerForm')
const joi = require('joi')
const bcrypt = require('bcryptjs')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

const {
  viewAllUsersModel,
  viewCountAllUsersModel,
  updateUserModel,
  deleteUserModel,
  getUserModelNew,
  getUserModelByCred,
  getUserBalance,
  updateBalance,
  changePassword
} = require('../models/users')

const pagination = require('../helpers/pagination')
const features = require('../helpers/features')

module.exports = {
  viewUsers: async (req, res) => {
    const { role_id } = req.user
    if (role_id === 2 || role_id === 1) {
      const defSearch = 'name'
      const defSort = 'created_at'
      try {
        const { searchKey, searchValue, sortKey, sortValue, and } = features(req.query, defSearch, defSort)
        const { page, limit, limiter } = pagination.pagePrep(req.query)
        const viewArray = [searchKey, searchValue, sortKey, sortValue, limiter, and]
        const result = await viewAllUsersModel(...viewArray, [])
        console.log('try : ' + searchKey)
        const [{ count }] = await viewCountAllUsersModel(searchKey, searchValue, and) || 0
        const paginationArray = [count, page, limit, 'all', req]
        const pageInfo = pagination.paging(...paginationArray)
        if (result.length) {
          return responseStandard(res, 'List of users', { ...{ data: result }, ...{ pageInfo } })
        } else {
          return responseStandard(res, 'There is no users in the list', pageInfo, 400, false)
        }
      } catch (err) {
        return responseStandard(res, err.message, {}, 500, false)
      }
    } else {
      return responseStandard(res, 'Forbidden Access', {}, 403, false)
    }
  },
  getDetailUser: async (req, res) => {
    const { id: user_id, role_id } = req.user
    if (role_id === 4 || role_id === 3 || role_id === 2 || role_id === 1) {
      try {
        const result = await getUserModelNew({ id: user_id }, role_id, [])
        console.log('this is the try')
        console.log(result)
        if (result[0]) {
          delete result[0].password
          return responseStandard(res, 'Get user from id = ' + user_id + ' is success', { choosenData: result[0] })
        } else {
          return responseStandard(res, 'User ID is invalid!', {}, 400, false)
        }
      } catch (err) {
        return responseStandard(res, err.message, {}, 500, false)
      }
    } else {
      return responseStandard(res, 'Forbidden Access', {}, 403, false)
    }
  },
  updateUser: requires => {
    return async (req, res) => {
      console.log(req.user)
      const { id: user_id, login_as, role_id } = req.user
      console.log(login_as)
      let imgKey = ''
      let imgVal = ''
      const avatar = ''
      if (req.file) {
        imgKey = req.file.fieldname
        imgVal = sanitize('Uploads/' + req.file.filename)
      }
      try {
        if (role_id === 4 || role_id === 3 || role_id === 2 || role_id === 1) {
          const form = await userValidate(req.body, login_as, requires)
          console.log('Before avatar is called')
          const [{ avatar }] = await getUserModelNew({ user_id }, role_id, [])
          console.log(form)
          imgVal && Object.assign(form[1], { [imgKey]: imgVal })
          const queries = [
            [form[0], { id: user_id }],
            [form[1], { user_id: user_id }]
          ]
          console.log(queries)
          const results = await updateUserModel(queries)
          if (results.length) {
            (imgVal && avatar) && fs.unlinkSync(process.env.PUBLIC_UPLOAD_FOLDER + avatar)
            return responseStandard(res, 'user on id: ' + user_id + ' has been updated', { data: { ...form[0], ...form[1] } }, 201)
          }
        } else {
          (imgVal && avatar) && fs.unlinkSync(process.env.PUBLIC_UPLOAD_FOLDER + imgVal)
          return responseStandard(res, 'Forbidden Access!', {}, 403, false)
        }
      } catch (err) {
        (imgVal && avatar) && fs.unlinkSync(process.env.PUBLIC_UPLOAD_FOLDER + imgVal)
        console.log(err)
        return responseStandard(res, err.message, {}, 500, false)
      }
    }
  },
  deleteUser: async (req, res) => {
    const { id: user_id, role_id } = req.user
    if (role_id === 4 || role_id === 3 || role_id === 2 || role_id === 1) {
      try {
        const data = await getUserModelByCred({ user_id }, 'user_details')
        if (!data.length) {
          const result = await deleteUserModel(user_id)
          console.log(result)
          if (result.affectedRows) {
            Boolean(data[0].avatar) && fs.unlinkSync(process.env.PUBLIC_UPLOAD_FOLDER + data[0].avatar)
            return responseStandard(res, 'user on id: ' + user_id + ' has been deleted', {})
          } else {
            return responseStandard(res, 'The id you choose is invalid', {}, 400, false)
          }
        } else {
          return responseStandard(res, 'user id is invalid!', {}, 403, false)
        }
      } catch (err) {
        return responseStandard(res, err.message, {}, 500, false)
      }
    } else {
      return responseStandard(res, 'Forbidden Access!', {}, 403, false)
    }
  },
  topUpBalance: async (req, res) => {
    const { id } = req.user
    let { nominal } = req.body
    if (!Number(nominal)) { return responseStandard(res, 'Input the right nominal!', {}, 400, false) }
    nominal = Number(nominal)
    try {
      let [{ balance }] = await getUserBalance({ id })
      balance = balance + nominal
      const updateBal = await updateBalance({ id }, { balance })
      if (updateBal.affectedRows) {
        return responseStandard(res, 'balance updated!', { balance })
      } else {
        return responseStandard(res, 'internal server error', {}, 500, false)
      }
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 403, false)
    }
  },
  changePassword: async (req, res) => {
    const { id: user_id } = req.user
    if (!user_id) { return responseStandard(res, 'Forbidden Access!', {}, 403, false) }

    const schema = joi.object({
      oldPassword: joi.string().required(),
      newPassword: joi.string().required(),
      confirmNewPassword: joi.string().required().valid(joi.ref('newPassword'))
    })
    const { value: credentials, error } = schema.validate(req.body)
    if (error) { return responseStandard(res, 'Error', { error: error.message }, 400, false) }

    try {
      let { oldPassword, newPassword } = credentials

      const data = await getUserModelByCred({ id: user_id })
      if (!data.length) { return responseStandard(res, 'Forbidden Access!', {}, 403, false) }

      const passCheck = await bcrypt.compare(oldPassword, data[0].password)
      if (!passCheck) { return responseStandard(res, 'Your current password is wrong!', {}, 400, false) }

      newPassword = await bcrypt.hash(newPassword, 10)

      const patchPassword = await changePassword({ password: newPassword }, { id: user_id })
      if (patchPassword.affectedRows) {
        return responseStandard(res, 'Password updated!', {}, 200, true)
      } else {
        return responseStandard(res, 'Update password failed!', {}, 200, true)
      }
    } catch (err) {
      return responseStandard(res, err, {}, 500, false)
    }
  }
}
