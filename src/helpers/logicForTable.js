const queryGenerator = require('../helpers/queryGenerator')

module.exports = {
  countItemsForCategories: req => {
    const { searchArr } = queryGenerator(req)

    // query for search and limit
    const additionalQuery = [searchArr].filter(item => item).map(item => `(${item})`).join(' AND ')

    // query for where (if it exist)
    const where = additionalQuery ? ' WHERE ' : ''

    return `SELECT count(items.id) as totalProducts, categories.id as id
FROM categories
LEFT JOIN items
ON categories.id = items.category_id
${where}
${additionalQuery}
GROUP BY categories.id`
  },
  countSubCategoryForCategories: obj => {
    const { searchKey, searchValue } = obj
    return `SELECT count(sub_category.id) as totalSubcategory, categories.id as id
FROM categories
LEFT JOIN sub_category
ON categories.id = sub_category.category_id
WHERE ${searchKey}
LIKE '%${searchValue}%'
GROUP BY categories.id`
  }
}
