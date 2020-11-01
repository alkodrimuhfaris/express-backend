module.exports = (sellerArr, itemsArr) => {
  sellerArr = [...new Set(sellerArr)]

  // membuat array of seller
  sellerArr = sellerArr.map(item => {
    item = {
      seller_id: item,
      weight: 0,
      store_name: '',
      origin: '',
      destination: '',
      total_price: 0,
      delivery_fee: 0,
      courier: '',
      service_name: '',
      items: []
    }
    return item
  })

  // membuat array of item di dalam array of seller
  for (const item of itemsArr) {
    for (const [index, seller] of sellerArr.entries()) {
      if (seller.seller_id === item.seller_id) {
        sellerArr[index].weight += item.weight
        sellerArr[index].origin = item.origin
        sellerArr[index].destination = item.destination
        sellerArr[index].store_name = item.store_name
        sellerArr[index].items.push(item.item_id)
      }
    }
  }

  // mengondisikan array of item agar hanya tersisa yang identik saja
  sellerArr = sellerArr.map(seller => {
    let { items } = seller
    items = [...new Set(items)].map(item => {
      item = {
        item_id: item,
        name: '',
        product_image: '',
        item_price: 0,
        item_detail: []
      }
      return item
    })
    seller = {
      ...seller,
      items: items
    }
    return seller
  })

  for (const item of itemsArr) {
    for (const [index, seller] of sellerArr.entries()) {
      const { items } = seller
      for (const [indexItem, itemSeller] of items.entries()) {
        if (itemSeller.item_id === item.item_id) {
          const { id, color_name, price, quantity, name, product_image } = item
          const itemDetail = {
            item_detail_id: id,
            color_name,
            price: price * quantity,
            quantity
          }
          sellerArr[index].items[indexItem].name = name
          sellerArr[index].items[indexItem].product_image = product_image
          sellerArr[index].items[indexItem].item_detail.push(itemDetail)
        }
      }
    }
  }

  for (const [index, el] of sellerArr.entries()) {
    const { items } = el
    let total_price = 0
    for (const [indexItem, el1] of items.entries()) {
      const { item_detail } = el1
      let item_price = 0
      for (const el2 of item_detail) {
        const { price } = el2
        item_price += price
      }
      sellerArr[index].items[indexItem].item_price = item_price
      total_price += item_price
    }
    sellerArr[index].total_price = total_price
  }

  return sellerArr
}
