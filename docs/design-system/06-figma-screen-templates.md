# 06 — Figma Screen Templates da Plataforma COSMARIA

> **Nome oficial:** Manual de Construção, Uso e Governança dos Screen Templates da COSMARIA no Figma  
> **Status:** Versão 1.0 — especificação normativa inicial.  
> **Data:** 2026-07-12.  
> **Autoridade:** subordinado ao `../10-fluxos-do-usuario.md`, `../11-design-system.md`, `01-visual-language.md`, `02-ui-kit.md`, `03-component-library.md`, `04-screen-templates.md` e `05-figma-component-library.md`.  
> **Escopo:** tradução operacional dos 7 shells e 35 templates oficiais para assets reutilizáveis, publicáveis, auditáveis e responsivos no Figma.  
> **Natureza:** documentação de engenharia de templates, composição de telas, prototipagem, governança e handoff. Não cria regras de negócio, fluxos, entidades, componentes, funcionalidades ou direção artística.

---

## Índice

### PARTE I — AUTORIDADE E ARQUITETURA

0. Propósito, autoridade e limites  
1. Hierarquia documental e regra de precedência  
2. Diferença entre shell, template body, screen template, starter e tela real  
3. Princípios operacionais  
4. Arquitetura física no Figma  
5. Estrutura oficial de páginas  
6. Organização do canvas  
7. Nomenclatura  
8. Status e maturidade  
9. Ownership e permissões

### PARTE II — MODELO DE CONSTRUÇÃO

10. Arquitetura dos assets  
11. Screen Template Component Set  
12. Shell components  
13. Template Body components  
14. Regiões estruturais  
15. Properties permitidas  
16. Variables, modes e contexts  
17. Auto Layout, resizing e constraints  
18. Viewports e testes responsivos  
19. Densidade e largura de conteúdo  
20. Estados compostos  
21. Conteúdo demonstrativo e fixtures  
22. Acessibilidade representada no Figma  
23. Internacionalização e stress de conteúdo  
24. Privacidade, Modo Discreto, IA e Premium  
25. Prototipagem e interações

### PARTE III — SHELLS NO FIGMA

26. Shell S1 — Aplicativo autenticado mobile  
27. Shell S2 — Aplicativo autenticado tablet  
28. Shell S3 — Aplicativo autenticado desktop  
29. Shell S4 — Entrada e autenticação  
30. Shell S5 — Fluxo focado  
31. Shell S6 — Público ou compartilhado  
32. Shell S7 — Administração

### PARTE IV — TEMPLATES DE ENTRADA E ORIENTAÇÃO

33. T01 — Entrada e Autenticação  
34. T02 — Escolha de Propósito ou Contexto  
35. T03 — Onboarding Guiado  
36. T04 — Wizard Transacional

### PARTE V — TEMPLATES OPERACIONAIS

37. T05 — Dashboard  
38. T06 — Lista de Coleção  
39. T07 — Biblioteca em Grid  
40. T08 — Busca e Resultados  
41. T09 — Detalhe de Entidade  
42. T10 — Formulário Curto  
43. T11 — Formulário Longo e Seccionado  
44. T12 — Registro Rápido e Check-in  
45. T13 — Timeline  
46. T14 — Tarefas e Pendências  
47. T15 — Configuração Geral  
48. T16 — Configuração Detalhada

### PARTE VI — TEMPLATES ANALÍTICOS E DOCUMENTAIS

49. T17 — Analytics Overview  
50. T18 — Insight e Explicabilidade da IA  
51. T19 — Alerta ou Recomendação da IA  
52. T20 — Comparação  
53. T21 — Relatório  
54. T22 — Exportação e Compartilhamento

### PARTE VII — IDENTIDADE, PRIVACIDADE E COMUNIDADE

55. T23 — Perfil  
56. T24 — Central de Privacidade e Dados  
57. T25 — Feed da Comunidade  
58. T26 — Conteúdo Público e Discussão  
59. T27 — Publicação e Compartilhamento  
60. T28 — Conteúdo Privado, Restrito ou sem Permissão

### PARTE VIII — MÍDIA E CONTEÚDO VISUAL

61. T29 — Galeria de Mídia  
62. T30 — Visualizador e Comparação de Mídia

### PARTE IX — CONTA E MONETIZAÇÃO

63. T31 — Upgrade e Paywall  
64. T32 — Gestão de Assinatura

### PARTE X — ADMINISTRAÇÃO

65. T33 — Administração de Coleções  
66. T34 — Administração de Política ou Configuração  
67. T35 — Consulta de Auditoria

### PARTE XI — USO, PUBLICAÇÃO E HANDOFF

68. Catálogo e página de descoberta  
69. Starter frames  
70. Fluxo para criar uma tela real  
71. Substituição de conteúdo e componentes  
72. Prototipagem de jornadas  
73. Annotations e Ready for dev  
74. Publicação e atualização  
75. Depreciação e migração  
76. Performance do arquivo  
77. QA visual e funcional

### PARTE XII — GOVERNANÇA E CHECKLISTS

78. Anti-patterns gerais  
79. Critérios para criar novo template  
80. Processo de alteração  
81. Processo de exceção  
82. Auditoria periódica  
83. Checklist de shell  
84. Checklist de template body  
85. Checklist de screen template  
86. Checklist de starter frame  
87. Checklist de tela real  
88. Checklist de publicação  
89. Decisões consolidadas  
90. Referências operacionais  
91. Histórico

---

# PARTE I — AUTORIDADE E ARQUITETURA

## 0. Propósito, autoridade e limites

Este documento define como os layouts reutilizáveis do documento 04 devem ser materializados dentro do Figma. Ele não redesenha os templates. Ele estabelece a engenharia visual necessária para que cada template possa ser encontrado, inserido, configurado, testado, atualizado e entregue sem perder consistência.

A função desta documentação é impedir cinco formas recorrentes de retrabalho:

1. reconstruir a mesma estrutura de tela em múltiplos arquivos;
2. copiar frames em vez de reutilizar assets conectados;
3. criar versões independentes para Core, Grow e Med;
4. adaptar responsividade por ajustes locais sem regra comum;
5. transformar templates em “mockups bonitos” sem estados, acessibilidade ou governança.

### 0.1 O que este documento define

- estrutura do arquivo `COSMARIA — Templates`;
- representação dos shells S1–S7;
- representação dos templates T01–T35;
- component sets, propriedades e regiões expostas;
- uso de nested instances e slots controlados;
- comportamento por viewport;
- configuração por tema e contexto;
- composição de estados globais e parciais;
- conteúdo demonstrativo e stress tests;
- prototipagem de referência;
- publicação, atualização, depreciação e migração;
- critérios de aceite para assets e telas consumidoras.

### 0.2 O que este documento não define

- novas telas;
- novos fluxos;
- novos componentes;
- anatomia interna de componentes;
- novos tokens;
- alterações na direção artística;
- regras de negócio;
- APIs ou entidades;
- arquitetura de frontend;
- conteúdo final de produto.

### 0.3 Resultado esperado

Ao final da implementação deste documento, um designer deve ser capaz de:

- inserir um template oficial em poucos segundos;
- selecionar viewport, estado e regiões opcionais sem detach;
- aplicar Dark ou Light Mode e Core, Grow ou Med por modes;
- substituir apenas conteúdo e componentes autorizados;
- prototipar uma jornada sem reconstruir navegação;
- entregar uma tela com rastreabilidade clara para desenvolvimento;
- receber atualizações da library sem perder overrides válidos.

## 1. Hierarquia documental e regra de precedência

A hierarquia obrigatória é:

**Regras de negócio e fluxos → Design System → Visual Language → UI Kit → Component Library → Screen Templates → Figma Component Library → Figma Screen Templates → Telas específicas → Implementação.**

Quando houver conflito:

1. regras de negócio e fluxos vencem qualquer conveniência de layout;
2. o documento 04 determina a estrutura do template;
3. o documento 05 determina como assets são construídos e publicados no Figma;
4. este documento determina como esses dois níveis se combinam em templates de tela;
5. uma tela específica nunca altera silenciosamente uma regra superior.

**Justificativa:** Figma é um ambiente de representação e colaboração, não uma fonte autônoma de produto. A facilidade de editar um frame não autoriza uma mudança de sistema.

## 2. Diferença entre shell, template body, screen template, starter e tela real

| Artefato | Função | Publicado | Pode conter conteúdo real | Pode ser destacado |
| --- | --- | --- | --- | --- |
| Shell | Estrutura persistente de navegação e viewport | Sim | Não | Não |
| Template Body | Organização da tarefa dentro da área de conteúdo | Sim | Não | Não |
| Screen Template | Composição oficial Shell + Template Body | Sim | Não | Não |
| Starter Frame | Exemplo pronto para duplicação e aprendizado | Não como library | Conteúdo fictício | Sim, pois é frame demonstrativo |
| Tela real | Aplicação a uma função concreta do produto | Não | Sim | Apenas com exceção aprovada |

### 2.1 Shell

O shell responde: **em que estrutura de aplicação esta tela vive?** Ele contém navegação persistente, status global, safe areas e a região onde o conteúdo será inserido.

### 2.2 Template Body

O body responde: **como a tarefa principal é organizada?** Ele contém Page Header, regiões principais, apoio, continuação e ações específicas do template, mas não inclui a navegação global.

### 2.3 Screen Template

O Screen Template responde: **qual composição pronta deve ser inserida pelo designer?** Ele combina um shell oficial com o body correspondente e expõe somente propriedades seguras.

### 2.4 Starter Frame

Starter é material pedagógico. Ele demonstra uso correto, conteúdo realista, estados e responsividade. Não é fonte de truth e não substitui o main component.

### 2.5 Tela real

A tela real é uma instância do Screen Template no arquivo de produto. Ela recebe conteúdo, regras e dados concretos, preservando vínculo com a library.

## 3. Princípios operacionais

### 3.1 Template é gramática, não decoração

Um template existe para preservar ordem, prioridade e comportamento. Ajustar apenas aparência sem respeitar sua hierarquia é uso incorreto.

### 3.2 Uma library lógica, assets modulares

Shells, bodies e screen templates vivem no mesmo arquivo `F04`, mas são organizados por pages e sections distintas. A separação permite manutenção sem ocultar dependências.

### 3.3 Viewport é variant; tema e contexto são modes

- `Viewport` pode ser variant porque altera reflow e anatomia.
- Dark/Light e Core/Grow/Med devem ser resolvidos por variables e modes.
- Criar `Dashboard/Dark/Grow/Mobile` como componente separado é proibido.

### 3.4 Estado estrutural não deve multiplicar variantes sem necessidade

Estados globais são representados por uma composição controlada de conteúdo e State Surface. Estados parciais ficam dentro das regiões correspondentes. Isso evita uma matriz de dezenas de variants por template.

### 3.5 Overrides devem ser intencionais

Somente textos, instâncias e regiões documentadas podem ser substituídos. Alterar padding, ordem, largura ou alinhamento em uma instância é sinal de lacuna ou uso incorreto.

### 3.6 Detach é exceção auditável

Detach rompe atualização e rastreabilidade. Deve ser evitado em telas de produção. Quando inevitável, a tela recebe marcação de exceção e deve gerar revisão do template.

### 3.7 Default deve ser útil

Ao inserir um Screen Template, o designer deve receber uma composição coerente, acessível e compreensível sem precisar corrigir camadas internas.

### 3.8 Templates não contêm dados sensíveis reais

Todos os exemplos usam conteúdo sintético. Nenhum nome de paciente, condição clínica, localização ou imagem privada pode entrar na library.

## 4. Arquitetura física no Figma

O arquivo oficial é:

**`04 — COSMARIA — Templates`**

Ele depende exclusivamente de:

- `01 — Foundations`;
- `02 — Icons`;
- `03 — Components`.

Não pode depender de `Product Screens`, `Playground & QA` ou arquivos de projeto.

### 4.1 Classes de asset

| Prefixo | Classe | Exemplo |
| --- | --- | --- |
| `Shell/` | Navegação e viewport persistente | `Shell/S1 App Mobile` |
| `Body/` | Conteúdo estrutural de um template | `Body/T05 Dashboard` |
| `Screen/` | Composição pronta para inserção | `Screen/T05 Dashboard` |
| `_Region/` | Auxiliar privado de composição | `_Region/Page Header` |
| `_State/` | Auxiliar privado de estado | `_State/Global Empty` |
| `Doc/` | Elemento de documentação não publicado | `Doc/Property Table` |

Assets iniciados por `_` permanecem privados e não aparecem para consumidores da library.

## 5. Estrutura oficial de páginas

| Ordem | Página | Conteúdo |
| ---: | --- | --- |
| 00 | `00 — Cover & Release` | versão, owner, status, changelog resumido |
| 01 | `01 — Read Me` | regras de uso, hierarquia e links |
| 02 | `02 — Shells` | S1–S7, anatomia, states e QA |
| 03 | `03 — Entry & Orientation` | T01–T04 |
| 04 | `04 — Operational` | T05–T16 |
| 05 | `05 — Analytics & Documents` | T17–T22 |
| 06 | `06 — Identity, Privacy & Community` | T23–T28 |
| 07 | `07 — Media` | T29–T30 |
| 08 | `08 — Monetization` | T31–T32 |
| 09 | `09 — Administration` | T33–T35 |
| 10 | `10 — State Compositions` | Empty, Loading, Error, Offline, Processing, Success |
| 11 | `11 — Responsive Matrix` | todos os templates em múltiplas larguras |
| 12 | `12 — Theme & Context Matrix` | Dark/Light × Core/Grow/Med |
| 13 | `13 — Locale & Accessibility QA` | textos longos, zoom, foco e contraste |
| 90 | `90 — Playground` | exploração controlada, não publicada |
| 98 | `98 — Deprecated` | assets em migração |
| 99 | `99 — Archive` | snapshots históricos, não publicados |

## 6. Organização do canvas

Cada template deve ocupar uma Section própria com cinco zonas, da esquerda para a direita:

1. **Overview:** propósito, status, owner, versão e links.
2. **Main Components:** main component ou component set oficial.
3. **Anatomy:** mapa numerado das regiões.
4. **Usage:** exemplos válidos por contexto.
5. **QA:** stress tests, anti-patterns e estados.

A Section usa o nome:

`T05 — Dashboard · Stable · v1.0`

A cor da section pode sinalizar maturidade apenas na documentação. Ela nunca altera o asset publicado.

## 7. Nomenclatura

### 7.1 Screen Template

`Screen/T05 Dashboard`

### 7.2 Template Body

`Body/T05 Dashboard`

### 7.3 Variants

- `Viewport=Mobile`
- `Viewport=Tablet`
- `Viewport=Desktop`
- `ContentMode=Content`
- `ContentMode=GlobalState`

### 7.4 Properties comuns

- `Title`
- `Description`
- `HasBreadcrumb`
- `HasPrimaryAction`
- `HasSupportRegion`
- `HasPersistentAction`
- `GlobalState`

Properties específicas usam nomes semânticos, nunca posição visual genérica como `Show Left Box`.

### 7.5 Layers

Camadas internas seguem ordem semântica:

- `00 Status Global`
- `01 Navigation`
- `02 Page Header`
- `03 Context`
- `04 Main Content`
- `05 Support`
- `06 Continuation`
- `07 Persistent Actions`
- `08 Overlay Anchor`

## 8. Status e maturidade

| Status | Uso permitido |
| --- | --- |
| `Draft` | exploração interna; não publicar |
| `Candidate` | testes e protótipos controlados |
| `Beta` | projetos reais com acompanhamento |
| `Stable` | uso padrão em produção |
| `Deprecated` | não usar em novas telas; migração ativa |
| `Archived` | histórico; não publicado |

Um template só alcança `Stable` quando possui:

- três viewports aprovados quando aplicável;
- Dark e Light validados;
- Core, Grow e Med testados quando aplicável;
- estados relevantes;
- conteúdo longo e vazio;
- acessibilidade documentada;
- protótipo mínimo;
- aceite de Design System Owner e Product Design.

## 9. Ownership e permissões

| Papel | Responsabilidade |
| --- | --- |
| Design System Owner | aprovação final e publicação |
| Template Maintainer | construção e manutenção de S1–S7 e T01–T35 |
| Product Designer | aplicação em telas reais e reporte de lacunas |
| Accessibility Reviewer | revisão de foco, leitura e estados |
| Content Designer | stress de conteúdo e nomenclatura |
| Engineering Reviewer | viabilidade e paridade de estrutura |

Somente Owner e Maintainer editam main components. Product Designers usam instâncias e podem editar Starter Frames ou Playground.

# PARTE II — MODELO DE CONSTRUÇÃO

## 10. Arquitetura dos assets

Cada template oficial é composto em três camadas:

1. **Shell Component:** estrutura persistente.
2. **Template Body Component:** regiões e hierarquia da tarefa.
3. **Screen Template Component:** composição pronta que conecta as duas anteriores.

### 10.1 Motivo da separação

- shells evoluem independentemente dos conteúdos;
- bodies podem ser testados sem navegação;
- screen templates reduzem esforço de inserção;
- atualizações do shell alcançam todos os screens por nested instance;
- a biblioteca evita copiar navegação para 35 templates.

### 10.2 Dependência interna

`Shell` consome Components.  
`Body` consome Components e regiões privadas.  
`Screen` consome Shell + Body.  
Nenhum Body consome Screen. Nenhum Shell consome Body.

## 11. Screen Template Component Set

### 11.1 Estrutura mínima

Todo `Screen/Txx` deve possuir:

- variants `Viewport=Mobile`, `Tablet`, `Desktop` quando o template suportar esses ambientes;
- variants `ContentMode=Content` e `GlobalState` quando estados globais forem possíveis;
- nested Shell correto para cada viewport;
- nested Body correspondente;
- modes herdáveis de Theme e Context;
- description com propósito, uso e link para o documento 04;
- propriedades essenciais expostas no painel direito.

### 11.2 Estado sem explosão de variants

A matriz recomendada é:

- 3 viewports × 2 content modes = até 6 variants principais;
- `GlobalState` é um instance swap restrito a Empty, Loading, Error, Offline, Processing, Restricted ou Success conforme aplicável;
- estados parciais permanecem no Body.

**Justificativa:** criar `Viewport × State × Density × Context × Theme` produziria centenas de variantes, dificultando manutenção e descoberta.

### 11.3 Propriedades protegidas

Não expor:

- padding interno;
- gap estrutural;
- radius;
- cor;
- elevação;
- ordem de regiões;
- largura de container;
- shell arbitrário;
- componentes fora da lista permitida.

## 12. Shell components

Shells são component sets independentes. Cada um expõe somente propriedades relacionadas à navegação e regiões oficiais.

### 12.1 Propriedades comuns

- `NavItemActive`
- `HasGlobalStatus`
- `HasPersistentAction`
- `HasOverlay`
- `AccountState`
- `NotificationBadge`

### 12.2 Content region

A região de conteúdo usa slot controlado ou nested instance de Body. Quando slots estiverem disponíveis, os preferred values devem ser limitados aos Template Bodies oficiais compatíveis. Slot livre irrestrito é proibido.

### 12.3 Safe areas

Safe areas são representadas por variables numéricas e frames auxiliares não exportáveis. Não desenhar barras do sistema operacional como parte permanente do produto.

## 13. Template Body components

O Body é o núcleo reutilizável de cada template. Ele deve:

- começar pelo Page Header quando aplicável;
- possuir largura `Fill container` dentro do Shell;
- aplicar max-width por container interno;
- usar Auto Layout vertical como raiz;
- conter regiões nomeadas e ordenadas semanticamente;
- expor apenas instâncias autorizadas;
- suportar conteúdo realista sem alteração estrutural.

### 13.1 Body sem navegação

O Body nunca contém Bottom Navigation, Sidebar, Top-level account switcher ou elementos persistentes do shell.

### 13.2 Body e scroll

No Figma, a raiz do Body deve representar conteúdo completo. O scroll é configurado no frame de viewport do Screen Template, não dentro de várias regiões concorrentes, exceto viewers ou painéis explicitamente independentes.

## 14. Regiões estruturais

| Região | Função | Obrigatoriedade |
| --- | --- | --- |
| Global Status | condição transversal antes do conteúdo | opcional |
| Page Header | localização, título e ações | padrão |
| Context | escopo, entidade, período ou progresso | conforme template |
| Main Content | tarefa ou informação principal | obrigatória |
| Support | explicações ou informações auxiliares | opcional |
| Continuation | histórico, detalhes adicionais ou paginação | opcional |
| Persistent Actions | ação crítica que precisa permanecer disponível | condicional |
| Overlay Anchor | ponto de abertura de modal/sheet/viewer | invisível no default |

Cada região deve ser uma nested instance ou frame Auto Layout com responsabilidade clara. Regiões genéricas `Group 1`, `Box`, `Right` ou `Misc` são proibidas.

## 15. Properties permitidas

### 15.1 Variant properties

Usar quando muda:

- viewport;
- content mode;
- estrutura aprovada;
- densidade quando realmente altera anatomia.

### 15.2 Boolean properties

Usar para regiões opcionais documentadas, como:

- descrição;
- breadcrumb;
- ação secundária;
- apoio lateral;
- filtros;
- summary region.

### 15.3 Text properties

Expor apenas textos demonstrativos que o designer deve substituir com frequência:

- título;
- descrição;
- labels de ação;
- textos de estado.

### 15.4 Instance swap properties

Permitir apenas substituições semânticas aprovadas, como:

- Card de entidade por variantes oficiais;
- Chart por gráfico compatível;
- State Surface por estado permitido;
- formulário padrão por pattern compatível.

### 15.5 Slot properties

Slots são usados somente em regiões de conteúdo composto que exigem flexibilidade real. Devem ter:

- preferred instances;
- limites documentados;
- tamanho e Auto Layout controlados;
- proibição de componentes locais;
- QA de conteúdo mínimo e máximo.

## 16. Variables, modes e contexts

### 16.1 Theme

Dark e Light são modes herdados pelo frame raiz do Screen Template. Não duplicar screen assets por tema.

### 16.2 Context

Core, Grow e Med são aplicados por mode de contexto. O mesmo template deve atualizar accent e decisões semânticas autorizadas sem trocar component set.

### 16.3 Viewport

Viewport é representado por variant porque exige reflow estrutural. Variables podem controlar padding, gap e dimensões relacionadas, mas não substituem uma mudança real de composição.

### 16.4 Density

Densidade confortável é default. Compacta aparece apenas em contextos aprovados, principalmente administração e tabelas densas. Não usar densidade compacta para tornar uma tela mal hierarquizada “menor”.

### 16.5 Locale

Quando uma collection de conteúdo demonstrativo for usada, locale pode trocar strings de teste. Isso não substitui Content Design nem cria textos finais.

## 17. Auto Layout, resizing e constraints

### 17.1 Raiz

- Screen frame: largura fixa de referência por viewport e altura mínima; clip content ativo quando necessário.
- Shell: `Fill container` no frame de tela.
- Body: `Fill container` em largura; altura `Hug contents`.
- Regiões principais: Auto Layout; absolute positioning apenas para overlays e elementos estritamente sobrepostos.

### 17.2 Regras de resizing

| Elemento | Horizontal | Vertical |
| --- | --- | --- |
| Screen | Fixed | Fixed de referência |
| Shell | Fill | Fill |
| Body | Fill | Hug |
| Page Header | Fill | Hug |
| Form container | Fill com max-width | Hug |
| Card grid | Fill | Hug |
| Sidebar | Fixed ou range aprovado | Fill |
| Main content | Fill | Hug |
| Persistent action | Fill ou Hug conforme shell | Hug |

### 17.3 Max-width

Como Figma não deve depender de redimensionamento manual para simular max-width, usar wrappers com largura controlada por variant e alinhamento central. O valor vem dos documentos 11, 01, 02, 03 e 04.

### 17.4 Posicionamento absoluto

Permitido para:

- scrim;
- modal;
- tooltip;
- floating action documentado;
- badge sobre avatar;
- controls de viewer.

Proibido para organizar conteúdo principal.

## 18. Viewports e testes responsivos

### 18.1 Frames de referência

| Categoria | Frame de referência | Stress widths |
| --- | ---: | --- |
| Mobile | 390 × 844 | 320, 360, 375, 430 |
| Tablet | 1024 × 1366 | 768, 834, 1024 |
| Desktop | 1440 × 1024 | 1280, 1440, 1600, 1920 |

Esses frames são referências de design, não promessa de dispositivo específico.

### 18.2 Regra de reflow

Toda mudança de viewport deve preservar:

1. ordem semântica;
2. ação principal;
3. contexto;
4. estados;
5. acesso a conteúdo completo.

Ocultar conteúdo essencial para “caber” é proibido.

### 18.3 Teste intermediário

Além das variants publicadas, QA deve redimensionar instances em larguras intermediárias. Se o layout falha entre breakpoints, as constraints ou o modelo de composição estão incorretos.

## 19. Densidade e largura de conteúdo

- autenticação e foco único: até 480px;
- formulários padrão: 640px;
- texto clínico ou relatório: 720px;
- formulário amplo: até 800px quando justificado;
- aplicação geral: até 1280px;
- analytics: até 1440px;
- comparação de mídia: até 1600px excepcionalmente.

No Figma, cada limite deve estar embutido no Body. O designer não deve esticar campos ou texto para preencher desktop.

## 20. Estados compostos

### 20.1 Global versus parcial

- **Global:** substitui o conteúdo principal da tela; ex.: erro ao carregar recurso inteiro.
- **Parcial:** afeta apenas uma região; ex.: gráfico carregando enquanto o restante está disponível.

### 20.2 State Surface oficial

O Global State usa componentes oficiais de estado e mantém:

- shell;
- título ou contexto quando útil;
- ação de recuperação;
- navegação disponível quando segura.

### 20.3 Estados mínimos por template

Todo template avalia:

- Content;
- Loading;
- Empty;
- Error;
- Offline;
- Processing;
- Restricted;
- Success.

Somente estados relevantes são expostos. Não criar uma variant sem sentido apenas por completude mecânica.

## 21. Conteúdo demonstrativo e fixtures

### 21.1 Regras

Fixtures devem ser:

- sintéticas;
- plausíveis;
- variadas;
- sem dados pessoais reais;
- capazes de testar truncamento e densidade;
- coerentes com o domínio.

### 21.2 Conjuntos mínimos

Cada template deve possuir exemplos de:

- conteúdo curto;
- conteúdo longo;
- zero itens;
- um item;
- muitos itens;
- dados ausentes;
- texto com números e unidades;
- idioma expandido quando aplicável.

### 21.3 Conteúdo proibido

- nomes reais de pacientes;
- condições clínicas identificáveis;
- endereços;
- coordenadas;
- fotos privadas;
- credenciais;
- dados de produção.

## 22. Acessibilidade representada no Figma

O Figma não prova acessibilidade funcional, mas deve representar requisitos de maneira verificável:

- ordem de leitura numerada na documentação;
- focus order indicado no prototype ou annotations;
- labels acessíveis registrados para icon-only actions;
- contraste verificado em Dark e Light;
- touch targets mínimos;
- estados que não dependem apenas de cor;
- exemplos com texto ampliado;
- reduced motion documentado;
- alternativa tabular ou textual para gráficos;
- erros associados aos campos corretos.

A ausência de representação não significa que desenvolvimento deve “descobrir depois”.

## 23. Internacionalização e stress de conteúdo

Cada Screen Template deve ser testado com:

- título 2× maior;
- labels de ação longos;
- datas extensas;
- números grandes;
- unidade antes ou depois do valor;
- pluralização;
- quebra de linha em cards e tabs;
- locale com expansão de aproximadamente 30–40%;
- futura direção de leitura, quando aplicável à expansão internacional.

Truncamento só é permitido quando o conteúdo completo permanece acessível.

## 24. Privacidade, Modo Discreto, IA e Premium

### 24.1 Privacidade

