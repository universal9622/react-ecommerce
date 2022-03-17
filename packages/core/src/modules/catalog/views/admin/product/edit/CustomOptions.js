/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable camelcase */
import React from 'react';
import { useAppState } from '../../../../../../lib/context/app';
import { get } from '../../../../../../lib/util/get';
import { Field } from '../../../../../../lib/components/form/Field';
import { Card } from '../../../../../cms/views/admin/Card';

export default function CustomOption() {
  const context = useAppState();

  const [options, setOptions] = React.useState(get(context, 'productOptions', []));

  const addOption = (e) => {
    e.preventDefault();
    setOptions(options.concat({
      option_id: Date.now(),
      option_name: '',
      option_type: '',
      is_required: 0,
      sort_order: ''
    }));
  };

  const removeOption = (id) => {
    setOptions(options.filter((option) => option.option_id !== id));
  };

  const addCustomOptionValue = (optionId) => {
    setOptions(options.map((o) => {
      if (parseInt(o.option_id, 10) === parseInt(optionId, 10)) {
        const values = o.values === undefined ? [] : o.values;
        values.push({
          value_id: Date.now(),
          option_id: optionId,
          extra_price: '',
          sort_order: '',
          value: ''
        });
        // eslint-disable-next-line no-param-reassign
        o.values = values;
      }
      return o;
    }));
  };

  const removeCustomOptionValue = (optionId, valueId, e) => {
    e.preventDefault();
    setOptions(options.map((o) => {
      if (parseInt(o.option_id, 10) === parseInt(optionId, 10)) {
        const values = o.values === undefined ? [] : o.values;
        // eslint-disable-next-line no-param-reassign
        o.values = values.filter((v) => parseInt(v.value_id, 10) !== parseInt(valueId, 10));
      }
      return o;
    }));
  };

  return (
    <Card
      title="Custom option"
    >
      {options.map((option) => {
        const values = option.values === undefined ? [] : option.values;
        const {
          // eslint-disable-next-line camelcase
          option_id, option_name, sort_order, option_type, is_required
        } = option;
        return (
          <Card.Session key={option_id} title={option_name || 'New option'} actions={[{ variant: 'critical', name: 'Remove option', onAction: () => { removeOption(option_id); } }]}>
            <div className="grid grid-cols-3 gap-1 mb-1">
              <div>
                <Field
                  name={`options[${option_id}][option_name]`}
                  value={option_name}
                  validationRules={['notEmpty']}
                  label="Option name"
                  type="text"
                />
              </div>
              <div>
                <Field
                  name={`options[${option_id}][option_type]`}
                  value={option_type}
                  label="Type"
                  options={[
                    { value: 'select', text: 'Single choice' },
                    { value: 'multiselect', text: 'Multiple choice' }
                  ]}
                  type="select"
                />
              </div>
              <div>
                <Field
                  name={`options[${option_id}][sort_order]`}
                  value={sort_order}
                  label="Sort order"
                  type="text"
                />
              </div>
            </div>
            <div className="mb-1">
              <Field
                name={`options[${option_id}][is_required]`}
                isChecked={parseInt(is_required, 10) === 1}
                label="This option is mandatory"
                value="1"
                type="checkbox"
              />
            </div>
            <Card.Session title="Option values" actions={[{ variant: 'interactive', name: 'Add value', onAction: () => { addCustomOptionValue(option_id); } }]}>
              <div className="grid grid-cols-4 gap-1 mt-05">
                <div>Value</div>
                <div>Extra Price</div>
                <div>Sort Order</div>
                <div />
              </div>
              {values.map((val) => {
                const {
                  // eslint-disable-next-line no-shadow
                  value_id, option_id, extra_price, sort_order, value
                } = val;
                return (
                  <div key={val.value_id} className="grid-cols-4 grid gap-1 mb-05">
                    <div>
                      <Field
                        name={`options[${option_id}][values][${value_id}][value]`}
                        value={value}
                        validationRules={['notEmpty']}
                        type="text"
                      />
                    </div>
                    <div>
                      <Field
                        name={`options[${option_id}][values][${value_id}][extra_price]`}
                        value={extra_price}
                        type="text"
                      />
                    </div>
                    <div>
                      <Field
                        name={`options[${option_id}][values][${value_id}][sort_order]`}
                        value={sort_order}
                        type="text"
                      />
                    </div>
                    <div>
                      <a href="#" onClick={(e) => { e.preventDefault(); removeCustomOptionValue(option_id, value_id, e); }} className="text-critical hover:underline">
                        Remove
                      </a>
                    </div>
                  </div>
                );
              })}
            </Card.Session>
          </Card.Session>
        );
      })}
      <Card.Session>
        <div><a href="#" onClick={(e) => { e.preventDefault(); addOption(e); }}><span className="text-interactive hover:underline">Add option</span></a></div>
      </Card.Session>
    </Card>
  );
}
