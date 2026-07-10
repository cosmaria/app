# Catálogo de Domínio — Entidades e Eventos

> Documento companion, fora da sequência numerada 00–15 (mesmo espírito do [Ideias Futuras](ideias-futuras.md)). Existe para que a documentação evolua como **um único sistema**: toda entidade e todo evento de domínio já definidos em qualquer documento aparece aqui, com o módulo dono e a origem — evita redefinição inconsistente do mesmo conceito em documentos diferentes (já aconteceu duas vezes antes deste catálogo existir: `ConfiguraçãoDeCompartilhamento`/`PreferênciaDeComplexidade` foram declaradas de forma duplicada em docs 02 e 03, corrigidas no doc 04). Deve ser consultado **antes** de qualquer novo documento introduzir uma entidade/evento, e atualizado **depois** que o documento for aprovado.

---

## Convenção de Nomenclatura (adotada em 2026-07-08)

- **Entidades**: PascalCase, substantivo (ex.: `RegistroDeUso`).
- **Eventos de domínio**: PascalCase, verbo no particípio passado (ex.: `CicloCriado`, `ColheitaRegistrada`) — nunca snake_case.
- **Correção aplicada retroativamente**: os docs 02 e 03 originalmente listavam eventos em `snake_case` (ex.: `ciclo_criado`, `tratamento_criado`) enquanto os docs 04/05 já usavam PascalCase (ex.: `ColheitaRegistrada`, `InsightGerado`) — inconsistência real, corrigida nos próprios docs 02/03 e refletida aqui.

---

## Entidades por Módulo

### Core
`Usuário` *(Conta — login, autenticação, assinatura, permissões; nunca exposta publicamente na Comunidade)* · `PerfilPúblico` *(um por contexto de aplicativo — Grow, Med, futuros; nome/avatar/biografia/estatísticas/reputação próprios — decidido no doc 06)* · `RegistroDeVinculoDePerfis` *(opt-in explícito para revelar publicamente que dois Perfis Públicos pertencem à mesma Conta — doc 06)* · `PerfilDependente` *(Versão 2 — ver doc 03 §18)* · `ConsentimentoRegistro` · `PreferênciaDeComplexidade` *(única, referenciada por Grow e Med)* · `ConfiguraçãoDeCompartilhamento` *(única; cada módulo registra seu vocabulário de dimensões)* · `TrilhaDeAuditoria` *(mecanismo único de auditoria — doc 08 §7; `RegistroDeAuditoriaDePrivacidade`, doc 04, é o caso de uso deste mecanismo aplicado à privacidade, não uma entidade paralela)* · `SessaoDeAutenticacao` *(token/refresh token — formalizada no doc 08 §14, existia implicitamente desde o doc 04 §10)* · `RegistroDeIdempotencia` *(vida curta, guarda chaves de idempotência já processadas — doc 09 §9)* · `Mídia` *(reclassificada de "do Grow" para Core — revisão 00–09: era usada só por `Planta`, mas o Med também precisa anexar exames/documentos ao `Tratamento`; mesmo erro de propriedade já corrigido antes para Comunidade/Privacidade)* · `AssinaturaPremium` · `LimiteDePlano` · `CupomOuPromocao` · `PeriodoGratuitoConfiguracao` · `PrecoRegional` · `PreferênciaDeNotificação` *(canais por categoria, horário de silêncio, fuso local, Modo Discreto)* · `Notificacao` *(novo — Sprint Core-7: o doc 04 §15 exige registrar a notificação silenciada "sem envio" e o doc 10 especifica a Central de Notificações; nenhum dos dois existe sem persistir a notificação. Guarda as duas versões do conteúdo, completa e discreta)* · `PoliticaDeAgregacao` *(Grow=30, Med=50 — doc 05 §9)*

### Grow (doc 02, §11)
`Ambiente` · `DadosClimáticos` *(Módulo Outdoor)* · `Genética` · `Planta` · `CicloCultivo` · `RegistroAmbiental` · `EventoManejo` · `EventoSanidade` · `Tarefa` · `Colheita` *(0—N por Ciclo, corrigido no doc 04 §25)* · `Secagem` · `Cura` · `Lote` · `ModeloDeCiclo` *(novo, Premium — revisão 00-09: dava suporte de banco ausente para "templates avançados de ciclo" do doc 07 §8; template nomeado e reutilizável, distinto de simplesmente clonar o último ciclo)*

