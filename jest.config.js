// jest.config.js
module.exports = {
    testEnvironment: 'node', // Or 'jsdom' if you're testing browser APIs
      moduleNameMapper: {
           '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
       },
    transform: {
      '^.+\\.jsx?$': 'babel-jest', // Transform JSX files with Babel
    },
  };