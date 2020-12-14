const transactionModel = require('../models/transactions')
const transactionMerchants = require('../models/transactionMerchants')
const transactionDetails = require('../models/transactionDetails')

const responseStandard = require('../helpers/response')
const pagination = require('../helpers/pagination')

const joi = require('joi')

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
    const { id } = req.params
    const { id: user_id } = req.user
    if (!user_id) { return responseStandard(res, 'Forbidden Access!', {}, 403, false) }
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
  getAllMerchantTransactionById: async (req, res) => {
    const { id } = req.params
    const path = 'transaction/merchant/all' + id
    const { id: customer_id } = req.user
    if (!customer_id) { return responseStandard(res, 'Forbidden Access!', {}, 403, false) }
    const { page, limit } = req.query
    try {
      const merchantTransaction = await transactionModel.getAllMerchantTransaction(req.query, customer_id, id)
      const [{ count }] = await transactionModel.countAllMerchantTransaction(customer_id, id) || 0
      const pageInfo = pagination.paging(count, page, limit, path, req)
      if (!merchantTransaction.length) {
        return responseStandard(res, 'There is no item in the list', { pageInfo })
      }
      return responseStandard(res, 'Merchant Transaction on transaction id: ' + id, { merchantTransaction, pageInfo })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  getAllMerchantDetailTransactionById: async (req, res) => {
    const { id } = req.params
    const path = 'transaction/merchant/detail' + id
    const { id: customer_id } = req.user
    if (!customer_id) { return responseStandard(res, 'Forbidden Access!', {}, 403, false) }
    const { page, limit } = req.query
    try {
      const merchantTransaction = await transactionModel.getAllMerchantDetailTransaction(req.query, id)
      const [{ count }] = await transactionModel.countAllMerchantDetailTransaction(id) || 0
      const pageInfo = pagination.paging(count, page, limit, path, req)
      if (!merchantTransaction.length) {
        return responseStandard(res, 'There is no item in the list', { pageInfo })
      }
      return responseStandard(res, 'Merchant Transaction on transaction id: ' + id, { merchantTransaction, pageInfo })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  getDetailTransactionById: async (req, res) => {
    const { id } = req.params
    const { id: user_id } = req.user
    if (!user_id) { return responseStandard(res, 'Forbidden Access!', {}, 403, false) }
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
  },
  updateTransaction: async (req, res) => {
    const { id } = req.params
    const schema = joi.object({
      user_id: joi.number(),
      invoice: joi.string(),
      items_price: joi.number(),
      quantity: joi.number(),
      delivery_fee: joi.number(),
      additional_fee: joi.number(),
      total_price: joi.number(),
      status: joi.boolean()
    })
    const { value: data, error } = schema.validate(req.body)
    if (error) {
      console.log(error)
      return responseStandard(res, error.message, {}, 400, false)
    }
    try {
      const updateTrans = await transactionModel.updateTransaction(data, { id })
      if (!updateTrans.affectedRows) {
        return responseStandard(res, 'wrong id!', {}, 400, false)
      }
      Object.assign(data, { id })
      return responseStandard(res, 'success to update transaction', { results: data })
    } catch (error) {
      console.log(error)
      return responseStandard(res, error.message, {}, 400, false)
    }
  },
  deleteTransaction: async (req, res) => {
    const { id } = req.params
    try {
      const deleteTrans = await transactionModel.deleteTransaction({ id })
      if (!deleteTrans.affectedRows) {
        return responseStandard(res, 'wrong id!', {}, 400, false)
      }
      return responseStandard(res, 'success to delete transaction', {})
    } catch (error) {
      console.log(error)
      return responseStandard(res, error.message, {}, 400, false)
    }
  },
  updateTransactionMerchant: async (req, res) => {
    const { id } = req.params
    const schema = joi.object({
      invoice: joi.string(),
      customer_id: joi.number(),
      customer_name: joi.string(),
      seller_id: joi.number(),
      store_name: joi.string(),
      quantity: joi.number(),
      total_price: joi.number(),
      shipping_address: joi.string(),
      delivery_fee: joi.number(),
      courier: joi.string(),
      service_name: joi.string(),
      total_payment: joi.number()
    })
    const { value: data, error } = schema.validate(req.body)
    if (error) {
      console.log(error)
      return responseStandard(res, error.message, {}, 400, false)
    }
    try {
      const updateTrans = await transactionMerchants.updateTransaction(data, { id })
      if (!updateTrans.affectedRows) {
        return responseStandard(res, 'wrong id!', {}, 400, false)
      }
      Object.assign(data, { id })
      return responseStandard(res, 'success to update transaction merchant!', { results: data })
    } catch (error) {
      console.log(error)
      return responseStandard(res, error.message, {}, 400, false)
    }
  },
  deleteTransactionMerchant: async (req, res) => {
    const { id } = req.params
    try {
      const deleteTrans = await transactionMerchants.deleteTransaction({ id })
      if (!deleteTrans.affectedRows) {
        return responseStandard(res, 'wrong id!', {}, 400, false)
      }
      return responseStandard(res, 'success to delete transaction merchant!', {})
    } catch (error) {
      console.log(error)
      return responseStandard(res, error.message, {}, 400, false)
    }
  },
  updateTransactionDetail: async (req, res) => {
    const { id } = req.params
    const schema = joi.object({
      invoice: joi.string(),
      item_name: joi.string(),
      item_color: joi.string(),
      product_image: joi.string(),
      quantity: joi.number(),
      total_price: joi.number()
    })
    const { value: data, error } = schema.validate(req.body)
    if (error) {
      console.log(error)
      return responseStandard(res, error.message, {}, 400, false)
    }
    try {
      const updateTrans = await transactionDetails.updateTransaction(data, { id })
      if (!updateTrans.affectedRows) {
        return responseStandard(res, 'wrong id!', {}, 400, false)
      }
      Object.assign(data, { id })
      return responseStandard(res, 'success to update transaction details!', { results: data })
    } catch (error) {
      console.log(error)
      return responseStandard(res, error.message, {}, 400, false)
    }
  },
  deleteTransactionDetail: async (req, res) => {
    const { id } = req.params
    try {
      const deleteTrans = await transactionDetails.deleteTransaction({ id })
      if (!deleteTrans.affectedRows) {
        return responseStandard(res, 'wrong id!', {}, 400, false)
      }
      return responseStandard(res, 'success to delete transaction details!', {})
    } catch (error) {
      console.log(error)
      return responseStandard(res, error.message, {}, 400, false)
    }
  }
}
