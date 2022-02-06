// eslint-disable-next-line no-multi-assign
module.exports = exports = {};

/**
 * This function check if the new middleware function has dublicated ID or not
 *
 * @param   {array}  registeredMiddlewares  The list of registered middleware functions
 * @param   {object}  newMiddleware         The new middleware
 *
 * @return  {boolean}
 */
exports.noDublicateId = function noDublicateId(registeredMiddlewares, newMiddleware) {
  if (
    registeredMiddlewares.findIndex(
      (middleware) => middleware.id === newMiddleware.id
        && (middleware.routeId === null || middleware.routeId === newMiddleware.routeId)
    ) !== -1
  ) {
    return false;
  } else {
    return true;
  }
};
