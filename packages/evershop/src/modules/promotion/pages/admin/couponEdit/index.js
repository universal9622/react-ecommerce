const { select } = require('@evershop/mysql-query-builder');
const { pool } = require('../../../../../lib/mysql/connection');
const { buildUrl } = require('../../../../../lib/router/buildUrl');
const {
  setContextValue
} = require('../../../../graphql/services/contextHelper');

module.exports = async (request, response, delegate, next) => {
  try {
    const query = select();
    query.from('coupon');
    query.andWhere('coupon.`uuid`', '=', request.params.id);
    const coupon = await query.load(pool);

    if (coupon === null) {
      response.redirect(302, buildUrl('couponGrid'));
    } else {
      setContextValue(request, 'couponId', parseInt(coupon.coupon_id, 10));
      setContextValue(request, 'couponUuid', coupon.uuid);
      setContextValue(request, 'pageInfo', {
        title: coupon.coupon,
        description: coupon.coupon
      });
      next();
    }
  } catch (e) {
    next(e);
  }
};
