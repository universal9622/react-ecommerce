import React from 'react';
import PropTypes from 'prop-types';
import { useFilterDispatch } from './Filter';
import './PriceFilter.scss';

export default function Price({ areaProps: {
  currentFilters,
  priceRange: {
    min,
    max
  }
},
  setting: {
    storeLanguge: language,
    storeCurrency: currency
  }
}) {
  // Get the min price
  const minPrice = min;
  const maxPrice = max;

  const { updateFilter } = useFilterDispatch();
  const firstRender = React.useRef(true);
  const [from, setFrom] = React.useState(() => {
    const minPriceFilter = currentFilters.find((f) => f.key === 'minPrice');
    if (minPriceFilter) {
      return minPriceFilter.value;
    } else {
      return minPrice;
    }
  });

  const [to, setTo] = React.useState(() => {
    const maxPriceFilter = currentFilters.find((f) => f.key === 'maxPrice');
    if (maxPriceFilter) {
      return maxPriceFilter.value;
    } else {
      return maxPrice;
    }
  });

  React.useLayoutEffect(() => {
    const timeoutID = setTimeout(() => {
      if (firstRender.current) {
        firstRender.current = false;
      } else {
        let minValue, maxValue;
        if (from >= minPrice) {
          minValue = from;
        }
        if (to <= maxPrice) {
          maxValue = to;
        }
        if (minValue || maxValue) {
          const newFilters = currentFilters.map((f) => {
            if (f.key === 'minPrice' && minValue) {
              return {
                ...f,
                value: minValue,
              };
            }
            if (f.key === 'maxPrice' && maxValue) {
              return {
                ...f,
                value: maxValue,
              };
            }
            return f;
          });
          // Check if the minPrice filter is already in the filter
          const minPriceIndex = currentFilters.findIndex((f) => f.key === 'minPrice');
          if (minPriceIndex === -1 && minValue) {
            newFilters.push({ key: 'minPrice', value: minValue });
          }
          // Check if the maxPrice filter is already in the filter
          const maxPriceIndex = currentFilters.findIndex((f) => f.key === 'maxPrice');
          if (maxPriceIndex === -1 && maxValue) {
            newFilters.push({ key: 'maxPrice', value: maxValue });
          }

          updateFilter(newFilters);
        }
      }
    }, 800);

    return () => clearTimeout(timeoutID);
  }, [from, to]);

  const onChange = (e, direction) => {
    e.persist();
    const { value } = e.target;
    if (direction === 'min') {
      if (value > to - 5) {
        setFrom(to - 5);
      } else {
        setFrom(value);
      }
    }

    if (direction === 'max') {
      if (value - 5 < from) {
        setTo(from + 5);
      } else {
        setTo(value);
      }
    }
  };

  const f = new Intl.NumberFormat(language, { style: 'currency', currency }).format(from);
  const t = new Intl.NumberFormat(language, { style: 'currency', currency }).format(to);

  return (
    <div className="price-filter">
      <div className="filter-item-title">Price</div>
      <div className="rangeslider">
        <input
          className="min"
          type="range"
          min={minPrice}
          max={maxPrice}
          value={from}
          onChange={(e) => onChange(e, 'min')}
        />
        <div
          className="tooltip min"
        >
          <div
            className="push"
            style={
              {
                width: `calc(${(from - minPrice) / (maxPrice - minPrice) * 100}% + 3px)`,
              }
            }
          >
          </div>
          <output>{f}</output>
        </div>
        <input
          className="max"
          type="range"
          min={minPrice}
          max={maxPrice}
          value={to}
          onChange={(e) => onChange(e, 'max')}
        />
        <div
          className="tooltip max"
        >
          <div
            className="push"
            style={
              {
                width: `calc(${(to - minPrice) / (maxPrice - minPrice) * 100}% - 6px)`,
              }
            }
          >
          </div>
          <output>{t}</output>
        </div>
      </div>
    </div>
  );
}

Price.propTypes = {
  areaProps: PropTypes.shape({
    currentFilters: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string,
      value: PropTypes.string,
    })),
    priceRange: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number,
    }),
  }),
  setting: PropTypes.shape({
    storeLanguage: PropTypes.string,
    storeCurrency: PropTypes.string,
  })
};

export const layout = {
  areaId: 'productFilter',
  sortOrder: 1
};

export const query = `
query Query {
  setting {
    storeLanguage
    storeCurrency
  }
}
`