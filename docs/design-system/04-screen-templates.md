# 04 — Screen Templates da Plataforma COSMARIA

> **Nome oficial:** Biblioteca de Templates de Tela da Plataforma COSMARIA  
> **Status:** Versão 1.0 — especificação normativa inicial.  
> **Data:** 2026-07-12.  
> **Autoridade:** subordinado ao `../10-fluxos-do-usuario.md`, `../11-design-system.md`, `01-visual-language.md`, `02-ui-kit.md` e `03-component-library.md`.  
> **Escopo:** layouts reutilizáveis que transformam fluxos e componentes aprovados em estruturas de tela consistentes.  
> **Natureza:** documentação de composição e comportamento de telas. Não contém código, React, HTML, CSS, arquitetura de software, entidades novas, regras de negócio novas ou funcionalidades novas.

---

## Índice

### PARTE I — AUTORIDADE E ARQUITETURA

0. Propósito e autoridade  
1. Papel dos templates na hierarquia do produto  
2. Diferença entre componente, padrão, template e tela  
3. Princípios obrigatórios  
4. Taxonomia oficial  
5. Contrato comum de todos os templates  
6. Regiões estruturais oficiais  
7. Shells oficiais da plataforma  
8. Grid, containers e larguras  
9. Hierarquia de conteúdo e ações  
10. Modelo responsivo  
11. Modelo de estados  
12. Acessibilidade transversal  
13. Conteúdo e internacionalização  
14. Privacidade, Modo Discreto, IA e Premium  
15. Regras de composição entre componentes

### PARTE II — TEMPLATES DE ENTRADA E ORIENTAÇÃO

16. Template T01 — Entrada e Autenticação  
17. Template T02 — Escolha de Propósito ou Contexto  
18. Template T03 — Onboarding Guiado  
19. Template T04 — Wizard Transacional

### PARTE III — TEMPLATES OPERACIONAIS

20. Template T05 — Dashboard  
21. Template T06 — Lista de Coleção  
22. Template T07 — Biblioteca em Grid  
23. Template T08 — Busca e Resultados  
24. Template T09 — Detalhe de Entidade  
25. Template T10 — Formulário Curto  
26. Template T11 — Formulário Longo e Seccionado  
27. Template T12 — Registro Rápido e Check-in  
28. Template T13 — Timeline  
29. Template T14 — Tarefas e Pendências  
30. Template T15 — Configuração Geral  
31. Template T16 — Configuração Detalhada

### PARTE IV — TEMPLATES ANALÍTICOS E DOCUMENTAIS

32. Template T17 — Analytics Overview  
33. Template T18 — Insight e Explicabilidade da IA  
34. Template T19 — Alerta ou Recomendação da IA  
35. Template T20 — Comparação  
36. Template T21 — Relatório  
37. Template T22 — Exportação e Compartilhamento

### PARTE V — TEMPLATES DE IDENTIDADE, PRIVACIDADE E COMUNIDADE

38. Template T23 — Perfil  
39. Template T24 — Central de Privacidade e Dados  
40. Template T25 — Feed da Comunidade  
41. Template T26 — Conteúdo Público e Discussão  
42. Template T27 — Publicação e Compartilhamento  
43. Template T28 — Conteúdo Privado, Restrito ou sem Permissão

### PARTE VI — TEMPLATES DE MÍDIA E CONTEÚDO VISUAL

44. Template T29 — Galeria de Mídia  
45. Template T30 — Visualizador e Comparação de Mídia

### PARTE VII — TEMPLATES DE CONTA E MONETIZAÇÃO

46. Template T31 — Upgrade e Paywall  
47. Template T32 — Gestão de Assinatura

### PARTE VIII — TEMPLATES ADMINISTRATIVOS

48. Template T33 — Administração de Coleções  
49. Template T34 — Administração de Política ou Configuração  
50. Template T35 — Consulta de Auditoria

### PARTE IX — ESTADOS COMPOSTOS DE TELA

51. Composição de estado vazio  
52. Composição de loading e skeleton  
53. Composição de erro  
54. Composição offline, cache e sincronização  
55. Composição de processamento e pendência  
56. Composição de sucesso e conclusão

### PARTE X — MATRIZES, GOVERNANÇA E QUALIDADE

57. Matriz de aplicação por arquétipo de UX  
58. Matriz Core × Grow × Med  
59. Matriz mobile × tablet × desktop  
60. Matriz de estados por template  
61. Critérios para criar um novo template  
62. Processo de alteração e versionamento  
63. Processo de exceção  
64. Auditoria de consistência  
65. Checklist de aprovação de template  
66. Checklist de aprovação de tela final  
67. Decisões consolidadas  
68. Histórico

---

# PARTE I — AUTORIDADE E ARQUITETURA

## 0. Propósito e autoridade

Este documento define as estruturas de tela reutilizáveis da COSMARIA. Seu objetivo é impedir que cada nova tela seja composta do zero, com ordem, largura, densidade, estados e ações decididos localmente.

A hierarquia obrigatória é:

**Regras de negócio e fluxos → Design System → Visual Language → UI Kit → Component Library → Screen Templates → Telas específicas.**

Uma tela específica deve escolher o template adequado, inserir conteúdo real e aplicar as regras funcionais já aprovadas. Ela não pode alterar a anatomia do template apenas para acomodar preferência estética ou conveniência de uma entrega.

### 0.1 O que este documento define

- shells de aplicação;
- regiões estruturais de página;
- ordem de leitura;
- largura e densidade;
- distribuição de ações;
- componentes permitidos por região;
- variantes estruturais;
- comportamento responsivo;
- composição de estados;
- requisitos de acessibilidade;
- limites de especialização;
- critérios de aceitação.

### 0.2 O que este documento não define

- conteúdo final de cada tela;
- regras de negócio;
- permissões novas;
- navegação não prevista nos fluxos;
- entidades ou APIs;
- anatomia interna de componentes;
- valores visuais diferentes dos documentos 11, 01, 02 e 03;
- implementação técnica.

### 0.3 Regra de precedência

Quando uma necessidade funcional parecer incompatível com um template:

1. confirmar se o fluxo correto foi selecionado;
2. verificar se outro template existente resolve o problema;
3. tentar composição com componentes aprovados;
4. registrar a lacuna;
5. submeter alteração à governança.

A tela não pode criar um “template local” silencioso.

---

## 1. Papel dos templates na hierarquia do produto

O template é a unidade intermediária entre componente e tela.

- O **componente** resolve um problema localizado, como selecionar uma data, apresentar uma entidade ou comunicar um erro.
- O **padrão** define como componentes cooperam para uma tarefa, como um formulário ou uma listagem.
- O **template** organiza padrões e componentes em uma tela reutilizável, com regiões e ordem definidas.
- A **tela** aplica um template a uma função concreta do produto.

**Justificativa:** sem essa camada intermediária, componentes consistentes ainda podem ser combinados de maneira inconsistente. Um bom vocabulário não garante uma boa frase; os templates funcionam como a gramática da plataforma.

---

## 2. Diferença entre componente, padrão, template e tela

| Nível | Pergunta respondida | Exemplo |
| --- | --- | --- |
| Fundação | Com quais valores visuais trabalhamos? | Cor, tipografia, spacing, radius |
| Componente | Qual unidade resolve esta interação? | Button, Text Field, Entity Card |
| Padrão | Como várias unidades resolvem uma tarefa? | Formulário, listagem, feedback |
| Template | Como a tela organiza a tarefa? | Dashboard, Timeline, Analytics |
| Tela | Qual conteúdo e regra concreta são aplicados? | Dashboard Grow, Timeline Clínica |

### 2.1 Regra de não duplicação

Uma diferença de conteúdo não cria novo template. Um novo template só é justificável quando mudam simultaneamente:

- a hierarquia principal;
- a sequência de regiões;
- o modelo de ação;
- o comportamento responsivo;
- e a natureza da tarefa.

Trocar “Ciclo” por “Tratamento” não cria templates diferentes.

---

## 3. Princípios obrigatórios

### 3.1 Uma tarefa principal por tela

Cada template deve tornar evidente a tarefa ou pergunta principal. Informações secundárias podem coexistir, mas não podem competir com ela.

**Justificativa:** reduz carga cognitiva e permite que a mesma estrutura funcione para usuários iniciantes e especialistas.

### 3.2 Uma ação primária por superfície

Cada tela, etapa, formulário, modal ou região independente possui no máximo uma ação primária visível. Ações secundárias têm peso inferior; ações adicionais entram em menu contextual.

### 3.3 Ordem antes de paralelismo

A ordem vertical deve continuar compreensível mesmo quando desktop utiliza colunas. O paralelismo só é permitido para informações relacionadas que se beneficiem de comparação simultânea.

### 3.4 Mobile-first sem perda semântica

A versão mobile define a sequência essencial. Tablet e desktop podem distribuir conteúdo, mas não podem introduzir hierarquia incompatível nem remover privacidade, explicabilidade, limitações ou estados.

### 3.5 Conteúdo antes de decoração

Superfícies, cards e elevação existem para estruturar informação, não para preencher espaço. O template não cria cards quando spacing e heading resolvem o agrupamento.

### 3.6 Estado é parte do layout

Vazio, loading, erro, offline, processamento, privado e Premium não são anexos. Cada template deve prever como essas condições ocupam suas regiões sem deslocamentos arbitrários.

### 3.7 Consistência entre contextos

Core, Grow e Med compartilham anatomia e comportamento. O contexto altera acento, conteúdo, termos e eventualmente densidade permitida, nunca a lógica estrutural básica.

### 3.8 Honestidade visual

Dado observado, estimado, previsto, agregado, privado, desatualizado ou indisponível deve permanecer claramente distinguível. Templates não usam destaque visual para criar certeza inexistente.

---

## 4. Taxonomia oficial

Os templates são classificados por intenção:

1. **Entrada e orientação:** autenticar, escolher contexto, compreender etapas.
2. **Operação:** consultar, criar, editar e acompanhar recursos.
3. **Análise:** interpretar métricas, comparações e insights.
4. **Identidade e comunidade:** apresentar perfis, conteúdo público e relações sociais.
5. **Privacidade e acesso:** informar escopo, consentimento e restrições.
6. **Mídia:** navegar e comparar registros visuais.
7. **Monetização:** apresentar valor, plano e gestão de assinatura.
8. **Administração:** gerenciar políticas, coleções e auditoria.

Cada template recebe um identificador `Txx`. Esse identificador é permanente. Renomear o título não altera o ID; remover ou fundir um template exige depreciação documentada.

---

## 5. Contrato comum de todos os templates

Todo template oficial deve declarar:

1. propósito;
2. arquétipos de UX compatíveis;
3. quando utilizar;
4. quando não utilizar;
5. regiões obrigatórias;
6. regiões opcionais;
7. ordem de leitura;
8. componentes permitidos;
9. hierarquia de ações;
10. variantes estruturais;
11. estados aplicáveis;
12. comportamento mobile;
13. comportamento tablet;
14. comportamento desktop;
15. Dark e Light Mode;
16. Core, Grow e Med;
17. acessibilidade;
18. internacionalização;
19. privacidade, IA ou Premium quando aplicável;
20. anti-patterns;
21. critérios de aceitação;
22. telas conhecidas que o utilizam.

### 5.1 Independência de conteúdo

O template não determina a quantidade exata de entidades, métricas ou campos. Ele define limites, prioridade e comportamento quando o conteúdo cresce.

### 5.2 Independência tecnológica

Termos como cabeçalho, região lateral, rodapé de ação e overlay descrevem função de layout, não implementação.

---

## 6. Regiões estruturais oficiais

### 6.1 Application Shell

Estrutura persistente de navegação, contexto, safe areas e superfície base.

### 6.2 Page Header

Contém identidade da página, contexto, navegação de retorno quando necessária, status prioritário e ações de página.

### 6.3 Context Region

Explica onde o usuário está, qual entidade ou período está sendo observado e quais restrições se aplicam.

### 6.4 Primary Content

Região que responde à tarefa principal. Deve aparecer antes de conteúdo complementar na ordem de leitura.

### 6.5 Supporting Content

Informação auxiliar, histórico, dicas, metadados ou atalhos. Nunca deve conter a única forma de executar a ação principal.

### 6.6 Action Region

Grupo de ações da etapa. Pode ser inline, no cabeçalho ou persistente quando permitido pelo contrato do UI Kit.

### 6.7 Status Region

Área reservada para condição global ou persistente: offline, sincronização, privacidade, processamento, plano ou erro.

### 6.8 Navigation Continuation

Paginação, carregamento incremental, tabs ou progressão entre etapas.

### 6.9 Overlay Region

Modal, bottom sheet, popover ou viewer. Deve ser usado somente quando preservar o contexto é mais útil que navegar para uma nova tela.

### 6.10 Regra de ordem

A ordem semântica preferencial é:

**Status global → Page Header → Contexto → Conteúdo principal → Conteúdo de apoio → Continuação → Ações persistentes.**

A posição visual pode mudar em desktop, mas a ordem de leitura e foco deve permanecer coerente.

---

## 7. Shells oficiais da plataforma

### 7.1 Shell S1 — Aplicativo autenticado mobile

- superfície base;
- status global acima do conteúdo quando necessário;
- Top App Bar de 56px;
- conteúdo rolável;
- Bottom Navigation de 64px mais safe area quando a tela pertence ao nível primário;
- ação persistente apenas quando o fluxo exigir;
- margem lateral mínima de 16px.

### 7.2 Shell S2 — Aplicativo autenticado tablet

- Top App Bar de 64px;
- Sidebar compacta de 72px ou expandida quando houver espaço suficiente;
- área de conteúdo central;
- região de apoio opcional;
- navegação inferior não coexistente com sidebar permanente.

### 7.3 Shell S3 — Aplicativo autenticado desktop

- Sidebar compacta de 72px ou expandida entre 240 e 280px;
- Top App Bar ou Page Header dentro do conteúdo;
- container de aplicação até 1280px, ou 1440px para analytics;
- painel lateral somente quando útil para contexto persistente;
- largura de texto ou formulário limitada, mesmo com viewport ampla.

### 7.4 Shell S4 — Entrada e autenticação

- ausência de navegação principal;
- assinatura COSMARIA discreta;
- conteúdo central até 480px;
- background institucional sem competir com o formulário;
- ajuda, privacidade e termos em região secundária.

### 7.5 Shell S5 — Fluxo focado

Usado em onboarding, wizard, check-in ou criação com alto foco.

- navegação reduzida;
- progresso e retorno controlados;
- conteúdo entre 480 e 720px conforme tarefa;
- uma ação principal;
- preservação explícita de dados.

### 7.6 Shell S6 — Público ou compartilhado

- identidade contextual sem expor conta privada;
- navegação limitada;
- conteúdo público ou por link *(link é escopo de Versão 2 — doc 02 §18)*;
- escopo visível;
- ações condicionadas à autenticação;
- nenhum vazamento entre contextos Grow e Med.

### 7.7 Shell S7 — Administração

- mesma biblioteca e linguagem visual;
- sidebar persistente em desktop;
- densidade compacta permitida;
- trilha de contexto e auditoria visíveis;
- acessibilidade e estados completos permanecem obrigatórios.

### 7.8 Shells proibidos

- shell exclusivo para Grow ou Med com estrutura diferente;
- navegação principal duplicada;
- bottom navigation e sidebar permanente simultâneas;
- shell público que revela relação entre perfis sem consentimento;
- painel administrativo com sistema visual paralelo.

---

## 8. Grid, containers e larguras

### 8.1 Margens e gutters

| Contexto | Regra |
| --- | --- |
| Mobile | margem lateral mínima de 16px |
| Tablet | 24px preferencial |
| Desktop | 24–32px conforme largura |
| Entre colunas | mínimo 24px |
| Entre seções principais | 32–48px |
| Entre componentes relacionados | 8–16px |

### 8.2 Larguras máximas

| Conteúdo | Largura de referência |
| --- | ---: |
| Autenticação e foco único | 480px |
| Formulário padrão | 640px |
| Texto longo ou clínico | 720px |
| Formulário amplo | 800px, excepcional |
| Aplicação geral | 1280px |
| Analytics | 1440px |
| Mídia e comparação visual | 1600px, excepcional |

### 8.3 Justificativa

A largura máxima protege legibilidade e foco. Viewport ampla não obriga conteúdo amplo. Espaço excedente pode ser usado para respiro, navegação ou apoio, nunca para alongar linhas de texto ou campos sem benefício.

### 8.4 Colunas

- mobile: uma coluna principal;
- tablet: até duas colunas controladas;
- desktop: até três regiões funcionais, sendo uma principal e no máximo duas auxiliares;
- cards em grid só são permitidos quando comparação visual paralela melhora a tarefa;
- formulários em múltiplas colunas apenas para campos curtos e semanticamente relacionados.

