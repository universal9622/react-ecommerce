const { buildUrl } = require('@evershop/evershop/src/lib/router/buildUrl');
const {
  getContextValue,
  setContextValue
} = require('../../../../graphql/services/contextHelper');
const {
  translate
} = require('@evershop/evershop/src/lib/locale/translate/translate');

module.exports = (request, response, delegate, next) => {
  // Check if the user is logged in
  const customerTokenPayload = getContextValue(request, 'customerTokenPayload');
  if (customerTokenPayload && customerTokenPayload.customer?.customerId) {
    // Redirect to admin dashboard
    response.redirect(buildUrl('homepage'));
  } else {
    setContextValue(request, 'pageInfo', {
      title: translate('Login'),
      description: translate('Login')
    });
    next();
  }
};
