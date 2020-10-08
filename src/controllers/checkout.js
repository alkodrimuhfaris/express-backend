const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const axios = require('axios')
const responseStandard = require('../helpers/response')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

const pagination = require('../helpers/pagination')
const features = require('../helpers/features')
const table = 'items'

let apiRajaOngkir = {
	city: `https://api.rajaongkir.com/starter/city`,
	province: `https://api.rajaongkir.com/starter/province`,
	cost: `https://api.rajaongkir.com/starter/cost`
}


let rickAndMorty = {
  characters: `https://rickandmortyapi.com/api/character`,
  locations: `https://rickandmortyapi.com/api/location`,
  episodes: `https://rickandmortyapi.com/api/episode`
}

module.exports = {
	getCheckout: async (req, res) => {
		
		try{
			let {data} = await axios.get(apiRajaOngkir.city, {params : {key: process.env.API_KEY_RAJAONGKIR, province: 5}})
			let {results} = data.rajaongkir
			let keyCity = []
			let valsCity = []
			for (let city of results) {
				valsCity.push(Object.values(city))
				keyCity[0] = Object.keys(city)
			}
			console.log(keyCity)
			console.log(valsCity)
			console.log(results)
			if (results.length) {
				console.log(results)
				return responseStandard(res, 'List of Items', {rajaOngkir: results})
			} else {
				console.log(results)
				return responseStandard(res, 'gagal!', {}, 400, false )
			}
		} catch (err) {
			console.log(err)
			return responseStandard(res, err.message, {}, 400, false )
		}
	}
}