---

## 9. Hierarquia de conteúdo e ações

### 9.1 Hierarquia de conteúdo

1. localização e contexto;
2. condição urgente ou restrição;
3. título e objetivo;
4. ação principal;
5. conteúdo operacional;
6. histórico ou análise;
7. ações secundárias;
8. metadados e suporte.

### 9.2 Ação primária

- uma por página ou etapa;
- deve usar verbo específico;
- deve permanecer próxima da decisão que confirma;
- pode aparecer no header em telas de leitura ou no fim/pé persistente em formulários;
- não pode duplicar-se em vários pontos com estados diferentes.

### 9.3 Ações secundárias

Até duas visíveis no mesmo grupo. As demais entram no Overflow Menu / Popover.

### 9.4 Ações destrutivas

- separadas visualmente;
- nunca recebem destaque equivalente à ação principal padrão;
- exigem confirmação proporcional ao impacto;
- devem explicar consequências e reversibilidade.

---

## 10. Modelo responsivo

### 10.1 Mobile

- define a ordem essencial;
- uma coluna;
- controles full-width quando necessário;
- ações persistentes respeitam teclado e safe area;
- conteúdo complementar aparece após o principal;
- tabelas migram para lista, agrupamento ou rolagem com alternativa acessível;
- nenhum dado crítico é ocultado.

### 10.2 Tablet

- pode introduzir painel lateral de apoio;
- duas colunas apenas quando há relação clara;
- navegação migra para sidebar quando a largura sustentar conteúdo mínimo;
- overlays podem aumentar de bottom sheet para modal.

### 10.3 Desktop

- conteúdo principal mantém largura adequada;
- paralelismo é usado para comparação e persistência de contexto;
- hover complementa, nunca substitui, estados visíveis;
- teclado e foco são obrigatórios;
- densidade compacta pode ser aplicada em administração e listas complexas.

### 10.4 Reflow obrigatório

Qualquer template deve suportar:

- texto ampliado;
- labels longos;
- ausência de mídia;
- múltiplos status;
- teclado virtual;
- orientação de dispositivo;
- safe areas;
- alteração de idioma.

---

## 11. Modelo de estados

Templates tratam estados em três níveis:

### 11.1 Estado global

Afeta toda a tela ou aplicação: offline, sessão expirada, manutenção, Modo Discreto ou restrição de conta.

### 11.2 Estado de região

Afeta uma seção: lista sem resultados, gráfico carregando, galeria com erro ou painel Premium.

### 11.3 Estado de ação

Afeta controle ou tarefa: salvando, enviando, validando, processando ou concluído.

### 11.4 Regra de prioridade

1. segurança e privacidade;
2. erro crítico;
3. offline ou conflito;
4. processamento necessário;
5. permissão ou entitlement;
6. vazio;
7. conteúdo normal.

### 11.5 Proibição de substituição total desnecessária

Uma região com erro não deve eliminar conteúdo funcional de outras regiões. Loading parcial preserva contexto já disponível.

---

## 12. Acessibilidade transversal

Todo template deve:

- possuir um `heading` principal único e ordem de headings coerente;
- definir landmarks e regiões nomeáveis;
- manter ordem de foco igual à ordem semântica;
- levar o foco ao título ao navegar para nova tela;
- anunciar mudanças assíncronas relevantes;
- preservar acesso ao conteúdo completo com texto ampliado;
- não depender de cor, posição, hover, gesto ou movimento;
- manter alvos mínimos de 44×44px;
- fornecer resumo textual para gráficos;
- permitir salto para conteúdo principal em desktop quando aplicável;
- manter ações persistentes acessíveis sem cobrir conteúdo;
- evitar rolagem em duas direções, salvo mídia e tabela justificadas.

### 12.1 Critério de reprovação

Se a tela só puder ser compreendida pela sua disposição visual, o template foi aplicado incorretamente.

---

## 13. Conteúdo e internacionalização

- títulos descrevem o objeto ou tarefa, não o tipo de layout;
- subtítulos explicam contexto, não repetem o título;
- labels permanecem visíveis; placeholder não os substitui;
- datas, horas, números e unidades seguem locale;
- largura não depende de palavras portuguesas curtas;
- truncamento não é permitido em dado clínico, status crítico, ação principal ou valor necessário para comparação;
- textos extensos devem reflow e expandir a altura;
- siglas técnicas devem ter explicação acessível no primeiro uso;
- conteúdo do Med usa linguagem clínica não diagnóstica;
- IA diferencia observação, inferência, previsão e recomendação.

---

## 14. Privacidade, Modo Discreto, IA e Premium

### 14.1 Privacidade

Qualquer template que compartilhe, exporte ou apresente conteúdo de terceiros deve tornar visível:

- contexto do perfil;
- escopo de visibilidade;
- conteúdo incluído;
- possibilidade de reversão;
- consequência da ação.

### 14.2 Modo Discreto

- substitui ou oculta conteúdo sensível sem quebrar estrutura;
- preserva ações necessárias;
- comunica que a proteção está ativa;
- não usa blur como única proteção;
- não deixa informação sensível em thumbnail, preview ou estado de sistema.

### 14.3 Inteligência Artificial

Templates de IA devem reservar regiões para:

- dado observado;
- conclusão;
- confiança;
- limitações;
- período;
- ação sugerida;
- feedback do usuário.

### 14.4 Premium

Templates Premium devem:

- mostrar o valor antes da conversão;
- informar o limite atual;
- manter retorno claro;
- não degradar conteúdo gratuito;
- não misturar cor Premium com sucesso ou alerta;
- não esconder preço, renovação ou gestão.

---

## 15. Regras de composição entre componentes

### 15.1 Aninhamento

- card dentro de card é proibido como padrão;
- no máximo um nível de expansão em lista ou timeline;
- modal não abre outro modal;
- tabs não contêm tabs equivalentes;
- painel lateral não contém navegação principal paralela.

### 15.2 Densidade

- cada card responde a uma pergunta;
- cada painel estatístico possui uma métrica principal;
- cada gráfico responde a uma pergunta analítica;
- cada banner comunica uma condição;
- cada modal solicita uma decisão.

### 15.3 Continuidade

- filtros e ordenação mantêm estado ao retornar;
- listas preservam posição quando o usuário abre um detalhe e volta;
- formulários preservam conteúdo em navegação permitida;
- tabs não redefinem filtros sem comunicação;
- ações assíncronas informam recebimento, progresso, preservação e resultado.

---
# PARTE II — TEMPLATES DE ENTRADA E ORIENTAÇÃO

## 16. Template T01 — Entrada e Autenticação

**Arquétipo compatível:** T5 — Onboarding/Wizard.  
**Shell:** S4 — Entrada e autenticação.  
**Aplicações conhecidas:** Cadastro, Login e recuperação de acesso quando prevista pelos fluxos.

### Propósito

Permitir entrada segura na plataforma com o menor ruído possível, preservando confiança institucional, privacidade e clareza.

### Quando utilizar

- autenticação;
- criação de conta;
- confirmação de identidade;
- retomada de acesso.

### Quando não utilizar

- onboarding funcional após autenticação;
- escolha de contexto Grow/Med;
- formulário de entidade;
- atualização de dados de conta dentro do aplicativo.

### Regiões obrigatórias

1. assinatura institucional;
2. título e instrução curta;
3. formulário principal;
4. ação primária;
5. alternativa de acesso ou criação;
6. ajuda, termos e privacidade;
7. feedback de erro ou processamento.

### Hierarquia e composição

- container central de até 480px;
- uma única superfície funcional;
- formulário sem cards internos;
- campos em uma coluna;
- ação primária full-width no mobile;
- links de suporte abaixo da ação, com hierarquia terciária;
- informações legais separadas do grupo transacional.

### Componentes permitidos

Text, Icon, Image institucional opcional, Text Field, Checkbox, Button, Link, Inline Validation, Banner, Loading Indicator e Modal Dialog somente para condição necessária.

### Variantes

- Login;
- Cadastro;
- Verificação;
- Recuperação.

A variante altera conteúdo e quantidade de campos, não shell, largura ou ordem básica.

### Estados

- inicial;
- validação inline;
- credencial inválida;
- processamento;
- conexão indisponível;
- conta ou sessão restrita;
- sucesso com encaminhamento.

### Responsividade

- mobile: conteúdo ocupa largura disponível com margem de 16px; assinatura no topo; ação próxima aos campos;
- tablet/desktop: conteúdo central; imagem ou ambientação pode ocupar região lateral apenas quando não competir com formulário;
- texto ampliado aumenta altura, nunca cria rolagem horizontal.

### Acessibilidade

- foco inicial no heading ou primeiro campo conforme contexto;
- erros associados aos campos e anunciados;
- alternativa de mostrar senha deve ser nomeada;
- links e botões não podem compartilhar aparência ambígua;
- timeout ou bloqueio deve informar solução.

### Anti-patterns

- carrossel promocional;
- excesso de slogans;
- formulário sobre imagem de baixo contraste;
- campos sem label;
- múltiplas ações primárias;
- esconder política ou recuperação;
- usar estética Grow ou Med antes da escolha de contexto.

### Critérios de aceitação

- [ ] Tarefa principal compreensível em menos de uma leitura.
- [ ] Container não ultrapassa 480px.
- [ ] Existe uma ação primária.
- [ ] Todos os erros preservam o conteúdo digitado quando seguro.
- [ ] A experiência é institucional Core.

---

## 17. Template T02 — Escolha de Propósito ou Contexto

**Arquétipo compatível:** T5.  
**Shell:** S5 — Fluxo focado.  
**Aplicações conhecidas:** escolha inicial Grow, Med ou ambos; seleção contextual quando prevista pelo fluxo.

### Propósito

Permitir que o usuário compreenda e selecione o contexto de uso sem confundir produtos, revelar dados sensíveis ou criar a impressão de contas separadas.

### Regiões obrigatórias

1. título e explicação;
2. opções de contexto;
3. resumo da opção selecionada;
4. ação de continuar;
5. informação sobre possibilidade de alteração futura, quando verdadeira.

### Composição

- até três opções visíveis em paralelo no desktop;
- mobile em sequência vertical;
- cada opção usa superfície equivalente, ícone, nome, descrição e estado selecionado;
- nenhuma opção pode parecer plano de preço;
- “Ambos” deve ser tratado como combinação de contextos, não como produto superior.

### Componentes permitidos

Text, Icon, Image/Illustration funcional, Radio Group ou Entity Card selecionável, Button, Inline Validation e Step Indicator quando fizer parte de onboarding maior.

### Variantes

- seleção única obrigatória;
- seleção múltipla permitida;
- contexto já configurado, apenas para entrada.

### Estados

- nenhuma seleção;
- selecionado;
- indisponível por permissão;
- carregando preferência existente;
- erro ao salvar.

### Responsividade

- mobile: opções empilhadas, conteúdo integral, botão após seleção;
- tablet: duas colunas quando houver duas opções principais;
- desktop: cartões de mesma altura apenas se texto ampliado não for cortado.

### Acessibilidade

A semântica deve equivaler a um grupo de seleção. O estado não pode depender apenas de borda ou cor. Descrições completas precisam ser lidas antes da confirmação.

### Anti-patterns

- comparar Grow e Med como concorrentes;
- usar Med com visual recreativo;
- pré-selecionar uma opção por interesse comercial;
- esconder a opção de ambos quando funcionalmente disponível;
- criar duas contas ou perfis públicos automaticamente visíveis.

### Critérios de aceitação

- [ ] Opções possuem peso visual equivalente.
- [ ] Seleção é inequívoca sem depender de cor.
- [ ] Ação principal só confirma estado válido.
- [ ] Nenhum texto implica exposição entre contextos.

---

## 18. Template T03 — Onboarding Guiado

**Arquétipo compatível:** T5.  
**Shell:** S5.  
**Aplicações conhecidas:** Onboarding Grow, Onboarding Med e primeiro tratamento.

### Propósito

Introduzir conceitos e coletar configuração mínima para o primeiro valor, sem antecipar toda a complexidade da plataforma.

### Princípio central

**Uma decisão significativa por passo.** Campos altamente relacionados podem coexistir, mas cada etapa deve possuir um objetivo verbal único.

### Regiões obrigatórias

1. navegação de retorno quando permitida;
2. Step Indicator ou progresso textual;
3. título e instrução;
4. conteúdo da etapa;
5. ajuda contextual opcional;
6. ação principal;
7. ação secundária ou pular quando permitido;
8. status de salvamento.

### Composição

- largura entre 480 e 640px;
- fluxo vertical;
- instrução curta antes dos controles;
- conteúdo educativo deve aparecer próximo à decisão, não em telas introdutórias longas;
- dados avançados permanecem ocultos ou opcionais conforme Complexidade Progressiva;
- progresso não deve prometer número fixo se etapas forem condicionais, salvo quando recalculado corretamente.

### Variantes

- linear curto;
- linear longo com salvamento;
- adaptativo por respostas;
- onboarding informativo com escolha final.

### Estados

- etapa inicial;
- preenchimento parcial;
- validação;
- salvamento automático;
- offline com rascunho local;
- erro recuperável;
- conclusão.

### Responsividade

- mobile: ação segura acima da safe area; teclado não cobre campo ou CTA;
- tablet/desktop: conteúdo continua estreito; ilustração de apoio pode ocupar coluna secundária, mas desaparece antes de reduzir legibilidade;
- progresso e ações permanecem em ordem de foco.

### Acessibilidade

- cada etapa anuncia posição e título;
- foco vai ao heading após avançar ou voltar;
- progresso visual possui equivalente textual;
- opção de pular explica consequência;
- dados preservados ao voltar.

### Anti-patterns

- tour de funcionalidades sem ação;
- coletar dados não necessários ao primeiro valor;
- obrigar parâmetros especialistas;
- ilustração maior que o conteúdo;
- esconder número de etapas previsíveis;
- bloquear saída sem explicar salvamento.

### Critérios de aceitação

- [ ] Cada etapa possui objetivo único.
- [ ] Voltar preserva dados.
- [ ] Interrupção não perde progresso quando o fluxo for longo.
- [ ] Campos avançados não dominam o primeiro uso.
- [ ] Conclusão leva diretamente ao valor prometido.

---

## 19. Template T04 — Wizard Transacional

**Arquétipo compatível:** T5.  
**Shell:** S5.  
**Aplicações conhecidas:** Fluxo de Colheita, criação complexa, processos com dependências sequenciais.

### Propósito

Conduzir uma operação com múltiplas etapas dependentes, revisão e confirmação, evitando um formulário excessivamente longo ou decisões fora de ordem.

### Diferença para onboarding

O onboarding prepara o usuário para usar o produto. O wizard conclui uma transação ou cria um recurso. Seu foco é precisão e reversibilidade, não educação geral.

### Regiões obrigatórias

1. contexto do recurso;
2. progresso;
3. etapa atual;
4. conteúdo;
5. resumo persistente opcional;
6. ações voltar/continuar;
7. status de rascunho;
8. revisão antes de conclusão quando impacto justificar.

### Variantes

- curto: 2–4 etapas;
- padrão: 5–7 etapas;
- condicional: etapas variam por escolha;
- revisão final obrigatória.

### Composição

- conteúdo principal até 640px;
- resumo lateral desktop apenas quando reduz erro;
- ações persistentes são permitidas em fluxos longos;
- etapa não concluída não deve parecer concluída;
- o usuário deve saber quais dados serão criados ou alterados.

### Estados

- rascunho;
- etapa válida/inválida;
- salvando;
- offline com envio pendente;
- processamento final;
- erro parcial;
- sucesso com próximo destino.

### Responsividade

- mobile: resumo aparece em seção expansível antes da confirmação;
- desktop: resumo pode ficar lateral, sem duplicar ações;
- progress indicator adapta labels longos para número + título atual.

### Acessibilidade

- etapas são uma lista ordenada;
- estado atual e concluído são anunciados;
- erro leva ao primeiro campo inválido;
- revisão final usa headings e grupos claros;
- confirmação não depende apenas de ícone.

### Anti-patterns

- wizard para dois campos simples;
- uma etapa por campo;
- impedir retorno sem razão funcional;
- alterar resposta anterior silenciosamente;
- concluir sem revisão quando a ação for irreversível;
- abrir modal em cima de cada etapa.

### Critérios de aceitação

- [ ] A ordem entre etapas é funcionalmente necessária.
- [ ] O usuário conhece progresso e estado de salvamento.
- [ ] Etapas condicionais são atualizadas sem contradição.
- [ ] Existe recuperação de falha final sem perda do rascunho.

---

# PARTE III — TEMPLATES OPERACIONAIS

## 20. Template T05 — Dashboard

