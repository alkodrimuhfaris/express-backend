const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const sanitize = require('../helpers/dataSanitizer')
const arraySanitize = require('../helpers/arrayValueSanitizer')
const arrayCredential = require('../helpers/arrayValCredConditioner')
const qs = require('querystring')
const responseStandard = require('../helpers/response')
const bcrypt = require('bcryptjs')
const joi = require('joi')
const arrayImagetoDB = require ('../helpers/imagetoDB')
const updateImgtoDB = require ('../helpers/updateImgtoDB')
const imgRemover = require ('../helpers/imgRemover')
const fs = require('fs')
const arrayValSanitizer = require('../helpers/arrayValueSanitizer')
const {userValidate} = require('../helpers/joiControllerForm')
const transactionMySQL = require ('../helpers/transactionMySQL')


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

const {
  viewAllUsersModel,
  viewCountAllUsersModel,
  updateUserModel,
  deleteUserModel,
  getUserModelNew,
  getUserModelByCred
} = require('../models/users')

const pagination = require('../helpers/pagination')
const features = require('../helpers/features')
const table = 'users'

module.exports = {
	viewUsers: async (req, res) => {
		let {role_id} = req.user
		if (role_id === 2||
				role_id === 1){
				const defSearch = 'name'
				const defSort = 'created_at'
			try{
				const { searchKey, searchValue, sortKey, sortValue, and } = features(req.query, defSearch, defSort)
				const { page, limit, limiter } = pagination.pagePrep(req.query)
				let viewArray = [searchKey, searchValue, sortKey, sortValue, limiter, and]
				const result = await viewAllUsersModel(...viewArray, [])
				console.log('try : '+searchKey)
				const [{count}] = await viewCountAllUsersModel(searchKey, searchValue, and) || 0
				let paginationArray = [count, page, limit, 'all', req]
				const pageInfo = pagination.paging(...paginationArray)
				if(result.length){
					return responseStandard(res, 'List of users', {...{data: result}, ...{pageInfo}})
				} else {
					return responseStandard(res, 'There is no users in the list', pageInfo, 400, false)
				}
			} catch (err) {
				return responseStandard(res, err.message, {}, 500, false)
			}
		} else {
			return responseStandard(res, 'Forbidden Access', {}, 403, false)
		}
  },
  getDetailUser: async (req, res) => {
		let {id:user_id, role_id} = req.user
		if (role_id === 4||
				role_id === 3||
				role_id === 2||
				role_id === 1){
			try {
				const result = await getUserModelNew({id: user_id}, role_id, [])
				console.log('this is the try')
				console.log(result)
				if(result[0]){
					delete result[0].password
					return responseStandard(res, 'Get user from id = '+user_id+' is success', {choosenData: result[0]})
				} else {
					return responseStandard(res, 'User ID is invalid!', {}, 400, false)
				}
			} catch(err) {
				return responseStandard(res, err.message, {}, 500, false)
			}
		} else {
			return responseStandard(res, 'Forbidden Access', {}, 403, false)
		}
  },
  updateUser: requires => {
		return async (req, res) => {
		console.log(req.user)
		let {id: user_id, login_as, role_id} = req.user
		console.log(login_as)
		let imgKey = 0
		let imgVal = 0
		let avatar = 0
		if (req.file) {
		imgKey = req.file.fieldname
		imgVal = sanitize('Uploads/'+req.file.filename)
	}
		try {
		 	if (role_id === 4||
					role_id === 3||
		   		role_id === 2||
		   		role_id === 1){
	   		let form = await userValidate(req.body, login_as, requires)
	   		console.log('Before avatar is called')
				let [{avatar}] = await getUserModelNew({user_id}, role_id, [])
				console.log(form)	
				imgVal && Object.assign(form[1], {[imgKey]: imgVal})
    		let queries = [
    		  [form[0], {id: user_id}],
    		  [form[1], {user_id: user_id}]
    		]
    		console.log(queries)
    		const results = await updateUserModel(queries)
    		if (results.length) {
    			(imgVal && avatar) && fs.unlinkSync(process.env.PUBLIC_UPLOAD_FOLDER+avatar)
	    		return responseStandard(res, 'user on id: '+user_id+' has been updated', {data:{...form[0], ...form[1]}}, 201)
    		}
	    } else {
	    	(imgVal && avatar) && fs.unlinkSync(process.env.PUBLIC_UPLOAD_FOLDER+avatar)
	    	return responseStandard(res, 'Forbidden Access!', {}, 403, false)
		    }
  		} catch (err) {
  			(imgVal && avatar) && fs.unlinkSync(process.env.PUBLIC_UPLOAD_FOLDER+avatar)
	    	console.log(err)
	    	return responseStandard(res, err.message, {}, 500, false)
    	}
  	}
  },
  deleteUser: async (req, res) => {
	  let {id: user_id, role_id} = req.user
  	if (role_id === 4||
	   		role_id === 3||
	   		role_id === 2||
	   		role_id === 1){
	    try {
	    	let data = await getUserModelByCred({user_id}, 'user_details')
	    	if (!data.length){
		    	const result = await deleteUserModel(user_id)
		    	console.log(result)
		    	if(result.affectedRows){
		    		Boolean(data[0].avatar) && fs.unlinkSync(process.env.PUBLIC_UPLOAD_FOLDER+data[0].avatar)
		    		return responseStandard(res, 'user on id: '+user_id+' has been deleted', {})
		    	} else {
		    		return responseStandard(res, 'The id you choose is invalid', {}, 400, false)
		    	}
	    	} else {
	    		return responseStandard(res, 'user id is invalid!', {}, 403, false)
	    	}
	    } catch (err) {
	    	return responseStandard(res, err.message, {}, 500, false)
	    }
  	} else {
  		return responseStandard(res, 'Forbidden Access!', {}, 403, false)
  	}
  }
}