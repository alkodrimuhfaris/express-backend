const transactionModel = require('../models/transaction')
const responseStandard = require('../helpers/response')
const pagination = require('../helpers/pagination')

module.exports = {
  getAllTransaction: async (req, res) => {
    const { id: user_id } = req.user
    const { page, limit } = req.query
    const path = 'transaction'
    if (!user_id) { return responseStandard(res, 'Forbidden Access!', {}, 403, false) }
    try {
      const transaction = await transactionModel.getAllTransaction(req, { user_id })
      const [{ count }] = await transactionModel.countAllTransaction({ user_id }) || 0
      const pageInfo = pagination.paging(count, page, limit, path, req)
      if (transaction.length) {
        return responseStandard(res, 'All transaction', { transaction, pageInfo })
      } else {
        return responseStandard(res, 'There is no item in the list', { pageInfo })
      }
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  getAllDetailTransaction: async (req, res) => {
    const { id: user_id } = req.user
    const { page, limit } = req.query
    const path = 'transaction/all/detail'
    if (!user_id) { return responseStandard(res, 'Forbidden Access!', {}, 403, false) }
    try {
      const transactionDetail = await transactionModel.getAllDetailTransaction(req, { customer_id: user_id })
      const [{ count }] = await transactionModel.countAllDetailTransaction({ customer_id: user_id }) || 0
      const pageInfo = pagination.paging(count, page, limit, path, req)
      if (transactionDetail.length) {
        return responseStandard(res, 'All transaction', { transactionDetail, pageInfo })
      } else {
        return responseStandard(res, 'There is no item in the list', { pageInfo })
      }
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  getTransactionById: async (req, res) => {
    let { id } = req.params
    const { id: user_id } = req.user
    if (!user_id) { return responseStandard(res, 'Forbidden Access!', {}, 403, false) }
    id = Number(id)
    try {
      const transaction = await transactionModel.getTransactionId(user_id, id)
      if (transaction.length) {
        return responseStandard(res, 'Transaction on id ' + id, { transaction })
      } else {
        return responseStandard(res, 'There is no item in the list')
      }
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  getDetailTransactionById: async (req, res) => {
    let { id } = req.params
    const { id: user_id } = req.user
    if (!user_id) { return responseStandard(res, 'Forbidden Access!', {}, 403, false) }
    id = Number(id)
    try {
      const transaction = await transactionModel.getDetailTransactionById(user_id, id)
      if (transaction.length) {
        return responseStandard(res, 'Detail transaction on id ' + id, { transaction })
      } else {
        return responseStandard(res, 'There is no item in the list')
      }
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  }
}