**Arquétipo compatível:** T2 — Listagem/Feed.  
**Shell:** S1, S2 ou S3.  
**Aplicações conhecidas:** Dashboard Grow, Dashboard Med e visões Core quando necessárias.

### Propósito

Priorizar o que requer atenção agora, oferecer uma ação principal e resumir progresso sem transformar a página em mosaico de métricas.

### Pergunta principal

**“O que devo entender ou fazer agora?”**

### Regiões obrigatórias

1. Page Header com contexto do aplicativo;
2. Status Region global;
3. ação prioritária do dia;
4. resumo operacional;
5. entidades ativas;
6. tarefas ou pendências;
7. alertas;
8. métricas essenciais;
9. conteúdo secundário.

A ausência de uma região deve refletir inexistência funcional, não preferência visual.

### Ordem de prioridade

1. condição crítica;
2. ação temporal ou pendente;
3. estado das entidades ativas;
4. tarefas;
5. alertas não críticos;
6. métricas;
7. exploração e conteúdo secundário.

### Componentes permitidos

Page Header, Banner, Button, Entity Card compacto, List Item, AI Alert Card, Statistics Panel, Time-Series Chart quando justificado, Empty State, Skeleton, Offline/Sync Status e Paywall contextual.

### Variantes

- operacional: tarefas e ações dominantes;
- acompanhamento: entidades e progresso dominantes;
- Core: conta, privacidade e assinatura;
- primeiro uso: vazio orientado para criação.

### Regras de layout

- container de até 1280px; 1440px somente quando analytics significativo coexistir;
- mobile em narrativa vertical;
- tablet com duas colunas controladas;
- desktop usa grade assimétrica, com região principal mais larga;
- no máximo um gráfico principal acima da dobra;
- cards não devem receber altura fixa quando conteúdo variar;
- ação prioritária não pode competir com cinco atalhos equivalentes.

### Aplicação por contexto

**Grow:** ciclos ativos, fase, check-in, tarefas, condições e alertas.  
**Med:** tratamento ativo, linha de base, doses, sessão pendente, evolução e alertas.  
**Core:** conta, acesso, privacidade, notificações e assinatura.

### Estados

- vazio de primeiro uso;
- loading com skeleton estrutural;
- erro de região;
- offline com dados em cache;
- conteúdo parcial;
- Premium contextual;
- Modo Discreto.

### Responsividade

- mobile: região principal primeiro; cards e listas em uma coluna; métricas em até duas colunas somente se legíveis;
- tablet: principal + apoio;
- desktop: paralelismo útil, nunca card soup;
- regiões podem mudar de coluna, não de prioridade semântica.

### Acessibilidade

- ordem de leitura igual à prioridade;
- cada região possui heading;
- alertas críticos são anunciados, mas não interrompem repetidamente;
- gráficos têm resumo textual;
- cards clicáveis têm nome completo.

### Anti-patterns

- mosaico uniforme de cards;
- KPIs sem contexto;
- gráfico em todo bloco;
- saudação ocupando mais espaço que ações;
- atalhos duplicando navegação principal;
- conteúdo social acima de tarefa crítica;
- uso de cores semânticas como decoração.

### Critérios de aceitação

- [ ] A ação mais importante é identificável em poucos segundos.
- [ ] O dashboard funciona sem gráficos.
- [ ] Cada região responde a uma pergunta diferente.
- [ ] A ordem mobile preserva prioridade.
- [ ] Erros locais não eliminam o restante do dashboard.

---

## 21. Template T06 — Lista de Coleção

**Arquétipo compatível:** T2.  
**Shell:** S1–S3 ou S7.  
**Aplicações conhecidas:** tarefas, modelos, genéticas, tratamentos, produtos, ciclos, coleções administrativas.

### Propósito

Permitir localizar, avaliar e agir sobre um conjunto de recursos homogêneos com densidade controlada.

### Regiões obrigatórias

1. Page Header;
2. contagem ou contexto da coleção;
3. ação de criação quando permitida;
4. busca, filtro e ordenação quando necessários;
5. lista principal;
6. continuação ou paginação;
7. estados de coleção.

### Variantes

- simples: coleção pequena sem busca;
- operacional: status e ação rápida;
- densa: administração ou dados avançados;
- selecionável: escolha de um recurso;
- seleção múltipla explícita.

### Componentes permitidos

Search Field, Filter Bar, Segmented Control, Select/Dropdown, List Item, Status Badge, Entity Card compacto, Pagination, Incremental Loading, Empty State, Skeleton e Screen Error State.

### Regras de layout

- listas são preferenciais para comparação sequencial e metadados;
- grid não deve ser usado apenas por aparência;
- item mantém anatomia consistente em toda a coleção;
- cabeçalho da coleção não rola horizontalmente separado dos itens;
- ação de criação fica no header ou após estado vazio, nunca duplicada sem razão;
- seleção múltipla entra em modo visível e reversível.

### Estados

- coleção vazia;
- nenhum resultado após filtro;
- carregando;
- carregando continuação;
- erro inicial;
- erro de continuação;
- offline/cache;
- item em processamento;
- conteúdo privado ou removido.

### Responsividade

- mobile: itens em largura total; filtros em bottom sheet quando numerosos;
- tablet/desktop: filtros podem ficar inline; densidade compacta apenas quando apropriada;
- tabelas administrativas podem substituir itens em desktop, com alternativa responsiva.

### Acessibilidade

- contagem de resultados anunciada após busca;
- lista usa estrutura semântica;
- seleção múltipla informa quantidade;
- ações por item são nomeadas com o recurso;
- paginação possui estado atual claro.

### Anti-patterns

- misturar anatomias de item;
- menu de ações sempre aberto;
- filtros sem resumo;
- limpar filtros ao voltar de um detalhe;
- esconder ordenação atual;
- usar infinite scroll quando o usuário precisa retomar posição precisa.

### Critérios de aceitação

- [ ] Coleção pode ser examinada sem abrir todos os itens.
- [ ] Filtros e ordenação permanecem visíveis ou resumidos.
- [ ] Retorno preserva posição.
- [ ] Vazio inicial e zero resultados possuem mensagens diferentes.

---

## 22. Template T07 — Biblioteca em Grid

**Arquétipo compatível:** T2.  
**Shell:** S1–S3.  
**Aplicações conhecidas:** biblioteca de genéticas, modelos reutilizáveis e coleções visuais.

### Propósito

Apresentar recursos cuja identificação visual ou comparação paralela seja mais importante que leitura linear de metadados.

### Quando utilizar

- itens possuem imagem, preview ou estrutura visual relevante;
- o usuário reconhece o recurso pela aparência;
- múltiplos itens podem ser comparados lado a lado sem dados extensos.

### Quando não utilizar

- tarefas, auditoria ou dados clínicos densos;
- itens exigem mais de três métricas;
- principal distinção é textual;
- grid força truncamento de conteúdo crítico.

### Regiões

Mesmas do T06, substituindo lista por grid responsivo.

### Regras de grid

- mobile: uma ou duas colunas conforme largura e conteúdo;
- tablet: duas ou três;
- desktop: três ou quatro; mais apenas para thumbnails simples;
- gap de 12px mobile e 16–24px desktop;
- cards equivalentes usam mesma estrutura, não necessariamente altura fixa;
- mídia mantém proporção estável;
- ação principal do card não compete com navegação para detalhe.

### Componentes permitidos

Entity Card, Thumbnail, Image, Status Badge, Search Field, Filter Bar, Pagination/Continuation, Empty State e Skeleton.

### Estados e acessibilidade

Seguem T06. A ordem de foco acompanha a ordem visual. Imagens possuem descrição quando informativas; fallback não altera altura de maneira descontrolada.

### Anti-patterns

- grid para parecer moderno;
- cards com alturas muito diferentes sem ritmo;
- texto clínico truncado;
- hover como única forma de revelar ações;
- mais de quatro colunas de cards ricos.

### Critérios de aceitação

- [ ] A grade melhora reconhecimento ou comparação.
- [ ] O card permanece compreensível sem imagem.
- [ ] Texto ampliado não sobrepõe ações.
- [ ] A ordem de teclado é previsível.

---

## 23. Template T08 — Busca e Resultados

**Arquétipo compatível:** T2.  
**Shell:** S1–S3 ou S6.  
**Aplicações conhecidas:** busca Grow, busca Med e busca estruturada da Comunidade.

### Propósito

Permitir formular uma consulta, compreender o escopo, refinar resultados e distinguir ausência de correspondência de ausência de conteúdo.

### Regiões obrigatórias

1. Page Header com contexto da busca;
2. Search Field dominante;
3. filtros e escopo;
4. resumo da consulta e contagem;
5. resultados;
6. ordenação;
7. continuação;
8. estados e sugestões recuperáveis.

### Composição

- busca permanece próxima do topo;
- escopo Grow/Med nunca é implícito quando a Comunidade está envolvida;
- filtros ativos aparecem como resumo removível;
- resultados usam List Item ou Entity Card conforme conteúdo;
- termo buscado pode ser destacado sem reduzir contraste;
- nenhum resultado oferece revisão da consulta, não criação arbitrária de dado.

### Variantes

- busca simples;
- busca estruturada por parâmetros;
- busca pública;
- seleção de recurso existente.

### Estados

- antes da busca;
- digitando;
- carregando;
- resultados;
- zero resultados;
- erro;
- offline;
- conteúdo filtrado por privacidade;
- resultados parciais.

### Responsividade

- mobile: filtros em sheet quando numerosos; consulta e contagem antes dos resultados;
- desktop: coluna lateral de filtros permitida, mas não deve comprimir resultados abaixo da largura mínima;
- foco pode retornar ao campo sem perder resultados.

### Acessibilidade

- resultados e contagem são anunciados;
- sugestões são navegáveis por teclado;
- filtros formam grupos nomeados;
- destaque do termo não depende de cor;
- conteúdo privado não revela metadados indevidos.

### Anti-patterns

- misturar resultados Grow e Med sem separação autorizada;
- buscar a cada tecla sem feedback ou controle;
- filtros ocultos sem indicador ativo;
- zero resultados genérico;
- alterar o termo ao aplicar filtro.

### Critérios de aceitação

- [ ] Consulta atual e escopo estão visíveis.
- [ ] Filtros ativos podem ser removidos individualmente.
- [ ] Zero resultados não se confunde com erro.
- [ ] Resultados protegidos não vazam conteúdo.

---

## 24. Template T09 — Detalhe de Entidade

**Arquétipo compatível:** T3 — Detalhe/Timeline.  
**Shell:** S1–S3 ou S6.  
**Aplicações conhecidas:** Ambiente, Planta, Ciclo, Lote, Tratamento, Produto, Growlog e modelos.

### Propósito

Consolidar identidade, estado atual, ações, métricas, histórico e relações de uma entidade sem transformar a tela em um dashboard genérico.

### Pergunta principal

**“Qual é o estado desta entidade e o que posso fazer com ela?”**

### Regiões obrigatórias

1. Back Navigation/Breadcrumb;
2. identidade da entidade;
3. até dois status prioritários;
4. ação principal e menu secundário;
5. resumo essencial;
6. conteúdo detalhado;
7. timeline ou histórico quando aplicável;
8. entidades relacionadas;
9. privacidade, IA ou Premium quando aplicável.

### Variantes

- operacional: ação e estado atual dominantes;
- histórico: timeline dominante;
- público: identidade e conteúdo compartilhado;
- analítico: métricas e relatório;
- somente leitura.

### Regras de layout

- mobile: sequência única; identidade antes de ação; tabs somente quando seções extensas justificarem;
- desktop: coluna principal + apoio de até 320px para status, metadados ou ações;
- ação principal não deve ser repetida em cada seção;
- dados relacionados usam lista ou cards neutros, sem card dentro de card;
- no máximo um nível de tabs;
- status persistente aparece próximo da identidade.

### Componentes permitidos

Page Header, Back Navigation/Breadcrumb, Status Badge, Button, Overflow Menu, Entity Card, Statistics Panel, Timeline, Media Gallery, Time-Series Chart, AI Explainability Card, Visibility Scope Selector, Paywall, Banner e Permission/Private State.

### Estados

- carregando identidade;
- carregamento parcial;
- vazio de histórico;
- erro de seção;
- entidade privada;
- removida ou inexistente;
- offline/cache;
- processamento;
- Modo Discreto.

### Responsividade

- mobile: conteúdo auxiliar após principal;
- tablet: apoio pode ficar lateral;
- desktop: tabs ou âncoras de seção podem persistir, desde que não criem segunda navegação principal;
- mídia ampla pode usar container maior sem alongar texto.

### Acessibilidade

- heading principal é o nome da entidade;
- status são lidos após o título;
- ações nomeiam a entidade quando necessário;
- tabs preservam foco e estado;
- timeline e gráficos possuem alternativas semânticas.

### Anti-patterns

- transformar cada seção em card elevado;
- mais de dois status competindo no header;
- ações destrutivas junto à primária;
- duplicar resumo e detalhe;
- ocultar escopo público;
- usar tabs para seções curtas.

### Critérios de aceitação

- [ ] Identidade e estado são compreendidos antes do histórico.
- [ ] Existe no máximo uma ação principal.
- [ ] Seções podem falhar independentemente.
- [ ] Public/Private/Discreet são claros sem revelar conteúdo.

---

## 25. Template T10 — Formulário Curto

**Arquétipo compatível:** T1 — Criação/Edição.  
**Shell:** S1–S3 ou S5.  
**Aplicações conhecidas:** registrar efeito, manejo, sanidade, tarefa, produto simples e edições pontuais.

### Propósito

Concluir uma tarefa de entrada pequena em uma sequência única, sem wizard, cards ou distrações.

### Critério de uso

Usar quando o formulário:

- cabe em uma seção;
- possui até aproximadamente oito controles principais;
- não exige dependências complexas;
- pode ser compreendido em uma leitura.

### Regiões

1. Page Header ou título focado;
2. instrução opcional;
3. formulário;
4. feedback inline;
5. status de rascunho quando aplicável;
6. ações salvar/cancelar.

### Layout

- largura máxima de 640px;
- uma coluna;
- campos relacionados podem compartilhar linha no desktop apenas se curtos;
- 16px entre campos; 24–32px antes de ações;
- ação principal no fim; pode persistir no mobile quando o teclado não a cobrir;
- opção destrutiva, se houver, fica em região separada.

### Estados

- inicial;
- alterado;
- válido/inválido;
- salvando;
- salvo;
- offline com rascunho;
- erro de envio;
- read-only.

### Acessibilidade

- labels persistentes;
- erro junto ao campo;
- resumo somente quando múltiplos erros;
- foco no primeiro erro após envio;
- agrupamentos semanticamente nomeados.

### Anti-patterns

- formulário em modal amplo sem necessidade;
- card para cada campo;
- duas colunas no mobile;
- salvar desabilitado sem explicação;
- campo opcional sem indicação consistente;
- sucesso apenas por toast se a tela precisa mudar de estado.

### Critérios de aceitação

- [ ] A tarefa cabe em uma sequência.
- [ ] Ação principal aparece após os campos.
- [ ] Estado de salvamento é explícito.
- [ ] Conteúdo digitado é preservado em erro recuperável.

---

## 26. Template T11 — Formulário Longo e Seccionado

**Arquétipo compatível:** T1.  
**Shell:** S1–S3.  
**Aplicações conhecidas:** criar/editar ciclo, tratamento, ambiente e configurações complexas.

### Propósito

Organizar muitos campos em uma única tela quando a edição contínua é mais eficiente que um wizard.

### Quando utilizar

- seções podem ser preenchidas em ordem flexível;
- o usuário precisa revisar o conjunto;
- dependências não exigem bloqueio entre etapas;
- usuários experientes se beneficiam de acesso direto.

### Regiões obrigatórias

1. Page Header;
2. resumo da entidade ou instrução;
3. navegação de seções opcional;
4. seções do formulário;
5. complexidade progressiva;
6. resumo de erros;
7. status de salvamento;
8. ações persistentes ou finais.

### Composição

- container de 640px; até 800px para campos relacionados em paralelo;
- seções separadas por heading e spacing, não necessariamente por cards;
- navegação lateral de âncoras apenas em desktop e formulários extensos;
- campos avançados aparecem em seção coerente, não dispersos;
- ações persistentes são permitidas quando a rolagem for longa;
- autosave e salvar explícito não devem coexistir sem papel claro.

### Variantes

- criação;
- edição;
- criação a partir de modelo;
- modo essencial;
- modo especialista;
- somente leitura parcial.

### Estados

- rascunho local;
- alterações não salvas;
- salvamento por seção;
- erro inline e resumo;
- conflito;
- offline;
- campos Premium;
- campos sem permissão.

### Responsividade

