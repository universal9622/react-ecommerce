const { buildFilterFromUrl } = require("../../../../../lib/util/buildFilterFromUrl");
const { setContextValue } = require("../../../../graphql/services/contextHelper")

module.exports = (request, response) => {
  setContextValue(request, 'pageInfo', {
    title: 'Customers',
    description: 'Customers'
  });
  const query = request.query;
  setContextValue(request, 'filtersFromUrl', buildFilterFromUrl(query));
}