# 13 — Stack Tecnológica (Documento 100% Completo)

> Status: **Rascunho para validação.** Primeira decisão de tecnologia concreta do projeto — materializa a arquitetura já definida (Modular Monolith, Clean Architecture, DDD, EDA seletivo, schema por módulo — doc 04) para uma equipe pequena e genérica (doc 12), pensando em 10 anos de manutenção, não em popularidade momentânea.

---

## 1. Objetivos

- Recomendar uma **stack única e coesa** — não a melhor peça isolada, a melhor combinação para o projeto como um todo.
- Comparar objetivamente as alternativas relevantes em cada decisão, com vantagens, desvantagens, motivo da escolha e impacto em custo, produtividade, escalabilidade, IA, internacionalização e manutenção de longo prazo.
- Escolher uma linguagem/ecossistema de backend, uma stack mobile multiplataforma (React Native **ou** Flutter, uma só), e um provedor de nuvem — todos justificados tecnicamente, não por popularidade.

---

## 2. Problemas que Resolve

| Problema | Como este documento resolve |
|---|---|
| Toda a documentação até aqui é tecnologia-agnóstica por decisão (docs 04/08/09/11) | Este é o documento que finalmente escolhe, com justificativa completa |
| Risco de escolher tecnologia por modismo em vez de adequação real ao projeto | Metodologia de avaliação consistente (seção 4) aplicada a cada decisão |
| Risco de otimizar cada peça isoladamente e obter uma combinação ruim no conjunto | Seção 16 (Stack Oficial) avalia o conjunto, não só as partes |

---

## 3. Escopo

**Incluído**: linguagem/framework de backend, banco de dados, cache/fila, mobile, nuvem, armazenamento de objetos, provedor de IA/LLM, observabilidade, CI/CD, testes.

**Fora de escopo**: estrutura de pastas/repositórios (doc 14), código de implementação (doc 15).

---

## 4. Metodologia de Avaliação

Toda decisão relevante desta seção é avaliada nas mesmas 6 dimensões, para permitir comparação justa:

**Custo** · **Produtividade** (para a equipe pequena do doc 12) · **Escalabilidade** (até milhões de usuários, doc 00) · **IA** (suporte a integração e ao Motor de Correlação/Explicabilidade do doc 05) · **Internacionalização** (doc 08 §8/§10) · **Manutenção de longo prazo** (horizonte de 10 anos, doc 00).

---

## 5. Decisão: Linguagem/Ecossistema de Backend

| Alternativa | Vantagens | Desvantagens |
|---|---|---|
| **Node.js + TypeScript** | Mesma linguagem possível em backend, mobile (React Native) e ferramentas internas — um único hiring pool para equipe pequena; tipagem forte apoia Clean Architecture/DDD; SDKs de IA (Anthropic, OpenAI) são cidadãos de primeira classe em JS/TS; comunidade imensa; contratos de API (doc 09) podem compartilhar tipos entre backend e mobile | Motor de Correlação (doc 05) exige bibliotecas estatísticas menos maduras que em Python (mitigável — a matemática exigida no MVP, doc 05 §14.1, é tratável sem dependência pesada) |
| **Python** | Ecossistema estatístico/ML incomparável (NumPy, SciPy, statsmodels) — o melhor encaixe *isolado* para o Motor de Correlação; FastAPI é excelente para APIs tipadas; forte em IA/ML | Menor unificação com o mobile (nenhuma stack mobile relevante usa Python nativamente); disciplina de tipagem menos onipresente que TS (mypy é opcional, não padrão da linguagem); ecossistema de frameworks corporativos para DDD é menos padronizado |
| **Go** | Ótima performance, baixo custo operacional, concorrência simples | Modelagem de domínio rico (DDD) é mais verbosa; ecossistema de IA/ML é o mais fraco das opções; produtividade de features de produto (CRUD-pesado, como Grow/Med) é menor que Node/Python |
| **Java/Kotlin (Spring)** | Extremamente maduro para DDD/Clean Architecture; ótimo histórico de manutenção de longo prazo; grande comunidade | Mais verboso/cerimonioso — produtividade inicial menor para uma equipe pequena construindo um MVP rápido; maior custo de memória por instância (JVM) |
| **.NET/C#** | Excelente para Clean Architecture (referência da própria Microsoft); performance muito boa | Ecossistema mais associado a Azure; hiring pool menor no mercado brasileiro de startups; suporte a IA crescendo, mas atrás de Python/JS |

