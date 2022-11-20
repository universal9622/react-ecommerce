import PropTypes from 'prop-types';

export const VariantType = PropTypes.shape({
  attributes: PropTypes.arrayOf(PropTypes.shape({
    attributeCode: PropTypes.string.isRequired,
    attributeId: PropTypes.string.isRequired,
    optionId: PropTypes.number.isRequired,
  })),
  editUrl: PropTypes.string,
  id: PropTypes.string,
  images: PropTypes.arrayOf(PropTypes.shape({

  })),
  price: PropTypes.number,
  qty: PropTypes.string,
  sku: PropTypes.string,
  status: PropTypes.number,
  variantProductId: PropTypes.number,
  visibility: PropTypes.number
});
