const boxen = require('boxen');
const normalizePort = require('./normalizePort');
const { success } = require('@evershop/evershop/src/lib/log/debuger');
const port = normalizePort();
/**
 * Event listener for HTTP server "listening" event.
 */
module.exports = function onListening() {
  success(
    boxen(`Your website is running at "http://localhost:${port}"`, {
      title: 'EverShop',
      titleAlignment: 'center',
      padding: 1,
      margin: 1,
      borderColor: 'green'
    })
  );
};