Templates que exibem conteúdo sensível devem incluir cenários de:

- private;
- followers;
- link;
- public;
- consent required;
- consent revoked.

### 24.2 Modo Discreto

A matriz de QA deve demonstrar:

- nomes sensíveis substituídos;
- thumbnails ocultas quando necessário;
- notificações neutras;
- manutenção da orientação da tela;
- indicador discreto de modo ativo.

### 24.3 IA

Templates de IA devem preservar:

- resultado;
- dados usados;
- período;
- confiança;
- limitações;
- ação sugerida;
- distinção entre dado, inferência e recomendação.

### 24.4 Premium

Templates Premium devem usar persuasão ética, exibir valor antes do bloqueio e oferecer retorno sem coerção visual.

## 25. Prototipagem e interações

### 25.1 Objetivo

Templates possuem protótipos mínimos para explicar comportamento, não para simular todo o produto.

### 25.2 Interações mínimas

- navegação primária;
- voltar;
- abertura e fechamento de overlay;
- troca de tab;
- progressão de wizard;
- estado loading → content;
- erro → retry;
- offline → pending → synced;
- paywall → retorno ou confirmação;
- Modo Discreto quando aplicável.

### 25.3 Interactive components

Usar interactive components para estados locais repetíveis, como pressed, selected, switch e tabs. Não construir jornadas inteiras dentro de um único component set.

### 25.4 Variables em protótipos

Variables podem demonstrar estado, progresso ou mode, desde que:

- a lógica permaneça compreensível;
- não substitua documentação;
- não crie comportamento inexistente no produto;
- possua fallback de frames quando necessário para revisão.

# PARTE III — SHELLS NO FIGMA
## 26. Shell S1 — Aplicativo autenticado mobile

### 26.1 Papel no Figma

`Shell/S1 Aplicativo autenticado mobile` é um component set publicado. Ele representa a estrutura persistente e recebe o Template Body correspondente por nested instance controlada.

### 26.2 Viewports

**Suporte:** Mobile.  
**Frames de referência:** 390 × 844; stress em 320–430px.

### 26.3 Anatomia

1. `01 Status Global`
2. `02 Top App Bar`
3. `03 Scrollable Content`
4. `04 Persistent Action`
5. `05 Bottom Navigation`
6. `06 Safe Area`

### 26.4 Properties expostas

- `HasGlobalStatus`
- `HasPersistentAction`
- `HasBottomNavigation`
- `ActiveNavItem`
- `NotificationBadge`

Tema e contexto são herdados por modes. Padding, gaps, cor, elevação e ordem das regiões permanecem protegidos.

### 26.5 Navegação

**Modelo:** Bottom Navigation. Itens usam componentes oficiais de navegação e preservam label acessível, estado ativo, badge e foco.

### 26.6 Responsividade

Bottom navigation permanece no nível primário; em fluxos internos pode ser ocultada sem alterar o shell raiz.

### 26.7 Estados e protótipo

O shell deve demonstrar status global, navegação ativa, badge, overlay e retorno. Estados de conteúdo pertencem ao Body ou ao Screen Template, não ao shell.

### 26.8 Anti-patterns

- copiar o shell para dentro de cada template;
- editar padding em instância;
- inserir navegação paralela;
- usar componentes específicos de Grow ou Med;
- incluir dados reais de conta;
- manter sidebar e bottom navigation simultaneamente;
- destacar a instância para trocar Body.

### 26.9 Critérios de aceite

- [ ] Nested components permanecem conectados.
- [ ] Tema e contexto mudam por modes.
- [ ] Foco e ordem de leitura estão anotados.
- [ ] Safe areas e scroll estão representados.
- [ ] Larguras de stress não quebram navegação.
- [ ] Descrição e owner estão preenchidos.

## 27. Shell S2 — Aplicativo autenticado tablet

### 27.1 Papel no Figma

`Shell/S2 Aplicativo autenticado tablet` é um component set publicado. Ele representa a estrutura persistente e recebe o Template Body correspondente por nested instance controlada.

### 27.2 Viewports

**Suporte:** Tablet.  
**Frames de referência:** 1024 × 1366; stress em 768–1024px.

### 27.3 Anatomia

1. `01 Status Global`
2. `02 Sidebar`
3. `03 Top App Bar`
4. `04 Main Content`
5. `05 Support Region`
6. `06 Overlay Anchor`

### 27.4 Properties expostas

- `SidebarMode`
- `HasGlobalStatus`
- `HasSupportRegion`
- `ActiveNavItem`
- `NotificationBadge`

Tema e contexto são herdados por modes. Padding, gaps, cor, elevação e ordem das regiões permanecem protegidos.

### 27.5 Navegação

**Modelo:** Sidebar compacta ou expandida. Itens usam componentes oficiais de navegação e preservam label acessível, estado ativo, badge e foco.

### 27.6 Responsividade

Sidebar e bottom navigation nunca coexistem; apoio lateral colapsa antes do conteúdo principal.

### 27.7 Estados e protótipo

O shell deve demonstrar status global, navegação ativa, badge, overlay e retorno. Estados de conteúdo pertencem ao Body ou ao Screen Template, não ao shell.

### 27.8 Anti-patterns

- copiar o shell para dentro de cada template;
- editar padding em instância;
- inserir navegação paralela;
- usar componentes específicos de Grow ou Med;
- incluir dados reais de conta;
- manter sidebar e bottom navigation simultaneamente;
- destacar a instância para trocar Body.

### 27.9 Critérios de aceite

- [ ] Nested components permanecem conectados.
- [ ] Tema e contexto mudam por modes.
- [ ] Foco e ordem de leitura estão anotados.
- [ ] Safe areas e scroll estão representados.
- [ ] Larguras de stress não quebram navegação.
- [ ] Descrição e owner estão preenchidos.

## 28. Shell S3 — Aplicativo autenticado desktop

### 28.1 Papel no Figma

`Shell/S3 Aplicativo autenticado desktop` é um component set publicado. Ele representa a estrutura persistente e recebe o Template Body correspondente por nested instance controlada.

### 28.2 Viewports

**Suporte:** Desktop.  
**Frames de referência:** 1440 × 1024; stress em 1280–1920px.

### 28.3 Anatomia

1. `01 Status Global`
2. `02 Sidebar`
3. `03 Application Header`
4. `04 Main Container`
5. `05 Support Panel`
6. `06 Overlay Anchor`

### 28.4 Properties expostas

- `SidebarMode`
- `HasGlobalStatus`
- `HasSupportPanel`
- `ActiveNavItem`
- `ContainerWidth`

Tema e contexto são herdados por modes. Padding, gaps, cor, elevação e ordem das regiões permanecem protegidos.

### 28.5 Navegação

**Modelo:** Sidebar persistente. Itens usam componentes oficiais de navegação e preservam label acessível, estado ativo, badge e foco.

### 28.6 Responsividade

Container central respeita max-width; viewport amplo não estica conteúdo indiscriminadamente.

### 28.7 Estados e protótipo

O shell deve demonstrar status global, navegação ativa, badge, overlay e retorno. Estados de conteúdo pertencem ao Body ou ao Screen Template, não ao shell.

### 28.8 Anti-patterns

- copiar o shell para dentro de cada template;
- editar padding em instância;
- inserir navegação paralela;
- usar componentes específicos de Grow ou Med;
- incluir dados reais de conta;
- manter sidebar e bottom navigation simultaneamente;
- destacar a instância para trocar Body.

### 28.9 Critérios de aceite

- [ ] Nested components permanecem conectados.
- [ ] Tema e contexto mudam por modes.
- [ ] Foco e ordem de leitura estão anotados.
- [ ] Safe areas e scroll estão representados.
- [ ] Larguras de stress não quebram navegação.
- [ ] Descrição e owner estão preenchidos.

## 29. Shell S4 — Entrada e autenticação

### 29.1 Papel no Figma

`Shell/S4 Entrada e autenticação` é um component set publicado. Ele representa a estrutura persistente e recebe o Template Body correspondente por nested instance controlada.

### 29.2 Viewports

**Suporte:** Mobile/Tablet/Desktop.  
**Frames de referência:** 390, 1024 e 1440px.

### 29.3 Anatomia

1. `01 Brand Region`
2. `02 Centered Content`
3. `03 Support Links`
4. `04 Legal Region`
5. `05 Background`

### 29.4 Properties expostas

- `Viewport`
- `HasSupportLinks`
- `HasLegalRegion`
- `BrandEmphasis`

Tema e contexto são herdados por modes. Padding, gaps, cor, elevação e ordem das regiões permanecem protegidos.

### 29.5 Navegação

**Modelo:** Navegação principal ausente. Itens usam componentes oficiais de navegação e preservam label acessível, estado ativo, badge e foco.

### 29.6 Responsividade

Conteúdo permanece entre 320 e 480px; fundo institucional nunca compete com formulário.

### 29.7 Estados e protótipo

O shell deve demonstrar status global, navegação ativa, badge, overlay e retorno. Estados de conteúdo pertencem ao Body ou ao Screen Template, não ao shell.

### 29.8 Anti-patterns

- copiar o shell para dentro de cada template;
- editar padding em instância;
- inserir navegação paralela;
- usar componentes específicos de Grow ou Med;
- incluir dados reais de conta;
- manter sidebar e bottom navigation simultaneamente;
- destacar a instância para trocar Body.

### 29.9 Critérios de aceite

- [ ] Nested components permanecem conectados.
- [ ] Tema e contexto mudam por modes.
- [ ] Foco e ordem de leitura estão anotados.
- [ ] Safe areas e scroll estão representados.
- [ ] Larguras de stress não quebram navegação.
- [ ] Descrição e owner estão preenchidos.

## 30. Shell S5 — Fluxo focado

### 30.1 Papel no Figma

`Shell/S5 Fluxo focado` é um component set publicado. Ele representa a estrutura persistente e recebe o Template Body correspondente por nested instance controlada.

### 30.2 Viewports

**Suporte:** Mobile/Tablet/Desktop.  
**Frames de referência:** 390, 1024 e 1440px.

### 30.3 Anatomia

1. `01 Progress Header`
2. `02 Back Action`
3. `03 Focused Content`
4. `04 Persistent Actions`
5. `05 Save Status`

### 30.4 Properties expostas

- `Viewport`
- `HasProgress`
- `HasBack`
- `HasSaveStatus`
- `HasPersistentActions`

Tema e contexto são herdados por modes. Padding, gaps, cor, elevação e ordem das regiões permanecem protegidos.

### 30.5 Navegação

**Modelo:** Navegação reduzida. Itens usam componentes oficiais de navegação e preservam label acessível, estado ativo, badge e foco.

### 30.6 Responsividade

Uma tarefa e uma ação primária; progresso e preservação de dados permanecem visíveis.

### 30.7 Estados e protótipo

O shell deve demonstrar status global, navegação ativa, badge, overlay e retorno. Estados de conteúdo pertencem ao Body ou ao Screen Template, não ao shell.

### 30.8 Anti-patterns

- copiar o shell para dentro de cada template;
- editar padding em instância;
- inserir navegação paralela;
- usar componentes específicos de Grow ou Med;
- incluir dados reais de conta;
- manter sidebar e bottom navigation simultaneamente;
- destacar a instância para trocar Body.

### 30.9 Critérios de aceite

- [ ] Nested components permanecem conectados.
- [ ] Tema e contexto mudam por modes.
- [ ] Foco e ordem de leitura estão anotados.
- [ ] Safe areas e scroll estão representados.
- [ ] Larguras de stress não quebram navegação.
- [ ] Descrição e owner estão preenchidos.

## 31. Shell S6 — Público ou compartilhado

### 31.1 Papel no Figma

`Shell/S6 Público ou compartilhado` é um component set publicado. Ele representa a estrutura persistente e recebe o Template Body correspondente por nested instance controlada.

### 31.2 Viewports

**Suporte:** Mobile/Tablet/Desktop.  
**Frames de referência:** 390, 1024 e 1440px.

### 31.3 Anatomia

1. `01 Context Identity`
2. `02 Public Header`
3. `03 Public Content`
4. `04 Auth Prompt`
5. `05 Footer`

### 31.4 Properties expostas

- `Viewport`
- `AccessMode`
- `HasAuthPrompt`
- `HasFooter`
- `Context`

Tema e contexto são herdados por modes. Padding, gaps, cor, elevação e ordem das regiões permanecem protegidos.

### 31.5 Navegação

**Modelo:** Navegação limitada. Itens usam componentes oficiais de navegação e preservam label acessível, estado ativo, badge e foco.

### 31.6 Responsividade

Não expõe identidade privada ou relação entre perfis; ações dependentes de login são claramente condicionais.

### 31.7 Estados e protótipo

O shell deve demonstrar status global, navegação ativa, badge, overlay e retorno. Estados de conteúdo pertencem ao Body ou ao Screen Template, não ao shell.

### 31.8 Anti-patterns

- copiar o shell para dentro de cada template;
- editar padding em instância;
- inserir navegação paralela;
- usar componentes específicos de Grow ou Med;
- incluir dados reais de conta;
- manter sidebar e bottom navigation simultaneamente;
- destacar a instância para trocar Body.

### 31.9 Critérios de aceite

- [ ] Nested components permanecem conectados.
- [ ] Tema e contexto mudam por modes.
- [ ] Foco e ordem de leitura estão anotados.
- [ ] Safe areas e scroll estão representados.
- [ ] Larguras de stress não quebram navegação.
- [ ] Descrição e owner estão preenchidos.

## 32. Shell S7 — Administração

### 32.1 Papel no Figma

`Shell/S7 Administração` é um component set publicado. Ele representa a estrutura persistente e recebe o Template Body correspondente por nested instance controlada.

### 32.2 Viewports

**Suporte:** Tablet/Desktop.  
**Frames de referência:** 1024 e 1440px; stress em 1280–1920px.

### 32.3 Anatomia

1. `01 Admin Sidebar`
2. `02 Admin Header`
3. `03 Breadcrumb`
4. `04 Dense Content`
5. `05 Audit Context`
6. `06 Overlay Anchor`

### 32.4 Properties expostas

