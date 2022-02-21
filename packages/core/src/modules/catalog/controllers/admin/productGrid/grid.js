const fs = require('fs');
const path = require('path');
const { pool } = require('../../../../../lib/mysql/connection');
const { assign } = require('../../../../../lib/util/assign');
const { CONSTANTS } = require('../../../../../lib/helpers');

module.exports = async (request, response, stack) => {
  // execute query
  const query = stack.queryInit;

  let limit = 20;// Default limit
  // Limit
  if (/^[0-9]+$/.test(request.query.limit)) limit = parseInt(request.query.limit);

  let page = 1;
  // pagination
  if (/^[0-9]+$/.test(request.query.page)) page = parseInt(request.query.page);
  assign(response.context, { grid: { page, limit } });
  query.limit((page - 1) * limit, limit);

  // Order by
  let orderBy = 'product.`product_id`';
  if (request.query.sort_by) orderBy = request.query.sort_by;

  let direction = 'DESC';
  if (request.query.sort_order === 'ASC') direction = 'DESC';

  query.orderBy(orderBy, direction);
  let products = await query.execute(pool);

  // Process the thumbnail
  products = products.map((product) => {
    if (product.image) {
      const thumb = product.image.replace(/.([^.]*)$/, '-thumb.$1');
      product.image = fs.existsSync(path.join(CONSTANTS.MEDIAPATH, thumb)) ? `/assets${thumb}` : null;
    }

    return product;
  });
  assign(response.context, { grid: { products: JSON.parse(JSON.stringify(products)) } });

  query.select('COUNT(`product_id`)', 'total');
  query.limit(0, 1);
  const ps = await query.execute(pool);
  assign(response.context, { grid: { total: ps[0].total } });
  assign(response.context, { page: { heading: 'Products' } });

  return products;
};
