# 05 — Figma Component Library da Plataforma COSMARIA

> **Nome oficial:** Manual de Construção e Governança da Biblioteca COSMARIA no Figma  
> **Status:** Versão 1.0 — especificação normativa inicial.  
> **Data:** 2026-07-12.  
> **Autoridade:** subordinado ao `../11-design-system.md`, `01-visual-language.md`, `02-ui-kit.md`, `03-component-library.md` e `04-screen-templates.md`.  
> **Escopo:** tradução operacional das fundações, componentes e templates oficiais para uma biblioteca publicável, auditável e escalável no Figma.  
> **Natureza:** documentação de construção, organização, publicação, manutenção e handoff. Não redefine produto, fluxo, regra de negócio, arquitetura de software ou direção artística.

---

## Índice

### PARTE I — AUTORIDADE E ARQUITETURA DA BIBLIOTECA

0. Propósito, autoridade e limites  
1. Princípios operacionais  
2. Arquitetura lógica e física  
3. Estrutura de team, project, files e libraries  
4. Papéis, permissões e ownership  
5. Estrutura oficial de páginas  
6. Organização do canvas e zonas de documentação  
7. Nomenclatura de arquivos, páginas, sections, frames e layers  
8. Nomenclatura de componentes e propriedades  
9. Taxonomia de status e maturidade  

### PARTE II — FOUNDATIONS NO FIGMA

10. Arquitetura de variables  
11. Collections e modes  
12. Aliases e cadeia de decisão  
13. Color variables  
14. Number variables  
15. String e boolean variables  
16. Text styles  
17. Effect styles  
18. Grid styles  
19. Icon library  
20. Regras para Dark, Light, Core, Grow e Med  

### PARTE III — ENGENHARIA DE COMPONENTES

21. Auto Layout  
22. Resizing e constraints  
23. Component sets e variants  
24. Component properties  
25. Nested instances, slots e preferred values  
26. Estados visuais e interativos  
27. Responsividade e densidade  
28. Acessibilidade representada no Figma  
29. Prototipagem de componentes  
30. Documentação embutida  
31. Critérios de qualidade do main component  

### PARTE IV — CATÁLOGO DE IMPLEMENTAÇÃO NO FIGMA

32. Primitivos  
33. Ações e formulários  
34. Navegação  
35. Dados e conteúdo  
36. Feedback e overlays  
37. Componentes especializados  
38. Relação com Screen Templates  

### PARTE V — WORKFLOW, PUBLICAÇÃO E HANDOFF

39. Fluxo de criação de um componente  
40. Revisão e QA  
41. Publicação da library  
42. Atualizações em arquivos consumidores  
43. Branching e revisão  
44. Versionamento e changelog  
45. Depreciação e migração  
46. Library analytics e adoção  
47. Dev Mode, annotations e Ready for dev  
48. Relação futura com componentes em código  
49. Performance e manutenção do arquivo  
50. Recuperação de incidentes  

### PARTE VI — GOVERNANÇA E CHECKLISTS

51. Anti-patterns gerais  
52. Checklist de foundations  
53. Checklist de componente  
54. Checklist de publicação  
55. Checklist de atualização crítica  
56. Checklist de handoff  
57. Auditoria periódica  
58. Decisões consolidadas  
59. Histórico

---

# PARTE I — AUTORIDADE E ARQUITETURA DA BIBLIOTECA

## 0. Propósito, autoridade e limites

Este documento define **como a COSMARIA deve existir dentro do Figma**. Os documentos 11, 01, 02, 03 e 04 determinam o que o sistema é; este documento determina como esse sistema será construído, publicado, encontrado, reutilizado, revisado e entregue para desenvolvimento.

A hierarquia obrigatória é:

**Produto e fluxos → Design System → Visual Language → UI Kit → Component Library → Screen Templates → Figma Component Library → Telas específicas → Implementação.**

O Figma não é a fonte de regras de negócio. Ele é a representação operacional das decisões aprovadas. Uma propriedade criada no Figma não autoriza uma nova variante de produto. Um componente visualmente possível não se torna oficial sem existir na documentação superior.

### 0.1 O que este documento define

- topologia dos arquivos e libraries;
- collections, modes, variables, styles e aliases;
- convenções de nomes;
- uso de Auto Layout, constraints e resizing;
- construção de component sets e propriedades;
- tradução das 70 famílias oficiais para artefatos Figma;
- documentação interna da library;
- processo de revisão, publicação, atualização e depreciação;
- preparação para Dev Mode e integração futura com código;
- critérios de qualidade, auditoria e ownership.

### 0.2 O que este documento não define

- novos componentes;
- novos templates;
- novas telas;
- alterações de tokens;
- valores cromáticos alternativos;
- regras de negócio;
- APIs, entidades ou permissões;
- estrutura de componentes no código;
- framework de frontend.

### 0.3 Regra de precedência

Quando houver conflito:

1. a regra de negócio e o fluxo vencem qualquer conveniência visual;
2. a Constituição Visual vence uma interpretação local de estilo;
3. o UI Kit e a Component Library vencem uma composição improvisada;
4. o Screen Template vence a composição livre de tela;
5. este documento vence preferências individuais sobre organização no Figma.

Uma limitação técnica do Figma deve ser registrada. Ela não pode ser ocultada por uma solução paralela sem governança.

### 0.4 Status da escolha de ferramenta

O Figma é a ferramenta assumida por este documento, mas nenhum documento 00–15 registrou formalmente essa escolha (nem alternativas comparadas, nem aprovação explícita — doc 00 §16 item 1). Isso não invalida o documento — ferramenta de design é decisão de baixo risco e reversível —, mas a escolha do Figma em si, e de qualquer plano pago necessário para os recursos descritos na seção 3.3, permanece pendente de confirmação fora deste documento. A biblioteca de componentes real da plataforma vive em `libs/shared/ui-components` (React Native, doc 14 §9) — o Figma é a camada de design que antecede essa implementação, e a sincronização entre os dois permanece manual até que uma ferramenta de Code Connect ou equivalente seja avaliada (seção 48).

## 1. Princípios operacionais

### 1.1 Um sistema lógico, arquivos físicos modulares

A COSMARIA possui **uma única biblioteca lógica**, mas não deve concentrar todos os ativos em um único arquivo. A divisão física reduz tempo de carregamento, conflitos, risco de publicação acidental e dependência entre equipes.

A unidade é garantida por:

- taxonomia comum;
- variables compartilhadas;
- nomenclatura única;
- ownership central;
- dependências unidirecionais;
- governança única;
- changelog coordenado.

### 1.2 Foundations antes de components

Nenhum componente pode possuir valor visual local quando esse valor existe como variable ou style. O componente deve consumir a decisão sistêmica, não duplicá-la.

### 1.3 Propriedade antes de duplicação

Uma diferença legítima deve ser modelada como:

1. mode, quando muda um contexto global de valores;
2. variant property, quando muda estrutura, hierarquia, tamanho ou estado;
3. boolean property, quando uma região opcional aparece ou desaparece;
4. text property, quando o conteúdo textual é editável;
5. instance swap, quando um subcomponente aprovado pode ser substituído;
6. novo componente, somente quando a semântica e o comportamento realmente mudam.

### 1.4 Tema não é variant

Dark e Light são resolvidos por variables e modes. Não se criam variantes `Theme=Dark/Light` em cada component set. Essa proibição reduz exponencialmente a matriz de variantes e evita divergência entre temas.

### 1.5 Contexto não é cópia

Core, Grow e Med usam o mesmo main component. O contexto é aplicado por collection/mode de accent e por conteúdo. Componentes `Grow/Button` e `Med/Button` são proibidos.

### 1.6 Estado não é cor local

Estados semânticos consomem variables de feedback. Nenhuma variante define manualmente uma cor para simular erro, sucesso ou atenção.

### 1.7 Instance deve permanecer conectada

Detach é considerado falha de sistema, exceto em experimentos isolados que nunca serão entregues ou publicados. Se a instância precisa ser destacada para funcionar, o componente ou template está incompleto.

### 1.8 Documentation is part of the asset

Todo componente publicado deve possuir nome, descrição, link para documentação, propriedades compreensíveis, exemplo válido e responsável. Um ativo sem documentação é incompleto, mesmo que visualmente correto.

## 2. Arquitetura lógica e física

### 2.1 Libraries oficiais

| Código | Arquivo | Conteúdo | Publicação | Dependências |
| --- | --- | --- | --- | --- |
| `F01` | `COSMARIA — Foundations` | Variables, styles, grids, effects e documentação de tokens | Sim | Nenhuma library COSMARIA |
| `F02` | `COSMARIA — Icons` | Ícones oficiais e documentação iconográfica | Sim | `F01` |
| `F03` | `COSMARIA — Components` | 70 famílias oficiais e componentes auxiliares privados | Sim | `F01`, `F02` |
| `F04` | `COSMARIA — Templates` | Shells e templates do documento 04 | Sim, para equipe de produto | `F01`, `F02`, `F03` |
| `F05` | `COSMARIA — Playground & QA` | Cenários, stress tests, testes de tema, locale e acessibilidade | Não | Todas |
| `F06` | `COSMARIA — Product Screens` | Telas reais organizadas por módulo e entrega | Não como library | Todas |
| `F07` | `COSMARIA — Archive` | Ativos descontinuados, snapshots e evidências de migração | Nunca | Nenhuma dependência ativa |

### 2.2 Justificativa da divisão

- **Foundations** muda menos e deve ser protegida por ownership mais restrito.
- **Icons** possui grande volume de assets e ciclo de manutenção próprio.
- **Components** é a principal library de consumo e precisa carregar sem documentação excessiva de templates.
- **Templates** evolui com composição de tela, mas não pode alterar componentes.
- **Playground & QA** concentra testes sem poluir assets publicados.
- **Product Screens** consome o sistema, mas não publica componentes locais.
- **Archive** preserva rastreabilidade sem manter itens obsoletos no Assets panel.

### 2.3 Dependência unidirecional

A cadeia permitida é:

`F01 → F02 → F03 → F04 → F06`

`F05` pode consumir todas para teste. Nenhuma library anterior pode consumir uma posterior. Circularidade é proibida porque cria atualizações imprevisíveis e impede isolamento de falhas.

## 3. Estrutura de team, project, files e libraries

### 3.1 Estrutura recomendada

**Team:** `COSMARIA Product`  
**Project:** `00 — Design System`  
**Project:** `01 — Product Design`  
**Project:** `02 — Research & Validation`  
**Project:** `99 — Archive`

No projeto `00 — Design System` ficam `F01` a `F05`. No projeto `01 — Product Design` ficam `F06` e arquivos de exploração aprovados. Arquivos pessoais ou rascunhos não entram no projeto do sistema até passarem por triagem.

### 3.2 Ordem dos arquivos

O prefixo numérico é obrigatório para preservar a ordem:

- `01 — Foundations`
- `02 — Icons`
- `03 — Components`
- `04 — Templates`
- `05 — Playground & QA`

O nome exibido pode incluir `COSMARIA`, mas a ordem numérica deve permanecer.

### 3.3 Planos e capacidades

Algumas capacidades do Figma — como branching, analytics organizacionais, limites ampliados de modes ou certos recursos de Dev Mode — dependem do plano contratado. A governança não pode depender exclusivamente de uma capacidade não disponível. Este documento define um caminho principal e um fallback operacional quando necessário.

## 4. Papéis, permissões e ownership