- `Viewport`
- `SidebarMode`
- `Density`
- `HasAuditContext`
- `ActiveNavItem`

Tema e contexto são herdados por modes. Padding, gaps, cor, elevação e ordem das regiões permanecem protegidos.

### 32.5 Navegação

**Modelo:** Sidebar administrativa. Itens usam componentes oficiais de navegação e preservam label acessível, estado ativo, badge e foco.

### 32.6 Responsividade

Densidade compacta é permitida sem reduzir acessibilidade; sistema visual continua compartilhado.

### 32.7 Estados e protótipo

O shell deve demonstrar status global, navegação ativa, badge, overlay e retorno. Estados de conteúdo pertencem ao Body ou ao Screen Template, não ao shell.

### 32.8 Anti-patterns

- copiar o shell para dentro de cada template;
- editar padding em instância;
- inserir navegação paralela;
- usar componentes específicos de Grow ou Med;
- incluir dados reais de conta;
- manter sidebar e bottom navigation simultaneamente;
- destacar a instância para trocar Body.

### 32.9 Critérios de aceite

- [ ] Nested components permanecem conectados.
- [ ] Tema e contexto mudam por modes.
- [ ] Foco e ordem de leitura estão anotados.
- [ ] Safe areas e scroll estão representados.
- [ ] Larguras de stress não quebram navegação.
- [ ] Descrição e owner estão preenchidos.

## 33. T01 — Entrada e Autenticação

### 33.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T01 Entrada e Autenticação` |
| Template Body | `Body/T01 Entrada e Autenticação` |
| Categoria | Entrada |
| Shells compatíveis | S4 |
| Status inicial | `Candidate` até validação em fluxo real |

### 33.2 Propósito e justificativa

Este template existe para orientar acesso, cadastro, recuperação ou verificação sem navegação concorrente. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 33.3 Anatomia e ordem de layers

1. `01 Brand`
2. `02 Title & Guidance`
3. `03 Auth Form`
4. `04 Primary Action`
5. `05 Alternative Access`
6. `06 Support`
7. `07 Legal`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 33.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `FlowType`
- `HasAlternativeAccess`
- `HasSupport`
- `HasLegal`
- `FormState`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 33.5 Componentes permitidos

- Text Field
- Password Field
- Button
- Inline Validation
- Banner
- Link

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 33.6 Estados representados

- `Default`
- `Loading`
- `Validation Error`
- `Request Error`
- `Success`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 33.7 Responsividade

Uma coluna até 480px; desktop mantém centralização e não aumenta largura do formulário.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 33.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 33.9 Protótipo mínimo

Login → loading → sucesso; recuperação → confirmação; erro → retry.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 33.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 33.11 Anti-patterns

- usar imagem decorativa dominante; múltiplas ações primárias; expor senha ou dado real em fixture;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 33.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 34. T02 — Escolha de Propósito ou Contexto

### 34.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T02 Escolha de Propósito ou Contexto` |
| Template Body | `Body/T02 Escolha de Propósito ou Contexto` |
| Categoria | Entrada |
| Shells compatíveis | S4, S5 |
| Status inicial | `Candidate` até validação em fluxo real |

### 34.2 Propósito e justificativa

Este template existe para permitir escolha clara entre Grow, Med ou ambos sem misturar identidades e sem criar arquitetura paralela. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 34.3 Anatomia e ordem de layers

1. `01 Brand`
2. `02 Title & Explanation`
3. `03 Option Group`
4. `04 Privacy Note`
5. `05 Primary Action`
6. `06 Secondary Action`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 34.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `SelectionMode`
- `HasPrivacyNote`
- `HasSecondaryAction`
- `OptionCount`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 34.5 Componentes permitidos

- Choice Card
- Radio Group
- Button
- Privacy Notice
- Icon

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 34.6 Estados representados

- `Default`
- `No Selection`
- `Loading`
- `Error`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 34.7 Responsividade

Cards empilham no mobile e podem formar duas colunas controladas em tablet/desktop.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 34.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 34.9 Protótipo mínimo

Selecionar opção → habilitar continuar → próximo passo.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 34.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 34.11 Anti-patterns

- usar cor como único diferenciador; pré-selecionar escolha sensível sem explicação; adicionar opções fora do fluxo;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 34.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 35. T03 — Onboarding Guiado

### 35.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T03 Onboarding Guiado` |
| Template Body | `Body/T03 Onboarding Guiado` |
| Categoria | Entrada |
| Shells compatíveis | S5 |
| Status inicial | `Candidate` até validação em fluxo real |

### 35.2 Propósito e justificativa

Este template existe para apresentar sequência educativa curta com progresso, retorno e preservação de contexto. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 35.3 Anatomia e ordem de layers

1. `01 Progress`
2. `02 Step Header`
3. `03 Educational Content`
4. `04 Optional Media`
5. `05 Primary Action`
6. `06 Secondary Action`
7. `07 Save Status`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 35.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `StepType`
- `HasMedia`
- `HasSecondaryAction`
- `HasSaveStatus`
- `ProgressValue`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 35.5 Componentes permitidos

- Progress Indicator
- Illustration
- Button
- Inline Notice
- Choice Group

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 35.6 Estados representados

- `Default`
- `Loading`
- `Error`
- `Saved`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 35.7 Responsividade

Conteúdo central até 640px; mídia pode ocupar apoio lateral no desktop sem alterar ordem semântica.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 35.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 35.9 Protótipo mínimo

Avançar/voltar; salvar progresso; sair e retomar.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 35.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 35.11 Anti-patterns

- usar carrossel sem indicação; esconder pular quando permitido; transformar onboarding em marketing longo;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 35.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 36. T04 — Wizard Transacional

### 36.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T04 Wizard Transacional` |
| Template Body | `Body/T04 Wizard Transacional` |
| Categoria | Entrada |
| Shells compatíveis | S5 |
| Status inicial | `Candidate` até validação em fluxo real |

### 36.2 Propósito e justificativa

Este template existe para conduzir criação ou configuração multi-etapas com validação e resumo. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 36.3 Anatomia e ordem de layers

1. `01 Progress`
2. `02 Step Context`
3. `03 Form Section`
4. `04 Summary`
5. `05 Validation`
6. `06 Persistent Actions`
7. `07 Save Status`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 36.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `StepType`
- `HasSummary`
- `HasSaveStatus`
- `HasSecondaryAction`
- `ValidationMode`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 36.5 Componentes permitidos

- Form Pattern
- Progress Indicator
- Summary Card
- Button
- Inline Validation
- Offline Banner

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 36.6 Estados representados

- `Default`
- `Validation Error`
- `Saving`
- `Offline Draft`
- `Success`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 36.7 Responsividade

Uma coluna no mobile; apoio/resumo lateral no desktop apenas quando persistente e útil.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 36.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 36.9 Protótipo mínimo

Preencher → validar → salvar → próxima etapa; voltar preservando dados.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 36.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 36.11 Anti-patterns

- usar wizard para tarefa curta; permitir etapas sem contexto; perder dados ao voltar;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 36.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 37. T05 — Dashboard

### 37.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T05 Dashboard` |
| Template Body | `Body/T05 Dashboard` |
| Categoria | Operacional |
| Shells compatíveis | S1, S2, S3 |
| Status inicial | `Candidate` até validação em fluxo real |

### 37.2 Propósito e justificativa

Este template existe para oferecer visão do dia, ação prioritária e acesso rápido a entidades ativas, tarefas, alertas e métricas. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 37.3 Anatomia e ordem de layers

1. `01 Page Header`
2. `02 Priority Action`
3. `03 Active Entities`
4. `04 Tasks`
5. `05 Alerts`
6. `06 Key Metrics`
7. `07 Secondary Content`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 37.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `HasPriorityAction`
- `HasAlerts`
- `HasMetrics`
- `HasSecondaryContent`
- `EntityLayout`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 37.5 Componentes permitidos

- Entity Card
- Task List
- AI Alert Card
- Statistics Panel
- Banner
- Button

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 37.6 Estados representados

- `Content`
- `First-use Empty`
- `Partial Loading`
- `Global Error`
- `Offline Cache`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 37.7 Responsividade

Mobile em fluxo vertical; tablet em duas regiões; desktop usa grid com hierarquia principal preservada.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 37.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 37.9 Protótipo mínimo

Abrir entidade; iniciar check-in; ver alerta; retry parcial.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 37.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 37.11 Anti-patterns

- mosaico de cards sem prioridade; mais de uma ação primária; métricas acima da tarefa do dia;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 37.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 38. T06 — Lista de Coleção

### 38.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T06 Lista de Coleção` |
| Template Body | `Body/T06 Lista de Coleção` |
| Categoria | Operacional |
| Shells compatíveis | S1, S2, S3 |
| Status inicial | `Candidate` até validação em fluxo real |

### 38.2 Propósito e justificativa

Este template existe para exibir coleção paginada com busca, filtro, ordenação e criação. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 38.3 Anatomia e ordem de layers

1. `01 Page Header`
2. `02 Toolbar`
3. `03 Applied Filters`
4. `04 Collection List`
5. `05 Pagination`
6. `06 Create Action`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 38.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `HasSearch`
- `HasFilters`
- `HasSort`
- `HasCreateAction`
- `SelectionMode`
- `Density`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 38.5 Componentes permitidos

- Search Field
- Filter Chips
- List Item
- Pagination
- Empty State
- Button

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 38.6 Estados representados

- `Content`
- `Empty`
- `No Results`
- `Loading`
- `Loading More`
- `Error`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 38.7 Responsividade

Lista full-width mobile; densidade confortável padrão; desktop pode usar compacta quando autorizada.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 38.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 38.9 Protótipo mínimo

Buscar, filtrar, abrir item, carregar mais, criar.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 38.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 38.11 Anti-patterns

- usar grid quando comparação visual não ajuda; esconder filtros aplicados; scroll aninhado desnecessário;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 38.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 39. T07 — Biblioteca em Grid

### 39.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T07 Biblioteca em Grid` |
| Template Body | `Body/T07 Biblioteca em Grid` |
| Categoria | Operacional |
| Shells compatíveis | S1, S2, S3 |
| Status inicial | `Candidate` até validação em fluxo real |

### 39.2 Propósito e justificativa

Este template existe para organizar itens visualmente comparáveis em grid responsivo. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 39.3 Anatomia e ordem de layers

1. `01 Page Header`
2. `02 Toolbar`
3. `03 Applied Filters`
4. `04 Card Grid`
5. `05 Pagination`
6. `06 Create Action`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 39.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `CardType`
- `HasSearch`
- `HasFilters`
- `HasSort`
- `HasCreateAction`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 39.5 Componentes permitidos

- Entity Card
- Media Card
- Search Field
- Filter Chips
- Pagination

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 39.6 Estados representados

- `Content`
- `Empty`
- `No Results`
- `Loading`
- `Error`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 39.7 Responsividade

1 coluna mobile; 2–3 tablet; 3–4 desktop conforme min-width do card e max-width do container.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 39.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 39.9 Protótipo mínimo

Filtrar, abrir card, selecionar quando permitido.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 39.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 39.11 Anti-patterns

- forçar muitas colunas; cards com alturas incoerentes; usar grid para conteúdo textual denso;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 39.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 40. T08 — Busca e Resultados

### 40.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T08 Busca e Resultados` |
| Template Body | `Body/T08 Busca e Resultados` |
| Categoria | Operacional |
| Shells compatíveis | S1, S2, S3, S6 |
| Status inicial | `Candidate` até validação em fluxo real |

### 40.2 Propósito e justificativa

Este template existe para dar contexto à consulta, filtros, quantidade, resultados e ausência de resultados. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 40.3 Anatomia e ordem de layers

1. `01 Search Header`
2. `02 Query Field`
3. `03 Filters`
4. `04 Result Summary`
5. `05 Results`
6. `06 Pagination`
7. `07 Suggestions`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 40.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `ResultType`
- `HasFilters`
- `HasSuggestions`
- `HasSort`
- `AccessMode`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 40.5 Componentes permitidos

- Search Field
- Filter Group
- List Item
- Card Grid
- Empty State
- Pagination

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 40.6 Estados representados

- `Initial`
- `Searching`
- `Results`
- `No Results`
- `Error`
- `Restricted`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 40.7 Responsividade

Busca ocupa largura disponível; filtros viram sheet no mobile e painel controlado no desktop.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 40.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 40.9 Protótipo mínimo

Digitar consulta, aplicar filtro, abrir resultado, limpar busca.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 40.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 40.11 Anti-patterns

- mostrar tela vazia antes da consulta sem orientação; misturar resultados de Grow e Med; esconder escopo;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 40.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 41. T09 — Detalhe de Entidade

### 41.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T09 Detalhe de Entidade` |
| Template Body | `Body/T09 Detalhe de Entidade` |
| Categoria | Operacional |
| Shells compatíveis | S1, S2, S3, S6 |
| Status inicial | `Candidate` até validação em fluxo real |

### 41.2 Propósito e justificativa

Este template existe para apresentar identidade, status, resumo, métricas, timeline, mídia, relações e ações de uma entidade. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 41.3 Anatomia e ordem de layers

1. `01 Page Header`
2. `02 Entity Identity`
3. `03 Status`
4. `04 Primary Summary`
5. `05 Metrics`
6. `06 Timeline Preview`
7. `07 Media`
8. `08 Related Data`
9. `09 Actions`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 41.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `EntityType`
- `HasMetrics`
- `HasTimeline`
- `HasMedia`
- `HasRelatedData`
- `AccessMode`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 41.5 Componentes permitidos

- Entity Card
- Badge
- Statistics Panel
- Timeline
- Gallery
- Action Menu

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 41.6 Estados representados

- `Content`
- `No History`
- `Loading`
- `Error`
- `Restricted`
- `Deleted`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 41.7 Responsividade

Mobile empilha; desktop pode usar main + support sem afastar ações e status da identidade.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 41.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 41.9 Protótipo mínimo

Editar, abrir timeline, navegar a relação, alterar privacidade.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 41.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 41.11 Anti-patterns

