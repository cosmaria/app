# 09 — APIs (Documento 100% Completo)

> Status: **Rascunho para validação.** Consolida e substitui as listas de "APIs Necessárias" espalhadas nos Artefatos dos docs 02, 03, 04, 05, 06, 07 e 08 — este é o catálogo único e definitivo. Não escolhe protocolo/tecnologia (REST vs. GraphQL vs. gRPC — doc 13); descreve contratos, não implementação.

---

## 1. Objetivos

- Consolidar em um único catálogo **todas** as APIs já esboçadas nos documentos anteriores, eliminando redundância (ex.: `/usuario/limites-premium` apareceu separadamente em docs 02 e 03).
- Aplicar o princípio **API First**: todo endpoint nasce com contrato completo antes de qualquer código.
- Classificar toda API por visibilidade (Pública, Interna, Administrativa, Sistema, Webhook, Futura).
- Realizar uma auditoria obrigatória final, corrigindo redundâncias, violações de DDD e riscos antes de considerar o documento concluído.

---

## 2. Problemas que Resolve

| Problema | Como este documento resolve |
|---|---|
| APIs espalhadas e parcialmente duplicadas entre docs 02–08 | Catálogo único consolidado (seção 7) |
| Falta de convenção comum (versionamento, paginação, erro, rate limit) | Convenções transversais (seção 5) |
| Risco de repetir 15 campos por endpoint dezenas de vezes | Sistema de arquétipos de API (seção 6), mesmo princípio do doc 08 |
| Risco de endpoint violar fronteira de módulo (chamando schema de outro módulo) | Auditoria obrigatória de acoplamento (seção 12) |

---

## 3. Escopo

**Incluído**: contratos de API (objetivo, entrada/saída, autenticação/autorização, eventos, impactos de auditoria/LGPD/Premium, rate limit conceitual, versionamento, idempotência, casos de teste), classificação de visibilidade, convenções transversais.

**Fora de escopo**: protocolo de transporte específico, formato de serialização, ferramenta de documentação (Swagger/OpenAPI é decisão do doc 13/14).

---

## 4. Princípio API First (novo, permanente — ver doc 00 §16)

Toda API, a partir de agora, nasce com os 15 campos abaixo definidos **antes** de qualquer implementação:

`objetivo` · `módulo proprietário` · `autenticação necessária` · `autorização/permissões` · `entrada` · `saída` · `códigos de erro` · `eventos publicados` · `eventos consumidos` · `impacto na auditoria` · `impacto na LGPD` · `impacto na assinatura Premium` · `rate limit (conceitual)` · `estratégia de versionamento` · `idempotência (quando aplicável)` · `casos de teste obrigatórios`

Classificação obrigatória: **Pública** (exposta a apps cliente) · **Interna** (módulo-para-módulo, nunca exposta a cliente) · **Administrativa** (papel Admin) · **Sistema** (jobs/automação) · **Webhook** (recebe eventos de terceiros) · **Futura** (contrato definido, não implementado).

---

## 5. Convenções Transversais

| Convenção | Regra |
|---|---|
| **Versionamento** | Por caminho (`/v1/...`); uma versão nunca muda contrato de forma destrutiva — mudança incompatível gera `/v2/` mantendo `/v1/` ativa por um período de descontinuação anunciado |
| **Formato de erro** | Estrutura única em toda a plataforma: código de erro estável (não muda entre versões), mensagem legível, referência de rastreamento (ID de correlação, doc 04 §20) |
| **Paginação** | Toda lista (feed, busca, histórico) é paginada por padrão — nunca retorna coleção ilimitada de uma vez (achado de performance, seção 12) |
| **Rate limit** | Conceitual nesta fase (sem número de requisições/minuto definido — decisão de doc 13/infra); a **relação relativa** entre endpoints já é definida por arquétipo (seção 6) |
| **Idempotência** | Endpoints de escrita que podem ser reenviados (rede instável, retry do cliente) aceitam uma chave de idempotência opcional no cabeçalho — reenvio com a mesma chave não duplica o efeito |
| **Autenticação** | Bearer token (Core: Identidade, doc 04 §10) para toda API Pública; autenticação serviço-a-serviço (não token de usuário final) para API Interna |

---

## 6. Arquétipos de Endpoint

> Mesmo princípio de composição do doc 08 (arquétipos de entidade) — evita repetir os 15 campos em cada um dos ~45 endpoints do catálogo.