| Papel | Permissões | Responsabilidade |
| --- | --- | --- |
| Design System Owner | Editar e publicar todas as libraries | Integridade sistêmica e aprovação final |
| Foundations Maintainer | Editar `F01` | Variables, styles, aliases e modes |
| Component Maintainer | Editar `F02`–`F03` | Construção e QA de assets |
| Template Maintainer | Editar `F04` | Composição conforme documento 04 |
| Product Designer | Consumir libraries e propor mudanças | Telas, validação e evidências |
| Accessibility Reviewer | Comentar e aprovar | Contraste, foco, leitura e motion |
| Engineering Reviewer | Dev Mode, comentários e aprovação | Viabilidade, nomenclatura e paridade |
| Viewer/Stakeholder | Visualizar e comentar | Revisão sem alteração estrutural |

### 4.1 Regra de publicação

Somente Design System Owner ou Maintainer explicitamente delegado pode publicar. Ter acesso de edição não implica autoridade para liberar atualizações downstream.

### 4.2 Regra de dupla revisão

Mudanças em foundations, componentes críticos, privacidade, IA, Med clínico ou assinatura exigem pelo menos:

- revisão de Design System;
- revisão de produto ou domínio;
- revisão de acessibilidade quando a mudança afetar interação, contraste ou leitura;
- revisão de engenharia quando houver alteração de contrato.

## 5. Estrutura oficial de páginas

### 5.1 `F01 — Foundations`

1. `00 — Cover & Status`
2. `01 — How to use`
3. `02 — Variables overview`
4. `03 — Color primitives`
5. `04 — Color semantics`
6. `05 — Accent contexts`
7. `06 — Spacing & sizing`
8. `07 — Radius & border`
9. `08 — Opacity & elevation`
10. `09 — Typography`
11. `10 — Grid`
12. `11 — Motion reference`
13. `90 — QA matrices`
14. `99 — Deprecated`

### 5.2 `F02 — Icons`

1. `00 — Cover & Status`
2. `01 — Rules`
3. `02 — Navigation`
4. `03 — Actions`
5. `04 — Feedback`
6. `05 — Grow domain`
7. `06 — Med domain`
8. `07 — Privacy`
9. `08 — AI`
10. `09 — Premium`
11. `90 — QA`
12. `99 — Deprecated`

### 5.3 `F03 — Components`

1. `00 — Cover & Status`
2. `01 — Contribution guide`
3. `02 — Primitives`
4. `03 — Actions`
5. `04 — Form controls`
6. `05 — Navigation`
7. `06 — Data & content`
8. `07 — Feedback`
9. `08 — Overlays`
10. `09 — AI`
11. `10 — Privacy`
12. `11 — Premium`
13. `90 — QA matrices`
14. `98 — Internal helpers`
15. `99 — Deprecated`

### 5.4 `F04 — Templates`

Páginas seguem a taxonomia T01–T35 do documento 04, agrupadas por finalidade. Cada template aparece como component ou component set apenas quando a reutilização no Figma for estável; exemplos não publicáveis ficam em sections de documentação.

### 5.5 Regra de página

Páginas classificam o tipo de asset. Sections classificam famílias. Frames documentam assets. Não se criam páginas por sprint, pessoa, plataforma ou estado.

## 6. Organização do canvas e zonas de documentação

Cada página de componentes utiliza a seguinte ordem horizontal, da esquerda para a direita:

1. **Overview:** propósito e regras da família.
2. **Main components:** component sets publicados.
3. **Anatomy:** partes nomeadas.
4. **Properties:** variants e component properties.
5. **States:** matriz completa.
6. **Themes:** Dark e Light.
7. **Contexts:** Core, Grow e Med.
8. **Responsive:** tamanhos e reflow.
9. **Accessibility:** foco, texto ampliado e annotations.
10. **Content stress:** labels curtas, longas e locales.
11. **Do / Don’t:** usos aprovados e anti-patterns.
12. **Changelog:** versão e decisões.

### 6.1 Sections oficiais

Sections usam prefixos:

- `DOC —` documentação;
- `MAIN —` componentes publicados;
- `QA —` testes;
- `WIP —` trabalho em andamento;
- `DEP —` depreciação.

Apenas ativos dentro de `MAIN —` podem ser publicados.

### 6.2 Cover e status

A capa de cada arquivo mostra:

- nome da library;
- versão vigente;
- última publicação;
- status de estabilidade;
- owners;
- dependências;
- link para documentação;
- riscos ou migrações ativas.

## 7. Nomenclatura de arquivos, páginas, sections, frames e layers

### 7.1 Regra geral

Nomes descrevem **o que o elemento é**, não sua aparência atual. `Button/Primary` é válido; `GreenButton` é proibido. Slash cria hierarquia apenas quando melhora busca e agrupamento.

### 7.2 Idioma

Nomes técnicos de assets, properties e layers usam **inglês controlado**, alinhado aos documentos 02 e 03. Documentação explicativa pode permanecer em português. Isso facilita handoff, busca, eventual Code Connect e colaboração internacional.

### 7.3 Layers estruturais

Layers internas usam nomes semânticos:

- `Container`
- `Leading`
- `Content`
- `Label`
- `Supporting text`
- `Value`
- `Metadata`
- `Trailing`
- `Actions`
- `Focus ring`
- `State layer`

Nomes como `Frame 123`, `Group 7`, `Rectangle 4` ou `Vector 18` são proibidos em main components.

### 7.4 Prefixos privados

Componentes auxiliares que não devem ser publicados começam com `_`:

- `_State layer`
- `_Field container`
- `_Chart axis`
- `_Scrim`

O prefixo indica implementação interna, não menor qualidade.

## 8. Nomenclatura de componentes e propriedades

### 8.1 Nome do component set

Formato:

`Category/Component`

Exemplos:

- `Action/Button`
- `Form/Text field`
- `Navigation/Tabs`
- `Data/Entity card`
- `Feedback/Banner`
- `AI/Explainability card`
- `Privacy/Visibility selector`

### 8.2 Variant properties oficiais

Usar apenas quando a diferença altera uma dimensão discreta e aprovada:

- `Type`
- `Hierarchy`
- `Size`
- `State`
- `Tone`
- `Orientation`
- `Placement`
- `Density`
- `Selection`
- `Progress`
- `Layout`

Não criar sinônimos como `Style`, `Kind`, `Mode` ou `Status` para o mesmo conceito.

### 8.3 Valores oficiais

- Tamanhos: `Small`, `Medium`, `Large`.
- Estados: `Default`, `Hover`, `Focus`, `Pressed`, `Selected`, `Disabled`, `Loading`, `Read-only`, `Error`, `Warning`, `Success` quando aplicáveis.
- Tons: `Neutral`, `Info`, `Success`, `Warning`, `Critical`, `Premium`, `Private`.
- Orientação: `Horizontal`, `Vertical`.
- Densidade: `Comfortable`, `Compact`.

### 8.4 Boolean properties

Começam com verbo `Show` ou adjetivo claro:

- `Show leading icon`
- `Show trailing icon`
- `Show supporting text`
- `Show metadata`
- `Show actions`
- `Dismissible`
- `Full width`

### 8.5 Text properties

Usam o nome do slot:

- `Label`
- `Title`
- `Description`
- `Supporting text`
- `Value`
- `Metadata`
- `Placeholder`
- `Action label`

### 8.6 Instance swap properties

Usam o papel, não o nome do ícone padrão:

- `Leading icon`
- `Trailing icon`
- `Media`
- `Avatar`
- `Status badge`
- `Action`
- `Empty state illustration`

### 8.7 Ordem das properties

A ordem padrão no painel é:

1. Type/Hierarchy;
2. Size/Density/Layout;
3. State/Tone;
4. text properties;
5. boolean properties;
6. instance swaps;
7. propriedades raras ou avançadas.

## 9. Taxonomia de status e maturidade

| Status | Significado | Publicável |
| --- | --- | --- |
| `Exploration` | hipótese sem contrato fechado | Não |
| `Draft` | anatomia e propriedades em construção | Não |
| `Review` | pronto para QA multidisciplinar | Não |
| `Candidate` | aprovado, aguardando janela de publicação | Não |
| `Stable` | ativo oficial | Sim |
| `Deprecated` | uso novo proibido; migração em curso | Oculto quando possível |
| `Archived` | removido do sistema ativo | Não |

A maturidade aparece na documentação e no changelog, nunca como parte do nome público do componente.

# PARTE II — FOUNDATIONS NO FIGMA

## 10. Arquitetura de variables

Variables representam valores atômicos e semânticos que precisam ser reutilizados, alterados por contexto ou inspecionados no handoff.

### 10.1 Tipos permitidos

- **Color:** paleta, superfícies, conteúdo, bordas, feedback, accent e data visualization.
- **Number:** spacing, size, radius, border width, opacity e referências de motion.
- **String:** uso restrito a protótipos, amostras e metadados; não substitui content design.
- **Boolean:** uso restrito a protótipos e demonstrações; não controla a existência oficial de variantes.

### 10.2 Primitivo versus semântico

- Primitive responde: “qual é o valor?”
- Semantic responde: “qual é a função?”
- Component responde: “onde essa função é aplicada?”

Componentes nunca consomem primitive diretamente quando existe semantic equivalente.

## 11. Collections e modes

### 11.1 Collections oficiais

| Collection | Tipo principal | Modes | Finalidade |
| --- | --- | --- | --- |
| `Color/Primitive` | Color | Default | Valores crus aprovados |
| `Color/Theme` | Color | Dark, Light | Fundos, superfícies, conteúdo, bordas e feedback por tema |
| `Color/Context` | Color | Core, Grow, Med | Accent e identidade de contexto |
| `Color/Data` | Color | Dark, Light | Séries, escalas e visualização de dados |
| `Dimension/Scale` | Number | Default | Spacing, size, radius e border width |
| `Dimension/Density` | Number | Comfortable, Compact | Alturas e paddings que legitimamente mudam por densidade |
| `Opacity/Semantic` | Number | Dark, Light | Disabled, scrim, overlay e state layers |
| `Motion/Reference` | Number | Default, Reduced | Durações de referência para protótipos e handoff |

### 11.2 Por que Theme e Context são separados

Um frame precisa poder ser simultaneamente `Dark + Grow` ou `Light + Med`. Se tema e contexto fossem modes da mesma collection, seriam mutuamente exclusivos. Collections separadas permitem composição sem duplicar variables.

### 11.3 O que não vira mode

- estado de componente;
- Premium;
- privacidade;
- Modo Discreto;
- breakpoint;
- plataforma;
- idioma;
- etapa do fluxo.

Esses conceitos mudam estrutura, conteúdo ou comportamento e devem ser tratados por properties, templates ou dados.

## 12. Aliases e cadeia de decisão

A cadeia obrigatória é:

`Primitive → Semantic Theme/Context/Data → Component property`.

Exemplo conceitual:

`green/600 → accent/default no mode Grow → background do Button Primary`.

### 12.1 Regras

- aliases devem ser preferidos a valores duplicados;
- semantic variables não recebem nome de cor;
- primitive variables não recebem nome funcional;
- alteração de primitive exige auditoria de todos os aliases;
- componente não cria variable local para substituir decisão global;
- aliases circulares são proibidos.

## 13. Color variables

### 13.1 Estrutura de nomes

- `primitive/neutral/950`
- `primitive/grow/600`
- `theme/background/base`
- `theme/background/surface`
- `theme/content/primary`
- `theme/content/secondary`
- `theme/border/default`
- `theme/feedback/critical`
- `context/accent/default`
- `context/accent/hover`
- `data/series/01`

### 13.2 Estados de interação

Estados de hover, pressed, selected e focus devem usar variables semânticas ou cálculos aprovados. Não usar ajuste manual de opacidade em cada component set.

### 13.3 Contraste

Toda combinação publicada deve existir em matriz de contraste no `F05 — Playground & QA`. O Figma representa a intenção; a aprovação exige verificação objetiva nos pares de uso reais.

