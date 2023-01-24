const { select } = require('@evershop/mysql-query-builder');
const { setContextValue, getContextValue } = require('../../../graphql/services/contextHelper');
const { getCartByUUID } = require('../../services/getCartByUUID');
const { saveCart } = require('../../services/saveCart');
const { INVALID_PAYLOAD, INTERNAL_SERVER_ERROR, OK } = require('../../../../lib/util/httpStatus');
const { pool } = require('../../../../lib/mysql/connection');
const { createNewCart } = require('../../services/createNewCart');

module.exports = async (request, response, delegate, next) => {
  try {
    let cartId = getContextValue(request, 'cartId');
    let cart;
    if (!cartId) {
      // Create a new cart
      const customerTokenPayload = getContextValue(request, 'customerTokenPayload', {});
      cart = await createNewCart(customerTokenPayload);
      cartId = cart.getData('uuid');
    } else {
      cart = await getCartByUUID(cartId); // Cart object
    }
    const { sku, qty } = request.body;

    // Load the product by sku
    const product = await select()
      .from('product')
      .where('sku', '=', sku)
      .and('status', '=', 1)
      .load(pool);

    if (!product) {
      response.status(INVALID_PAYLOAD);
      response.json({
        error: {
          status: INVALID_PAYLOAD,
          message: 'Product not found'
        }
      });
      return;
    }

    // If everything is fine, add the product to the cart
    const item = await cart.addItem({ product_id: product.product_id, qty });
    await saveCart(cart);
    // Set the new cart id to the context, so next middleware can use it
    setContextValue(request, 'cartId', cart.getData('uuid'));
    response.status(OK);
    response.$body = {
      data: {
        item: item.export(),
        count: cart.getItems().length,
        cartId: cart.getData('uuid')
      }
    };
    next();
  } catch (error) {
    console.log(error);
    response.status(INTERNAL_SERVER_ERROR);
    response.json({
      error: {
        status: INTERNAL_SERVER_ERROR,
        message: error.message
      }
    });
  }
};