**Impactos**: Custo (Node ≈ Python < Go < Java/.NET, pela leveza de runtime e maturidade de hospedagem serverless); Produtividade para equipe pequena (Node vence por unificar com o mobile); Escalabilidade (todas competem bem, é mais função de arquitetura — doc 04 — do que de linguagem); IA (Python teria vantagem isolada, mas Node cobre bem o que o MVP do doc 05 exige); Internacionalização (nenhuma diferença relevante); Manutenção de 10 anos (Node/TS, Java e .NET têm os históricos mais sólidos).

**Decisão**: **Node.js + TypeScript**, com **NestJS** como framework (seção 6). Justificativa central: é a única escolha que **otimiza o projeto como um todo** — um único hiring pool e uma única linguagem cobrindo backend e mobile (seção 9) é o maior multiplicador de produtividade para uma equipe pequena, e o Motor de Correlação do MVP (doc 05 §14.1) não exige o peso do ecossistema científico do Python. **Nota transparente**: se a IA evoluir para modelos estatísticos/ML mais sofisticados (Motor de Aprendizado avançado, Motor de Recomendações V2/V3 — doc 05 §20), extrair o módulo de IA para um serviço em Python é uma evolução natural e já prevista pela própria arquitetura (doc 04 §5 já apontava a IA como candidata óbvia a extração) — não uma contradição desta escolha, e sim o uso pretendido da modularidade.

---

## 6. Decisão: Framework de Backend

**NestJS** (sobre Node/TypeScript) — comparado a Express (minimalista, sem opinião arquitetural) e Fastify (performático, também sem opinião). NestJS foi escolhido porque seu sistema de módulos mapeia quase 1:1 com os limites de módulo do doc 04 (Core/Grow/Med/Comunidade/IA), tem injeção de dependência nativa (apoia Clean Architecture/DIP diretamente), e guards/interceptors resolvem de forma nativa os princípios permanentes de API do doc 09 (Correlation ID, logging estruturado, idempotência, autorização) sem reinventar infraestrutura.

---

## 7. Decisão: Banco de Dados

**PostgreSQL** — comparado a MySQL (similar, mas com suporte a *schema* nativo menos idiomático) e a um banco não-relacional (MongoDB — descartado: o modelo de 48 entidades do doc 08 é fortemente relacional, com cardinalidades explícitas, exatamente o que um banco de documentos modela pior). Postgres suporta **schema nativo por módulo** (mapeamento direto da decisão do doc 04/08), `JSONB` para os poucos casos semi-estruturados, particionamento por data nativo (atende ao doc 08 §6, séries temporais), e está disponível gerenciado em qualquer nuvem (evita lock-in). **Evolução natural**: se o volume de série temporal (doc 08 §6, achado do doc 08 §18) crescer muito, a extensão **TimescaleDB** (Postgres, não um banco novo) é o próximo passo — nunca uma migração de motor.

---

## 8. Decisão: Cache e Fila

**Redis** — cache (doc 04 §18), armazenamento de `RegistroDeIdempotencia` com TTL nativo (doc 09 §9), e backend de fila de jobs assíncronos (doc 04/05, processamento pesado da IA) via uma biblioteca de fila sobre Redis (ex.: BullMQ no ecossistema Node). Uma única peça de infraestrutura cobrindo três necessidades — baixo custo operacional adicional para a equipe pequena.

---

## 9. Decisão: Mobile — React Native ou Flutter (análise aprofundada)

