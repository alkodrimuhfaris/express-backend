module.exports = (arr, imageOrder = [
  'product_image_1',
  'product_image_2',
  'product_image_3',
  'product_image_4'
]) => {
  const colImgKey = ['name', 'image_url', 'item_id']
  const img = {}
  const imgArrVal = []
  if (arr.length) {
    for (const [n, item] of arr.entries()) {
      if (!Object.keys(item).length) {
        continue
      }
      Object.assign(img, { [`${imageOrder[n]}`]: 'Uploads/' + item.filename })
      imgArrVal.push([`${imageOrder[n]}`, 'Uploads/' + item.filename])
    }
    const data = [imgArrVal]
    return { imagePrep: data, imgData: img, keys: colImgKey }
  } else {
    return { imgData: img }
  }
}