| Arquétipo | Descrição | Auth padrão | Rate limit relativo | Idempotência | Versionamento |
|---|---|---|---|---|---|
| **API-1 — CRUD de Entidade Operacional** | Criar/ler/atualizar/excluir um recurso do próprio usuário (ambientes, plantas, ciclos, tratamentos, produtos) | Bearer + verificação de posse do recurso | Moderado | POST aceita chave de idempotência | Path (`/v1`) |
| **API-2 — Registro Append-Only** | Criar um registro histórico imutável (parâmetros, sintomas, doses, efeitos) | Bearer + posse | Alto (uso frequente esperado) | Obrigatória (evita duplicar registro em retry) | Path |
| **API-3 — Consulta Agregada/Analítica** | Leitura derivada (comparações, evolução, insights, digest) | Bearer + posse | Alto (leitura, cacheável) | N/A (GET) | Path |
| **API-4 — Ação/Comando** | Dispara uma ação de negócio, não um CRUD simples (clonar ciclo, fork, vincular lote, upgrade de assinatura) | Bearer + posse/consentimento quando aplicável | Baixo-moderado | Obrigatória | Path |
| **API-5 — Interna Módulo-para-Módulo** | Nunca exposta a app cliente; resolve referência cross-módulo (doc 08 §11) | Serviço-a-serviço | Alto (tráfego interno) | Conforme o comando subjacente | Path |
| **API-6 — Administrativa/Configuração** | Gestão de política/limite/cupom — papel Admin | Bearer + papel Admin | Baixo (uso raro) | Obrigatória | Path |
| *(regra do arquétipo API-6, adicionada na revisão 00-09)* | Toda alteração via endpoint Administrativo gera `TrilhaDeAuditoria` — sem exceção, é o próprio motivo de existir do arquétipo | | | | |
| **API-7 — Webhook** | Recebe evento de terceiro (gateway de pagamento) | Verificação de assinatura do payload, não Bearer | Definido pelo provedor externo | Obrigatória (entrega duplicada é comum em webhooks) | Path |

---

## 7. Catálogo Consolidado de Endpoints

> Substitui e deduplica as listas dos docs 02/03/04/05/06/07/08. Endpoints antes duplicados (ex.: limites de Premium aparecendo em Grow e Med separadamente) foram unificados sob o Core.

### Core — Identidade, Conta, Consentimento

| Endpoint | Classificação | Arquétipo | Objetivo |
|---|---|---|---|
| `POST /v1/auth/login` | Pública | API-4 | Autenticar e emitir token |
| `POST /v1/auth/refresh` | Pública | API-4 | Renovar token de acesso |
| `POST /v1/conta/excluir` | Pública | API-4 | Iniciar exclusão de conta (doc 04 §21.2) |
| `POST /v1/conta/exportar` | Pública | API-4 | Solicitar exportação/portabilidade (doc 04 §21.3) |
| `GET /v1/conta/limites` | Pública | API-3 | Limites vigentes por app/categoria (unifica o que era `/usuario/limites-premium` duplicado em 02/03) |
| `POST /v1/consentimento` | Pública | API-1 | Registrar consentimento |
| `GET /v1/consentimento` | Pública | API-3 | *(adicionado na revisão 00-09 — lacuna de LGPD: direito de acesso, doc 04 §21, sem endpoint de leitura)* Listar consentimentos concedidos/revogados do próprio usuário |
| `DELETE /v1/consentimento/{tipo}` | Pública | API-1 | Revogar consentimento |
| `GET /v1/conta/exportacao/{solicitacaoId}` | Pública | API-3 | *(adicionado na revisão 00-09 — sem isso, o usuário não tinha como saber quando/como baixar a exportação solicitada)* Status e link de download da exportação |
| `GET /v1/admin/trilha-auditoria` | Administrativa | API-6 | *(adicionado na revisão 00-09 — `TrilhaDeAuditoria` era escrita mas nunca lida por nenhum endpoint)* Consultar trilha de auditoria |
| `GET/PUT /v1/preferencia-complexidade` | Pública | API-1 | Nível essencial/avançado/especialista, Modo Especialista e **habilitação progressiva por campo** (doc 02 §5.0). Uma preferência por Conta, compartilhada por Grow e Med |
| `GET/PUT /v1/preferencia-notificacao` | Pública | API-1 | Preferências (canais por categoria), horário de silêncio, fuso e Modo Discreto |
| `GET /v1/notificacoes` | Pública | API-3 | *(adicionado na Sprint Core-7 — o doc 04 §15 exige que a notificação silenciada seja "registrada sem envio", mas nenhum endpoint permitia lê-la, e a Central de Notificações do doc 10 não teria como existir)* Central de Notificações, paginada |
| `POST /v1/notificacoes/{id}/ler` | Pública | API-4 | *(adicionado na Sprint Core-7, mesma lacuna)* Marcar notificação como lida (idempotente) |
| `POST /v1/interno/privacidade/avaliar` | Interna | API-5 | Avaliação de visibilidade dimensão×escopo (doc 04 §12) |
| `POST /v1/interno/eventos` | Sistema | API-5 | Publicação interna no barramento (doc 04 §9) |

### Premium (Core: Billing)

