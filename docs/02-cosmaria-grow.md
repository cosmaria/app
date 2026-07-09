# 02 — COSMARIA Grow (Documento 100% Completo)

> Status: **Rascunho para validação.** Depende das decisões dos docs [00](00-visao-geral-da-plataforma.md) e [01](01-identidade-da-cosmaria.md). Este documento especifica o produto Grow em nível de funcionalidades, fluxos, IA, comunidade, Premium e modelo de dados lógico — a arquitetura técnica (doc 04) e o schema físico (doc 08) serão desenhados a partir do que está aqui, não o contrário.

---

## 1. Objetivos

- Ser **o melhor diário de cultivo de cannabis do mundo em língua portuguesa** — não apenas equivalente aos concorrentes internacionais, superior a eles.
- Registrar o ciclo de vida completo de um cultivo, do planejamento da genética até a cura pós-colheita, sem lacunas.
- Transformar esse registro em conhecimento acionável via IA (padrões, comparações, previsões, alertas) — nunca ser "só uma planilha bonita".
- Servir tanto o cultivador iniciante (orientação, redução de erro) quanto o experiente/profissional-amador (profundidade de dados, comparação entre ciclos).
- Preparar terreno, desde a modelagem lógica, para a correlação opt-in futura com o COSMARIA Med (doc 04 em diante).

---

## 2. Problemas que Resolve

| Problema hoje | Como o Grow resolve |
|---|---|
| Apps genéricos de "plantas" não entendem fases de vida, nutrientes e parâmetros específicos de cannabis | Modelo de dados nativo para cannabis (genética, fotoperíodo/auto, VPD/PPFD/DLI, etc.) |
| Concorrentes internacionais (GrowDiaries, Grow with Jane, Tetragram) são em inglês, com IA ainda incipiente ou genérica | Produto em português, com IA como parte central da experiência desde o dia 1 |
| Cultivador perde histórico entre cultivos e não consegue comparar ciclos de forma objetiva | Comparação automática de ciclos, com métricas padronizadas |
| Registro diário é tedioso e cai em desuso (baixa retenção em diários manuais/planilhas) | Fluxos de registro rápido, templates reaproveitáveis, e valor percebido imediato via insights |
| Conhecimento de cultivo fica disperso em fóruns/grupos sem estrutura pesquisável | Comunidade estruturada e pesquisável, integrada aos dados reais do cultivo (não anônima genérica) |

---

## 3. Escopo

**Incluído**: cultivo individual (indoor, outdoor, estufa) para uso próprio — genéticas, ambientes, ciclos, manejo, sanidade, colheita, pós-colheita, estatísticas, IA de apoio, comunidade, camada Premium específica do Grow.

**Fora de escopo do Grow** (por decisão do doc 00, reforçada aqui): cultivo comercial em larga escala (multi-sala industrial com controle de produção/compliance regulatório de indústria), marketplace de insumos/sementes, venda de produtos.

---

## 4. Análise Competitiva (Benchmark)

Análise baseada em conhecimento geral de mercado e pesquisa pontual (2026) — **recomendo uma auditoria competitiva formal e recorrente** antes do lançamento, já que apps evoluem rápido.

| App | Pontos fortes | Pontos fracos / lacunas |
|---|---|---|
| **Grow with Jane** | Growlogs sociais fortes, "Jane AI" para perguntas sobre a planta, gráficos comparando pH/nutrientes entre cultivos, freemium claro (Pro = mais árvores/ambientes, suporte de especialista) | IA é conversacional/reativa (responde perguntas), não é preditiva/proativa; não há terminologia/idioma nativo em português; comunidade é mais "feed social" do que base de conhecimento pesquisável |
| **GrowDiaries** | Base de diários muito grande, boa cobertura de espécies/métodos, comunidade ativa em fóruns | Historicamente web-first (apps nativos só recentemente saindo de beta), IA ainda no roadmap ("assistente de IA" anunciado, não maduro), curva de descoberta de conteúdo depende de navegação manual |
| **Grow Journal (AI)** | Já nasce com proposta de "comunidade + IA" | Posicionamento ainda genérico/incipiente; sem diferenciação forte de dados clínicos/estruturados |
| **Tetragram** | Foco em simplicidade de registro | Menos profundidade em parâmetros ambientais avançados (VPD/PPFD/DLI) e em comunidade |
| **SeedFinder / Leafly / AllBud** | Excelentes bases de dados de genéticas/strains (referência, não diário) | Não são diários de cultivo pessoal — servem como fonte de dados de genética, não de acompanhamento |

**Conclusão do benchmark**: nenhum concorrente combina, ao mesmo tempo, (1) IA verdadeiramente preditiva/proativa (não só um chatbot), (2) comunidade estruturada e pesquisável por parâmetro técnico (não só feed social), e (3) modelagem de dados nativa em português com rigor científico. Esse é o espaço de diferenciação da COSMARIA Grow.

### Diferenciais Estratégicos Propostos (respondendo às perguntas-guia do projeto)

