import React from 'react';
import Area from '../../../../../lib/components/Area';
import { CheckoutSteps, useCheckoutSteps, useCheckoutStepsDispatch } from '../../../../../lib/context/checkoutSteps';
import { CheckoutProvider } from '../../../../../lib/context/checkout';
import './Checkout.scss';
import Chervon from '@heroicons/react/outline/ChevronRightIcon';

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

function Breadcrumb() {
  const steps = useCheckoutSteps();
  return <div className='mb-2 mt-1 flex checkout-breadcrumb'>
    {steps.map((step, index) => {
      const separator = index < steps.length - 1 ? <span className='separator'><Chervon width={10} height={10} /></span> : null;
      if (step.isCompleted === true) {
        return <span key={step.id} className='text-muted flex items-center'><span>{step.title}</span> {separator}</span>;
      } else {
        return <span key={step.id} className='text-interactive flex items-center'><span>{step.title}</span> {separator}</span>;
      }
    })}
  </div>
}

function CompletedSteps() {
  const steps = useCheckoutSteps();
  const { editStep } = useCheckoutStepsDispatch();
  const completedSteps = steps.filter((step, index) => step.isCompleted === true && index < steps.length - 1);
  if (completedSteps.length === 0) {
    return null;
  }

  return <div className='mt-1'>
    <div className='checkout-completed-steps border rounded px-2 border-divider divide-y'>
      {completedSteps.map((step) => {
        return <div key={step.id} className='grid gap-1 grid-cols-4 py-1 border-divider'>
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
  </div>
}

export default function CheckoutPage({ checkout: { cartId }, placeOrderAPI, getPaymentMethodAPI, checkoutSuccessUrl }) {
  return (
    <CheckoutSteps value={[]}>
      <CheckoutProvider
        cartId={cartId}
        placeOrderAPI={placeOrderAPI}
        getPaymentMethodAPI={getPaymentMethodAPI}
        checkoutSuccessUrl={checkoutSuccessUrl}
      >
        <div className="page-width grid grid-cols-1 md:grid-cols-2 gap-3">
          <Area
            id="checkoutPageLeft"
            coreComponents={[
              {
                component: { default: Breadcrumb },
                sortOrder: 10
              },
              {
                component: { default: CompletedSteps },
                sortOrder: 15
              },
              {
                component: { default: Steps },
                sortOrder: 20
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
    placeOrderAPI: url(routeId: "createOrder")
    getPaymentMethodAPI: url(routeId: "getPaymentMethods")
    checkoutSuccessUrl: url(routeId: "checkoutSuccess")
  }
`;