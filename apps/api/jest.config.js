module.exports = {
  rootDir: 'src',
  testMatch: [
    '<rootDir>/**/*.spec.ts'
  ],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.dto.ts',
    '!**/*.entity.ts',
    '!**/*.interface.ts',
    '!**/*.enum.ts',
    '!**/*.decorator.ts',
    '!**/*.guard.ts',
    '!**/*.strategy.ts',
    '!**/*.module.ts',
    '!**/main.ts',
    '!**/index.ts',
    '!**/test-utils/**',
    '!**/jest-setup.ts'
  ],
  coverageDirectory: '../coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test-utils/jest-setup.ts'],
  testTimeout: 30000,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  clearMocks: true,
  restoreMocks: true,
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  // TypeScript-Validierung während Tests deaktivieren
  globals: {
    'ts-jest': {
      tsconfig: {
        noEmit: false,
        skipLibCheck: true
      }
    }
  }
};