| Pergunta-guia | Proposta de diferencial |
|---|---|
| **O que nenhum concorrente faz hoje?** | IA que não só responde perguntas, mas **prevê rendimento**, **detecta problemas antes de se agravarem** (ex.: tendência de VPD saindo da faixa saudável) e **gera automaticamente um relatório comparável entre ciclos** sem o usuário pedir. |
| **Como simplificar a experiência?** | "Check-in diário" único que registra múltiplos parâmetros em uma tela (em vez de telas separadas por tipo de dado); duplicar/clonar um ciclo anterior como ponto de partida do próximo, herdando ambiente e rotina. |
| **Como criar mais valor?** | Alertas acionáveis: a IA não só aponta um problema, ela **sugere e pré-preenche uma tarefa corretiva** ("EC alto detectado — criar tarefa de flush?"), fechando o ciclo entre insight e ação. |
| **Como aumentar retenção?** | Relatório semanal automático do ciclo (enviado via notificação, sem precisar abrir o app), marcos de cultivo com reconhecimento visual (não é "gamificação vazia" — é o próprio progresso real da planta destacado). |
| **Como aumentar efeito de rede?** | "Fork" de um cultivo (copiar um cultivo público como modelo) + perfis de cultivador seguíveis + busca por genética/equipamento — clássico efeito de rede de conteúdo gerado por usuário: quanto mais cultivadores, mais rica a base de genéticas/configurações para todos. |
| **Como tornar a IA realmente útil?** | IA ancorada nos dados reais do próprio histórico do usuário (não respostas genéricas de LLM sobre cannabis em geral) — diferencia de concorrentes cuja IA é um chatbot genérico. |

*(Proposta para validação — ver perguntas estratégicas no final. Nenhuma dessas ideias deve ser considerada definitiva até sua aprovação.)*

---

## 5. Funcionalidades (Detalhamento Completo)

### 5.0 Complexidade Progressiva e Modo Especialista (validado 2026-07-08)

O Grow é **um único fluxo de aplicativo**, não dois apps/modos separados para iniciante e avançado. A complexidade cresce com o usuário:

- **Primeiro cultivo**: só os registros essenciais aparecem por padrão (ex.: check-in básico, sem exigir EC/VPD/PPFD/DLI de cara).
- **Habilitação progressiva**: conforme o usuário demonstra interesse (ou explicitamente ativa nas configurações), campos e telas mais avançados aparecem.
- **Modo Especialista**: toggle explícito que libera todos os parâmetros disponíveis de uma vez, para quem já sabe o que quer desde o primeiro dia.

Este comportamento se aplica a todas as seções 5.1–5.12 abaixo — cada parâmetro/campo tem um nível associado (essencial / avançado / especialista), não é uma tela separada.

### 5.1 Genética, Sementes, Clones e Plantas-Mãe
- Cadastro de genética/strain (nome, tipo — fotoperiódica ou autoflorescente, linhagem/breeder se conhecido, características esperadas).
- Origem do material: semente (própria, comprada, banco de genética), clone, ou planta-mãe.
- Registro e histórico de plantas-mãe (para rastrear a origem de múltiplos clones ao longo do tempo).
- Vínculo entre uma planta individual e sua genética/origem, permitindo comparação futura entre cultivos da mesma genética.

### 5.2 Plantas e Ciclos de Vida
- Uma "planta" é a unidade central de registro; um "ciclo de cultivo" agrupa uma ou mais plantas cultivadas juntas no tempo/ambiente.
- Fases de vida (germinação, vegetativo, pré-floração, floração, colheita, secagem, cura) com transições registradas e datadas — base para todas as métricas de duração de fase.

### 5.3 Ambientes
- Cadastro de ambiente (**indoor, outdoor ou estufa** — os três suportados desde a v1), com metadados (dimensões, tipo de ambiente, número de plantas suportadas).
- Um ambiente pode hospedar múltiplos ciclos ao longo do tempo (histórico do próprio espaço, não só da planta).
- **Ambientes outdoor** ganham campos específicos (localização aproximada, dados climáticos, previsão do tempo, dados solares) fornecidos por um **módulo desacoplado** (ver seção 6) — o núcleo de Ambiente não depende dessas integrações para funcionar; outdoor "manual" (sem integração climática) já é MVP funcional, a automação climática evolui independentemente.

### 5.4 Iluminação
- Tipo de iluminação (LED, HPS, CFL, sol), potência, espectro (se disponível), fotoperíodo (horas de luz/escuro) e seu histórico de mudança entre fases.

### 5.5 Irrigação e Fertilização
- Registro de irrigação (volume, frequência, tipo de água), fertilizantes/nutrientes utilizados (marca, tipo, dosagem), com histórico por planta/ambiente.

### 5.6 Parâmetros Técnicos
- **pH** e **EC** (solução nutritiva e/ou substrato), com séries temporais.
- **Temperatura** e **umidade** (ambiente e, se aplicável, substrato).
- **VPD** (Déficit de Pressão de Vapor) — calculado a partir de temperatura/umidade, com faixas saudáveis por fase.
- **PPFD** (densidade de fluxo de fótons fotossintéticos) e **DLI** (integral de luz diária) — para avaliar adequação da iluminação por fase.

### 5.7 Manejo
- Podas e treinamentos (topping, LST, SCROG, defoliação, etc.), com data, tipo e observações.
- Transplantes (tamanho/tipo de vaso, substrato, data).

### 5.8 Sanidade
- Registro de pragas e doenças (tipo, severidade, tratamento aplicado, evolução/resolução).