## 14. Number variables

### 14.1 Grupos

- `space/*`
- `size/*`
- `radius/*`
- `border/*`
- `opacity/*`
- `elevation/*` como referência numérica quando aplicável
- `motion/duration/*` como referência

### 14.2 Aplicação

Number variables devem alimentar padding, gap, dimensões, radius e border width sempre que a propriedade do Figma permitir. Onde Figma não aceitar a variable, o valor deve corresponder exatamente ao token e ser documentado; não se cria valor alternativo.

## 15. String e boolean variables

String e boolean variables não são a fundação principal do sistema. Seu uso permitido:

- protótipos condicionais;
- demonstração de modes;
- exemplos de internacionalização;
- controle de propriedades em protótipos de validação.

Não devem armazenar texto final de produto, permissões, dados médicos ou regras de negócio.

## 16. Text styles

### 16.1 Text styles oficiais

Text styles representam papéis compostos de tipografia. Variables numéricas isoladas não substituem styles porque um papel tipográfico inclui família, peso, tamanho, line height, tracking e comportamento.

Estrutura:

- `Display/01`
- `Heading/Page`
- `Heading/Section`
- `Heading/Component`
- `Body/Emphasis`
- `Body/Default`
- `Body/Secondary`
- `Label/Default`
- `Label/Compact`
- `Caption/Default`
- `Data/Large`
- `Data/Default`
- `Data/Compact`

### 16.2 Regras

- uma layer de texto publicada deve usar style;
- override de peso ou line height local é proibido;
- `Data/*` usa números tabulares;
- text styles não variam por Core/Grow/Med;
- Dark/Light mudam cor por variable, não text style;
- nomes de styles não incluem tamanho em pixels.

## 17. Effect styles

Effect styles são restritos a elevações oficiais:

- `Elevation/00`
- `Elevation/01`
- `Elevation/02`
- `Elevation/03`
- `Focus/Default` quando tecnicamente adequado

Sombras decorativas, glow, neon e blur local são proibidos. No Dark Mode, a diferença entre planos deve depender principalmente de superfície e borda, não de sombras pesadas.

## 18. Grid styles

Grid styles oficiais:

- `Grid/Mobile`
- `Grid/Tablet`
- `Grid/Desktop`
- `Grid/Desktop/Wide`

Os styles existem para frames de templates e telas; não são aplicados em componentes locais. Breakpoints continuam sendo regras de layout, não variants de todo component set.

## 19. Icon library

### 19.1 Estrutura

Cada ícone é um component individual nomeado por função:

- `Icon/Navigation/Home`
- `Icon/Action/Add`
- `Icon/Feedback/Warning`
- `Icon/Grow/Environment`
- `Icon/Med/Treatment`
- `Icon/Privacy/Discrete`
- `Icon/AI/Insight`

### 19.2 Master size

O master recomendado é 24×24. Tamanhos 16, 20 e 32 são aplicados por containers e dimensionamento aprovado; versões ópticas separadas só existem quando a legibilidade comprovar necessidade.

### 19.3 Construção

- frame, não group;
- viewport quadrado;
- vetores alinhados ao pixel quando possível;
- cor ligada a variable ou herdada do parent;
- nenhum background embutido;
- bounds consistentes;
- nome acessível na documentação;
- ícones de seleção preenchidos somente quando a linguagem oficial exigir.

### 19.4 Uso em instance swap

Componentes consumidores expõem `Leading icon` ou `Trailing icon` com preferred values curados. O usuário não deve navegar por toda a library para descobrir alternativas válidas.

## 20. Regras para Dark, Light, Core, Grow e Med

### 20.1 Frames de documentação

Toda família publicada deve apresentar pelo menos:

- Dark + Core;
- Light + Core;
- Dark + Grow;
- Dark + Med;
- Light + Grow ou Med quando o accent tiver comportamento materialmente diferente.

### 20.2 Herdabilidade

Modes são definidos no frame de contexto e herdados por instâncias. Overrides locais de mode só são permitidos para demonstrar contraste ou componentes que realmente vivem em superfície diferente.

### 20.3 Proibição de duplicação

Não se criam main components por tema ou produto. Se um asset exige duplicação para funcionar em temas, a arquitetura de variables ou a anatomia precisa ser corrigida.

# PARTE III — ENGENHARIA DE COMPONENTES

## 21. Auto Layout

### 21.1 Obrigatoriedade

Todo componente de interface com conteúdo variável usa Auto Layout em seus containers relevantes. Exceções: vetores, gráficos desenhados por sistema próprio, ilustrações e elementos estritamente sobrepostos.

### 21.2 Regras

- direção reflete a ordem semântica de leitura;
- padding e gap usam variables oficiais;
- `Space between` só quando os extremos possuem relação estrutural estável;
- `Wrap` é permitido em chips, filtros e ações secundárias quando documentado;
- absolute position é restrito a state layer, badge sobreposto, scrim ou decoração não semântica;
- nesting excessivo deve ser evitado, mas nunca às custas de semântica ou resizing.

### 21.3 Ordem das layers

A ordem no Layers panel deve corresponder à ordem de leitura e foco sempre que possível. Reordenar visualmente sem reordenar semanticamente é proibido em componentes acessíveis.

## 22. Resizing e constraints

### 22.1 Contrato padrão

- Texto: `Hug contents` vertical; largura conforme componente.
- Button: `Hug contents`; opção full-width controlada pelo parent, não variant visual.
- Field: `Fill container` em formulários.
- Card: `Fill container` dentro de grid/lista; altura por conteúdo.
- Icon: fixed.
- List item: `Fill container`.
- Overlay: largura fixa dentro de faixa e responsiva por template.

### 22.2 Proibição de alturas frágeis

Altura fixa só é permitida para controles de uma linha, ícones, avatares, thumbnails e containers com clipping deliberado. Cards, banners, mensagens, campos multilinha e estados nunca usam altura fixa.

### 22.3 Min/max width

Quando o Figma suportar a propriedade relevante, usar min/max conforme template. Quando não suportar ou não for adequado, documentar o contrato no frame de componente e testar em larguras mínima, recomendada e máxima.

## 23. Component sets e variants

### 23.1 Quando usar variants

Use variant para diferenças discretas que o consumidor precisa escolher e que alteram estrutura ou estado reconhecível.

### 23.2 Quando não usar

Não usar variant para:

- conteúdo textual;
- presença de ícone;
- tema;
- contexto;
- largura arbitrária;
- cada valor de dado;
- combinações raras sem caso de uso aprovado.

### 23.3 Limite de complexidade

Um component set deve preferencialmente possuir no máximo quatro eixos de variant. Mais eixos exigem revisão porque elevam a matriz, dificultam busca e aumentam risco de combinações inválidas.

### 23.4 Combinações inválidas

Se eixos independentes produzem combinações semanticamente impossíveis, dividir a família ou substituir um eixo por property. Não manter variantes “mortas” apenas para completar uma matriz cartesiana.

## 24. Component properties

### 24.1 Tipos

- **Variant:** escolha discreta de estrutura/estado.
- **Boolean:** mostra ou oculta região opcional.
- **Text:** edita conteúdo sem entrar na layer.
- **Instance swap:** troca subcomponente aprovado.

### 24.2 Exposição de nested properties

Properties de componentes aninhados devem ser expostas somente quando o consumidor precisa controlá-las. Expor toda a árvore aumenta ruído e permite combinações não aprovadas.

### 24.3 Defaults

O default deve representar o uso mais frequente, seguro e acessível. Não usar default destrutivo, Premium, crítico ou sem label.

## 25. Nested instances, slots e preferred values

### 25.1 Slots oficiais

Slots recorrentes:

- Leading;
- Content;
- Supporting;
- Metadata;
- Trailing;
- Actions;
- Media;
- Status;
- Illustration.

### 25.2 Slot não é área livre

Instance swap deve apontar para famílias aprovadas e, quando possível, usar preferred values. O slot não autoriza inserção de qualquer componente.

### 25.3 Profundidade de nesting

Preferir no máximo três níveis relevantes de nested components antes do conteúdo final. Profundidade maior exige motivo funcional, pois dificulta override, inspeção e manutenção.

## 26. Estados visuais e interativos

### 26.1 States como variants

Componentes interativos possuem variants dos estados necessários para documentação, prototipagem e inspeção. Os estados não são necessariamente todos escolhidos manualmente pelo designer em telas finais; alguns existem para representação e handoff.

### 26.2 Focus

Focus visible é uma layer real, ligada a variable e incluída no main component. Não é desenhada manualmente em telas. A geometria do focus não pode ser cortada pelo frame.

### 26.3 Loading

Loading preserva largura e contexto do controle. A action label pode permanecer visualmente oculta para estabilizar largura, mas deve continuar documentada como nome acessível.

### 26.4 Disabled

Disabled não remove informação nem usa apenas opacidade sem verificar contraste. A razão da indisponibilidade pertence ao contexto ou supporting text.

### 26.5 Error, warning e success

São estados semânticos apenas em componentes que validam ou comunicam situação. Não transformar toda família em uma matriz de feedback quando o estado não se aplica.

## 27. Responsividade e densidade

### 27.1 Responsividade por composição

A maior parte da responsividade é obtida por Auto Layout, fill/hug e template. Variants `Mobile/Desktop` são evitadas.

### 27.2 Variants estruturais permitidas

Device/layout variants são aceitáveis quando a estrutura realmente muda, como:

- Bottom Navigation versus Sidebar — componentes separados;
- horizontal versus vertical em comparação;
- modal versus bottom sheet — componentes separados;
- data table versus cards — padrão de template, não variant da tabela.

### 27.3 Density

`Comfortable` é padrão e obrigatório em mobile. `Compact` é permitido em desktop para listas, tabelas e administração, sem reduzir alvos interativos ou tipografia abaixo do mínimo.

## 28. Acessibilidade representada no Figma

Cada componente interativo deve documentar:

- nome acessível;
- papel esperado;
- estado anunciado;
- ordem de foco;
- operação por teclado;
- tamanho do alvo;
- contraste;
- comportamento com texto ampliado;
- alternativa a cor, gesto, hover e motion;
- mensagem de erro associada quando aplicável.

Annotations do Figma devem registrar requisitos não visíveis. A ausência de semântica nativa no canvas não elimina a obrigação de documentá-la.

## 29. Prototipagem de componentes

### 29.1 Finalidade

Interactive components são usados para:

- validar feedback;
- demonstrar hover/pressed/focus;
- testar abertura e fechamento;
- alternar seleção;
- demonstrar modes e estados.

### 29.2 Limites

Protótipo não simula regra de negócio complexa nem substitui especificação. Variáveis de protótipo não devem sugerir que permissões, billing, dados médicos ou IA serão implementados no Figma.

### 29.3 Reduced Motion

Exemplos de interação devem possuir demonstração com reduced motion quando a transição for relevante.

## 30. Documentação embutida

Todo main component ou component set publicado recebe:

- descrição curta orientada a uso;
- link para a seção correspondente do `03-component-library.md`;
- status e versão;
- owner;
- notas de acessibilidade;
- indicação de substituto quando deprecated.

A descrição não repete toda a documentação. Ela ajuda o consumidor a decidir corretamente sem sair do fluxo.

## 31. Critérios de qualidade do main component

Um main component não pode ser publicado se:

- contiver layers sem nome;
- usar cores, spacing ou radius locais;
- depender de groups onde Auto Layout é necessário;
- possuir texto sem style;
- cortar focus ring;
- quebrar com conteúdo longo;
- divergir entre Dark e Light;
- duplicar Core/Grow/Med;
- possuir property redundante;
- permitir combinação inválida sem orientação;
- não tiver descrição, owner ou documentação;
- falhar nos estados aplicáveis.

