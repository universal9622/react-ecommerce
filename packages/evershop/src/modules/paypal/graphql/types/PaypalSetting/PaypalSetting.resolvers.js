const { getConfig } = require('../../../../../lib/util/getConfig');

module.exports = {
  Setting: {
    paypalPaymentStatus: (setting) => {
      const paypalConfig = getConfig('system.paypal', {});
      if (paypalConfig.status) {
        return paypalConfig.status;
      }
      const paypalPaymentStatus = setting.find((s) => s.name === 'paypalPaymentStatus');
      if (paypalPaymentStatus) {
        return parseInt(paypalPaymentStatus.value, 10);
      } else {
        return 0;
      }
    },
    paypalDislayName: (setting) => {
      const paypalDislayName = setting.find((s) => s.name === 'paypalDislayName');
      if (paypalDislayName) {
        return paypalDislayName.value;
      } else {
        return 'Paypal';
      }
    },
    paypalPaymentIntent: (setting) => {
      const paypalPaymentIntent = setting.find((s) => s.name === 'paypalPaymentIntent');
      if (paypalPaymentIntent) {
        return paypalPaymentIntent.value;
      } else {
        return 'CAPTURE';
      }
    },
    paypalClientId: (setting) => {
      const paypalConfig = getConfig('system.paypal', {});
      if (paypalConfig.clientId) {
        return paypalConfig.clientId;
      }
      const paypalClientId = setting.find((s) => s.name === 'paypalClientId');
      if (paypalClientId) {
        return paypalClientId.value;
      } else {
        return null;
      }
    },
    paypalClientSecret: (setting, _, { userTokenPayload }) => {
      const paypalConfig = getConfig('system.paypal', {});
      if (paypalConfig.clientSecret) {
        return '*******************************';
      }
      if (userTokenPayload && userTokenPayload?.user?.uuid) {
        const paypalClientSecret = setting.find((s) => s.name === 'paypalClientSecret');
        if (paypalClientSecret) {
          return paypalClientSecret.value;
        } else {
          return null;
        }
      } else {
        return null;
      }
    },
    paypalWebhookSecret: (setting, _, { userTokenPayload }) => {
      const paypalConfig = getConfig('system.paypal', {});
      if (paypalConfig.webhookSecret) {
        return '*******************************';
      }
      if (userTokenPayload && userTokenPayload?.user?.uuid) {
        const paypalWebhookSecret = setting.find((s) => s.name === 'paypalWebhookSecret');
        if (paypalWebhookSecret) {
          return paypalWebhookSecret.value;
        } else {
          return null;
        }
      } else {
        return null;
      }
    },
    paypalEnvironment: (setting) => {
      const paypalConfig = getConfig('system.paypal', {});
      if (paypalConfig.environment) {
        return paypalConfig.environment;
      }
      const paypalEnvironment = setting.find((s) => s.name === 'paypalEnvironment');
      if (paypalEnvironment) {
        return paypalEnvironment.value;
      } else {
        return 'https://api-m.sandbox.paypal.com';
      }
    }
  }
};
