module.exports = {
  preset: 'ts-jest',
  testEnvironment: '../jest/mongo-memory-environment',
  rootDir: 'src',
  collectCoverageFrom: ['**/*.ts'],
  coverageReporters: ['html', 'lcov', 'text'],
  notify: true,
};
