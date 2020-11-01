const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const axios = require('axios')
const responseStandard = require('../helpers/response')
const joi = require('joi')
const arrayCheckout = require('../helpers/arrayCheckout')

const { v4: uuidv4 } = require('uuid')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

const addressModel = require('../models/address')

const itemModel = require('../models/items')

const usersModel = require('../models/users')

const transactionModel = require('../models/transaction')

module.exports = {
  getSellerArr: async (req, res) => {
    const { id: user_id } = req.user
    if (!user_id) { return responseStandard(res, 'Forbidden Access!', {}, 403, false) }
    try {
      const carts = joi.object({
        itemdetails_id: joi.array().items(joi.number().required())
      })
      const { value: checkoutData, error } = carts.validate(req.query)
      if (error) { return responseStandard(res, error.message, {}, 400, false) }

      const { itemdetails_id } = checkoutData

      let sellerArr = []
      for (const item of itemdetails_id) {
        // get item detail
        const [itemDetail] = await itemModel.getBookingItem(item)
        const { seller_id } = itemDetail

        sellerArr.push(seller_id)
      }

      sellerArr = [...new Set(sellerArr)]
      console.log(sellerArr.length)
      const sellerArrLength = sellerArr.length
      const courierArr = Array.apply(null, Array(sellerArrLength))
      const serviceArr = [...courierArr]
      return responseStandard(res, 'Array of ', { courierArr, serviceArr })
    } catch (error) {
      console.log(error)
      return responseStandard(res, error.message, {}, 400, false)
    }
  },
  getCheckout: async (req, res) => {
    const { id: user_id } = req.user
    if (!user_id) { return responseStandard(res, 'Forbidden Access!', {}, 403, false) }
    try {
      const carts = joi.object({
        itemdetails_id: joi.array().items(joi.number().required()),
        quantity: joi.array().items(joi.number().required()),
        couriers: joi.array().items(joi.string()),
        services: joi.array().items(joi.number()),
        address_id: joi.number()
      })
      const { value: checkoutData, error } = carts.validate(req.body)
      if (error) { return responseStandard(res, error.message, {}, 400, false) }

      const { itemdetails_id, quantity, address_id, couriers, services } = checkoutData

      const sellerArr = []
      const itemsArr = []
      for (const [index, item] of itemdetails_id.entries()) {
        // get item detail
        const [itemDetail] = await itemModel.getBookingItem(item)
        let { weight, seller_id } = itemDetail
        weight = weight * quantity[index]

        // get destination
        const [{ city_id: destination }] = address_id
          ? await addressModel.getCityId({ user_id }, { id: address_id })
          : await addressModel.getCityId({ user_id })

        // get origin
        const [{ city_id: origin }] = await addressModel.getSellerCityId({ item_details_id: item })

        sellerArr.push(seller_id)
        itemsArr.push({ ...itemDetail, quantity: quantity[index], weight, destination, origin })
      }

      const checkoutArr = arrayCheckout(sellerArr, itemsArr)

      for (const [index, item] of checkoutArr.entries()) {
        const courier = couriers ? couriers[index] : ''

        const service = services ? services[index] : 0

        const { destination, weight, origin } = item

        // get delivery fee by jne regional
        if (courier) {
          const { data } = await axios.post(process.env.URL_RAJAONGKIR_COST,
            { destination, origin, weight, courier },
            { headers: { key: process.env.API_KEY_RAJAONGKIR } })
          const { results } = data.rajaongkir
          console.log(results)
          const { service: service_name, cost } = results[0].costs[service]
          const [{ value: delivery_fee }] = cost
          checkoutArr[index].delivery_fee = delivery_fee
          checkoutArr[index].courier = courier
          checkoutArr[index].service_name = service_name
        } else {
          checkoutArr[index].delivery_fee = '-'
          checkoutArr[index].courier = ''
          checkoutArr[index].service_name = ''
        }
      }

      let prices = 0
      let delivery_fees = 0
      for (const item of checkoutArr) {
        prices += item.total_price
        delivery_fees = (item.delivery_fee !== '-') ? (delivery_fees + item.delivery_fee) : '-'
      }

      const bookingSummary = {
        prices,
        delivery_fees,
        total: (delivery_fees !== '-') ? (prices + delivery_fees) : 'choose courier and service!'
      }

      if (checkoutArr.length) {
        return responseStandard(res, 'Item checkout', { bookingSummary, bookingDetail: checkoutArr })
      } else {
        return responseStandard(res, 'gagal!', {}, 400, false)
      }
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 400, false)
    }
  },
  getDeliveryFee: async (req, res) => {
    const { id: user_id } = req.user
    if (!user_id) { return responseStandard(res, 'Forbidden Access!', {}, 403, false) }

    let { seller_id, address_id, weight } = req.query
    seller_id = Number(seller_id)
    weight = Number(weight)
    if (!seller_id || !weight) { return responseStandard(res, 'Seller id and weight must be defined as number!', {}, 400, false) }

    address_id = Number(address_id) ? Number(address_id) : 0

    try {
      // get origin
      const [{ city_id: origin }] = await addressModel.getCityId({ user_id: seller_id })

      // get destination
      const [{ city_id: destination }] = address_id
        ? await addressModel.getCityId({ user_id }, { id: address_id })
        : await addressModel.getCityId({ user_id })

      const couriers = ['jne', 'pos', 'tiki']

      const delivery_couriers = []
      for (const el of couriers) {
        const { data } = await axios.post(process.env.URL_RAJAONGKIR_COST,
          { destination, origin, weight, courier: el },
          { headers: { key: process.env.API_KEY_RAJAONGKIR } })
        const { results } = data.rajaongkir
        const [{ costs, code: courier }] = results
        const detailService = []
        console.log(costs)
        for (const [index, item] of costs.entries()) {
          console.log(item)
          const { cost: detailCosts, service } = item
          console.log(detailCosts)
          const [{ value: price, etd }] = detailCosts
          detailService.push({ service_id: index, service, price, etd })
        }
        delivery_couriers.push({ courier, detailService })
      }

      return responseStandard(res, 'Delivery fee', { delivery_couriers })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 400, false)
    }
  },
  processToPayment: async (req, res) => {
    const { id: user_id } = req.user
    if (!user_id) { return responseStandard(res, 'Forbidden Access!', {}, 403, false) }
    try {
      const carts = joi.object({
        itemdetails_id: joi.array().items(joi.number().required()),
        quantity: joi.array().items(joi.number().required()),
        couriers: joi.array().items(joi.string().required()),
        services: joi.array().items(joi.number().required()),
        payment_method: joi.string().required(),
        address_id: joi.number()
      })
      const { value: checkoutData, error } = carts.validate(req.body)
      if (error) { return responseStandard(res, error.message, {}, 400, false) }

      const { itemdetails_id, quantity, address_id, couriers, services, payment_method } = checkoutData

      const sellerArr = []
      const itemsArr = []
      const stockLow = []
      const stocks = []
      for (const [index, item] of itemdetails_id.entries()) {
        // get item detail
        const [itemDetail] = await itemModel.getBookingItem(item)
        let { weight, seller_id, name, color_name } = itemDetail
        weight = weight * quantity[index]

        const [{ stock }] = await itemModel.getDetailItem(item)
        stocks.push(stock)
        if (stock < quantity[index]) {
          const message = 'low stock on' + name + '(' + color_name + ')'
          stockLow.push({ message })
          continue
        }

        // get destination
        const [{ city_id: destination }] = address_id
          ? await addressModel.getCityId({ user_id }, { id: address_id })
          : await addressModel.getCityId({ user_id })

        // get origin
        const [{ city_id: origin }] = await addressModel.getSellerCityId({ item_details_id: item })

        sellerArr.push(seller_id)
        itemsArr.push({ ...itemDetail, quantity: quantity[index], weight, destination, origin })
      }

      if (stockLow.length) { return responseStandard(res, 'low stock on some item', { stockLow }, 400, false) }

      const checkoutArr = arrayCheckout(sellerArr, itemsArr)

      for (const [index, item] of checkoutArr.entries()) {
        const courier = couriers ? couriers[index] : ''

        const service = services ? services[index] : 0

        const { destination, weight, origin } = item

        // get delivery fee by jne regional
        if (courier) {
          const { data } = await axios.post(process.env.URL_RAJAONGKIR_COST,
            { destination, origin, weight, courier },
            { headers: { key: process.env.API_KEY_RAJAONGKIR } })
          const { results } = data.rajaongkir
          console.log(results)
          const { service: service_name, cost } = results[0].costs[service]
          const [{ value: delivery_fee }] = cost
          checkoutArr[index].delivery_fee = delivery_fee
          checkoutArr[index].courier = courier
          checkoutArr[index].service_name = service_name
        } else {
          checkoutArr[index].delivery_fee = '-'
          checkoutArr[index].courier = ''
          checkoutArr[index].service_name = ''
        }
      }

      let [{ address, city_type, city, postal_code }] = address_id
        ? await addressModel.getAddress({ user_id }, { id: address_id })
        : await addressModel.getAddress({ user_id })
      address = address + ', ' + city_type + city + ', postal code: ' + postal_code

      let prices = 0
      let delivery_fees = 0
      for (const item of checkoutArr) {
        prices += item.total_price
        delivery_fees = (item.delivery_fee !== '-') ? (delivery_fees + item.delivery_fee) : '-'
      }

      const bookingSummary = {
        prices,
        delivery_fees,
        total: (delivery_fees !== '-') ? (prices + delivery_fees) : 'choose courier and service!'
      }

      let status = false
      let msg2 = ''
      const { total } = bookingSummary
      let [{ balance }] = await usersModel.getUserBalance({ id: user_id })
      if (payment_method === 'tuku_payment') {
        if (balance > total) {
          status = true
          balance = balance - total
          await usersModel.updateBalance({ id: user_id }, { balance })
        } else {
          msg2 = 'balance is not enough, '
        }
      }

      let code = uuidv4()
      code = code.slice(code.length - 8).toUpperCase()
      const invoice = 'TUKU' + user_id + Date.now() + code

      const transactionData = {
        user_id,
        total_price: total,
        delivery_fee: delivery_fees,
        items_price: prices,
        status,
        invoice
      }

      const transaction = await transactionModel.createBooking(transactionData)
      console.log('if stopped right here')
      console.log(transaction)

      if (!transaction.insertId) {
        return responseStandard(res, 'failed to create booking!', { line: 315 }, 400, false)
      }

      const [{ name: customer_name }] = await usersModel.getUserModelByCred({ id: user_id })

      for (const item of checkoutArr) {
        const { origin, destination, weight, items, ...dataMerchant } = item
        const merchantData = {
          transaction_total_id: transaction.insertId,
          invoice,
          customer_id: user_id,
          customer_name,
          ...dataMerchant,
          total_payment: dataMerchant.total_price + dataMerchant.delivery_fee,
          shipping_address: address
        }
        const transactionMerchant = await transactionModel.createBooking(merchantData, 'transaction_merchant')
        console.log(transactionMerchant)
        if (!transactionMerchant.insertId) {
          return responseStandard(res, 'failed to create booking!', { line: 334 }, 400, false)
        }
        for (const product of items) {
          const { name, product_image, item_detail } = product
          for (const detail of item_detail) {
            const { color_name, price, quantity } = detail
            const detailData = {
              transaction_merchant_id: transactionMerchant.insertId,
              invoice,
              item_name: name,
              total_price: price,
              item_color: color_name,
              product_image,
              quantity
            }
            const transactionDetail = await transactionModel.createBooking(detailData, 'transaction_details')
            if (!transactionDetail.insertId) {
              console.log(transactionDetail)
              return responseStandard(res, 'failed to create booking!', { line: 352 }, 400, false)
            }
          }
        }
      }

      for (const [index, item] of itemdetails_id.entries()) {
        const stock = stocks[index] - quantity[index]
        await itemModel.updateStock({ stock }, { id: item })
      }

      Object.assign(bookingSummary, { status, invoice, id: transaction.insertId })

      const msg = status ? 'payment successful, transaction created!' : msg2 + 'booking created, waiting for payment'

      return responseStandard(res, msg, { bookingSummary, bookingDetail: checkoutArr })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 400, false)
    }
  },
  commitPayment: async (req, res) => {
    const { id } = req.user
    if (!id) { return responseStandard(res, 'Forbidden Access!', {}, 403, false) }
    let { id: transaction_id } = req.params
    if (!Number(transaction_id)) { return responseStandard(res, 'transaction id must be number!', {}, 403, false) }
    try {
      transaction_id = Number(transaction_id)
      const [{ total_price, user_id, status }] = await transactionModel.getTransactionById({ id: transaction_id })
      if (status) { return responseStandard(res, 'transaction has been paid', {}, 403, false) }

      if (user_id !== id) { return responseStandard(res, 'Forbidden Access!', {}, 403, false) }

      let [{ balance }] = await usersModel.getUserBalance({ id })
      if (total_price > balance) { return responseStandard(res, 'balance is not enough please top-up your balance!', {}, 403, false) }

      balance = balance - total_price
      await usersModel.updateBalance({ id }, { balance })
      await transactionModel.updateStatus({ id: transaction_id }, 1)

      return responseStandard(res, 'payment on id ' + transaction_id + ' success!')
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 400, false)
    }
  }
}