- transformar toda a tela em card; esconder status; colocar ações destrutivas como primárias;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 41.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 42. T10 — Formulário Curto

### 42.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T10 Formulário Curto` |
| Template Body | `Body/T10 Formulário Curto` |
| Categoria | Operacional |
| Shells compatíveis | S1, S2, S3, S5 |
| Status inicial | `Candidate` até validação em fluxo real |

### 42.2 Propósito e justificativa

Este template existe para coletar conjunto pequeno de dados em uma única etapa. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 42.3 Anatomia e ordem de layers

1. `01 Page Header`
2. `02 Guidance`
3. `03 Form Fields`
4. `04 Validation Summary`
5. `05 Actions`
6. `06 Save Status`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 42.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `HasGuidance`
- `HasValidationSummary`
- `HasSaveStatus`
- `ActionMode`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 42.5 Componentes permitidos

- Text Field
- Number Field
- Selector
- Date Field
- Button
- Inline Validation

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 42.6 Estados representados

- `Default`
- `Validation Error`
- `Saving`
- `Offline Draft`
- `Success`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 42.7 Responsividade

Container de 480–640px; campos relacionados podem dividir linha apenas em desktop.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 42.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 42.9 Protótipo mínimo

Preencher → validar → salvar; rascunho offline quando aplicável.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 42.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 42.11 Anti-patterns

- mais de 8–10 campos sem seções; duas colunas no mobile; placeholder como label;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 42.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 43. T11 — Formulário Longo e Seccionado

### 43.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T11 Formulário Longo e Seccionado` |
| Template Body | `Body/T11 Formulário Longo e Seccionado` |
| Categoria | Operacional |
| Shells compatíveis | S1, S2, S3, S5 |
| Status inicial | `Candidate` até validação em fluxo real |

### 43.2 Propósito e justificativa

Este template existe para coletar dados extensos com seções, navegação interna e complexidade progressiva. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 43.3 Anatomia e ordem de layers

1. `01 Page Header`
2. `02 Section Navigation`
3. `03 Form Sections`
4. `04 Advanced Fields`
5. `05 Validation Summary`
6. `06 Persistent Actions`
7. `07 Save Status`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 43.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `HasSectionNav`
- `ComplexityLevel`
- `HasAdvancedFields`
- `HasSaveStatus`
- `ActionMode`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 43.5 Componentes permitidos

- Form Section
- Accordion
- Field Group
- Progressive Disclosure
- Validation Summary
- Button

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 43.6 Estados representados

- `Default`
- `Validation Error`
- `Saving`
- `Offline Draft`
- `Partial Error`
- `Success`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 43.7 Responsividade

Mobile usa seções verticais; desktop pode usar navegação lateral sticky e conteúdo até 800px.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 43.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 43.9 Protótipo mínimo

Navegar seções, revelar avançado, salvar rascunho, corrigir resumo de erros.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 43.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 43.11 Anti-patterns

- usar accordions para esconder tudo; salvar apenas no final; campos avançados sem explicação;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 43.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 44. T12 — Registro Rápido e Check-in

### 44.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T12 Registro Rápido e Check-in` |
| Template Body | `Body/T12 Registro Rápido e Check-in` |
| Categoria | Operacional |
| Shells compatíveis | S5, S1 |
| Status inicial | `Candidate` até validação em fluxo real |

### 44.2 Propósito e justificativa

Este template existe para registrar dados recorrentes em poucos segundos com mínima fricção e confirmação clara. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 44.3 Anatomia e ordem de layers

1. `01 Context Header`
2. `02 Progress or Date`
3. `03 Quick Inputs`
4. `04 Optional Details`
5. `05 Summary`
6. `06 Primary Action`
7. `07 Save Feedback`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 44.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `CheckinType`
- `HasOptionalDetails`
- `HasSummary`
- `InputDensity`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 44.5 Componentes permitidos

- Intensity Scale
- Number Field
- Choice Group
- Date Time
- Button
- Success Feedback

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 44.6 Estados representados

- `Default`
- `Saving`
- `Offline Draft`
- `Error`
- `Success`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 44.7 Responsividade

Mobile é referência principal; desktop mantém largura estreita e não expande o esforço.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 44.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 44.9 Protótipo mínimo

Registrar, salvar, confirmar e retornar ao contexto.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 44.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 44.11 Anti-patterns

- pedir dados especialistas por padrão; criar múltiplas telas para inputs simples; feedback ambíguo;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 44.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 45. T13 — Timeline

### 45.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T13 Timeline` |
| Template Body | `Body/T13 Timeline` |
| Categoria | Operacional |
| Shells compatíveis | S1, S2, S3, S6 |
| Status inicial | `Candidate` até validação em fluxo real |

### 45.2 Propósito e justificativa

Este template existe para apresentar história temporal pesquisável e progressivamente carregada. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 45.3 Anatomia e ordem de layers

1. `01 Page Header`
2. `02 Temporal Filters`
3. `03 Timeline`
4. `04 Load More`
5. `05 Event Detail Anchor`
6. `06 Create Event Action`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 45.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `TimelineType`
- `HasFilters`
- `HasCreateAction`
- `Grouping`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 45.5 Componentes permitidos

- Timeline
- Filter Group
- Event Item
- Pagination
- Empty State
- Button

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 45.6 Estados representados

- `Content`
- `No History`
- `Loading`
- `Loading More`
- `Error`
- `Offline Cache`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 45.7 Responsividade

Linha única no mobile; desktop pode adicionar filtros laterais sem dividir a narrativa temporal.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 45.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 45.9 Protótipo mínimo

Filtrar período, abrir evento, carregar mais, registrar novo evento.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 45.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 45.11 Anti-patterns

- usar eixo decorativo dominante; ordem reversa inconsistente; misturar eventos sem legenda;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 45.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 46. T14 — Tarefas e Pendências

### 46.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T14 Tarefas e Pendências` |
| Template Body | `Body/T14 Tarefas e Pendências` |
| Categoria | Operacional |
| Shells compatíveis | S1, S2, S3 |
| Status inicial | `Candidate` até validação em fluxo real |

### 46.2 Propósito e justificativa

Este template existe para organizar ações pendentes por prioridade, data, status e contexto. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 46.3 Anatomia e ordem de layers

1. `01 Page Header`
2. `02 Summary`
3. `03 Filters`
4. `04 Task Groups`
5. `05 Completed Section`
6. `06 Create Action`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 46.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `Grouping`
- `HasSummary`
- `HasFilters`
- `HasCreateAction`
- `Density`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 46.5 Componentes permitidos

- Task Item
- Badge
- Filter Chips
- Statistics Panel
- Button

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 46.6 Estados representados

- `Content`
- `Empty`
- `Loading`
- `Error`
- `Offline Cache`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 46.7 Responsividade

Mobile agrupa verticalmente; desktop pode mostrar summary lateral ou colunas por período, não kanban improvisado.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 46.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 46.9 Protótipo mínimo

Concluir, adiar, filtrar, abrir contexto, criar.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 46.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 46.11 Anti-patterns

- confundir tarefa com alerta; usar cor sem label; esconder tarefas concluídas sem acesso;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 46.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 47. T15 — Configuração Geral

### 47.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T15 Configuração Geral` |
| Template Body | `Body/T15 Configuração Geral` |
| Categoria | Operacional |
| Shells compatíveis | S1, S2, S3 |
| Status inicial | `Candidate` até validação em fluxo real |

### 47.2 Propósito e justificativa

Este template existe para apresentar categorias de preferência e conta com navegação clara. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 47.3 Anatomia e ordem de layers

1. `01 Page Header`
2. `02 Account Summary`
3. `03 Settings Groups`
4. `04 Sensitive Actions`
5. `05 Support`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 47.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `HasAccountSummary`
- `HasSensitiveActions`
- `Grouping`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 47.5 Componentes permitidos

- Settings List Item
- Avatar
- Badge
- Divider
- Banner

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 47.6 Estados representados

- `Content`
- `Loading`
- `Error`
- `Restricted`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 47.7 Responsividade

Lista única mobile; desktop pode usar navegação de categorias e painel de conteúdo.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 47.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 47.9 Protótipo mínimo

Abrir categoria, alternar setting simples, acessar suporte.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 47.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 47.11 Anti-patterns

- misturar configuração com dados operacionais; usar cards para cada item; esconder ações críticas;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 47.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 48. T16 — Configuração Detalhada

### 48.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T16 Configuração Detalhada` |
| Template Body | `Body/T16 Configuração Detalhada` |
| Categoria | Operacional |
| Shells compatíveis | S1, S2, S3 |
| Status inicial | `Candidate` até validação em fluxo real |

### 48.2 Propósito e justificativa

Este template existe para editar conjunto coerente de preferências com explicações, dependências e confirmação. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 48.3 Anatomia e ordem de layers

1. `01 Page Header`
2. `02 Context Notice`
3. `03 Settings Sections`
4. `04 Dependency Notices`
5. `05 Actions`
6. `06 Save Status`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 48.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `SettingType`
- `HasContextNotice`
- `HasSaveStatus`
- `ActionMode`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 48.5 Componentes permitidos

- Switch
- Selector
- Settings Item
- Inline Notice
- Button

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 48.6 Estados representados

- `Default`
- `Saving`
- `Error`
- `Success`
- `Restricted`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 48.7 Responsividade

Mobile vertical; desktop com max-width de leitura e navegação lateral quando múltiplas seções.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 48.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 48.9 Protótipo mínimo

Alterar, revisar impacto, salvar ou aplicar imediatamente conforme regra.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 48.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 48.11 Anti-patterns

- usar toggle para ação irreversível; não explicar consequências; salvar silenciosamente quando risco é alto;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 48.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 49. T17 — Analytics Overview

### 49.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T17 Analytics Overview` |
| Template Body | `Body/T17 Analytics Overview` |
| Categoria | Analítico |
| Shells compatíveis | S1, S2, S3 |
| Status inicial | `Candidate` até validação em fluxo real |

### 49.2 Propósito e justificativa

Este template existe para resumir período, métricas, tendências, gráficos e insights com hierarquia analítica. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 49.3 Anatomia e ordem de layers

1. `01 Page Header`
2. `02 Period Controls`
3. `03 KPI Summary`
4. `04 Primary Chart`
5. `05 Secondary Charts`
6. `06 Insights`
7. `07 Data Notes`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 49.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `AnalyticsType`
- `HasInsights`
- `HasSecondaryCharts`
- `PeriodPreset`
- `Density`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 49.5 Componentes permitidos

- Statistics Panel
- Time Series Chart
- Comparison Chart
- AI Insight Card
- Data Table
- Banner

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 49.6 Estados representados

- `Content`
- `Insufficient Data`
- `Loading`
- `Partial Error`
- `Global Error`
- `Offline Cache`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 49.7 Responsividade

Mobile prioriza kpis e um gráfico por vez; desktop usa grid analítico até 1440px.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 49.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 49.9 Protótipo mínimo

Mudar período, explorar ponto, abrir insight, ver alternativa tabular.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 49.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 49.11 Anti-patterns

- dashboard de gráficos sem pergunta; arco-íris; eixos inconsistentes; esconder dados insuficientes;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 49.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 50. T18 — Insight e Explicabilidade da IA

### 50.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T18 Insight e Explicabilidade da IA` |
| Template Body | `Body/T18 Insight e Explicabilidade da IA` |
| Categoria | Analítico |
| Shells compatíveis | S1, S2, S3, S6 |
| Status inicial | `Candidate` até validação em fluxo real |

### 50.2 Propósito e justificativa

Este template existe para explicar uma inferência da IA com evidência, confiança, limitações e ação. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 50.3 Anatomia e ordem de layers

1. `01 Page Header`
2. `02 Insight Summary`
3. `03 Evidence`
4. `04 Period`
5. `05 Confidence`
6. `06 Limitations`
7. `07 Recommended Action`
8. `08 Feedback`
9. `09 Related Data`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 50.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `InsightType`
- `ConfidenceLevel`
- `HasAction`
- `HasFeedback`
- `DataOrigin`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 50.5 Componentes permitidos

- AI Explainability Card
- Confidence Indicator
- Chart
- Data Table
- Feedback Control
- Button

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 50.6 Estados representados

- `Content`
- `Cold Start`
- `Insufficient Data`
- `Loading`
- `Error`
- `Restricted`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 50.7 Responsividade

Conteúdo de leitura até 720px; evidências podem ocupar apoio no desktop sem separar limitações.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 50.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 50.9 Protótipo mínimo

Ver evidência, compreender limitação, executar ação, dar feedback.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 50.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 50.11 Anti-patterns

- antropomorfizar IA; esconder incerteza; usar confiança como garantia; ação automática sem consentimento;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 50.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 51. T19 — Alerta ou Recomendação da IA

### 51.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T19 Alerta ou Recomendação da IA` |
| Template Body | `Body/T19 Alerta ou Recomendação da IA` |
| Categoria | Analítico |
| Shells compatíveis | S1, S2, S3 |
| Status inicial | `Candidate` até validação em fluxo real |

### 51.2 Propósito e justificativa

Este template existe para priorizar situação detectada, severidade, evidência e resposta segura. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 51.3 Anatomia e ordem de layers

1. `01 Severity Header`
2. `02 Alert Summary`
3. `03 Evidence`
4. `04 Confidence`
5. `05 Limitations`
6. `06 Suggested Action`
7. `07 Alternative Actions`
8. `08 Resolution State`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 51.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `Severity`
- `AlertType`
- `HasSuggestedAction`
- `HasAlternativeActions`
- `ResolutionState`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 51.5 Componentes permitidos

- AI Alert Card
- Chart
- Confidence Indicator
- Button
- Task Creation Pattern
- Banner

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 51.6 Estados representados

- `Active`
- `Loading`
- `Resolved`
- `Ignored`
- `Error`
- `Insufficient Data`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 51.7 Responsividade

Mobile mantém alerta e ação próximos; desktop pode apoiar com gráfico lateral.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 51.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 51.9 Protótipo mínimo

Aceitar sugestão, criar tarefa, ignorar com motivo, marcar resolvido.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 51.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 51.11 Anti-patterns

