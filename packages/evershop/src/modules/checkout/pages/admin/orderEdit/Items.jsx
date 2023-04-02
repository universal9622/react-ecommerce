/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-closing-tag-location */
import PropTypes from 'prop-types';
import React from 'react';
import Area from '@components/common/Area';
import Circle from '@components/common/Circle';
import './Items.scss';
import { Card } from '@components/admin/cms/Card';
import { Thumbnail } from '@components/admin/checkout/orderEdit/items/Thumbnail';
import { Name } from '@components/admin/checkout/orderEdit/items/Name';
import { Price } from '@components/admin/checkout/orderEdit/items/Price';
import { FullfillButton } from '@components/admin/checkout/orderEdit/items/FullfillButton';
import { TrackingButton } from '@components/admin/checkout/orderEdit/items/TrackingButton';
import { AddTrackingButton } from '@components/admin/checkout/orderEdit/items/AddTrackingButton';

export default function Items({
  order: { items, shipmentStatus, shipment, fullFillApi }
}) {
  return (
    <Card
      title={
        <div className="flex space-x-1">
          <Circle variant={shipmentStatus.badge || 'new'} />
          <span className="block self-center">
            {shipmentStatus.name || 'Unknown'}
          </span>
        </div>
      }
    >
      <Card.Session>
        <table className="listing order-items">
          <tbody>
            {items.map((i, k) => (
              <tr key={k}>
                <Area
                  key={k}
                  id={`order_item_row_${i.id}`}
                  noOuter
                  item={i}
                  coreComponents={[
                    {
                      component: { default: Thumbnail },
                      props: { imageUrl: i.thumbnail, qty: i.qty },
                      sortOrder: 10,
                      id: 'productThumbnail'
                    },
                    {
                      component: { default: Name },
                      props: { name: i.productName, options: [] }, // TODO: Implement custom options
                      sortOrder: 20,
                      id: 'productName'
                    },
                    {
                      component: { default: Price },
                      props: { price: i.productPrice.text, qty: i.qty },
                      sortOrder: 30,
                      id: 'price'
                    },
                    {
                      component: { default: 'td' },
                      props: {
                        children: <span>{i.total.text}</span>,
                        key: 'total'
                      },
                      sortOrder: 40,
                      id: 'total'
                    }
                  ]}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </Card.Session>
      <Card.Session>
        <div className="flex justify-end">
          <FullfillButton createShipmentApi={fullFillApi} shipment={shipment} />
          <TrackingButton shipment={shipment} />
          <AddTrackingButton shipment={shipment} />
        </div>
      </Card.Session>
    </Card>
  );
}

Items.propTypes = {
  order: PropTypes.shape({
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        qty: PropTypes.number,
        productName: PropTypes.string,
        thumbnail: PropTypes.string,
        productPrice: PropTypes.shape({
          value: PropTypes.number,
          text: PropTypes.string
        }),
        finalPrice: PropTypes.shape({
          value: PropTypes.number,
          text: PropTypes.string
        }),
        total: PropTypes.shape({
          value: PropTypes.number,
          text: PropTypes.string
        })
      })
    ),
    shipmentStatus: PropTypes.shape({
      code: PropTypes.string,
      badge: PropTypes.string,
      progress: PropTypes.number,
      name: PropTypes.string
    }),
    shipment: PropTypes.shape({
      shipmentId: PropTypes.string,
      carrierName: PropTypes.string,
      trackingNumber: PropTypes.string,
      updateShipmentApi: PropTypes.string
    }),
    fullFillApi: PropTypes.string.isRequired
  }).isRequired
};

export const layout = {
  areaId: 'leftSide',
  sortOrder: 10
};

export const query = `
  query Query {
    order(id: getContextValue("orderId")) {
      currency
      shipment {
        shipmentId
        carrierName
        trackingNumber
        updateShipmentApi
      }
      shipmentStatus {
        code
        badge
        progress
        name
      }
      items {
        id: orderItemId
        qty
        productName
        thumbnail
        productPrice {
          value
          text
        }
        finalPrice {
          value
          text
        }
        total {
          value
          text
        }
      }
      fullFillApi
    }
  }
`;
