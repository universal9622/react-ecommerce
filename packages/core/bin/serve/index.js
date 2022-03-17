/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable global-require */
const { readdirSync, existsSync } = require('fs');
const path = require('path');
const http = require('http');
const debug = require('debug')('express:server');

const { red, green } = require('kleur');
const ora = require('ora');
const boxen = require('boxen');
const { app } = require('./app');
const { addComponents } = require('../../src/lib/componee/addComponents');
const { getModuleMiddlewares, getAllSortedMiddlewares } = require('../../src/lib/middleware');
const { scanForRoutes } = require('../../src/lib/router/scanForRoutes');
const { getRoutes, getSiteRoutes, getAdminRoutes } = require('../../src/lib/router/routes');

const spinner = ora({
  text: green('NodeJsCart is starting'),
  spinner: 'dots12'
}).start();
spinner.start();

/* Loading modules and initilize routes, components and services */
const modules = readdirSync(path.resolve(__dirname, '../../src', 'modules'), { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

// Load routes and middleware functions

modules.forEach((module) => {
  try {
    // Load middleware functions
    getModuleMiddlewares(path.resolve(__dirname, '../../src', 'modules', module));

    // Check for routes
    if (existsSync(path.resolve(__dirname, '../../src', 'modules', module, 'controllers', 'admin'))) {
      scanForRoutes(path.resolve(__dirname, '../../src', 'modules', module, 'controllers', 'admin'), true, false);
    }

    if (existsSync(path.resolve(__dirname, '../../src', 'modules', module, 'controllers', 'site'))) {
      scanForRoutes(path.resolve(__dirname, '../../src', 'modules', module, 'controllers', 'site'), false, false);
    }

    if (existsSync(path.resolve(__dirname, '../../src', 'modules', module, 'apiControllers', 'admin'))) {
      scanForRoutes(path.resolve(__dirname, '../../src', 'modules', module, 'apiControllers', 'admin'), true, true);
    }

    if (existsSync(path.resolve(__dirname, '../../src', 'modules', module, 'apiControllers', 'site'))) {
      scanForRoutes(path.resolve(__dirname, '../../src', 'modules', module, 'apiControllers', 'site'), false, true);
    }
  } catch (e) {
    spinner.fail(`${red(e.stack)}\n`);
    process.exit(0);
  }
});

// Load components for view

modules.forEach((element) => {
  try {
    if (existsSync(path.resolve(__dirname, '../../src', 'modules', element, 'views/site/components.js'))) {
      const components = require(path.resolve(__dirname, '../../src', 'modules', element, 'views/site/components.js'));
      if (typeof components === 'object' && components !== null) {
        addComponents('site', components);
      }
    }
    if (existsSync(path.resolve(__dirname, '../../src', 'modules', element, 'views/admin/components.js'))) {
      const components = require(path.resolve(__dirname, '../../src', 'modules', element, 'views/admin/components.js'));
      if (typeof components === 'object' && components !== null) {
        addComponents('admin', components);
      }
    }
  } catch (e) {
    spinner.fail(`${red(e.stack)}\n`);
    process.exit(0);
  }
});

// TODO: load plugins (extensions), themes

const routes = getRoutes();
const siteRoutes = getSiteRoutes();
const adminRoutes = getAdminRoutes();

routes.forEach((r) => {
  app.all(r.path, (request, response, next) => {
    // eslint-disable-next-line no-underscore-dangle
    request.currentRoute = r;
    request.app.set('route', r);
    next();
  });

  /** 405 Not Allowed handle */
  app.all(r.path, (request, response, next) => {
    // eslint-disable-next-line no-underscore-dangle
    if (request.currentRoute && !request.currentRoute.method.includes(request.method)) {
      response.status(405).send('Method Not Allowed');
    } else {
      next();
    }
  });

  // eslint-disable-next-line no-underscore-dangle
  // eslint-disable-next-line no-param-reassign
  // eslint-disable-next-line no-underscore-dangle
  r.__BUILDREQUIRED__ = true;
});

/** 404 Not Found handle */
app.all('*', (request, response, next) => {
  if (!request.currentRoute) {
    response.status(404);
    request.currentRoute = siteRoutes.find((r) => r.id === 'notFound');
    next();
  } else {
    next();
  }
});

const middlewares = getAllSortedMiddlewares();

middlewares.forEach((m) => {
  if (m.routeId === null) { app.use(m.middleware); } else if (m.routeId === 'admin') {
    adminRoutes.forEach((route) => {
      if ((route.id !== 'adminStaticAsset') || m.id === 'isAdmin') {
        app.all(route.path, m.middleware);
      }
    });
  } else if (m.routeId === 'site') {
    app.all('*', (request, response, next) => {
      const route = request.currentRoute;
      if (route.isAdmin === true || route.id === 'staticAsset') {
        return next();
      }
      return m.middleware(request, response, next);
    });
  } else {
    const route = routes.find((r) => r.id === m.routeId);
    if (route !== undefined) {
      route.method.forEach((method) => {
        switch (method.toUpperCase()) {
          case 'GET':
            app.get(route.path, m.middleware);
            break;
          case 'POST':
            app.post(route.path, m.middleware);
            break;
          case 'PUT':
            app.put(route.path, m.middleware);
            break;
          case 'DELETE':
            app.delete(route.path, m.middleware);
            break;
          default:
            app.get(route.path, m.middleware);
            break;
        }
      });
    }
  }
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  // eslint-disable-next-line no-shadow
  const port = parseInt(val, 10);

  // eslint-disable-next-line no-restricted-globals
  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      spinner.fail(`${red(`${bind} requires elevated privileges`)}\n`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      spinner.fail(`${red(`${bind} is already in use`)}\n`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  spinner.succeed(green('Done!!!\n') + boxen(green('Your website is running at "http://localhost:3000"'), {
    title: 'NodeJsCart', titleAlignment: 'center', padding: 1, margin: 1, borderColor: 'green'
  }));
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
}

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
