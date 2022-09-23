import React from 'react';
import PropTypes from 'prop-types';

export function Discount({ discount, code }) {
  if (!discount) { return null; }

  return (
    <div className="summary-row">
      <span>Discount</span>
      <div>
        <div>{code}</div>
        <div>{discount}</div>
      </div>
    </div>
  );
}

Discount.propTypes = {
  code: PropTypes.string,
  discount: PropTypes.string
};

Discount.defaultProps = {
  code: undefined,
  discount: undefined
};