| Critério | React Native | Flutter |
|---|---|---|
| **Performance** | Boa a muito boa com a New Architecture (Fabric/JSI) — suficiente para um app de dados/formulários/gráficos (não é um jogo nem app de realidade aumentada) | Ligeiramente superior em UI muito animada (motor de renderização próprio) — vantagem real, mas pouco relevante para o perfil de uso da COSMARIA |
| **Consistência visual entre iOS/Android** | Alcançável com componentes 100% customizados (exatamente o que o doc 11 já assume: biblioteca de componentes própria, não widgets nativos do SO) | Nativamente mais uniforme (motor próprio, não herda widget nativo) — vantagem por padrão, mas não exclusiva |
| **Linguagem/produtividade da equipe** | **TypeScript — mesma linguagem do backend recomendado (seção 5)** — tipos de API (doc 09) podem ser compartilhados entre backend e app, reduzindo uma classe inteira de bugs de integração | Dart — linguagem própria, sem compartilhamento de tipo com o backend; exige uma competência adicional da equipe pequena |
| **Comunidade/maturidade** | Enorme (JS é a linguagem mais usada globalmente); usado em produção em apps de escala massiva com feeds/gráficos/timelines (comparáveis ao perfil da COSMARIA) | Grande e muito ativa, mas inteiramente dedicada a mobile (sem a amplitude do ecossistema JS) |
| **Ferramental para equipe pequena** | **Expo** (camada gerenciada sobre RN) cobre câmera, notificações, biometria (Modo Discreto, doc 04 §10), build/deploy simplificado — reduz drasticamente a complexidade operacional para um time pequeno | Tooling próprio robusto (hot reload é referência), mas sem um equivalente direto ao alcance do Expo para funcionalidades nativas prontas |
| **Aposta de longo prazo (10 anos)** | Mantido pela Meta, usado internamente em escala (Instagram, etc.) — baixo risco de abandono | Mantido pela Google, forte investimento — também baixo risco de abandono |

**Decisão**: **React Native (com Expo)**. Não é a escolha "tecnicamente mais rápida" isolada (Flutter tem uma vantagem real e documentada de performance/consistência de renderização) — é a escolha que **otimiza o projeto como um todo**, exatamente o critério pedido: compartilhar TypeScript com o backend (seção 5) multiplica a produtividade de uma equipe pequena (um desenvolvedor pode transitar entre mobile e backend), permite compartilhar tipos de contrato de API (doc 09) entre cliente e servidor, e o Expo cobre exatamente as necessidades nativas já identificadas nos docs 10/11 (câmera para Mídia, biometria para Modo Discreto, notificações). A vantagem de renderização do Flutter é real, mas não é decisiva para um app de dados/formulários/timeline como a COSMARIA — é decisiva para apps intensamente animados, que não é o nosso perfil.

---

## 10. Decisão: Provedor de Nuvem

| Critério | AWS | GCP | Azure |
|---|---|---|---|
| **Custo para equipe pequena** | Competitivo, mas mais fácil de configurar mal e gerar custo inesperado (muitos serviços, muitas opções) | **Cloud Run** (contêiner sem servidor, cobra só pelo uso real, escala a zero) é o melhor encaixe de custo para um monolito modular com tráfego inicial baixo | Competitivo, mas ecossistema mais vantajoso quando já se usa .NET/Azure AD (não é o nosso caso) |
| **Simplicidade de deploy** | Mais opções = mais decisões a tomar (ECS, EKS, Lambda, Beanstalk...) | Um comando (`gcloud run deploy`) para subir o Modular Monolith containerizado — a opção mais simples das três para o perfil de arquitetura do doc 04 | Container Apps é equivalente ao Cloud Run, mas com ecossistema geral menos maduro para este perfil de stack |
| **Escalabilidade sem reescrever arquitetura** | Sim (ECS/Fargate escalam bem) | **Sim — Cloud Run escala automaticamente de zero a milhares de instâncias**, e nossa arquitetura já é *stateless* por princípio (doc 09) — encaixe quase perfeito | Sim, via Container Apps |
| **Maturidade/ecossistema geral** | Maior de todas, maior hiring pool de especialistas em nuvem | Muito boa, interface/CLI frequentemente citada como a mais amigável | Muito boa, mais forte em contas já Microsoft-cêntricas |
| **Lock-in** | Baixo se usarmos primitivas portáveis (containers, Postgres, Redis, object storage) | Idem — nenhuma das escolhas de stack é proprietária da GCP | Idem |

