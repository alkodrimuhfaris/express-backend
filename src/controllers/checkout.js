const axios = require('axios')
const responseStandard = require('../helpers/response')
const joi = require('joi')
const arrayCheckout = require('../helpers/arrayCheckout')

const { v4: uuidv4 } = require('uuid')

const addressModel = require('../models/address')
const itemModel = require('../models/items')
const usersModel = require('../models/users')
const transactionModel = require('../models/transactions')

module.exports = {
  getSellerArr: async (req, res) => {
    const { id: user_id } = req.user
    if (!user_id) { return responseStandard(res, 'Forbidden Access!', {}, 403, false) }
    try {
      const carts = joi.object({
        itemdetails_id: joi.array().items(joi.number().required())
      })
      const { value: checkoutData, error } = carts.validate(req.query)
      if (error) {
        return responseStandard(res, error.message, {}, 400, false)
      }

      const { itemdetails_id } = checkoutData

      let sellerArr = []
      for (const itemDetailsId of itemdetails_id) {
        // get item detail
        const [itemDetail] = await itemModel.getBookingItem(itemDetailsId)
        const { seller_id } = itemDetail

        sellerArr.push(seller_id)
      }

      sellerArr = [...new Set(sellerArr)]
      console.log(sellerArr.length)
      const sellerArrLength = sellerArr.length
      const courierArr = Array.apply(null, Array(sellerArrLength))
      const serviceArr = [...courierArr]
      return responseStandard(res, 'Array of ', { courierArr, serviceArr, sellerArr })
    } catch (error) {
      console.log(error)
      return responseStandard(res, error.message, {}, 400, false)
    }
  },
  getCheckout: async (req, res) => {
    const { id: user_id } = req.user
    try {
      const carts = joi.object({
        itemdetails_id: joi.array().items(joi.number().required()),
        quantity: joi.array().items(joi.number().required()),
        couriers: joi.array().items(joi.string().allow(null, '', 0)),
        services: joi.array().items(joi.number().allow(null, '', 0)),
        address_id: joi.number()
      })
      const { value: checkoutData, error } = carts.validate(req.body)
      if (error) { return responseStandard(res, error.message, {}, 400, false) }

      const { itemdetails_id, quantity, address_id, couriers, services } = checkoutData

      const sellerArr = []
      const itemsArr = []
      for (const [index, itemDetailsId] of itemdetails_id.entries()) {
        // get item detail
        const [itemDetail] = await itemModel.getBookingItem(itemDetailsId)
        let { weight, seller_id } = itemDetail
        weight = weight * quantity[index]

        // get destination
        const [{ city_id: destination }] = address_id
          ? await addressModel.getCityId({ user_id }, { id: address_id })
          : await addressModel.getCityId({ user_id })

        // get origin
        const [{ city_id: origin }] = await addressModel.getSellerCityId({ item_details_id: itemDetailsId })

        sellerArr.push(seller_id)
        itemsArr.push({ ...itemDetail, quantity: quantity[index], weight, destination, origin })
      }

      const checkoutArr = arrayCheckout(sellerArr, itemsArr)

      for (const [index, item] of checkoutArr.entries()) {
        const courier = couriers ? couriers.length ? couriers[index] : '' : ''

        const service = services ? services.length ? services[index] - 1 : 0 : 0

        const { destination, weight, origin } = item

        // get delivery fee by jne regional
        if (courier) {
          const { data } = await axios.post(process.env.URL_RAJAONGKIR_COST,
            { destination, origin, weight, courier },
            { headers: { key: process.env.API_KEY_RAJAONGKIR } }
          )
          const { results } = data.rajaongkir
          console.log(results)
          const { service: service_name, cost } = results[service].costs[service]
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
  getDeliveryFeeByCouriers: async (req, res) => {
    const { id: user_id } = req.user
    if (!user_id) { return responseStandard(res, 'Forbidden Access!', {}, 403, false) }

    let { seller_id, address_id, weight, courier } = req.query
    seller_id = Number(seller_id)
    weight = Number(weight)
    if (!seller_id || !weight) {
      return responseStandard(res, 'Seller id and weight must be defined as number!', {}, 400, false)
    }

    address_id = Number(address_id) ? Number(address_id) : 0

    try {
      // get origin
      const [{ city_id: origin }] = await addressModel.getCityId({ user_id: seller_id })

      // get destination
      const [{ city_id: destination }] = address_id
        ? await addressModel.getCityId({ user_id }, { id: address_id })
        : await addressModel.getCityId({ user_id })

      const couriers = ['jne', 'pos', 'tiki']
      let selectedCourier = ''
      for (const el of couriers) {
        selectedCourier = el === courier ? el : ''
      }
      if (!selectedCourier) {
        return responseStandard(res, 'Choose the right courier', {}, 400, false)
      }

      const { data } = await axios.post(process.env.URL_RAJAONGKIR_COST,
        { destination, origin, weight, selectedCourier },
        { headers: { key: process.env.API_KEY_RAJAONGKIR } }
      )
      const { results } = data.rajaongkir
      const [{ costs }] = results
      const detailService = []
      console.log(costs)
      for (const [index, item] of costs.entries()) {
        console.log(item)
        const { cost: detailCosts, service } = item
        console.log(detailCosts)
        const [{ value: price, etd }] = detailCosts
        detailService.push({ service_id: index, service, price, etd })
      }

      return responseStandard(res, 'Delivery fee', { service: detailService })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 400, false)
    }
  },
  getDeliveryFee: async (req, res) => {
    const { id: user_id } = req.user
    try {
      const { dataBooking } = req.query
      const deliveryData = []
      for (const data of dataBooking) {
        let { seller_id, address_id, itemdetails_id, quantity } = data
        let weight = 0

        for (const [index, itemDetailsId] of itemdetails_id.entries()) {
          // get item detail
          const [itemDetail] = await itemModel.getBookingItem(itemDetailsId)
          const { weight: itemWeight } = itemDetail
          weight += (itemWeight * quantity[index])
        }
        seller_id = Number(seller_id)
        weight = Number(weight)
        if (!seller_id || !weight) {
          return responseStandard(res, 'Seller id and weight must be defined as number!', {}, 400, false)
        }
        address_id = Number(address_id) ? Number(address_id) : 0
        // get origin
        const [{ city_id: origin }] = await addressModel.getCityId({ user_id: seller_id })

        // get destination
        const [{ city_id: destination }] = address_id
          ? await addressModel.getCityId({ user_id }, { id: address_id })
          : await addressModel.getCityId({ user_id })

        const couriers = ['jne', 'pos', 'tiki']

        const allDataDelivery = []
        for (const el of couriers) {
          const { data } = await axios.post(process.env.URL_RAJAONGKIR_COST,
            { destination, origin, weight, courier: el },
            { headers: { key: process.env.API_KEY_RAJAONGKIR } }
          )
          const { results } = data.rajaongkir
          const [{ costs, code: courier }] = results
          console.log(costs)
          for (const [index, item] of costs.entries()) {
            console.log(item)
            const { cost: detailCosts, service } = item
            console.log(detailCosts)
            const [{ value: price, etd }] = detailCosts
            allDataDelivery.push({ service_id: index, courier, service, price, etd })
          }
        }
        const delivery = {
          seller_id,
          dataDelivery: allDataDelivery
        }

        deliveryData.push(delivery)
      }
      return responseStandard(res, 'Delivery fee', { results: deliveryData })
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
      if (error) {
        return responseStandard(res, error.message, {}, 400, false)
      }

      const { itemdetails_id, quantity, address_id, couriers, services, payment_method } = checkoutData

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
          return responseStandard(res, 'error to process payment, add courier and service!', {}, 400, false)
        }
      }

      const { results } = address_id
        ? await addressModel.getAddress({ user_id }, { id: address_id })
        : await addressModel.getAddress({ user_id })
      let [{ address, city_type, city, postal_code }] = results
      address = `${address}, ${city_type} ${city}, postal code: ${postal_code}`

      let prices = 0
      let delivery_fees = 0
      let quantityTotal = 0
      for (const item of checkoutArr) {
        prices += item.total_price
        quantityTotal += item.quantity
        delivery_fees = (item.delivery_fee !== '-') ? (delivery_fees + item.delivery_fee) : '-'
      }

      const bookingSummary = {
        prices,
        delivery_fees,
        quantity: quantityTotal,
        total: (delivery_fees !== '-') ? (prices + delivery_fees) : 'choose courier and service!'
      }

      let status = false
      let msg2 = ''
      const { total } = bookingSummary
      let [{ balance }] = await usersModel.getuser({ id: user_id })
      if (payment_method === 'tuku_payment') {
        if (balance > total) {
          status = true
          balance = balance - total
          await usersModel.updateUser({ balance }, { id: user_id })
        } else {
          msg2 = 'balance is not enough, '
        }
      }

      let code = uuidv4()
      code = code.slice(code.length - 8).toUpperCase()
      const invoice = 'TUKU' + user_id + code

      const transactionData = {
        user_id,
        total_price: total,
        delivery_fee: delivery_fees,
        items_price: prices,
        status,
        invoice,
        quantity: quantityTotal
      }

      const transaction = await transactionModel.createBooking(transactionData)
      console.log('if stopped right here')
      console.log(transaction)

      if (!transaction.insertId) {
        return responseStandard(res, 'failed to create booking in transaction total!', {}, 400, false)
      }

      const [{ name: customer_name }] = await usersModel.getuser({ id: user_id })

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
          return responseStandard(res, 'failed to create booking in transaction merchant!', {}, 400, false)
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
              return responseStandard(res, 'failed to create booking in transaction details!', { line: 352 }, 400, false)
            }
          }
        }
      }

      for (const seller of checkoutArr) {
        const stockArr = []
        for (const item of seller.items) {
          const { quantity, item_id } = item
          let [{ stock }] = await itemModel.getItem(item_id)
          stock = stock - quantity
          if (stock < 0) {
            return responseStandard(res, 'error to process payment, stock is low', {}, 400, false)
          }
          stockArr.push({ stock, id: item_id })
        }
        for (const item of stockArr) {
          const { stock, id } = item
          await itemModel.updateItem({ stock }, { id })
        }
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
    const { id: transaction_id } = req.params
    try {
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
