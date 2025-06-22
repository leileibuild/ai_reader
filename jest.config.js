/**
 * Jest configuration file
 */
module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  // The test environment that will be used for testing
  testEnvironment: "node",

  // The glob patterns Jest uses to detect test files
  testMatch: [
    "**/tests/**/*.test.js"
  ],

  // A map from regular expressions to paths to transformers
  transform: {},

  // An array of regexp pattern strings that are matched against all modules before they are required
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  
  // Sets timeout for tests (in milliseconds)
  testTimeout: 30000,
  
  // Setup file to run before tests
  setupFilesAfterEnv: ['<rootDir>/tests/config/setup.js'],
};