### Med (doc 03, §11)
`Tratamento` · `Produto` · `RegistroDeUso` · `SessãoAntesDepois` · `RegistroDeSintomaDiario` · `RegistroDeEfeito` · `Relatorio` · `ModeloDeTratamento` *(novo, Premium — mesmo motivo do `ModeloDeCiclo`, aplicado ao Med)*

### Comunidade — Core (doc 06, generaliza o que docs 02/03 haviam descrito como "do Grow"/"do Med")
`PublicaçãoComunidade` *(referencia conteúdo de Grow ou Med via `ConteudoCompartilhadoAtualizado`)* · `Comentário` · `Curtida` · `Seguimento` *(entre dois `PerfilPúblico` do **mesmo contexto** — não é possível seguir através de contextos diferentes)* · `RegistroDeFork` *(exclusivo do contexto Grow)* · `ReputaçãoDoPerfil` *(calculada por contexto — a reputação do Perfil Grow não influencia a do Perfil Med, e vice-versa)* · `VisualizacaoDePerfil` *(novo, Premium — revisão 00-09: dava suporte de banco ausente para "estatísticas avançadas de perfil (quem visitou)" do doc 06 §11/doc 07 §8; retenção curta e agregada por contador, nunca um log individual permanente, por minimização de dado)*

### IA (doc 05, Artefatos)
`CorrelacaoCalculada` · `InsightGerado` · `AlertaGerado` · `RecomendacaoGerada` · `DigestAnaliticoGerado` · `PerfilDeAprendizadoDoUsuario`

---

## Catálogo de Eventos de Domínio

| Evento | Publicado por | Consumido por | Origem |
|---|---|---|---|
| `CicloCriado` | Grow | Estatísticas, IA | Doc 02 |
| `CicloFinalizado` | Grow | Estatísticas, IA | Doc 02 |
| `PlantaCriada` | Grow | — | Doc 02 |
| `PlantaFaseAlterada` | Grow | IA, Notificações | Doc 02 |
| `RegistroAmbientalCriado` | Grow | IA (Motor de Correlação) | Doc 02/05 |
| `TarefaCriada` | Grow | Notificações | Doc 02 |
| `TarefaConcluida` | Grow | IA | Doc 02 |
| `TarefaSugeridaPelaIAAceita` | Grow | IA (Motor de Aprendizado) | Doc 02/05 |
| `ColheitaRegistrada` | Grow | IA, Notificações | Doc 02/04 |
| `GrowlogPublicado` | Grow | Comunidade (Core) | Doc 02 |
| `GrowlogForkRealizado` | Grow | Comunidade (Core) | Doc 02 |
| `TratamentoCriado` | Med | — | Doc 03 |
| `TratamentoEncerrado` | Med | — | Doc 03 |
| `ProdutoRegistrado` | Med | — | Doc 03 |
| `DoseRegistrada` | Med | IA | Doc 03 |
| `SessaoAntesRegistrada` | Med | Notificações (agendar "depois") | Doc 03 |
| `SessaoDepoisRegistrada` | Med | IA (Motor de Correlação) | Doc 03 |
| `SintomaDiarioRegistrado` | Med | IA | Doc 03 |
| `EfeitoRegistrado` | Med | IA | Doc 03 |
| `RelatorioGerado` | Med / Core (Motor de Relatórios) | — | Doc 03/04/05 |
| `PublicacaoComunidadeMedCriada` | Med | Comunidade (Core) | Doc 03 |
| `PerfilPublicoCriado` | Core (Identidade Social) | *(informacional — nenhuma reação necessária; deliberadamente NÃO auditado: criar um perfil não é revelação de identidade)* | Doc 06 |
| `VinculoDePerfisAutorizado` | Core (Identidade Social) | **TrilhaDeAuditoria** *(corrigido na revisão 00-09 — era implicação de privacidade sem consumidor de auditoria)* | Doc 06 |
| `VinculoDePerfisRevogado` | Core (Identidade Social) | **TrilhaDeAuditoria** *(novo — Sprint Core-5: doc 08 §14 exige trilha para toda mudança em entidade crítica, e desfazer um vínculo é uma dessas mudanças; só a autorização tinha evento)* | Doc 06 (implementação) |
| `ConfiguracaoDeCompartilhamentoAlterada` | Core (Comunidade/Grow/Med, ao publicar ou editar privacidade) | **TrilhaDeAuditoria** *(novo — revisão 00-09: doc 08 §7 já exigia auditoria dessa entidade, mas nenhum evento a implementava)* | Doc 09 (revisão) |
| `ProdutoVinculadoALote` | Med | **IA** (Motor de Correlação — inicia consideração de dados do Grow para a correlação, doc 03 §8) *(novo — revisão 00-09: ação existia mas não publicava evento, IA não tinha como saber)* | Doc 09 (revisão) |
| `SeguimentoIniciado`, `ComentarioCriado`, `CurtidaRegistrada` | Comunidade | Notificações *(novos — revisão 00-09: doc 06 já prometia notificação de "novo seguidor/comentário/curtida", mas os eventos que disparariam isso nunca foram catalogados)* | Doc 09 (revisão) |
| `ContaExclusaoSolicitada` | Core (Consentimento) | Grow, Med, Comunidade, IA | Doc 04 |
| `ExportacaoDadosSolicitada` | Core (Consentimento) | Grow, Med, Comunidade, IA | Doc 04 |
| `ConsentimentoAlterado` | Core (Consentimento) | Grow, Med, IA | Doc 04 |
| `ConteudoCompartilhadoAtualizado` | Grow, Med | Comunidade (Core) | Doc 04 §9.1 |
| `LimitePremiumAtingido` | Core (Billing) | Grow, Med, Notificações | Doc 02/03/04 (unificado — era duplicado por app, agora um único evento do Core) |
| `CorrelacaoCalculada` | IA (Motor de Correlação) | IA (Motor de Insights) | Doc 05 |
| `InsightGerado` | IA (Motor de Insights) | Comunidade (se relevante), App | Doc 05 |
| `AlertaGerado` | IA (Motor de Alertas) | Notificações, Grow (sugestão de tarefa) | Doc 04/05 |
| `RecomendacaoGerada` | IA (Motor de Recomendações) | App | Doc 05 |
| `DigestAnaliticoGerado` | IA (Motor de Relatórios) | Core (Motor de Relatórios) | Doc 05 |
| `PerfilDeAprendizadoAtualizado` | IA (Motor de Aprendizado) | IA (Insights, Alertas, Recomendações) | Doc 05 |
| `InsightMarcadoUtil` | App (interação do usuário) | IA (Motor de Aprendizado) | Doc 05 |
| `AlertaIgnorado` | App (interação do usuário) | IA (Motor de Aprendizado) | Doc 05 |
| `RecomendacaoAceita` | App (interação do usuário) | IA (Motor de Aprendizado) | Doc 05 |
| `PagamentoRecebido` | Core (Billing, via webhook) | Core (Billing), TrilhaDeAuditoria | Doc 09 |
| `PagamentoFalhou` | Core (Billing, via webhook) | Notificações, TrilhaDeAuditoria | Doc 09 |
| `AssinaturaAtualizada` | Core (Billing) | Notificações, **TrilhaDeAuditoria** | Doc 09 |

