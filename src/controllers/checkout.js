const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const axios = require('axios')
const responseStandard = require('../helpers/response')
const joi = require('joi')
const arrayCheckout = require('../helpers/arrayCheckout')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

const addressModel = require('../models/address')

const itemModel = require('../models/items')

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
      const courierArr = [...Array(sellerArr.length)].maps(item => {
        item = null
        return item
      })
      const serviceArr = [...courierArr]
      return responseStandard(res, 'Array of ', { courierArr, serviceArr })
    } catch (error) {
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
      const { value: checkoutData, error } = carts.validate(req.query)
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
  paymentBooking: async (req, res) => {
    
  }
}
