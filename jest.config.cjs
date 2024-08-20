module.exports = {
    preset: 'ts-jest',
    // testEnvironment: 'node',
    testEnvironment: 'jsdom',
    testMatch: [
      '**/test/**/*.test.ts',
      '**/integration-test/**/*.test.ts',
    ],
    transform: {
      '^.+\\.m?js$': 'babel-jest',
      '^.+\\.ts$': 'ts-jest',
    },
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/$1',
    },
    testPathIgnorePatterns: ['/node_modules/', '/dist/'], // ignore tests in node_modules and dist
  };
  