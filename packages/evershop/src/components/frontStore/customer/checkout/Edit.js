import PropTypes from 'prop-types';
import React from 'react';
import { toast } from 'react-toastify';
import { Form } from '@components/common/form/Form';
import { Field } from '@components/common/form/Field';
import {
  useCheckoutSteps,
  useCheckoutStepsDispatch
} from '@components/common/context/checkoutSteps';
import { useCheckout } from '@components/common/context/checkout';

export function Edit({
  customer,
  addContactInfoApi,
  email,
  setEmail,
  loginUrl
}) {
  const { completeStep } = useCheckoutStepsDispatch();

  const onSuccess = (response) => {
    if (!response.error) {
      setEmail(response.data.email);
      completeStep('contact', response.data.email);
    } else {
      toast.error(response.error.message);
    }
  };

  React.useEffect(() => {
    async function setContactIfLoggedIn() {
      if (!customer) {
        return;
      }
      // Post fetch to set contact info
      const response = await fetch(addContactInfoApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: customer.email
        })
      });
      const data = await response.json();
      if (!data.error) {
        setEmail(data.email);
        completeStep('contact', data.email);
      } else {
        toast.error(data.error.message);
      }
    }
    setContactIfLoggedIn();
  }, []);

  return (
    <div className="">
      <h4 className="mb-1 mt-1">Contact information</h4>
      {!customer && (
        <div className="mb-1">
          <span>Already have an account?</span>{' '}
          <a className="text-interactive hover:underline" href={loginUrl}>
            Login
          </a>
        </div>
      )}
      <Form
        id="checkout-contact-info-form"
        action={addContactInfoApi}
        method="POST"
        isJSON
        onSuccess={onSuccess}
        submitBtn
        btnText="Continue to shipping"
      >
        <Field
          type="text"
          formId="checkout-contact-info-form"
          name="email"
          validationRules={['notEmpty', 'email']}
          placeholder="Email"
          value={email}
        />
      </Form>
    </div>
  );
}

Edit.propTypes = {
  addContactInfoApi: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  loginUrl: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
  customer: PropTypes.shape({
    email: PropTypes.string.isRequired
  }).isRequired
};