### 5.9 Registro Fotográfico
- Fotos vinculadas a planta/data/fase, permitindo linha do tempo visual e comparação lado a lado entre datas ou entre ciclos.

### 5.10 Tarefas e Lembretes
- Tarefas recorrentes (rega, fertilização) e pontuais (transplante, poda), com lembretes/notificações.
- Tarefas geradas automaticamente pela IA a partir de alertas (ver seção 8).

### 5.11 Colheita, Secagem, Cura e Rendimento
- Registro de colheita (peso úmido, data), secagem (duração, condições), cura (duração, condições, "burping"), rendimento final (peso seco, e opcionalmente por planta/m²/watt).
- **Correção de modelagem (doc 04, §25, a partir da Auditoria)**: uma Colheita não é 1—1 com o Ciclo — um ciclo com múltiplas plantas pode ter **colheitas escalonadas** (plantas maduras em datas diferentes). Cada Colheita referencia um subconjunto de Plantas do ciclo, e um Ciclo pode ter 0—N Colheitas.
- Geração de um **lote** de colheita — unidade que poderá, futuramente e de forma opt-in, ser referenciada no COSMARIA Med como origem de um tratamento.

### 5.12 Histórico Completo e Estatísticas
- Timeline completa por planta e por ciclo.
- Comparações automáticas entre ciclos (mesma genética, mesmo ambiente, ou livre) — duração de fases, rendimento, incidência de problemas.

---

## 6. Estrutura Modular

```
COSMARIA Grow
│
├── Genética (Strain, Semente, Clone, Planta-mãe)
├── Ambiente (tenda/estufa/outdoor)
├── Planta (unidade central, vinculada a Genética + Ambiente)
├── Ciclo de Cultivo (agrupa plantas no tempo)
├── Registro Ambiental (séries temporais: temp, umidade, VPD, PPFD, DLI, pH, EC)
├── Manejo (poda, treinamento, transplante)
├── Sanidade (praga, doença)
├── Mídia (fotos vinculadas à timeline)
├── Tarefas e Lembretes
├── Colheita → Secagem → Cura → Lote
├── Estatísticas e Comparações (motor de agregação sobre os módulos acima)
├── IA do Grow (consome todos os módulos acima — ver seção 8)
├── Comunidade do Grow (publica/consome Ciclos e Plantas, com Motor de Privacidade Granular — ver seção 9)
├── Premium do Grow (desbloqueia profundidade de IA/Estatísticas/Armazenamento — ver seção 10)
├── Módulo Outdoor (desacoplado/plugável) — dados climáticos, previsão do tempo, dados solares; conecta-se ao Ambiente mas pode evoluir/ser substituído sem afetar o core
└── Módulo de Complexidade Progressiva (transversal) — decide, para cada campo/tela, se aparece no nível essencial, avançado ou especialista do usuário
```

Princípio: cada módulo é independente o bastante para evoluir sozinho, mas todos alimentam o mesmo histórico central da planta/ciclo — é esse histórico central que a IA e as Estatísticas consultam. O **Módulo Outdoor** é explicitamente desacoplado (validado 2026-07-08): o núcleo de Ambiente/Planta/Ciclo nunca depende dele para funcionar — ele só enriquece ambientes outdoor quando disponível/configurado.

> **Atualização (doc 04 — Arquitetura Geral)**: o Motor de Privacidade Granular e a Comunidade, descritos abaixo (seção 9) como se fossem "do Grow", foram formalizados no doc 04 como **serviços do Core**, compartilhados com o Med e com qualquer módulo futuro. O Grow apenas consome esses serviços e registra seu próprio vocabulário de dimensões de privacidade — não os possui. Da mesma forma, "Preferência de Complexidade" (seção 11) é uma entidade única do Core, não duplicada por app.

---

## 7. Fluxos (principais)

1. **Início de um cultivo**: usuário cria Ambiente (ou reutiliza um existente) → cria Planta(s) vinculada(s) a uma Genética → define início do ciclo.
2. **Registro diário/recorrente**: check-in único (parâmetros do dia, foto opcional, tarefas concluídas) — pensado para levar segundos, não minutos.
3. **Transição de fase**: sistema sugere transição (ex.: vegetativo → floração) com base em fotoperíodo/tempo, usuário confirma.
4. **Alerta e ação**: IA identifica um parâmetro fora da faixa saudável → gera alerta → usuário aceita tarefa corretiva sugerida com um toque.
5. **Colheita**: usuário registra colheita → sistema guia secagem/cura com lembretes → gera relatório final do ciclo (rendimento, duração, comparação com ciclos anteriores).
6. **Fim de ciclo → novo ciclo**: usuário pode "clonar" o ciclo anterior (mesmo ambiente/rotina) como ponto de partida do próximo.
7. **Publicação na comunidade** (opcional): usuário escolhe publicar o ciclo/planta como "Growlog público", com controle granular do que é exibido.

---

## 8. Requisitos de Inteligência Artificial (nível de produto — Grow)

> Escopo: **o que a IA precisa entregar para o Grow**, do ponto de vista do produto. A arquitetura técnica de como isso é servido (modelos, pipelines, custo) fica no doc 05 (Inteligência Artificial), que será escrito depois deste documento e do doc 03 (Med), reunindo os requisitos de ambos os apps em um único serviço compartilhado.