| Endpoint | Classificação | Arquétipo | Objetivo |
|---|---|---|---|
| `GET /v1/assinatura` | Pública | API-3 | Status da assinatura única |
| `POST /v1/assinatura/upgrade` | Pública | API-4 | Iniciar upgrade Premium |
| `POST /v1/assinatura/cancelar` | Pública | API-4 | Cancelar assinatura |
| `POST /v1/assinatura/cupom` | Pública | API-4 | Aplicar cupom/promoção |
| `POST /v1/webhooks/pagamento` | **Webhook** | API-7 | Recebe confirmação/falha de cobrança do gateway (doc 13 define o provedor) |
| `GET/PUT /v1/admin/limite-de-plano` | Administrativa | API-6 | Gestão de `LimiteDePlano` |
| `GET/PUT /v1/admin/preco-regional` | Administrativa | API-6 | Gestão de `PrecoRegional` |
| `POST/GET/PUT /v1/admin/cupons` | Administrativa | API-6 | *(adicionado na revisão 00-09 — só existia "aplicar" cupom, nunca "criar/gerir")* Gestão de `CupomOuPromocao` |
| `GET/PUT /v1/admin/periodo-gratuito` | Administrativa | API-6 | *(adicionado na revisão 00-09 — `PeriodoGratuitoConfiguracao` existia na entidade, sem endpoint)* Gestão do trial |

### Grow

> Upload de mídia (fotos) usa `POST /v1/midia`, agora um endpoint **Core** (ver tabela "Comunidade" abaixo) — reclassificado na revisão 00-09 porque o Med também precisa anexar mídia (exames) e a entidade não podia continuar exclusiva do Grow.

| Endpoint | Classificação | Arquétipo | Objetivo |
|---|---|---|---|
| `POST/GET/PUT/DELETE /v1/ambientes` | Pública | API-1 | CRUD de Ambiente. O `POST` consulta a `PREMIUM_PUBLIC_API` (chave `grow.ambientes_simultaneos`) e responde `402` ao barrar — o Grow nunca reimplementa regra de cobrança |
| `POST/GET/PUT/DELETE /v1/geneticas` | Pública | API-1 | *(adicionado na revisão 00-09 — lacuna crítica: `Planta` referencia `Genética`, mas não existia nenhum endpoint para criá-la)* CRUD de Genética/Strain |
| `POST/GET/DELETE /v1/ciclos/modelos` | Pública (Premium) | API-1 | *(adicionado na revisão 00-09)* Gestão de `ModeloDeCiclo` — templates nomeados e reutilizáveis |
| `POST/GET/PUT/DELETE /v1/plantas` | Pública | API-1 | CRUD de Planta |
| `POST/GET/PUT/DELETE /v1/ciclos` | Pública | API-1 | CRUD de Ciclo de Cultivo |
| `GET /v1/ciclos/{id}/plantas` | Pública | API-3 | *(adicionado na Sprint Grow-1)* Plantas de um ciclo, com a fase própria de cada uma |
| `POST /v1/ciclos/{id}/fase`, `POST /v1/plantas/{id}/fase` | Pública | API-4 | *(adicionado na Sprint Grow-1)* Avança a fase, sempre com timestamp. Retroceder responde `400`: corromperia as durações de fase (doc 02 §5.12) |
| `POST /v1/ciclos/{id}/encerrar` | Pública | API-4 | *(adicionado na Sprint Grow-1)* Encerra o ciclo. Irreversível: nenhuma escrita é aceita depois (`409`), a leitura do histórico continua livre |
| `POST /v1/ciclos/{id}/clonar` | Pública | API-4 | Clonar ciclo anterior |
| `POST /v1/registros-ambientais` | Pública | API-2 | Check-in diário / série temporal |
| `POST /v1/eventos-manejo`, `POST /v1/eventos-sanidade` | Pública | API-2 | Registro de manejo/sanidade |
| `GET/POST/PUT /v1/tarefas` | Pública | API-1 | Tarefas e lembretes |
| `POST /v1/colheitas` | Pública | API-2 | Registrar colheita (0—N por ciclo, doc 04 §25) |
| `POST /v1/secagens`, `POST /v1/curas` | Pública | API-2 | Etapas pós-colheita → gera `/v1/lotes` |
| `GET /v1/lotes/{id}` | Pública | API-3 | *(adicionado na revisão 00-09 — só existia a versão Interna para o Med consumir; faltava a visão do próprio dono no Grow)* Visualizar Lote próprio |
| `GET /v1/ciclos/{id}/relatorio` | Pública | API-3 | Relatório do ciclo |
| `GET /v1/ciclos/comparar` | Pública | API-3 | Comparação entre ciclos |
| `GET /v1/ambientes/{id}/clima` | Pública | API-3 | Módulo Outdoor (falha isolada, doc 02 §16) |
| `GET /v1/interno/grow/lotes/{id}/resumo` | **Interna** | API-5 | Resumo somente leitura consumido pelo Med (doc 04 §23, doc 08 §11) |

### Med

