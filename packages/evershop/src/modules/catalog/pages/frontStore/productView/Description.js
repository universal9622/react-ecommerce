/* eslint-disable react/no-danger */
import PropTypes from 'prop-types';
import React from 'react';

export default function Description({ description }) {
  return (
    <div className="mt-2 md:mt-3">
      <div
        className="product-description"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  );
}

Description.propTypes = {
  description: PropTypes.string.isRequired
};
