const jest = require('jest-mock');
module.exports = jest.fn((request, response, delegates) => {
  return 1;
});
