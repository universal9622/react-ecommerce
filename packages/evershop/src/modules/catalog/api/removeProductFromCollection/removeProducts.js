const {
  getConnection
} = require('@evershop/evershop/src/lib/postgres/connection');
const {
  INVALID_PAYLOAD,
  OK,
  INTERNAL_SERVER_ERROR
} = require('@evershop/evershop/src/lib/util/httpStatus');
const {
  startTransaction,
  rollback,
  commit,
  select,
  del
} = require('@evershop/postgres-query-builder');

module.exports = async (request, response, delegate, next) => {
  const { collection_id, product_id } = request.params;
  const connection = await getConnection();
  await startTransaction(connection);
  try {
    // Check if the collection is exists
    const collection = await select()
      .from('collection')
      .where('uuid', '=', collection_id)
      .load(connection);

    if (!collection) {
      response.status(INVALID_PAYLOAD);
      response.json({
        success: false,
        message: 'Collection does not exists'
      });
    }

    // Check if the product is exists
    const product = await select()
      .from('product')
      .where('uuid', '=', product_id)
      .load(connection);

    if (!product) {
      response.status(INVALID_PAYLOAD);
      response.json({
        success: false,
        message: 'Product does not exists'
      });
    }

    // Remove the product from the collection
    await del('product_collection')
      .where('collection_id', '=', collection['collection_id'])
      .and('product_id', '=', product['product_id'])
      .execute(connection);
    await commit(connection);
    response.status(OK);
    response.json({
      success: true,
      data: {
        product_id,
        collection_id
      }
    });
  } catch (e) {
    await rollback(connection);
    response.status(INTERNAL_SERVER_ERROR);
    response.json({
      success: false,
      message: e.message
    });
  }
};
