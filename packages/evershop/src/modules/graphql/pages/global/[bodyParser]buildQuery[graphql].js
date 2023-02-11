const path = require('path');
const JSON5 = require('json5');
const { readFileSync } = require('fs');
const isDevelopmentMode = require('../../../../lib/util/isDevelopmentMode');
const isProductionMode = require('../../../../lib/util/isProductionMode');
const { getRouteBuildPath } = require('../../../../lib/webpack/getRouteBuildPath');
const { CONSTANTS } = require('../../../../lib/helpers');
const { getRoutes } = require('../../../../lib/router/Router');
// eslint-disable-next-line no-unused-vars
const { getContextValue } = require('../../services/contextHelper');

module.exports = (request, response) => {
  let query;
  if (isDevelopmentMode()) {
    let route;
    if (response.statusCode === 404) {
      if (request.currentRoute?.isAdmin) {
        route = getRoutes().find((r) => r.id === 'adminNotFound');
      } else {
        route = getRoutes().find((r) => r.id === 'notFound');
      }
    } else {
      // Get the 'query.graphql' from webpack compiler
      route = request.locals.webpackMatchedRoute;
    }
    const devMiddleware = route.webpackMiddleware;
    const { outputFileSystem } = devMiddleware.context;
    const jsonWebpackStats = devMiddleware.context.stats.toJson();
    const { outputPath } = jsonWebpackStats;

    query = outputFileSystem.readFileSync(
      path.join(outputPath, 'query.graphql'),
      'utf8'
    );
  } else if (isProductionMode()) {
    const routes = getRoutes();
    let route;
    if (response.statusCode === 404) {
      if (request.currentRoute?.isAdmin) {
        route = routes.find((r) => r.id === 'adminNotFound');
      } else {
        route = routes.find((r) => r.id === 'notFound');
      }
    } else {
      route = request.currentRoute;
    }

    const subPath = getRouteBuildPath(route);
    query = readFileSync(
      path.resolve(CONSTANTS.BUILDPATH, subPath, 'server/query.graphql'),
      'utf8'
    );
  }
  if (query) {
    // Parse the query
    // Use regex to replace "getContextValue_'base64 encoded string'"
    // from the query to the actual function
    const regex = /\\"getContextValue_([a-zA-Z0-9+/=]+)\\"/g;
    query = query.replace(regex, (match, p1) => {
      const base64 = p1;
      const decoded = Buffer.from(base64, 'base64').toString('ascii');
      // eslint-disable-next-line no-eval
      let value = eval(`getContextValue(request, ${decoded})`);

      // JSON sringify without adding double quotes to the property name
      value = JSON5.stringify(value, { quote: '"' });
      // Escape the value so we can insert it into the query
      if (value) {
        value = value.replace(/"/g, '\\"');
      }
      return value;
    });
    try {
      const json = JSON.parse(query);
      // Get all variables definition and build the operation name
      const variables = JSON.parse(json.variables);
      let operation = 'query Query';
      if (variables.defs.length > 0) {
        const variablesString = variables.defs.map((variable) => `$${variable.name}: ${variable.type}`).join(', ');
        operation += `(${variablesString})`;
      }
      request.body.graphqlQuery = `${operation} { ${json.query} } ${json.fragments}`;
      request.body.graphqlVariables = variables.values;
      request.body.propsMap = json.propsMap;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      throw error;
    }
  }
};