# PARTE IV — CATÁLOGO DE IMPLEMENTAÇÃO NO FIGMA

## Contrato de leitura do catálogo

As especificações abaixo não substituem o documento 03. Elas definem a **representação no Figma** de cada família oficial. Onde uma família é melhor representada por style ou variables, isso é declarado para evitar componentes artificiais.


## 32. Primitivos

Primitivos são os menores ativos reutilizáveis. Eles não devem carregar regra de negócio nem contexto de produto. Sua estabilidade é essencial porque qualquer alteração possui grande raio de impacto.

### 1. Text

**Representação no Figma:** Text styles, não component set  
**Nome oficial do asset:** `Foundation/Text styles`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Papel tipográfico por style; sem variant |
| Boolean properties | Nenhuma |
| Text properties | Conteúdo editado na própria layer |
| Instance swap properties | Nenhum |

#### Auto Layout e resizing

- **Layout:** Layer textual simples; sem wrappers artificiais.
- **Resizing:** Hug vertical; largura conforme contexto.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Toda layer publicada usa text style e color variable. O catálogo Text existe na documentação, mas não deve obrigar designers a inserir um componente para escrever.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 2. Icon

**Representação no Figma:** Components individuais publicados  
**Nome oficial do asset:** `Icon/<Category>/<Name>`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Sem variant de tema ou contexto; filled somente quando previsto |
| Boolean properties | Nenhuma |
| Text properties | Nenhuma |
| Instance swap properties | N/A |

#### Auto Layout e resizing

- **Layout:** Frame 24×24 com vetor central.
- **Resizing:** Fixed; redimensionamento apenas para tamanhos aprovados.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Ícones são trocados por instance swap em componentes consumidores. Preferred values devem limitar escolhas.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 3. Image

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Media/Image`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Ratio=Free|Square|Landscape|Portrait; State=Default|Loading|Unavailable|Sensitive |
| Boolean properties | Show overlay, Show caption |
| Text properties | Alt summary na documentação; caption quando visível |
| Instance swap properties | Media placeholder, Sensitive overlay |

#### Auto Layout e resizing

- **Layout:** Stack com media e caption.
- **Resizing:** Fill container; altura por ratio.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

A imagem real entra como fill/override controlado. Não embutir fotografia no main component.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 4. Thumbnail

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Media/Thumbnail`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Size=Small|Medium|Large; Shape=Rounded|Square; State=Default|Loading|Unavailable|Selected |
| Boolean properties | Show badge, Show overlay |
| Text properties | Optional label apenas quando a família exigir |
| Instance swap properties | Status badge |

#### Auto Layout e resizing

- **Layout:** Frame de media com overlays absolutos aprovados.
- **Resizing:** Fixed por size.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Usado em listas e galerias. Selection sempre inclui indicador além de borda cromática.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 5. Avatar

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Identity/Avatar`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Size=Small|Medium|Large; Type=Image|Initials|Anonymous; State=Default|Online|Selected |
| Boolean properties | Show status |
| Text properties | Initials |
| Instance swap properties | Status indicator |

#### Auto Layout e resizing

- **Layout:** Frame circular com conteúdo central.
- **Resizing:** Fixed.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Med pode usar Anonymous. Nenhum avatar revela vínculo de contexto automaticamente.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 6. Divider

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Layout/Divider`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Orientation=Horizontal|Vertical; Emphasis=Subtle|Default |
| Boolean properties | Nenhuma |
| Text properties | Nenhuma |
| Instance swap properties | Nenhum |

#### Auto Layout e resizing

- **Layout:** Frame de 1px ou token aprovado.
- **Resizing:** Fill no eixo principal.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Não usar divider para compensar spacing ruim. Vertical só em layouts estáveis.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 7. Tag / Chip

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Data/Chip`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Type=Label|Filter|Input; Size=Small|Medium; State=Default|Hover|Focus|Pressed|Selected|Disabled; Tone=Neutral|Accent|Semantic |
| Boolean properties | Show leading icon, Show trailing icon, Removable |
| Text properties | Label |
| Instance swap properties | Leading icon, Trailing icon |

#### Auto Layout e resizing

- **Layout:** Auto Layout horizontal.
- **Resizing:** Hug; wrap no parent.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Filter/Input chip pode ser interativo. Label chip não deve parecer ação.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

## 33. Ações e formulários

Controles devem oferecer propriedades suficientes para os casos aprovados sem transformar cada detalhe em variant. Labels, validação, foco, leitura e idempotência fazem parte do contrato.

### 8. Button

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Action/Button`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Hierarchy=Primary|Secondary|Tertiary|Destructive; Size=Small|Medium|Large; State=Default|Hover|Focus|Pressed|Disabled|Loading |
| Boolean properties | Show leading icon, Show trailing icon |
| Text properties | Label |
| Instance swap properties | Leading icon, Trailing icon |

#### Auto Layout e resizing

- **Layout:** Auto Layout horizontal central.
- **Resizing:** Hug; Fill controlado pelo parent.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Theme e contexto por variables. Loading preserva largura. Destructive nunca é default.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 9. Icon Button

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Action/Icon button`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Hierarchy=Primary|Secondary|Tertiary|Destructive; Size=Small|Medium|Large; State=Default|Hover|Focus|Pressed|Disabled|Loading|Selected |
| Boolean properties | Show badge |
| Text properties | Accessible name apenas em documentação/annotation |
| Instance swap properties | Icon, Counter badge |

#### Auto Layout e resizing

- **Layout:** Frame quadrado com conteúdo central.
- **Resizing:** Fixed.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Todo uso isolado exige nome acessível e tooltip quando a ação não for universal.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 10. Link

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Action/Link`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Type=Inline|Standalone|Navigation|External|Destructive; State=Default|Hover|Focus|Pressed|Visited|Disabled |
| Boolean properties | Show leading icon, Show trailing icon |
| Text properties | Label |
| Instance swap properties | Leading icon, Trailing icon |

#### Auto Layout e resizing

- **Layout:** Auto Layout horizontal.
- **Resizing:** Hug.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Link navega; Button executa. External exibe indicação aprovada.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 11. Text Field

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Form/Text field`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Size=Medium|Large; State=Empty|Filled|Focus|Disabled|Read-only|Error|Warning|Success |
| Boolean properties | Show leading icon, Show trailing action, Show supporting text, Required |
| Text properties | Label, Value, Placeholder, Supporting text |
| Instance swap properties | Leading icon, Trailing action |

#### Auto Layout e resizing

- **Layout:** Vertical: label + field + support.
- **Resizing:** Fill container; altura cresce por suporte.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Label nunca depende de placeholder. Error mantém mensagem associada.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 12. Text Area

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Form/Text area`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Size=Medium|Large; State=Empty|Filled|Focus|Disabled|Read-only|Error|Warning|Success |
| Boolean properties | Show counter, Show supporting text, Required |
| Text properties | Label, Value, Placeholder, Supporting text, Counter |
| Instance swap properties | Nenhum |

#### Auto Layout e resizing

- **Layout:** Vertical; área interna multiline.
- **Resizing:** Fill container; altura mínima, crescimento controlado.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Não usar altura fixa que corte texto. Resize manual só em desktop se aprovado.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 13. Numeric / Measurement Field

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Form/Measurement field`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Size=Medium|Large; State=Empty|Filled|Focus|Disabled|Read-only|Error|Warning|Success; Format=Integer|Decimal |
| Boolean properties | Show stepper, Show range, Required |
| Text properties | Label, Value, Unit, Supporting text, Range |
| Instance swap properties | Leading icon |

#### Auto Layout e resizing

- **Layout:** Vertical; field horizontal com unit/stepper.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Unidade é slot inseparável. Precision e locale são documentados, não simulados por variantes.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 14. Search Field

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Form/Search field`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Size=Medium|Large; State=Empty|Typing|Filled|Focus|Disabled|Loading|Error |
| Boolean properties | Show filter action, Show clear action |
| Text properties | Query, Placeholder |
| Instance swap properties | Search icon, Filter action, Clear action |

#### Auto Layout e resizing

- **Layout:** Horizontal.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Loading não apaga query. Clear só aparece com conteúdo.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 15. Select / Dropdown

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Form/Select`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Size=Medium|Large; State=Empty|Filled|Open|Focus|Disabled|Read-only|Error |
| Boolean properties | Show leading icon, Show supporting text, Required |
| Text properties | Label, Value, Placeholder, Supporting text |
| Instance swap properties | Leading icon, Chevron |

#### Auto Layout e resizing

- **Layout:** Vertical com trigger.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Menu de opções é Popover/List separado. Não construir todas as opções dentro do trigger.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 16. Radio Group

**Representação no Figma:** Component set + item privado  
**Nome oficial do asset:** `Form/Radio group`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Orientation=Vertical|Horizontal; State=Default|Disabled|Error |
| Boolean properties | Show descriptions, Required |
| Text properties | Group label, Supporting text |
| Instance swap properties | Radio option item |

#### Auto Layout e resizing

- **Layout:** Stack de options.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Item individual é helper privado. Apenas uma seleção; options longas usam vertical.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 17. Checkbox

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Form/Checkbox`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Selection=Unchecked|Checked|Mixed; State=Default|Hover|Focus|Pressed|Disabled|Error |
| Boolean properties | Show description |
| Text properties | Label, Description |
| Instance swap properties | Nenhum |

#### Auto Layout e resizing

- **Layout:** Horizontal top-aligned.
- **Resizing:** Hug/Fill conforme label.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Mixed é estado real, não decoração. Label é área interativa.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 18. Switch

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Form/Switch`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Selection=Off|On; State=Default|Hover|Focus|Pressed|Disabled |
| Boolean properties | Show description |
| Text properties | Label, Description |
| Instance swap properties | Nenhum |

#### Auto Layout e resizing

- **Layout:** Horizontal com label e control.
- **Resizing:** Fill/Hug.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Mudança deve ser imediata. Se exige confirmação ou submit, usar Checkbox/Select.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 19. Segmented Control

**Representação no Figma:** Component set + item privado  
**Nome oficial do asset:** `Form/Segmented control`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Size=Small|Medium; Count=2|3|4; State=Default|Disabled |
| Boolean properties | Show icons |
| Text properties | Option labels |
| Instance swap properties | Option icons |

#### Auto Layout e resizing

- **Layout:** Horizontal, equal fill.
- **Resizing:** Fill container com max width.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Count só para estruturas aprovadas. Mais de quatro opções usa Tabs ou Select.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 20. Intensity Scale

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Form/Intensity scale`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Range=Five|Ten; State=Default|Focus|Disabled|Error; Presentation=Discrete|Continuous |
| Boolean properties | Show endpoint labels, Show current value |
| Text properties | Label, Min label, Max label, Value |
| Instance swap properties | Nenhum |

#### Auto Layout e resizing

- **Layout:** Vertical: label, scale, endpoints.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Valor selecionado deve possuir texto/forma além de cor. Scale deve ser equivalente em Grow e Med.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 21. Date Picker

**Representação no Figma:** Component set + calendar popover  
**Nome oficial do asset:** `Form/Date picker`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | State=Empty|Filled|Open|Focus|Disabled|Error |
| Boolean properties | Show supporting text, Required |
| Text properties | Label, Date, Placeholder, Supporting text |
| Instance swap properties | Calendar icon |

#### Auto Layout e resizing

- **Layout:** Trigger vertical.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Calendar é subcomponente interno reutilizado. Formato mostrado respeita locale.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 22. Time Picker

**Representação no Figma:** Component set + time popover  
**Nome oficial do asset:** `Form/Time picker`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | State=Empty|Filled|Open|Focus|Disabled|Error; Format=12h|24h |
| Boolean properties | Show supporting text, Required |
| Text properties | Label, Time, Placeholder, Supporting text |
| Instance swap properties | Clock icon |

