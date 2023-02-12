import PropTypes from 'prop-types';
import React from 'react';
import ProductList from '../../../components/product/list/List';

export default function Products({ products: { products: { items } } }) {
  return (
    <div>
      <ProductList products={items} countPerRow={3} />
      <span className="product-count italic block mt-2">
        {`${items.length} products`}
      </span>
    </div>
  );
}

Products.propTypes = {
  products: PropTypes.shape({
    products: PropTypes.shape({
      items: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        productId: PropTypes.number,
        url: PropTypes.string,
        price: PropTypes.shape({
          regular: PropTypes.shape({
            value: PropTypes.float,
            text: PropTypes.string
          }),
          special: PropTypes.shape({
            value: PropTypes.float,
            text: PropTypes.string
          })
        }),
        image: PropTypes.shape({
          alt: PropTypes.string,
          listing: PropTypes.string
        })
      }))
    })
  })
};

Products.defaultProps = {
  products: {
    products: {
      items: []
    }
  }
};

export const layout = {
  areaId: 'rightColumn',
  sortOrder: 25
};

export const query = `
  query Query {
    products: category(id: getContextValue('categoryId')) {
      products(filters: getContextValue('filtersFromUrl')) {
        items {
          ...Product
        }
      }
    }
  }`;

export const fragments = `
  fragment Product on Product {
    productId
    name
    sku
    price {
      regular {
        value
        text
      }
      special {
        value
        text
      }
    }
    image {
      alt
      url: listing
    }
    url
  }
`;
