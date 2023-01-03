const { select } = require('@evershop/mysql-query-builder');
const { pool } = require('../../../../lib/mysql/connection');
const { INVALID_PAYLOAD, INTERNAL_SERVER_ERROR } = require('../../../../lib/util/httpStatus');
const { getCartByUUID } = require('../../services/getCartByUUID');
const { createOrder } = require('../../services/orderCreator');

// eslint-disable-next-line no-unused-vars
module.exports = async (request, response, delegate, next) => {
  try {
    const { cart_id } = request.body;
    // Verify cart
    const cart = await getCartByUUID(cart_id);
    if (!cart) {
      response.status(INVALID_PAYLOAD);
      response.json({
        error: {
          message: 'Invalid cart',
          status: INVALID_PAYLOAD
        }
      });
      return;
    } else if (cart.hasError()) {
      response.status(INVALID_PAYLOAD);
      response.json({
        error: {
          message: cart.error,
          status: INVALID_PAYLOAD
        }
      });
      return;
    }

    const orderId = await createOrder(cart);

    // Load created order
    const order = await select()
      .from('order')
      .where('uuid', '=', orderId)
      .load(pool);

    order.items = await select()
      .from('order_item')
      .where('order_item_order_id', '=', order['order_id'])
      .execute(pool);

    order.shipping_address = await select()
      .from('order_address')
      .where('order_address_id', '=', order['shipping_address_id'])
      .load(pool);

    order.billing_address = await select()
      .from('order_address')
      .where('order_address_id', '=', order['billing_address_id'])
      .load(pool);

    response.json({
      data: {
        ...order,
        links: [
          {
            "rel": "view",
            "href": buildUrl('orderEdit', { order_id: order.uuid }),
            "action": "GET",
            "types": ["text/xml"]
          }
        ]
      }
    });
  } catch (e) {
    response.status(INTERNAL_SERVER_ERROR);
    response.json({
      error: {
        message: e.message,
        status: INTERNAL_SERVER_ERROR
      }
    });
  }
};