**Decisão**: **Google Cloud Platform (GCP)**, com mapeamento concreto:
- **Cloud Run** — hospeda o Modular Monolith (um artefato implantável, doc 04 §5), escalando automaticamente.
- **Cloud SQL (PostgreSQL)** — banco gerenciado (seção 7).
- **Memorystore (Redis)** — cache/fila (seção 8).
- **Cloud Storage** — armazenamento de `Mídia` (fotos, exames).
- **Cloud Tasks / Pub-Sub** — fila de jobs assíncronos da IA (doc 05 §14.4).
- **Cloud CDN** — entrega de mídia/estáticos.

**Justificativa central**: nossa arquitetura (Modular Monolith, stateless, container único, doc 04) é exatamente o caso de uso para o qual o Cloud Run foi desenhado — o menor custo operacional e a menor complexidade de deploy das três opções, sem exigir reescrita quando o tráfego crescer para milhões de usuários (Cloud Run escala automaticamente; a extração futura de um módulo, se necessária, doc 04 §5, também roda como outro serviço Cloud Run). Nenhuma das primitivas escolhidas é proprietária a ponto de impedir migração futura para AWS/Azure, se necessário.

---

## 11. Decisão: Armazenamento de Objetos

**Cloud Storage** (GCP) — usado pela entidade `Mídia` (Core, doc 08), com URLs assinadas para acesso controlado por privacidade (doc 04 §12) e ciclo de vida configurável (compressão/arquivamento de mídia antiga, relevante para o crescimento de armazenamento apontado como risco no doc 02 §16).

---

## 12. Decisão: Provedor de IA/LLM

**Anthropic Claude** como provedor primário de LLM para o Motor de Explicabilidade (doc 05 §6.5) — geração de texto seguindo o template rígido obrigatório (doc 05 §7.1), onde forte aderência a instrução e comportamento cauteloso (nunca afirmar certeza absoluta, doc 05 princípio 6) são requisitos diretos do produto, não apenas preferência. **Desenho de acesso via interface/porta** (mesmo princípio DIP do doc 04 §4): o provedor de LLM é substituível sem alterar a lógica dos motores de IA — evita lock-in de fornecedor único a longo prazo.

---

## 13. Decisão: Observabilidade

**OpenTelemetry** (padrão neutro de fornecedor, doc 04 §20) para logging estruturado/métricas/tracing, com backend de visualização a definir conforme orçamento (ex.: Grafana Cloud ou a suíte nativa do GCP) — a escolha do padrão de instrumentação (OpenTelemetry) importa mais neste estágio do que o backend de visualização, que pode trocar sem re-instrumentar o código.

---

## 14. Decisão: CI/CD

**GitHub Actions** — gratuito/barato para times pequenos, integração nativa com o repositório de código (doc 14), suficiente para o pipeline de build/teste/deploy no Cloud Run.

---

## 15. Decisão: Testes

**Jest** (unitário/integração, ecossistema Node/TS nativo) + **Playwright** (ponta a ponta, cobre tanto web administrativo quanto pode ser adaptado a fluxos críticos) — escolhas padrão de mercado para o ecossistema já definido, sem necessidade de comparação profunda adicional.

---

## 16. A Stack Oficial COSMARIA