#### Auto Layout e resizing

- **Layout:** Trigger vertical.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Formato 12h/24h é contexto de locale, não preferência visual.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 23. Date-Time Picker

**Representação no Figma:** Component set composto  
**Nome oficial do asset:** `Form/Date-time picker`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Layout=Combined|Split; State=Empty|Filled|Focus|Disabled|Error |
| Boolean properties | Show supporting text, Required |
| Text properties | Label, Date, Time, Supporting text |
| Instance swap properties | Calendar icon, Clock icon |

#### Auto Layout e resizing

- **Layout:** Vertical ou split horizontal responsivo.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Composição usa Date e Time Picker aninhados; não duplica calendário.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 24. Date Range Picker

**Representação no Figma:** Component set composto  
**Nome oficial do asset:** `Form/Date range picker`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Layout=Combined|Split; State=Empty|Filled|Focus|Disabled|Error |
| Boolean properties | Show duration, Show supporting text, Required |
| Text properties | Label, Start, End, Duration, Supporting text |
| Instance swap properties | Calendar icon |

#### Auto Layout e resizing

- **Layout:** Vertical; desktop pode split.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Ordem início/fim nunca muda. Datas inválidas mostram erro no grupo.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 25. Filter Bar

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Filter/Bar`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Layout=Inline|Stacked; Density=Comfortable|Compact; State=Default|Applied|Loading |
| Boolean properties | Show search, Show sort, Show clear all, Show result count |
| Text properties | Result count, Clear label |
| Instance swap properties | Search field, Filter chip group, Sort select |

#### Auto Layout e resizing

- **Layout:** Auto Layout com wrap.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Inline em desktop e stacked em mobile por composição. Não criar filtro local fora da família.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 26. Upload & Media Capture

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Form/Media upload`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Type=Dropzone|Button|Preview; State=Idle|Hover|Uploading|Paused|Success|Error|Offline |
| Boolean properties | Allow camera, Allow multiple, Show caption |
| Text properties | Title, Description, Progress, Error message |
| Instance swap properties | Upload icon, Camera icon, Thumbnail, Action |

#### Auto Layout e resizing

- **Layout:** Vertical; preview list aninhada.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Upload pendente offline deve ser explícito. Preview não autoriza publicação antes do envio.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

## 34. Navegação

Componentes de navegação preservam orientação, contexto e retorno. Eles são fortemente controlados pelos Screen Templates e não podem ser reposicionados livremente.

### 27. Bottom Navigation

**Representação no Figma:** Component set + item privado  
**Nome oficial do asset:** `Navigation/Bottom navigation`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Count=3|4|5; State=Default|Discreet |
| Boolean properties | Show labels, Show badges |
| Text properties | Item labels |
| Instance swap properties | Navigation icons, Counter badges |

#### Auto Layout e resizing

- **Layout:** Horizontal equal fill.
- **Resizing:** Fill width; fixed height.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Somente mobile. Accent marca seleção; Modo Discreto não altera estrutura.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 28. Sidebar Navigation

**Representação no Figma:** Component set + item privado  
**Nome oficial do asset:** `Navigation/Sidebar`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | State=Expanded|Collapsed; Density=Comfortable|Compact |
| Boolean properties | Show section labels, Show badges, Show account |
| Text properties | Item labels, Section labels |
| Instance swap properties | Navigation icons, Avatar, Counter badges |

#### Auto Layout e resizing

- **Layout:** Vertical.
- **Resizing:** Fixed width por state; fill height.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Somente tablet/desktop conforme template. Collapsed mantém tooltips e nomes acessíveis.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 29. Top App Bar / Page Header

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Navigation/Page header`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Level=App|Page|Detail; Size=Compact|Default; State=Top|Scrolled |
| Boolean properties | Show back, Show context, Show primary action, Show overflow |
| Text properties | Title, Subtitle, Context label |
| Instance swap properties | Back icon, Context mark, Primary action, Overflow menu |

#### Auto Layout e resizing

- **Layout:** Horizontal com content fill.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Uma ação primária. Títulos longos reflow/truncate conforme nível e permanecem acessíveis.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 30. Tabs

**Representação no Figma:** Component set + tab item  
**Nome oficial do asset:** `Navigation/Tabs`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Type=Fixed|Scrollable; Size=Small|Medium; State=Default|Disabled |
| Boolean properties | Show counts, Show icons |
| Text properties | Tab labels, Counts |
| Instance swap properties | Tab icons |

#### Auto Layout e resizing

- **Layout:** Horizontal.
- **Resizing:** Fill ou hug conforme type.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Selected é indicado por forma/posição além de cor. Tabs não substituem filtros.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 31. Back Navigation / Breadcrumb

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Navigation/Breadcrumb`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Type=Back|Breadcrumb; Density=Comfortable|Compact |
| Boolean properties | Show home, Collapse middle |
| Text properties | Labels |
| Instance swap properties | Back icon, Home icon, Separator |

#### Auto Layout e resizing

- **Layout:** Horizontal.
- **Resizing:** Hug; breadcrumb fill com truncamento.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Back é mobile/detail; breadcrumb é desktop/hierarquia. Não exibir ambos sem necessidade.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 32. Pagination

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Navigation/Pagination`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Size=Small|Medium; State=Default|Loading|Disabled |
| Boolean properties | Show first last, Show item count |
| Text properties | Current page, Total pages, Item count |
| Instance swap properties | Previous icon, Next icon |

#### Auto Layout e resizing

- **Layout:** Horizontal.
- **Resizing:** Hug.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Usar em tabelas e coleções com navegação explícita. Página atual possui estado semântico.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 33. Incremental Loading / Continuation

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Navigation/Load more`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Type=Button|Automatic; State=Idle|Loading|Error|End |
| Boolean properties | Show item count |
| Text properties | Label, Error message, End message |
| Instance swap properties | Loading indicator, Retry action |

#### Auto Layout e resizing

- **Layout:** Vertical central.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Automatic precisa anunciar carregamento. End não parece erro.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 34. Step Indicator

**Representação no Figma:** Component set + step item  
**Nome oficial do asset:** `Navigation/Step indicator`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Layout=Horizontal|Vertical; Progress=Upcoming|Current|Complete|Error; Density=Comfortable|Compact |
| Boolean properties | Show labels, Show descriptions |
| Text properties | Step labels, Descriptions |
| Instance swap properties | Status icons |

#### Auto Layout e resizing

- **Layout:** Horizontal ou vertical.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Wizard usa current step textual. Progress bar isolada não substitui etapas nomeadas.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 35. Overflow Menu / Popover

**Representação no Figma:** Component set + menu item  
**Nome oficial do asset:** `Overlay/Popover menu`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Placement=Top|Bottom|Left|Right; Density=Comfortable|Compact; State=Open|Closed |
| Boolean properties | Show section labels, Show shortcuts |
| Text properties | Item labels, Section labels, Shortcuts |
| Instance swap properties | Item icons, Check indicator |

#### Auto Layout e resizing

- **Layout:** Vertical.
- **Resizing:** Hug com min/max width.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Ações críticas têm confirmação posterior. Menu fecha com Escape e restaura foco.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

## 35. Dados e conteúdo

Esses componentes apresentam entidades, histórico, métricas e mídia. Honestidade visual, ausência de dados, privacidade e comparabilidade têm prioridade sobre impacto decorativo.

### 36. Counter Badge

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Data/Counter badge`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Size=Small|Medium; Tone=Neutral|Accent|Critical; State=Default|Overflow |
| Boolean properties | Show dot mode |
| Text properties | Count |
| Instance swap properties | Nenhum |

#### Auto Layout e resizing

- **Layout:** Central.
- **Resizing:** Hug/fixed min.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Overflow usa “99+” ou limite aprovado. Não comunicar status complexo apenas pelo número.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 37. Status Badge

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Data/Status badge`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Size=Small|Medium; Tone=Neutral|Info|Success|Warning|Critical|Private|Premium|AI; Emphasis=Subtle|Strong |
| Boolean properties | Show icon |
| Text properties | Label |
| Instance swap properties | Status icon |

#### Auto Layout e resizing

- **Layout:** Horizontal.
- **Resizing:** Hug.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Tone semântico não usa accent do produto. Labels curtas e explícitas.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 38. Entity Card

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Data/Entity card`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Size=Compact|Default|Expanded; State=Default|Hover|Focus|Selected|Disabled|Loading|Private; Layout=List|Grid |
| Boolean properties | Show media, Show status, Show metrics, Show metadata, Show actions |
| Text properties | Title, Subtitle, Metadata, Metric labels/values |
| Instance swap properties | Media, Status badge, Actions |

#### Auto Layout e resizing

- **Layout:** Vertical ou horizontal por layout.
- **Resizing:** Fill container; altura por conteúdo.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Slots são controlados; não inserir regiões livres. Tipos de entidade usam mesma anatomia base.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 39. List Item

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Data/List item`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Type=Simple|Media|Avatar|Metric|Selectable|Expandable; Density=Comfortable|Compact; State=Default|Hover|Focus|Pressed|Selected|Disabled|Loading |
| Boolean properties | Show leading, Show supporting, Show metadata, Show trailing, Show divider |
| Text properties | Title, Supporting text, Metadata, Value |
| Instance swap properties | Leading, Trailing, Status badge |

#### Auto Layout e resizing

- **Layout:** Horizontal top/center conforme conteúdo.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Área interativa única por padrão. Ação trailing independente exige alvo e label próprios.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 40. Timeline

**Representação no Figma:** Component set + event item  
**Nome oficial do asset:** `Data/Timeline`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Type=Grow|Med|System|AI; Density=Comfortable|Compact; State=Default|Loading|Empty |
| Boolean properties | Show filters, Show media, Show metrics |
| Text properties | Date group, Event title, Description, Metadata |
| Instance swap properties | Event icon, Media, Status badge, Actions |

#### Auto Layout e resizing

- **Layout:** Vertical.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Evento item é helper privado. Ordem cronológica e agrupamento são preservados.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 41. Statistics Panel

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Data/Statistics panel`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Size=Compact|Default|Large; Trend=Up|Down|Neutral|Unavailable; State=Default|Loading|Private|Estimated |
| Boolean properties | Show comparison, Show period, Show sparkline |
| Text properties | Label, Value, Unit, Comparison, Period |
| Instance swap properties | Trend icon, Sparkline |

#### Auto Layout e resizing

- **Layout:** Vertical.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Trend não é automaticamente positivo/negativo; semântica depende da métrica e deve ser textual.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 42. Entity Comparison

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Data/Comparison`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Layout=Side-by-side|Stacked|Table; Count=2|Multiple; State=Default|Loading|Insufficient |
| Boolean properties | Show baseline, Show differences |
| Text properties | Titles, Criteria, Values |
| Instance swap properties | Entity summary, Status badges |

#### Auto Layout e resizing

- **Layout:** Grid/Auto Layout.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Mobile usa stacked sem mudar ordem. Diferença usa texto/shape, não apenas cor.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 43. Data Table

**Representação no Figma:** Component set + row/cell helpers  
**Nome oficial do asset:** `Data/Table`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Density=Comfortable|Compact; State=Default|Loading|Empty|Error; Selection=None|Single|Multiple |
| Boolean properties | Show header, Show footer, Show pagination, Show row actions |
| Text properties | Headers, Cell values |
| Instance swap properties | Sort icon, Checkbox, Status badge, Actions |

#### Auto Layout e resizing

