import PropTypes from 'prop-types';
import React from 'react';
import { Field } from '@components/common/form/Field';
import { Form } from '@components/common/form/Form';
import './LoginForm.scss';
import { _ } from '@evershop/evershop/src/lib/locale/translate';

export default function LoginForm({ action, homeUrl, registerUrl }) {
  const [error, setError] = React.useState(null);

  return (
    <div className="login-form flex justify-center items-center">
      <div className="login-form-inner">
        <h1 className="text-center">{_('Login')}</h1>
        {error && <div className="text-critical mb-1">{error}</div>}
        <Form
          id="loginForm"
          action={action}
          isJSON
          method="POST"
          onSuccess={(response) => {
            if (!response.error) {
              window.location.href = homeUrl;
            } else {
              setError(response.error.message);
            }
          }}
          btnText={_('SIGN IN')}
        >
          <Field
            name="email"
            type="text"
            placeholder={_('Email')}
            validationRules={['notEmpty', 'email']}
          />
          <Field
            name="password"
            type="password"
            placeholder={_('Password')}
            validationRules={['notEmpty']}
          />
        </Form>
        <div className="text-center mt-1">
          <a className="text-interactive" href={registerUrl}>
            {_('Create an account')}
          </a>
        </div>
      </div>
    </div>
  );
}

LoginForm.propTypes = {
  action: PropTypes.string.isRequired,
  homeUrl: PropTypes.string.isRequired,
  registerUrl: PropTypes.string.isRequired
};

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export const query = `
  query Query {
    homeUrl: url(routeId: "homepage")
    action: url(routeId: "createCustomerSession")
    registerUrl: url(routeId: "register")
  }
`;