| Camada | Escolha |
|---|---|
| Backend | Node.js + TypeScript + NestJS |
| Banco de Dados | PostgreSQL (schema por módulo) |
| Cache/Fila | Redis |
| Mobile | React Native + Expo (TypeScript compartilhado com o backend) |
| Nuvem | Google Cloud Platform (Cloud Run, Cloud SQL, Memorystore, Cloud Storage, Cloud Tasks) |
| IA/LLM | Anthropic Claude, atrás de uma interface substituível |
| Observabilidade | OpenTelemetry |
| CI/CD | GitHub Actions |
| Testes | Jest + Playwright |

**Por que esta combinação, e não a melhor peça isolada de cada categoria**: a stack inteira gira em torno de **uma única linguagem (TypeScript)** cobrindo backend e mobile — o maior multiplicador de produtividade possível para a equipe pequena do doc 12 — apoiada por uma **nuvem (GCP/Cloud Run)** desenhada exatamente para o formato de artefato único e stateless que a arquitetura (doc 04) já exige, e um **banco (PostgreSQL)** cujo suporte nativo a schema por módulo é um encaixe direto com a decisão mais importante do doc 04. Cada peça isolada tem uma alternativa com alguma vantagem pontual (Python para estatística pura, Flutter para renderização pura, AWS para maturidade de ecossistema pura) — nenhuma dessas vantagens pontuais supera o ganho de **coerência e produtividade do conjunto**, que era o critério explícito pedido.

---

## 17. Mapeamento Stack → Arquitetura (doc 04)

| Conceito do doc 04 | Tecnologia concreta |
|---|---|
| Modular Monolith (artefato único) | Container Node/NestJS no Cloud Run |
| Schema por módulo | Schemas nativos do PostgreSQL |
| Barramento de eventos in-process | EventEmitter/CQRS module do NestJS, substituível por Redis Streams/Pub-Sub se um módulo for extraído |
| Fila de jobs assíncronos | Cloud Tasks (ou BullMQ sobre Redis) |
| Stateless/distribuição horizontal | Múltiplas instâncias Cloud Run atrás do balanceador nativo |
| Correlation ID, logging estruturado | Interceptor NestJS + OpenTelemetry |

---

## 18. Boas Práticas

- Nenhuma decisão desta stack é hardcoded de forma a impedir troca futura — provedor de LLM, backend de observabilidade e até nuvem seguem por trás de interfaces (DIP, doc 04 §4).
- Toda extração futura de módulo (doc 04 §5) permanece um novo serviço Cloud Run — nunca exige trocar de provedor de nuvem.

---

## 19. Riscos

| Risco | Observação |
|---|---|
| Motor de Correlação em TypeScript pode exigir mais esforço que em Python para estatística avançada futura | Mitigado pela extração planejada (seção 5) — não é um risco de arquitetura, é uma decisão consciente de sequenciamento |
| Lock-in de LLM (Anthropic) | Mitigado por interface substituível (seção 12) |
| Cloud Run tem particularidades (cold start, limites de tempo de requisição) | A validar no doc 14/15 conforme o perfil real de tráfego — mitigável com configuração de instância mínima se necessário |

---

## 20. Sugestões de Melhorias

- Reavaliar a extração do módulo de IA para Python quando o Motor de Recomendações/Aprendizado (doc 05, Versão 2/3) exigir modelagem estatística mais sofisticada — já planejado, não incorporar agora.
- Avaliar Expo EAS Build como serviço gerenciado de build mobile, reduzindo ainda mais a carga operacional da equipe pequena.

---

## 21. Classificação de Escopo

| Item | Classificação |
|---|---|
| Stack Oficial completa (seção 16) | **MVP** |
| Extração da IA para Python | **Versão 2/3** (condicional a necessidade real, já no Ideias Futuras) |
| TimescaleDB (evolução do Postgres) | **Versão 2** (condicional a volume real) |

---

## 22. Revisão Final de Arquitetura

- **Dificulta futuras integrações?** Não — LLM e observabilidade já desenhados como substituíveis.
- **Dificulta internacionalização?** Não — nenhuma escolha de stack é presa a idioma/região.
- **Dificulta escalabilidade?** Não — Cloud Run + Postgres + arquitetura stateless é, em conjunto, o cenário mais favorável a crescer sem reescrita.
- **Dificulta integração com novos aplicativos futuros?** Não — a stack é da plataforma, não de um app específico.

