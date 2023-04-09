/* eslint-disable camelcase */
const {
  rollback,
  insert,
  commit,
  startTransaction,
  select
} = require('@evershop/postgres-query-builder');
const {
  getConnection
} = require('@evershop/evershop/src/lib/postgres/connection');
const {
  OK,
  INTERNAL_SERVER_ERROR,
  INVALID_PAYLOAD
} = require('@evershop/evershop/src/lib/util/httpStatus');

// eslint-disable-next-line no-unused-vars
module.exports = async (request, response, deledate, next) => {
  const { id } = request.params;
  let {
    method_id,
    cost,
    is_enabled,
    calculate_api,
    condition_type,
    max_weight,
    min_weight,
    max_price,
    min_price
  } = request.body;
  // Make sure cost or calculate_api is provided
  if (
    (request.body.cost === undefined || request.body.cost === null) &&
    (request.body.calculate_api === undefined ||
      request.body.calculate_api === null)
  ) {
    response.status(INVALID_PAYLOAD);
    response.json({
      error: {
        status: INVALID_PAYLOAD,
        message: 'Either cost or calculate_api must be provided'
      }
    });
    return;
  }

  if (condition_type === 'none') {
    condition_type = null;
    max_weight = min_weight = max_price = min_price = null;
  } else {
    if (condition_type === 'weight') {
      max_price = min_price = null;
    } else {
      max_weight = min_weight = null;
    }
  }

  const connection = await getConnection();
  await startTransaction(connection);

  try {
    const zone = await select()
      .from('shipping_zone')
      .where('uuid', '=', id)
      .load(connection);

    if (!zone) {
      response.status(INVALID_PAYLOAD);
      response.json({
        error: {
          status: INVALID_PAYLOAD,
          message: 'Invalid zone id'
        }
      });
      return;
    }

    const method = await select()
      .from('shipping_method')
      .where('shipping_method_id', '=', method_id)
      .load(connection);

    if (!method) {
      response.status(INVALID_PAYLOAD);
      response.json({
        error: {
          status: INVALID_PAYLOAD,
          message: 'Invalid method id'
        }
      });
      return;
    }

    if (calculate_api) {
      cost = null;
    }

    const zoneMethod = await insert('shipping_zone_method')
      .given({
        zone_id: zone.shipping_zone_id,
        method_id: method.shipping_method_id,
        cost,
        is_enabled,
        calculate_api,
        max_weight,
        min_weight,
        max_price,
        min_price
      })
      .execute(connection);
    await commit(connection);
    response.status(OK);
    response.json({
      data: zoneMethod
    });
  } catch (e) {
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