- vermelho para alertas não críticos; ação irreversível automática; omitir evidência;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 51.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 52. T20 — Comparação

### 52.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T20 Comparação` |
| Template Body | `Body/T20 Comparação` |
| Categoria | Analítico |
| Shells compatíveis | S1, S2, S3 |
| Status inicial | `Candidate` até validação em fluxo real |

### 52.2 Propósito e justificativa

Este template existe para comparar entidades ou períodos com critérios equivalentes e diferenças honestas. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 52.3 Anatomia e ordem de layers

1. `01 Page Header`
2. `02 Comparison Selection`
3. `03 Summary`
4. `04 Criteria Matrix`
5. `05 Charts`
6. `06 Missing Data Notes`
7. `07 Actions`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 52.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `ComparisonType`
- `ItemCount`
- `HasCharts`
- `HasActions`
- `Orientation`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 52.5 Componentes permitidos

- Comparison Selector
- Comparison Table
- Chart
- Badge
- Empty State

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 52.6 Estados representados

- `Content`
- `Selection Required`
- `Loading`
- `Incomparable`
- `Error`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 52.7 Responsividade

Mobile usa seleção e comparação vertical; desktop permite colunas sincronizadas e tabela.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 52.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 52.9 Protótipo mínimo

Selecionar itens, trocar critério, abrir detalhe.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 52.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 52.11 Anti-patterns

- comparar escalas diferentes sem aviso; destacar vencedor arbitrário; esconder dados ausentes;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 52.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 53. T21 — Relatório

### 53.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T21 Relatório` |
| Template Body | `Body/T21 Relatório` |
| Categoria | Analítico |
| Shells compatíveis | S1, S2, S3 |
| Status inicial | `Candidate` até validação em fluxo real |

### 53.2 Propósito e justificativa

Este template existe para apresentar documento legível, exportável e rastreável por período. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 53.3 Anatomia e ordem de layers

1. `01 Report Header`
2. `02 Executive Summary`
3. `03 Scope and Period`
4. `04 Metrics`
5. `05 Charts`
6. `06 Narrative Sections`
7. `07 Limitations`
8. `08 Footer`
9. `09 Export Action`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 53.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `ReportType`
- `HasCharts`
- `HasLimitations`
- `ExportAvailable`
- `ViewMode`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 53.5 Componentes permitidos

- Report Section
- Chart
- Data Table
- Badge
- Export Action
- Processing State

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 53.6 Estados representados

- `Content`
- `Generating`
- `Generated`
- `Error`
- `Insufficient Data`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 53.7 Responsividade

Visualização mobile reflow; desktop simula documento com largura de leitura; export preview separado.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 53.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 53.9 Protótipo mínimo

Gerar, revisar, exportar, compartilhar conforme permissão.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 53.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 53.11 Anti-patterns

- imitar papel em mobile; reduzir fonte para caber; ocultar limitações; misturar edição e leitura;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 53.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 54. T22 — Exportação e Compartilhamento

### 54.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T22 Exportação e Compartilhamento` |
| Template Body | `Body/T22 Exportação e Compartilhamento` |
| Categoria | Analítico |
| Shells compatíveis | S5, S1, S2, S3 |
| Status inicial | `Candidate` até validação em fluxo real |

### 54.2 Propósito e justificativa

Este template existe para configurar formato, período, escopo, privacidade e destino de exportação. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 54.3 Anatomia e ordem de layers

1. `01 Context Header`
2. `02 Export Options`
3. `03 Scope`
4. `04 Privacy Summary`
5. `05 Preview Summary`
6. `06 Primary Action`
7. `07 Processing Feedback`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 54.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `ExportType`
- `HasPreview`
- `HasPrivacySummary`
- `DestinationType`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 54.5 Componentes permitidos

- Selector
- Date Range
- Privacy Summary
- Button
- Progress
- Success State

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 54.6 Estados representados

- `Default`
- `Validation Error`
- `Processing`
- `Error`
- `Success`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 54.7 Responsividade

Formulário estreito; desktop pode mostrar preview lateral sem duplicar ações.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 54.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 54.9 Protótipo mínimo

Configurar → revisar → gerar → compartilhar.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 54.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 54.11 Anti-patterns

- compartilhar por default; esconder escopo; usar loading sem progresso em processo longo;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 54.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 55. T23 — Perfil

### 55.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T23 Perfil` |
| Template Body | `Body/T23 Perfil` |
| Categoria | Identidade |
| Shells compatíveis | S1, S2, S3, S6 |
| Status inicial | `Candidate` até validação em fluxo real |

### 55.2 Propósito e justificativa

Este template existe para apresentar identidade contextual, biografia, reputação, conteúdo e controles de relacionamento. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 55.3 Anatomia e ordem de layers

1. `01 Profile Header`
2. `02 Identity`
3. `03 Context Badge`
4. `04 Bio`
5. `05 Stats`
6. `06 Primary Relationship Action`
7. `07 Content Tabs`
8. `08 Content`
9. `09 Privacy Link`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 55.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `ProfileContext`
- `AccessMode`
- `HasStats`
- `HasBio`
- `HasRelationshipAction`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 55.5 Componentes permitidos

- Avatar
- Badge
- Statistics Panel
- Tabs
- Feed Card
- Button

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 55.6 Estados representados

- `Content`
- `Empty`
- `Loading`
- `Error`
- `Restricted`
- `Blocked`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 55.7 Responsividade

Mobile empilha; desktop pode usar profile summary lateral e conteúdo principal.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 55.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 55.9 Protótipo mínimo

Seguir, editar, alternar tabs, abrir conteúdo.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 55.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 55.11 Anti-patterns

- revelar vínculo Grow–Med sem consentimento; exigir avatar no Med; reputação compartilhada entre contextos;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 55.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 56. T24 — Central de Privacidade e Dados

### 56.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T24 Central de Privacidade e Dados` |
| Template Body | `Body/T24 Central de Privacidade e Dados` |
| Categoria | Identidade |
| Shells compatíveis | S1, S2, S3 |
| Status inicial | `Candidate` até validação em fluxo real |

### 56.2 Propósito e justificativa

Este template existe para tornar visíveis consentimentos, escopos, perfis, exportação e exclusão de dados. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 56.3 Anatomia e ordem de layers

1. `01 Page Header`
2. `02 Privacy Summary`
3. `03 Consent Sections`
4. `04 Visibility Controls`
5. `05 Profile Links`
6. `06 Data Actions`
7. `07 Sensitive Actions`
8. `08 Audit Notes`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 56.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `PrivacyArea`
- `HasProfileLinks`
- `HasDataActions`
- `HasSensitiveActions`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 56.5 Componentes permitidos

- Privacy Matrix
- Visibility Selector
- Consent Item
- Banner
- Button
- Audit Item

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 56.6 Estados representados

- `Content`
- `Loading`
- `Error`
- `Restricted`
- `Processing`
- `Success`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 56.7 Responsividade

Mobile usa seções; desktop pode usar navegação lateral e painel de detalhe.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 56.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 56.9 Protótipo mínimo

Alterar escopo, revogar consentimento, exportar dados, excluir com confirmação.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 56.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 56.11 Anti-patterns

- esconder consequências; usar toggles ambíguos; agrupar exclusão com ações rotineiras;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 56.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 57. T25 — Feed da Comunidade

### 57.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T25 Feed da Comunidade` |
| Template Body | `Body/T25 Feed da Comunidade` |
| Categoria | Comunidade |
| Shells compatíveis | S1, S2, S3 |
| Status inicial | `Candidate` até validação em fluxo real |

### 57.2 Propósito e justificativa

Este template existe para apresentar conteúdo social escopado ao contexto com criação, filtros e carregamento contínuo controlado. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 57.3 Anatomia e ordem de layers

1. `01 Page Header`
2. `02 Context Identity`
3. `03 Create Entry`
4. `04 Feed Filters`
5. `05 Feed`
6. `06 Load More`
7. `07 Community Guidance`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 57.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `CommunityContext`
- `HasCreateEntry`
- `HasFilters`
- `FeedMode`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 57.5 Componentes permitidos

- Community Post Card
- Composer Entry
- Filter Chips
- Pagination
- Banner

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 57.6 Estados representados

- `Content`
- `First-use Empty`
- `Loading`
- `Loading More`
- `Error`
- `Restricted`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 57.7 Responsividade

Mobile uma coluna; desktop pode usar feed central e apoio, sem transformar em dashboard de três colunas.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 57.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 57.9 Protótipo mínimo

Publicar, seguir, curtir, comentar, salvar, carregar mais.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 57.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 57.11 Anti-patterns

- misturar contextos; feed infinito sem posição; ranking opaco; promover exposição por default;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 57.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 58. T26 — Conteúdo Público e Discussão

### 58.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T26 Conteúdo Público e Discussão` |
| Template Body | `Body/T26 Conteúdo Público e Discussão` |
| Categoria | Comunidade |
| Shells compatíveis | S1, S2, S3, S6 |
| Status inicial | `Candidate` até validação em fluxo real |

### 58.2 Propósito e justificativa

Este template existe para mostrar publicação, escopo, autor contextual, mídia, discussão e moderação. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 58.3 Anatomia e ordem de layers

1. `01 Content Header`
2. `02 Author Identity`
3. `03 Visibility`
4. `04 Content Body`
5. `05 Media`
6. `06 Structured Data`
7. `07 Interactions`
8. `08 Comments`
9. `09 Moderation Actions`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 58.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `ContentContext`
- `AccessMode`
- `HasMedia`
- `HasStructuredData`
- `CommentsMode`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 58.5 Componentes permitidos

- Post Detail
- Avatar
- Visibility Badge
- Gallery
- Comment Thread
- Report Action

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 58.6 Estados representados

- `Content`
- `No Comments`
- `Loading`
- `Error`
- `Removed`
- `Restricted`
- `Blocked`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 58.7 Responsividade

Mobile linear; desktop mantém conteúdo principal e comentários em sequência ou apoio controlado.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 58.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 58.9 Protótipo mínimo

Interagir, comentar, denunciar, bloquear, abrir perfil.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 58.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 58.11 Anti-patterns

- ocultar escopo; vincular perfis; comentários sem moderação; ação de denúncia inacessível;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 58.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 59. T27 — Publicação e Compartilhamento

### 59.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T27 Publicação e Compartilhamento` |
| Template Body | `Body/T27 Publicação e Compartilhamento` |
| Categoria | Comunidade |
| Shells compatíveis | S5, S1, S2, S3 |
| Status inicial | `Candidate` até validação em fluxo real |

### 59.2 Propósito e justificativa

Este template existe para compor conteúdo, anexar dados permitidos e revisar privacidade antes de publicar. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 59.3 Anatomia e ordem de layers

1. `01 Context Header`
2. `02 Composer`
3. `03 Media`
4. `04 Structured Data Selection`
5. `05 Privacy Controls`
6. `06 Preview`
7. `07 Actions`
8. `08 Draft Status`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 59.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `PublicationType`
- `HasMedia`
- `HasStructuredData`
- `HasPreview`
- `HasDraftStatus`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 59.5 Componentes permitidos

- Text Area
- Media Upload
- Entity Selector
- Privacy Matrix
- Preview Card
- Button

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 59.6 Estados representados

- `Default`
- `Validation Error`
- `Saving Draft`
- `Offline Draft`
- `Publishing`
- `Error`
- `Success`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 59.7 Responsividade

Mobile fluxo vertical; desktop pode apresentar preview lateral.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 59.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 59.9 Protótipo mínimo

Escrever, anexar, revisar, salvar rascunho, publicar.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 59.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 59.11 Anti-patterns

- privacidade escondida no fim; anexar dado sensível automaticamente; publicar com duplo toque;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 59.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 60. T28 — Conteúdo Privado, Restrito ou sem Permissão

### 60.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T28 Conteúdo Privado, Restrito ou sem Permissão` |
| Template Body | `Body/T28 Conteúdo Privado, Restrito ou sem Permissão` |
| Categoria | Identidade |
| Shells compatíveis | S1, S2, S3, S6 |
| Status inicial | `Candidate` até validação em fluxo real |

### 60.2 Propósito e justificativa

Este template existe para explicar indisponibilidade sem vazar conteúdo ou identidade. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 60.3 Anatomia e ordem de layers

1. `01 Context Header`
2. `02 Restriction State`
3. `03 Reason`
4. `04 Available Action`
5. `05 Support`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 60.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `RestrictionType`
- `HasAction`
- `HasSupport`
- `AccessMode`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 60.5 Componentes permitidos

- Restricted State
- Button
- Link
- Privacy Badge

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 60.6 Estados representados

- `Private`
- `No Permission`
- `Consent Required`
- `Removed`
- `Expired Link`
- `Wrong Context`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 60.7 Responsividade

Estado central com largura de leitura; shell e contexto permanecem quando seguros.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 60.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 60.9 Protótipo mínimo

Solicitar acesso quando permitido, autenticar, voltar, abrir ajuda.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 60.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 60.11 Anti-patterns

- mostrar preview sensível; usar erro genérico; sugerir existência de perfil em outro contexto;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 60.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 61. T29 — Galeria de Mídia

### 61.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T29 Galeria de Mídia` |
| Template Body | `Body/T29 Galeria de Mídia` |
| Categoria | Mídia |
| Shells compatíveis | S1, S2, S3 |
| Status inicial | `Candidate` até validação em fluxo real |

### 61.2 Propósito e justificativa

Este template existe para organizar fotos e mídias por tempo, entidade, seleção e comparação. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 61.3 Anatomia e ordem de layers

1. `01 Page Header`
2. `02 Toolbar`
3. `03 Filters`
4. `04 Media Grid`
5. `05 Selection Actions`
6. `06 Pagination`
7. `07 Upload Action`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 61.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `MediaType`
- `SelectionMode`
- `HasFilters`
- `HasUploadAction`
- `Grouping`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 61.5 Componentes permitidos

- Thumbnail
- Media Card
- Filter Chips
- Selection Toolbar
- Pagination
- Upload Button

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 61.6 Estados representados

