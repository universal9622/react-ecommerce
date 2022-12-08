import React from 'react';
import { Field } from '../../../../../lib/components/form/Field';
import { Toggle } from '../../../../../lib/components/form/fields/Toggle';
import { Card } from '../../../../cms/components/admin/Card';

export default function CODPayment(
  { setting: {
    codPaymentStatus,
    codDislayName,
  }
  }
) {
  return <Card
    title={"Cash On Delivery Payment"}
  >
    <Card.Session >
      <div className='grid grid-cols-3 gap-2'>
        <div className='col-span-1 items-center flex'>
          <h4>Enable?</h4>
        </div>
        <div className='col-span-2'>
          <Toggle
            name="codPaymentStatus"
            value={codPaymentStatus}
          />
        </div>
      </div>
    </Card.Session>
    <Card.Session >
      <div className='grid grid-cols-3 gap-2'>
        <div className='col-span-1 items-center flex'>
          <h4>Dislay Name</h4>
        </div>
        <div className='col-span-2'>
          <Field
            type="text"
            name="codDislayName"
            placeholder="Dislay Name"
            value={codDislayName}
          />
        </div>
      </div>
    </Card.Session>
  </Card>;
}

export const layout = {
  areaId: 'paymentSetting',
  sortOrder: 20
}

export const query = `
  query Query {
    setting {
      codPaymentStatus
      codDislayName
    }
  }
`;