> **`AssinaturaIniciada`/`AssinaturaCancelada` foram consolidados em `AssinaturaAtualizada`** (Sprint Core-6). O doc 07 os previa como eventos separados, mas ambos são casos particulares de uma transição de status, já descrita pelos campos `statusAnterior`→`statusNovo` do evento único. Publicar os três criaria duas fontes de verdade para o mesmo fato. Mesmo precedente da unificação de `LimitePremiumAtingido`, que era duplicado por app antes do doc 04.

---

## Log de Correções Aplicadas (implementação — Sprint Core-9, Complexidade Progressiva)

- 2026-07-09 — Implementação do Módulo de Complexidade Progressiva (doc 02 §5.0/§6) como capacidade **transversal do Core**. Decisões: (1) a `PreferênciaDeComplexidade` é **uma linha por Conta**, nunca por app — quem já é especialista no cultivo não volta ao formulário de iniciante no acompanhamento terapêutico; (2) além do nível (essencial/avançado/especialista), a entidade guarda **campos habilitados individualmente**, que é o que o doc 02 §5.0 chama de "habilitação progressiva": o usuário passa a registrar EC sem encarar todos os parâmetros de especialista de uma vez; (3) **Grow e Med declaram o nível de cada campo** e perguntam ao Core o que exibir (`COMPLEXIDADE_PUBLIC_API.filtrarCampos`) — o vocabulário de campos pertence aos módulos, a regra de corte pertence ao Core, e nenhum dos dois a reimplementa; (4) `desabilitarCampo` remove apenas a liberação individual e **não esconde o que o nível já mostra** — para ver menos, o usuário baixa o nível, o que mantém a regra de visibilidade com uma única fonte de verdade; (5) a ordem dos níveis vive numa tabela explícita, não na ordem de declaração do enum, para que reordenar o enum não mude silenciosamente quem vê o quê.

## Log de Correções Aplicadas (implementação — Sprint Core-8, Armazenamento de Mídia)