- mobile: navegação por seções vira índice expansível ou desaparece; tudo em uma coluna;
- desktop: âncoras laterais podem persistir; ações em barra inferior ou header;
- teclado virtual e texto ampliado não podem esconder CTA.

### Acessibilidade

- seções usam headings;
- resumo de erro lista links para campos;
- conteúdo revelado progressivamente recebe foco apropriado;
- controles Premium informam motivo sem parecer erro;
- ordem de tabulação acompanha leitura.

### Anti-patterns

- usar tabs para dividir um único formulário sem salvamento independente;
- ocultar campos preenchidos ao mudar complexidade;
- salvar silenciosamente sem status;
- campo avançado misturado ao essencial sem agrupamento;
- coluna lateral mais larga que o formulário.

### Critérios de aceitação

- [ ] Seções são compreensíveis isoladamente.
- [ ] O usuário pode localizar erros.
- [ ] Mudança de complexidade não perde dados.
- [ ] Existe estratégia explícita de rascunho e conflito.

---

## 27. Template T12 — Registro Rápido e Check-in

**Arquétipo compatível:** T1, variante rápida.  
**Shell:** S5 ou S1.  
**Aplicações conhecidas:** Check-in Diário Grow, linha de base Med e registros recorrentes de poucos segundos.

### Propósito

Permitir registro frequente com baixa fricção, mantendo precisão, contexto temporal e possibilidade de aprofundamento opcional.

### Princípio central

**O essencial primeiro; o detalhe continua disponível sem dominar.**

### Regiões obrigatórias

1. contexto de data, tratamento/ciclo ou entidade;
2. progresso quando houver grupos;
3. controles essenciais;
4. opção de adicionar detalhe;
5. resumo antes de enviar quando necessário;
6. ação principal;
7. confirmação clara.

### Composição

- largura entre 480 e 640px;
- um grupo de decisão por seção;
- Intensity Scale e Numeric/Measurement Field recebem labels completos;
- controles devem favorecer toque e teclado adequado;
- ação principal pode ser persistente;
- detalhes avançados expandem no mesmo fluxo;
- valor anterior pode ser mostrado como contexto, nunca pré-preenchido como se fosse atual.

### Variantes

- check-in de escalas;
- check-in técnico;
- registro rápido de tarefa concluída;
- sessão antes/depois;
- atualização de estado.

### Estados

- não iniciado;
- parcial;
- válido;
- salvando;
- salvo;
- offline com envio pendente;
- sessão aguardando etapa posterior;
- erro recuperável.

### Responsividade

- mobile é a referência principal;
- desktop mantém largura focada;
- controles nunca se espalham por toda viewport;
- labels extremos de escalas não desaparecem.

### Acessibilidade

- escalas têm valor e significado anunciados;
- controles podem ser usados sem gesto preciso;
- confirmação não depende de animação;
- estado pendente explica o que acontecerá depois;
- dados sensíveis respeitam Modo Discreto.

### Anti-patterns

- transformar check-in em formulário longo;
- pedir todos os parâmetros em toda ocorrência;
- usar emoji como escala exclusiva;
- pré-preencher resposta clínica;
- ocultar data ou contexto;
- confirmação genérica sem informar preservação.

### Critérios de aceitação

- [ ] Essenciais podem ser concluídos rapidamente.
- [ ] Aprofundamento é opcional e previsível.
- [ ] Valores anteriores não se confundem com novos.
- [ ] Offline preserva e sinaliza envio pendente.

---

## 28. Template T13 — Timeline

**Arquétipo compatível:** T3 e T7.  
**Shell:** S1–S3 ou dentro de T09.  
**Aplicações conhecidas:** Planta, Ciclo, Ambiente, Evolução Clínica e histórico de atividades.

### Propósito

Apresentar eventos ao longo do tempo com contexto, filtragem e ligação entre registros, sem perder a cronologia.

### Regiões obrigatórias

1. contexto da entidade ou tratamento;
2. período e filtros;
3. ação de registrar evento quando permitida;
4. agrupamentos temporais;
5. eventos;
6. continuação;
7. estados.

### Composição

- uma linha temporal semântica, não necessariamente uma linha gráfica contínua;
- eventos agrupados por dia, semana ou mês conforme escala;
- cada evento apresenta data, tipo, conteúdo e origem;
- mídia e métricas são secundárias ao evento;
- evento de IA mostra confiança e origem;
- filtros não alteram silenciosamente a escala temporal;
- inserção de evento fica próxima do contexto, não repetida em cada item.

### Variantes

- cronologia contínua;
- por fase;
- clínica;
- técnica;
- filtrada por categoria;
- pública, com dimensões privadas removidas.

### Responsividade

- mobile: uma coluna; marcador à esquerda ou acima; mídia abaixo;
- desktop: coluna temporal + conteúdo; filtros podem ficar laterais;
- não usar alternância esquerda/direita, pois prejudica leitura e responsividade.

### Estados

- sem histórico;
- carregando;
- carregando mais;
- erro de continuação;
- evento privado;
- período sem dados;
- dados em cache.

### Acessibilidade

- eventos formam lista ordenada;
- agrupamentos temporais são headings;
- datas completas ficam disponíveis;
- ícones de evento têm texto equivalente;
- filtros e resultado são anunciados.

### Anti-patterns

- linha decorativa dominante;
- alternar eventos dos dois lados;
- esconder tipo do evento apenas por cor;
- misturar ordem crescente e decrescente;
- carregar histórico infinito sem preservação de posição.

### Critérios de aceitação

- [ ] A ordem temporal é inequívoca.
- [ ] Evento pode ser compreendido sem ícone ou cor.
- [ ] Filtros preservam período e posição quando possível.
- [ ] Mídia sensível não aparece sem proteção.

---

## 29. Template T14 — Tarefas e Pendências

**Arquétipo compatível:** T2/T3.  
**Shell:** S1–S3.  
**Aplicações conhecidas:** Lista de Tarefas, lembretes, sessões pendentes e ações sugeridas aceitas.

### Propósito

Organizar ações por urgência, tempo e contexto, permitindo concluir, adiar, abrir ou revisar sem confundir tarefa com notificação.

### Regiões obrigatórias

1. Page Header;
2. resumo de pendências;
3. filtros por estado/período/contexto;
4. grupos de prioridade;
5. itens de tarefa;
6. ação de criação quando permitida;
7. histórico ou concluídas em região secundária.

### Regras de prioridade

- vencidas e críticas primeiro;
- hoje antes de futuras;
- prioridade funcional, não cor, determina ordem;
- tarefa sugerida por IA deve indicar origem;
- conclusão deve produzir feedback local imediato.

### Componentes permitidos

List Item, Checkbox ou Button de conclusão, Status Badge, Filter Bar, Date/Time, AI Alert Card, Banner, Toast e Empty State.

### Variantes

- agenda do dia;
- todas as tarefas;
- tarefas por entidade;
- pendências clínicas;
- histórico concluído.

### Estados

- vazio;
- carregando;
- concluindo;
- reagendada;
- vencida;
- offline com alteração pendente;
- conflito de atualização;
- sem permissão.

### Responsividade

- mobile: grupos verticais; ações secundárias em overflow;
- desktop: lista principal + detalhe selecionado opcional, sem exigir master-detail;
- densidade compacta permitida para grande volume.

### Acessibilidade

- estado concluído não depende de risco ou opacidade;
- ação de concluir nomeia tarefa;
- data relativa possui data completa acessível;
- mudança de grupo é anunciada quando necessário.

### Anti-patterns

- usar notificação como tarefa persistente;
- esconder tarefas concluídas sem acesso;
- permitir concluir por swipe como única forma;
- cor vermelha em toda tarefa vencida;
- misturar contexto Grow e Med sem separação.

### Critérios de aceitação

- [ ] Prioridade e prazo são compreensíveis sem cor.
- [ ] Conclusão possui estado assíncrono seguro.
- [ ] IA é identificada como origem, não como autoridade.
- [ ] Histórico pode ser consultado sem poluir o dia.

---

## 30. Template T15 — Configuração Geral

**Arquétipo compatível:** T4 — Configuração.  
**Shell:** S1–S3.  
**Aplicações conhecidas:** Configurações Gerais, Configurações Grow, Configurações Med e hub de conta.

### Propósito

Apresentar categorias de preferências e destinos de configuração com consequências previsíveis.

### Regiões obrigatórias

1. Page Header;
2. identidade ou status da conta quando relevante;
3. grupos por finalidade;
4. itens de configuração;
5. seção destrutiva separada quando necessária;
6. ajuda e informações legais.

### Composição

- mobile: lista de grupos e destinos;
- desktop: navegação lateral de categorias + conteúdo ou lista principal;
- cada item possui título, descrição opcional, valor atual ou controle;
- switch só é usado para efeito imediato e reversível;
- configurações complexas navegam para T16;
- plano e privacidade são grupos próprios, não misturados com preferências cosméticas.

### Componentes permitidos

List Item, Switch, Select/Dropdown, Status Badge, Profile Link Seal, Discreet Mode Indicator, Button, Link e Banner.

### Estados

- carregando;
- salvando item;
- salvo;
- erro local;
- offline;
- sem permissão;
- configuração bloqueada por política.

### Acessibilidade

- controle e label formam uma unidade;
- valor atual é anunciado;
- switch explica consequência;
- seção destrutiva recebe heading;
- mudanças assíncronas produzem feedback.

### Anti-patterns

- lista única sem agrupamento;
- switches para ações que abrem fluxo;
- descrições vagas;
- esconder plano ou privacidade em menus profundos;
- botão “Salvar tudo” quando cada configuração salva imediatamente.

### Critérios de aceitação

- [ ] Categorias são previsíveis.
- [ ] Itens simples e complexos são distinguíveis.
- [ ] Consequência de privacidade é visível.
- [ ] Ação destrutiva está isolada.

---

## 31. Template T16 — Configuração Detalhada

**Arquétipo compatível:** T4.  
**Shell:** S1–S3.  
**Aplicações conhecidas:** notificações, ambiente outdoor, perfil de aprendizado, vínculo de perfis, política de agregação e preferências avançadas.

### Propósito

Permitir compreender e alterar um conjunto coerente de preferências com explicações, dependências e consequências.

### Regiões obrigatórias

1. retorno e título;
2. objetivo da configuração;
3. status atual;
4. grupos de opções;
5. explicação de impacto;
6. ação de salvar ou autosave;
7. restauração/reset quando permitido.

### Variantes

- autosave;
- salvar explícito;
- configuração com dependências;
- política de privacidade;
- configuração administrativa.

### Composição

- largura de 640–720px;
- controles simples em lista;
- dependências aparecem próximas e visualmente subordinadas;
- opções desabilitadas explicam motivo;
- reset não compete com salvar;
- mudanças de alto impacto exigem confirmação.

### Estados

- carregando valor;
- alterado;
- salvando;
- salvo;
- erro;
- conflito;
- offline;
- política bloqueada;
- reset processando.

### Acessibilidade

- grupos e dependências são anunciados;
- desabilitado não remove explicação;
- confirmação descreve impacto;
- foco retorna à região alterada após modal.

### Anti-patterns

- opção dependente longe do controle pai;
- desabilitar sem motivo;
- misturar autosave e salvar explícito;
- reset silencioso;
- linguagem técnica sem explicação.

### Critérios de aceitação

- [ ] O usuário sabe o estado atual e o efeito da mudança.
- [ ] Dependências são visíveis.
- [ ] Falha não perde alterações locais.
- [ ] Configurações sensíveis têm confirmação proporcional.

---
# PARTE IV — TEMPLATES ANALÍTICOS E DOCUMENTAIS

## 32. Template T17 — Analytics Overview

**Arquétipo compatível:** T7 — Analítico/Insight.  
**Shell:** S2 ou S3; S1 em versão mobile.  
**Aplicações conhecidas:** Comparação entre ciclos, evolução clínica, estatísticas de perfil e digest analítico.

### Propósito

Responder a uma pergunta analítica principal por meio de resumo, métricas e visualizações, sem confundir volume de dados com profundidade.

### Pergunta principal

Cada aplicação deve formular uma pergunta explícita, por exemplo: “Como este ciclo evoluiu?”, “Quais sintomas mudaram no período?” ou “Como o resultado se compara ao histórico?”.

### Regiões obrigatórias

1. Page Header;
2. período, escopo e filtros;
3. resumo executivo;
4. métricas principais;
5. visualização principal;
6. evidências ou visualizações secundárias;
7. dados ausentes e limitações;
8. ações de exportar ou aprofundar quando previstas.

### Hierarquia

- resumo executivo antes dos gráficos;
- período sempre visível;
- no máximo quatro métricas principais acima da dobra;
- uma visualização principal por pergunta;
- visualizações secundárias respondem perguntas derivadas, não repetem a principal;
- limitações próximas das conclusões.

### Componentes permitidos

Date Range Picker, Filter Bar, Statistics Panel, Time-Series Chart, Data Table, Entity Comparison, AI Explainability Card, Confidence Indicator, Aggregated Data Seal, Banner, Empty State e Paywall contextual.

### Variantes

- visão de período;
- visão comparativa;
- visão longitudinal;
- digest periódico;
- analytics de perfil;
- analytics com dados agregados.

### Estados

- cold start;
- dados insuficientes;
- carregando;
- cálculo em processamento;
- sucesso parcial;
- período sem dados;
- erro de região;
- dados desatualizados;
- Premium bloqueado.

### Responsividade

- mobile: métricas em uma ou duas colunas; gráficos em sequência; filtros em sheet;
- tablet: duas regiões analíticas;
- desktop: container até 1440px; paralelismo somente entre visualizações comparáveis;
- nenhuma visualização pode depender de hover.

### Acessibilidade

- resumo textual obrigatório;
- valores de gráficos disponíveis em tabela ou descrição;
- legendas e séries têm nomes completos;
- padrões e formas complementam cor;
- filtros anunciam atualização de resultados;
- intervalos de confiança são explicados.

### Anti-patterns

- dashboard de KPIs sem pergunta;
- dezenas de métricas equivalentes;
- pie charts ou efeitos 3D por decoração;
- eixo truncado sem indicação;
- cor do Grow ou Med usada como escala de bom/ruim;
- conclusão de IA sem limitação.

### Critérios de aceitação

- [ ] A pergunta analítica está clara.
- [ ] Período e escopo são visíveis.
- [ ] Cada gráfico possui finalidade única.
- [ ] Dados ausentes e estimados são declarados.
- [ ] A tela permanece compreensível sem cor ou hover.

---

## 33. Template T18 — Insight e Explicabilidade da IA

**Arquétipo compatível:** T7.  
**Shell:** S1–S3.  
**Aplicações conhecidas:** Tela de Insight, Tela de Recomendação e detalhes de correlações.

### Propósito

Apresentar uma inferência da IA de maneira verificável, limitada e acionável, preservando a distinção entre dado, interpretação e recomendação.

### Regiões obrigatórias

1. contexto e entidade analisada;
2. conclusão principal;
3. período;
4. confiança;
5. dados utilizados;
6. padrão ou cálculo identificado;
7. interpretação;
8. limitações;
9. ação sugerida quando houver;
10. feedback do usuário;
11. disclaimer aplicável.

### Composição

- a conclusão não deve ocupar linguagem ou estilo de diagnóstico;
- confiança aparece junto da conclusão, não escondida no rodapé;
- dados observados precedem a interpretação detalhada;
- limitações têm peso suficiente para leitura;
- ação sugerida é opcional e claramente separada da evidência;
- feedback não compete com a ação principal.

### Componentes permitidos

AI Explainability Card, Confidence Indicator, Aggregated Data Seal, Statistics Panel, Time-Series Chart, Entity Comparison, Button, Banner, Tooltip e Modal Dialog para disclaimer de primeiro uso.

### Variantes

- correlação;
- tendência;
- previsão;
- recomendação;
- comparação automática;
- insight agregado.

### Estados

- carregando;
- processando;
- cold start;
- dados insuficientes;
- confiança baixa;
- insight disponível;
- insight desatualizado;
- erro de cálculo;
- Premium.

### Aplicação por contexto

**Grow:** linguagem técnica, produtiva e baseada em parâmetros.  
**Med:** linguagem clínica, acolhedora, não diagnóstica e explicitamente limitada.  
A anatomia permanece idêntica.

### Responsividade

- mobile: conclusão, confiança e limitação aparecem antes de gráficos;
- desktop: evidências podem ficar ao lado da explicação, mantendo ordem semântica;
- nenhum bloco de explicabilidade é escondido em tooltip.

### Acessibilidade

- confiança possui label textual;
- visualizações têm resumo;
- relações causais não são inferidas visualmente quando apenas correlação existe;
- feedback é operável por teclado;
- disclaimer é lido antes de ação, sem aprisionar o foco.

### Anti-patterns

