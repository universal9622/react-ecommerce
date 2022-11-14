import React from 'react';
import Area from '../../../../../lib/components/Area';
import { CheckoutSteps, useCheckoutSteps, useCheckoutStepsDispatch } from '../../../../../lib/context/checkoutSteps';
import { CheckoutProvider } from '../../../../../lib/context/checkout';
import './Checkout.scss';

function Steps() {
  return (
    <Area
      id="checkoutSteps"
      className="checkout-steps"
      coreComponents={[
      ]}
    />
  );
}

function CompletedSteps() {
  const steps = useCheckoutSteps();
  const { editStep } = useCheckoutStepsDispatch();
  const completedSteps = steps.filter(step => step.isCompleted === true);
  if (completedSteps.length === 0) {
    return null;
  }

  return <div className='checkout-completed-steps border rounded p-2 border-success'>
    {completedSteps.map((step) => {
      return <div className='grid gap-1 grid-cols-4'>
        <div className='col-span-1'><span>{step.previewTitle}</span></div>
        <div className='col-span-2'><span>{step.preview}</span></div>
        <div className='col-span-1 flex justify-end'>
          {
            step.editable && <a
              href='#'
              className='text-interactive hover:underline'
              onClick={(e) => {
                e.preventDefault();
                editStep(step.id);
              }}>Change</a>
          }
        </div>
      </div>
    })}
  </div>
}

export default function CheckoutPage({ checkout: { cartId }, placeOrderAPI, checkoutSuccessUrl }) {
  return (
    <CheckoutSteps value={[]}>
      <CheckoutProvider
        cartId={cartId}
        placeOrderAPI={placeOrderAPI}
        checkoutSuccessUrl={checkoutSuccessUrl}
      >
        <div className="page-width grid grid-cols-1 md:grid-cols-2 gap-3">
          <Area
            id="checkoutPageLeft"
            className={"mt-3"}
            coreComponents={[
              {
                component: { default: CompletedSteps },
                sortOrder: 10
              },
              {
                component: { default: Steps },
                sortOrder: 15
              }
            ]}
          />
          <Area
            id="checkoutPageRight"
          />
        </div>
      </CheckoutProvider>
    </CheckoutSteps>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
}

export const query = `
  query Query {
    checkout {
      cartId
    }
    placeOrderAPI: url(routeId: "checkoutPlaceOrder", params: [{key: "cartId", value: getContextValue("cartId")}])
    checkoutSuccessUrl: url(routeId: "checkoutSuccess")
  }
`;