- 2026-07-09 — Implementação da `Mídia` como capacidade do Core (doc 04 §16, doc 08 §12.1). Decisões: (1) o **binário nunca entra no banco nem no domínio** — a entidade guarda só a chave no armazenamento de objetos, e o acesso é sempre por **URL assinada e temporária**; a chave jamais é exposta ao cliente; (2) **lista fechada de MIME** (jpeg/png/webp/heic/pdf), não `image/*` genérico: um MIME livre é vetor de upload de conteúdo executável travestido de imagem; (3) o **limite de tamanho reusa o gate de `LimiteDePlano`** (`core.midia_tamanho_maximo_bytes`, gratuito 5 MiB, Premium ilimitado) em vez de uma regra própria — é a tradução verificável do que o doc 07 §8 chama de "resolução padrão" vs. "alta resolução sem limite" (resolução exigiria decodificar a imagem no servidor; tamanho não), e barrar aqui já publica `LimitePremiumAtingido`, que dispara paywall e notificação; (4) a chave é **particionada por usuário** (`{usuarioId}/{midiaId}`), o que impede adivinhação entre Contas e torna o expurgo LGPD um prefixo só; (5) o adaptador local protege contra **path traversal** (`../`) — chave que escapa do diretório base é recusada. Novos endpoints no doc 09 (`GET /v1/midia/{id}`, `GET /v1/midia/entidade/...`, `DELETE /v1/midia/{id}`, `GET /v1/arquivos`): o doc só previa o `POST`, e sem os demais a mídia enviada não podia ser lida, listada nem removida.

## Log de Correções Aplicadas (implementação — Sprint Core-7, Notificações)

- 2026-07-09 — Implementação do Serviço de Notificações (doc 04 §15). Descobertas: (1) **entidade `Notificacao` não existia no catálogo** — só havia `PreferênciaDeNotificação`, mas o doc 04 §15 exige que a notificação silenciada seja "registrada sem envio" e o doc 10 especifica a Central de Notificações; nenhum dos dois é possível sem persistir a notificação (entidade criada, Arquétipo B); (2) **faltavam `GET /v1/notificacoes` e `POST /v1/notificacoes/{id}/ler` no doc 09** — sem eles a notificação registrada nunca poderia ser lida por ninguém (endpoints adicionados); (3) `fusoHorario` passou a viver em `PreferênciaDeNotificação`, porque o horário de silêncio é **local**, não UTC — nasce em `'UTC'`, já que assumir o fuso do mercado inicial seria o hardcode que o doc 00 proíbe; (4) o **anti-spam reusa `RegistroDeIdempotencia`** (Redis `SET NX`) do Billing: "esta chave já foi vista na janela?" é a mesma pergunta, com outro nome — nenhuma porta nova. Invariante permanente registrada: **silenciar nunca descarta** — o silêncio impede o envio externo, jamais o registro na Central. Decisão de conteúdo: quem produz a notificação fornece **duas versões** (completa e discreta), e o Modo Discreto (doc 01 §15) escolhe no despacho — assim nenhum adaptador de provedor externo chega a ver o texto sensível.

## Log de Correções Aplicadas (implementação — Sprint Core-6, Billing & Premium)

- 2026-07-09 — Implementação de `AssinaturaPremium`, `LimiteDePlano`, `CupomOuPromocao`, `PeriodoGratuitoConfiguracao`, `PrecoRegional` e do webhook de pagamento. Descobertas: (1) **novo status `PENDENTE_PAGAMENTO`** — o doc 08 listava trial/ativa/inadimplente/cancelada, mas sem um estado "quis assinar, aguardando confirmação" o upgrade só teria duas saídas, ambas erradas: conceder Premium antes de o gateway confirmar o dinheiro, ou descartar a intenção de upgrade; (2) **`AssinaturaIniciada`/`AssinaturaCancelada` consolidados** em `AssinaturaAtualizada` (ver nota na tabela de eventos); (3) **novo erro `PRECO_NAO_CONFIGURADO`** — sem `PrecoRegional` para a região, o upgrade recusa em vez de arbitrar um valor em código, o que violaria a separação arquitetura/negócio/comercial do doc 07 §9.1; (4) `RegistroDeIdempotencia` implementado sobre o `CachePort` (Redis `SET NX`) e não como tabela, coerente com "vida curta, expira" do doc 09 §9 — uma tabela exigiria job de expurgo só para não crescer indefinidamente; (5) o **cancelamento é gentil**: `CANCELADA` mantém o Premium até o fim do período já pago, e só então o plano efetivo volta ao gratuito — nenhum dado histórico é perdido (doc 07 §9, caso de teste obrigatório). Confirmado que `LimiteDePlano` rege **apenas capacidade simultânea futura**: chave ausente significa ilimitado, e nenhum caminho de leitura de histórico consulta limite.

