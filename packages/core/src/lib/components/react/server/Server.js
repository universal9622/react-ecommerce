/* eslint-disable react/no-danger */
import PropTypes from 'prop-types';
import React from "react";
import Area from '../../Area';
import { Alert } from '../../modal/Alert';

function ServerHtml({ css, js, appContext }) {
  return (
    <>
      <head>
        <meta charset="utf-8" />
        <script dangerouslySetInnerHTML={{ __html: appContext }} />
        {css.map(src => {
          return <link href={src} rel="stylesheet"></link>
        })}
        <Area noOuter id="head" />
      </head>
      <body id="body">
        <div id="app" className="bg-background">
          <Alert>
            <Area id="body" className="wrapper" />
          </Alert>
        </div>
        {js.map(src => {
          return <script src={src}></script>
        })}
      </body>
    </>
  );
}

ServerHtml.propTypes = {
  js: PropTypes.arrayOf(PropTypes.string).isRequired,
  js: PropTypes.arrayOf(PropTypes.string).isRequired,
  appContext: PropTypes.string.isRequired
};

export default ServerHtml;
