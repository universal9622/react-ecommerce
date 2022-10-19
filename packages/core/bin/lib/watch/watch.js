const chokidar = require('chokidar');
const { resolve, sep, normalize } = require('path');
const { CONSTANTS } = require('../../../src/lib/helpers');
const { existsSync } = require('fs');
const { getConfig } = require('../../../src/lib/util/getConfig');

function watch(calbacks = []) {
  const watcher = chokidar.watch(resolve(CONSTANTS.ROOTPATH, 'extensions/**'), {
    //ignored: /node_modules[\\/]/,
    ignoreInitial: true,
    persistent: true
  });

  if (existsSync(resolve(CONSTANTS.ROOTPATH, 'packages'))) {
    watcher.add(resolve(CONSTANTS.ROOTPATH, 'packages/core/src/**'))
  };

  // Watch themes folder
  const theme = getConfig('shop.theme');
  if (theme && existsSync(resolve(CONSTANTS.ROOTPATH, 'themes', theme))) {
    watcher.add(resolve(CONSTANTS.ROOTPATH, 'themes', theme, '**'));
  }

  watcher.on('all', (event, path) => {
    calbacks.forEach((callback) => {
      callback(event, path);
    });
  });
}

module.exports.watch = watch;