import React from 'react';
import PropTypes from 'prop-types';
import CategoryItem from './CategoryItem';
import { useQuery } from 'urql';
import Spinner from '@components/common/Spinner';
import './CategoryTree.scss';

CategoryTree.propTypes = {};

const categoriesQuery = `
  query Query ($filters: [FilterInput]) {
    categories (filters: $filters) {
      items {
        categoryId,
        name
        path {
          name
        }
      }
    }
  }
`;

function CategoryTree({ selectedCategory, setSelectedCategory }) {
  const [result] = useQuery({
    query: categoriesQuery,
    variables: {
      filters: [{ key: 'parent', operation: '=', value: null }]
    }
  });
  const { data, fetching, error } = result;

  if (fetching) {
    return <Spinner width={30} height={30} />;
  }
  if (error) {
    return (
      <p>
        Oh no...
        {error.message}
      </p>
    );
  }
  if (!data.categories.items.length === 0) {
    return <div>There is no category</div>;
  }

  return (
    <div>
      <ul className="category-tree">
        {data.categories.items.map((category) => {
          return (
            <CategoryItem
              key={category.value}
              category={category}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          );
        })}
      </ul>
    </div>
  );
}

export default CategoryTree;