- **Layout:** Vertical table com columns fixed/fill.
- **Resizing:** Fill container; horizontal scroll no template.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Helpers privados preservam alinhamento. Tabela não vira mini-card dentro de cada célula.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 44. Time-Series Chart

**Representação no Figma:** Component set + chart primitives  
**Nome oficial do asset:** `Data/Time-series chart`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Series=Single|Multiple; State=Default|Loading|Empty|Insufficient|Error; Projection=None|Forecast |
| Boolean properties | Show legend, Show grid, Show reference range, Show events, Show tooltip |
| Text properties | Title, Axis labels, Legend labels, Annotation |
| Instance swap properties | Legend item, Tooltip, Data seal |

#### Auto Layout e resizing

- **Layout:** Frame com plot area e overlays.
- **Resizing:** Fill container; aspect ratio por template.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Chart primitives podem ser privados. Dados demonstrativos são identificados. Acessibilidade inclui resumo e tabela alternativa.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 45. Media Gallery

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Media/Gallery`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Layout=Grid|List; Selection=None|Single|Multiple; State=Default|Loading|Empty|Error|Private |
| Boolean properties | Show filters, Show dates, Show upload action |
| Text properties | Group labels, Counts |
| Instance swap properties | Thumbnail, Filter bar, Upload action |

#### Auto Layout e resizing

- **Layout:** Grid/wrap.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Colunas mudam por template. Ordem temporal e seleção permanecem claras.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 46. Media Viewer

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Media/Viewer`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Mode=Single|Compare; State=Default|Loading|Error|Sensitive |
| Boolean properties | Show metadata, Show controls, Show filmstrip, Show annotations |
| Text properties | Title, Metadata, Counter |
| Instance swap properties | Media, Controls, Filmstrip |

#### Auto Layout e resizing

- **Layout:** Overlay composition.
- **Resizing:** Fill viewport/container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Compare não altera arquivos originais. Controls respeitam safe areas e keyboard.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

## 36. Feedback e overlays

Feedback comunica resultado, condição e próxima ação. Overlays exigem tratamento explícito de foco, fechamento, backdrop e adaptação mobile.

### 47. Inline Validation

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Feedback/Inline validation`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Tone=Info|Success|Warning|Critical; Size=Small|Medium |
| Boolean properties | Show icon |
| Text properties | Message |
| Instance swap properties | Tone icon |

#### Auto Layout e resizing

- **Layout:** Horizontal top-aligned.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Mensagem fica associada ao controle. Success só quando realmente útil.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 48. Toast

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Feedback/Toast`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Tone=Neutral|Success|Warning|Critical; State=Entering|Visible|Exiting |
| Boolean properties | Show icon, Show action, Dismissible |
| Text properties | Message, Action label |
| Instance swap properties | Tone icon, Action, Close icon |

#### Auto Layout e resizing

- **Layout:** Horizontal.
- **Resizing:** Width responsiva com max.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Não usar para erro que exige decisão. Acessibilidade define anúncio e duração.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 49. Banner

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Feedback/Banner`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Tone=Info|Success|Warning|Critical|Offline|Private|AI|Premium; Emphasis=Subtle|Strong |
| Boolean properties | Show icon, Show action, Dismissible |
| Text properties | Title, Message, Action label |
| Instance swap properties | Tone icon, Action, Close icon |

#### Auto Layout e resizing

- **Layout:** Horizontal; mobile pode stack.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Banner persistente para condições relevantes. Dismissible somente quando ocultar não cria risco.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 50. Modal Dialog

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Overlay/Modal`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Size=Small|Medium|Large; Type=Standard|Confirmation|Destructive|Clinical|Privacy; State=Open|Loading|Error |
| Boolean properties | Show icon, Show secondary action, Show close |
| Text properties | Title, Description, Primary label, Secondary label |
| Instance swap properties | Context icon, Actions |

#### Auto Layout e resizing

- **Layout:** Vertical.
- **Resizing:** Fixed/max width; mobile pode virar sheet por template.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Focus trap e retorno de foco documentados. Não usar para fluxo longo.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 51. Bottom Sheet

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Overlay/Bottom sheet`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Height=Content|Medium|Full; Type=Standard|Selection|Action; State=Open|Dragging|Loading|Error |
| Boolean properties | Show handle, Show header, Show close, Show actions |
| Text properties | Title, Description |
| Instance swap properties | Header action, Content slot, Actions |

#### Auto Layout e resizing

- **Layout:** Vertical.
- **Resizing:** Fill width; height por content/mode.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Mobile-first. Não depende de swipe para fechar; back/close sempre disponíveis.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 52. Tooltip

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Overlay/Tooltip`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Placement=Top|Bottom|Left|Right; Size=Small|Medium |
| Boolean properties | Show shortcut |
| Text properties | Content, Shortcut |
| Instance swap properties | Nenhum |

#### Auto Layout e resizing

- **Layout:** Hug content.
- **Resizing:** Hug com max width.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Complementa ícone ou termo; nunca contém informação essencial ou ação complexa.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 53. Empty State

**Representação no Figma:** Component set  
**Nome oficial do asset:** `State/Empty`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Type=First-use|No-results|No-history|Removed|Private|Insufficient; Size=Compact|Default|Large |
| Boolean properties | Show illustration, Show primary action, Show secondary action |
| Text properties | Title, Description, Action labels |
| Instance swap properties | Illustration, Actions |

#### Auto Layout e resizing

- **Layout:** Vertical central/left conforme template.
- **Resizing:** Fill container; altura por context.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Ação de criação só quando permitida. Ilustração é secundária.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 54. Loading Indicator

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Feedback/Spinner`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Size=Small|Medium|Large; Tone=Neutral|On-accent |
| Boolean properties | Show label |
| Text properties | Label |
| Instance swap properties | Nenhum |

#### Auto Layout e resizing

- **Layout:** Central.
- **Resizing:** Fixed/Hug.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Indicador indeterminado. Motion Reduced usa versão não rotacional ou mínima aprovada.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 55. Progress Indicator

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Feedback/Progress`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Type=Linear|Circular; Size=Small|Medium|Large; State=Active|Paused|Success|Error |
| Boolean properties | Show value, Show label |
| Text properties | Label, Value |
| Instance swap properties | Status icon |

#### Auto Layout e resizing

- **Layout:** Horizontal/vertical conforme type.
- **Resizing:** Fill ou fixed.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Usar somente quando progresso é mensurável. Valor textual acompanha representação.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 56. Skeleton

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Feedback/Skeleton`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Type=Text|Card|List|Dashboard|Chart|Image; Density=Comfortable|Compact; Motion=Default|Reduced |
| Boolean properties | Nenhuma |
| Text properties | Nenhuma |
| Instance swap properties | Nenhum |

#### Auto Layout e resizing

- **Layout:** Replica estrutura, não conteúdo.
- **Resizing:** Fill conforme target.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Não criar skeleton genérico que muda layout. Reduced motion sem shimmer intenso.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 57. Screen Error State

**Representação no Figma:** Component set  
**Nome oficial do asset:** `State/Screen error`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Type=Recoverable|Connection|Permission|Not-found|Processing|Report|Sensitive; Size=Default|Large |
| Boolean properties | Show illustration, Show retry, Show secondary action, Show support |
| Text properties | Title, Description, Action labels, Support code |
| Instance swap properties | Illustration, Actions |

#### Auto Layout e resizing

- **Layout:** Vertical.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Código de suporte é discreto. Mensagem específica, sem culpar usuário.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 58. Offline / Sync Status

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Status/Sync`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | State=Offline|Draft|Pending|Syncing|Synced|Error|Conflict|Cached|Stale; Size=Compact|Default |
| Boolean properties | Show action, Show timestamp |
| Text properties | Label, Timestamp, Action label |
| Instance swap properties | Status icon, Action |

#### Auto Layout e resizing

- **Layout:** Horizontal.
- **Resizing:** Hug/Fill.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Synced transitório não deve dominar. Conflict exige ação clara e não é tratado como erro genérico.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 59. Permission / Private State

**Representação no Figma:** Component set  
**Nome oficial do asset:** `State/Permission`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Type=System-permission|Account-permission|Private|Context-isolated|Consent-required|Consent-revoked; Size=Compact|Default|Large |
| Boolean properties | Show action, Show explanation link |
| Text properties | Title, Description, Action label |
| Instance swap properties | Privacy icon, Action |

#### Auto Layout e resizing

- **Layout:** Vertical.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Explica causa e consequência sem revelar conteúdo protegido.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

## 37. Componentes especializados

IA, privacidade e Premium possuem requisitos próprios e não podem ser simulados por cards ou badges genéricos. A especialização existe para preservar explicabilidade, consentimento e persuasão ética.

### 60. AI Explainability Card

**Representação no Figma:** Component set  
**Nome oficial do asset:** `AI/Explainability card`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Size=Compact|Default|Expanded; State=Default|Loading|Insufficient|Error; Confidence=Low|Moderate|High|Unknown |
| Boolean properties | Show evidence, Show period, Show limitations, Show action, Show feedback |
| Text properties | Title, Summary, Evidence, Period, Limitations, Action label |
| Instance swap properties | Confidence indicator, Aggregated seal, Action, Feedback controls |

#### Auto Layout e resizing

- **Layout:** Vertical sections.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Dados usados, período, confiança e limitações são obrigatórios quando disponíveis. Não antropomorfizar IA.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 61. Confidence Indicator

**Representação no Figma:** Component set  
**Nome oficial do asset:** `AI/Confidence indicator`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Level=Low|Moderate|High|Unknown; Size=Small|Medium; Presentation=Text|Meter|Combined |
| Boolean properties | Show explanation |
| Text properties | Label, Value, Explanation |
| Instance swap properties | Info icon |

#### Auto Layout e resizing

- **Layout:** Horizontal/vertical.
- **Resizing:** Hug.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Não representar confiança como garantia. Cor nunca é único sinal.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 62. Aggregated Data Seal

**Representação no Figma:** Component set  
**Nome oficial do asset:** `AI/Aggregated data seal`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | State=Available|Cold-start|Not-consented|Unavailable; Size=Small|Medium |
| Boolean properties | Show info action |
| Text properties | Label, Description |
| Instance swap properties | Info action |

#### Auto Layout e resizing

- **Layout:** Horizontal.
- **Resizing:** Hug.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Explica origem agregada e consentimento. Não sugere venda ou exposição de dados.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 63. AI Alert Card

**Representação no Figma:** Component set  
**Nome oficial do asset:** `AI/Alert card`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Severity=Info|Warning|Critical; State=New|Viewed|Accepted|Ignored|Resolved|Loading |
| Boolean properties | Show evidence, Show confidence, Show limitation, Show suggested action |
| Text properties | Title, Summary, Evidence, Limitation, Action labels |
| Instance swap properties | Severity icon, Confidence indicator, Actions |

#### Auto Layout e resizing

- **Layout:** Vertical.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Severity semântica independente do accent. Ação sugerida não é executada sem confirmação adequada.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 64. Privacy Matrix

**Representação no Figma:** Component set + row/cell helpers  
**Nome oficial do asset:** `Privacy/Matrix`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Density=Comfortable|Compact; State=Default|Loading|Error|Read-only; Scope=Private|Followers|Link|Public |
| Boolean properties | Show presets, Show bulk actions, Show consequences |
| Text properties | Dimension labels, Scope labels, Descriptions |
| Instance swap properties | Scope selector, Status icon, Actions |

#### Auto Layout e resizing