| Endpoint | Classificação | Arquétipo | Objetivo |
|---|---|---|---|
| `POST/GET/PUT/DELETE /v1/tratamentos` | Pública | API-1 | CRUD de Tratamento |
| `POST/GET/PUT/DELETE /v1/produtos` | Pública | API-1 | CRUD de Produto |
| `POST /v1/produtos/{id}/vincular-lote` | Pública | API-4 | Vínculo opt-in ao Lote do Grow (verifica consentimento — doc 04 §23). **Publica `ProdutoVinculadoALote`** *(corrigido na revisão 00-09 — antes não publicava nenhum evento, e a IA não tinha como saber que deveria começar a correlacionar aquele produto com o cultivo de origem)* |
| `POST/GET/DELETE /v1/tratamentos/modelos` | Pública (Premium) | API-1 | *(adicionado na revisão 00-09)* Gestão de `ModeloDeTratamento` |
| `POST /v1/registros-uso` | Pública | API-2 | Registro de dose |
| `POST /v1/sessoes`, `PUT /v1/sessoes/{id}` | Pública | API-2 | Sessão Antes/Depois |
| `POST /v1/sintomas-diarios` | Pública | API-2 | Linha de base diária |
| `POST /v1/efeitos` | Pública | API-2 | Registro de efeito |
| `GET /v1/tratamentos/{id}/evolucao` | Pública | API-3 | Evolução clínica |
| `GET /v1/tratamentos/{id}/relatorio` | Pública | API-3 | Relatório clínico |
| `POST/GET /v1/dependentes` *(Versão 2)* | Futura | API-1 | Gestão de Perfil de Dependente |

### IA

| Endpoint | Classificação | Arquétipo | Objetivo |
|---|---|---|---|
| `GET /v1/ia/insights?contexto=grow\|med` | Pública | API-3 | Insights (unifica o endpoint que aparecia duplicado em docs 02/05) |
| `GET /v1/ia/alertas`, `GET /v1/ia/recomendacoes` | Pública | API-3 | Alertas e recomendações |
| `GET /v1/ia/digest` | Pública | API-3 | Digest analítico periódico |
| `POST /v1/ia/feedback` | Pública | API-4 | Marcar insight útil/inútil (alimenta Motor de Aprendizado) |
| `GET/DELETE /v1/ia/perfil-aprendizado` | Pública | API-1 | *(adicionado na revisão 00-09 — coerência com o princípio de explicabilidade máxima do doc 05: o usuário deve poder ver e resetar sua própria personalização)* Ver/resetar `PerfilDeAprendizadoDoUsuario` |
| `GET/PUT /v1/admin/politica-agregacao` | Administrativa | API-6 | Gestão de `PoliticaDeAgregacao` (N mínimo de coorte) — **regra de negócio vive só aqui**: a Comunidade nunca reimplementa esta checagem, apenas exibe o que a IA já validou (evita duplicação identificada na revisão 00-09) |

### Comunidade

| Endpoint | Classificação | Arquétipo | Objetivo |
|---|---|---|---|
| `GET/PUT /v1/comunidade/perfis/{contexto}` | Pública | API-1 | Perfil Público (criação implícita) |
| `GET /v1/comunidade/perfis/{contexto}/estatisticas` | Pública (Premium) | API-3 | *(adicionado na revisão 00-09 — dava suporte de banco ausente para "quem visitou/alcance", agora respaldado por `VisualizacaoDePerfil`)* Estatísticas avançadas de perfil |
| `POST/GET/DELETE /v1/comunidade/vinculo-perfis` | Pública | API-4 | Vínculo opt-in entre perfis (Versão 2). *(o `GET` foi acrescentado na implementação da Sprint Core-5: sem ele, a tela "Configuração de Vínculo de Perfis" do doc 06 não conseguiria renderizar o estado atual depois de um restart do app — o `vinculoId` só existia na resposta do `POST`)* Enquanto a feature flag `FEATURE_VINCULO_DE_PERFIS` estiver desligada, os três respondem `404`. |
| `POST/DELETE /v1/comunidade/seguir/{perfilId}` | Pública | API-1 | Seguir/deixar de seguir (escopado por contexto). **Publica `SeguimentoIniciado`** *(corrigido na revisão 00-09 — a notificação de "novo seguidor" prometida no doc 06 não tinha evento para dispará-la)* |
| `POST /v1/comunidade/publicacoes` | Pública | API-1 | Publicar (Growlog ou Experiência de Tratamento — unifica o que aparecia separado em docs 02/03/06) |
| `POST /v1/midia` | Pública | API-2 | *(reclassificado na revisão 00-09: Core, não mais exclusivo do Grow)* Upload de mídia (multipart), anexável a `Planta` (Grow) ou `Tratamento`/exame (Med). MIME de lista fechada; tamanho sujeito ao `LimiteDePlano` |
| `GET /v1/midia/{id}` | Pública | API-3 | *(adicionado na Sprint Core-8)* Devolve **URL assinada e temporária**; nunca o binário nem a chave de armazenamento |
| `GET /v1/midia/entidade/{modulo}/{tipoEntidade}/{entidadeId}` | Pública | API-3 | *(adicionado na Sprint Core-8)* Mídias anexadas a uma entidade, filtradas por posse |
| `DELETE /v1/midia/{id}` | Pública | API-1 | *(adicionado na Sprint Core-8)* Remove objeto e linha. Idempotente |
| `GET /v1/arquivos` | Sistema | API-7 | *(adicionado na Sprint Core-8)* Serve os bytes de uma URL assinada. Autenticado pela **assinatura do link**, não por Bearer. Existe apenas para o adaptador local: em produção a URL aponta direto para o object store e a API nunca vira proxy de download |
| `PUT /v1/comunidade/publicacoes/{id}/privacidade` | Pública | API-1 | Ajustar Configuração de Compartilhamento. **Publica `ConfiguracaoDeCompartilhamentoAlterada`** *(corrigido na revisão 00-09 — doc 08 exigia auditoria desta mudança, mas nenhum evento existia para viabilizá-la)* |
| `GET /v1/comunidade/feed?contexto=` | Pública | API-3 | Feed escopado por contexto |
| `GET /v1/comunidade/busca?contexto=` | Pública | API-3 | Busca estruturada |
| `POST /v1/comunidade/publicacoes/{id}/comentarios` | Pública | API-2 | Comentar. **Publica `ComentarioCriado`** *(corrigido na revisão 00-09, mesma lacuna de notificação)* |
| `POST/DELETE /v1/comunidade/publicacoes/{id}/curtir` | Pública | API-1 (variante Arquétipo E) | Curtir/descurtir. **Publica `CurtidaRegistrada`** *(corrigido na revisão 00-09, mesma lacuna)* |
| `POST /v1/comunidade/fork/{cicloId}` | Pública | API-4 | Fork (exclusivo Grow) |