- **Identificação de padrões**: destacar correlações no próprio histórico do usuário (ex.: "seus ciclos com X ambiente tiveram Y% mais rendimento").
- **Comparação automática de ciclos**: sem esforço manual, ao final (ou durante) de cada ciclo.
- **Previsão de rendimento**: estimativa baseada em variáveis registradas ao longo do ciclo atual, comparadas ao histórico.
- **Detecção precoce de problemas**: alertas antes que um parâmetro fora da faixa vire um problema visível (praga, deficiência, estresse).
- **Sugestão de ação corretiva**: cada alerta vem acompanhado de uma tarefa sugerida (fechando o loop insight → ação, diferencial da seção 4).
- **Relatório automático de ciclo**: gerado ao final do ciclo (e semanalmente durante), resumindo o que aconteceu e o que pode melhorar no próximo.
- **Correlação futura com o Med (opt-in)**: quando um lote de colheita é referenciado em um tratamento do Med, a IA pode (com consentimento) relacionar características do cultivo aos resultados terapêuticos relatados.

---

## 9. Requisitos de Comunidade (nível de produto — Grow)

> Escopo: mesma lógica da seção 8 — requisitos de produto específicos do Grow; a especificação completa e compartilhada da Comunidade (moderação, infraestrutura social, regras comuns a Grow e Med) fica no doc 06.

### 9.1 Privacidade — princípio central (validado 2026-07-08)

**Todo cultivo nasce privado.** Nada é visível a terceiros até o usuário decidir compartilhar, e o compartilhamento é **granular por campo/dimensão**, não um botão único "tornar público". Privacidade é tratada como um dos maiores diferenciais competitivos da plataforma (nenhum concorrente do benchmark da seção 4 oferece esse nível de controle). *(Nota: o motor que aplica esta regra é um serviço do Core — doc 04, §12 — não algo implementado dentro do Grow; o Grow apenas registra as dimensões abaixo como seu vocabulário específico.)*

**Dimensões de conteúdo que podem ser compartilhadas independentemente** (todas OFF por padrão):
- Fotos
- Resultados/rendimento
- Genética
- Localização (pode ser ocultada mesmo se o resto for público)
- Datas (pode ocultar datas exatas mantendo a sequência relativa dos eventos)
- Equipamentos (iluminação, ventilação, etc.)
- Parâmetros técnicos (pH, EC, VPD, PPFD, DLI, etc.)

**Escopos de visibilidade** (para qualquer combinação de dimensões acima escolhida):
- Somente seguidores
- Somente amigos *(conceito a validar no doc 06 — ver [Ideias Futuras](ideias-futuras.md), classificado como Pesquisa)*
- Somente por link direto (não listado/não pesquisável) *(classificado como Versão 2 — ver [Ideias Futuras](ideias-futuras.md))*
- Público total (visível e pesquisável por qualquer usuário)

Isso significa, na prática, que o usuário pode configurar, por exemplo: "compartilhar fotos e genética, publicamente, mas ocultar localização, datas exatas e parâmetros técnicos" — tudo em uma única publicação.

### 9.2 Funcionalidades

- Publicar um Ciclo/Planta como "Growlog", com o motor de privacidade granular da seção 9.1 aplicado no momento da publicação (e editável depois).
- Seguir outros cultivadores; curtir, comentar, salvar publicações (respeitando o escopo de visibilidade configurado pelo autor).
- Pesquisar publicações por **genética**, **fertilizante**, **modelo de LED/iluminação** e **equipamento** — busca estruturada por parâmetro técnico, não só texto livre (diferencial apontado na seção 4). A busca só retorna o que o autor tornou público/pesquisável naquela dimensão.
- **"Fork" de um cultivo**: copiar a configuração (ambiente, genética, rotina) de um Growlog compartilhado como modelo para iniciar o próprio ciclo — mecanismo central de efeito de rede. Um fork só pode copiar as dimensões que o autor original tornou visíveis ao usuário que está fazendo o fork.

---

## 10. Requisitos de Sistema Premium (nível de produto — Grow)

> Escopo: requisitos específicos do Grow; o modelo de negócio e regras gerais de Premium (comuns a Grow e Med) ficam no doc 07. **Decidido no doc 07**: existe uma única Assinatura COSMARIA Premium, pertencente à Conta (não ao aplicativo) — o que segue são as funcionalidades do Grow que essa assinatura única desbloqueia, não um plano Premium separado do Grow.

**Gratuito (deve permanecer extremamente útil)**: registro completo de plantas/ciclos/parâmetros, tarefas/lembretes, fotos, histórico, um número razoável de ambientes/ciclos simultâneos, insights básicos de IA.

**Premium (Grow)** — princípio duro: nunca capar o registro básico, só ampliar profundidade analítica e conveniência:
- IA avançada (previsão de rendimento, detecção precoce de problemas, relatórios automáticos completos).
- Comparações ilimitadas entre ciclos e genéticas.
- Armazenamento ampliado de fotos/histórico.
- Ambientes/ciclos simultâneos ilimitados (relevante para cultivadores com múltiplos ambientes).
- Exportação de relatórios (PDF/dados) do cultivo.

