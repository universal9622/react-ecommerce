import PropTypes from 'prop-types';
import React from 'react';
import PageHeading from '../../../components/admin/PageHeading';

export default function PageEditPageHeading({ backUrl, page }) {
  return <PageHeading backUrl={backUrl} heading={page ? `Editing ${page.name}` : 'Create A New Page'} />;
}

PageEditPageHeading.propTypes = {
  backUrl: PropTypes.string.isRequired,
  page: PropTypes.shape({
    name: PropTypes.string.isRequired
  })
};

PageEditPageHeading.defaultProps = {
  page: null
};

export const layout = {
  areaId: 'content',
  sortOrder: 5
};

export const query = `
  query Query {
    page: cmsPage(id: getContextValue("cmsPageId", null)) {
      name
    }
    backUrl: url(routeId: "cmsPageGrid")
  }
`;