- `Content`
- `Empty`
- `Loading`
- `Loading More`
- `Error`
- `Offline Cache`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 61.7 Responsividade

2 colunas mobile conforme thumbnail mínima; grid expande progressivamente até desktop.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 61.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 61.9 Protótipo mínimo

Abrir, selecionar, comparar, filtrar, enviar.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 61.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 61.11 Anti-patterns

- thumbnails pequenas demais; proporções caóticas sem crop rule; revelar mídia sensível no discreto;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 61.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 62. T30 — Visualizador e Comparação de Mídia

### 62.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T30 Visualizador e Comparação de Mídia` |
| Template Body | `Body/T30 Visualizador e Comparação de Mídia` |
| Categoria | Mídia |
| Shells compatíveis | S1, S2, S3 |
| Status inicial | `Candidate` até validação em fluxo real |

### 62.2 Propósito e justificativa

Este template existe para visualizar mídia ampliada, metadados e comparação lado a lado. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 62.3 Anatomia e ordem de layers

1. `01 Viewer Header`
2. `02 Primary Media`
3. `03 Comparison Media`
4. `04 Controls`
5. `05 Metadata`
6. `06 Timeline Navigation`
7. `07 Close or Back`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 62.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `ViewerMode`
- `ComparisonMode`
- `HasMetadata`
- `HasTimelineNav`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 62.5 Componentes permitidos

- Media Viewer
- Comparison Slider
- Metadata Panel
- Icon Button
- Thumbnail Strip

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 62.6 Estados representados

- `Content`
- `Loading`
- `Error`
- `Unavailable`
- `Restricted`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 62.7 Responsividade

Mobile usa swipe ou alternância; desktop permite lado a lado e painel de metadados.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 62.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 62.9 Protótipo mínimo

Navegar, zoom, comparar, fechar, abrir metadados.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 62.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 62.11 Anti-patterns

- controles sem label; zoom como única forma de acessar detalhe; imagens diferentes em escala sem aviso;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 62.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 63. T31 — Upgrade e Paywall

### 63.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T31 Upgrade e Paywall` |
| Template Body | `Body/T31 Upgrade e Paywall` |
| Categoria | Monetização |
| Shells compatíveis | S1, S2, S3, S5 |
| Status inicial | `Candidate` até validação em fluxo real |

### 63.2 Propósito e justificativa

Este template existe para comunicar valor Premium no contexto de uso com comparação ética e retorno claro. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 63.3 Anatomia e ordem de layers

1. `01 Value Header`
2. `02 Context Benefit`
3. `03 Feature Summary`
4. `04 Plan or Price`
5. `05 Primary Action`
6. `06 Restore Action`
7. `07 Back Action`
8. `08 Legal Notes`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 63.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `PaywallType`
- `HasComparison`
- `HasRestore`
- `HasTrial`
- `Context`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 63.5 Componentes permitidos

- Premium Badge
- Feature List
- Plan Card
- Button
- Restore Link
- Legal Text

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 63.6 Estados representados

- `Content`
- `Processing`
- `Error`
- `Success`
- `Unavailable`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 63.7 Responsividade

Mobile foca benefício e ação; desktop pode mostrar comparação sem criar excesso promocional.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 63.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 63.9 Protótipo mínimo

Assinar, restaurar, aplicar cupom quando previsto, retornar.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 63.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 63.11 Anti-patterns

- dark pattern; ação de fechar escondida; contador falso; Premium com cor semântica de sucesso;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 63.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 64. T32 — Gestão de Assinatura

### 64.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T32 Gestão de Assinatura` |
| Template Body | `Body/T32 Gestão de Assinatura` |
| Categoria | Monetização |
| Shells compatíveis | S1, S2, S3 |
| Status inicial | `Candidate` até validação em fluxo real |

### 64.2 Propósito e justificativa

Este template existe para mostrar plano atual, cobrança, benefícios, histórico e ações de gestão. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 64.3 Anatomia e ordem de layers

1. `01 Page Header`
2. `02 Current Plan`
3. `03 Billing Summary`
4. `04 Benefits`
5. `05 Payment or Store Info`
6. `06 History`
7. `07 Management Actions`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 64.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `SubscriptionState`
- `HasHistory`
- `HasPaymentInfo`
- `ManagementMode`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 64.5 Componentes permitidos

- Plan Card
- Badge
- List
- Banner
- Button
- Confirmation Modal

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 64.6 Estados representados

- `Active`
- `Trial`
- `Past Due`
- `Cancelled`
- `Loading`
- `Error`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 64.7 Responsividade

Mobile empilha; desktop pode separar plano e histórico.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 64.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 64.9 Protótipo mínimo

Ver detalhes, atualizar, cancelar, restaurar.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 64.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 64.11 Anti-patterns

- esconder cancelamento; status apenas por cor; misturar cobrança com dados clínicos;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 64.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 65. T33 — Administração de Coleções

### 65.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T33 Administração de Coleções` |
| Template Body | `Body/T33 Administração de Coleções` |
| Categoria | Admin |
| Shells compatíveis | S7 |
| Status inicial | `Candidate` até validação em fluxo real |

### 65.2 Propósito e justificativa

Este template existe para gerenciar conjuntos de recursos com busca, filtros, tabela, seleção e ações em lote. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 65.3 Anatomia e ordem de layers

1. `01 Admin Header`
2. `02 Breadcrumb`
3. `03 Toolbar`
4. `04 Data Table`
5. `05 Bulk Actions`
6. `06 Pagination`
7. `07 Audit Context`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 65.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `CollectionType`
- `SelectionMode`
- `HasBulkActions`
- `Density`
- `HasAuditContext`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 65.5 Componentes permitidos

- Data Table
- Search Field
- Filter Group
- Bulk Action Bar
- Pagination
- Audit Badge

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 65.6 Estados representados

- `Content`
- `Empty`
- `Loading`
- `Error`
- `Processing`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 65.7 Responsividade

Tablet reduz colunas não essenciais; desktop usa densidade compacta e tabela responsiva.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 65.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 65.9 Protótipo mínimo

Buscar, selecionar, editar, executar ação em lote, abrir auditoria.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 65.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 65.11 Anti-patterns

- admin com componentes paralelos; ações em lote sem confirmação; tabela ilegível no tablet;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 65.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 66. T34 — Administração de Política ou Configuração

### 66.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T34 Administração de Política ou Configuração` |
| Template Body | `Body/T34 Administração de Política ou Configuração` |
| Categoria | Admin |
| Shells compatíveis | S7 |
| Status inicial | `Candidate` até validação em fluxo real |

### 66.2 Propósito e justificativa

Este template existe para editar políticas e configurações administrativas com impacto, versão e auditoria explícitos. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 66.3 Anatomia e ordem de layers

1. `01 Admin Header`
2. `02 Breadcrumb`
3. `03 Policy Summary`
4. `04 Configuration Form`
5. `05 Impact Notice`
6. `06 Version Context`
7. `07 Actions`
8. `08 Audit Trail`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 66.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `PolicyType`
- `HasImpactNotice`
- `HasVersionContext`
- `HasAuditTrail`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 66.5 Componentes permitidos

- Form Pattern
- Banner
- Version Badge
- Audit Timeline
- Button
- Confirmation Modal

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 66.6 Estados representados

- `Default`
- `Validation Error`
- `Saving`
- `Error`
- `Success`
- `Conflict`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 66.7 Responsividade

Formulário central com contexto lateral; em tablet tudo reflowa para uma coluna.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 66.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 66.9 Protótipo mínimo

Editar, revisar impacto, salvar, resolver conflito.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 66.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 66.11 Anti-patterns

- salvar silenciosamente; ausência de versão; campo sem owner; alteração sem trilha;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 66.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.

## 67. T35 — Consulta de Auditoria

### 67.1 Identificação do asset

| Campo | Definição |
| --- | --- |
| Screen Template | `Screen/T35 Consulta de Auditoria` |
| Template Body | `Body/T35 Consulta de Auditoria` |
| Categoria | Admin |
| Shells compatíveis | S7 |
| Status inicial | `Candidate` até validação em fluxo real |

### 67.2 Propósito e justificativa

Este template existe para consultar eventos imutáveis por ator, período, recurso e correlação. Sua composição deve preservar uma pergunta ou tarefa principal e impedir que telas do mesmo arquétipo sejam montadas com hierarquias diferentes.

### 67.3 Anatomia e ordem de layers

1. `01 Admin Header`
2. `02 Breadcrumb`
3. `03 Audit Filters`
4. `04 Event Table`
5. `05 Event Detail`
6. `06 Correlation Context`
7. `07 Export Action`

A ordem acima é semântica e deve permanecer estável. No desktop, algumas regiões podem ocupar colunas paralelas, mas a leitura e o foco seguem a sequência documentada.

### 67.4 Component properties

- `Viewport=Mobile|Tablet|Desktop`, limitado aos viewports compatíveis.
- `ContentMode=Content|GlobalState`, quando o template admite estado global.
- `AuditScope`
- `HasDetailPanel`
- `HasExport`
- `Density`

Theme e Context não são properties de variant. Eles são herdados por variables/modes. Properties de spacing, cor, radius, largura arbitrária ou ordem de conteúdo são proibidas.

### 67.5 Componentes permitidos

- Data Table
- Filter Group
- Detail Panel
- Badge
- Export Action
- Code-like Data Text

Substituições usam instance swap com preferred values. Componentes locais, detached ou não publicados não podem entrar no main component.

### 67.6 Estados representados

- `Content`
- `Empty`
- `Loading`
- `Error`
- `Restricted`

Estados globais usam `ContentMode=GlobalState`. Estados parciais são demonstrados na zona de QA sem transformar toda combinação em variant.

### 67.7 Responsividade

Tablet mostra detalhe em overlay; desktop permite painel lateral persistente.

A variant Mobile é a referência de prioridade. Tablet e Desktop podem redistribuir regiões, mas não podem introduzir conteúdo essencial inexistente no mobile.

### 67.8 Conteúdo demonstrativo

A Section do template deve apresentar:

- cenário default realista;
- conteúdo curto e longo;
- número mínimo e máximo plausível de itens;
- estado sem dados;
- dado ausente ou não aplicável;
- Dark e Light;
- Core, Grow e Med quando o template for transversal;
- texto ampliado e locale expandido;
- Modo Discreto ou privacidade quando houver conteúdo sensível.

### 67.9 Protótipo mínimo

Filtrar, abrir evento, copiar identificador, exportar quando permitido.

O protótipo deve demonstrar comportamento e recuperação de estado, não inventar transições não aprovadas no fluxo.

### 67.10 Annotations para handoff

Registrar no asset:

- shell e viewport;
- ordem de foco;
- scroll principal;
- regiões sticky ou persistentes;
- estados globais e parciais;
- regras de truncamento;
- componentes substituíveis;
- condição de exibição das regiões opcionais;
- evento ou ação principal sem descrever implementação técnica.

### 67.11 Anti-patterns

- editar evento; ocultar timezone; cortar identificador sem acesso ao valor completo;
- alterar gaps ou padding em instância;
- duplicar o template para Grow ou Med;
- usar cor como único indicador de estado;
- incluir dados reais ou sensíveis na library;
- destacar a instância para acomodar uma tela;
- converter região opcional em elemento permanente sem revisão.

### 67.12 Critérios de aceite

- [ ] Screen e Body usam apenas componentes publicados.
- [ ] Nested Shell está correto em cada viewport.
- [ ] Main content possui prioridade clara.
- [ ] Uma única ação primária é preservada por superfície.
- [ ] Estados relevantes estão representados.
- [ ] Dark/Light e context modes não exigem variantes duplicadas.
- [ ] Layout passa pelos stress widths.
- [ ] Conteúdo longo e texto ampliado não quebram a estrutura.
- [ ] Foco, scroll e regions persistentes estão anotados.
- [ ] Instância pode ser usada sem detach.
- [ ] Description, owner, version e link documental estão preenchidos.


# PARTE XI — USO, PUBLICAÇÃO E HANDOFF

## 68. Catálogo e página de descoberta

A página `01 — Read Me` deve oferecer um catálogo visual dos templates por tarefa, não apenas por código. Cada entrada contém:

- nome;
- propósito em uma frase;
- arquétipo de UX relacionado;
- shells compatíveis;
- preview mobile e desktop;
- estados suportados;
- link para o main component;
- link para o documento 04;
- status e versão.

### 68.1 Filtros conceituais do catálogo

- Entrada;
- Registro;
- Leitura;
- Coleção;
- Acompanhamento;
- Análise;
- Decisão;
- Comunidade;
- Privacidade;
- Monetização;
- Administração.

### 68.2 Descoberta por problema

O catálogo deve responder perguntas como:

- “Preciso criar um recurso em uma etapa ou várias?”
- “Preciso apresentar uma coleção visual ou textual?”
- “O usuário está lendo dados, comparando ou tomando uma decisão?”
- “A tela pertence a um fluxo focado ou à navegação principal?”

## 69. Starter frames

Starter Frames são exemplos duplicáveis. Eles vivem ao lado dos templates, mas não são publicados como components.

### 69.1 Conteúdo obrigatório

- nome do template;
- instrução curta de uso;
- instance oficial inserida;
- exemplo de conteúdo sintético;
- notas sobre properties mais usadas;
- links para telas reais aprovadas;
- aviso explícito para não editar o main component.

### 69.2 Starter matrix

Para cada template relevante, oferecer:

- mobile default;
- desktop default;
- empty ou first-use;
- error ou offline quando crítico;
- Grow e Med apenas como modes do mesmo asset.

### 69.3 Limite

Starter não pode conter componentes locais ou estrutura mais recente que o main component. Se o starter parecer melhor que o template, a correção deve subir para o sistema.

## 70. Fluxo para criar uma tela real

