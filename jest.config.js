const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.base.json');

/**
 * Configuração única de testes do monorepo (doc 13 §15 — Jest + ts-jest).
 * Os aliases @cosmaria/* resolvem para o CÓDIGO-FONTE das libs (não para o dist),
 * então os testes não dependem de build prévio nem de banco de dados.
 */
module.exports = {
  testEnvironment: 'node',
  setupFiles: ['reflect-metadata'],
  roots: ['<rootDir>/apps', '<rootDir>/libs'],
  testMatch: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
  // Testes de integração (Docker/Testcontainers) rodam só via jest.integration.config.js.
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/test/integration/'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  collectCoverageFrom: [
    'libs/**/src/**/*.ts',
    'apps/**/src/**/*.ts',
    '!**/*.spec.ts',
    '!**/*.e2e-spec.ts',
    '!**/index.ts',
  ],
};