- **Layout:** Table/grid; mobile stacked rows.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Helpers privados. Cada célula possui label acessível completa; cor não comunica escopo sozinha.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 65. Visibility Scope Selector

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Privacy/Visibility selector`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Scope=Private|Followers|Link|Public; State=Default|Open|Focus|Disabled|Warning |
| Boolean properties | Show description, Show consequence |
| Text properties | Label, Description, Consequence |
| Instance swap properties | Scope icon, Chevron |

#### Auto Layout e resizing

- **Layout:** Vertical/trigger.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Publicação mais aberta pode exigir confirmação. Defaults seguem privacidade mais restritiva.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 66. Profile Link Seal

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Privacy/Profile link seal`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Link=Unlinked|One-way|Mutual; Visibility=Private|Public; Size=Small|Medium |
| Boolean properties | Show context labels, Removable |
| Text properties | Label, Context labels |
| Instance swap properties | Context icons, Remove action |

#### Auto Layout e resizing

- **Layout:** Horizontal.
- **Resizing:** Hug/Fill.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Nunca aparece por inferência. Vínculo só é exibido após opt-in explícito.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 67. Discreet Mode Indicator

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Privacy/Discreet indicator`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | State=Off|On|Temporarily-revealed; Size=Small|Medium; Emphasis=Subtle|Persistent |
| Boolean properties | Show label, Show reveal action |
| Text properties | Label, Action label |
| Instance swap properties | Discreet icon, Reveal action |

#### Auto Layout e resizing

- **Layout:** Horizontal.
- **Resizing:** Hug.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Indica proteção sem chamar atenção indevida. Reveal temporário exige tempo e retorno claros.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 68. Paywall / Upsell

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Premium/Paywall`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Type=Contextual|Full-page|Limit-reached; State=Default|Processing|Success|Error; Emphasis=Standard|Featured |
| Boolean properties | Show comparison, Show coupon, Show restore, Show secondary action |
| Text properties | Title, Benefit, Description, Price, Action labels |
| Instance swap properties | Premium mark, Comparator, Actions |

#### Auto Layout e resizing

- **Layout:** Vertical.
- **Resizing:** Fill container com max width.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Valor antes do bloqueio, persuasão ética e retorno visível. Não esconder close/voltar.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 69. Premium Category Badge

**Representação no Figma:** Component set  
**Nome oficial do asset:** `Premium/Category badge`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Category=AI|Productivity|Reports|Automation|Community|Customization|Storage|Professional; Size=Small|Medium; Emphasis=Subtle|Strong |
| Boolean properties | Show icon |
| Text properties | Label |
| Instance swap properties | Category icon |

#### Auto Layout e resizing

- **Layout:** Horizontal.
- **Resizing:** Hug.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Premium não usa success/warning. Badge informa categoria, não cria falsa urgência.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

### 70. Free vs Premium Comparator

**Representação no Figma:** Component set + row helper  
**Nome oficial do asset:** `Premium/Plan comparator`  
**Status inicial:** `Stable`, condicionado à aprovação do QA descrito neste documento.

#### Estrutura de properties

| Tipo | Definição |
| --- | --- |
| Variant properties | Layout=Table|Cards; State=Default|Loading|Current-plan; Density=Comfortable|Compact |
| Boolean properties | Show categories, Show current plan, Show CTA |
| Text properties | Plan labels, Feature labels, Limits, Action labels |
| Instance swap properties | Availability icon, Category badge, Actions |

#### Auto Layout e resizing

- **Layout:** Grid/table.
- **Resizing:** Fill container.
- Padding, gaps, radius, border, color, opacity e effects consomem variables ou styles oficiais.
- Layers devem seguir a ordem semântica e manter nomes funcionais.

#### Regra específica

Mobile usa cards/stack mantendo comparação. Disponível, limitado e indisponível recebem texto e ícone.

#### Casos mínimos no canvas de documentação

- default com conteúdo realista;
- Dark e Light;
- Core e pelo menos um contexto de produto relevante;
- conteúdo curto e conteúdo longo;
- estado de foco quando interativo;
- disabled, loading, erro, vazio, privado ou offline quando aplicáveis;
- largura mínima e máxima prevista;
- texto ampliado e verificação de alvo de toque;
- exemplo correto e anti-pattern correspondente.

#### Gate de publicação

- [ ] Nome e properties seguem a taxonomia oficial.
- [ ] Não há valor local quando existe token.
- [ ] Main component não contém layers anônimas.
- [ ] Overrides essenciais estão expostos; detalhes internos permanecem protegidos.
- [ ] Combinações inválidas não estão disponíveis.
- [ ] Descrição, link, owner e versão estão preenchidos.
- [ ] Instâncias passam por theme, context, content e accessibility stress tests.

## 38. Relação com Screen Templates

### 38.1 Templates como assets publicados

Templates T01–T35 podem ser publicados no arquivo `F04` como components ou component sets quando:

- a estrutura estiver estável;
- as regiões forem compostas exclusivamente por instâncias oficiais;
- o template não contiver conteúdo de produto específico;
- a responsividade estiver documentada;
- estados compostos estiverem representados;
- o asset não exigir detach para uso.

### 38.2 Properties de template

Templates podem expor:

- `Shell` quando houver mais de uma estrutura aprovada;
- `State` para Default, Loading, Empty, Error, Offline e Processing;
- booleans de regiões opcionais documentadas;
- instance swaps apenas para padrões aprovados;
- text properties para títulos demonstrativos.

Não devem expor qualquer região como slot livre irrestrito.

### 38.3 Tela específica

Telas reais no `F06` são instâncias de templates quando possível. Conteúdo e componentes podem ser substituídos por properties. Detach de template exige revisão, pois normalmente indica lacuna no template ou uso incorreto.

# PARTE V — WORKFLOW, PUBLICAÇÃO E HANDOFF

## 39. Fluxo de criação de um componente

### 39.1 Entrada

Toda solicitação começa com:

- problema observado;
- fluxos e telas afetados;
- componente existente mais próximo;
- evidência de que composição não resolve;
- estados necessários;
- impacto em temas, contextos e acessibilidade;
- contraparte esperada em desenvolvimento.

### 39.2 Sequência obrigatória

1. confirmar autorização documental;
2. mapear anatomia no documento 03;
3. listar properties sem desenhar variantes;
4. identificar variables/styles consumidos;
5. construir default acessível;
6. aplicar Auto Layout e resizing;
7. criar propriedades e variants;
8. testar conteúdo e largura;
9. testar Dark/Light e Core/Grow/Med;
10. testar estados, foco e reduced motion;
11. documentar;
12. revisar com produto, acessibilidade e engenharia;
13. marcar `Candidate`;
14. publicar em janela controlada.

### 39.3 Regra de default first

O default é construído e validado antes de multiplicar variants. Se o default depende de ajuste manual para funcionar, a anatomia ainda não está estável.

## 40. Revisão e QA

### 40.1 Matriz obrigatória

| Dimensão | Casos mínimos |
| --- | --- |
| Theme | Dark, Light |
| Context | Core, Grow, Med |
| Content | mínimo, típico, máximo, locale expandido |
| Width | mínima, recomendada, máxima |
| Input | touch, mouse, keyboard, screen reader annotation |
| State | todos os aplicáveis |
| Accessibility | focus, contraste, zoom/texto ampliado, reduced motion |
| Data | vazio, ausente, estimado, privado, erro |

### 40.2 QA no Playground

A validação não ocorre somente ao lado do main component. O componente deve ser testado em cenários reais no `F05`, consumindo a versão publicada ou candidate de forma controlada.

### 40.3 Pixel perfection versus system correctness

QA prioriza:

1. semântica e comportamento;
2. acessibilidade;
3. resizing e conteúdo;
4. tokens e consistência;
5. alinhamento óptico e acabamento.

Um componente não é aprovado por “parecer certo” se não cumprir os quatro primeiros níveis.

## 41. Publicação da library

### 41.1 Janela de publicação

Publicações devem ser agrupadas em janela conhecida, salvo correção crítica. Isso permite revisão do changelog, comunicação e absorção downstream.

### 41.2 Descrição da publicação

Toda publicação informa:

- versão;
- tipo de mudança;
- assets afetados;
- motivação;
- impacto esperado;
- ação requerida dos consumidores;
- risco;
- prazo de migração quando aplicável;
- link para documentação.

### 41.3 Publicação seletiva

Ativos em Draft, QA helpers, experiências e deprecated sem migração não devem aparecer na library. Recursos de ocultação na publicação podem ser usados; o canvas continua organizado por status.

### 41.4 Proibição de publicação silenciosa

Mudanças visualmente pequenas podem alterar contraste, height, wrapping ou handoff. Nenhuma alteração de asset publicado é liberada sem changelog.

## 42. Atualizações em arquivos consumidores

### 42.1 Revisão antes de aceitar

Product files não devem aplicar “Update all” automaticamente quando a mudança for material. O responsável revisa:

- componentes afetados;
- alterações de layout;
- overrides perdidos;
- states;
- templates;
- telas prontas para desenvolvimento.

### 42.2 Ordem de atualização

1. Playground & QA;
2. Templates;
3. Product Screens ativos;
4. arquivos históricos somente quando necessário.

### 42.3 Atualização crítica

Correções de acessibilidade, privacidade, erro clínico ou ação destrutiva podem exigir atualização prioritária. A comunicação deve indicar explicitamente severidade e prazo.

## 43. Branching e revisão

### 43.1 Caminho principal

Quando branching estiver disponível no plano:

- toda mudança material ocorre em branch;
- branch recebe nome `DS/<ticket>-<short-description>`;
- mudanças são submetidas para review;
- reviewers podem aprovar ou solicitar alterações;
- merge ocorre após resolução de conflitos e QA;
- publicação acontece somente na main file após merge.

### 43.2 Fallback sem branching

Quando branching não estiver disponível:

- usar página/section `WIP — <ticket>` em arquivo de staging separado;
- duplicar somente os assets afetados;
- comparar contra main file;
- aprovar por comentário/ticket;
- aplicar a mudança manualmente na main file;
- criar named version antes e depois;
- excluir o staging após publicação e arquivar evidências.

### 43.3 Conflitos

Atualizações da main devem ser incorporadas antes da revisão final. Conflitos em foundations ou main components não podem ser resolvidos por escolha visual informal.

## 44. Versionamento e changelog

### 44.1 Versão da library

Usar versionamento semântico organizacional:

- **Major:** quebra de contrato, remoção ou migração ampla.
- **Minor:** nova família, nova property compatível ou ampliação funcional.
- **Patch:** correção visual/comportamental compatível.

### 44.2 Versão do asset

A versão do componente aparece na documentação e descrição, não no nome público. Ex.: `Button — v1.4` na ficha, enquanto o asset continua `Action/Button`.

### 44.3 Named versions

Criar named version:

- antes de mudança Major;
- antes de publicação de foundations;
- depois de cada release;
- antes de migração ou depreciação relevante.

## 45. Depreciação e migração

### 45.1 Sequência

1. identificar substituto;
2. medir uso;
3. marcar Deprecated na documentação;
4. adicionar descrição com substituto e prazo;
5. ocultar para novos usos quando seguro;
6. migrar arquivos ativos;
7. verificar instâncias remanescentes;
8. mover snapshot para Archive;
9. remover da library somente após critério de saída.

### 45.2 Nome deprecated

Evitar renomear publicamente com emoji ou prefixo que quebre busca e links. A indicação principal fica na descrição, documentação e status; renomeação controlada só quando necessária para impedir novos usos.

### 45.3 Delete versus hide

Delete só ocorre quando não há instâncias relevantes ou quando o plano de migração foi concluído. Ocultar da publicação é preferível durante transição.

## 46. Library analytics e adoção

Quando disponível no plano, analytics deve acompanhar:

- componentes e variants mais usados;
- assets subutilizados;
- detached instances;
- bibliotecas e equipes consumidoras;
- adoção de novos componentes;
- persistência de deprecated;
- patterns de override que indiquem lacuna.

### 46.1 Interpretação

