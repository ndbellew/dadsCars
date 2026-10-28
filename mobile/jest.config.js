module.exports = {
  preset: 'jest-expo',
  collectCoverageFrom: ['services/matching.ts'],
  coverageThreshold: {
    global: { branches: 0, functions: 80, lines: 80, statements: 80 },
  },
};
