import PropTypes from "prop-types";
import React, { useState } from 'react';

const Steps = React.createContext();
const CheckoutStepsDispatch = React.createContext();

export function CheckoutSteps({ children, value }) {
  const [steps, setSteps] = useState(value);// TODO: Consider using ajax to load steps

  const canStepDisplay = (step) => {
    const checkoutSteps = [...steps].sort(
      (a, b) => parseInt(a.sortOrder, 10) - parseInt(b.sortOrder, 10)
    );
    const index = checkoutSteps.findIndex((s) => s.id === step.id);
    if (step.isEditing === true) {
      return true;
    }

    if (step.isCompleted === true && index === steps.length - 1) return true;
    if (step.isCompleted === true || steps.findIndex((s) => s.isEditing === true) !== -1) {
      return false;
    } else {
      let flag = true;
      checkoutSteps.every((s, i) => {
        if (i >= index) {
          return false;
        } else {
          if (s.isCompleted === false) flag = false;
          return true;
        }
      });
      if (flag === true || index === 0) return true;
      else return false;
    }
  };

  const editStep = (step) => {
    setSteps(steps.map((s) => {
      if (s.id === step) return { ...s, isEditing: true };
      else return s;
    }));
  };

  const completeStep = (step) => {
    setSteps(steps.map((s) => {
      if (s.id === step) return { ...s, isCompleted: true, isEditing: false };
      else return s;
    }));
  };

  return (
    <Steps.Provider value={steps}>
      <CheckoutStepsDispatch.Provider value={{ canStepDisplay, editStep, completeStep }}>
        {children}
      </CheckoutStepsDispatch.Provider>
    </Steps.Provider>
  );
}

CheckoutSteps.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired
};

export const useCheckoutSteps = () => React.useContext(Steps);
export const useCheckoutStepsDispatch = () => React.useContext(CheckoutStepsDispatch);