- avatar de IA como especialista humano;
- brilho ou gradiente que sugira autoridade;
- “certeza” baseada apenas em porcentagem;
- limitação em texto terciário ilegível;
- recomendação apresentada como obrigação;
- ocultar origem agregada.

### Critérios de aceitação

- [ ] Dado observado e interpretação são distinguíveis.
- [ ] Confiança e limitação são visíveis.
- [ ] A ação sugerida não parece automática ou obrigatória.
- [ ] O Med não produz linguagem diagnóstica.

---

## 34. Template T19 — Alerta ou Recomendação da IA

**Arquétipo compatível:** T7.  
**Shell:** S1–S3.  
**Aplicações conhecidas:** Tela de Alerta e recomendação com criação de tarefa sugerida.

### Propósito

Permitir avaliar uma condição detectada, entender sua severidade e evidência e decidir uma ação sem induzir resposta impulsiva.

### Regiões obrigatórias

1. severidade e contexto;
2. condição detectada;
3. evidência;
4. confiança;
5. consequência possível, formulada com cautela;
6. ação sugerida;
7. alternativas, inclusive ignorar ou revisar;
8. status após decisão.

### Hierarquia

- severidade semântica é reservada ao risco, não ao acento do aplicativo;
- a evidência aparece antes da ação;
- ação sugerida usa verbo específico;
- ignorar não é escondido quando permitido;
- alerta resolvido reduz destaque, mas preserva histórico.

### Variantes

- informativo;
- atenção;
- crítico;
- recomendação sem urgência;
- ação já aceita;
- resolvido ou descartado.

### Estados

- novo;
- visualizado;
- aceitando ação;
- tarefa criada;
- ignorado;
- resolvido;
- desatualizado;
- erro.

### Responsividade e acessibilidade

- mobile mantém evidência e ações em sequência;
- desktop pode mostrar série temporal de apoio;
- severidade é comunicada por texto, ícone e estrutura;
- ação crítica nunca depende apenas de cor;
- atualização de status é anunciada.

### Anti-patterns

- modal interrompendo toda abertura do app para alertas não críticos;
- vermelho para recomendação comum;
- criar tarefa sem confirmação;
- ocultar confiança;
- linguagem alarmista no Med;
- apagar alerta ignorado do histórico.

### Critérios de aceitação

- [ ] Severidade é proporcional.
- [ ] Evidência pode ser examinada antes da ação.
- [ ] Aceitar, ignorar e resolver têm estados claros.
- [ ] O histórico preserva decisão e origem.

---

## 35. Template T20 — Comparação

**Arquétipo compatível:** T7.  
**Shell:** S1–S3.  
**Aplicações conhecidas:** comparação entre ciclos, fotos, parâmetros, produtos ou períodos compatíveis.

### Propósito

Comparar entidades ou períodos usando bases equivalentes, destacando diferenças sem declarar vencedor quando a métrica não sustentar essa conclusão.

### Regiões obrigatórias

1. Page Header;
2. seletores dos itens;
3. escopo e período;
4. resumo das bases comparadas;
5. métricas lado a lado;
6. visualizações;
7. diferenças e semelhanças;
8. dados ausentes ou não comparáveis;
9. ação de trocar itens ou exportar quando prevista.

### Regras de comparabilidade

- unidades devem ser iguais ou explicitamente convertidas;
- período e fase precisam ser equivalentes ou a diferença deve ser declarada;
- ausência de dado não equivale a zero;
- estimativa não pode parecer observação;
- destaque positivo/negativo depende da semântica da métrica, não de maior/menor valor automaticamente.

### Variantes

- dois itens;
- múltiplos itens, com limite controlado;
- antes/depois;
- período atual versus histórico;
- mídia lado a lado.

### Layout

- mobile: comparação por métrica em linhas empilhadas, não duas colunas estreitas;
- tablet/desktop: colunas paralelas com cabeçalhos persistentes;
- tabelas devem permitir leitura linear e alternativa responsiva;
- máximo recomendado de quatro séries simultâneas em gráfico, salvo justificativa e distinção acessível.

### Componentes permitidos

Select/Dropdown, Entity Card, Entity Comparison, Data Table, Time-Series Chart, Statistics Panel, Media Viewer, Badge e Banner.

### Estados

- nenhum item selecionado;
- seleção parcial;
- carregando;
- não comparável;
- dados incompletos;
- erro;
- Premium.

### Acessibilidade

- colunas e linhas possuem cabeçalhos;
- diferenças são descritas textualmente;
- cor é complementada por forma, label ou padrão;
- reordenação não altera significado sem anúncio.

### Anti-patterns

- ranking automático;
- destacar “melhor” sem objetivo explícito;
- comparar escalas incompatíveis;
- usar ausência como zero;
- colocar muitas séries no mesmo gráfico;
- obrigar rolagem horizontal no mobile sem alternativa.

### Critérios de aceitação

- [ ] Bases comparadas estão declaradas.
- [ ] Dado ausente e zero são diferentes.
- [ ] Mobile permite comparação por métrica.
- [ ] Nenhum julgamento é inferido apenas por cor.

---

## 36. Template T21 — Relatório

**Arquétipo compatível:** T7.  
**Shell:** S1–S3 para tela; documento exportado obedece identidade institucional.  
**Aplicações conhecidas:** Relatório de Ciclo e Relatório Clínico.

### Propósito

Organizar dados de um período em uma narrativa independente, legível em tela e exportação, com contexto, origem e limitações.

### Regiões obrigatórias

1. identidade do relatório;
2. entidade, pessoa ou contexto;
3. período e data de geração;
4. resumo executivo;
5. metodologia ou origem dos dados;
6. seções temáticas;
7. métricas e visualizações;
8. eventos relevantes;
9. limitações e dados ausentes;
10. privacidade e consentimento;
11. ações de exportar ou compartilhar.

### Variantes

- Grow técnico;
- Med clínico não diagnóstico;
- digest analítico;
- relatório resumido;
- relatório detalhado.

### Composição em tela

- largura de leitura até 720px para texto, com visualizações podendo expandir;
- sumário de seções opcional em relatórios longos;
- ações ficam fora do corpo documental;
- cada seção possui heading e período quando diferente do geral;
- tabelas e gráficos têm interpretação textual neutra.

### Documento exportado

Deve ser compreensível sem o aplicativo e incluir:

- marca e produto;
- data de geração;
- período;
- contexto e escopo;
- origem dos dados;
- paginação;
- aviso aplicável;
- indicação de dados ausentes;
- identificação de conteúdo gerado por IA;
- proteção de dados definida no fluxo.

### Estados

- configurando período;
- processando;
- pronto;
- dados insuficientes;
- erro de geração;
- exportação em andamento;
- exportação concluída;
- acesso Premium.

### Acessibilidade

- headings estruturam documento;
- gráficos possuem tabela ou descrição;
- PDF/exportação deve preservar ordem e texto selecionável quando tecnicamente aplicável;
- linguagem do Med não implica diagnóstico;
- dados sensíveis não são expostos sem consentimento.

### Anti-patterns

- relatório como captura da tela;
- gráfico sem explicação;
- conclusões de IA sem origem;
- esconder período;
- usar layout de dashboard em PDF;
- assinatura visual Grow em relatório Med.

### Critérios de aceitação

- [ ] Documento funciona fora do app.
- [ ] Período, origem e limitações são explícitos.
- [ ] Ações não fazem parte do corpo exportado.
- [ ] O relatório Med é clínico e não diagnóstico.

---

## 37. Template T22 — Exportação e Compartilhamento

**Arquétipo compatível:** T4/T7, transversal.  
**Shell:** S5 ou overlay aprovado quando curto.  
**Aplicações conhecidas:** exportação de dados, relatório e compartilhamento público ou por link *(compartilhamento por link é escopo de Versão 2 — doc 02 §18; MVP cobre exportação e compartilhamento público/seguidores)*.

### Propósito

Permitir escolher conteúdo, formato, período, perfil e escopo antes de gerar ou compartilhar, tornando consequências de privacidade explícitas.

### Regiões obrigatórias

1. objeto a exportar/compartilhar;
2. período;
3. dimensões incluídas;
4. formato;
5. perfil/contexto;
6. escopo de visibilidade quando compartilhado;
7. resumo do que será exposto;
8. ação de gerar ou compartilhar;
9. status e opção de revogar quando aplicável.

### Composição

- fluxo curto pode usar Bottom Sheet; escolhas complexas usam tela focada;
- Privacy Matrix ou Visibility Scope Selector aparece antes da ação;
- resumo final lista dados sensíveis incluídos;
- exportar arquivo e publicar conteúdo são ações diferentes;
- compartilhamento por link informa encontrabilidade e revogação.

### Estados

- configuração;
- consentimento necessário;
- processando;
- pronto;
- erro;
- link ativo;
- revogado;
- expirado quando previsto;
- Premium.

### Responsividade e acessibilidade

- mobile usa uma coluna e revisão final;
- desktop pode mostrar preview lateral;
- controles de privacidade têm explicações acessíveis;
- status do link é textual;
- cópia de link produz feedback sem depender apenas de toast.

### Anti-patterns

- compartilhar com um toque sem revisão;
- presumir perfil Grow ou Med;
- misturar exportação privada com publicação pública;
- esconder dados incluídos;
- gerar link irrevogável sem explicação;
- destacar Premium antes de privacidade.

### Critérios de aceitação

- [ ] O usuário sabe o que, para quem e por quanto tempo será exposto.
- [ ] Perfil/contexto é explícito.
- [ ] Exportar e publicar são distinguíveis.
- [ ] Revogação está acessível quando aplicável.

---

# PARTE V — TEMPLATES DE IDENTIDADE, PRIVACIDADE E COMUNIDADE

## 38. Template T23 — Perfil

**Arquétipo compatível:** T3/T4/T7.  
**Shell:** S1–S3 ou S6.  
**Aplicações conhecidas:** Perfil Público Grow, Perfil Público Med anônimo, estatísticas e edição de perfil.

### Propósito

Apresentar identidade contextual, reputação, conteúdo e ações sem expor vínculo entre contextos ou confundir perfil público com conta privada.

### Regiões obrigatórias

1. identidade contextual;
2. contexto Grow ou Med;
3. nome/avatar ou fallback anônimo;
4. biografia opcional;
5. reputação e estatísticas permitidas;
6. ação seguir/editar conforme relação;
7. conteúdo publicado;
8. escopo e vínculo de perfis quando autorizado.

### Variantes

- próprio perfil;
- perfil de terceiro;
- Grow;
- Med anônimo;
- público por link *(Versão 2 — doc 02 §18)*;
- estatísticas Premium.

### Composição

- identidade antes das métricas;
- reputação explica critério;
- contagem de seguidores não domina;
- vínculo de perfis só aparece com Profile Link Seal autorizado;
- perfil Med continua completo sem nome, avatar ou biografia;
- edição navega para formulário/configuração, não ocorre inteiramente inline.

### Responsividade

- mobile: identidade, ação e conteúdo em sequência;
- desktop: identidade pode ocupar coluna lateral, feed principal no centro;
- estatísticas secundárias ficam após o conteúdo principal ou em região de apoio.

### Acessibilidade

- avatar decorativo não repete nome;
- fallback anônimo possui label apropriado;
- métricas são lidas com contexto;
- ações seguir/deixar de seguir anunciam estado;
- conteúdo sensível e privado é identificado.

### Anti-patterns

- sugerir vínculo Grow↔Med;
- exigir identidade real no Med;
- reputação baseada apenas em popularidade;
- feed subordinado a painel excessivo de métricas;
- mostrar estatística Premium como validação social.

### Critérios de aceitação

- [ ] Contexto do perfil é inequívoco.
- [ ] Conta privada não é exposta.
- [ ] Variante anônima é funcionalmente completa.
- [ ] Vínculo aparece apenas quando autorizado.

---

## 39. Template T24 — Central de Privacidade e Dados

**Arquétipo compatível:** T4.  
**Shell:** S1–S3.  
**Aplicações conhecidas:** consentimentos, exportação, exclusão, conexões Grow↔Med, Modo Discreto e gestão de dados.

### Propósito

Concentrar decisões de privacidade e direitos de dados em uma estrutura compreensível, auditável e reversível quando possível.

### Regiões obrigatórias

1. Page Header;
2. resumo de privacidade atual;
3. Modo Discreto;
4. consentimentos por finalidade;
5. compartilhamentos e links ativos;
6. conexões entre contextos;
7. exportação de dados;
8. exclusão e revogação;
9. histórico ou informação de auditoria acessível;
10. ajuda e contato.

### Composição

- organizar por finalidade, não por linguagem jurídica;
- estado atual sempre visível;
- cada consentimento mostra objetivo, dados e consequência;
- revogação aparece no mesmo nível em que o consentimento foi concedido;
- exclusão fica em seção separada, com impacto e irreversibilidade;
- Modo Discreto não substitui privacidade de dados.

### Componentes permitidos

Discreet Mode Indicator, Switch, List Item, Status Badge, Privacy Matrix, Visibility Scope Selector, Banner, Modal Dialog, Button, Link e Offline/Sync Status.

### Estados

- carregando;
- consentimento ativo/inativo;
- mudança processando;
- revogação pendente;
- exportação processando;
- exclusão agendada ou confirmada quando prevista;
- erro;
- offline;
- política indisponível.

### Responsividade

- mobile: grupos em lista e telas detalhadas;
- desktop: índice lateral + painel de detalhe;
- matrizes complexas ocupam largura adequada sem comprimir texto;
- ações destrutivas nunca ficam fixas ao lado de navegação.

### Acessibilidade

- linguagem direta;
- controles indicam estado e finalidade;
- confirmação descreve consequências;
- matriz possui alternativa linear;
- atualizações são anunciadas;
- dados sensíveis respeitam Modo Discreto e foco.

### Anti-patterns

- consentimento pré-marcado;
- revogação escondida;
- texto jurídico sem resumo;
- agrupar tudo em um único switch;
- confundir anonimização, privacidade e Modo Discreto;
- usar dark patterns para impedir exclusão.

### Critérios de aceitação

- [ ] Estado atual é compreensível sem abrir cada item.
- [ ] Finalidade e consequência são claras.
- [ ] Revogação é tão acessível quanto consentimento.
- [ ] Ação destrutiva é separada e explicada.

---

## 40. Template T25 — Feed da Comunidade

**Arquétipo compatível:** T2.  
**Shell:** S1–S3.  
**Aplicações conhecidas:** Feed Grow e Feed Med.

### Propósito

Apresentar conteúdo social contextual com prioridade para conhecimento e conteúdo, mantendo identidade, privacidade e moderação visíveis.

### Regiões obrigatórias

1. Page Header com contexto Grow ou Med;
2. ação de publicar;
3. filtros ou tópicos quando previstos;
4. feed linear;
5. sugestões ou conteúdo auxiliar em região secundária;
6. estados e moderação.

### Composição

- conteúdo antes de métricas de interação;
- autor, contexto, escopo, data e origem precedem ações sociais;
- mídia respeita proporção e proteção;
- interações são leves e secundárias;
- Grow pode apresentar Fork com origem preservada;
- Med preserva anonimato e linguagem sensível;
- recomendações de perfis nunca cruzam contextos.

### Componentes permitidos

Avatar, Text, Image/Thumbnail, Status Badge, Button, Icon Button, List Item, Media Gallery, Visibility Scope, Profile Link Seal, Banner, Empty State, Skeleton e Overflow Menu.

### Variantes

- feed geral;
- seguindo;
- tópico filtrado;
- feed de perfil;
- contexto Grow;
- contexto Med.

### Estados

- primeiro uso;
- carregando;
- carregando mais;
- erro de continuação;
- conteúdo sensível;
- removido;
- bloqueado;
- offline/cache;
- feed vazio.

### Responsividade

- mobile: feed linear em largura legível;
- desktop: coluna central de conteúdo; lateral pode conter filtros ou contexto, nunca outro feed concorrente;
- conteúdo não deve se estender a 1280px; posts usam largura de leitura controlada.

### Acessibilidade

- cada publicação é artigo ou região nomeável;
- ações incluem nome do autor/conteúdo quando necessário;
- contagens possuem contexto;
- mídia tem descrição;
- conteúdo sensível requer ação acessível para revelar.

### Anti-patterns

- layout de três colunas densas estilo rede social genérica;
- métrica de popularidade maior que conteúdo;
- autoplay;
- cruzar recomendações Grow e Med;
- esconder escopo de publicação;
- usar anonimato Med como aparência incompleta.

### Critérios de aceitação

- [ ] Contexto do feed é sempre visível.
- [ ] Conteúdo domina interações.
- [ ] Privacidade e moderação são acessíveis.
- [ ] Feed não expõe relação entre perfis.

---

## 41. Template T26 — Conteúdo Público e Discussão

