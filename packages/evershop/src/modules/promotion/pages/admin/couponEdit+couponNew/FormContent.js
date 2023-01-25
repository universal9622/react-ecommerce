import React from 'react';
import Area from '../../../../../lib/components/Area';
import Button from '../../../../../lib/components/form/Button';
import { useFormContext } from '../../../../../lib/components/form/Form';
import { Card } from '../../../../cms/components/admin/Card';
import './FormContent.scss';

export default function FormContent({ gridUrl }) {
  const { state } = useFormContext();
  return (
    <>
      <div className="grid grid-cols-1 gap-2">
        <Card
          title="General"
        >
          <Card.Session>
            <Area
              id="couponEditGeneral"
              noOuter
            />
          </Card.Session>
        </Card>
        <Card
          title="Discount Type"
        >
          <Card.Session>
            <Area
              id="couponEditDiscountType"
              noOuter
            />
          </Card.Session>
        </Card>
        <div className="grid grid-cols-3 gap-x-2 grid-flow-row ">
          <div className="col-span-2 grid grid-cols-1 gap-2 auto-rows-max">
            <Card title="Order conditions">
              <Card.Session>
                <Area
                  id="couponEditLeft"
                  noOuter
                  className="col-8"
                />
              </Card.Session>
            </Card>
          </div>
          <div className="col-span-1 grid grid-cols-1 gap-2 auto-rows-max">
            <Card
              title="Customer conditions"
            >
              <Card.Session>
                <Area
                  id="couponEditRight"
                  className="col-4"
                  noOuter
                />
              </Card.Session>
            </Card>
          </div>
        </div>
      </div>
      <div className="form-submit-button flex border-t border-divider mt-15 pt-15 justify-between">
        <Button
          title="Cancel"
          variant="critical"
          outline
          onAction={
            () => {
              window.location = gridUrl;
            }
          }
        />
        <Button
          title="Save"
          onAction={
            () => {
              document
                .getElementById('couponForm')
                .dispatchEvent(
                  new Event('submit', { cancelable: true, bubbles: true })
                );
            }
          }
          isLoading={state === 'submitting'}
        />
      </div>
    </>
  );
}

export const layout = {
  areaId: 'couponForm',
  sortOrder: 10
};

export const query = `
  query Query {
    gridUrl: url(routeId: "couponGrid")
  }
`;
