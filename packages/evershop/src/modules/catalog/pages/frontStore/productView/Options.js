/* eslint-disable react/no-array-index-key */
import PropTypes from 'prop-types';
import React from 'react';
import { MultiSelect } from '../../../../../lib/components/form/fields/MultiSelect';
import { Select } from '../../../../../lib/components/form/fields/Select';

export default function Options({ options = [] }) {
  if (options.length === 0) {
    return null;
  }

  return (
    <div className="product-single-options mt-4 mb-4">
      <div className="product-single-options-title mb-2">
        <strong>Options</strong>
      </div>
      {options.map((o, i) => {
        const values = o.values.map((v) => ({
          value: v.valueId,
          text: `${v.value} (+ ${v.extraPrice.text})`
        }));
        let FieldComponent = '';
        switch (o.optionType) {
          case 'select':
            FieldComponent = (
              <Select
                key={i}
                name={`product_custom_options[${o.optionId}][]`}
                options={values}
                validation_rules={
                  parseInt(o.isRequired, 10) === 1 ? ['notEmpty'] : []
                }
                formId="product-form"
                label={o.optionName}
              />
            );
            break;
          case 'multiselect':
            FieldComponent = (
              <MultiSelect
                key={i}
                name={`product_custom_options[${o.optionId}][]`}
                options={values}
                validation_rules={
                  parseInt(o.isRequired, 10) === 1 ? ['notEmpty'] : []
                }
                formId="product-form"
                label={o.optionName}
              />
            );
            break;
          default:
            FieldComponent = (
              <Select
                key={i}
                name={`product_custom_options[${o.optionId}][]`}
                options={values}
                validation_rules={
                  parseInt(o.isRequired, 10) === 1 ? ['notEmpty'] : []
                }
                formId="product-form"
                label={o.optionName}
              />
            );
        }
        return FieldComponent;
      })}
    </div>
  );
}

Options.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      optionId: PropTypes.number,
      isRequired: PropTypes.number,
      optionName: PropTypes.string,
      optionType: PropTypes.string
    })
  ).isRequired
};

export const layout = {
  areaId: 'productPageMiddleRight',
  sortOrder: 30
};

export const query = `
  query Query {
    product (id: getContextValue('productId')) {
      options {
        optionId
        isRequired
        optionName
        optionType
        values {
          valueId
          value
          extraPrice {
            value
            text
          }
        }
      }
    }
  }`;
