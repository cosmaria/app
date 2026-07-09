# 14 — Estrutura do Código (Documento 100% Completo)

> Status: **Rascunho para validação.** Traduz os módulos e camadas do doc 04, as entidades do doc 08, os contratos do doc 09 e a stack do doc 13 em uma estrutura de projeto real — incluindo o **mecanismo técnico** (não só recomendação) que impede import indevido entre Core, Grow, Med, Comunidade e IA.

---

## 1. Objetivos

- Definir um **monorepo único** — backend, mobile, pacotes compartilhados, infraestrutura e documentação no mesmo repositório (decisão validada).
- Definir o **mecanismo técnico concreto** de enforcement de fronteira entre módulos, não apenas uma convenção de time.
- Mapear diretamente Módulo (doc 04) × Camada (Domínio/Aplicação/Infraestrutura) para pastas/pacotes reais.

---

## 2. Problemas que Resolve

| Problema | Como este documento resolve |
|---|---|
| Regra "nenhum módulo acessa o schema/domínio de outro" (docs 04/08/09) até aqui era só documental | Enforcement automático via lint (seção 6) — violação quebra o build, não depende de disciplina humana |
| Risco de duplicar tipos entre backend e mobile | Pacote `shared/contracts` único, consumido por ambos (seção 9) |
| Onde vive o código específico de GCP/Claude (doc 13 §16.1) sem vazar para o Domínio | Regra de tag `type:infrastructure` (seção 6) |

---

## 3. Escopo

**Incluído**: ferramenta de monorepo, estrutura de pastas, sistema de tags/enforcement, convenções de nomenclatura, pacotes compartilhados, onde vive a documentação.

**Fora de escopo**: código de implementação em si (doc 15).

---

## 4. Decisão: Ferramenta de Monorepo

| Alternativa | Vantagens | Desvantagens |
|---|---|---|
| **Nx** | Enforcement de fronteira **nativo** via tags + `depConstraints` — exatamente o mecanismo pedido; geradores consistentes; cache de build/teste (relevante para CI barato, equipe pequena) | Curva de aprendizado inicial um pouco maior; suporte a Expo via plugin de comunidade (maduro, mas não tão nativo quanto o suporte web) |
| **Turborepo** | Simples, rápido, popular | Enforcement de fronteira exige configuração manual (`eslint-plugin-boundaries`), sem o sistema de tags/constraints nativo |
| **Workspaces puros (npm/pnpm)** | Zero ferramenta extra | Nenhum enforcement nativo, nenhum cache de build — todo o mecanismo da seção 6 teria que ser construído do zero |

**Decisão**: **Nx**. É a única opção com um sistema de tags e `depConstraints` já pronto para o exato problema que este documento precisa resolver — construir isso à mão sobre Turborepo/workspaces puros seria reinventar o que o Nx já oferece maduro.

---

## 5. Estrutura de Pastas do Monorepo

```
cosmaria/
├── apps/
│   ├── api/                     # NestJS - o Modular Monolith deployável (doc 04 §5)
│   └── mobile/                  # React Native + Expo (doc 13)
├── libs/
│   ├── core/
│   │   ├── domain/              # entidades, eventos de dominio, regras (doc 08 §12.1)
│   │   ├── application/         # casos de uso, portas/interfaces (doc 04 §8)
│   │   ├── infrastructure/      # adaptadores GCP/Claude (doc 13 §16.1)
│   │   └── public-api/          # interface publica consumida por Grow/Med/Comunidade/IA
│   ├── grow/
│   │   ├── domain/  · application/  · infrastructure/  · public-api/   # (ex.: ObterResumoDoLote)
│   ├── med/
│   │   ├── domain/  · application/  · infrastructure/  · public-api/
│   ├── comunidade/
│   │   ├── domain/  · application/  · infrastructure/  · public-api/
│   ├── ia/
│   │   ├── domain/  · application/  · infrastructure/  · public-api/
│   └── shared/
│       ├── contracts/           # tipos de request/response da API (doc 09), usados por api E mobile
│       ├── design-tokens/       # tokens do doc 11
│       ├── ui-components/       # biblioteca de componentes do doc 11 (React Native)
│       └── utils/                # utilitários puros, sem dependência de domínio
├── infra/                        # IaC (Terraform) para GCP — Cloud Run, Cloud SQL, Memorystore etc.
├── docs/                         # ESTE conjunto de documentos (00–15 + Catálogo de Domínio + Ideias Futuras)
└── tools/                        # geradores, configuração de lint compartilhada
```

---

## 6. Sistema de Tags e Enforcement de Fronteiras (mecanismo técnico, não recomendação)

Cada `lib` do Nx recebe **duas tags**:

- **Escopo** (módulo, doc 04): `scope:core` · `scope:grow` · `scope:med` · `scope:comunidade` · `scope:ia` · `scope:shared`
- **Camada** (Clean Architecture, doc 04 §8): `type:domain` · `type:application` · `type:infrastructure` · `type:public-api`

Regras de dependência (`depConstraints`, aplicadas via ESLint `@nx/enforce-module-boundaries` — **falha o build se violadas**):

| Regra | O que impede |
|---|---|
| `type:domain` não pode depender de `type:application` nem `type:infrastructure` | Domínio nunca conhece caso de uso nem infraestrutura (regra de dependência do Clean Architecture, doc 04 §8) |
| `type:infrastructure` é a **única** camada que pode importar SDK externo (GCP, Claude, Postgres driver) | Enforcement automático do princípio Cloud/Provider Agnostic (doc 13 §16.1) — importar `@google-cloud/*` fora de uma lib `type:infrastructure` quebra o lint |
| `scope:grow` não pode depender de `scope:med`, e vice-versa | Nenhuma dependência direta entre Grow e Med (doc 04 §24) |
| Qualquer `scope:*` só pode importar de outro `scope:*` através da lib `type:public-api` daquele escopo | Operacionaliza a "interface pública" do doc 04 §9/§23 — ex.: `med/application` só pode importar `grow/public-api`, nunca `grow/domain` ou `grow/application` diretamente |
| `scope:core` nunca depende de `scope:grow`, `scope:med`, `scope:comunidade` ou `scope:ia` | Reforça doc 04 §24 — nenhuma seta "de volta" ao Core, agora quebrando o build se violada |
| Todo `scope:*` pode depender de `scope:shared` e `scope:core` (via `public-api`) | Fundação comum, sem exceção |

**Resultado prático**: um desenvolvedor não consegue, por engano, importar `libs/med/domain` dentro de `libs/grow/application` — o lint falha antes mesmo do code review.

---

## 7. Convenção de Nomenclatura de Pacotes (aliases)

`@cosmaria/core-domain`, `@cosmaria/core-application`, `@cosmaria/core-infrastructure`, `@cosmaria/core-public-api`, `@cosmaria/grow-domain`, ... (mesmo padrão para med/comunidade/ia), `@cosmaria/shared-contracts`, `@cosmaria/shared-design-tokens`, `@cosmaria/shared-ui-components`, `@cosmaria/shared-utils`.

---

## 8. Mapeamento Camadas Clean Architecture → Pastas

| Camada (doc 04 §8) | Pasta | Conteúdo |
|---|---|---|
| Apresentação | `apps/api/src/[modulo]/controllers` | Controllers NestJS — chamam a Aplicação, nunca o Domínio direto |
| Aplicação | `libs/[modulo]/application` | Casos de uso, portas (interfaces) que a Infraestrutura implementa |
| Domínio | `libs/[modulo]/domain` | Entidades, eventos de domínio, regras — zero dependência de framework |
| Infraestrutura | `libs/[modulo]/infrastructure` | Repositórios (implementam portas), adaptadores externos (GCP, Claude) |

---

## 9. Pacotes Compartilhados

- **`shared/contracts`**: tipos TypeScript de entrada/saída de cada endpoint do doc 09 (Catálogo Consolidado) — importados tanto por `apps/api` (validação) quanto por `apps/mobile` (chamadas tipadas). Elimina uma classe inteira de bug de integração entre backend e app (justificativa central da escolha de stack, doc 13 §9).
- **`shared/design-tokens`**: tokens do doc 11 §5 — um único arquivo fonte (JSON/TS), consumido pelo tema do app mobile.
- **`shared/ui-components`**: biblioteca de componentes do doc 11 §7, implementada uma vez, usada por telas de Grow e Med (Accent Token como prop, nunca componente duplicado — doc 11 §13).
- **`shared/utils`**: funções puras sem dependência de domínio (formatação, validação genérica).

---

## 10. Interfaces Públicas entre Módulos (`public-api`)

Cada módulo (`grow`, `med`, `comunidade`, `ia`, `core`) expõe uma lib `public-api` — o único ponto de entrada permitido para outro módulo. Exemplo concreto: `grow/public-api` exporta só `ObterResumoDoLote(id)` (doc 04 §23) — nunca a entidade `Lote` completa nem o repositório. Isso torna a regra "nenhum módulo conhece detalhes internos de outro além do necessário" (diretriz original do projeto) **estrutural**, não apenas documental.

---

## 11. Onde Vive a Infraestrutura (Cloud/Provider Agnostic)