---

## 8. Detalhamento Completo de Endpoints Representativos

> Um representante por arquétipo/módulo — os demais herdam o padrão do arquétipo (seção 6) e diferem apenas em objetivo/entrada/saída/eventos, já descritos na tabela da seção 7.

### `POST /v1/auth/login`
- **Objetivo**: autenticar o usuário e emitir token de acesso + refresh token.
- **Módulo proprietário**: Core — Identidade e Autenticação.
- **Autenticação necessária**: nenhuma (é o próprio ponto de entrada).
- **Autorização/permissões**: N/A.
- **Entrada**: credencial + senha (ou biometria, se dispositivo suportar).
- **Saída**: token de acesso, refresh token, identidade básica do usuário.
- **Códigos de erro**: credencial inválida, conta suspensa, conta em processo de exclusão.
- **Eventos publicados**: nenhum evento de domínio de negócio (evento técnico de log de acesso, fora do catálogo de domínio).
- **Eventos consumidos**: nenhum.
- **Impacto na auditoria**: tentativas de login falhas repetidas alimentam `TrilhaDeAuditoria` de segurança.
- **Impacto na LGPD**: processa dado de credencial — sob a mesma base legal de execução de contrato do doc 04 §21.
- **Impacto na assinatura Premium**: nenhum.
- **Rate limit conceitual**: baixo (proteção contra força bruta).
- **Versionamento**: `/v1`.
- **Idempotência**: N/A (não é uma operação de escrita de recurso).
- **Casos de teste obrigatórios**: login válido emite token; login inválido não vaza qual campo errou (segurança); conta suspensa/em exclusão é bloqueada com mensagem apropriada.

### `POST /v1/ciclos`
- **Objetivo**: criar um novo Ciclo de Cultivo.
- **Módulo proprietário**: Grow.
- **Autenticação**: Bearer token.
- **Autorização**: usuário autenticado, dono do Ambiente referenciado.
- **Entrada**: ambiente, genética/plantas iniciais, data de início.
- **Saída**: Ciclo criado (identificador, fase inicial).
- **Códigos de erro**: ambiente não pertence ao usuário; limite de ciclos simultâneos do plano gratuito atingido (`LimitePremiumAtingido`).
- **Eventos publicados**: `CicloCriado`.
- **Eventos consumidos**: nenhum.
- **Impacto na auditoria**: não crítico — não passa por `TrilhaDeAuditoria` (é Arquétipo A operacional comum, não uma das entidades críticas do doc 08 §14).
- **Impacto na LGPD**: nenhum dado sensível de saúde envolvido.
- **Impacto na assinatura Premium**: sujeito ao `LimiteDePlano` de ambientes/ciclos simultâneos (doc 07 §9).
- **Rate limit conceitual**: moderado.
- **Versionamento**: `/v1`.
- **Idempotência**: aceita chave de idempotência (evita criar ciclo duplicado em retry de rede).
- **Casos de teste obrigatórios**: criação respeita limite do plano gratuito; criação com o mesmo cabeçalho de idempotência não duplica o ciclo.

