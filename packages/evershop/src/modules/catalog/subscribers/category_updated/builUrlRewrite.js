const { pool } = require('@evershop/evershop/src/lib/postgres/connection');
const {
  execute,
  insertOnUpdate,
  select
} = require('@evershop/postgres-query-builder');

module.exports = async function buildUrlReWrite(data) {
  try {
    const categoryUUid = data.uuid;
    const categoryId = data.category_id;
    // Load the parent categories
    const parentCategoriesQuery = await execute(
      pool,
      `WITH RECURSIVE parent_categories AS (
      SELECT * FROM category WHERE category_id = ${categoryId}
      UNION
      SELECT c.* FROM category c
      INNER JOIN parent_categories pc ON c.category_id = pc.parent_id
    ) SELECT * FROM parent_categories`
    );
    const parentCategories = parentCategoriesQuery.rows;
    console.log(parentCategories);
    // Build the url rewrite base on the category path, join the category_description table to get the url_key
    let path = '';
    for (let i = 0; i < parentCategories.length; i += 1) {
      const category = parentCategories[i];
      const urlKey = await select('url_key')
        .from('category_description')
        .where('category_description_category_id', '=', category.category_id)
        .load(pool);
      path = `/${urlKey.url_key}` + path;
    }

    console.log('path', path);

    // Save the current path
    const currentPath = await select('request_path')
      .from('url_rewrite')
      .where('entity_uuid', '=', categoryUUid)
      .and('entity_type', '=', 'category')
      .load(pool);

    // Insert the url rewrite rule to the url_rewrite table
    await insertOnUpdate('url_rewrite', ['entity_uuid', 'language'])
      .given({
        entity_type: 'category',
        entity_uuid: categoryUUid,
        request_path: path,
        target_path: `/category/${categoryUUid}`
      })
      .execute(pool);

    // Get all sub categories of the current category recursively
    const subCategoriesQuery = await execute(
      pool,
      `WITH RECURSIVE sub_categories AS (
      SELECT * FROM category WHERE category_id = ${categoryId}
      UNION
      SELECT c.* FROM category c
      INNER JOIN sub_categories sc ON c.parent_id = sc.category_id
    ) SELECT * FROM sub_categories WHERE category_id != ${categoryId}`
    );

    // Replace the url rewrite rule for all the sub categories and products. Search for the url rewrite rule by entity_uuid and entity_type
    await execute(
      pool,
      `UPDATE url_rewrite SET request_path = REPLACE(request_path, '${currentPath.request_path}', '${path}') WHERE entity_type IN ('category', 'product')`
    );
  } catch (error) {
    console.log(error);
  }
};
