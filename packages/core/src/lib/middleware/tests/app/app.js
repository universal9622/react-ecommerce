/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable global-require */
const path = require('path');
const { addDefaultMiddlewareFuncs } = require('../../../../../bin/lib/addDefaultMiddlewareFuncs');
const express = require('express');
const { loadModuleRoutes } = require('../../../../../bin/lib/loadModuleRoutes');
const { getModuleMiddlewares } = require('../..');
const { getRoutes } = require('../../../router/Router');
const { once } = require('events');
const { Handler } = require('../../Handler');


/** Create express app */
const app = express();

/* Loading modules and initilize routes, components and services */
const modules = [
  {
    name: 'authcopy',
    path: path.resolve(__dirname, './modules/authcopy')
  },
  {
    name: 'basecopy',
    path: path.resolve(__dirname, './modules/basecopy')
  },
  {
    name: 'graphqlcopy',
    path: path.resolve(__dirname, './modules/graphqlcopy')
  },
  {
    name: '404page',
    path: path.resolve(__dirname, './modules/404page')
  },
  {
    name: 'error',
    path: path.resolve(__dirname, './modules/error')
  },
  {
    name: 'delegate',
    path: path.resolve(__dirname, './modules/delegate')
  },
  {
    name: 'middleware',
    path: path.resolve(__dirname, './modules/handler')
  }
];

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

// TODO: load extensions, themes

const routes = getRoutes();

// Adding default middlewares
addDefaultMiddlewareFuncs(app, routes);

/** Hack for 'no route' case*/
routes.push({
  id: 'noRoute',
  path: '/*'
});
routes.forEach((route) => {
  app.all(route.path, Handler.middleware());
})

module.exports = {
  app,
  bootstrap: async (server) => {
    server.listen();
    await once(server, 'listening');
    return server.address().port;
  },
  close: (server, done) => {
    server.close(done);
  }
}


// server.listen(0, () => {
//   console.log(server.address().port);
// });