Nenhuma limitação relevante encontrada.

---

## 23. Teste de Completude

"Uma equipe experiente conseguiria implementar esta parte do sistema utilizando apenas este documento, sem precisar tomar decisões arquiteturais importantes?" — **Sim**. Toda camada tem uma escolha concreta e justificada, com mapeamento direto às decisões de arquitetura já feitas (seção 17). A única variável deliberadamente aberta é a versão exata de cada dependência (ex.: versão do Node, do NestJS) — decisão de manutenção contínua, não de arquitetura, apropriadamente fora do escopo de um documento de decisão estratégica.

---

## Decisões Consolidadas (validado com o usuário em 2026-07-08)

| # | Tema | Decisão |
|---|---|---|
| 1 | Stack Oficial | Confirmada na íntegra (seção 16) |
| 2 | Nuvem oficial | GCP confirmado |
| 3 | Cloud/Provider Agnostic (novo princípio permanente) | GCP e Claude são as implementações **oficiais atuais**, não amarras definitivas — toda integração externa (nuvem, LLM, pagamento, storage, observabilidade) vive atrás de uma interface definida pelo Domínio/Aplicação; o código específico do provedor fica isolado na camada de Infraestrutura, substituível sem tocar em regra de negócio |

### 16.1 Princípio Permanente — Cloud Agnostic e Provider Agnostic

Reforça e estende o DIP (doc 04 §4) explicitamente às integrações externas de infraestrutura, não só aos limites entre módulos internos. Nenhuma dessas integrações pode ser referenciada diretamente pelo Domínio ou pela Aplicação — sempre por uma porta (interface):

| Integração | Porta (interface) | Adaptador atual (GCP/Claude) | Adaptador alternativo hipotético |
|---|---|---|---|
| Armazenamento de objetos | `ArmazenamentoDeMidia` | Cloud Storage | S3, Azure Blob |
| Banco relacional | `RepositorioDe[Entidade]` | Cloud SQL (Postgres) | RDS, Azure Database |
| Cache/Fila | `Cache`, `FilaDeJobs` | Memorystore/Cloud Tasks | ElastiCache/SQS |
| Provedor de LLM | `ServicoDeExplicabilidade` (ou similar) | Anthropic Claude | Outro provedor de LLM |
| Gateway de pagamento | `ProcessadorDePagamento` | *(a definir na implementação)* | Qualquer gateway com webhook compatível (doc 09 §7) |
| Observabilidade | Interface `OpenTelemetry` (já é o padrão neutro, seção 13) | Exportador GCP | Exportador Grafana/outro |

**Consequência prática**: trocar de nuvem ou de provedor de IA no futuro é uma mudança de **Infraestrutura** (implementar um novo adaptador), nunca uma mudança de **Domínio** — coerente com o princípio já estabelecido no doc 04 desde o primeiro dia.

Este documento está **concluído**. Seguimos para o **Documento 14 — Estrutura do Código**.

---

## Artefatos para Implementação

### Checklist Técnico
- [ ] Provisionar projeto GCP (Cloud Run, Cloud SQL, Memorystore, Cloud Storage, Cloud Tasks)
- [ ] Inicializar projeto NestJS com módulos espelhando o doc 04 (Core/Grow/Med/Comunidade/IA)
- [ ] Configurar PostgreSQL com schema por módulo (doc 08)
- [ ] Configurar Redis (cache, idempotência, fila)
- [ ] Inicializar projeto React Native + Expo, com tipos de API compartilhados do backend
- [ ] Configurar OpenTelemetry, GitHub Actions, Jest/Playwright

### Lista de Módulos
Mesma divisão do doc 04 — este documento apenas atribui tecnologia.

### Dependências com Outros Módulos
Nenhuma nova.

### Riscos Técnicos
Ver seção 19.