**Decisão registrada (2026-07-08)**: nenhum limite numérico específico do plano gratuito é fixado neste documento. O doc 07 (Sistema Premium) apresentará **no mínimo 3 estratégias de monetização diferentes** (cada uma com vantagens, desvantagens, impacto na retenção, impacto na conversão e comparação com concorrentes) antes de qualquer limite ser decidido.

---

## 11. Modelo de Dados Lógico do Grow (conceitual — não é o schema físico)

> Escopo: entidades e relacionamentos em nível conceitual, para orientar o doc 04 (Arquitetura) e o doc 08 (Banco de Dados). Tecnologia-agnóstico.

- **Usuário** (compartilhado com a plataforma) 1—N **Ambiente**
- **Ambiente** 1—N **Ciclo de Cultivo**
- **Genética** 1—N **Planta** (uma genética pode originar múltiplas plantas/clones)
- **Ciclo de Cultivo** 1—N **Planta**
- **Planta** 1—N **Registro Ambiental** (séries temporais: pH, EC, temp, umidade, VPD, PPFD, DLI)
- **Planta** 1—N **Evento de Manejo** (poda, treinamento, transplante)
- **Planta** 1—N **Evento de Sanidade** (praga, doença)
- **Planta** 1—N **Mídia** (fotos datadas)
- **Planta/Ciclo** 1—N **Tarefa** (algumas geradas por IA)
- **Ciclo de Cultivo** 0—N **Colheita** (corrigido no doc 04, §25 — uma colheita referencia um subconjunto de Plantas do ciclo, permitindo colheita escalonada) → cada Colheita 1—1 **Secagem** → 1—1 **Cura** → 1—1 **Lote**
- **Lote** 0—N referência opt-in a **Tratamento** (entidade do COSMARIA Med, fora deste documento)
- **Ciclo de Cultivo** 0—1 **Publicação de Comunidade** (Growlog)
- **Publicação de Comunidade** 1—1 **Configuração de Compartilhamento** — *entidade única do Core (doc 04), não duplicada por app; o Grow registra seu próprio vocabulário de dimensões*: fotos, resultados, genética, localização, datas, equipamentos, parâmetros técnicos + escopo: seguidores/amigos/link/público
- **Ambiente** (outdoor) 0—1 **Dados Climáticos** (entidade do Módulo Outdoor desacoplado — localização aproximada, previsão do tempo, dados solares)
- **Usuário** 1—1 **Preferência de Complexidade** — *entidade única do Core (doc 04), referenciada aqui, não duplicada* (essencial / avançado / especialista — controla quais campos das entidades acima são exibidos)

---

## 12. Boas Práticas

- Toda entrada de dado técnico (pH, EC, VPD etc.) deve ter faixas de referência contextual por fase, para que o dado bruto já vire informação interpretável na hora do registro.
- Nomenclatura de fases e eventos deve ser consistente com o glossário de tom de voz do doc 01 (técnico, preciso, sem gíria excessiva).
- Nenhuma funcionalidade básica de registro deve ser bloqueada por paywall (reforço da regra do doc 00/01).
- Modelagem de dados deve preservar granularidade suficiente para IA futura (não agregar/perder dado bruto cedo demais).

---

## 13. Escalabilidade Futura

- Modelo de dados deve suportar, sem redesenho, cultivo comercial/profissional no futuro (mesmo fora do escopo atual) — ex.: múltiplas salas por operação, se a COSMARIA decidir endereçar esse segmento depois.
- Estrutura de Genética deve suportar, no futuro, uma base pública de genéticas compartilhada entre usuários (semelhante a um "SeedFinder da COSMARIA"), alimentada pela própria comunidade.
- Séries temporais de parâmetros ambientais devem ser desenhadas pensando em volume alto (potencial integração futura com sensores IoT gerando leituras automáticas em alta frequência).

---

## 14. Possíveis Integrações

- **Sensores/IoT** *(Futuro — ver [Ideias Futuras](ideias-futuras.md))*: futura integração com hardware de monitoramento ambiental (temperatura, umidade, pH/EC automatizados) para reduzir registro manual — tendência já usada por concorrentes voltados a cultivo comercial.
- **APIs de clima e dados solares** *(Versão 2 — ver [Ideias Futuras](ideias-futuras.md))*: para cultivos outdoor, dados climáticos locais e previsão do tempo podem enriquecer o registro automático — entregue pelo **Módulo Outdoor desacoplado** (seção 6), nunca uma dependência do core de Ambiente/Planta/Ciclo.
- **Catálogo de equipamentos/insumos** (informativo, não transacional): base de referência de LEDs/fertilizantes para preencher registros de forma mais rápida (autocomplete), sem versar para marketplace (fora de escopo, doc 00).

---

## 15. Oportunidades de Monetização (específicas do Grow)

Seguem o princípio geral do doc 00/01 (sem monetização de dados de usuários): Premium do Grow (seção 10) e, futuramente, planos profissionais/B2B para operações maiores (ex.: associações de cultivo gerenciando múltiplos cultivadores/ambientes) — a validar em profundidade no doc 07.

---

## 16. Riscos (específicos do Grow)