### `POST /v1/registros-ambientais`
- **Objetivo**: registrar parâmetros ambientais do check-in diário.
- **Módulo**: Grow. **Arquétipo**: API-2.
- **Autenticação/Autorização**: Bearer + dono da Planta/Ciclo.
- **Entrada**: planta/ciclo, pH, EC, temperatura, umidade, origem do registro (manual/sensor/importado — doc 08 §6).
- **Saída**: registro criado + VPD/PPFD/DLI calculados.
- **Códigos de erro**: valores fora de faixa fisicamente possível (validação de entrada, doc 02 risco §16).
- **Eventos publicados**: `RegistroAmbientalCriado`.
- **Eventos consumidos**: nenhum.
- **Impacto na auditoria**: não crítico.
- **Impacto na LGPD**: nenhum.
- **Impacto no Premium**: nenhum (registro básico nunca é limitado).
- **Rate limit**: alto (uso frequente).
- **Versionamento**: `/v1`.
- **Idempotência**: obrigatória — é um Registro Append-Only, reenvio de rede não pode duplicar.
- **Casos de teste**: reenvio com mesma chave de idempotência não cria segundo registro; cálculo de VPD/PPFD/DLI correto a partir da entrada.

### `POST /v1/ciclos/{id}/clonar`
- **Objetivo**: duplicar configuração de um ciclo anterior como ponto de partida de um novo.
- **Módulo**: Grow. **Arquétipo**: API-4.
- **Entrada**: ID do ciclo de origem. **Saída**: novo Ciclo criado, com Ambiente/rotina herdados.
- **Eventos publicados**: `CicloCriado` (com referência à origem).
- **Impacto no Premium**: sujeito ao mesmo `LimiteDePlano` de `POST /v1/ciclos`.
- **Idempotência**: obrigatória.
- **Casos de teste**: clonagem não duplica dados indevidamente (doc 02, caso de teste já previsto).

### `POST /v1/produtos/{id}/vincular-lote`
- **Objetivo**: vincular opt-in um Produto (Med) a um Lote (Grow).
- **Módulo**: Med (consumidor de `GET /v1/interno/grow/lotes/{id}/resumo`, Arquétipo API-5).
- **Autorização**: exige `ConsentimentoRegistro` ativo do tipo "vínculo Grow-Med" (doc 04 §23) — **bloqueante**, não apenas recomendado.
- **Eventos publicados**: nenhum evento de domínio novo (atualiza o Produto existente).
- **Impacto na LGPD**: alto — é exatamente o tipo de operação que a auditoria (achado original) exigiu proteger com consentimento explícito.
- **Casos de teste**: tentativa sem consentimento ativo é bloqueada (doc 02/03, caso já previsto).

### `POST /v1/comunidade/publicacoes`
- **Objetivo**: publicar conteúdo (Growlog ou Experiência de Tratamento) na Comunidade.
- **Módulo**: Comunidade (Core), conteúdo referenciado de Grow ou Med.
- **Entrada**: referência ao conteúdo de origem + `ConfiguraçãoDeCompartilhamento` (dimensões + escopo).
- **Eventos publicados**: `ConteudoCompartilhadoAtualizado` (consumido pela projeção de leitura da Comunidade, doc 04 §9.1), `GrowlogPublicado` ou `PublicacaoComunidadeMedCriada`.
- **Impacto na auditoria**: `ConfiguraçãoDeCompartilhamento` é entidade crítica (doc 08 §14) — toda publicação gera `TrilhaDeAuditoria`.
- **Impacto na LGPD**: alto — é o ponto de entrada de todo dado que se torna público.
- **Casos de teste**: publicação nasce privada por padrão; dimensões não autorizadas nunca aparecem na saída (doc 02, caso já previsto).

### `POST /v1/webhooks/pagamento`
- **Objetivo**: receber confirmação/falha de cobrança do gateway de pagamento (provedor definido no doc 13).
- **Módulo**: Core — Billing. **Arquétipo**: API-7 (Webhook).
- **Autenticação**: verificação de assinatura do payload (não Bearer de usuário).
- **Entrada**: payload do provedor (evento de pagamento). **Saída**: confirmação de recebimento (HTTP 200).
- **Eventos publicados**: `PagamentoRecebido` ou `PagamentoFalhou` *(novos — ver seção 9)*, podendo gerar `AssinaturaAtualizada`.
- **Impacto na auditoria**: sim — toda mudança de status de `AssinaturaPremium` gera `TrilhaDeAuditoria` (doc 08 §12.6).
- **Impacto na LGPD**: dado financeiro, tratado com o mesmo rigor de dado sensível.
- **Impacto no Premium**: é o próprio mecanismo que atualiza o status da assinatura.
- **Idempotência**: obrigatória — webhooks de gateway frequentemente reentregam o mesmo evento.
- **Casos de teste**: reentrega do mesmo evento de pagamento não duplica a atualização de status; assinatura de payload inválida é rejeitada.

### `POST /v1/conta/excluir`
- **Objetivo**: iniciar o fluxo de exclusão de conta (doc 04 §21.2).
- **Módulo**: Core — Consentimento.
- **Eventos publicados**: `ContaExclusaoSolicitada` (consumido por Grow, Med, Comunidade, IA — cada um expurga/anonimiza sua fatia).
- **Impacto na LGPD**: é a própria implementação do direito ao esquecimento.
- **Casos de teste**: todos os módulos reagem ao evento mesmo se um estiver temporariamente indisponível (reentrega, doc 04 caso de teste já previsto).

