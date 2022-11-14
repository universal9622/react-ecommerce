import PropTypes from 'prop-types';
import React from 'react';
import { Field } from '../../../../../../../lib/components/form/Field';

export function BillingAddress({ useShippingAddress, setUseShippingAddress }) {
  return (
    <div className='mb-1'>
      <Field
        type="checkbox"
        formId="checkoutBillingAddressForm"
        name="useShippingAddress"
        onChange={(e) => {
          if (e.target.checked) {
            setUseShippingAddress(true);
          } else {
            setUseShippingAddress(false);
          }
        }}
        label="My billing address is same as shipping address"
        isChecked={useShippingAddress === true}
      />
    </div>
  );
}

BillingAddress.propTypes = {
  setUseShippingAddress: PropTypes.func.isRequired,
  useShippingAddress: PropTypes.bool.isRequired
};
