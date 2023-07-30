const config = require('config');

module.exports = () => {
  // Default order status and carriers configuration
  const orderStatusConfig = {
    order: {
      shipmentStatus: {
        processing: {
          name: 'Processing',
          badge: 'default',
          progress: 'incomplete',
          isDefault: true
        },
        shipped: {
          name: 'Shipped',
          badge: 'attention',
          progress: 'complete'
        },
        delivered: {
          name: 'Delivered',
          badge: 'success',
          progress: 'complete'
        }
      },
      paymentStatus: {
        pending: {
          name: 'Pending',
          badge: 'default',
          progress: 'incomplete',
          isDefault: true
        },
        paid: {
          name: 'Paid',
          badge: 'success',
          progress: 'complete'
        }
      }
    },
    carriers: {
      default: {
        name: 'Default'
      },
      fedex: {
        name: 'FedEx',
        trackingUrl: 'https://www.fedex.com/fedextrack/?trknbr={trackingNumber}'
      },
      usps: {
        name: 'USPS',
        trackingUrl:
          'https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1={trackingNumber}'
      },
      ups: {
        name: 'UPS',
        trackingUrl:
          'https://www.ups.com/track?loc=en_US&tracknum={trackingNumber}'
      }
    }
  };
  config.util.setModuleDefaults('oms', orderStatusConfig);
};
