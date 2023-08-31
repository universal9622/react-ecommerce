/* eslint-disable no-undef, global-require */
const path = require('path');
const { scanForRoutes } = require('../../scanForRoutes');

describe('Test scanForRoutes', () => {
  it('It should thrown an exception if path is not valid', () => {
    expect(() =>
      scanForRoutes(path.resolve(__dirname, 'a/invalidPath'), true, false)
    ).toThrow(Error);
  });

  it('It should thrown an exception if methods are not valid', () => {
    expect(() =>
      scanForRoutes(path.resolve(__dirname, 'a/invalidMethod'), true, false)
    ).toThrow(Error);
  });

  it('It should return an array of routes', () => {
    const routes = scanForRoutes(path.resolve(__dirname, 'b'), true, false);
    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBe(3);
  });
});