**Arquétipo compatível:** T3.  
**Shell:** S1–S3 ou S6.  
**Aplicações conhecidas:** Growlog Público, experiência compartilhada e publicação da Comunidade.

### Propósito

Permitir leitura aprofundada, interação e moderação de uma publicação, preservando autoria, origem, escopo e contexto.

### Regiões obrigatórias

1. retorno;
2. autor e contexto;
3. escopo de visibilidade;
4. conteúdo principal;
5. mídia e dados compartilhados;
6. origem/Fork quando aplicável;
7. interações;
8. comentários;
9. moderação e denúncia;
10. conteúdo relacionado permitido.

### Composição

- largura de leitura até 720px, mídia pode expandir;
- dados estruturados compartilhados aparecem em seções claramente rotuladas;
- dimensões privadas são omitidas sem indicar seu valor;
- comentários têm hierarquia simples;
- no máximo um nível de resposta visual, salvo regra funcional diferente já aprovada;
- ações sociais não ficam fixas cobrindo leitura.

### Estados

- público;
- por link *(Versão 2 — doc 02 §18)*;
- privado;
- removido;
- moderado;
- autor bloqueado;
- comentários fechados quando previsto;
- loading;
- erro.

### Acessibilidade

- conteúdo usa headings;
- mídia possui alternativas;
- comentários são lista ordenada;
- ações de denúncia e bloqueio são nomeadas;
- escopo é anunciado;
- conteúdo removido explica condição sem revelar material.

### Anti-patterns

- mostrar dados privados como placeholders identificáveis;
- respostas infinitamente aninhadas;
- ocultar origem de Fork;
- posicionar denúncia somente em hover;
- recomendar conteúdo de outro contexto.

### Critérios de aceitação

- [ ] Autoria, contexto e escopo são visíveis.
- [ ] Conteúdo pode ser lido sem interações sociais.
- [ ] Moderação é acessível.
- [ ] Dados omitidos não vazam metadados.

---

## 42. Template T27 — Publicação e Compartilhamento

**Arquétipo compatível:** T1.  
**Shell:** S5 ou S1.  
**Aplicações conhecidas:** Publicar Growlog, experiência Med e edição de publicação.

### Propósito

Compor conteúdo, selecionar dados vinculados e confirmar privacidade antes de publicar no perfil contextual correto.

### Regiões obrigatórias

1. perfil/contexto utilizado;
2. conteúdo textual;
3. mídia;
4. dados estruturados selecionáveis;
5. preview;
6. Privacy Matrix ou escopo;
7. resumo de exposição;
8. ação publicar;
9. rascunho e status de envio.

### Composição

- perfil/contexto aparece no início;
- conteúdo e dados selecionados são separados;
- dimensões privadas não são incluídas por padrão;
- preview deve refletir Modo Discreto e escopo;
- publicar usa ação primária única;
- salvar rascunho é estado, não CTA concorrente quando automático;
- edição informa se mudanças alteram visibilidade.

### Estados

- rascunho;
- upload;
- offline;
- validação;
- processando;
- publicado;
- erro parcial de mídia;
- consentimento necessário;
- Premium quando dimensão específica exigir.

### Responsividade

- mobile: composição em sequência; preview em etapa ou seção;
- desktop: editor principal + preview lateral permitido;
- matriz de privacidade ocupa largura suficiente;
- teclado não cobre ações.

### Acessibilidade

- área de texto possui label;
- mídia tem descrição/legenda quando necessária;
- seleção de dados usa grupos;
- escopo e consequência são lidos antes da ação;
- upload informa progresso.

### Anti-patterns

- publicar por padrão como público;
- escolher automaticamente perfil Grow ou Med sem mostrar;
- expor localização ou datas sensíveis por conveniência;
- permitir ação antes de upload crítico sem estado;
- usar preview meramente decorativo.

### Critérios de aceitação

- [ ] Perfil e contexto são explícitos.
- [ ] Dimensões compartilhadas são revisáveis.
- [ ] Escopo está próximo da ação.
- [ ] Offline e upload preservam rascunho.

---

## 43. Template T28 — Conteúdo Privado, Restrito ou sem Permissão

**Arquétipo compatível:** transversal.  
**Shell:** mantém o shell da origem.  
**Aplicações conhecidas:** recurso privado, sem autorização, consentimento necessário, contexto isolado e conteúdo removido.

### Propósito

Explicar por que o conteúdo não pode ser exibido e qual ação legítima está disponível, sem revelar informação protegida ou confundir restrição com erro técnico.

### Regiões obrigatórias

1. contexto seguro;
2. estado e motivo;
3. descrição da política em linguagem simples;
4. ação disponível;
5. retorno;
6. suporte quando necessário.

### Variantes

- sem permissão;
- privado;
- consentimento necessário;
- contexto Grow/Med incompatível;
- removido;
- indisponível;
- bloqueado por política;
- Premium, apenas quando entitlement for a causa.

### Composição

- usar Permission/Private State como núcleo;
- não mostrar thumbnail, nome sensível ou métricas do recurso;
- manter navegação e contexto suficientes para retorno;
- Premium não deve ser usado como fallback para ausência de permissão;
- ação deve corresponder à causa: solicitar, consentir, assinar, voltar ou contactar suporte.

### Acessibilidade

- motivo é textual;
- foco vai ao heading do estado;
- ação é específica;
- nenhum conteúdo protegido é anunciado pelo leitor de tela;
- iconografia é complementar.

### Anti-patterns

- “Algo deu errado”;
- revelar título ou imagem sensível;
- oferecer upgrade quando a causa é privacidade;
- solicitar permissão inexistente;
- culpar o proprietário do conteúdo.

### Critérios de aceitação

- [ ] Restrição não se confunde com erro.
- [ ] Nenhum dado protegido é exposto.
- [ ] Ação corresponde à causa real.
- [ ] Retorno seguro está disponível.

---
# PARTE VI — TEMPLATES DE MÍDIA E CONTEÚDO VISUAL

## 44. Template T29 — Galeria de Mídia

**Arquétipo compatível:** T2/T3.  
**Shell:** S1–S3.  
**Aplicações conhecidas:** Galeria de Fotos, histórico visual e mídia vinculada a entidade.

### Propósito

Organizar registros visuais por tempo, entidade ou categoria, permitindo localizar, selecionar e abrir mídia sem perder metadados e proteção.

### Regiões obrigatórias

1. Page Header e contexto;
2. filtros temporais ou por categoria;
3. ação de adicionar mídia quando permitida;
4. grid ou lista de thumbnails;
5. metadados essenciais;
6. seleção múltipla quando prevista;
7. continuação;
8. estados.

### Composição

- grid é preferencial quando a imagem é o principal identificador;
- agrupamento temporal usa headings;
- thumbnail mantém proporção consistente;
- data, fase ou entidade não dependem da imagem;
- conteúdo sensível recebe proteção antes do carregamento visual;
- seleção múltipla entra em modo explícito;
- comparação navega para T30, não ocorre dentro de cada card.

### Variantes

- cronológica;
- por fase;
- por entidade;
- pública;
- selecionável;
- comparação preparada.

### Estados

- vazio;
- carregando thumbnails;
- upload pendente;
- erro de mídia;
- mídia indisponível;
- offline/cache;
- conteúdo sensível;
- Modo Discreto.

### Responsividade

- mobile: duas ou três colunas de thumbnails simples; uma coluna para cards ricos;
- tablet/desktop: densidade cresce sem reduzir alvo ou metadata;
- filtros podem ocupar barra superior;
- grid preserva ordem de foco.

### Acessibilidade

- thumbnails informativas possuem descrição;
- seleção anuncia estado e quantidade;
- imagem sem descrição ainda apresenta data e contexto;
- mídia sensível não é anunciada antes de revelação;
- teclado navega por itens em ordem previsível.

### Anti-patterns

- masonry com ordem de leitura ambígua;
- ocultar data e fase;
- abrir viewer apenas por gesto;
- carregar imagem sensível antes da proteção;
- usar imagem quebrada sem fallback.

### Critérios de aceitação

- [ ] Ordem temporal ou categórica é clara.
- [ ] Cada item pode ser identificado sem depender exclusivamente da imagem.
- [ ] Seleção e upload possuem estados.
- [ ] Modo Discreto protege thumbnails e metadados.

---

## 45. Template T30 — Visualizador e Comparação de Mídia

**Arquétipo compatível:** T3/T7.  
**Shell:** overlay amplo ou tela dedicada.  
**Aplicações conhecidas:** visualização ampliada, comparação de fotos e inspeção de mídia.

### Propósito

Permitir examinar mídia em detalhe e comparar registros visuais preservando data, contexto, origem e acessibilidade.

### Regiões obrigatórias

1. retorno/fechamento;
2. título ou identificação;
3. mídia principal;
4. metadados;
5. navegação anterior/próxima;
6. ações permitidas;
7. comparação ou seleção quando ativa;
8. descrição e conteúdo sensível.

### Variantes

- item único;
- sequência;
- lado a lado;
- antes/depois;
- overlay;
- tela dedicada.

### Composição

- mídia ocupa espaço disponível sem ocultar controles essenciais;
- metadados podem recolher, mas permanecem acessíveis;
- comparação lado a lado só ocorre quando imagens têm escala e contexto compatíveis;
- zoom não substitui alternativa textual;
- ações de remover ou compartilhar ficam separadas da navegação;
- overlay não abre outro modal.

### Responsividade

- mobile: mídia em sequência ou alternância controlada; comparação pode usar divisor apenas se operável sem precisão fina;
- desktop: lado a lado ou viewport ampliada;
- orientação landscape pode ser aproveitada sem obrigar rotação;
- safe areas e controles do sistema são respeitados.

### Acessibilidade

- navegação anterior/próxima é nomeada;
- zoom é operável por controle, não apenas pinch;
- descrição e metadados são acessíveis;
- foco fica contido no overlay e retorna à origem;
- comparação possui descrição das diferenças quando relevante.

### Anti-patterns

- gestos como única interação;
- controles invisíveis até hover;
- comparação de escalas incompatíveis sem aviso;
- esconder data para “limpar” a interface;
- baixar ou compartilhar sem revisão de privacidade.

### Critérios de aceitação

- [ ] Mídia e metadados permanecem vinculados.
- [ ] Navegação funciona por toque, teclado e leitor de tela.
- [ ] Comparação declara contexto e escala.
- [ ] Fechamento retorna ao item de origem.

---

# PARTE VII — TEMPLATES DE CONTA E MONETIZAÇÃO

## 46. Template T31 — Upgrade e Paywall

**Arquétipo compatível:** T6 — Paywall/Upgrade.  
**Shell:** S5 ou inserção contextual aprovada.  
**Aplicações conhecidas:** Upgrade Premium, limite de recurso e desbloqueio contextual.

### Propósito

Explicar valor, limite atual, plano e preço de maneira ética, permitindo assinar ou retornar sem pressão enganosa.

### Regiões obrigatórias

1. contexto da funcionalidade;
2. benefício principal;
3. limite ou motivo do bloqueio;
4. comparação Free × Premium quando necessária;
5. preço, período e renovação;
6. cupom quando previsto;
7. ação de assinar;
8. restaurar compra ou gerir assinatura;
9. retorno;
10. termos essenciais.

### Variantes

- paywall completo;
- upsell contextual;
- limite alcançado;
- trial/período gratuito;
- reativação;
- oferta regional aprovada.

### Composição

- valor aparece antes do preço, sem ocultá-lo;
- Premium usa tom sofisticado e discreto, sem brilho excessivo;
- comparação utiliza labels explícitos;
- plano atual é identificado;
- ação de retorno permanece visível;
- benefícios não prometem resultados clínicos ou de cultivo;
- recurso gratuito não é visualmente degradado.

### Estados

- disponível;
- aplicando cupom;
- processando compra;
- confirmação pendente;
- assinatura ativa;
- erro de pagamento;
- restauração;
- preço indisponível;
- offline.

### Responsividade

- mobile: benefícios em sequência; comparação linear;
- desktop: até duas colunas controladas para comparação, sem tabela extensa;
- ação não cobre termos ou retorno;
- preço e renovação não podem ser truncados.

### Acessibilidade

- plano, preço e periodicidade são lidos juntos;
- recursos disponíveis/indisponíveis não dependem de checkmark;
- processamento é anunciado;
- erro de pagamento oferece alternativa;
- foco não é forçado repetidamente à ação de compra.

### Anti-patterns

- contagem regressiva artificial;
- botão de fechar escondido;
- preço sem periodicidade;
- plano anual pré-selecionado sem clareza;
- recursos vagos;
- Premium com cor de sucesso;
- usar medo, vergonha ou estigma.

### Critérios de aceitação

- [ ] Benefício, limite, preço e retorno são claros.
- [ ] Compra possui estados completos.
- [ ] Comparação não usa linguagem ambígua.
- [ ] A experiência respeita persuasão ética.

---

## 47. Template T32 — Gestão de Assinatura

**Arquétipo compatível:** T4.  
**Shell:** S1–S3.  
**Aplicações conhecidas:** Gestão de Assinatura e cobrança.

### Propósito

Permitir compreender plano atual, cobrança, benefícios, renovação e ações de gestão sem transformar a tela em nova venda.

### Regiões obrigatórias

1. plano atual;
2. status;
3. preço e ciclo de cobrança;
4. próxima cobrança ou expiração;
5. benefícios ativos;
6. método ou canal de gestão quando aplicável;
7. restaurar compra;
8. alterar/cancelar;
9. histórico ou suporte quando previsto.

### Composição

- estado atual domina;
- upgrade só aparece quando relevante;
- cancelamento não é escondido;
- consequências de cancelamento são explicadas;
- plano expirado mantém acesso à gestão;
- informações de pagamento sensíveis não são exibidas além do necessário.

### Estados

- ativo;
- trial;
- renovação pendente;
- cancelamento agendado;
- expirado;
- pagamento falhou;
- restaurando;
- erro;
- offline.

### Responsividade e acessibilidade

- layout de leitura até 720px;
- ações de alto impacto separadas;
- status e datas são textuais;
- cancelamento possui confirmação e alternativa de retorno;
- foco retorna à região de status após ação.

### Anti-patterns

- esconder cancelamento em múltiplos níveis;
- confundir pausa, cancelamento e expiração;
- usar paywall como tela de gestão;
- omitir próxima cobrança;
- destacar upgrade acima do plano atual.

### Critérios de aceitação

- [ ] Plano e estado atual são inequívocos.
- [ ] Próxima cobrança ou expiração está visível.
- [ ] Cancelar e restaurar são acessíveis.
- [ ] Falha de pagamento não elimina acesso à gestão.

---

# PARTE VIII — TEMPLATES ADMINISTRATIVOS

## 48. Template T33 — Administração de Coleções

**Arquétipo compatível:** T2/T4.  
**Shell:** S7.  
**Aplicações conhecidas:** limites de plano, preços regionais, cupons e coleções administrativas.

### Propósito

Gerenciar coleções internas com maior densidade, rastreabilidade e eficiência, mantendo a mesma biblioteca visual e os mesmos requisitos de acessibilidade.

### Regiões obrigatórias

1. contexto administrativo e permissão;
2. Page Header;
3. busca, filtros e ordenação;
4. tabela ou lista densa;
5. ação de criação;
6. ações por item;
7. paginação;
8. status e auditoria mínima.

### Composição

- Data Table é preferencial no desktop quando comparação por colunas for necessária;
- mobile usa lista ou cards compactos, não tabela comprimida;
- colunas essenciais permanecem fixas ou priorizadas;
- ações adicionais entram em overflow;
- alterações em massa exigem modo explícito e revisão;
- valores monetários, datas e status usam formatação oficial.

### Estados

- carregando;
- vazio;
- erro;
- alteração pendente;
- conflito;
- sem permissão;
- item desativado;
- operação em massa.

### Acessibilidade

- tabelas possuem headers associados;
- ordenação é anunciada;
- seleção em massa informa quantidade;
- ações nomeiam item;
- densidade compacta mantém 44px de alvo quando interativa.

### Anti-patterns

- sistema visual diferente;
- ação destrutiva em cada coluna;
- tabela horizontal inacessível no mobile;
- edição inline de tudo sem confirmação;
- esconder trilha de alteração.

### Critérios de aceitação

- [ ] Informação pode ser comparada por coluna no desktop.
- [ ] Mobile possui alternativa funcional.
- [ ] Operações em massa são explícitas.
- [ ] Permissão e auditoria são preservadas.

---

## 49. Template T34 — Administração de Política ou Configuração

**Arquétipo compatível:** T4.  
**Shell:** S7.  
**Aplicações conhecidas:** período gratuito, política de agregação e configurações administrativas.

### Propósito

