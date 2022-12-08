import React from 'react';
import PropTypes from 'prop-types';

export function Total({ total }) {
  return (
    <div className="summary-row">
      <span>Total</span>
      <div>
        <span></span>
        <div>{total}</div>
      </div>
    </div>
  );
}

Total.propTypes = {
  total: PropTypes.string.isRequired
};
