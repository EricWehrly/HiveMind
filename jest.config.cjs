module.exports = {
    preset: 'ts-jest',
    // testEnvironment: 'node',
    testEnvironment: 'jsdom',
    testMatch: ['**/test/**/*.test.ts'],
    transform: {
      '^.+\\.m?js$': 'babel-jest',
    },
  };
  