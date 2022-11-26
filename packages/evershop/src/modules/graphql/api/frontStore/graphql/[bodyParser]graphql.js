var schema = require('../../../services/buildSchema');
const { execute } = require('graphql');
const isDevelopmentMode = require('../../../../../lib/util/isDevelopmentMode');
const { validate } = require('graphql/validation');
const { parse } = require('graphql');
const { getContext } = require('../../../services/contextHelper');

module.exports = async function graphql(request, response, delegate, next) {
  const { body } = request;
  const { query, variables } = body;
  try {
    const promises = [];
    Object.keys(delegate).forEach((id) => {
      // Check if middleware is async
      if (delegate[id] instanceof Promise) {
        promises.push(delegate[id]);
      }
    });

    if (!query) {
      response.json({
        success: true,
        data: {}
      });
      return;
    }

    const document = parse(query);
    // Validate the query
    const validationErrors = validate(schema, document);
    if (validationErrors.length > 0) {
      console.log(validationErrors[0].locations);
      next(new Error(validationErrors[0].message));
    } else {
      if (isDevelopmentMode()) {
        schema = require('../../../services/buildSchema');
      }
      const data = await execute({
        schema, contextValue: getContext(request), document, variableValues: variables
      });
      if (data.errors) {
        // Create an Error instance with message and stack trace
        console.log(data.errors)
        next(new Error(data.errors[0].message));
      } else {
        response.json({
          success: true,
          data: data.data
        });
      }
    }
  } catch (error) {
    console.log('query', query);
    next(error);
  }
}