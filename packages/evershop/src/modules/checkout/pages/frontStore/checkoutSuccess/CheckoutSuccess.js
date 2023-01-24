import React from 'react';
import Area from '../../../../../lib/components/Area';
import './CheckoutSuccess.scss';

export default function CheckoutSuccessPage({ order }) {
  return (
    <div className="page-width grid grid-cols-1 md:grid-cols-2 gap-3">
      <Area id="checkoutSuccessPageLeft" />
      <Area id="checkoutSuccessPageRight" />
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};
