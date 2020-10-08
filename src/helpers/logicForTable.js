module.exports = {
	countItemsForSubCategories: obj => {
		const {searchKey, searchValue} = obj
		return `SELECT count(items.id) as totalProducts, sub_category.id as id
              FROM sub_category
              LEFT JOIN items
              ON sub_category.id = items.subcategory_id
              WHERE ${searchKey}
              LIKE '%${searchValue}%'
              GROUP BY sub_category.id`
		
	},
	countSubCategoryForCategories: obj => {
		const {searchKey, searchValue} = obj
		return `SELECT count(sub_category.id) as totalSubcategory, categories.id as id
          FROM categories
          LEFT JOIN sub_category
          ON categories.id = sub_category.category_id
          WHERE ${searchKey}
          LIKE '%${searchValue}%'
          GROUP BY categories.id` 
	}
}