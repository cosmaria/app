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
  testMatch: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.e2e-spec.ts'],
  // Testes de integração (Docker/Testcontainers) rodam só via jest.integration.config.js.
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/test/integration/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: {
    // Componentes React Native (ui-components) são testados contra um mock leve de
    // `react-native` — só afeta specs que importam react-native (a suíte Node não).
    '^react-native$': '<rootDir>/libs/shared/ui-components/test/react-native.mock.ts',
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  },
  transform: {
    // UM único transform/config para .ts e .tsx (determinístico — evita vazamento
    // de opções entre múltiplas configs do ts-jest). `isolatedModules` (transpile,
    // sem type-check) vive no tsconfig.spec.json e permite testar o Button (JSX/RN)
    // sem exigir os tipos completos do React Native; o type-check real do
    // código-fonte continua no target `nx typecheck`.
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  collectCoverageFrom: [
    'libs/**/src/**/*.ts',
    'apps/**/src/**/*.ts',
    '!**/*.spec.ts',
    '!**/*.e2e-spec.ts',
    '!**/index.ts',
  ],
};
