module.exports = (arr) => {
  const colImgKey = ['name', 'image_url', 'item_id']
  const img = {}
  const imgArrVal = []
  if (arr.length) {
    for (const [n, item] of arr.entries()) {
      if (!Object.keys(item).length) {
        continue
      }
      Object.assign(img, { [`${item.fieldname}_${n + 1}`]: 'Uploads/' + item.filename })
      imgArrVal.push([`${item.fieldname}_${n + 1}`, 'Uploads/' + item.filename])
    }
    const data = [imgArrVal]
    console.log(data)
    console.log('INI DATA DARI IMAGE TO DB')
    console.log(data)
    return { imagePrep: data, imgData: img, keys: colImgKey }
  } else if (!arr) {
    return { imgData: img }
  } else {
    Object.assign(img, { [arr.fieldname]: 'Uploads/' + arr.filename })
    const data = [[arr.fieldname, 'Uploads/' + arr.filename]]
    return { imagePrep: data, imgData: img }
  }
}
