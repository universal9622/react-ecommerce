const { select } = require('@evershop/postgres-query-builder');
const { pool } = require('@evershop/evershop/src/lib/postgres/connection');
const {
  getProductsByCategoryBaseQuery
} = require('./getProductsByCategoryBaseQuery');

module.exports.getPriceRange = async function getPriceRange(categoryId) {
  const productsQuery = await getProductsByCategoryBaseQuery(categoryId);
  productsQuery.select('product.product_id');
  // Get the list of productIds before applying pagination, sorting...etc
  // Base on this list, we will find all attribute,
  // category and price can be appeared in the filter table
  const allIds = (await productsQuery.execute(pool)).map(
    (row) => row.product_id
  );
  const priceRange = await select()
    .select('MIN(price)', 'min')
    .select('MAX(price)', 'max')
    .from('product')
    .where('product_id', 'IN', allIds)
    .execute(pool);

  return priceRange[0];
};
