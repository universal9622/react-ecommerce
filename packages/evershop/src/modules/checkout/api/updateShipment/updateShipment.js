const {
  rollback, insert, commit, select, update, startTransaction
} = require('@evershop/mysql-query-builder');
const { getConnection, pool } = require('../../../../lib/mysql/connection');
const { get } = require('../../../../lib/util/get');
const { INVALID_PAYLOAD, OK, INTERNAL_SERVER_ERROR } = require('../../../../lib/util/httpStatus');

// eslint-disable-next-line no-unused-vars
module.exports = async (request, response, delegate, next) => {
  const connection = await getConnection();
  await startTransaction(connection);
  const { order_id, shipment_id } = request.params;
  const { carrier_name, tracking_number } = request.body;
  try {
    const order = await select()
      .from('order')
      .where('uuid', '=', order_id)
      .load(connection);

    if (!order) {
      response.status(INVALID_PAYLOAD);
      response.json({
        error: {
          status: INVALID_PAYLOAD,
          message: 'Invalid order id'
        }
      });
      return;
    }
    const shipment = await select()
      .from('shipment')
      .where('uuid', '=', shipment_id)
      .load(connection);

    if (!shipment) {
      response.status(INVALID_PAYLOAD);
      response.json({
        error: {
          status: INVALID_PAYLOAD,
          message: 'Invalid shipment id'
        }
      });
      return;
    }
    await update('shipment')
      .given({
        carrier_name,
        tracking_number
      })
      .where('uuid', '=', shipment_id)
      .execute(connection);
    /* Add an activity log message */
    // TODO: This will be improved. It should be treated as a side effect and move to somewhere else
    await insert('order_activity')
      .given({
        order_activity_order_id: order.order_id,
        comment: 'Shipment information updated',
        customer_notified: 0
      })
      .execute(connection);

    await commit(connection);

    // Load updated shipment
    const updatedShipment = await select()
      .from('shipment')
      .where('shipment_order_id', '=', order.order_id)
      .and('uuid', '=', shipment_id)
      .load(pool);

    response.status(OK);
    response.json({
      data: updatedShipment
    });
  } catch (e) {
    console.log(e);
    await rollback(connection);
    response.status(INTERNAL_SERVER_ERROR);
    response.json({
      error: {
        status: INTERNAL_SERVER_ERROR,
        message: e.message
      }
    });
  }
};