| Risco | Observação |
|---|---|
| Complexidade de registro pode assustar iniciantes | Mitigado pelo fluxo de "check-in único" e templates/clonagem de ciclo (seção 7) |
| Excesso de parâmetros técnicos pode intimidar o cultivador casual | Considerar registro "básico vs. avançado" progressivo — ver perguntas estratégicas |
| Dependência de fotos/mídia gera custo de armazenamento crescente | Relevante para o limite gratuito de armazenamento (seção 10) e para a arquitetura (doc 04) |
| Comparações entre ciclos podem ser enganosas se o usuário mudar múltiplas variáveis ao mesmo tempo | IA deve sinalizar isso explicitamente ao apresentar comparações, não só mostrar números |

---

## 17. Sugestões de Melhorias

- Um "modo iniciante" que reduz o número de campos exibidos por padrão, com opção de "modo avançado" para cultivadores experientes — atende tanto ao público iniciante quanto ao entusiasta, sem sacrificar profundidade.
- Um selo/indicador de "ciclo validado" quando o usuário completa o registro consistentemente do início ao fim — sinaliza qualidade do dado para a própria IA e para a comunidade (Growlogs mais completos ganham mais credibilidade).

---

## 18. Classificação de Escopo (MVP / V2 / V3 / Futuro / Pesquisa)

Aplicando a nova diretriz permanente (doc 00, seção 16, item 4) às funcionalidades deste documento:

| Funcionalidade | Classificação | Observação |
|---|---|---|
| Registro completo de plantas/ciclos/ambientes (seções 5.1–5.12) | **MVP** | Núcleo do produto |
| Complexidade progressiva (essencial → avançado) + Modo Especialista | **MVP** | Já faz parte do fluxo único desde o dia 1 |
| Check-in diário único | **MVP** | Diferencial central de retenção |
| IA — comparação automática de ciclos | **MVP** | |
| IA — previsão de rendimento | **Versão 2** | Depende de volume mínimo de histórico para ser confiável; ver doc 05 |
| IA — detecção precoce de problemas + tarefa sugerida | **MVP** (detecção básica) / **Versão 2** (sugestão automática refinada) | Começar com regras simples, evoluir com aprendizado sobre o histórico |
| IA — relatório automático de ciclo | **MVP** | |
| Comunidade — publicação privada por padrão + privacidade granular (fotos/resultados/genética/localização/datas/equipamentos/parâmetros) | **MVP** | Diferencial competitivo central, não pode ser adiado |
| Comunidade — escopo "somente amigos" | **Pesquisa** | Definir conceito de "amigo" (mútuo) vs. "seguidor" (unilateral) no doc 06 |
| Comunidade — escopo "somente por link" | **Versão 2** | Ver [Ideias Futuras](ideias-futuras.md) |
| Comunidade — "Fork" de cultivo | **MVP** | Mecanismo central de efeito de rede |
| Outdoor — registro manual (Indoor/Outdoor/Estufa) | **MVP** | |
| Outdoor — integração de API climática/dados solares (Módulo Outdoor) | **Versão 2** | Desacoplado do core desde o desenho (seção 6) |
| Sensores/IoT | **Futuro** | Ver [Ideias Futuras](ideias-futuras.md) |
| Base pública de genéticas ("SeedFinder da COSMARIA") | **Versão 2** | Ver [Ideias Futuras](ideias-futuras.md) |
| Selo "ciclo validado" | **Versão 2** | Ver [Ideias Futuras](ideias-futuras.md) |
| Cultivo comercial/profissional | **Futuro** | Fora do escopo atual do Grow (doc 00) |

Itens não-MVP já foram espelhados no documento companion [Ideias Futuras](ideias-futuras.md) para não se perderem.

---

## Decisões Consolidadas (validado com o usuário em 2026-07-08)

| # | Tema | Decisão |
|---|---|---|
| 1 | Diferenciais competitivos | Os 6 propostos na seção 4 foram **aprovados**. Diretriz permanente adicionada: toda funcionalidade nova passa pelo teste de 5 perguntas (doc 00, seção 16, item 3) antes de ser aceita. |
| 2 | Modo iniciante vs. avançado | **Um único fluxo**, complexidade progressiva + Modo Especialista (seção 5.0) — não dois apps/modos separados. |
| 3 | Limites do plano gratuito | Não definidos aqui — doc 07 apresentará no mínimo 3 estratégias de monetização com prós/contras/impacto em retenção e conversão/comparação com concorrentes antes de decidir. |
| 4 | Cultivo outdoor | Suportado desde a v1 (Indoor/Outdoor/Estufa); tudo específico de outdoor (clima/previsão/dados solares) fica no Módulo Outdoor desacoplado (seção 6). |
| 5 | Privacidade da Comunidade | Todo cultivo nasce **privado**; compartilhamento é granular por dimensão (fotos, resultados, genética, localização, datas, equipamentos, parâmetros técnicos) e por escopo (seguidores, amigos*, link*, público) — *(*amigos e link classificados fora do MVP, seção 18)*. |

Este documento está **concluído**. Seguimos para o **Documento 03 — COSMARIA Med**.

---

## Artefatos para Implementação

> Escrito para que, quando chegar a hora, este módulo possa ser entregue diretamente ao Claude Code para implementação, sem precisar redescobrir escopo. Refletem o estado atual da especificação (seções 1–17) — qualquer decisão ainda pendente nas Perguntas Estratégicas acima pode alterar detalhes aqui.

