import PropTypes from 'prop-types';
import React from 'react';
import { Input } from '../../../../../lib/components/form/fields/Input';
import { RequiredProducts } from '../../../components/RequireProducts';

export default function OrderCondition({ coupon = {} }) {
  const condition = coupon?.condition || {};
  return (
    <div>
      <Input
        name="condition[order_total]"
        label="Minimum purchase amount"
        value={condition.orderTotal || null}
      />
      <Input
        name="condition[order_qty]"
        label="Minimum purchase qty"
        value={condition.orderQty || null}
      />
      <RequiredProducts requiredProducts={condition.requiredProducts || []} />
    </div>
  );
}

OrderCondition.propTypes = {
  coupon: PropTypes.shape({
    condition: PropTypes.shape({
      orderTotal: PropTypes.number,
      orderQty: PropTypes.number,
      requiredProducts: PropTypes.arrayOf(
        PropTypes.shape({
          key: PropTypes.string,
          operator: PropTypes.string,
          value: PropTypes.string,
          qty: PropTypes.string
        })
      )
    })
  })
};

OrderCondition.defaultProps = {
  coupon: {}
};

export const layout = {
  areaId: 'couponEditLeft',
  sortOrder: 10
};

export const query = `
  query Query {
    coupon(id: getContextValue('couponId', null)) {
      condition {
        orderTotal
        orderQty
        requiredProducts {
          key
          operator
          value
          qty
        }
      }
    }
  }
`;
