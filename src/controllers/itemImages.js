const responseStandard = require('../helpers/response')
const arrayImagetoDB = require('../helpers/imagetoDB')

const itemImages = require('../models/itemImages')

module.exports = {
  getImage: async (req, res) => {
    const { id: item_id } = req.params
    try {
      const results = await itemImages.getImage(item_id)
      if (!results.length) {
        return responseStandard(res, 'there is no image here', {}, 400, false)
      }
      return responseStandard(res, 'there is no image here', { results: results[0] })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  insertImageArr: async (req, res) => {
    const { id: item_id } = req.params
    const { imgData } = arrayImagetoDB(req.files)
    Object.assign(imgData, { item_id })
    try {
      const insertImage = await itemImages.insertImage(imgData)
      if (!insertImage.insertId) {
        return responseStandard(res, 'error inserting image', {}, 400, false)
      }
      Object.assign(imgData, { id: insertImage.insertId })
      return responseStandard(res, 'insert image successfull!', { results: imgData })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  insertImage: async (req, res) => {
    const { id, item_id } = req.params
    const key = 'product_image_' + id
    const value = req.file ? 'Uploads/' + req.file.filename : null
    if (!value) {
      return responseStandard(res, 'insert image!', {}, 400, false)
    }
    try {
      const imgData = {
        [key]: value,
        item_id
      }
      const updateImage = await itemImages.insertImage(imgData)
      if (!updateImage.insertId) {
        return responseStandard(res, 'error inserting image', {}, 400, false)
      }
      return responseStandard(res, 'insert image successfull!', { results: imgData })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  updateImageArr: async (req, res) => {
    const { id: item_id } = req.params
    const { imgData } = arrayImagetoDB(req.files)
    try {
      const insertImage = await itemImages.updateImage(imgData, { item_id })
      if (!insertImage.affectedRows) {
        return responseStandard(res, 'error updating image', {}, 400, false)
      }
      Object.assign(imgData, { id: insertImage.insertId })
      return responseStandard(res, 'update image successfull!', { results: imgData })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  updateImage: async (req, res) => {
    const { id, item_id } = req.params
    const key = 'product_image_' + id
    const value = req.file ? 'Uploads/' + req.file.filename : null
    if (!value) {
      return responseStandard(res, 'insert image!', {}, 400, false)
    }
    try {
      const imgData = {
        [key]: value
      }
      const updateImage = await itemImages.updateImage(imgData, { item_id })
      if (!updateImage.affectedRows) {
        return responseStandard(res, 'error updating image', {}, 400, false)
      }
      return responseStandard(res, 'update image successfull!', { results: imgData })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  deleteImageArr: async (req, res) => {
    const { id: item_id } = req.params
    try {
      const deleteImage = await itemImages.deleteImage({ item_id })
      if (!deleteImage.affectedRows) {
        return responseStandard(res, 'error deleting image', {}, 400, false)
      }
      return responseStandard(res, 'delete all image successfull!', {})
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  },
  deleteImage: async (req, res) => {
    const { id, item_id } = req.params
    const key = 'product_image_' + id
    const value = null
    try {
      const imgData = {
        [key]: value
      }
      const updateImage = await itemImages.updateImage(imgData, { item_id })
      if (!updateImage.affectedRows) {
        return responseStandard(res, 'error deleting image', {}, 400, false)
      }
      return responseStandard(res, 'delete image successfull!', { results: imgData })
    } catch (err) {
      console.log(err)
      return responseStandard(res, err.message, {}, 500, false)
    }
  }
}
