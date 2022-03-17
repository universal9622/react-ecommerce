import PropTypes from 'prop-types';
import React from 'react';

export default function Logo({ homeUrl }) {
  return (
    <div className="logo">
      <a href={homeUrl} className="logo-icon">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
        </svg>
      </a>
      <a href={homeUrl} className="store-name">NodeJS Cart</a>
    </div>
  );
}

Logo.propTypes = {
  homeUrl: PropTypes.string.isRequired
};