Editar políticas globais com contexto, impacto, histórico e confirmação proporcionais ao alcance da mudança.

### Regiões obrigatórias

1. título e escopo;
2. estado atual;
3. descrição da política;
4. formulário;
5. impacto esperado;
6. validação;
7. revisão de alterações;
8. ação salvar;
9. auditoria ou histórico recente.

### Composição

- largura de 640–800px;
- alterações de impacto global exigem revisão final;
- estado atual e proposto são comparáveis;
- campos dependentes ficam próximos;
- salvar só conclui após confirmação quando risco justificar;
- histórico não substitui confirmação.

### Estados

- carregando;
- alterado;
- validando;
- conflito;
- salvando;
- salvo;
- erro;
- sem permissão;
- política bloqueada.

### Acessibilidade

- diferença entre atual e proposto é textual;
- confirmação descreve alcance;
- erro leva ao campo;
- histórico é estruturado;
- ação global não depende de cor crítica.

### Anti-patterns

- alteração global por switch instantâneo;
- omitir impacto;
- salvar sem registrar responsável;
- misturar políticas independentes;
- usar linguagem de implementação sem explicação.

### Critérios de aceitação

- [ ] Estado atual e proposta são comparáveis.
- [ ] Impacto está explícito.
- [ ] Alteração possui auditoria.
- [ ] Permissão é validada antes de edição.

---

## 50. Template T35 — Consulta de Auditoria

**Arquétipo compatível:** T2.  
**Shell:** S7.  
**Aplicações conhecidas:** Trilha de Auditoria.

### Propósito

Permitir localizar e inspecionar eventos administrativos com precisão temporal e contexto, sem tornar a trilha editável.

### Regiões obrigatórias

1. Page Header;
2. período;
3. filtros por ator, ação, recurso e resultado;
4. contagem;
5. tabela/lista de eventos;
6. detalhe do evento;
7. paginação;
8. exportação quando funcionalmente prevista.

### Composição

- ordem cronológica explícita;
- timestamps completos e timezone conhecido;
- IDs técnicos podem aparecer como metadados, não como título principal;
- detalhe pode usar painel lateral desktop ou tela secundária;
- eventos são somente leitura;
- filtros persistem ao retornar.

### Estados

- carregando;
- nenhum evento;
- erro;
- acesso negado;
- evento parcial;
- exportando.

### Responsividade

- desktop: tabela + detalhe opcional;
- mobile: lista de eventos e detalhe em nova tela;
- colunas são priorizadas, não comprimidas;
- filtros numerosos usam sheet.

### Acessibilidade

- tabela semântica;
- data e hora completas;
- resultado da ação é textual;
- detalhe possui headings;
- foco retorna ao evento selecionado.

### Anti-patterns

- permitir editar trilha;
- usar somente IDs;
- timestamp relativo sem valor completo;
- apagar filtros ao abrir detalhe;
- misturar eventos de contextos sem label.

### Critérios de aceitação

- [ ] Evento pode ser localizado por período e ator.
- [ ] Timestamp e contexto são completos.
- [ ] Trilha é somente leitura.
- [ ] Mobile possui leitura funcional sem tabela comprimida.

---

# PARTE IX — ESTADOS COMPOSTOS DE TELA

## 51. Composição de estado vazio

Estado vazio não é um template independente. Ele substitui ou ocupa a região principal do template escolhido.

### 51.1 Tipos

- primeiro uso;
- coleção vazia;
- período sem dados;
- zero resultados;
- histórico ainda não iniciado;
- conteúdo removido ou privado, quando a causa não for erro.

### 51.2 Anatomia

1. ilustração funcional opcional;
2. heading específico;
3. explicação da causa;
4. ação principal quando legítima;
5. ação secundária opcional;
6. contexto preservado.

### 51.3 Regras

- primeiro uso pode oferecer criação;
- zero resultados oferece ajustar filtros;
- período sem dados não incentiva criação retroativa indevida;
- privado usa T28, não vazio genérico;
- ilustração não ultrapassa o peso do heading;
- ação não aparece quando o usuário não possui permissão.

### 51.4 Anti-patterns

- “Nada por aqui” genérico;
- CTA de criação em toda ausência;
- tela em branco;
- ilustração decorativa excessiva;
- usar vazio para esconder erro.

---

## 52. Composição de loading e skeleton

### 52.1 Loading inicial

Usar Skeleton fiel à estrutura quando o layout e volume são previsíveis. Loading Indicator simples é reservado a regiões pequenas ou processos sem estrutura de conteúdo.

### 52.2 Loading parcial

Preserva conteúdo já carregado e substitui somente a região afetada.

### 52.3 Regras

- skeleton não simula dados inexistentes com precisão falsa;
- quantidade de placeholders deve refletir viewport, não dezenas de itens;
- cabeçalho e navegação permanecem estáveis;
- loading acima de tempo perceptível deve explicar a ação;
- motion reduzido remove shimmer agressivo;
- leitores de tela recebem status, não cada bloco do skeleton.

### 52.4 Anti-patterns

- spinner central em toda tela quando conteúdo estrutural é conhecido;
- trocar skeleton por conteúdo causando salto grande;
- shimmer de alto contraste;
- skeleton de gráfico com interpretação aparente;
- bloquear navegação global.

---

## 53. Composição de erro

### 53.1 Níveis

- campo: Inline Validation;
- ação local: mensagem inline ou Toast;
- região: Screen Error State local;
- tela: estado de erro completo;
- global: Banner;
- decisão necessária: Modal Dialog.

### 53.2 Anatomia de erro de tela

1. heading específico;
2. causa compreensível quando conhecida;
3. conteúdo preservado ou impacto;
4. retry;
5. alternativa;
6. suporte/diagnóstico quando necessário.

### 53.3 Regras

- erro não usa “algo deu errado” quando causa ou ação são conhecidas;
- retry preserva filtros e entrada;
- erro de uma região não apaga outras;
- código de suporte é secundário;
- erro clínico não deve alarmar sem necessidade;
- ausência de permissão usa T28.

### 53.4 Anti-patterns

- múltiplos feedbacks para o mesmo erro;
- limpar formulário;
- botão “OK” sem solução;
- vermelho em toda a página;
- expor detalhes técnicos sensíveis.

---

## 54. Composição offline, cache e sincronização

### 54.1 Estado offline de leitura

- Banner ou Offline/Sync Status;
- data da última atualização;
- conteúdo em cache permanece disponível;
- ações dependentes de conexão são explicadas.

### 54.2 Estado offline de escrita

- rascunho local;
- status “pendente de envio”;
- possibilidade de editar ou cancelar;
- sincronização automática ou ação de reenviar conforme contrato funcional.

### 54.3 Conflito

- apresenta versões e consequência;
- não escolhe silenciosamente;
- permite manter uma versão ou revisar quando funcionalmente suportado;
- preserva ambas até resolução.

### 54.4 Anti-patterns

- usar sucesso antes de sincronizar;
- remover dado pendente ao sair;
- mostrar cache como atual;
- retry infinito sem estado;
- esconder conflito.

---

## 55. Composição de processamento e pendência

### 55.1 Uso

Relatórios, exportações, uploads, compras, cálculos de IA e ações assíncronas prolongadas.

### 55.2 Anatomia

1. tarefa recebida;
2. estado atual;
3. progresso determinado quando disponível;
4. possibilidade de sair;
5. preservação do conteúdo;
6. forma de receber resultado;
7. cancelamento quando permitido.

### 55.3 Regras

- “Processando” não é “Loading”;
- o usuário pode sair quando o backend continuar a tarefa, e isso deve ser informado;
- progresso fictício é proibido;
- conclusão posterior deve aparecer na região de origem;
- pendência possui timestamp e objeto.

### 55.4 Anti-patterns

- spinner sem texto por processo longo;
- impedir saída sem necessidade;
- porcentagem falsa;
- concluir sem feedback;
- duplicar ação ao tocar novamente.

---

## 56. Composição de sucesso e conclusão

### 56.1 Sucesso local

Usar feedback inline ou Toast quando a tarefa termina e o usuário permanece na tela.

### 56.2 Conclusão de fluxo

Usar estado de conclusão quando houver próximo passo significativo, resumo ou resultado gerado.

### 56.3 Anatomia

1. confirmação específica;
2. objeto criado/alterado;
3. consequência;
4. próximo passo primário;
5. retorno secundário;
6. status de sincronização quando necessário.

### 56.4 Regras

- sucesso não depende de verde ou animação;
- texto informa o que ocorreu;
- não celebrar tarefas clínicas com gamificação inadequada;
- ação seguinte é contextual;
- sucesso local não vira tela separada sem necessidade.

### 56.5 Anti-patterns

- confete;
- “Sucesso!” sem objeto;
- tela de conclusão após cada check-in simples;
- esconder envio pendente sob mensagem positiva;
- duas ações primárias.

---

# PARTE X — MATRIZES, GOVERNANÇA E QUALIDADE

## 57. Matriz de aplicação por arquétipo de UX

| Arquétipo do documento 10 | Templates principais | Templates de apoio |
| --- | --- | --- |
| T1 — Formulário | T10, T11, T12, T27 | T04, T22 |
| T2 — Listagem/Feed | T05, T06, T07, T08, T25, T29 | T14, T33, T35 |
| T3 — Detalhe/Timeline | T09, T13, T23, T26, T30 | T28 |
| T4 — Configuração | T15, T16, T24, T32, T34 | T22 |
| T5 — Onboarding/Wizard | T01, T02, T03, T04 | T12 |
| T6 — Paywall/Upgrade | T31 | T32 |
| T7 — Analítico/Insight | T17, T18, T19, T20, T21 | T22, T30 |

### 57.1 Regra

O arquétipo descreve comportamento geral; o template define composição. Uma tela pode usar um template principal e padrões internos de outro, mas não pode combinar dois templates principais com prioridades concorrentes.

---

## 58. Matriz Core × Grow × Med

| Template | Core | Grow | Med | Regra de diferenciação |
| --- | :---: | :---: | :---: | --- |
| T01 Entrada | ✓ | — | — | Core institucional |
| T02 Contexto | ✓ | ✓ | ✓ | opções equivalentes |
| T03 Onboarding | ✓ | ✓ | ✓ | conteúdo e acento |
| T04 Wizard | ✓ | ✓ | ✓ | semântica da operação |
| T05 Dashboard | ✓ | ✓ | ✓ | ordem funcional específica |
| T06–T16 Operacionais | ✓ | ✓ | ✓ | entidade e conteúdo |
| T17–T22 Analíticos | ✓ | ✓ | ✓ | linguagem técnica ou clínica |
| T23 Perfil | — | ✓ | ✓ | perfis independentes |
| T24 Privacidade | ✓ | ✓ | ✓ | Core governa, contextos informam |
| T25–T27 Comunidade | — | ✓ | ✓ | isolamento absoluto por contexto |
| T28 Restrição | ✓ | ✓ | ✓ | causa real |
| T29–T30 Mídia | ✓ | ✓ | ✓ | proteção e contexto |
| T31–T32 Premium | ✓ | ✓ | ✓ | assinatura compartilhada |
| T33–T35 Admin | ✓ | ✓ | ✓ | sem sistema paralelo |

### 58.1 Regra

A anatomia não muda entre Grow e Med. As diferenças autorizadas são:

- Accent Token;
- conteúdo;
- tom verbal;
- termos;
- dados apresentados;
- nível de densidade justificado;
- proteção de privacidade.

---

## 59. Matriz mobile × tablet × desktop

| Aspecto | Mobile | Tablet | Desktop |
| --- | --- | --- | --- |
| Navegação | Bottom Navigation ou fluxo focado | Sidebar compacta possível | Sidebar compacta/expandida |
| Colunas | 1 | até 2 | até 3 regiões funcionais |
| Formulário | 1 coluna | 1–2 relacionadas | 1–2 relacionadas |
| Filtros | inline simples ou sheet | inline/side | inline/side |
| Tabela | lista alternativa | tabela simplificada | tabela completa |
| Apoio | após principal | lateral opcional | lateral persistente opcional |
| Ações | próximas e safe-area | header/rodapé | header/rodapé |
| Overlays | bottom sheet/modal seguro | modal | modal/popover |
| Analytics | sequência | duas regiões | paralelismo controlado |

### 59.1 Proibição

Desktop não é mobile ampliado; mobile não é desktop recortado. A hierarquia deve ser a mesma, mas a composição deve explorar o espaço disponível sem alterar significado.

---

## 60. Matriz de estados por template

Legenda: **O** obrigatório · **A** aplicável · **—** normalmente não aplicável.

| Template | Vazio | Loading | Erro | Offline | Processando | Privado | Premium | Discreto |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| T01 Entrada | — | O | O | A | O | — | — | A |
| T03/T04 Fluxos | A | O | O | O | O | A | A | A |
| T05 Dashboard | O | O | O | O | A | A | A | O |
| T06–T08 Coleções | O | O | O | O | A | A | A | A |
| T09 Detalhe | A | O | O | O | A | O | A | O |
| T10–T12 Entrada | A | O | O | O | O | A | A | O |
| T13/T14 Histórico | O | O | O | O | A | A | A | A |
| T15/T16 Configuração | A | O | O | O | O | A | A | O |
| T17–T21 Analytics | O | O | O | A | O | A | O | O |
| T22 Compartilhar | A | O | O | O | O | O | A | O |
| T23 Perfil | O | O | O | A | A | O | A | O |
| T24 Privacidade | A | O | O | O | O | — | — | O |
| T25–T27 Comunidade | O | O | O | O | O | O | A | O |
| T28 Restrição | — | A | — | — | — | O | A | A |
| T29/T30 Mídia | O | O | O | O | O | O | A | O |
| T31/T32 Premium | A | O | O | O | O | — | O | A |
| T33–T35 Admin | O | O | O | A | O | A | — | A |

**Nota de equivalência com o doc 10 §5.** O modelo de 8 estados oficial (Vazio, Carregando, Erro, Sucesso, Offline, Premium/Bloqueado, Sem Permissão, Modo Discreto) continua sendo a referência única de vocabulário de estado da plataforma. Nesta matriz, "Loading" = Carregando; "Premium" = Premium/Bloqueado; "Discreto" = Modo Discreto (variante transversal, não estado à parte). "Sucesso" não aparece como coluna porque é o estado de repouso implícito de todo template (ausência de Vazio/Loading/Erro/Offline/Processando). "Processando" é uma extensão aprovada para operações assíncronas multi-módulo (Central de Privacidade e Dados, doc 10 §8) — não substitui nenhum dos 8 estados, é um estado adicional específico dessas telas. "Privado" não substitui "Sem Permissão": "Privado" descreve o dono vendo seu próprio conteúdo não compartilhado; "Sem Permissão" (doc 10 §5) descreve um terceiro sem autorização — os dois continuam distintos e nenhum template deve confundi-los.

---

## 61. Critérios para criar um novo template

Um novo template só pode ser criado quando todos os critérios forem atendidos:

1. existe uma tarefa recorrente não coberta;
2. composição com templates atuais foi testada e falhou;
3. a diferença é estrutural, não apenas de conteúdo;
4. pelo menos três telas atuais ou previstas compartilham a necessidade, salvo caso regulatório crítico;
5. o template funciona em mobile, tablet e desktop;
6. usa somente componentes aprovados ou registra dependência formal;
7. possui estados completos;
8. preserva Core, Grow e Med;
9. passa por acessibilidade;
10. recebe aprovação de Product Design e Design System.

### 61.1 Evidências exigidas

- problema;
- telas afetadas;
- tentativas de composição;
- impacto em componentes;
- mapa responsivo;
- estados;
- justificativa de longo prazo.

### 61.2 Proibições

Não criar template por:

- campanha;
- gosto visual;
- um cliente específico;
- limitação temporária de implementação;
- diferença de cor;
- diferença de entidade;
- necessidade de “deixar a tela diferente”.

---

## 62. Processo de alteração e versionamento

### 62.1 Tipos de alteração

- correção editorial;
- clarificação semântica;
- nova variante compatível;
- mudança de região;
- mudança responsiva;
- mudança incompatível;
- depreciação.

### 62.2 Processo

1. registrar problema;
2. mapear telas afetadas;
3. verificar documentos superiores;
4. propor solução;
5. validar acessibilidade e responsividade;
6. revisar Component Library;
7. aprovar;
8. versionar;
9. comunicar migração;
10. auditar implementação.

### 62.3 Versionamento

- patch: correções sem mudança de estrutura;
- minor: variante ou regra compatível;
- major: anatomia ou contrato incompatível.

IDs Txx não são reutilizados após remoção.

---

## 63. Processo de exceção

Exceção é temporária e documentada. Deve conter:

- tela e contexto;
- regra afetada;
- motivo funcional;
- alternativas tentadas;
- risco;
- prazo;
- responsável;
- data de revisão.