---

## 9. Novas Entidades/Eventos Descobertos Durante Este Documento (sincronizados)

Durante a especificação de idempotência e do webhook de pagamento, surgiram conceitos ainda não catalogados — já **atualizados no [Catálogo de Domínio](catalogo-de-dominio.md)**:

- **`RegistroDeIdempotencia`** (Core, novo — Arquétipo B com expiração): guarda chaves de idempotência já processadas por um período, evitando reprocessar a mesma requisição. Vida curta (expira após a janela de retry razoável).
- **`PagamentoRecebido`**, **`PagamentoFalhou`** (eventos, Core: Billing): publicados pelo webhook de pagamento.
- **`AssinaturaAtualizada`** (evento, Core: Billing): publicado quando o status de `AssinaturaPremium` muda, consumido por Notificações (aviso ao usuário) e `TrilhaDeAuditoria`.

Nenhum outro documento precisou de correção além do próprio Catálogo — os eventos acima são aditivos ao que já existia (doc 07 já previa `AssinaturaIniciada`/`AssinaturaCancelada`; os novos cobrem o ciclo de cobrança recorrente que não havia sido detalhado antes).

---

## 10. Boas Práticas

- Nenhum endpoint novo é criado sem antes verificar se já existe um equivalente no catálogo desta seção 7 (evita a redundância que motivou a auditoria da seção 12).
- Todo endpoint que aparece em mais de um documento de origem (ex.: limites de Premium) é consolidado sob o módulo dono real, nunca deixado duplicado.
- Endpoints Internos (API-5) nunca são acessíveis pelo mesmo caminho público usado por apps cliente — segregação física/lógica de rota, não apenas checagem de token.

---

## 11. Riscos

| Risco | Observação |
|---|---|
| Webhook de pagamento é um novo ponto de entrada externo não coberto pela autenticação Bearer padrão | Mitigado por verificação de assinatura (seção 8), mas exige atenção redobrada no doc 13 (segredo compartilhado com o provedor) |
| Consolidação de endpoints antes duplicados pode exigir que clientes (apps) migrem chamadas já implementadas mentalmente pelos docs anteriores | Não há código ainda — risco teórico, não real, nesta fase |
| Paginação ausente em qualquer lista seria um risco de performance grave em escala | Mitigado pela convenção transversal (seção 5) |

---

## 12. Auditoria Obrigatória (antes de finalizar este documento)

| Verificação | Achado | Correção aplicada |
|---|---|---|
| **Endpoints redundantes** | `/usuario/limites-premium` duplicado em docs 02/03; `/ia/insights` duplicado em docs 02/05; `/comunidade/publicacoes` descrito de forma distinta em docs 02/03/06 | Todos consolidados em um único endpoint por conceito, sob o módulo dono real (seção 7) |
| **Violações de DDD** | Nenhuma encontrada — todo acesso cross-módulo passa por endpoint Interno explícito (`/v1/interno/grow/lotes/{id}/resumo`), nunca acesso direto a schema |
| **Acoplamento entre módulos** | Med depende do endpoint Interno do Grow (aceitável — é a interface pública sancionada, doc 04 §23); nenhum acoplamento não sancionado encontrado |
| **Problemas de segurança** | Webhook de pagamento exigia definição explícita de autenticação por assinatura (não existia menção anterior) | Adicionado como requisito do Arquétipo API-7 (seção 6) |
| **Riscos de performance** | Nenhuma convenção de paginação existia antes deste documento | Adicionada como convenção transversal obrigatória (seção 5) |
| **Problemas de versionamento** | Nenhuma estratégia de versionamento existia antes deste documento | Adicionada convenção `/v1`, `/v2` com política de descontinuação (seção 5) |
| **Oportunidades de simplificação** | `/colheitas`, `/secagens`, `/curas` poderiam virar um único recurso "processo pós-colheita" com sub-ações | Avaliado e **mantido separado** — são três eventos de domínio distintos com timing e regras próprias (doc 02 §5.11); unificá-los tornaria o contrato mais confuso, não mais simples |

**Conclusão da auditoria**: catálogo consistente após as correções acima — nenhuma redundância, violação ou lacuna de segurança/performance/versionamento permanece sem tratamento.

---

## 13. Sugestões de Melhorias

- Ao especificar o doc 13 (Stack), avaliar OpenAPI/Swagger como formato de descrição formal deste catálogo, gerado a partir dele — não o contrário.
- Avaliar, no doc 14, gerar testes de contrato automatizados a partir das seções "Casos de Teste Obrigatórios" já descritas aqui.

---

## 14. Classificação de Escopo (MVP / V2 / V3 / Futuro / Pesquisa)

