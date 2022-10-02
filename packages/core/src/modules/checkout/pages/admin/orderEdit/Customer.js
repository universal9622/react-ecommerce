import React from 'react';
import { Card } from '../../../../cms/components/admin/Card';

export default function OrderInfo({ order: { shippingAddress, billingAddress, customerFullName, customerEmail } }) {
  return (
    <Card title="Customer">
      <Card.Session>
        <a href="" className="text-interactive hover:underline block">{customerFullName}</a>
        <span>No orders</span>
      </Card.Session>
      <Card.Session title="Contact information">
        <div><a href="#" className="text-interactive hover:underline">{customerEmail}</a></div>
        <div><span>{shippingAddress.telephone}</span></div>
      </Card.Session>
      <Card.Session title="Shipping Address">
        <div><span>{shippingAddress.fullName}</span></div>
        <div><span>{shippingAddress.address1}</span></div>
        <div>
          <span>{`${shippingAddress.postcode}, ${shippingAddress.city}`}</span>
        </div>
        <div>
          <span>{`${shippingAddress.province.name}, ${shippingAddress.country.name}`}</span>
        </div>
      </Card.Session>
      <Card.Session title="Billing address">
        <div><span>{billingAddress.fullName}</span></div>
        <div><span>{billingAddress.address1}</span></div>
        <div>
          <span>{`${billingAddress.postcode}, ${billingAddress.city}`}</span>
        </div>
        <div>
          <span>{`${billingAddress.province.name}, ${billingAddress.country.name}`}</span>
        </div>
      </Card.Session>
    </Card>
  );
}

export const layout = {
  areaId: 'rightSide',
  sortOrder: 15
}

export const query = `
  query Query {
    order(id: getContextValue("orderId")) {
      customerFullName
      customerEmail
      shippingAddress {
        fullName
        city
        postcode
        province {
          code
          name
        }
        country {
          code
          name
        }
      }
      billingAddress {
        fullName
        city
        postcode
        province {
          code
          name
        }
        country {
          code
          name
        }
      }
    }
  }
`