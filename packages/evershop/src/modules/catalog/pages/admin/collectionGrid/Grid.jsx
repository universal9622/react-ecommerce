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
import CollectionNameRow from '@components/admin/catalog/collectionGrid/rows/CollectionNameRow';
import BasicColumnHeader from '@components/common/grid/headers/Basic';
import TextRow from '@components/common/grid/rows/TextRow';
import DummyColumnHeader from '@components/common/grid/headers/Dummy';

function Actions({ collections = [], selectedIds = [] }) {
  const { openAlert, closeAlert } = useAlertContext();
  const [isLoading, setIsLoading] = useState(false);

  const deleteCategories = async () => {
    setIsLoading(true);
    const promises = collections
      .filter((collections) => selectedIds.includes(collections.uuid))
      .map((collections) => axios.delete(collections.deleteApi));
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
          heading: `Delete ${selectedIds.length} collections`,
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
  collections: PropTypes.arrayOf(
    PropTypes.shape({
      uuid: PropTypes.string.isRequired
    })
  ).isRequired
};

export default function CollectionGrid({
  collections: { items: collections, total, currentFilters = [] }
}) {
  const page = currentFilters.find((filter) => filter.key === 'page')
    ? currentFilters.find((filter) => filter.key === 'page').value
    : 1;
  const limit = currentFilters.find((filter) => filter.key === 'limit')
    ? currentFilters.find((filter) => filter.key === 'limit').value
    : 20;
  const [selectedRows, setSelectedRows] = useState([]);

  return (
    <div className="w-2/3" style={{ margin: '0 auto' }}>
      <Card>
        <table className="listing sticky">
          <thead>
            <tr>
              <th className="align-bottom">
                <Checkbox
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRows(collections.map((c) => c.uuid));
                    } else {
                      setSelectedRows([]);
                    }
                  }}
                />
              </th>
              <Area
                className=""
                id="collectionGridHeader"
                noOuter
                coreComponents={[
                  {
                    component: {
                      default: () => (
                        <DummyColumnHeader
                          title="ID"
                          id="collectionId"
                          currentFilters={currentFilters}
                        />
                      )
                    },
                    sortOrder: 5
                  },
                  {
                    component: {
                      default: () => (
                        <BasicColumnHeader
                          title="Collection Name"
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
                        <BasicColumnHeader
                          title="Code"
                          id="code"
                          currentFilters={currentFilters}
                        />
                      )
                    },
                    sortOrder: 15
                  }
                ]}
              />
            </tr>
          </thead>
          <tbody>
            <Actions
              collections={collections}
              selectedIds={selectedRows}
              setSelectedRows={setSelectedRows}
            />
            {collections.map((c) => (
              <tr key={c.collectionId}>
                <td style={{ width: '2rem' }}>
                  <Checkbox
                    isChecked={selectedRows.includes(c.uuid)}
                    onChange={(e) => {
                      if (e.target.checked)
                        setSelectedRows(selectedRows.concat([c.uuid]));
                      else
                        setSelectedRows(
                          selectedRows.filter((r) => r !== c.uuid)
                        );
                    }}
                  />
                </td>
                <Area
                  className=""
                  id="collectionGridRow"
                  row={c}
                  noOuter
                  coreComponents={[
                    {
                      component: {
                        default: () => <TextRow text={c.collectionId} />
                      },
                      sortOrder: 5
                    },
                    {
                      component: {
                        default: () => (
                          <CollectionNameRow
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
                        default: () => <TextRow text={c.code} />
                      },
                      sortOrder: 15
                    }
                  ]}
                />
              </tr>
            ))}
          </tbody>
        </table>
        {collections.length === 0 && (
          <div className="flex w-full justify-center">
            There is no collections to display
          </div>
        )}
        <Pagination total={total} limit={limit} page={page} />
      </Card>
    </div>
  );
}

CollectionGrid.propTypes = {
  collections: PropTypes.shape({
    items: PropTypes.arrayOf(
      PropTypes.shape({
        collectionId: PropTypes.number.isRequired,
        uuid: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        code: PropTypes.string.isRequired,
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
  query Query($filters: [FilterInput]) {
    collections (filters: $filters) {
      items {
        collectionId
        uuid
        name
        code
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

export const variables = `
{
  filters: getContextValue('filtersFromUrl')
}`;
