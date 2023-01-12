const { update, select } = require('@evershop/mysql-query-builder');
const { getConnection } = require('../../../../lib/mysql/connection');
const { buildUrl } = require('../../../../lib/router/buildUrl');
const { OK, INTERNAL_SERVER_ERROR, INVALID_PAYLOAD } = require('../../../../lib/util/httpStatus');

// eslint-disable-next-line no-unused-vars
module.exports = async (request, response, delegate, next) => {
  const connection = await getConnection();
  try {
    const customer = await select()
      .from('customer')
      .where('uuid', '=', request.params.id)
      .load(connection, false);

    if (!customer) {
      response.status(INVALID_PAYLOAD);
      response.json({
        error: {
          status: INVALID_PAYLOAD,
          message: 'Invalid customer id'
        }
      });
      return;
    }

    await update('customer')
      .given({
        ...request.body,
        group_id: 1 // TODO: fix me
      })
      .where('uuid', '=', request.params.id)
      .execute(connection, false);

    // Load updated customer
    const updatedCustomer = await select()
      .from('customer')
      .where('uuid', '=', request.params.id)
      .load(connection);

    response.status(OK);
    response.json({
      data: {
        ...updatedCustomer,
        links: [
          {
            rel: 'customerGrid',
            href: buildUrl('customerGrid'),
            action: 'GET',
            types: ['text/xml']
          },
          {
            rel: 'edit',
            href: buildUrl('customerEdit', { id: customer.uuid }),
            action: 'GET',
            types: ['text/xml']
          }
        ]
      }
    });
  } catch (e) {
    response.status(INTERNAL_SERVER_ERROR);
    response.json({
      error: {
        status: INTERNAL_SERVER_ERROR,
        message: e.message
      }
    });
  }
};
