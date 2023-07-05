const { pool } = require('@evershop/evershop/src/lib/postgres/connection');
const { getConfig } = require('@evershop/evershop/src/lib/util/getConfig');
const sgMail = require('@sendgrid/mail');
const { select } = require('@evershop/postgres-query-builder');
const { createValue } = require('@evershop/evershop/src/lib/util/factory');

module.exports = async function sendOrderConfirmationEmail(data) {
  try {
    // Check if the API key is set
    const apiKey = getConfig('sendgrid.apiKey', '');
    const from = getConfig('sendgrid.from', '');

    if (!apiKey || !from) {
      return;
    }
    sgMail.setApiKey(apiKey);
    const orderPlaced = getConfig('sendgrid.events.order_placed', {});

    // Check if the we need to send the email on order placed event
    if (orderPlaced.enabled === false) {
      return;
    }

    // Check if the template is set
    if (!orderPlaced.templateId) {
      return;
    }

    // Build the email data
    const orderId = data.order_id;
    const order = await select()
      .from('order')
      .where('order_id', '=', orderId)
      .load(pool);

    if (!order) {
      return;
    }

    const emailData = order;
    order.items = await select()
      .from('order_item')
      .where('order_item_order_id', '=', order.order_id)
      .execute(pool);

    emailData.shipping_address = await select()
      .from('order_address')
      .where('order_address_id', '=', order.shipping_address_id)
      .load(pool);

    emailData.billing_address = await select()
      .from('order_address')
      .where('order_address_id', '=', order.billing_address_id)
      .load(pool);

    // Send the email
    const msg = {
      to: order.customer_email,
      subject: await createValue(
        'sendGridOrderConfirmationEmailSubject',
        'Order Confirmation'
      ),
      from: from,
      templateId: orderPlaced.templateId,
      dynamicTemplateData: await createValue('sendGridOrderData', emailData)
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error(error);
  }
};