| Item | Classificação |
|---|---|
| Catálogo consolidado de endpoints (seção 7), convenções transversais | **MVP** |
| `POST/GET /v1/dependentes` | **Versão 2** (já classificado, doc 03) |
| Webhook de pagamento, entidades de billing recorrente | **MVP** (necessário desde o lançamento com assinatura paga) |
| GraphQL ou outro protocolo alternativo | **Futuro/Pesquisa** — doc 13 decide protocolo |

---

## 15. Revisão Final de Arquitetura

- **Dificulta futuras integrações?** Não — endpoints Internos (API-5) já formalizam o padrão de extensão para novos módulos futuros.
- **Dificulta internacionalização?** Não — nenhum contrato assume idioma/moeda/fuso fixo (catálogos código+tradução do doc 08 já se refletem aqui).
- **Dificulta escalabilidade?** Não — paginação e cacheabilidade (API-3) já são convenção desde o início.
- **Dificulta integração com novos aplicativos futuros da COSMARIA?** Não — o padrão de endpoint Interno + Catálogo de Domínio já comprovou, neste próprio documento, que novos conceitos se encaixam sem redesenho.

Nenhuma limitação arquitetural relevante encontrada.

---

## Decisões Consolidadas (validado com o usuário em 2026-07-08)

| # | Tema | Decisão |
|---|---|---|
| 1 | Consolidação de endpoints | Definitiva — substitui toda referência anterior nos docs 02, 03, 05 e 06 |
| 2 | Colheita/Secagem/Cura separados | Confirmado — são eventos de domínio distintos, contratos independentes |

## Princípios Permanentes de API (novos, validados 2026-07-08 — aplicam-se a toda API da plataforma, presente ou futura)

1. Toda API é **stateless** — nenhum estado de sessão é mantido pelo servidor entre requisições além do token.
2. Nunca expor identificador interno de banco quando um identificador público fizer mais sentido (ex.: um "handle" de perfil em vez do ID interno da linha).
3. Todo recurso é rastreável por **Correlation ID** (já previsto no doc 04 §20, reforçado aqui como requisito de toda API sem exceção).
4. Todo endpoint gera **logs estruturados**.
5. Todo endpoint suporta **observabilidade** (logs, métricas e tracing) desde o desenho, não como adição posterior.
6. Toda operação crítica é **idempotente sempre que tecnicamente possível** (reforça e generaliza a seção 6 — idempotência deixa de ser "por arquétipo" e passa a ser buscada por padrão em qualquer escrita crítica).
7. Nenhum endpoint acessa diretamente o schema de outro módulo — somente pelas interfaces públicas já definidas (doc 04 §9, doc 08 §11).
8. Todo endpoint é desenhado para **distribuição horizontal futura sem mudança de contrato** — consequência direta do princípio *stateless* (1): múltiplas instâncias podem atender qualquer requisição.

*(Canonical: doc 00, §16. Aplicam-se também à modelagem de fluxos do doc 10 em diante, por instrução do usuário.)*

Este documento está **concluído**. Seguimos para o **Documento 10 — Fluxos do Usuário (UX)**.

---

## Artefatos para Implementação

### Checklist Técnico
- [ ] Implementar convenções transversais (versionamento, erro padrão, paginação, idempotência) como middleware comum, não reimplementado por endpoint
- [ ] Implementar todos os endpoints do catálogo consolidado (seção 7)
- [ ] Implementar `RegistroDeIdempotencia` (novo, seção 9)
- [ ] Implementar webhook de pagamento com verificação de assinatura
- [ ] Garantir que endpoints Internos (API-5) não sejam roteáveis pelo mesmo gateway público

### Lista de Módulos
Mesma divisão do doc 04 — este documento não introduz módulo novo, apenas contratos.

### Lista de Entidades do Banco
`RegistroDeIdempotencia` (novo) — demais já no [Catálogo de Domínio](catalogo-de-dominio.md).

### Lista de APIs Necessárias
Ver seção 7 (catálogo consolidado) — é a lista oficial e definitiva, substituindo todas as menções anteriores.

### Lista de Permissões
Nenhuma nova além das já previstas.

### Eventos
`PagamentoRecebido`, `PagamentoFalhou`, `AssinaturaAtualizada` (novos, seção 9) — demais já no Catálogo de Domínio.

### Notificações
Aviso de pagamento falho/assinatura atualizada, via central de Notificações do Core (doc 04 §15).

### Casos de Teste
Consolidados por endpoint (seção 8) e por arquétipo (seção 6) — ver também seção 12 para os casos gerados pela auditoria (paginação, idempotência de webhook, segregação de rota interna).

### Dependências com Outros Módulos
Nenhuma nova — este documento consolida, não adiciona, dependências já mapeadas no doc 04 §24.

### Riscos Técnicos
- Migrar o webhook de pagamento para o provedor real (doc 13) exigirá validar o formato exato de assinatura daquele provedor especificamente — o contrato aqui é conceitual
- Consolidação de endpoints antes duplicados deve ser comunicada com clareza no doc 14 (estrutura de código), para que nenhuma implementação comece a partir de uma versão desatualizada descrita num doc anterior
