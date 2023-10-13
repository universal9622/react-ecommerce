import PropTypes from 'prop-types';
import React from 'react';
import { ItemVariantOptions } from '@components/frontStore/checkout/cart/items/ItemVariantOptions';
import './Items.scss';
import ProductNoThumbnail from '@components/common/ProductNoThumbnail';

function Items({ items, displayCheckoutPriceIncludeTax }) {
  return (
    <div id="summary-items">
      <table className="listing items-table">
        <tbody>
          {items.map((item, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <tr key={index}>
              <td>
                <div className="product-thumbnail">
                  <div className="thumbnail">
                    {item.thumbnail && (
                      <img src={item.thumbnail} alt={item.productName} />
                    )}
                    {!item.thumbnail && (
                      <ProductNoThumbnail width={100} height={100} />
                    )}
                  </div>
                  <span className="qty">{item.qty}</span>
                </div>
              </td>
              <td>
                <div className="product-column">
                  <div>
                    <span className="font-semibold">{item.productName}</span>
                  </div>
                  <ItemVariantOptions
                    options={JSON.parse(item.variantOptions || '[]')}
                  />
                </div>
              </td>
              <td>
                <span>
                  {displayCheckoutPriceIncludeTax
                    ? item.total.text
                    : item.subTotal.text}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Items.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      productName: PropTypes.string.isRequired,
      qty: PropTypes.number.isRequired,
      thumbnail: PropTypes.string,
      total: PropTypes.shape({
        text: PropTypes.string.isRequired
      }).isRequired,
      variantOptions: PropTypes.string
    })
  ).isRequired,
  displayCheckoutPriceIncludeTax: PropTypes.bool.isRequired
};

export { Items };