### Checklist Técnico
- [ ] Modelar entidades e relacionamentos do Grow (seção 11) no schema físico (depende do doc 08)
- [ ] CRUD de Genética / Semente / Clone / Planta-mãe
- [ ] CRUD de Ambiente
- [ ] CRUD de Ciclo de Cultivo (com clonagem/duplicação de ciclo anterior)
- [ ] Registro de parâmetros ambientais como série temporal (pH, EC, temperatura, umidade)
- [ ] Cálculo automático de VPD, PPFD e DLI a partir das entradas registradas
- [ ] Módulo de Manejo (poda, treinamento, transplante)
- [ ] Módulo de Sanidade (praga, doença) com severidade e evolução
- [ ] Upload e galeria de Mídia vinculada à timeline da planta
- [ ] Tarefas/Lembretes manuais e gerados por IA, com notificações
- [ ] Fluxo Colheita → Secagem → Cura → Lote (suportando colheita escalonada: 0—N Colheitas por Ciclo, cada uma vinculada a um subconjunto de Plantas — correção do doc 04)
- [ ] Motor de Estatísticas e Comparação automática entre ciclos
- [ ] Integração com o serviço de IA compartilhado (insights, alertas, previsão de rendimento, relatório automático)
- [ ] Publicação de Growlog na Comunidade, com controle granular de privacidade
- [ ] Mecanismo de "Fork" de cultivo (duplicar growlog público de terceiros)
- [ ] Gates de Premium (feature flags) nos pontos definidos na seção 10
- [ ] Exportação de relatório de ciclo (PDF/dados)
- [ ] Suporte ao Modo Discreto (doc 01) nas notificações e mídia deste módulo

### Lista de Módulos
Genética · Ambiente · Planta · Ciclo de Cultivo · Registro Ambiental · Manejo · Sanidade · Mídia/Timeline · Tarefas e Lembretes · Colheita/Secagem/Cura/Lote · Estatísticas e Comparação · Integração de IA (consumidor) · Comunidade (publicação/fork + Motor de Privacidade Granular, consumidor) · Premium/Gates (consumidor) · **Módulo Outdoor** (desacoplado/plugável — clima, previsão, dados solares) · **Módulo de Complexidade Progressiva** (transversal — essencial/avançado/especialista)

### Lista de Telas
- Onboarding do Grow (primeiro ambiente/planta)
- Dashboard/Home do Grow (ciclos ativos)
- Detalhe do Ambiente
- Detalhe da Planta / Timeline
- Criar/Editar Planta
- Criar/Editar Ciclo de Cultivo
- Check-in Diário (registro rápido, seção 7)
- Registro avançado de Parâmetros Ambientais
- Registro de Manejo
- Registro de Sanidade
- Galeria de Fotos / Comparação lado a lado
- Lista de Tarefas / Detalhe de Tarefa
- Fluxo de Colheita
- Fluxo de Secagem/Cura
- Relatório de Ciclo
- Comparação entre Ciclos
- Growlog Público (visualização)
- Publicar Growlog (configuração de privacidade granular por dimensão + escopo de visibilidade)
- Perfil do Cultivador *(= Perfil Público do contexto Grow — decidido no doc 06: independente do Perfil Público do Med, mesma Conta)*
- Busca da Comunidade (por genética/fertilizante/LED/equipamento)
- Tela de Fork (duplicar cultivo)
- Configurações do Grow (limites Premium, Modo Discreto, nível de complexidade/Modo Especialista)
- Configuração de Ambiente Outdoor (localização aproximada, ativação do Módulo Outdoor)

### Lista de Componentes Reutilizáveis
- Card de Planta / Card de Ciclo
- Seletor de Fase de Vida (stepper)
- Input de parâmetro com faixa de referência visual (indicador de faixa saudável)
- Gráfico de série temporal (reutilizável: pH, EC, temperatura, umidade, VPD, PPFD, DLI)
- Componente de Timeline (eventos + fotos)
- Upload/Galeria de Mídia com comparação lado a lado
- Card de Tarefa com CTA "aceitar sugestão da IA"
- Badge de status (fase atual, alerta ativo, ciclo validado)
- Componente de Comparação (tabela/gráfico entre 2+ ciclos)
- Busca com filtros estruturados (genética/fertilizante/equipamento)
- Card de Perfil de Cultivador
- Modal de confirmação de transição de fase
- Componente de Paywall/Upsell Premium
- Seletor de Nível de Complexidade (essencial / avançado / Modo Especialista)
- Matriz de Privacidade Granular (grade dimensão × escopo de visibilidade, reutilizável em qualquer publicação)

### Lista de Entidades do Banco (conceitual — ver seção 11 e doc 08)
Usuário (ref. Core) · Ambiente · DadosClimáticos (Módulo Outdoor) · Genética · Planta · CicloCultivo · RegistroAmbiental · EventoManejo · EventoSanidade · Mídia · Tarefa · Colheita (0—N por Ciclo, vinculada a subconjunto de Plantas) · Secagem · Cura · Lote · PublicaçãoComunidade (Growlog) · Comentário · Curtida · Seguidor · RegistroDeFork · *(entidades do Core, apenas referenciadas aqui, não duplicadas: ConfiguraçãoDeCompartilhamento, PreferênciaDeComplexidade)*

