/* eslint-disable global-require */
const path = require('path');
const { inspect } = require('util');
const { getRoutes } = require('../router/Router');
const { get } = require('../util/get');
const isProductionMode = require('../util/isProductionMode');
const { getRouteBuildPath } = require('../webpack/getRouteBuildPath');

function normalizeAssets(assets) {
  if (typeof assets === 'object' && !Array.isArray(assets) && assets !== null) {
    return Object.values(assets);
  }

  return Array.isArray(assets) ? assets : [assets];
}

function renderDevelopment(request, response) {
  const route = request.locals.webpackMatchedRoute;
  if (!route) {
    // In testing mode, we do not have devMiddleware
    response.send(`
            <html>
              <head>
                <title>Sample Html Response</title>
                <script>Sample Html Response</script>
              </head>
              <body>
              </body>
            </html>
            `);
    return;
  }
  // We can not get devMiddleware from response.locals
  // because there are 2 build (current route, and notFound)
  const devMiddleware = route.webpackMiddleware;
  const contextValue = {
    graphqlResponse: get(response, 'locals.graphqlResponse', {}),
    propsMap: get(response, 'locals.propsMap', {})
  };
  const { stats } = devMiddleware.context;
  // let stat = jsonWebpackStats.find(st => st.compilation.name === route.id);
  const { assetsByChunkName } = stats.toJson();

  const notFoundFile = request.currentRoute?.isAdmin
    ? 'adminNotFound.js'
    : 'notFound.js';
  response.send(`
            <!doctype html><html>
                <head>
                  <script>var eContext = ${inspect(contextValue, {
                    depth: 10,
                    maxArrayLength: null
                  })}</script>
                </head>
                <body>
                <div id="app" className="bg-background"></div>
                 ${normalizeAssets(assetsByChunkName[route.id])
                   .filter((p) => p.endsWith('.js'))
                   .map(
                     (p) =>
                       `<script defer src="/${
                         response.statusCode === 404 ? notFoundFile : p
                       }"></script>`
                   )
                   .join('\n')}
                </body >
            </html >
  `);
}

function renderProduction(request, response) {
  const routes = getRoutes();
  const frontNotFound = routes.find((route) => route.id === 'notFound');
  const adminNotFound = routes.find((route) => route.id === 'adminNotFound');
  const notFound = request.currentRoute?.isAdmin
    ? adminNotFound
    : frontNotFound;
  const route = response.statusCode === 404 ? notFound : request.currentRoute;
  const { renderHtml } = require(path.resolve(
    getRouteBuildPath(route),
    'server',
    'index.js'
  ));
  const assets = require(path.resolve(
    getRouteBuildPath(route),
    'client',
    'index.json'
  ));
  const contextValue = {
    graphqlResponse: get(response, 'locals.graphqlResponse', {}),
    propsMap: get(response, 'locals.propsMap', {})
  };
  const source = renderHtml(assets.js, assets.css, contextValue);
  response.send(source);
}

module.exports.render = function render(request, response) {
  if (isProductionMode()) {
    renderProduction(request, response);
  } else {
    renderDevelopment(request, response);
  }
};
