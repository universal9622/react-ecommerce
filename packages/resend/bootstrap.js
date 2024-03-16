const { getConfig } = require('@evershop/evershop/src/lib/util/getConfig');
const { addProcessor } = require('@evershop/evershop/src/lib/util/registry');
const config = require('config');

module.exports = () => {
  const resendConfig = {
    from: 'Customer Service <hello@resend.dev>',
    events: {
      order_placed: {
        subject: 'Order Confirmation',
        enabled: true,
        templatePath: undefined // This is the path to the email template. Starting from the root of the project.
      },
      reset_password: {
        subject: 'Reset Password',
        enabled: true,
        templatePath: undefined // This is the path to the email template. Starting from the root of the project.
      },
      customer_registered: {
        subject: 'Welcome to Evershop',
        enabled: true,
        templatePath: undefined // This is the path to the email template. Starting from the root of the project.
      }
    }
  };
  config.util.setModuleDefaults('resend', resendConfig);
  // Add a processor to proceed the email data before sending
  addProcessor('resend_order_confirmation_email_data', (order) => {
    // Convert the order.created_at to a human readable date
    const locale = getConfig('shop.language', 'en');
    const options = { year: 'numeric', month: 'long', day: 'numeric' };

    // eslint-disable-next-line no-param-reassign
    order.created_at = new Date(order.created_at).toLocaleDateString(
      locale,
      options
    );

    // Add the order total text including the currency
    // eslint-disable-next-line no-param-reassign
    order.grand_total_text = Number(order.grand_total).toLocaleString(locale, {
      style: 'currency',
      currency: order.currency
    });

    return order;
  });
};
