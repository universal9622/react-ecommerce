const { getSetting } = require('../../../../setting/services/setting');

module.exports = async (request, response) => {
  // Check if Stripe is enabled
  const stripeStatus = await getSetting('stripePaymentMethod', false);
  if (parseInt(stripeStatus) === 1) {
    return {
      methodCode: 'stripe',
      methodName: await getSetting('stripeDislayName', 'Stripe')
    }
  } else {
    return;
  }
};