1. confirmar o fluxo e o arquétipo no documento 10;
2. selecionar o template principal no documento 04;
3. inserir `Screen/Txx` pela Assets panel ou Quick Insert;
4. escolher `Viewport` correto;
5. aplicar Theme e Context modes no frame raiz;
6. configurar properties permitidas;
7. substituir conteúdo e nested instances autorizadas;
8. inserir dados sintéticos ou conteúdo aprovado;
9. configurar estados e protótipo;
10. executar QA responsivo, tema, contexto, conteúdo e acessibilidade;
11. adicionar annotations;
12. marcar frame `Ready for review`;
13. após aprovação, marcar `Ready for dev` conforme processo do documento 05.

### 70.1 Nome da tela real

`[Módulo] / [Fluxo] / [Tela] / [Estado] / [Viewport]`

Exemplo conceitual:

`Grow / Ciclo / Dashboard / Default / Mobile`

O nome não deve incluir versão visual informal como `novo`, `final`, `final2` ou nome do designer.

## 71. Substituição de conteúdo e componentes

### 71.1 Permitido

- textos via text properties;
- ícones via instance swap com preferred values;
- cards e gráficos compatíveis;
- regiões opcionais via boolean;
- estados via property controlada;
- dados e imagens sintéticas ou autorizadas.

### 71.2 Proibido

- remover Page Header obrigatório;
- alterar ordem estrutural;
- alterar padding e gap;
- trocar shell por componente local;
- inserir novo padrão de navegação;
- alterar hierarquia de ações;
- usar nested component de outra library sem aprovação;
- destacar a instância para obter liberdade.

### 71.3 Quando a substituição não é suficiente

Registrar uma issue contendo:

- tela e fluxo;
- template usado;
- propriedade ausente;
- por que composição não resolve;
- impacto em outros contextos;
- proposta sem alterar regra de negócio;
- evidência de recorrência.

## 72. Prototipagem de jornadas

### 72.1 Organização de flows

Cada jornada de teste recebe um Flow Starting Point nomeado:

`FLOW / [Módulo] / [Jornada] / [Cenário]`

### 72.2 Cenários mínimos

- happy path;
- validação;
- erro recuperável;
- offline quando aplicável;
- permissão negada;
- Premium quando aplicável;
- Modo Discreto para conteúdo sensível;
- retorno e preservação de contexto.

### 72.3 Conexões

Conexões devem apontar para frames de telas reais ou starters, não para main components da library. Main components demonstram microcomportamento; jornadas vivem em arquivos de produto ou Playground.

### 72.4 Noodle control

Usar Sections por cenário e evitar cruzamento excessivo de conexões. Variáveis podem reduzir frames, mas a compreensão do protótipo tem prioridade sobre “economia” de canvas.

## 73. Annotations e Ready for dev

Cada tela pronta para engenharia deve indicar:

- template de origem e versão;
- componentes principais;
- variables/modes ativos;
- comportamento de scroll;
- regiões sticky;
- ordem de foco;
- estados não visíveis no frame default;
- conteúdo truncável e não truncável;
- comportamento responsivo;
- condições de permissão, privacidade ou Premium;
- links para fluxos e critérios de aceitação.

Não anotar valores que já estão corretamente representados por variables. A anotação explica intenção e comportamento, não duplica inspeção visual.

## 74. Publicação e atualização

### 74.1 Gate de publicação

Um template só pode ser publicado quando:

- o documento 04 autoriza sua estrutura;
- Shell, Body e Screen passam nos checklists;
- não existem detached nested instances;
- descriptions e links estão preenchidos;
- mudança foi testada em pelo menos uma tela consumidora;
- impacto em overrides foi avaliado;
- changelog explica o que mudou e quem deve revisar.

### 74.2 Atualização downstream

Product Designers devem revisar updates antes de aceitar em massa. Mudanças estruturais exigem amostra de telas reais, especialmente templates amplamente usados como Dashboard, Detail, Form e List.

### 74.3 Semver conceitual

- **Patch:** correção sem mudança estrutural ou de overrides.
- **Minor:** nova propriedade ou região opcional compatível.
- **Major:** mudança de anatomia, propriedade removida ou migração obrigatória.

## 75. Depreciação e migração

### 75.1 Processo

1. marcar template `Deprecated`;
2. remover recomendação do catálogo;
3. manter asset publicado durante a janela de migração;
4. indicar substituto na description;
5. mapear arquivos consumidores;
6. migrar telas prioritárias;
7. comunicar prazo;
8. despublicar somente após evidência de conclusão;
9. mover snapshot para Archive.

### 75.2 Proibição

Nunca excluir ou renomear main component de forma silenciosa. Isso quebra instâncias e elimina rastreabilidade.

## 76. Performance do arquivo

### 76.1 Práticas obrigatórias

- evitar imagens pesadas nos main components;
- usar thumbnails comprimidas nas zonas de exemplo;
- limitar profundidade de nesting;
- remover layers ocultas desnecessárias;
- não manter todas as matrizes dentro de cada component set;
- usar pages separadas para QA pesado;
- arquivar explorações antigas;
- evitar thousands de variants geradas mecanicamente.

### 76.2 Indicadores de alerta

- demora relevante ao inserir asset;
- painel de properties difícil de compreender;
- publicação excessivamente lenta;
- overrides que se perdem com frequência;
- component set com combinações inválidas;
- necessidade constante de deep select.

## 77. QA visual e funcional

### 77.1 Matriz mínima por template

| Dimensão | Casos mínimos |
| --- | --- |
| Viewport | mobile, tablet e desktop compatíveis |
| Width stress | menor e maior largura de cada categoria |
| Theme | Dark e Light |
| Context | Core, Grow e Med quando aplicável |
| Content | curto, longo, vazio, máximo plausível |
| State | default, loading, error e estados específicos |
| Accessibility | contraste, foco, texto ampliado, touch target |
| Locale | pt-BR e texto expandido |
| Privacy | privado, restrito ou discreto quando aplicável |
| Interaction | mouse, toque, teclado representado |

### 77.2 Regressão

Mudanças em Shell, Page Header, Navigation, Form Pattern, State Surface, Card, List, Chart ou Modal exigem regressão em templates dependentes.

# PARTE XII — GOVERNANÇA E CHECKLISTS

## 78. Anti-patterns gerais

- criar arquivo de templates por módulo;
- duplicar template para Dark ou Light;
- duplicar template para Grow ou Med;
- usar screenshots como template;
- publicar starter como main component;
- permitir slots livres sem preferred values;
- usar absolute positioning no conteúdo principal;
- modelar todos os estados como variants de tela;
- incluir componentes locais em main components;
- publicar sem description ou owner;
- usar conteúdo real e sensível;
- esconder informação essencial no mobile;
- criar desktop first e “espremer” para mobile;
- usar densidade compacta para compensar falta de hierarquia;
- destacar instância em tela final;
- alterar component master diretamente dentro de arquivo de produto;
- aceitar library update crítica sem revisão;
- criar template a partir de uma única exceção;
- confundir padrão de tela com fluxo de negócio.

## 79. Critérios para criar novo template

Um novo template só é autorizado quando:

1. nenhum T01–T35 resolve a tarefa;
2. composição entre templates existentes não é apropriada;
3. mudam hierarquia, regiões, ação principal e comportamento responsivo;
4. a necessidade aparece em mais de uma tela ou é estruturalmente inevitável;
5. não é apenas diferença de entidade, conteúdo ou contexto;
6. existe mapeamento com fluxo aprovado;
7. Component Library suporta os padrões necessários;
8. impacto de manutenção foi estimado;
9. Product Design, Design System e Engineering aprovam.

## 80. Processo de alteração

Toda alteração inclui:

- problema observado;
- templates e telas afetados;
- evidência;
- decisão superior relacionada;
- proposta;
- impacto em properties e overrides;
- impacto responsivo;
- impacto em temas e contextos;
- impacto em acessibilidade;
- plano de migração;
- versão e changelog.

## 81. Processo de exceção

Exceções recebem:

- identificador;
- owner;
- tela e fluxo;
- justificativa;
- duração;
- risco;
- workaround;
- data de revisão;
- decisão de incorporar, corrigir ou remover.

Uma exceção não cria precedente automático.

## 82. Auditoria periódica

A auditoria trimestral deve verificar:

- uso e adoção dos templates;
- instâncias destacadas;
- componentes locais em telas;
- templates não usados;
- duplicações;
- properties pouco compreendidas;
- regressões de tema;
- quebras responsivas;
- lacunas de estado;
- problemas de acessibilidade;
- diferenças entre documentação e Figma;
- diferenças entre Figma e implementação;
- assets depreciados ainda ativos.

## 83. Checklist de shell

- [ ] Nome, descrição, owner e versão corretos.
- [ ] Componentes oficiais e conectados.
- [ ] Content region controlada.
- [ ] Navegação e status global completos.
- [ ] Safe areas e scroll representados.
- [ ] Properties essenciais expostas.
- [ ] Tema e contexto por modes.
- [ ] Foco e leitura anotados.
- [ ] Stress widths aprovados.
- [ ] Sem dados reais.

## 84. Checklist de template body

- [ ] Regiões correspondem ao documento 04.
- [ ] Ordem semântica preservada.
- [ ] Auto Layout na raiz e regiões.
- [ ] Max-width embutido.
- [ ] Componentes permitidos apenas.
- [ ] Properties seguras e compreensíveis.
- [ ] Estados parciais demonstrados.
- [ ] Conteúdo curto, longo, vazio e máximo testado.
- [ ] Acessibilidade anotada.
- [ ] Sem navegação global duplicada.

## 85. Checklist de screen template

- [ ] Shell correto por viewport.
- [ ] Body correto e conectado.
- [ ] Até seis variants principais, salvo justificativa.
- [ ] ContentMode e GlobalState coerentes.
- [ ] Theme/Context não duplicados como variants.
- [ ] Screen pode ser usado sem detach.
- [ ] Scroll e persistent actions corretos.
- [ ] Description aponta para documentação.
- [ ] Prototype mínimo funcional.
- [ ] QA matrix aprovada.

## 86. Checklist de starter frame

- [ ] Usa instance oficial.
- [ ] Conteúdo é sintético e realista.
- [ ] Properties principais são explicadas.
- [ ] Não contém componentes locais.
- [ ] Não supera o main component com solução paralela.
- [ ] Possui link para o template e documentação.
- [ ] Está claramente marcado como duplicável e não publicável.

## 87. Checklist de tela real

- [ ] Fluxo e template estão identificados.
- [ ] Instância permanece conectada.
- [ ] Context e Theme modes corretos.
- [ ] Uma ação primária por superfície.
- [ ] Conteúdo real respeita limites.
- [ ] Estados necessários foram desenhados.
- [ ] Mobile, tablet e desktop foram avaliados conforme escopo.
- [ ] Privacidade e Modo Discreto foram testados.
- [ ] Foco, teclado e leitura foram anotados.
- [ ] Sem componentes locais ou exceções ocultas.
- [ ] Ready for dev contém links e critérios.

## 88. Checklist de publicação

- [ ] Versão definida.
- [ ] Changelog escrito.
- [ ] Alterações de overrides avaliadas.
- [ ] QA completo.
- [ ] Telas consumidoras de amostra atualizadas.
- [ ] Assets deprecated tratados.
- [ ] Descriptions e links válidos.
- [ ] Owner aprovou.
- [ ] Comunicação preparada.
- [ ] Plano de rollback disponível para mudança crítica.

## 89. Decisões consolidadas

1. A COSMARIA terá um único arquivo lógico de Screen Templates, dividido por pages e categorias.
2. Cada template existe em três camadas: Shell, Body e Screen.
3. Viewport é variant; Theme e Context são modes.
4. Estados globais usam ContentMode e State Surface controlada, evitando explosão de variants.
5. Templates publicados não podem exigir detach.
6. Slots, quando usados, são controlados por preferred values e limites documentados.
7. Starter Frames são pedagógicos e não publicados como library assets.
8. Telas reais permanecem conectadas ao Screen Template sempre que possível.
9. Conteúdo da library é sempre sintético.
10. Mobile define prioridade; desktop redistribui sem alterar semântica.
11. Acessibilidade, privacidade e estados são requisitos de publicação.
12. Nenhum template é duplicado por Core, Grow, Med, Dark ou Light.
13. Alterações estruturais exigem versionamento, teste downstream e migração.
14. A criação de um novo template é exceção governada, não decisão local.

## 90. Referências operacionais

As seguintes capacidades oficiais do Figma fundamentam a execução deste documento:

- variables e modes para representar temas e contextos;
- component properties para variantes, booleans, textos, instance swaps e slots;
- nested instances e preferred values para composição controlada;
- component sets e variants para viewports e mudanças estruturais;
- interactive components para comportamentos locais de protótipo;
- libraries para publicação e atualização downstream;
- descriptions e links para descoberta e documentação;
- Dev Mode e annotations para handoff.

Referências oficiais:

- Figma Help Center — Guide to variables: https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma
- Figma Help Center — Modes for variables: https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables
- Figma Help Center — Explore component properties: https://help.figma.com/hc/en-us/articles/5579474826519-Explore-component-properties
- Figma Help Center — Component property fundamentals: https://help.figma.com/hc/en-us/articles/39636407507735-Components-collection-Component-property-fundamentals
- Figma Help Center — Use slots to build flexible components: https://help.figma.com/hc/en-us/articles/38231200344599-Use-slots-to-build-flexible-components-in-Figma
- Figma Help Center — Create and use variants: https://help.figma.com/hc/en-us/articles/360056440594-Create-and-use-variants
- Figma Help Center — Create interactive components: https://help.figma.com/hc/en-us/articles/360061175334-Create-interactive-components-with-variants
- Figma Help Center — Guide to libraries: https://help.figma.com/hc/en-us/articles/360041051154-Guide-to-libraries-in-Figma
- Figma Help Center — Publish a library: https://help.figma.com/hc/en-us/articles/360025508373-Publish-a-library
- Figma Help Center — Review library updates: https://help.figma.com/hc/en-us/articles/360039234193-Review-and-accept-library-updates

## 91. Histórico

| Versão | Data | Alteração | Responsável |
| --- | --- | --- | --- |
| 1.0 | 2026-07-12 | Criação da especificação oficial dos Figma Screen Templates | Product Design / Design System |

---

**Fim do documento `06-figma-screen-templates.md`.**
