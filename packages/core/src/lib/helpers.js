const path = require('path');
const { existsSync } = require('fs');
const config = require('config');

// eslint-disable-next-line no-multi-assign
const helpers = module.exports = exports = {};

helpers.getAdminCssFile = function getAdminCssFile(filePath) {
  const adminTheme = config.get('shop.adminTheme');

  return `/admin/${adminTheme}/css/${filePath}`;
};

helpers.getAdminJsFile = function getAdminJsFile(filePath) {
  const adminTheme = config.get('shop.adminTheme');
  if (existsSync(path.resolve(__dirname, '../public', 'theme', 'admin', adminTheme, filePath))) {
    return `/admin/${adminTheme}/js/${filePath}`;
  } else {
    return `/js/${filePath}`;
  }
};

helpers.getSiteCssFile = function getSiteCssFile(filePath) {
  const theme = config.get('shop.frontTheme');

  return `/site/${theme}/css/${filePath}`;
};

helpers.getSiteJsFile = function getSiteJsFile(filePath) {
  const theme = config.get('shop.frontTheme');
  if (existsSync(path.resolve(__dirname, '../public', 'theme', 'site', theme, filePath))) {
    return `/site/${theme}/js/${filePath}`;
  } else {
    return `/js/${filePath}`;
  }
};

const rootPath = (() => {
  const test = path.resolve(__dirname, '..', '..', '..', '..');
  if (existsSync(path.resolve(test, 'package-lock.json'))) {
    return test;
  } else {
    return path.resolve(__dirname, '..', '..', '..', '..', '..');
  }
})();

helpers.CONSTANTS = Object.freeze({
  ROOTPATH: rootPath,
  LIBPATH: path.resolve(__dirname),
  MOLDULESPATH: path.resolve(__dirname, '..', 'modules'),
  PUBLICPATH: path.resolve(rootPath, 'public'),
  MEDIAPATH: path.resolve(rootPath, 'media'),
  NODEMODULEPATH: path.resolve(rootPath, 'node_modules'),
  ADMINTHEMEPATH: path.resolve(rootPath, 'themes', 'admin'),
  SITETHEMEPATH: path.resolve(rootPath, 'themes', 'site'),
  CACHEPATH: path.resolve(rootPath, '.nodejscart')
});
