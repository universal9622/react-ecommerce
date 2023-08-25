const { buildUrl } = require('@evershop/evershop/src/lib/router/buildUrl');
const {
  setContextValue,
  getContextValue
} = require('../../../../graphql/services/contextHelper');
const { getCurrentCart } = require('../../../services/getCurrentCart');
const {
  translate
} = require('@evershop/evershop/src/lib/locale/translate/translate');

module.exports = async (request, response, delegate, next) => {
  const cart = await getCurrentCart(request.sessionID);
  if (!cart) {
    response.redirect(302, buildUrl('cart'));
    return;
  }
  const items = cart.getItems();

  if (items.length === 0 || cart.hasItemError()) {
    response.redirect(302, buildUrl('cart'));
  } else {
    setContextValue(request, 'pageInfo', {
      title: translate('Checkout'),
      description: translate('Checkout')
    });
    setContextValue(request, 'cart_id', cart.getData('uuid'));
    next();
  }
};
