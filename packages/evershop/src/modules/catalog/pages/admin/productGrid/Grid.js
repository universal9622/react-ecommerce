import PropTypes from 'prop-types';
import React, { useState } from 'react';
import axios from 'axios';
import Area from '../../../../../lib/components/Area';
import Pagination from '../../../../../lib/components/grid/Pagination';
import { Checkbox } from '../../../../../lib/components/form/fields/Checkbox';
import { useAlertContext } from '../../../../../lib/components/modal/Alert';
import ProductNameRow from './rows/ProductName';
import StatusRow from '../../../../../lib/components/grid/rows/StatusRow';
import ProductPriceRow from './rows/PriceRow';
import BasicRow from '../../../../../lib/components/grid/rows/BasicRow';
import ThumbnailRow from './rows/ThumbnailRow';
import BasicColumnHeader from '../../../../../lib/components/grid/headers/Basic';
import FromToColumnHeader from '../../../../../lib/components/grid/headers/FromTo';
import DropdownColumnHeader from '../../../../../lib/components/grid/headers/Dropdown';
import { Card } from '../../../../cms/components/admin/Card';
import DummyColumnHeader from '../../../../../lib/components/grid/headers/Dummy';
import QtyRow from './rows/QtyRow';

function Actions({ products = [], selectedIds = [] }) {
  const { openAlert, closeAlert, dispatchAlert } = useAlertContext();
  const [isLoading, setIsLoading] = useState(false);

  const updateProducts = async (status) => {
    setIsLoading(true);
    const promises = products.filter((product) => selectedIds.includes(product.uuid)).map((product) => {
      return axios.patch(product.updateApi, {
        status: status
      });
    });
    await Promise.all(promises);
    setIsLoading(false);
    // Refresh the page
    window.location.reload();
  }

  const deleteProducts = async () => {
    setIsLoading(true);
    const promises = products.filter((product) => selectedIds.includes(product.uuid)).map((product) => {
      return axios.delete(product.deleteApi);
    });
    await Promise.all(promises);
    setIsLoading(false);
    // Refresh the page
    window.location.reload();
  }

  const actions = [
    {
      name: 'Disable',
      onAction: () => {
        openAlert({
          heading: `Disable ${selectedIds.length} products`,
          content: 'Are you sure?',
          primaryAction: {
            title: 'Cancel',
            onAction: closeAlert,
            variant: 'primary'
          },
          secondaryAction: {
            title: 'Disable',
            onAction: async () => {
              await updateProducts(0);
            },
            variant: 'critical',
            isLoading: false
          }
        });
      }
    },
    {
      name: 'Enable',
      onAction: () => {
        openAlert({
          heading: `Enable ${selectedIds.length} products`,
          content: 'Are you sure?',
          primaryAction: {
            title: 'Cancel',
            onAction: closeAlert,
            variant: 'primary'
          },
          secondaryAction: {
            title: 'Enable',
            onAction: async () => {
              await updateProducts(1);
            },
            variant: 'critical',
            isLoading: false
          }
        });
      }
    },
    {
      name: 'Delete',
      onAction: () => {
        openAlert({
          heading: `Delete ${selectedIds.length} products`,
          content: <div>Can&apos;t be undone</div>,
          primaryAction: {
            title: 'Cancel',
            onAction: closeAlert,
            variant: 'primary'
          },
          secondaryAction: {
            title: 'Delete',
            onAction: async () => {
              await deleteProducts();
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
      {selectedIds.length === 0 && (null)}
      {selectedIds.length > 0 && (
        <td style={{ borderTop: 0 }} colSpan="100">
          <div className="inline-flex border border-divider rounded justify-items-start">
            <a href="#" className="font-semibold pt-075 pb-075 pl-15 pr-15">
              {selectedIds.length}
              {' '}
              selected
            </a>
            {actions.map((action) => <a href="#" onClick={(e) => { e.preventDefault(); action.onAction(); }} className="font-semibold pt-075 pb-075 pl-15 pr-15 block border-l border-divider self-center"><span>{action.name}</span></a>)}
          </div>
        </td>
      )}
    </tr>
  );
}

Actions.propTypes = {
  selectedIds: PropTypes.arrayOf(PropTypes.number).isRequired
};

export default function ProductGrid({ products: { items: products, total, currentFilters = [] }, disableProductUrl, enableProductsUrl, deleteProductsUrl }) {
  const page = currentFilters.find((filter) => filter.key === 'page') ? currentFilters.find((filter) => filter.key === 'page')['value'] : 1;
  const limit = currentFilters.find((filter) => filter.key === 'limit') ? currentFilters.find((filter) => filter.key === 'limit')['value'] : 20;
  const [selectedRows, setSelectedRows] = useState([]);

  return (
    <Card>
      <table className="listing sticky">
        <thead>
          <tr>
            <th className="align-bottom">
              <Checkbox onChange={(e) => {
                if (e.target.checked)
                  setSelectedRows(products.map((p) => p.uuid));
                else
                  setSelectedRows([]);
              }}
              />
            </th>
            <Area
              id="productGridHeader"
              noOuter
              coreComponents={
                [
                  {
                    component: { default: () => <DummyColumnHeader /> },
                    sortOrder: 5
                  },
                  {
                    component: { default: () => <BasicColumnHeader title="Product Name" id='name' currentFilters={currentFilters} /> },
                    sortOrder: 10
                  },
                  {
                    component: { default: () => <FromToColumnHeader id='price' title='Price' currentFilters={currentFilters} /> },
                    sortOrder: 15
                  },
                  {
                    component: { default: () => <BasicColumnHeader title="SKU" id='sku' currentFilters={currentFilters} /> },
                    sortOrder: 20
                  },
                  {
                    component: { default: () => <BasicColumnHeader title="Qty" id='qty' currentFilters={currentFilters} /> },
                    sortOrder: 25
                  },
                  {
                    component: { default: () => <DropdownColumnHeader id='status' title='Status' currentFilters={currentFilters} options={[{ value: 1, text: 'Enabled' }, { value: 0, text: 'Disabled' }]} /> },
                    sortOrder: 30
                  }
                ]
              }
            />
          </tr>
        </thead>
        <tbody>
          <Actions
            products={products}
            selectedIds={selectedRows}
            setSelectedRows={setSelectedRows}
          />
          {products.map((p) => (
            <tr key={p.uuid}>
              <td>
                <Checkbox
                  isChecked={selectedRows.includes(p.uuid)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRows(selectedRows.concat([p.uuid]));
                    } else {
                      setSelectedRows(selectedRows.filter((row) => row !== p.uuid));
                    }
                  }}
                />
              </td>
              <Area
                id="productGridRow"
                row={p}
                noOuter
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                coreComponents={[
                  {
                    component: { default: () => <ThumbnailRow src={p.image?.thumb} name={p.name} /> },
                    sortOrder: 5
                  },
                  {
                    component: { default: ({ areaProps }) => <ProductNameRow id='name' name={p.name} url={p.editUrl} /> },
                    sortOrder: 10
                  },
                  {
                    component: { default: ({ areaProps }) => <ProductPriceRow areaProps={areaProps} /> },
                    sortOrder: 15
                  },
                  {
                    component: { default: ({ areaProps }) => <BasicRow id='sku' areaProps={areaProps} /> },
                    sortOrder: 20
                  },
                  {
                    component: { default: () => <QtyRow qty={p.inventory?.qty} /> },
                    sortOrder: 25
                  },
                  {
                    component: { default: ({ areaProps }) => <StatusRow id='status' areaProps={areaProps} /> },
                    sortOrder: 30
                  }
                ]}
              />
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0
        && <div className="flex w-full justify-center">There is no product to display</div>}
      <Pagination total={total} limit={limit} page={page} />
    </Card>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 20
}

export const query = `
  query Query {
    products (filters: getContextValue("filtersFromUrl")) {
      items {
        productId
        uuid
        name
        image {
          thumb
        }
        sku
        status
        inventory {
          qty
        }
        price {
          regular {
            value
            text
          }
        }
        editUrl
        updateApi
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