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
`Usuário` *(Conta — login, autenticação, assinatura, permissões; nunca exposta publicamente na Comunidade)* · `PerfilPúblico` *(um por contexto de aplicativo — Grow, Med, futuros; nome/avatar/biografia/estatísticas/reputação próprios — decidido no doc 06)* · `RegistroDeVinculoDePerfis` *(opt-in explícito para revelar publicamente que dois Perfis Públicos pertencem à mesma Conta — doc 06)* · `PerfilDependente` *(Versão 2 — ver doc 03 §18)* · `ConsentimentoRegistro` · `PreferênciaDeComplexidade` *(única, referenciada por Grow e Med)* · `ConfiguraçãoDeCompartilhamento` *(única; cada módulo registra seu vocabulário de dimensões)* · `TrilhaDeAuditoria` *(mecanismo único de auditoria — doc 08 §7; `RegistroDeAuditoriaDePrivacidade`, doc 04, é o caso de uso deste mecanismo aplicado à privacidade, não uma entidade paralela)* · `SessaoDeAutenticacao` *(token/refresh token — formalizada no doc 08 §14, existia implicitamente desde o doc 04 §10)* · `RegistroDeIdempotencia` *(vida curta, guarda chaves de idempotência já processadas — doc 09 §9)* · `Mídia` *(reclassificada de "do Grow" para Core — revisão 00–09: era usada só por `Planta`, mas o Med também precisa anexar exames/documentos ao `Tratamento`; mesmo erro de propriedade já corrigido antes para Comunidade/Privacidade)* · `AssinaturaPremium` · `LimiteDePlano` · `CupomOuPromocao` · `PeriodoGratuitoConfiguracao` · `PrecoRegional` · `PreferênciaDeNotificação` · `PoliticaDeAgregacao` *(Grow=30, Med=50 — doc 05 §9)*

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
| `AssinaturaAtualizada` | Core (Billing) | Notificações, TrilhaDeAuditoria | Doc 09 |

---

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
