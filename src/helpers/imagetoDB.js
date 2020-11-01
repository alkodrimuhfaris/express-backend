module.exports = (arr) => {
  const colImgKey = ['name', 'image_url', 'item_id']
  const img = {}
  const imgArrVal = []
  const angka = []
  if (!arr.fieldname) {
    let n = 1
    for (const item of arr) {
      Object.assign(img, { [item.fieldname + '_' + n]: 'Uploads/' + item.filename })
      imgArrVal.push([item.fieldname + '_' + n, 'Uploads/' + item.filename])
      angka.push(n)
      console.log(imgArrVal)
      console.log(angka)
      n++
    }
    const data = [imgArrVal]
    console.log(data)
    console.log('INI DATA DARI IMAGE TO DB')
    console.log(data)
    // const result = await createItemImgModel(data, 'item_images')
    // console.log(result)
    // console.log(n)
    return ({ imagePrep: data, imgData: img, keys: colImgKey })
  } else {
    Object.assign(img, { [arr.fieldname]: 'Uploads/' + arr.filename })
    const data = [[arr.fieldname, 'Uploads/' + arr.filename]]
    // const result = await createItemImgModel(data, 'item_images')
    // console.log(result)
    return ({ imagePrep: data, imgData: img })
  }
}