### Lista de APIs Necessárias
- `POST/GET/PUT/DELETE /ambientes`
- `POST/GET/PUT/DELETE /plantas`
- `POST/GET/PUT/DELETE /ciclos`
- `POST /ciclos/{id}/clonar`
- `POST /registros-ambientais` (inserção em lote de série temporal)
- `POST /eventos-manejo`, `POST /eventos-sanidade`
- `POST /midia` (upload)
- `GET/POST/PUT /tarefas`
- `POST /colheitas`, `POST /secagens`, `POST /curas` → gera `/lotes`
- `GET /ciclos/{id}/relatorio`
- `GET /ciclos/comparar?ids=...`
- `POST /ia/insights` (consumo do serviço de IA do doc 05)
- `POST /comunidade/publicacoes` (inclui payload de `ConfiguraçãoDeCompartilhamento`), `PUT /comunidade/publicacoes/{id}/privacidade`
- `GET /comunidade/feed`, `GET /comunidade/busca`
- `POST /comunidade/fork/{cicloId}`
- `GET /usuario/limites-premium`
- `GET/PUT /usuario/preferencia-complexidade`
- `GET /ambientes/{id}/clima` (Módulo Outdoor — desacoplado, pode falhar/estar ausente sem afetar o restante da API)

### Lista de Permissões
- Câmera e galeria de fotos
- Notificações push
- Armazenamento local (cache de mídia)
- Localização (opcional, opt-in, para outdoor + futura API de clima)

### Eventos (domínio/analytics)
*(Nomenclatura padronizada em PascalCase — ver [Catálogo de Domínio](catalogo-de-dominio.md))*

**Publicados pelo Grow**: `CicloCriado` · `CicloFinalizado` · `PlantaCriada` · `PlantaFaseAlterada` · `RegistroAmbientalCriado` · `TarefaCriada` · `TarefaConcluida` · `TarefaSugeridaPelaIAAceita` · `ColheitaRegistrada` · `GrowlogPublicado` · `GrowlogForkRealizado`

**Consumidos pelo Grow**: `AlertaGerado` (publicado pela IA, doc 05 — origina a sugestão de tarefa corretiva) · `LimitePremiumAtingido` (publicado pelo Core: Billing)

### Notificações
- Lembrete de tarefa (rega, fertilização, etc.)
- Alerta de parâmetro fora da faixa saudável (IA)
- Sugestão de transição de fase
- Relatório semanal automático do ciclo
- Interação social (comentário/curtida/novo seguidor) — respeitando o Modo Discreto

### Casos de Teste
- Fluxo feliz completo: criar ambiente → criar planta → iniciar ciclo → check-in diário → colheita → relatório final
- Alerta de parâmetro fora da faixa gera sugestão de tarefa corretiva corretamente
- Clonar ciclo anterior herda ambiente/rotina sem duplicar dados indevidamente
- Publicar growlog com privacidade granular oculta exatamente as dimensões e respeita o escopo de visibilidade configurado (seguidores/amigos/link/público)
- Ciclo criado nasce privado por padrão, sem nenhuma dimensão visível até configuração explícita
- Fork de growlog só copia dimensões que o autor tornou visíveis ao usuário que está fazendo o fork
- Usuário no plano gratuito não excede limites definidos (bloqueio correto, sem corromper dados existentes) — *pendente de definição no doc 07*
- Modo Discreto ativo oculta nomes sensíveis em notificações geradas por este módulo
- Alternar entre nível essencial/avançado/Modo Especialista não perde dados já registrados nos campos ocultos
- Ambiente outdoor funciona corretamente mesmo com o Módulo Outdoor indisponível/não configurado (falha isolada, não quebra o core)

### Dependências com Outros Módulos
- Core de Autenticação/Perfil (usuário compartilhado, plataforma)
- **Core: Motor de Privacidade Granular** (doc 04, §12) — Grow registra seu vocabulário de dimensões, não implementa o motor
- **Core: Preferência de Complexidade** (doc 04) — entidade única, referenciada, não duplicada
- Serviço de IA compartilhado (doc 05) — Grow consome, não implementa a IA
- **Core: Comunidade** (doc 04/06) — Grow fornece conteúdo (growlogs) via evento `ConteudoCompartilhadoAtualizado`, Comunidade fornece infraestrutura social e projeção de leitura
- Sistema Premium/Billing compartilhado (doc 07)
- Módulo de Notificações do Core
- Referência opt-in futura ao Lote no COSMARIA Med
- Provedor externo de dados climáticos (Módulo Outdoor — Versão 2, dependência opcional/isolável)

### Riscos Técnicos
- Volume de séries temporais pode crescer rápido com sensores IoT futuros — modelagem deve prever particionamento/agregação desde o doc 08
- Upload de mídia em volume exige estratégia de armazenamento/CDN e limites por plano (docs 04/13)
- Geração de tarefas por IA precisa de idempotência (evitar tarefas duplicadas para o mesmo alerta persistente)
- Cálculo de VPD/PPFD/DLI depende de entradas consistentes — validação de entrada é crítica para não gerar insights incorretos
- Motor de privacidade granular (dimensão × escopo) precisa ser aplicado de forma consistente em toda leitura pública (feed, busca, fork) — um único ponto de vazamento de dado sensível (ex.: localização) compromete o diferencial central de confiança da plataforma
- Módulo Outdoor deve falhar de forma isolada (degradação graciosa) — indisponibilidade da API climática externa não pode afetar o registro manual do core
