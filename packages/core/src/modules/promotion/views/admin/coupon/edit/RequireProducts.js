import PropTypes from "prop-types";
import React from 'react';
import Area from '../../../../../../lib/components/Area';
import { Field } from "../../../../../../lib/components/form/Field";
import { Input } from "../../../../../../lib/components/form/fields/Input";

export function RequiredProducts({ requiredProducts }) {
  const [products, setProducts] = React.useState(requiredProducts);

  const addProduct = (e) => {
    e.persist();
    e.preventDefault();
    setProducts(products.concat({
      key: '',
      operator: '',
      value: '',
      qty: ''
    }));
  };

  const removeProduct = (e, index) => {
    e.persist();
    e.preventDefault();
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);
  };

  const updateProduct = (e, key, index) => {
    e.persist();
    e.preventDefault();
    const newProducts = products.map((p, i) => {
      if (i === index) {
        return { ...p, [key]: e.target.value };
      } else { return p; }
    });
    setProducts(newProducts);
  };

  return (
    <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
      <div><span>Order must contains product matched bellow conditions(All)</span></div>
      <table className="table table-auto" style={{ marginTop: 0 }}>
        <thead>
          <tr>
            <th><span>Key</span></th>
            <th><span>Operator</span></th>
            <th><span>Value</span></th>
            <th><span>Minimum quantity</span></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr key={i}>
              <td>
                <div className="form-field-container">
                  <div className="field-wrapper">
                    <select
                      name={`condition[required_product][${i}][key]`}
                      className="form-field"
                      value={p.key}
                      onChange={(e) => updateProduct(e, 'key', i)}
                    >
                      <Area
                        id="couponRequiredProductKeyList"
                        noOuter
                        coreComponents={[
                          {
                            component: { default: () => <option value="category">Category ID</option> },
                            props: {},
                            sortOrder: 10,
                            id: 'requiredProductKeyCategory'
                          },
                          {
                            component: { default: () => <option value="attribute_group">Attribute Group</option> },
                            props: {},
                            sortOrder: 20,
                            id: 'requiredProductKeyAttributeGroup'
                          },
                          {
                            component: { default: () => <option value="price">Price</option> },
                            props: {},
                            sortOrder: 30,
                            id: 'requiredProductKeyPrice'
                          },
                          {
                            component: { default: () => <option value="sku">Sku</option> },
                            props: {},
                            sortOrder: 40,
                            id: 'requiredProductKeySku'
                          }
                        ]}
                      />
                    </select>
                    <div className="field-border"></div>
                    <div className="field-suffix"><svg viewBox="0 0 20 20" width="1rem" height="1.25rem" focusable="false" aria-hidden="true"><path d="m10 16-4-4h8l-4 4zm0-12 4 4H6l4-4z"></path></svg></div>
                  </div>
                </div>
              </td>
              <td>
                <div className="form-field-container">
                  <div className="field-wrapper">
                    <select
                      name={`condition[required_product][${i}][operator]`}
                      className="form-field"
                      value={p.operator}
                      onChange={(e) => updateProduct(e, 'operator', i)}
                    >
                      <Area
                        id="couponRequiredProductOperatorList"
                        noOuter
                        coreComponents={[
                          {
                            component: { default: () => <option value="=">Equal</option> },
                            props: {},
                            sortOrder: 10,
                            id: 'couponRequiredProductOperatorEqual'
                          },
                          {
                            component: { default: () => <option value="<>">Not equal</option> },
                            props: {},
                            sortOrder: 10,
                            id: 'couponRequiredProductOperatorNotEqual'
                          },
                          {
                            component: { default: () => <option value=">">Greater</option> },
                            props: {},
                            sortOrder: 20,
                            id: 'couponRequiredProductOperatorGreater'
                          },
                          {
                            component: { default: () => <option value=">=">Greater or equal</option> },
                            props: {},
                            sortOrder: 30,
                            id: 'couponRequiredProductOperatorGreaterOrEqual'
                          },
                          {
                            component: { default: () => <option value="<">Smaller</option> },
                            props: {},
                            sortOrder: 40,
                            id: 'couponRequiredProductOperatorSmaller'
                          },
                          {
                            component: { default: () => <option value="<=">Equal or smaller</option> },
                            props: {},
                            sortOrder: 40,
                            id: 'couponRequiredProductOperatorEqualOrSmaller'
                          },
                          {
                            component: { default: () => <option value="IN">In</option> },
                            props: {},
                            sortOrder: 40,
                            id: 'couponRequiredProductOperatorIn'
                          },
                          {
                            component: { default: () => <option value="NOT IN">Not in</option> },
                            props: {},
                            sortOrder: 40,
                            id: 'couponRequiredProductOperatorNotIn'
                          }
                        ]}
                      />
                    </select>
                    <div className="field-border"></div>
                    <div className="field-suffix"><svg viewBox="0 0 20 20" width="1rem" height="1.25rem" focusable="false" aria-hidden="true"><path d="m10 16-4-4h8l-4 4zm0-12 4 4H6l4-4z"></path></svg></div>
                  </div>
                </div>
              </td>
              <td>
                <Field
                  type="text"
                  name={`condition[required_product][${i}][value]`}
                  formId="coupon-edit-form"
                  value={p.value}
                  validationRules={['notEmpty']}
                />
              </td>
              <td>
                <Field
                  type="text"
                  name={`condition[required_product][${i}][qty]`}
                  formId="coupon-edit-form"
                  value={p.qty}
                  validationRules={['notEmpty']}
                />
              </td>
              <td>
                <a href="#" className="text-critical" onClick={(e) => removeProduct(e, i)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width={'1.5rem'} height={'1.5rem'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                  </svg>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-1 flex justify-start content-center">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" width={'1.5rem'} height={'1.5rem'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div className="pl-1">
          <a href="#" onClick={(e) => addProduct(e)} className="">
            <span>Add condition</span>
          </a>
        </div>
      </div>
    </div>
  );
}

RequiredProducts.propTypes = {
  requiredProducts: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    operator: PropTypes.string,
    value: PropTypes.string,
    qty: PropTypes.string
  }))
}

RequiredProducts.defaultProps = {
  requiredProducts: []
}