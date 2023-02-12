/* eslint-disable camelcase */
const { insert, select } = require('@evershop/mysql-query-builder');
const { pool } = require('../../../../lib/mysql/connection');
const { INVALID_PAYLOAD, OK, INTERNAL_SERVER_ERROR } = require('../../../../lib/util/httpStatus');
const { addressValidator } = require('../../services/addressValidator');
const { getCartByUUID } = require('../../services/getCartByUUID');
const { saveCart } = require('../../services/saveCart');

// eslint-disable-next-line no-unused-vars
module.exports = async (request, response, delegate, next) => {
  try {
    const { cart_id } = request.params;
    const { address, type } = request.body;
    // Check if cart exists
    const cart = await getCartByUUID(cart_id);
    if (!cart) {
      response.status(INVALID_PAYLOAD);
      return response.json({
        error: {
          status: INVALID_PAYLOAD,
          message: 'Invalid cart'
        }
      });
    }
    // Use shipping address as a billing address
    // Validate address
    if (!addressValidator(address)) {
      throw new TypeError('Invalid Address');
    }
    // Save billing address
    const result = await insert('cart_address')
      .given(address)
      .execute(pool);

    // Set address ID to cart
    if (type === 'shipping') {
      await cart.setData('shipping_address_id', parseInt(result.insertId, 10));
    } else {
      await cart.setData('billing_address_id', parseInt(result.insertId, 10));
    }
    // Save cart
    await saveCart(cart);

    const createdAddress = await select()
      .from('cart_address')
      .where('cart_address_id', '=', result.insertId)
      .load(pool);

    response.status(OK);
    return response.json({
      data: createdAddress
    });
  } catch (e) {
    response.status(INTERNAL_SERVER_ERROR);
    return response.json({
      error: {
        status: INTERNAL_SERVER_ERROR,
        message: e.message
      }
    });
  }
};
