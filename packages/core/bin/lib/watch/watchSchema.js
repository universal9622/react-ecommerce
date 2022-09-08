const { normalize, resolve } = require('path');
const { CONSTANTS } = require("../../../src/lib/helpers");
const { broadcash } = require('./broadcash');

module.exports.watchSchema = function (event, path) {
  // Check if path include graphql/types
  if (!path.includes(normalize('graphql/types'))) {
    return;
  }
  console.log(event)
  if (event === 'change') {
    console.log('updating', path);
    delete require.cache[require.resolve(path)];
  }
  console.log('cleaning require cache');
  // Delete buildSchema.js cache
  delete require.cache[require.resolve(resolve(CONSTANTS.MOLDULESPATH, 'graphql/services/buildTypes'))];
  delete require.cache[require.resolve(resolve(CONSTANTS.MOLDULESPATH, 'graphql/services/buildResolvers'))];
  delete require.cache[require.resolve(resolve(CONSTANTS.MOLDULESPATH, 'graphql/services/buildSchema'))];
  delete require.cache[require.resolve(resolve(CONSTANTS.MOLDULESPATH, 'graphql/services/createGraphQL'))];
  require(resolve(CONSTANTS.MOLDULESPATH, 'graphql/services/buildSchema'));
  require(resolve(CONSTANTS.MOLDULESPATH, 'graphql/services/createGraphQL'));
  broadcash();
}