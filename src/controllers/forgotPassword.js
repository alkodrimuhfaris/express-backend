const myEmail = require('../helpers/sendMail')

const { v4: uuidv4 } = require('uuid')

const responseStandard = require('../helpers/response')
const forgotPasswordModel = require('../models/forgotPassword')
const userModel = require('../models/users')
const joi = require('joi')
const bcrypt = require('bcryptjs')

module.exports = {
  resetPassword: async (req, res) => {
    const { email } = req.body

    const check = await userModel.checkUserExist({ email })
    let resetcode = check.length ? uuidv4() : ''
    resetcode = resetcode.slice(resetcode.length - 8).toUpperCase()

    try {
      const result = await myEmail.mailHelper([email, resetcode])

      if (result.rejected.length === 0) {
        const update = await forgotPasswordModel.createResetCode({ reset_code: resetcode }, { email })
        if (update.affectedRows) {
          return responseStandard(res, 'Success to send reset email')
        } else {
          return responseStandard(res, 'Internal Server Error', 500)
        }
      }
    } catch (e) {
      console.log(e)
      return responseStandard(res, e.message, 500)
    }
  },
  matchResetCode: async (req, res) => {
    const schema = joi.object({
      email: joi.string().email().required(),
      resetcode: joi.string().required(),
      newPassword: joi.string().required(),
      confirmNewPassword: joi.string().required().valid(joi.ref('newPassword'))
    })
    const { value: credentials, error } = schema.validate(req.body)
    if (error) { return responseStandard(res, 'Error', { error: error.message }, 400, false) }

    try {
      let { resetcode, email, newPassword } = credentials
      if (!resetcode) { return responseStandard(res, 'Please input reset code!', {}, 400, false) }

      newPassword = await bcrypt.hash(newPassword, 10)

      const userData = await userModel.checkUserExist({ email })
      if (!userData.length) { return responseStandard(res, 'User not found', {}, 400, false) }

      const [{ reset_code, id }] = userData
      if (!reset_code || reset_code !== resetcode) { return responseStandard(res, 'Reset Code doesnt match', {}, 400, false) }

      const update = await forgotPasswordModel.createResetCode({ reset_code: null }, { email })
      if (!update.affectedRows) { return responseStandard(res, 'Reset code failed', {}, 400, false) }

      const patchPassword = await forgotPasswordModel.changePassword({ password: newPassword }, { id })
      if (patchPassword.affectedRows) {
        return responseStandard(res, 'Reset password succeed!', {}, 200, true)
      } else {
        return responseStandard(res, 'Reset password failed!', {}, 200, true)
      }
    } catch (err) {
      return responseStandard(res, err, {}, 500, false)
    }
  }
}
