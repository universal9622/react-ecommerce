/* eslint-disable global-require */
const path = require('path');
const { getRoutes } = require('../router/Router');
const { get } = require('../util/get');
const isProductionMode = require('../util/isProductionMode');
const { getRouteBuildPath } = require('../webpack/getRouteBuildPath');
const { getConfig } = require('../util/getConfig');
const jsesc = require('jsesc');

function normalizeAssets(assets) {
  if (typeof assets === 'object' && !Array.isArray(assets) && assets !== null) {
    return Object.values(assets);
  }

  return Array.isArray(assets) ? assets : [assets];
}

function renderDevelopment(request, response) {
  const route = request.locals.webpackMatchedRoute;
  const language = getConfig('shop.language', 'en');
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
  const safeContextValue = jsesc(contextValue, {
    json: true,
    isScriptContext: true
  });
  const { stats } = devMiddleware.context;
  // let stat = jsonWebpackStats.find(st => st.compilation.name === route.id);
  const { assetsByChunkName } = stats.toJson();

  const notFoundFile = request.currentRoute?.isAdmin
    ? 'adminNotFound.js'
    : 'notFound.js';
  const langCode = request.currentRoute?.isAdmin ? 'en' : language;
  response.send(`
            <!doctype html><html lang="${langCode}">
                <head>
                  <script>var eContext = ${safeContextValue}</script>
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
  const language = getConfig('shop.language', 'en');
  const frontNotFound = routes.find((route) => route.id === 'notFound');
  const adminNotFound = routes.find((route) => route.id === 'adminNotFound');
  const notFound = request.currentRoute?.isAdmin
    ? adminNotFound
    : frontNotFound;
  const route = response.statusCode === 404 ? notFound : request.currentRoute;
  const langCode = route.isAdmin === true ? 'en' : language;
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
  const safeContextValue = jsesc(contextValue, {
    json: true,
    isScriptContext: true
  });
  const source = renderHtml(assets.js, assets.css, safeContextValue, langCode);
  response.send(source);
}

module.exports.render = function render(request, response) {
  if (isProductionMode()) {
    renderProduction(request, response);
  } else {
    renderDevelopment(request, response);
  }
};
