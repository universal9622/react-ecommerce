import PropTypes from 'prop-types';
import React from 'react';
import { useAppState } from '../../../../../../../lib/context/app';
import { get } from '../../../../../../../lib/util/get';

export function ItemOptions({ options = [] }) {
  if (options.length === 0) {
    return null;
  }
  const currency = get(useAppState(), 'currency', 'USD');
  const language = get(useAppState(), 'language', 'en');

  return (
    <div className="cart-item-options mt-05">
      <ul className="list-basic">
        {options.map((o, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={i}>
            <span className="option-name">{o.option_name}: </span>
            {o.values.map((v, k) => {
              const formatedExtraPrice = new Intl.NumberFormat(language, {
                style: 'currency',
                currency
              }).format(v.extra_price);
              return (
                // eslint-disable-next-line react/no-array-index-key
                <span key={k}>
                  {v.value_text}
                  <span className="extra-price">
                    ({formatedExtraPrice})
                  </span>{' '}
                </span>
              );
            })}
          </li>
        ))}
      </ul>
    </div>
  );
}

ItemOptions.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      option_name: PropTypes.string,
      values: PropTypes.arrayOf(
        PropTypes.shape({
          extra_price: PropTypes.number,
          value_text: PropTypes.string
        })
      )
    })
  )
};

ItemOptions.defaultProps = {
  options: []
};
