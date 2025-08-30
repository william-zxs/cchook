export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.test.js'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/coverage/'],
  clearMocks: true,
  testTimeout: 10000,
  verbose: true
};