const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const responseStandard = require('../helpers/response')
const { userAddress } = require('../helpers/joiControllerForm')
const axios = require('axios')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

const {
  getAddressPlain,
  viewAddresssModel,
  viewCountAddresssModel,
  createAddressModel,
  updateAddressModel,
  deleteAddressModel
} = require('../models/address')

const pagination = require('../helpers/pagination')
const table = 'address'

const primaryAddressTogler = async (res, primary_address, user_id) => {
  if (primary_address) {
    let [addressTrue] = await viewAddresssModel({ user_id }, [{ primary_address }])
    if (addressTrue) {
      addressTrue = [{ primary_address: false }, { id: addressTrue.id }]
      await updateAddressModel(addressTrue, [{ user_id }])
    }
    return primary_address
  } else {
    const addressTrue = await viewAddresssModel({ user_id }, [{ primary_address: true }], '')
    if (!addressTrue.length) {
      return true
    }
    return primary_address
  }
}

module.exports = {
  getAllAddress: async (req, res) => {
    const { id: user_id, role_id } = req.user
    if (role_id === 4 | 1) {
      const { page, limit, limiter } = pagination.pagePrep(req.query)
      console.log(limiter)
      try {
        const result = await viewAddresssModel({ user_id }, [], limiter)
        const [{ count }] = await viewCountAddresssModel(user_id)
        const pageInfo = pagination.paging(count, page, limit, table, req)
        if (result.length) {
          return responseStandard(res, 'List of Items', { ...{ data: result }, ...{ pageInfo } })
        } else {
          const pageInfo = pagination.paging(count, page, limit, table, req)
          return responseStandard(res, 'There is no address in the list', pageInfo)
        }
      } catch (err) {
        return responseStandard(res, err.message, {}, 500, false)
      }
    } else {
      return responseStandard(res, 'Forbidden access!', {}, 500, false)
    }
  },
  getDetailAddress: async (req, res) => {
    const { id: user_id, role_id } = req.user
    if (role_id === 4 | 1) {
      const { id } = req.params
      try {
        const result = await getAddressPlain(id, user_id)
        if (result.length) {
          return responseStandard(res, 'Getting address on ' + result[0].address_name + ' successfull', { data: result })
        } else {
          return responseStandard(res, 'There is no item in the list', {}, 400, false)
        }
      } catch (err) {
        return responseStandard(res, err.message, {}, 500, false)
      }
    } else {
      return responseStandard(res, 'Forbidden access!', {}, 500, false)
    }
  },
  getAllProvince: async (req, res) => {
    try {
      const { data } = await axios.get(process.env.URL_RAJAONGKIR_PROVINCE, { params: { key: process.env.API_KEY_RAJAONGKIR } })
      const { results } = data.rajaongkir
      return responseStandard(res, 'list of all province', { results })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  getAllCityInProvince: async (req, res) => {
    let {id: province} = req.params
    if (!Number(province)) { return responseStandard(res, 'id province must be a number', {}, 400, false) }
    province = Number(province)
    try {
      const { data } = await axios.get(process.env.URL_RAJAONGKIR_CITY, { params: { key: process.env.API_KEY_RAJAONGKIR, province } })
      let { results } = data.rajaongkir
      results = results.map( data => {
        const {city_id, province_id, province, type, city_name } = data
        data = {
          city_id,
          province_id,
          province,
          city: type + ' ' + city_name,
        }
        return data
      })
      return responseStandard(res, 'list of all province', { results })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  createAddres: async (req, res) => {
    const { id: user_id, role_id } = req.user
    if (!role_id) {
      return responseStandard(res, 'Forbidden access!', {}, 500, false)
    }
    try {
      const form = userAddress(req.body)
      const { city_id } = form
      console.log(process.env.URL_RAJAONGKIR_CITY)
      const { data } = await axios.get(process.env.URL_RAJAONGKIR_CITY, { params: { key: process.env.API_KEY_RAJAONGKIR, id: city_id } })
      const { results } = data.rajaongkir
      Object.assign(form, { user_id, city: results.city_name, city_type: results.type })
      const { primary_address } = form
      primary_address && (form.primary_address = await primaryAddressTogler(res, primary_address, user_id))
      const result = await createAddressModel(form)
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
      const { id: user_id, role_id } = req.user
      const { id } = req.params
      try {
        const validate = await viewAddresssModel({ id })
        if (!validate.length) return responseStandard(res, 'address ID is invalid!', {}, 500, false)
        if ((role_id === 4 | 1) && (validate[0].user_id === user_id)) {
          const form = await userAddress(req.body, requires)
          const { city_id } = form || 0
          if (city_id) {
            const { data } = await axios.get(process.env.URL_RAJAONGKIR_CITY, { params: { key: process.env.API_KEY_RAJAONGKIR, id: city_id } })
            const { results } = data.rajaongkir
            Object.assign(form, { user_id, city: results.city_name, city_type: results.type })
          }
          const { primary_address } = form
          primary_address && (form.primary_address = await primaryAddressTogler(res, primary_address, user_id))
          const result = await updateAddressModel([form, { id }], [{ user_id }])
          if (result.affectedRows) {
            return responseStandard(res, 'Adress on id number ' + id + ' has been updated!', { address: form })
          } else {
            return responseStandard(res, 'Internal server error', 500, false)
          }
        } else {
          return responseStandard(res, 'Forbidden access!', {}, 500, false)
        }
      } catch (err) {
        console.log(err)
        return responseStandard(res, err.message, {}, 500, false)
      }
    }
  },
  deleteAddress: async (req, res) => {
    const { id: user_id, role_id } = req.user
    const { id } = req.params
    try {
      const validate = await viewAddresssModel({ id })
      if (!validate.length) return responseStandard(res, 'address ID is invalid!', {}, 500, false)
      if ((role_id === 4 | 1) && (validate[0].user_id === user_id)) {
        const { id: user_id } = req.user
        console.log(user_id)
        const { id } = req.params
        const [{ primary_address }] = await getAddressPlain(id, user_id)
        console.log(primary_address)
        if (primary_address) {
          let nextPrimary = await viewAddresssModel({ user_id }, [{ primary_address: false }])
          if (nextPrimary.length) {
            nextPrimary = nextPrimary[0]
            nextPrimary = [{ primary_address: true }, { id: nextPrimary.id }]
            await updateAddressModel(nextPrimary, [{ user_id }])
          }
        }
        const result = await deleteAddressModel({ id }, [{ user_id }])
        console.log(result)
        if (result.affectedRows) {
          return responseStandard(res, 'address on id: ' + id + ' has been deleted', { deletedData: validate })
        } else {
          return responseStandard(res, 'The id you choose is invalid', {}, 400, false)
        }
      } else {
        return responseStandard(res, 'Forbidden Access!', {}, 403, false)
      }
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  }
}
