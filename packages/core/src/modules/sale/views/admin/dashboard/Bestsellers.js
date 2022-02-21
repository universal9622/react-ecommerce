import PropTypes from 'prop-types';
import React from 'react';
import { useAppState } from '../../../../../lib/context/app';
import { Card } from '../../../../cms/views/admin/Card';

export default function BestSellers({ listUrl }) {
  const context = useAppState();
  const currency = context.currency || 'USD';
  const products = context.bestsellers || [];

  return (
    <Card
      title="Best sellers"
      actions={[{ name: 'All products', onAction: () => { window.location.href = listUrl; } }]}
    >
      <Card.Session>
        <table className="listing bestsellers">
          <tbody>
            {products.map((p, i) => {
              const formatedPrice = new Intl.NumberFormat('en', { style: 'currency', currency }).format(p.price);
              return (
                // eslint-disable-next-line react/no-array-index-key
                <tr key={i}>
                  <td>
                    <div className="grid-thumbnail text-border border border-divider p-075 rounded flex justify-center" style={{ width: '6rem', height: '6rem' }}>
                      {p.imageUrl && <img className="self-center" src={p.imageUrl} alt="" />}
                      {!p.imageUrl && (
                        <svg className="self-center" xmlns="http://www.w3.org/2000/svg" width="2rem" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                  </td>
                  <td><a href={p.editUrl || ''} className="font-semibold hover:underline">{p.name}</a></td>
                  <td>{formatedPrice}</td>
                  <td>
                    {p.qty}
                    {' '}
                    solded
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card.Session>
    </Card>
  );
}

BestSellers.propTypes = {
  listUrl: PropTypes.string.isRequired
};
