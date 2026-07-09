# COSMARIA

Plataforma que une **cultivo** (COSMARIA Grow) e **acompanhamento terapêutico** (COSMARIA Med) numa única conta, backend, banco de dados e IA. Monorepo Nx.

> **Toda a arquitetura e o produto estão especificados em [`docs/`](docs/)** (documentos 00–15 + Catálogo de Domínio + Ideias Futuras). Nenhuma decisão de código deve contrariar esses documentos — eles são a referência viva do projeto.

## Estado atual — Sprint 01 (bootstrap)

Apenas a fundação do monorepo. **Nenhuma regra de negócio** (Grow, Med, IA) foi implementada ainda.

## Stack (doc 13)

| Camada     | Tecnologia                                         |
| ---------- | -------------------------------------------------- |
| Backend    | Node.js + TypeScript + NestJS (`apps/api`)         |
| Mobile     | React Native + Expo (`apps/mobile`)                |
| Monorepo   | Nx (tags + enforcement de fronteiras)              |
| Banco      | PostgreSQL (schema por módulo)                     |
| Cache/Fila | Redis                                              |
| Nuvem      | Google Cloud Platform (Cloud Run)                  |
| IA/LLM     | Anthropic Claude (atrás de interface substituível) |

## Estrutura (doc 14)

```
apps/api      → Modular Monolith NestJS (o artefato deployável)
apps/mobile   → app React Native + Expo
libs/core     → Core compartilhado (domain/application/infrastructure/public-api)
libs/grow     → módulo Grow
libs/med      → módulo Med
libs/comunidade → módulo Comunidade
libs/ia       → módulo IA
libs/shared   → contracts, design-tokens, ui-components, utils
infra/        → IaC (GCP)
docs/         → documentação completa da plataforma
```

### Enforcement de arquitetura

As fronteiras entre módulos (doc 14 §6) são impostas por `@nx/enforce-module-boundaries` em `eslint.config.mjs` — um import indevido (ex.: Grow importando Med, ou o Domínio importando um SDK de nuvem) **quebra o lint/CI**, não passa em revisão.

## Comandos

```bash
npm install              # instala tudo
npm run api:serve        # sobe a API em modo watch (http://localhost:3000/v1/health)
npm run api:build        # builda a API
npm run mobile:start     # inicia o Expo (requer device/emulador)
npm run lint             # lint de todos os projetos (inclui enforcement de fronteiras)
npm run typecheck        # typecheck de todos os projetos
npm run build            # build de todos os projetos
npm run format           # formata com Prettier
npm run graph            # visualiza o grafo de dependências do Nx
```

## Infra local

```bash
docker compose up -d     # PostgreSQL + Redis locais (espelham Cloud SQL/Memorystore)
```

Copie `.env.example` para `.env` e preencha. Credenciais de GCP/Claude nunca são commitadas.
