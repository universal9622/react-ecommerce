/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/no-unstable-nested-components */
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import axios from 'axios';
import Area from '@components/common/Area';
import Pagination from '@components/common/grid/Pagination';
import { useAlertContext } from '@components/common/modal/Alert';
import { Checkbox } from '@components/common/form/fields/Checkbox';
import { Card } from '@components/admin/cms/Card';
import CategoryNameRow from '@components/admin/catalog/categoryGrid/rows/CategoryName';
import BasicColumnHeader from '@components/common/grid/headers/Basic';
import DropdownColumnHeader from '@components/common/grid/headers/Dropdown';
import StatusRow from '@components/common/grid/rows/StatusRow';
import YesNoRow from '@components/common/grid/rows/YesNoRow';

function Actions({ categories = [], selectedIds = [] }) {
  const { openAlert, closeAlert } = useAlertContext();
  const [isLoading, setIsLoading] = useState(false);

  const deleteCategories = async () => {
    setIsLoading(true);
    const promises = categories
      .filter((category) => selectedIds.includes(category.uuid))
      .map((category) => axios.delete(category.deleteApi));
    await Promise.all(promises);
    setIsLoading(false);
    // Refresh the page
    window.location.reload();
  };

  const actions = [
    {
      name: 'Delete',
      onAction: () => {
        openAlert({
          heading: `Delete ${selectedIds.length} categories`,
          content: <div>Can&apos;t be undone</div>,
          primaryAction: {
            title: 'Cancel',
            onAction: closeAlert,
            variant: 'primary'
          },
          secondaryAction: {
            title: 'Delete',
            onAction: async () => {
              await deleteCategories();
            },
            variant: 'critical',
            isLoading
          }
        });
      }
    }
  ];

  return (
    <tr>
      {selectedIds.length === 0 && null}
      {selectedIds.length > 0 && (
        <td style={{ borderTop: 0 }} colSpan="100">
          <div className="inline-flex border border-divider rounded justify-items-start">
            <a href="#" className="font-semibold pt-075 pb-075 pl-15 pr-15">
              {selectedIds.length} selected
            </a>
            {actions.map((action, index) => (
              <a
                key={index}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  action.onAction();
                }}
                className="font-semibold pt-075 pb-075 pl-15 pr-15 block border-l border-divider self-center"
              >
                <span>{action.name}</span>
              </a>
            ))}
          </div>
        </td>
      )}
    </tr>
  );
}

Actions.propTypes = {
  selectedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      uuid: PropTypes.string.isRequired
    })
  ).isRequired
};

export default function CategoryGrid({
  categories: { items: categories, total, currentFilters = [] }
}) {
  const page = currentFilters.find((filter) => filter.key === 'page')
    ? currentFilters.find((filter) => filter.key === 'page').value
    : 1;
  const limit = currentFilters.find((filter) => filter.key === 'limit')
    ? currentFilters.find((filter) => filter.key === 'limit').value
    : 20;
  const [selectedRows, setSelectedRows] = useState([]);

  return (
    <Card>
      <table className="listing sticky">
        <thead>
          <tr>
            <th className="align-bottom">
              <Checkbox
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedRows(categories.map((c) => c.uuid));
                  } else {
                    setSelectedRows([]);
                  }
                }}
              />
            </th>
            <Area
              className=""
              id="categoryGridHeader"
              noOuter
              coreComponents={[
                {
                  component: {
                    default: () => (
                      <BasicColumnHeader
                        title="Category Name"
                        id="name"
                        currentFilters={currentFilters}
                      />
                    )
                  },
                  sortOrder: 10
                },
                {
                  component: {
                    default: () => (
                      <DropdownColumnHeader
                        id="status"
                        title="Status"
                        currentFilters={currentFilters}
                        options={[
                          { value: 1, text: 'Enabled' },
                          { value: 0, text: 'Disabled' }
                        ]}
                      />
                    )
                  },
                  sortOrder: 25
                },
                {
                  component: {
                    default: () => (
                      <DropdownColumnHeader
                        id="includeInNav"
                        title="Include In Menu"
                        currentFilters={currentFilters}
                        options={[
                          { value: 1, text: 'Yes' },
                          { value: 0, text: 'No' }
                        ]}
                      />
                    )
                  },
                  sortOrder: 30
                }
              ]}
            />
          </tr>
        </thead>
        <tbody>
          <Actions
            categories={categories}
            selectedIds={selectedRows}
            setSelectedRows={setSelectedRows}
          />
          {categories.map((c) => (
            <tr key={c.categoryId}>
              <td style={{ width: '2rem' }}>
                <Checkbox
                  isChecked={selectedRows.includes(c.uuid)}
                  onChange={(e) => {
                    if (e.target.checked)
                      setSelectedRows(selectedRows.concat([c.uuid]));
                    else
                      setSelectedRows(selectedRows.filter((r) => r !== c.uuid));
                  }}
                />
              </td>
              <Area
                className=""
                id="categoryGridRow"
                row={c}
                noOuter
                coreComponents={[
                  {
                    component: {
                      default: () => (
                        <CategoryNameRow
                          id="name"
                          name={c.name}
                          url={c.editUrl}
                        />
                      )
                    },
                    sortOrder: 10
                  },
                  {
                    component: {
                      default: ({ areaProps }) => (
                        <StatusRow id="status" areaProps={areaProps} />
                      )
                    },
                    sortOrder: 25
                  },
                  {
                    component: {
                      default: ({ areaProps }) => (
                        <YesNoRow id="includeInNav" areaProps={areaProps} />
                      )
                    },
                    sortOrder: 30
                  }
                ]}
              />
            </tr>
          ))}
        </tbody>
      </table>
      {categories.length === 0 && (
        <div className="flex w-full justify-center">
          There is no category to display
        </div>
      )}
      <Pagination total={total} limit={limit} page={page} />
    </Card>
  );
}

CategoryGrid.propTypes = {
  categories: PropTypes.shape({
    items: PropTypes.arrayOf(
      PropTypes.shape({
        categoryId: PropTypes.number.isRequired,
        uuid: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        status: PropTypes.number.isRequired,
        includeInNav: PropTypes.number.isRequired,
        editUrl: PropTypes.string.isRequired,
        deleteApi: PropTypes.string.isRequired
      })
    ).isRequired,
    total: PropTypes.number.isRequired,
    currentFilters: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
        operation: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired
      })
    )
  }).isRequired
};

export const layout = {
  areaId: 'content',
  sortOrder: 20
};

export const query = `
  query Query {
    categories (filters: getContextValue("filtersFromUrl")) {
      items {
        categoryId
        uuid
        name
        status
        includeInNav
        editUrl
        deleteApi
      }
      total
      currentFilters {
        key
        operation
        value
      }
    }
  }
`;