Exceções não podem:

- reduzir privacidade;
- remover acessibilidade;
- criar identidade paralela;
- alterar regras de negócio;
- esconder estado;
- introduzir dark pattern;
- permanecer indefinidamente.

---

## 64. Auditoria de consistência

Cada ciclo de revisão deve verificar:

1. template escolhido;
2. shell correto;
3. ordem de regiões;
4. uma ação primária;
5. componentes oficiais;
6. spacing e largura;
7. estados;
8. responsividade;
9. Dark/Light;
10. Core/Grow/Med;
11. acessibilidade;
12. privacidade;
13. IA;
14. Premium;
15. internacionalização;
16. ausência de componente ou template local.

### 64.1 Frequência

- antes de handoff;
- após implementação;
- em releases principais;
- quando um template mudar;
- auditoria sistêmica trimestral ou por marco relevante.

---

## 65. Checklist de aprovação de template

- [ ] Propósito e tarefa principal definidos.
- [ ] Arquétipo de UX identificado.
- [ ] Shell oficial selecionado.
- [ ] Regiões obrigatórias e opcionais definidas.
- [ ] Ordem semântica documentada.
- [ ] Componentes permitidos são oficiais.
- [ ] Hierarquia de ações obedece ao UI Kit.
- [ ] Vazio, loading, erro e offline tratados.
- [ ] Processamento e pendência tratados quando aplicáveis.
- [ ] Privacidade e Modo Discreto tratados.
- [ ] IA e Premium tratados quando aplicáveis.
- [ ] Mobile, tablet e desktop especificados.
- [ ] Dark e Light preservam hierarquia.
- [ ] Acessibilidade validada.
- [ ] Internacionalização validada.
- [ ] Anti-patterns registrados.
- [ ] Critérios de aceitação testáveis.
- [ ] Telas de aplicação mapeadas.
- [ ] Sem regra de negócio nova.
- [ ] Aprovação de Design System registrada.

---

## 66. Checklist de aprovação de tela final

### 66.1 Autoridade

- [ ] A tela usa um template oficial.
- [ ] O template está na versão vigente.
- [ ] Exceções possuem registro.
- [ ] Nenhum fluxo ou entidade foi alterado.

### 66.2 Estrutura

- [ ] Shell está correto.
- [ ] Page Header contém título e contexto necessários.
- [ ] A tarefa principal é inequívoca.
- [ ] Existe no máximo uma ação primária por superfície.
- [ ] Conteúdo de apoio não antecede o principal sem justificativa.
- [ ] Não há card dentro de card.
- [ ] Largura máxima corresponde ao conteúdo.

### 66.3 Componentes

- [ ] Todos os componentes pertencem ao documento 03.
- [ ] Variantes são oficiais.
- [ ] Estados estão completos.
- [ ] Ícones pertencem à linguagem aprovada.
- [ ] Não há valores arbitrários.

### 66.4 Responsividade

- [ ] Mobile possui ordem essencial.
- [ ] Tablet introduz paralelismo útil.
- [ ] Desktop não alonga conteúdo sem benefício.
- [ ] Teclado virtual não cobre ações.
- [ ] Texto ampliado não sobrepõe conteúdo.
- [ ] Tabelas e gráficos possuem alternativa mobile.

### 66.5 Estados

- [ ] Vazio é específico.
- [ ] Loading preserva estrutura.
- [ ] Erro oferece recuperação.
- [ ] Offline distingue cache de atual.
- [ ] Processamento explica continuidade.
- [ ] Sucesso informa consequência.
- [ ] Restrição não se confunde com erro.

### 66.6 Acessibilidade

- [ ] Heading principal único.
- [ ] Ordem de foco correta.
- [ ] Contraste aprovado.
- [ ] Alvos mínimos respeitados.
- [ ] Cor não é exclusiva.
- [ ] Leitor de tela recebe nomes e estados.
- [ ] Motion reduzido funciona.
- [ ] Gráficos possuem resumo ou tabela.

### 66.7 Contextos sensíveis

- [ ] Grow e Med usam o contexto correto.
- [ ] Não há vazamento entre perfis.
- [ ] Modo Discreto protege conteúdo sensível.
- [ ] Privacidade e consentimento são explícitos.
- [ ] IA mostra confiança e limitação.
- [ ] Premium usa persuasão ética.

### 66.8 Conteúdo

- [ ] Títulos descrevem tarefa ou objeto.
- [ ] Labels são persistentes.
- [ ] Mensagens de erro são específicas.
- [ ] Datas, números e unidades seguem locale.
- [ ] Texto clínico não é diagnóstico.
- [ ] Dados estimados e ausentes são declarados.

---

## 67. Decisões consolidadas

1. A plataforma possui uma única biblioteca de templates.
2. Grow e Med não recebem layouts paralelos.
3. Mobile define a ordem semântica oficial.
4. Desktop pode reorganizar, mas não repriorizar conteúdo.
5. Uma tela possui um template principal.
6. Estados são composições do template, não telas improvisadas.
7. Dashboard prioriza ação e atenção, não métricas.
8. Lista é preferencial a grid quando a distinção é textual.
9. Formulário curto, longo e wizard possuem critérios diferentes.
10. IA reserva espaço para confiança e limitações.
11. Privacidade e Modo Discreto fazem parte da anatomia quando aplicáveis.
12. Premium não substitui permissão, privacidade ou erro.
13. Relatórios são documentos independentes, não capturas de dashboard.
14. Administração usa a mesma linguagem visual.
15. Um novo template exige necessidade recorrente e aprovação sistêmica.

---

## 68. Histórico

| Versão | Data | Alteração |
| --- | --- | --- |
| 1.0 | 2026-07-12 | Criação da Biblioteca oficial de Screen Templates com 35 templates, seis composições de estado e governança completa. |

---

# Encerramento

O `04-screen-templates.md` estabelece a gramática de composição das telas da COSMARIA. A partir desta versão, telas novas não devem iniciar em uma prancheta vazia: devem partir de um shell, selecionar um template, usar componentes oficiais e demonstrar conformidade com estados, responsividade, acessibilidade, privacidade, IA e Premium.

A próxima camada documental pode transformar estes templates em inventário de telas específicas e especificações de cada tela, sem redesenhar a estrutura básica a cada entrega.

# ANEXO A — Mapeamento oficial das telas conhecidas

Este anexo vincula o catálogo do `../10-fluxos-do-usuario.md` aos templates desta biblioteca. O mapeamento não altera comportamento nem cria telas. Ele define o ponto de partida estrutural de cada tela já prevista.

## A.1 Core e Premium

| Tela conhecida | Template principal | Template/padrão de apoio | Observação |
| --- | --- | --- | --- |
| Cadastro / Login | T01 — Entrada e Autenticação | Estado de erro/processamento | Core institucional |
| Escolha de Propósito | T02 — Escolha de Contexto | T03 quando inserida em onboarding | Opções equivalentes |
| Configurações Gerais | T15 — Configuração Geral | T16 para detalhes | Hub de preferências |
| Central de Notificações | T16 — Configuração Detalhada | T15 como origem | Preferências por categoria e horário |
| Gestão de Assinatura | T32 — Gestão de Assinatura | T31 para upgrade | Estado atual antes de venda |
| Perfil de Aprendizado | T16 — Configuração Detalhada | T18 para explicar personalização | Ver/resetar sem sugerir diagnóstico |
| Central de Privacidade e Dados | T24 — Privacidade e Dados | T22 para exportar/compartilhar | Direitos e consentimentos |
| Tela de Upgrade | T31 — Upgrade e Paywall | T32 para gestão posterior | Persuasão ética |

## A.2 Grow

| Tela conhecida | Template principal | Template/padrão de apoio | Observação |
| --- | --- | --- | --- |
| Dashboard Grow | T05 — Dashboard | T14, T19 | Ação do dia e alertas |
| Criar/Editar Ciclo | T11 — Formulário Longo | T07 para escolher modelo | Complexidade progressiva |
| Check-in Diário | T12 — Registro Rápido | T19 quando originado por alerta | Fluxo recorrente |
| Fluxo de Colheita | T04 — Wizard Transacional | T12 para registros rápidos | Etapas dependentes |
| Detalhe do Lote | T09 — Detalhe de Entidade | T13, T21 | Histórico e relatório |
| Relatório de Ciclo | T21 — Relatório | T17, T22 | Técnico e exportável |
| Publicar Growlog | T27 — Publicação | T22, Privacy Matrix | Escopo explícito |
| Perfil Público Grow | T23 — Perfil | T25, T17 | Identidade contextual |
| Detalhe do Ambiente | T09 — Detalhe de Entidade | T13, T17 | Histórico do espaço |
| Configuração Outdoor | T16 — Configuração Detalhada | T11 se cadastro extenso | Integração opcional |
| Detalhe da Planta / Timeline | T09 — Detalhe de Entidade | T13, T29 | Planta como entidade central |
| Criar/Editar Planta | T10 — Formulário Curto | T11 se o escopo crescer | Campos essenciais primeiro |
| Biblioteca de Genéticas | T06 — Lista de Coleção | T07 se mídia for dominante | Lista é padrão conservador |
| Meus Modelos de Ciclo | T07 — Biblioteca em Grid | T06 como alternativa densa | Reconhecimento por modelo |
| Parâmetros Ambientais Avançados | T11 — Formulário Longo | T12 para registro recorrente | Modo especialista |
| Manejo / Sanidade | T10 — Formulário Curto | T29 para fotos | Evento pontual |
| Galeria / Comparação de Fotos | T29 — Galeria | T30 — Viewer/Comparação | Mídia protegida |
| Lista de Tarefas | T14 — Tarefas | T09 para detalhe | Prioridade temporal |
| Detalhe de Tarefa | T09 — Detalhe de Entidade | T10 para edição | Estado e histórico |
| Comparação entre Ciclos | T20 — Comparação | T17 para visão ampliada | Bases equivalentes |
| Growlog Público | T26 — Conteúdo e Discussão | T23 para autor | Origem e Fork preservados |
| Busca da Comunidade Grow | T08 — Busca e Resultados | T26 para detalhe | Escopo Grow fixo |
| Tela de Fork | T11 — Formulário Longo | T04 apenas se etapas forem necessárias | Origem preservada |
| Configurações Grow | T15 — Configuração Geral | T16 | Accent e termos Grow |

## A.3 Med

| Tela conhecida | Template principal | Template/padrão de apoio | Observação |
| --- | --- | --- | --- |
| Dashboard Med | T05 — Dashboard | T14, T19 | Linha de base e pendências |
| Perfil Público Med | T23 — Perfil | T25 | Variante anônima completa |
| Criar/Editar Tratamento | T11 — Formulário Longo | T03 no primeiro uso | Estrutura clínica |
| Sessão Antes/Depois | T12 — Registro Rápido | Estado de pendência | Par de registros assíncronos |
| Timeline de Evolução Clínica | T13 — Timeline | T17 para análise | História longitudinal |
| Onboarding Med | T03 — Onboarding Guiado | T11 para primeiro tratamento | Cuidado e discrição |
| Cadastrar/Editar Produto | T10 — Formulário Curto | T11 se vínculo e dados avançados crescerem | Vínculo opt-in a Lote |
| Meus Modelos de Tratamento | T07 — Biblioteca em Grid | T06 como alternativa | Reutilização Premium |
| Registrar Efeito | T10 — Formulário Curto | T12 se recorrente | Positivo/adverso explícito |
| Gerar/Visualizar Relatório | T21 — Relatório | T22 para exportação | Não diagnóstico |
| Busca da Comunidade Med | T08 — Busca e Resultados | T26 para detalhe | Escopo Med isolado |
| Configurações Med | T15 — Configuração Geral | T16 | Modo Discreto prioritário |
| Perfis de Dependente — versão futura | T06 — Lista de Coleção | T23 para perfil contextual | Somente quando entrar no roadmap |

## A.4 Comunidade

| Tela conhecida | Template principal | Template/padrão de apoio | Observação |
| --- | --- | --- | --- |
| Feed Grow / Med | T25 — Feed | T08 para busca | Nunca mistura contextos |
| Configuração de Vínculo de Perfis | T16 — Configuração Detalhada | Profile Link Seal | Opt-in e reversível |
| Estatísticas de Perfil | T17 — Analytics Overview | T23 | Premium e critérios claros |
| Tela de Moderação | T33 — Administração de Coleções | T28 para restrições | Contexto e permissão Admin |
| Publicação individual | T26 — Conteúdo e Discussão | T23 para perfil | Escopo visível |
| Criar publicação | T27 — Publicação | T22 para compartilhar | Privacidade antes da ação |

## A.5 Inteligência Artificial

| Tela conhecida | Template principal | Template/padrão de apoio | Observação |
| --- | --- | --- | --- |
| Tela de Insight | T18 — Insight e Explicabilidade | T17 para contexto analítico | Confiança e limitação |
| Tela de Alerta | T19 — Alerta/Recomendação | T14 se criar tarefa | Severidade proporcional |
| Tela de Recomendação | T19 — Alerta/Recomendação | T18 para aprofundar evidência | Ação não obrigatória |
| Digest Analítico | T17 — Analytics Overview | T21 para exportar | Período explícito |
| Modal de Disclaimer | Componente Modal Dialog | T18/T19 como origem | Não é template de tela |

## A.6 Administração

| Tela conhecida | Template principal | Template/padrão de apoio | Observação |
| --- | --- | --- | --- |
| Gestão de Limites de Plano | T33 — Administração de Coleções | T34 para editar política | Auditoria obrigatória |
| Gestão de Preço Regional | T33 — Administração de Coleções | T34 | Valores e locais explícitos |
| Gestão de Cupons | T33 — Administração de Coleções | T10/T11 para cadastro | Estados e validade |
| Gestão de Período Gratuito | T34 — Política/Configuração | T35 para histórico | Impacto global |
| Trilha de Auditoria | T35 — Consulta de Auditoria | — | Somente leitura |
| Política de Agregação | T34 — Política/Configuração | T35 para histórico | Impacto em dados e IA |

### A.7 Regra de revisão do mapeamento

Quando uma tela mudar de comportamento, a equipe deve primeiro confirmar se o template ainda é adequado. Trocar o template exige revisão do fluxo e registro da justificativa. Alterar o template não pode ser usado para contornar uma regra estrutural.

---

# ANEXO B — Árvore de seleção de template

Usar esta sequência ao iniciar uma tela nova ou revisar uma tela existente.

## B.1 A pessoa está entrando ou sendo orientada?

- autenticação ou criação de conta → **T01**;
- escolha Grow/Med/Ambos → **T02**;
- preparação inicial do produto → **T03**;
- transação com etapas dependentes → **T04**.

## B.2 A tarefa principal é acompanhar o estado geral?

- visão do dia, atenção e progresso → **T05**.

## B.3 A tarefa principal é encontrar um recurso?

- coleção textual ou operacional → **T06**;
- coleção visual → **T07**;
- consulta com termo e filtros → **T08**.

## B.4 A tarefa principal é compreender um recurso?

- estado, ações e relações de uma entidade → **T09**;
- histórico cronológico → **T13**;
- tarefa e pendência → **T14**.

## B.5 A tarefa principal é inserir ou editar dados?

- poucos campos em uma seção → **T10**;
- muitas seções em ordem flexível → **T11**;
- registro recorrente e rápido → **T12**;
- etapas dependentes e revisão → **T04**;
- publicação com privacidade → **T27**.

## B.6 A tarefa principal é configurar?

- categorias de preferências → **T15**;
- conjunto coerente de opções → **T16**;
- privacidade e direitos de dados → **T24**;
- assinatura atual → **T32**.

## B.7 A tarefa principal é interpretar dados?

- visão analítica com várias evidências → **T17**;
- entender uma inferência → **T18**;
- decidir sobre alerta/recomendação → **T19**;
- comparar itens/períodos → **T20**;
- ler documento independente → **T21**;
- gerar ou compartilhar → **T22**.

## B.8 A tarefa é social ou identitária?

- perfil → **T23**;
- feed → **T25**;
- publicação individual e discussão → **T26**;
- criar publicação → **T27**.

## B.9 A tarefa é visual?

- navegar por mídia → **T29**;
- examinar ou comparar mídia → **T30**.

## B.10 A tarefa é de acesso ou monetização?

- explicar restrição/privacidade/permissão → **T28**;
- apresentar upgrade → **T31**;
- gerir assinatura → **T32**.

## B.11 A tarefa é administrativa?

- gerenciar coleção → **T33**;
- alterar política → **T34**;
- consultar trilha → **T35**.

### B.12 Quando nenhuma resposta for adequada

Não iniciar uma tela livre. Registrar a necessidade e aplicar os critérios da seção 61 para avaliar novo template.
