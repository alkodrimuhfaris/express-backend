const joi = require('joi')
const bcrypt = require('bcryptjs')
const qs = require('querystring')

const requiring = (requires, joiObj) => {		
	if (requires === 'put') {
		console.log(joiObj)
		joiObj = joi.object({...joiObj}).fork(Object.keys(joiObj), item => item.required().messages({
		'string.empty': 'Forms can not be empty!',
		'any.required': 'All Forms must be filled'
    })) 
	} else if (requires === 'patch') {
		joiObj = joi.object({...joiObj}).fork(Object.keys(joiObj), item => item.optional().allow(null, '', 0))
	} else if (requires === 'create') {
		joiObj = joi.object({...joiObj}).fork(Object.keys(joiObj), item => item.messages({
      'any.required': 'All Forms must be filled'
    }))
	}
	return joiObj
}

const sanitizeForm = (data, requires) => {
	data.forEach(form => {
		Object.keys(form).forEach((key) => (!form[key] || ((typeof(form[key] === 'string') && !form[key].trim()))) && delete form[key])
		let dateNow = new Date().toISOString().slice(0, 19).replace('T', ' ')
		requires!=='create' && Object.keys(form).length && Object.assign(form, {updated_at:dateNow})
	})
	return data
}

module.exports = {
	userValidate: async (body, role, requires='create') => {
		console.log('this is userValidate')
		let	user = {} 
		console.log(requires)
		if(requires==='create') {
			user = {
				name: joi.string().required(),
				password: joi.string()
					.alphanum()
					.min(3)
					.max(30)
					.required(),
				email: joi.string().required()}
		} else if (requires === 'put'|| requires === 'patch') {
			user = {
				name: joi.string(),
				email: joi.string()}
		} else {
			return new Promise ((resolve, reject) => {
				let error = {
					message: 'wrong method!'}
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
				phone: joi.number()
			}
		} else if (role === 3) {
			console.log('were in seller path')
			userDetails = {
				store_description: joi.string(),
				store_name: joi.string().required(),
				phone: joi.number().required()
			}
		} else {
			console.log('role is wrong')
			return new Promise ((resolve, reject) => {
				let error = {
					message: 'your role is invalid!'}
				if (error) return reject(error)
			})
		}

		console.log('we made it to schema')
		let schema = {
			...user,
			...userDetails
		}

		schema = requiring(requires, schema)
		let {value: data, error} = schema.validate(body)
		if (error) throw new Error(error)
		let {	name,	username,	email, password, ...user_details } = data
		password && (password = await bcrypt.hash(password, 10))
		return sanitizeForm([{name,	username,	email, password	}, user_details], requires)
	},
	userAddress: (body, requires='create') => {
		let address = {
			address_name: joi.string(),
			recipient_name: joi.string(),
			phone: joi.number().required(),
			address: joi.string().required(),
			city: joi.string().required(),
			postal_code: joi.number().required(),
			primary_address: joi.boolean().required()
		}

		console.log(body)

		address = requiring(requires, address)


		let {value: data, error} = address.validate(body)
		if (error) throw new Error(error)
		let dateNow = new Date().toISOString().slice(0, 19).replace('T', ' ')
		requires!=='create' && Object.assign(data, {updated_at: dateNow})
		return data
	},
	itemFormController: (body, requires='create', detailRows=[], item_id=0) => {
		let itemForm = {
			name: joi.string().required(),
			description: joi.string(),
			subcategory_id: joi.number().required(),
			color_name: joi.array().items(joi.string()).required(),
			stock: joi.array().items(joi.number()).required(),
			hex: joi.array().items(joi.string()),
			price: joi.array().items(joi.number()).required()
		}

		itemForm = requiring(requires, itemForm)
		let {value: data, error} = itemForm.validate(body)
		console.log(data)
		if (error) throw new Error(error)
		let {name, description, subcategory_id, ...itemDetails} = data
		let [itemData] =  sanitizeForm([{name, description, subcategory_id}],requires)

		let itemDetailsKeys = Object.keys(itemDetails)
		let itemDetailsVals = []
		let dataItemDetail = []
		for (let i=0; i<(itemDetailsKeys.length); i++ ) {
			itemDetailsVals.push([])
			dataItemDetail.push({})
		}
		let j=0
		Object.values(itemDetails).forEach(item => {
			let n=0
			item.forEach(item => {
				itemDetailsVals[n].push(item)
				Object.assign(dataItemDetail[n], {[itemDetailsKeys[j]]: item})
				n++
			})
			j++
		})

		if (requires==='patch' || requires ==='put') {
			if (detailRows.length){
				let itemDetailsKeysNew = itemDetailsKeys.map(x => x)
				itemDetailsKeys.push('id', 'updated_at')
				console.log(itemDetailsKeysNew)
				let itemDetailsKeysUpdate = itemDetailsKeys.map(x=> x)
				let itemDetailsValsUpdate = itemDetailsVals.splice(0, detailRows.length)
				console.log('item detail valeue new')
				console.log(itemDetailsValsUpdate)
				let itemDetailsValsNew = itemDetailsVals.map(el => {
					el && el.push(item_id)
					return el
				})
				console.log(itemDetailsValsNew)
				let dataItemDetailUpdate = dataItemDetail.splice(0, detailRows.length)
				let dataItemDetailNew = dataItemDetail.map(x=>x)
				let n=0
				for (let element of detailRows) {
					let dateNow = new Date().toISOString().slice(0, 19).replace('T', ' ')
					itemDetailsValsUpdate[n].push(element.id, dateNow)
					Object.assign(dataItemDetailUpdate[n], {id:element.id}, {updated_at:dateNow})
					n++
				}
				console.log('itemDetailsValsUpdate sekarang')
				console.log(itemDetailsValsUpdate)
				console.log('item detail key near return')
				console.log(itemDetailsKeysNew)
				return {form: [itemData, [itemDetailsValsUpdate], [itemDetailsValsNew]],
								keys: [itemDetailsKeysUpdate, itemDetailsKeysNew],
								itemDetailsUpdate:dataItemDetailUpdate,
								itemDetailsNew:dataItemDetailNew}
			} else {
				let itemDetailsKeysNew = itemDetailsKeys.map(x => x)
				itemDetailsKeys.push('id', 'updated_at')
				let itemDetailsKeysUpdate = itemDetailsKeys.map(x=> x)
				let itemDetailsValsUpdate = []
				let itemDetailsValsNew = itemDetailsVals.map(el => {
					el && el.push(item_id)
					return el
				})
				let dataItemDetailUpdate = []
				let dataItemDetailNew = dataItemDetail.map(x=>x)
				
				return {form: [itemData, [itemDetailsValsUpdate], [itemDetailsValsNew]],
								keys: [itemDetailsKeysUpdate, itemDetailsKeysNew],
								itemDetailsUpdate:dataItemDetailUpdate,
								itemDetailsNew:dataItemDetailNew}
			}
		}
		return {form: [itemData, [itemDetailsVals]], detailKey: itemDetailsKeys, itemDetails:dataItemDetail}
	}
}





