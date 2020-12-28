const responseStandard = require('../helpers/response')
const { userAddress } = require('../helpers/joiControllerForm')
const axios = require('axios')
const qs = require('qs')
const address = require('../models/address')

const pagination = require('../helpers/pagination')

const primaryAddressToggler = async (req, primary_address, user_id) => {
  if (primary_address) {
    const { results } = await address.getAddress({ user_id, primary_address }, req.query)
    const [addressTrue] = results
    if (addressTrue) {
      await address.updateAddress({ primary_address: false }, { user_id, primary_address })
    }
    return primary_address
  } else {
    const { count } = await address.getAddress({ user_id, primary_address: true }, req.query)
    if (!count) {
      return true
    }
    return primary_address
  }
}

module.exports = {
  getAllAddress: async (req, res) => {
    const { limit, page } = req.query
    const path = 'address/admin/all'
    try {
      const { results, count } = await address.getAddress({}, req.query)
      const pageInfo = pagination.paging(count, page, limit, path, req)
      const msg = results.length ? 'List of All user address' : 'There is no address in the list'
      return responseStandard(res, msg, { results, pageInfo })
    } catch (err) {
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  getAddress: async (req, res) => {
    const { id: user_id } = req.user
    const { limit, page } = req.query
    const path = 'address/'
    try {
      const { results, count } = await address.getAddress({ user_id }, req.query)
      const pageInfo = pagination.paging(count, page, limit, path, req)
      const msg = results.length ? 'List of address' : 'There is no address in the list'
      return responseStandard(res, msg, { results, pageInfo })
    } catch (err) {
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  getDetailAddress: async (req, res) => {
    const { id: user_id } = req.user
    const { id } = req.params
    try {
      const { results, count } = await address.getAddress({ user_id, id }, req.query)
      if (!count) {
        return responseStandard(res, 'there is no address found', {}, 400, false)
      }
      return responseStandard(res, 'address on id: ' + id, { result: results[0] })
    } catch (err) {
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  getAllProvince: async (req, res) => {
    try {
      const { data } = await axios.get(
        `${process.env.URL_RAJAONGKIR_PROVINCE}?${qs.stringify({ key: process.env.API_KEY_RAJAONGKIR })}`
      )
      const { results } = data.rajaongkir
      console.log(results)
      return responseStandard(res, 'list of all province', { results })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  getAllCityInProvince: async (req, res) => {
    const { id: province } = req.params
    try {
      const { data } = await axios.get(
        `${process.env.URL_RAJAONGKIR_CITY}?${qs.stringify({ key: process.env.API_KEY_RAJAONGKIR, province })}`
      )
      let { results } = data.rajaongkir
      results = results.map(data => {
        const { city_id, province_id, province, type, city_name, postal_code } = data
        data = {
          city_id,
          province_id,
          province,
          city: type + ' ' + city_name,
          postal_code
        }
        return data
      })
      return responseStandard(res, 'list of all province', { results })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  createAddress: async (req, res) => {
    const { id: user_id } = req.user
    try {
      const form = await userAddress(req.body)
      const city_id = form.city_id
      console.log(process.env.URL_RAJAONGKIR_CITY)
      const { data } = await axios.get(
        `${process.env.URL_RAJAONGKIR_CITY}?${qs.stringify({ key: process.env.API_KEY_RAJAONGKIR, id: city_id })}`
      )
      const { results } = data.rajaongkir
      Object.assign(form, { user_id, city: results.city_name, city_type: results.type })
      const primary_address = form.primary_address || false
      primary_address && (form.primary_address = await primaryAddressToggler(req, primary_address, user_id))
      const result = await address.createAddress(form)
      if (result.affectedRows) {
        Object.assign(form, { id: result.insertId })
        return responseStandard(res, 'Address created successfully!', { address: form })
      } else {
        return responseStandard(res, 'Internal server error', 500, false)
      }
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  updateAddressModel: requires => {
    return async (req, res) => {
      const { id: user_id } = req.user
      const { id } = req.params
      try {
        const { count } = await address.getAddress({ id, user_id }, req.query)
        if (!count) return responseStandard(res, 'address ID is invalid!', {}, 500, false)
        const form = await userAddress(req.body, requires)
        const city_id = form.city_id || 0
        if (city_id) {
          const { data } = await axios.get(
            `${process.env.URL_RAJAONGKIR_CITY}?${qs.stringify({ key: process.env.API_KEY_RAJAONGKIR, id: city_id })}`
          )
          const { results: rajaOngkirData } = data.rajaongkir
          Object.assign(form, { user_id, city: rajaOngkirData.city_name, city_type: rajaOngkirData.type })
        }
        const primary_address = form.primary_address || false
        primary_address && (form.primary_address = await primaryAddressToggler(req, primary_address, user_id))
        const result = await address.updateAddress(form, { id, user_id })
        if (result.affectedRows) {
          return responseStandard(res, 'Address on id number ' + id + ' has been updated!', { address: form })
        } else {
          return responseStandard(res, 'Internal server error', {}, 500, false)
        }
      } catch (err) {
        console.log(err)
        return responseStandard(res, err.message, {}, 500, false)
      }
    }
  },
  deleteAddress: async (req, res) => {
    const { id: user_id } = req.user
    const { id } = req.params
    try {
      const { results, count } = await address.getAddress({ id, user_id }, req.query)
      if (!count) {
        return responseStandard(res, 'address ID is invalid!', {}, 500, false)
      }
      const [targetAddress] = results
      const { primary_address } = targetAddress
      if (primary_address) {
        const { results: allAddress, count } = await address.getAddress({ user_id, primary_address: false }, req.query)
        if (count) {
          const nextPrimary = allAddress[0]
          await address.updateAddress({ primary_address: true }, { id: nextPrimary.id })
        }
      }
      const result = await address.deleteAddress({ id, user_id })
      console.log(result)
      if (result.affectedRows) {
        return responseStandard(res, 'address on id: ' + id + ' has been deleted')
      } else {
        return responseStandard(res, 'Error delete data', {}, 400, false)
      }
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  }
}
