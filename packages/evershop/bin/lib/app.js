/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable global-require */
const express = require('express');
const { getModuleMiddlewares } = require('../../src/lib/middleware');
const { getRoutes } = require('../../src/lib/router/Router');
const { getCoreModules } = require('./loadModules');
const { addDefaultMiddlewareFuncs } = require('./addDefaultMiddlewareFuncs');
const { loadModuleRoutes } = require('../../src/lib/router/loadModuleRoutes');
const { Handler } = require('../../src/lib/middleware/Handler');
const { getEnabledExtensions } = require('../extension');

module.exports.createApp = () => {
  /** Create express app */
  const app = express();
  // Enable trust proxy
  app.enable('trust proxy');
  /* Loading modules and initilize routes, components and services */
  const modules = getCoreModules();

  // Load routes and middleware functions
  modules.forEach((module) => {
    try {
      // Load middleware functions
      getModuleMiddlewares(module.path);
      // Load routes
      loadModuleRoutes(module.path);
    } catch (e) {
      console.log(e);
      process.exit(0);
    }
  });

  /** Load extensions */
  const extensions = getEnabledExtensions();
  extensions.forEach((extension) => {
    try {
      // Load middleware functions
      getModuleMiddlewares(extension.resolve);
      // Load routes
      loadModuleRoutes(extension.resolve);
    } catch (e) {
      console.log(e);
      process.exit(0);
    }
  });

  const routes = getRoutes();

  // Adding default middlewares
  addDefaultMiddlewareFuncs(app, routes);

  /** Hack for 'no route' case*/
  routes.push({
    id: 'noRoute',
    path: '/*',
    method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  });

  routes.forEach((route) => {
    //app.all(route.path, Handler.middleware());
    route.method.forEach((method) => {
      switch (method.toUpperCase()) {
        case 'GET':
          app.get(route.path, Handler.middleware());
          break;
        case 'POST':
          app.post(route.path, Handler.middleware());
          break;
        case 'PUT':
          app.put(route.path, Handler.middleware());
          break;
        case 'DELETE':
          app.delete(route.path, Handler.middleware());
          break;
        case 'PATCH':
          app.patch(route.path, Handler.middleware());
          break;
        default:
          app.get(route.path, Handler.middleware());
          break;
      }
    });
  })

  return app;
};