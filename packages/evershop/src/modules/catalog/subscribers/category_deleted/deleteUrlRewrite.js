const { error } = require('@evershop/evershop/src/lib/log/debuger');
const { pool } = require('@evershop/evershop/src/lib/postgres/connection');
const { execute, select } = require('@evershop/postgres-query-builder');

module.exports = async function deleteUrlReWrite(data) {
  try {
    const categoryUuid = data.uuid;
    // Get the current url rewrite for this category
    const urlRewrite = await select()
      .from('url_rewrite')
      .where('entity_uuid', '=', categoryUuid)
      .and('entity_type', '=', 'category')
      .load(pool);
    // Delete all the url rewrite rule for this category
    await execute(
      pool,
      `DELETE FROM url_rewrite WHERE entity_type = 'category' AND entity_uuid = '${categoryUuid}'`
    );

    if (!urlRewrite) {
      return;
    } else {
      // Delete all the url rewrite rule for the sub categories and products
      await execute(
        pool,
        `DELETE FROM url_rewrite WHERE request_path LIKE '${urlRewrite.request_path}/%' AND entity_type IN ('category', 'product')`
      );
    }
  } catch (err) {
    error(err);
  }
};
