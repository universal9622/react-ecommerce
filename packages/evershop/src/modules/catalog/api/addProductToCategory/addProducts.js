const {
  getConnection
} = require('@evershop/evershop/src/lib/postgres/connection');
const {
  INVALID_PAYLOAD,
  OK,
  INTERNAL_SERVER_ERROR
} = require('@evershop/evershop/src/lib/util/httpStatus');
const {
  insert,
  startTransaction,
  rollback,
  commit,
  select
} = require('@evershop/postgres-query-builder');

module.exports = async (request, response, delegate, next) => {
  const { category_id } = request.params;
  const { product_id } = request.body;
  const connection = await getConnection();
  await startTransaction(connection);
  try {
    // Check if the category is exists
    const category = await select()
      .from('category')
      .where('uuid', '=', category_id)
      .load(connection);
    if (!category) {
      response.status(INVALID_PAYLOAD);
      return response.json({
        success: false,
        message: 'Category does not exists'
      });
    }

    // Check if the product is exists
    const product = await select()
      .from('product')
      .where('uuid', '=', product_id)
      .load(connection);
    if (!product) {
      response.status(INVALID_PAYLOAD);
      return response.json({
        success: false,
        message: 'Product does not exists'
      });
    }
    // Check if the product is already assigned to the category
    const productCategory = await select()
      .from('product_category')
      .where('category_id', '=', category.category_id)
      .and('product_id', '=', product.product_id)
      .load(connection);
    if (productCategory) {
      response.status(OK);
      return response.json({
        success: true,
        message: 'Product is assigned to the category'
      });
    }

    // Assign the product to the category
    await insert('product_category')
      .given({
        category_id: category.category_id,
        product_id: product.product_id
      })
      .execute(connection);
    await commit(connection);
    response.status(OK);
    return response.json({
      success: true,
      data: {
        product_id: product.product_id,
        category_id: category.category_id
      }
    });
  } catch (e) {
    await rollback(connection);
    console.error(e);
    response.status(INTERNAL_SERVER_ERROR);
    return response.json({
      success: false,
      message: e.message
    });
  }
};
