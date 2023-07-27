/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-closing-tag-location */
import PropTypes from 'prop-types';
import React from 'react';
import Button from '@components/common/form/Button';
import { toast } from 'react-toastify';

export default function MarkDeliveredButton({
  order: {
    orderId,
    shipmentStatus: { code }
  },
  markDeliveredApi
}) {
  if (code === 'delivered') {
    return null;
  } else {
    return (
      <Button
        title="Mark delivered"
        variant="primary"
        onAction={async () => {
          // Call the updateShipmentApi with the status set to "delivered" using fetch post request, include credentials
          const response = await fetch(markDeliveredApi, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ order_id: orderId })
          });
          const data = await response.json();
          // If the response is not ok, throw an error
          if (!data.error) {
            // Reload the page
            window.location.reload();
          } else {
            toast.error(data.error.message);
          }
        }}
      />
    );
  }
}

MarkDeliveredButton.propTypes = {
  order: PropTypes.shape({
    orderId: PropTypes.string,
    shipmentStatus: PropTypes.shape({
      code: PropTypes.string
    }).isRequired
  }).isRequired
};

export const layout = {
  areaId: 'order_actions',
  sortOrder: 10
};

export const query = `
  query Query {
    order(id: getContextValue("orderId")) {
      orderId
      shipmentStatus {
        code
      }
    },
    markDeliveredApi: url(routeId: "markDelivered")
  }
`;