Baixo uso não prova inutilidade; pode indicar pouca descoberta, documentação ruim ou fluxo raro. Alto detach é sinal forte de contrato inadequado ou falta de propriedade.

### 46.2 Cadência

Revisão mensal durante construção do MVP e trimestral após estabilidade. Findings geram tickets com hipótese, evidência e ação.

## 47. Dev Mode, annotations e Ready for dev

### 47.1 Ready for dev

Componentes, sections e frames só recebem status Ready for dev quando:

- design está aprovado;
- library update foi publicada ou candidate está congelada;
- annotations estão completas;
- estados e responsividade estão definidos;
- links para documentação e ticket existem;
- não há TODO invisível.

### 47.2 Annotations obrigatórias

Usar annotations para registrar:

- comportamento não visível;
- keyboard interaction;
- foco e retorno de foco;
- live region/announcement;
- condição de loading/offline;
- regras de truncamento;
- min/max width;
- dado sensível;
- confiança e limitação da IA;
- mudança responsiva;
- motion/reduced motion.

### 47.3 Inspeção de variables

Variables devem ter nomes e descriptions que façam sentido no Dev Mode. Aliases permitem que engenharia veja intenção semântica, não apenas valores crus.

## 48. Relação futura com componentes em código

### 48.1 Princípio de paridade

A library Figma e a futura library em código devem compartilhar:

- nome de componente;
- nome e significado de properties;
- estados;
- tamanhos;
- tokens;
- status de depreciação;
- documentação e ownership.

### 48.2 Code Connect ou recurso equivalente

Quando adotado, o vínculo é realizado somente após a contraparte em código estar estável. O objetivo é mapear, não gerar arquitetura automaticamente.

### 48.3 O que não fazer

- renomear property no Figma sem avaliar API de código;
- marcar Ready for dev sem componente publicado;
- usar snippet gerado como fonte de regra;
- criar property apenas porque é simples no Figma se ela não existir no produto.

## 49. Performance e manutenção do arquivo

### 49.1 Regras

- dividir libraries conforme seção 2;
- evitar páginas com milhares de exemplos pesados;
- mover stress tests para Playground;
- reduzir nesting sem perder semântica;
- não inserir imagens em alta resolução em main components;
- usar thumbnails e placeholders;
- evitar variantes cartesianas desnecessárias;
- arquivar deprecated fora das páginas ativas;
- revisar componentes invisíveis ou duplicados;
- não manter protótipos complexos dentro de cada main component.

### 49.2 Sinais de degradação

- demora para abrir library modal;
- Assets panel difícil de pesquisar;
- updates com centenas de mudanças não relacionadas;
- overrides lentos ou imprevisíveis;
- main components espalhados;
- pages carregadas com documentação redundante;
- componentes duplicados para evitar conflito.

## 50. Recuperação de incidentes

### 50.1 Publicação incorreta

1. interromper novas atualizações;
2. registrar impacto;
3. usar version history para identificar estado anterior;
4. corrigir na main file ou reverter de forma controlada;
5. publicar patch com descrição explícita;
6. revisar arquivos consumidores críticos;
7. documentar causa-raiz.

### 50.2 Asset removido ou movido

Mover componentes publicados entre libraries exige plano específico, pois pode afetar analytics, referências e updates. Nunca copiar e apagar silenciosamente.

### 50.3 Variable alterada incorretamente

Uma alteração de semantic variable pode afetar todo o sistema. Tratar como incidente de raio amplo: corrigir foundation, validar themes/contexts e publicar patch prioritário.

# PARTE VI — GOVERNANÇA E CHECKLISTS

## 51. Anti-patterns gerais

São proibidos:

- componente local em Product Screens para resolver pressa;
- detach em tela entregue;
- theme variants em component sets;
- componentes duplicados por Grow e Med;
- nome baseado em cor, posição ou aparência;
- variant para presença de ícone quando boolean resolve;
- propriedade `Type` com valores semanticamente diferentes demais;
- component set com combinações impossíveis;
- valores hardcoded;
- layers anônimas;
- group onde Auto Layout é necessário;
- altura fixa em conteúdo variável;
- focus ring desenhado manualmente em telas;
- uso de opacity local para disabled;
- nested instance sem preferred values quando a escolha é restrita;
- main components espalhados fora de `MAIN —`;
- publicar WIP ou helper privado;
- usar protótipo como documentação exclusiva;
- documentar apenas o cenário ideal;
- marcar Ready for dev antes de publicar a dependência;
- apagar deprecated sem migração;
- aceitar updates críticos sem revisão.

## 52. Checklist de foundations

- [ ] Collections possuem propósito único.
- [ ] Theme e Context estão separados.
- [ ] Modes não representam estados de componente.
- [ ] Variables semânticas usam aliases.
- [ ] Components não consomem primitives diretamente sem justificativa.
- [ ] Names não contêm valor visual quando são semânticos.
- [ ] Descriptions estão preenchidas.
- [ ] Dark e Light possuem equivalência perceptiva.
- [ ] Core, Grow e Med possuem accent validado.
- [ ] Contraste foi verificado nos pares reais.
- [ ] Number variables correspondem às escalas oficiais.
- [ ] Text styles usam a família tipográfica candidata (Inter, doc 11 §4) e papéis oficiais.
- [ ] Data styles usam números tabulares.
- [ ] Effects não introduzem ornamentação proibida.
- [ ] Grid styles correspondem aos templates.

## 53. Checklist de componente

- [ ] Existe autorização no documento 03.
- [ ] Nome oficial e categoria estão corretos.
- [ ] Anatomia corresponde à especificação.
- [ ] Default é o caso mais frequente e seguro.
- [ ] Variant axes são necessários e independentes.
- [ ] Booleans substituem duplicações de presença.
- [ ] Text properties possuem nomes claros.
- [ ] Instance swaps usam preferred values.
- [ ] Layers estão nomeadas semanticamente.
- [ ] Auto Layout representa ordem de leitura.
- [ ] Hug, Fill e Fixed estão corretos.
- [ ] Não há height fixa indevida.
- [ ] Tokens e styles são oficiais.
- [ ] Focus visible existe e não é cortado.
- [ ] Estados aplicáveis estão completos.
- [ ] Loading preserva contexto e dimensão.
- [ ] Conteúdo longo não quebra o componente.
- [ ] Texto ampliado é suportado.
- [ ] Dark/Light e Core/Grow/Med foram testados.
- [ ] Descrição, docs, owner e versão estão preenchidos.
- [ ] Anti-patterns estão demonstrados.
- [ ] QA no Playground foi aprovado.

## 54. Checklist de publicação

- [ ] Branch/revisão concluída.
- [ ] Candidate aprovado.
- [ ] Named version criada quando necessário.
- [ ] Changelog descreve impacto e ação.
- [ ] Assets WIP não estão selecionados.
- [ ] Helpers privados permanecem ocultos.
- [ ] Deprecated possui plano de migração.
- [ ] Templates foram testados com a candidate.
- [ ] Product Screens críticos foram avaliados.
- [ ] Engenharia foi avisada de mudança de contrato.
- [ ] Acessibilidade aprovou mudanças relevantes.
- [ ] Owner autorizado executará a publicação.

## 55. Checklist de atualização crítica

- [ ] Severidade está registrada.
- [ ] Raio de impacto foi identificado.
- [ ] Correção foi validada em todos os modes.
- [ ] Arquivos consumidores prioritários estão listados.
- [ ] Existe orientação para aceitar a atualização.
- [ ] Existe fallback ou rollback.
- [ ] O prazo de adoção está definido.
- [ ] Stakeholders foram comunicados.
- [ ] O incidente terá análise de causa-raiz.

## 56. Checklist de handoff

- [ ] Frames estão Ready for dev.
- [ ] Dependências publicadas estão atualizadas.
- [ ] Não existem detached instances.
- [ ] Dev Mode mostra variables semânticas.
- [ ] Annotations cobrem comportamento não visível.
- [ ] Estados, responsive e reduced motion estão documentados.
- [ ] Fluxo de teclado e foco está descrito.
- [ ] Conteúdo privado ou clínico está identificado.
- [ ] IA mostra dados, confiança e limitações.
- [ ] Links para ticket e documentação existem.
- [ ] Nomes de components/properties coincidem com o contrato esperado de código.

## 57. Auditoria periódica

### 57.1 Auditoria mensal durante construção

- assets duplicados;
- detached instances;
- values locais;
- component sets com crescimento excessivo;
- properties não utilizadas;
- inconsistência de nomes;
- falta de docs;
- divergência de themes;
- falhas de content stress;
- deprecated ainda utilizado.

### 57.2 Auditoria trimestral após estabilidade

Além dos itens anteriores:

- analytics de adoção;
- alinhamento Figma–código;
- feedback de designers e engenharia;
- gaps de templates;
- conformidade de acessibilidade;
- performance dos arquivos;
- necessidade de merge, split ou depreciação.

### 57.3 Métricas recomendadas

- taxa de componentes oficiais por tela;
- taxa de detach;
- adoção de releases;
- tempo médio para atualizar arquivos ativos;
- número de componentes locais encontrados;
- uso por família;
- defeitos de UI por divergência de library;
- tempo de handoff;
- percentual de components com docs e annotations completas.

## 58. Decisões consolidadas

1. A COSMARIA possui um sistema lógico único dividido em libraries físicas modulares.
2. Foundations, Icons, Components e Templates são arquivos publicados distintos e dependem em uma única direção.
3. Dark/Light e Core/Grow/Med são resolvidos por collections e modes, nunca por cópia de componente.
4. Estado é variant; presença opcional é boolean; conteúdo é text property; substituição aprovada é instance swap.
5. Product Screens não publicam componentes e não utilizam componentes locais.
6. Detach em telas entregues é proibido.
7. Todos os main components utilizam Auto Layout quando há conteúdo variável.
8. Variables semânticas usam aliases; componentes não consomem primitives quando há token funcional.
9. Componentes são nomeados por função em inglês controlado; documentação pode permanecer em português.
10. Toda família oficial do documento 03 possui representação Figma definida neste documento.
11. Helpers internos são privados e começam com `_`.
12. Todo asset publicado possui descrição, documentação, owner, versão e QA.
13. Branching é preferido quando disponível; staging controlado e named versions são o fallback.
14. Publicações possuem changelog e janela; updates materiais são revisados antes da aceitação.
15. Ready for dev só é aplicado após aprovação e atualização das dependências.
16. Acessibilidade, privacidade, IA explicável e reduced motion fazem parte do contrato do asset.
17. Depreciação exige substituto, medição, comunicação e migração.
18. Analytics, quando disponível, orienta melhoria, mas não substitui julgamento de produto.
19. Figma e código devem convergir em nomes, properties, states, tokens e lifecycle.
20. Nenhuma limitação da ferramenta autoriza contradizer os documentos 11, 01, 02, 03 e 04.

## 59. Histórico

| Versão | Data | Alteração | Responsável |
| --- | --- | --- | --- |
| 1.0 | 2026-07-12 | Criação da arquitetura oficial da Figma Component Library e mapeamento das 70 famílias | Design System COSMARIA |

---

## Condição de conclusão

Este documento estará operacionalmente concluído quando:

- os arquivos F01–F05 estiverem criados;
- collections e modes estiverem publicados;
- as 70 famílias estiverem construídas ou formalmente classificadas por fase;
- templates estiverem conectados a componentes publicados;
- Playground cobrir themes, contexts, content stress e accessibility;
- ownership e processo de publicação estiverem ativos;
- engenharia validar o contrato de nomes e handoff;
- a primeira auditoria completa não encontrar componentes locais, detach ou valores arbitrários em telas candidatas ao desenvolvimento.
