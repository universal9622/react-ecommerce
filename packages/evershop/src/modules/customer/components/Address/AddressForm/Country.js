import React from 'react';
import PropTypes from 'prop-types';
import { Field } from '../../../../../lib/components/form/Field';

export function Country({
  allowCountries, selectedCountry, setSelectedCountry, fieldName = 'country'
}) {
  const onChange = (e) => {
    setSelectedCountry(e.target.value);
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <Field
        type="select"
        value={selectedCountry}
        label="Country"
        name={fieldName}
        placeholder="Country"
        onChange={onChange}
        validationRules={[{
          rule: 'notEmpty',
          message: 'Country is required'
        }]}
        options={allowCountries.map((c) => ({ value: c.code, text: c.name }))}
      />
    </div>
  );
}

Country.propTypes = {
  allowCountries: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedCountry: PropTypes.string.isRequired,
  formId: PropTypes.string.isRequired,
  setSelectedCountry: PropTypes.func.isRequired
};