Toda chamada a GCP (Cloud Storage, Cloud SQL, Cloud Tasks) ou Anthropic Claude vive exclusivamente em libs `type:infrastructure`, implementando uma porta definida em `type:application` do mesmo módulo. A regra da seção 6 impede, por construção, que esse código vaze para `domain` ou apareça em outro módulo — trocar GCP por AWS no futuro é reimplementar as libs `infrastructure`, sem tocar em `domain`/`application` de nenhum módulo.

---

## 12. Estrutura do App Mobile (React Native + Expo)

```
apps/mobile/
├── src/
│   ├── screens/          # telas do doc 10, organizadas por app (grow/, med/, core/)
│   ├── navigation/        # sistema de navegação (doc 11 §7.4)
│   ├── theme/              # consome shared/design-tokens, aplica Accent Token por app
│   └── state/               # gerenciamento de estado do cliente
```
Nenhuma lógica de negócio vive no app — o mobile é 100% camada de apresentação, consumindo `shared/contracts` para chamadas tipadas à API.

---

## 13. Onde Vive a Documentação

A pasta `docs/` na raiz do monorepo é **este mesmo conjunto de documentos** (00–15, Catálogo de Domínio, Ideias Futuras) — a documentação não é um artefato à parte, ela acompanha o código no mesmo repositório, versionada junto (decisão natural do monorepo único).

---

## 14. Convenções de Nomenclatura de Código

- Arquivos: `kebab-case.ts`; Classes/Interfaces: `PascalCase`; variáveis/funções: `camelCase` — padrão TypeScript idiomático.
- Nomes de entidade/evento seguem exatamente o [Catálogo de Domínio](catalogo-de-dominio.md) — nenhuma tradução/apelido divergente no código.
- Testes: `*.spec.ts` ao lado do arquivo testado (unitário), `*.e2e-spec.ts` em pasta própria (ponta a ponta).

---

## 15. CI/CD e Enforcement Automático

GitHub Actions (doc 13 §14) roda, em todo PR: lint (incluindo `@nx/enforce-module-boundaries`), testes afetados (cache do Nx evita rodar tudo sempre — importante para custo/velocidade da equipe pequena), e build. **PR com violação de fronteira de módulo não passa** — o mecanismo da seção 6 é aplicado antes de qualquer revisão humana.

---

## 16. Boas Práticas

- Nenhuma lib nova nasce sem as duas tags (escopo + camada) — geradores do Nx já pedem isso.
- Nenhum PR é aprovado com `eslint-disable` na regra de fronteira — se uma exceção parecer necessária, é sinal de que a arquitetura (doc 04) precisa ser revisitada, não contornada.

---

## 17. Riscos

| Risco | Observação |
|---|---|
| Plugin Nx para Expo é menos maduro que o suporte web | Mitigável — Expo funciona bem standalone dentro de um monorepo Nx mesmo com integração parcial do plugin |
| Equipe pequena pode achar a curva inicial do Nx custosa | Compensado pelo ganho de não precisar construir enforcement manualmente (seção 4) |

---

## 18. Sugestões de Melhorias

- Gerar automaticamente as libs `public-api` a partir do Catálogo de Domínio (script), reduzindo esforço manual de manter os dois sincronizados.

---

## 19. Classificação de Escopo

Toda a estrutura desta seção é **MVP** — é a fundação de qualquer linha de código escrita a partir do doc 15.

---

## 20. Revisão Final de Arquitetura

Nenhuma limitação identificada para integrações futuras, internacionalização, escalabilidade ou novos aplicativos — pelo contrário, um novo app futuro só adiciona um novo `scope:[nome]` seguindo o mesmo padrão de tags.

---

## 21. Teste de Completude

"Uma equipe experiente conseguiria implementar esta parte do sistema utilizando apenas este documento?" — **Sim**: estrutura de pastas, ferramenta, regras de enforcement e convenções estão todas concretas e acionáveis.

---

## Decisões Consolidadas (validado com o usuário em 2026-07-08)

Estrutura de pastas e sistema de tags/enforcement (seções 5–6) confirmados integralmente. Nx é a base oficial do monorepo da COSMARIA; tags + `depConstraints` é o mecanismo oficial de enforcement arquitetural.

Este documento está **concluído**. Seguimos para o **Documento 15 — Implementação**.

---

## Artefatos para Implementação

### Checklist Técnico
- [ ] Inicializar workspace Nx com os apps (`api`, `mobile`) e libs (`core`, `grow`, `med`, `comunidade`, `ia`, `shared`) já taggeados
- [ ] Configurar `depConstraints` no ESLint conforme a tabela da seção 6
- [ ] Configurar CI (GitHub Actions) rodando lint/test/build com cache do Nx
- [ ] Criar libs `public-api` para cada módulo com as interfaces já definidas nos docs 04/09

### Dependências com Outros Módulos
Nenhuma nova — este documento organiza, não adiciona, módulos.

### Riscos Técnicos
Ver seção 17.
