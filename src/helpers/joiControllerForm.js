const joi = require('joi')
const bcrypt = require('bcryptjs')

const requiring = (requires, joiObj) => {
  if (requires === 'put') {
    console.log(joiObj)
    joiObj = joi.object({ ...joiObj })
      .fork(Object.keys(joiObj), item => item.required().messages({
        'string.empty': 'Forms can not be empty!',
        'any.required': 'All Forms must be filled'
      }))
  } else if (requires === 'patch') {
    joiObj = joi.object({ ...joiObj })
      .fork(Object.keys(joiObj), item => item.optional().allow(null, '', 0))
  } else if (requires === 'create') {
    joiObj = joi.object({ ...joiObj })
      .fork(Object.keys(joiObj), item => item.messages({
        'any.required': 'All Forms must be filled'
      }))
  }
  return joiObj
}

const sanitizeForm = (data) => {
  data.forEach(form => {
    Object.keys(form)
      .forEach((key) => (!form[key] || ((typeof form[key] === 'string') && !form[key].trim())) && delete form[key])
  })
  return data
}

module.exports = {
  userValidate: async (body, role, requires = 'create') => {
    console.log('this is userValidate')
    let user = {}
    console.log(requires)
    if (requires === 'create') {
      user = {
        name: joi.string().required(),
        password: joi.string()
          .alphanum()
          .min(3)
          .max(30)
          .required(),
        email: joi.string().required()
      }
    } else if (requires === 'put' || requires === 'patch') {
      user = {
        name: joi.string(),
        email: joi.string()
      }
    } else {
      return new Promise((resolve, reject) => {
        const error = { message: 'wrong method!' }
        if (error) return reject(error)
      })
    }

    let userDetails = {}
    console.log(role)
    if (role === 4) {
      console.log('were in customer path')
      userDetails = {
        birthdate: joi.string(),
        bio: joi.string(),
        gender: joi.string(),
        phone: joi.string()
      }
    } else if (role === 3) {
      console.log('were in seller path')
      userDetails = {
        store_description: joi.string(),
        store_name: joi.string().required(),
        phone: joi.string().required()
      }
    } else {
      console.log('role is wrong')
      return new Promise((resolve, reject) => {
        const error = { message: 'your role is invalid!' }
        if (error) return reject(error)
      })
    }

    console.log('we made it to schema')
    let schema = {
      ...user,
      ...userDetails
    }

    schema = requiring(requires, schema)
    const { value: data, error } = schema.validate(body)
    if (error) throw new Error(error)
    let { name, username, email, password, ...user_details } = data
    password && (password = await bcrypt.hash(password, 10))
    return sanitizeForm([{ name, username, email, password }, user_details], requires)
  },
  userAddress: (body, requires = 'create') => {
    let address = {
      address_name: joi.string(),
      recipient_name: joi.string(),
      phone: joi.number().required(),
      address: joi.string().required(),
      city_id: joi.number().required(),
      province_id: joi.number().required(),
      postal_code: joi.number().required(),
      primary_address: joi.boolean().required()
    }

    console.log(body)

    address = requiring(requires, address)

    const { value: data, error } = address.validate(body)
    if (error) throw new Error(error)
    return data
  },
  itemFormController: (body, requires = 'create', detailRows = [], item_id = 0) => {
    let itemForm = {
      name: joi.string().required(),
      description: joi.string(),
      category_id: joi.number().required(),
      condition_id: joi.number().required(),
      weight: joi.number().required(),
      color_name: joi.array().items(joi.string()).required(),
      stock: joi.array().items(joi.number()).required(),
      hex: joi.array().items(joi.string()),
      price: joi.array().items(joi.number()).required()
    }

    itemForm = requiring(requires, itemForm)
    const { value: data, error } = itemForm.validate(body)
    console.log(data)
    if (error) throw new Error(error)
    const { name, description, category_id, condition_id, weight, ...itemDetails } = data
    const [itemData] = sanitizeForm([{ name, description, category_id, condition_id, weight }], requires)

    const itemDetailsKeys = Object.keys(itemDetails)
    const itemDetailsVals = []
    const dataItemDetail = []
    for (let i = 0; i < (itemDetailsKeys.length); i++) {
      itemDetailsVals.push([])
      dataItemDetail.push({})
    }
    Object.values(itemDetails).forEach((item, j) => {
      item.forEach((item, n) => {
        itemDetailsVals[n].push(item)
        Object.assign(dataItemDetail[n], { [itemDetailsKeys[j]]: item })
      })
    })

    if (requires === 'patch' || requires === 'put') {
      if (detailRows.length) {
        const itemDetailsKeysNew = itemDetailsKeys.map(x => x)
        itemDetailsKeys.push('id')
        console.log(itemDetailsKeysNew)
        const itemDetailsKeysUpdate = itemDetailsKeys.map(x => x)
        const itemDetailsValsUpdate = itemDetailsVals.splice(0, detailRows.length)
        console.log('item detail valeue new')
        console.log(itemDetailsValsUpdate)
        const itemDetailsValsNew = itemDetailsVals.map(el => {
          el && el.push(item_id)
          return el
        })
        console.log(itemDetailsValsNew)
        const dataItemDetailUpdate = dataItemDetail.splice(0, detailRows.length)
        const dataItemDetailNew = dataItemDetail.map(x => x)
        for (const [n, element] of detailRows.entries()) {
          Object.assign(dataItemDetailUpdate[n], { id: element.id })
        }
        console.log('itemDetailsValsUpdate sekarang')
        console.log(itemDetailsValsUpdate)
        console.log('item detail key near return')
        console.log(itemDetailsKeysNew)
        return {
          form: [itemData, [itemDetailsValsUpdate], [itemDetailsValsNew]],
          keys: [itemDetailsKeysUpdate, itemDetailsKeysNew],
          itemDetailsUpdate: dataItemDetailUpdate,
          itemDetailsNew: dataItemDetailNew
        }
      } else {
        const itemDetailsKeysNew = itemDetailsKeys.map(x => x)
        itemDetailsKeys.push('id')
        const itemDetailsKeysUpdate = itemDetailsKeys.map(x => x)
        const itemDetailsValsUpdate = []
        const itemDetailsValsNew = itemDetailsVals.map(el => {
          el && el.push(item_id)
          return el
        })
        const dataItemDetailUpdate = []
        const dataItemDetailNew = dataItemDetail.map(x => x)

        return {
          form: [itemData, [itemDetailsValsUpdate], [itemDetailsValsNew]],
          keys: [itemDetailsKeysUpdate, itemDetailsKeysNew],
          itemDetailsUpdate: dataItemDetailUpdate,
          itemDetailsNew: dataItemDetailNew
        }
      }
    }
    return { form: [itemData, [itemDetailsVals]], detailKey: itemDetailsKeys, itemDetails: dataItemDetail }
  }
}
