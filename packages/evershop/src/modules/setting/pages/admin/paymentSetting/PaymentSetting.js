import PropTypes from 'prop-types';
import React from 'react';
import { toast } from 'react-toastify';
import Area from '../../../../../lib/components/Area';
import { Form } from '../../../../../lib/components/form/Form';
import SettingMenu from '../../../components/SettingMenu';

export default function PaymentSetting({ saveSettingApi }) {
  return (
    <div className="main-content-inner">
      <div className="grid grid-cols-6 gap-x-2 grid-flow-row ">
        <div className="col-span-2">
          <SettingMenu />
        </div>
        <div className="col-span-4">
          <Form
            id="paymentSettingForm"
            method="POST"
            action={saveSettingApi}
            onSuccess={(response) => {
              if (!response.error) {
                toast.success('Setting saved');
              } else {
                toast.error(response.error.message);
              }
            }}
          >
            <Area id="paymentSetting" className="grid gap-2" />
          </Form>
        </div>
      </div>
    </div>
  );
}

PaymentSetting.propTypes = {
  saveSettingApi: PropTypes.string.isRequired
};

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export const query = `
  query Query {
    saveSettingApi: url(routeId: "saveSetting")
  }
`;
