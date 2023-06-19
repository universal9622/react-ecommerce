const { pool } = require('@evershop/evershop/src/lib/postgres/connection');
const { select, insert } = require('@evershop/postgres-query-builder');

module.exports = async function buildUrlReWrite(data) {
  try {
    const productId = data.product_id;
    const productUuid = data.uuid;
    const categoryId = data.category_id;
    const productDescription = await select()
      .from('product_description')
      .where('product_description_product_id', '=', productId)
      .load(pool);

    // Insert a new url rewrite for the product itself
    await insert('url_rewrite')
      .given({
        entity_type: 'product',
        entity_uuid: productUuid,
        request_path: `/${productDescription.url_key}`,
        target_path: `/product/${productUuid}`
      })
      .execute(pool);

    if (!categoryId) {
      return;
    }
    // Load the category
    const category = await select()
      .from('category')
      .where('category_id', '=', categoryId)
      .load(pool);

    // Get the url_rewrite for the category
    const categoryUrlRewrite = await select()
      .from('url_rewrite')
      .where('entity_uuid', '=', category.uuid)
      .and('entity_type', '=', 'category')
      .load(pool);

    if (!categoryUrlRewrite) {
      // Wait for the category event to be fired and create the url rewrite for product
      return;
    } else {
      await insert('url_rewrite')
        .given({
          entity_type: 'product',
          entity_uuid: productUuid,
          request_path: `${categoryUrlRewrite.request_path}/${productDescription.url_key}`,
          target_path: `/product/${productUuid}`
        })
        .execute(pool);
    }
  } catch (error) {
    console.log(error);
  }
};
