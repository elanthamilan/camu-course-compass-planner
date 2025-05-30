module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // If you have CSS/image imports, you might need to mock them too, e.g.:
    // '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  // Ignore transform for node_modules except for specific ES modules if needed
  // transformIgnorePatterns: [
  //   '/node_modules/(?!some-es-module-package)',
  // ],
};
