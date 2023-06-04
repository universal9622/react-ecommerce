import React from 'react';
import PropTypes from 'prop-types';
import Rate from './Rate';
import { useModal } from '@components/common/modal/useModal';
import RateForm from './RateForm';

export function Rates({ getTaxClasses, rates, addRateApi }) {
  const modal = useModal();
  return (
    <div className="my-2">
      <table className="border-collapse divide-y">
        <thead>
          <tr>
            <th className="border-none">Name</th>
            <th className="border-none">Rate</th>
            <th className="border-none">Compound</th>
            <th className="border-none">Priority</th>
            <th className="border-none">Action</th>
          </tr>
        </thead>
        {rates.map((rate) => {
          return (
            <tr key={rate.uuid} className="border-divider py-2">
              <Rate rate={rate} getTaxClasses={getTaxClasses} />
            </tr>
          );
        })}
      </table>
      <div className="mt-1">
        <a
          href="#"
          className="text-interactive"
          onClick={(e) => {
            e.preventDefault();
            modal.openModal();
          }}
        >
          + Add Rate
        </a>
      </div>
      {modal.state.showing && (
        <div className={modal.className} onAnimationEnd={modal.onAnimationEnd}>
          <div
            className="modal-wrapper flex self-center justify-center items-center"
            tabIndex={-1}
            role="dialog"
          >
            <div className="modal">
              <RateForm
                saveRateApi={addRateApi}
                closeModal={() => modal.closeModal()}
                getTaxClasses={getTaxClasses}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Rates.propTypes = {
  rates: PropTypes.arrayOf(
    PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      rate: PropTypes.number.isRequired,
      isCompound: PropTypes.bool.isRequired,
      priority: PropTypes.number.isRequired,
      country: PropTypes.string.isRequired,
      province: PropTypes.string.isRequired,
      postcode: PropTypes.string.isRequired
    })
  ).isRequired,
  getTaxClasses: PropTypes.func.isRequired,
  addRateApi: PropTypes.string.isRequired
};
