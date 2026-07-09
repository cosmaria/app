const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.base.json');

/**
 * Config dos testes de INTEGRAÇÃO (Sprint de Infraestrutura, 2026-07-09).
 * Rodam SÓ via `npm run test:integration` — separados do `npm test` (unit), porque
 * exigem Docker (Testcontainers sobe Postgres/Redis efêmeros). O timeout é alto
 * por causa do pull/boot das imagens na primeira execução.
 */
module.exports = {
  testEnvironment: 'node',
  setupFiles: ['reflect-metadata'],
  roots: ['<rootDir>/test/integration'],
  testMatch: ['**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  testTimeout: 180000,
};