## Log de Correções Aplicadas (implementação — Sprint Core-5, Identidade Social)

- 2026-07-09 — Ao implementar `PerfilPúblico`/`RegistroDeVinculoDePerfis`, três lacunas reais apareceram: (1) **`VinculoDePerfisRevogado` não existia** — só a autorização publicava evento, mas o doc 08 §14 exige trilha de auditoria para *toda* mudança em entidade crítica, e a revogação é uma delas (evento criado e auditado); (2) o **`GET /v1/comunidade/vinculo-perfis` faltava no doc 09** — sem ele a tela de Configuração de Vínculo não renderiza o estado atual após restart do app (endpoint adicionado ao doc 09); (3) esclarecido que o consentimento `VINCULO_GROW_MED` **não** governa o vínculo de perfis — aquele consentimento é sobre cruzar *dados* Grow↔Med, este registro é sobre revelar *identidade social*; conflatá-los faria um opt-in liberar silenciosamente o outro. Também registrado que a `TrilhaDeAuditoria` guarda apenas a **quantidade** de perfis vinculados, nunca os ids: a própria trilha, de outro modo, viraria o cruzamento de contextos que o doc 06 §13 proíbe.

## Log de Correções Aplicadas (revisão arquitetural 00–09)

- 2026-07-08 — Revisão cruzada completa dos docs 00–09 a pedido do usuário, procurando inconsistências domínio↔API, entidades órfãs, eventos sem consumidor, APIs sem evento, regras duplicadas, funcionalidades Premium sem suporte no banco, lacunas de LGPD nas APIs. Achados e correções: `Mídia` reclassificada do Grow para o Core (Med também precisa anexar exames); novas entidades `ModeloDeCiclo`/`ModeloDeTratamento` (davam suporte a "templates avançados", Premium, doc 07) e `VisualizacaoDePerfil` (davam suporte a "estatísticas avançadas de perfil", Premium, doc 06/07); novos eventos `ConfiguracaoDeCompartilhamentoAlterada`, `ProdutoVinculadoALote`, `SeguimentoIniciado`, `ComentarioCriado`, `CurtidaRegistrada`; `VinculoDePerfisAutorizado` passou a ser consumido por `TrilhaDeAuditoria`; endpoints ausentes adicionados ao doc 09 (Genética CRUD, GET de Lote, GET de consentimento, status de exportação, admin de trilha de auditoria/cupons/período gratuito, perfil de aprendizado). Esclarecido que a regra de N mínimo de coorte (doc 05 §9) é aplicada **somente** pela IA na geração do insight — a Comunidade nunca reimplementa essa checagem, apenas exibe o que a IA já validou (evita duplicação de regra de negócio que poderia divergir).

## Log de Correções Aplicadas (doc 09)

- 2026-07-08 (doc 09) — Consolidados endpoints antes duplicados (`/usuario/limites-premium` em 02/03, `/ia/insights` em 02/05, `/comunidade/publicacoes` em 02/03/06) sob um único endpoint por conceito, no módulo dono real. Adicionadas `RegistroDeIdempotencia` e os eventos `PagamentoRecebido`/`PagamentoFalhou`/`AssinaturaAtualizada`, descobertos ao detalhar o webhook de pagamento.

## Log de Correções Aplicadas

- 2026-07-08 — Padronizados para PascalCase os eventos originalmente em snake_case nos docs 02 e 03 (ex.: `ciclo_criado` → `CicloCriado`, `limite_premium_atingido` → `LimitePremiumAtingido`, agora reconhecido como um único evento do Core, não duplicado por app).
- 2026-07-08 — Catálogo criado retroativamente a partir dos docs 00–05, no âmbito da mudança de processo para documentação como sistema único.
- 2026-07-08 (doc 08) — Corrigida cardinalidade de `Colheita` para 0—N por `CicloCultivo` (auditoria de consistência do doc 08 confirmou e reforçou a correção já feita no doc 04 §25). `RegistroDeAuditoriaDePrivacidade` generalizado em `TrilhaDeAuditoria`. Catálogos internos (fase de vida, tipo de efeito, via de administração, tipo de evento de sanidade) passam a usar padrão código + tradução em vez de texto livre em português (risco de internacionalização identificado na auditoria do doc 08 §17). Adicionado campo conceitual "origem do registro" (manual/sensor/importado) a todas as entidades de série temporal.
