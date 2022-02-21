import PropTypes from 'prop-types';
import React from 'react';
import Area from '../../../../lib/components/Area';
import { useAppState } from '../../../../lib/context/app';
import { get } from '../../../../lib/util/get';

function BreadcrumbIcon({ backUrl }) {
  if (!backUrl) return null;
  return (
    <a href={backUrl} className="breadcrum-icon border block border-border rounded mr-075">
      <span className="flex items-center justify-center"><svg className="text-icon" viewBox="0 0 20 20" focusable="false" aria-hidden="true"><path d="M17 9H5.414l3.293-3.293a.999.999 0 1 0-1.414-1.414l-5 5a.999.999 0 0 0 0 1.414l5 5a.997.997 0 0 0 1.414 0 .999.999 0 0 0 0-1.414L5.414 11H17a1 1 0 1 0 0-2z" /></svg></span>
    </a>
  );
}

BreadcrumbIcon.propTypes = {
  backUrl: PropTypes.string
};

BreadcrumbIcon.defaultProps = {
  backUrl: undefined
};

function Heading({ heading }) {
  return <div className="self-center"><h1 className="page-heading-title">{heading}</h1></div>;
}

Heading.propTypes = {
  heading: PropTypes.string.isRequired
};

function PageHeading({ backUrl }) {
  const context = useAppState();
  const heading = get(context, 'page.heading');
  if (!heading) { return null; }

  return (
    <div className="page-heading flex justify-between items-center">
      <div className="flex justify-start space-x-1 items-center">
        <Area
          id="pageHeadingLeft"
          noOuter
          coreComponents={[
            {
              component: { default: BreadcrumbIcon },
              props: {
                backUrl
              },
              sortOrder: 0,
              id: 'breadcrumb'
            },
            {
              component: { default: Heading },
              props: {
                heading
              },
              sortOrder: 0,
              id: 'heading'
            }
          ]}
        />
      </div>
      <div className="flex justify-end space-x-1 items-center">
        <Area
          id="pageHeadingRight"
          noOuter
          coreComponents={[]}
        />
      </div>
    </div>
  );
}

PageHeading.propTypes = {
  backUrl: PropTypes.string
};

PageHeading.defaultProps = {
  backUrl: undefined
};

export default PageHeading;
