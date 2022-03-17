// eslint-disable-next-line import/no-extraneous-dependencies
const staticMiddleware = require('serve-static');
const { normalize, join } = require('path');
const { existsSync } = require('fs');
const { CONSTANTS } = require('../helpers');

// eslint-disable-next-line no-multi-assign
module.exports = exports = (request, response, next) => {
  let path;
  if (request.isAdmin === true) {
    path = normalize(request.path.replace('/admin/assets/', ''));
  } else {
    path = normalize(request.path.replace('/assets/', ''));
  }
  if (request.isAdmin === true) {
    request.originalUrl = request.originalUrl.replace('/admin/assets', '');
    request.url = request.url.replace('/admin/assets', '');
  } else {
    request.originalUrl = request.originalUrl.replace('/assets', '');
    request.url = request.url.replace('/assets', '');
  }

  if (existsSync(join(CONSTANTS.ROOTPATH, 'src/theme', path))) {
    staticMiddleware('src/theme')(request, response, next);
  } else if (existsSync(join(CONSTANTS.ROOTPATH, 'dist/theme', path))) {
    staticMiddleware('dist/theme')(request, response, next);
  } else if (existsSync(join(CONSTANTS.MEDIAPATH, path))) {
    staticMiddleware(CONSTANTS.MEDIAPATH)(request, response, next);
  } else if (existsSync(join(CONSTANTS.ROOTPATH, '.nodejscart/build', path))) {
    staticMiddleware(join(CONSTANTS.ROOTPATH, '.nodejscart/build'))(request, response, next);
  } else {
    response.status(404).send('Not Found');
  }
  // TODO: Prevent directory listing
};
