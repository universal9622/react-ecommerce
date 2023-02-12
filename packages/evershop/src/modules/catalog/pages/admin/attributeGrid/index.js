const {
  buildFilterFromUrl
} = require('../../../../../lib/util/buildFilterFromUrl');
const {
  setContextValue
} = require('../../../../graphql/services/contextHelper');

// eslint-disable-next-line no-unused-vars
module.exports = (request, response) => {
  setContextValue(request, 'pageInfo', {
    title: 'Attributes',
    description: 'Attributes'
  });
  setContextValue(request, 'filtersFromUrl', buildFilterFromUrl(request.query));
};
