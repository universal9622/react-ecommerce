const { commit, rollback, select } = require('@evershop/mysql-query-builder');
const { pool } = require('../../../../lib/mysql/connection');
const { buildUrl } = require('../../../../lib/router/buildUrl');
const { OK, INTERNAL_SERVER_ERROR } = require('../../../../lib/util/httpStatus');

// eslint-disable-next-line no-unused-vars
module.exports = async (request, response, delegate, next) => {
  const promises = [];
  Object.keys(delegate).forEach((id) => {
    // Check if middleware is async
    if (delegate[id] instanceof Promise) {
      promises.push(delegate[id]);
    }
  });
  const connection = await delegate.getConnection;
  const results = await Promise.allSettled(promises);
  const rejected = results.find((r) => r.status === 'rejected');
  if (!rejected) {
    await commit(connection);
    response.status(OK);
    const query = select()
      .from('product');
    query.leftJoin('product_description')
      .on('product_description.`product_description_product_id`', '=', 'product.`product_id`');

    const product = await query
      .where('uuid', '=', request.params.id)
      .load(pool);

    response.json({
      data: {
        ...product,
        links: [
          {
            rel: 'productGrid',
            href: buildUrl('productGrid'),
            action: 'GET',
            types: ['text/xml']
          },
          {
            rel: 'view',
            href: buildUrl('productView', { url_key: product.url_key }),
            action: 'GET',
            types: ['text/xml']
          },
          {
            rel: 'edit',
            href: buildUrl('productEdit', { id: product.uuid }),
            action: 'GET',
            types: ['text/xml']
          }
        ]
      }
    });
  } else {
    await rollback(connection);
    response.status(response.statusCode !== 200 ? response.statusCode : INTERNAL_SERVER_ERROR);
    response.json({
      error: {
        status: response.statusCode !== 200 ? response.statusCode : INTERNAL_SERVER_ERROR,
        message: rejected.reason.message
      }
    });
  }
};
