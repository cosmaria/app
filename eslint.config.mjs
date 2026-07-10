import nx from '@nx/eslint-plugin';

/**
 * Enforcement de arquitetura da COSMARIA (doc 14 §6).
 *
 * Duas dimensões de tag por projeto:
 *   escopo: scope:core | scope:grow | scope:med | scope:comunidade | scope:ia | scope:shared | scope:api
 *   camada: type:domain | type:application | type:infrastructure | type:public-api | type:shared | type:app
 *
 * As regras abaixo QUEBRAM O BUILD (erro de lint) quando violadas — não são
 * apenas convenção. É o mecanismo oficial de enforcement (doc 14).
 */
export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/node_modules', '**/.nx', '**/out-tsc', 'apps/mobile/.expo'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // Um adaptador pode legitimamente ignorar um parâmetro que a PORTA exige — o
      // armazenamento local não usa o tipo de conteúdo, mas o Cloud Storage usa.
      // Prefixar com `_` declara a omissão como intencional, sem distorcer a interface.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            // ---- Regras de ESCOPO (isolamento entre módulos, doc 04 §24) ----
            {
              // Core nunca depende de módulos de produto (nenhuma seta "de volta").
              sourceTag: 'scope:core',
              onlyDependOnLibsWithTags: ['scope:core', 'scope:shared'],
            },
            {
              // Grow ⊥ Med: Grow só acessa seu próprio escopo, Core, shared,
              // e a public-api de outros módulos — nunca o interior deles.
              sourceTag: 'scope:grow',
              onlyDependOnLibsWithTags: [
                'scope:grow',
                'scope:core',
                'scope:shared',
                'type:public-api',
              ],
            },
            {
              sourceTag: 'scope:med',
              onlyDependOnLibsWithTags: [
                'scope:med',
                'scope:core',
                'scope:shared',
                'type:public-api',
              ],
            },
            {
              sourceTag: 'scope:comunidade',
              onlyDependOnLibsWithTags: [
                'scope:comunidade',
                'scope:core',
                'scope:shared',
                'type:public-api',
              ],
            },
            {
              sourceTag: 'scope:ia',
              onlyDependOnLibsWithTags: [
                'scope:ia',
                'scope:core',
                'scope:shared',
                'type:public-api',
              ],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              // O app (composition root) pode compor qualquer módulo.
              sourceTag: 'scope:api',
              onlyDependOnLibsWithTags: [
                'scope:api',
                'scope:core',
                'scope:grow',
                'scope:med',
                'scope:comunidade',
                'scope:ia',
                'scope:shared',
              ],
            },

            // ---- Regras de CAMADA (Clean Architecture, doc 04 §8) ----
            {
              // Domínio nunca conhece Aplicação nem Infraestrutura.
              // Também não pode importar SDK de nuvem/LLM (Cloud Agnostic, doc 13 §16.1).
              sourceTag: 'type:domain',
              onlyDependOnLibsWithTags: ['type:domain', 'type:shared'],
              bannedExternalImports: ['@google-cloud/*', '@anthropic-ai/*', 'pg', 'ioredis'],
            },
            {
              sourceTag: 'type:application',
              onlyDependOnLibsWithTags: [
                'type:application',
                'type:domain',
                'type:public-api',
                'type:shared',
              ],
              bannedExternalImports: ['@google-cloud/*', '@anthropic-ai/*', 'pg', 'ioredis'],
            },
            {
              // Infraestrutura é a ÚNICA camada que pode falar com o mundo externo
              // (GCP, Claude, drivers de banco) — enforça o princípio Provider Agnostic.
              sourceTag: 'type:infrastructure',
              onlyDependOnLibsWithTags: [
                'type:infrastructure',
                'type:application',
                'type:domain',
                'type:public-api',
                'type:shared',
              ],
            },
            {
              sourceTag: 'type:public-api',
              onlyDependOnLibsWithTags: [
                'type:application',
                'type:domain',
                'type:public-api',
                'type:shared',
              ],
              bannedExternalImports: ['@google-cloud/*', '@anthropic-ai/*'],
            },
            {
              sourceTag: 'type:shared',
              onlyDependOnLibsWithTags: ['type:shared'],
            },
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:app',
                'type:public-api',
                'type:application',
                'type:infrastructure',
                'type:domain',
                'type:shared',
              ],
            },
          ],
        },
      ],
    },
  },
];
