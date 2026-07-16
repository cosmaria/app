# 01 — Visual Language

> **Nome oficial:** Constituição Visual da Plataforma COSMARIA  
> **Status:** Versão 1.0 — direção artística oficial para validação executiva e aplicação em UI Kit, Biblioteca de Componentes, Templates e telas.  
> **Abrangência:** COSMARIA Core, COSMARIA Grow, COSMARIA Med, Comunidade, Inteligência Artificial, Premium e futuros produtos da plataforma.  
> **Natureza:** documento normativo de direção visual. Não contém código, arquitetura de software, estrutura de componentes em implementação, regras de negócio novas ou propostas de funcionalidades.  
> **Princípio de precedência:** os documentos funcionais e de UX definem **o que o produto faz**; este documento define **como o produto deve ser percebido visualmente**. Nenhuma regra visual pode modificar entidades, permissões, fluxos, arquitetura, roadmap ou comportamento funcional já aprovado.

---

## Índice

### Fundamentos

0. Como utilizar esta Constituição Visual  
1. Filosofia Visual  
2. Personalidade da Marca  
3. Emoções transmitidas  
4. Princípios de UX que governam a aparência  
5. Direção Artística  
6. Estilo Geral  
7. Minimalismo × Densidade  
8. Linguagem Visual do COSMARIA Grow  
9. Linguagem Visual do COSMARIA Med  
10. Linguagem Visual do COSMARIA Core  

### Território artístico e fundações visuais

11. Moodboard Conceitual  
12. Color Psychology e Sistema Cromático  
13. Tipografia  
14. Iconografia  
15. Ilustrações  
16. Fotografia  
17. Gradientes  
18. Elevação  
19. Sombras  
20. Bordas  
21. Radius e Geometria  
22. Motion  
23. Microinterações  

### Padrões de composição da interface

24. Navegação  
25. Cards  
26. Dashboards  
27. Listas  
28. Gráficos e Visualização de Dados  
29. Estados Vazios  
30. Estados de Erro  
31. Loading  
32. Skeleton  
33. Feedback Visual  
34. Tom Premium  
35. Acessibilidade Visual  
36. Regras de Consistência  
37. Anti-patterns Visuais  
38. Checklist para Futuras Telas  

### Linguagens transversais especializadas e governança

39. Formulários e Controles  
40. Linguagem Visual da Inteligência Artificial  
41. Linguagem Visual da Privacidade e do Modo Discreto  
42. Linguagem Visual da Comunidade  
43. Responsividade Visual  
44. Internacionalização Visual  
45. Assinaturas Visuais Institucionais  
46. Validação da Direção Artística  
47. Governança da Constituição Visual  
48. Critérios de Avaliação da Linguagem Visual  
49. Decisões Visuais Consolidadas  
50. Checklist Constitucional de Conformidade  

---

## 0. Como utilizar esta Constituição Visual

### 0.1 Propósito

Este documento transforma a estratégia da COSMARIA em uma linguagem visual única, reconhecível, escalável e durável. Ele existe para impedir que decisões de interface sejam tomadas por gosto pessoal, tendência passageira ou conveniência local de uma única tela.

A Constituição Visual deve orientar:

- direção artística;
- decisões de cor, tipografia, forma, profundidade e movimento;
- criação do UI Kit;
- especificação da Biblioteca de Componentes;
- criação de templates;
- composição de telas;
- produção de imagens, ícones, gráficos e ilustrações;
- revisão de qualidade visual;
- evolução de novos produtos sob a marca COSMARIA.

### 0.2 O que este documento define

Este documento define:

1. a personalidade visual da COSMARIA;
2. as emoções que a plataforma deve transmitir;
3. a relação visual entre Core, Grow e Med;
4. os princípios de UX que influenciam a aparência;
5. a direção cromática, tipográfica, geométrica e fotográfica;
6. o uso de densidade, espaço, superfícies, bordas, sombras e elevação;
7. a linguagem visual de dados, IA, privacidade, comunidade e Premium;
8. os padrões visuais de navegação, cards, listas, dashboards e estados;
9. os anti-patterns proibidos;
10. os critérios de aprovação para qualquer tela futura.

### 0.3 O que este documento não define

Este documento não define:

- estrutura de banco de dados;
- APIs;
- lógica de permissões;
- regras de assinatura;
- arquitetura técnica;
- frameworks;
- código;
- anatomia técnica final de componentes;
- nomes de propriedades de componentes;
- funcionalidades novas;
- alteração de fluxos existentes.

Quando este documento descreve cards, dashboards, listas, navegação ou estados, ele descreve **a linguagem visual e os princípios de composição**, não introduz novos elementos funcionais.

### 0.4 Hierarquia documental

Em caso de dúvida, seguir esta ordem:

1. documentos de visão, negócio, domínio, arquitetura, dados, APIs e roadmap;
2. documento de fluxos e comportamento de UX;
3. esta Constituição Visual;
4. Design System operacional, UI Kit e Biblioteca de Componentes;
5. templates e telas específicas.

**Justificativa:** uma decisão estética nunca pode substituir uma regra funcional. Ao mesmo tempo, componentes e telas não podem reinterpretar livremente a direção visual estabelecida aqui.

### 0.5 Relação com o documento 11 — Design System

O documento 11 estabelece a intenção de uma biblioteca única, tokens compartilhados, Dark e Light Mode, acessibilidade, responsividade e governança. Este documento aprofunda e oficializa a **razão perceptiva e artística** dessas escolhas.

Quando houver diferença entre um valor visual ainda tratado como candidato no documento 11 e uma decisão consolidada aqui, esta Constituição Visual passa a ser a referência de direção. O Design System deverá posteriormente traduzir esta linguagem em tokens, componentes e especificações de implementação.

### 0.6 Linguagem normativa

- **DEVE:** regra obrigatória.
- **NÃO DEVE:** prática proibida.
- **PODE:** possibilidade permitida sob os critérios definidos.
- **RECOMENDADO:** padrão preferencial; qualquer exceção exige justificativa documentada.

### 0.7 Critério central de decisão

Toda decisão visual deve responder positivamente às seguintes perguntas:

1. Torna a informação mais clara?
2. Reforça confiança e profissionalismo?
3. Funciona de maneira consistente em Grow, Med e Core?
4. É acessível?
5. É escalável para novos módulos?
6. Continuará adequada quando a quantidade de dados crescer?
7. Evita estereótipos recreativos relacionados à cannabis?
8. Pode ser aplicada sem criar uma exceção exclusiva para uma tela?

Se a resposta for negativa em qualquer item crítico, a decisão deve ser revisada.

---

# PARTE I — FUNDAMENTOS DA LINGUAGEM VISUAL

## 1. Filosofia Visual

### 1.1 Ideia central: ordem dentro da complexidade

A COSMARIA organiza sistemas vivos, históricos extensos, dados técnicos, rotinas, tratamentos, comunidades e inferências de inteligência artificial. Sua linguagem visual deve transformar essa complexidade em uma sensação de ordem compreensível.

A interface não deve parecer simples porque esconde informação. Deve parecer simples porque organiza corretamente a informação.

**Decisão:** a estética da COSMARIA será baseada em **clareza estruturada, profundidade controlada e precisão humana**.

**Justificativa:** Grow e Med possuem grande densidade potencial. Uma estética excessivamente minimalista reduziria contexto; uma estética excessivamente técnica criaria intimidação. A solução é estruturar complexidade por hierarquia, progressão e agrupamento.

### 1.2 Ciência com humanidade

A plataforma deve transmitir rigor sem parecer fria. Ela trabalha com parâmetros científicos e dados clínicos, mas também acompanha esforço, cuidado, sintomas, expectativas e evolução pessoal.

**A ciência aparece por meio de:**

- alinhamento;
- consistência;
- escalas claras;
- números legíveis;
- gráficos honestos;
- terminologia precisa;
- visualização explícita de confiança e limitações.

**A humanidade aparece por meio de:**

- ritmo confortável;
- linguagem calma;
- espaço de respiro;
- fotografia autêntica;
- superfícies acolhedoras;
- mensagens orientadas à solução;
- ausência de julgamento.

### 1.3 Cosmos sem ficção científica

A narrativa “cosmos + harmonia” deve aparecer como organização, relação, ciclos e profundidade — não como decoração literal de estrelas, planetas, galáxias ou neon espacial.

**Pode inspirar:**

- sistemas orbitais abstratos;
- relações entre pontos;
- linhas de trajetória;
- campos de dados;
- camadas de profundidade;
- progressões cíclicas;
- constelações discretas de informação.

**Não deve resultar em:**

- fundos estrelados decorativos;
- roxos neon dominantes;
- estética gamer;
- hologramas;
- interfaces de ficção científica;
- brilhos excessivos;
- planetas ou nebulosas literais em telas operacionais.

### 1.4 Natureza sem clichê orgânico

A natureza deve ser percebida como um sistema vivo, não como ornamentação botânica.

A plataforma pode utilizar ritmos naturais, texturas fotográficas reais e cores inspiradas em ambientes vivos. Não deve usar folhas de cannabis como padrão, ícone genérico, textura decorativa ou atalho de reconhecimento.

**Justificativa:** o clichê botânico reduz a percepção de tecnologia e profissionalismo, expõe o usuário do Med e aproxima a marca de uma estética recreativa que contradiz seu posicionamento.

### 1.5 Precisão sem rigidez

A geometria deve ser organizada, mas não militar. O sistema utiliza grids, alinhamentos e espaçamento rigorosos, combinados com cantos moderadamente arredondados e transições suaves.

O resultado esperado é “preciso e acessível”, não “duro e burocrático”.

### 1.6 Premium pela qualidade, não pelo ornamento

A percepção premium deve surgir de:

- consistência;
- tipografia bem calibrada;
- excelente hierarquia;
- detalhes precisos;
- movimento contido;
- materiais visuais refinados;
- estados cuidadosamente resolvidos;
- ausência de ruído.

Ela não deve depender de dourado excessivo, gradientes brilhantes, glassmorphism, sombras dramáticas ou grandes áreas decorativas.

---

## 2. Personalidade da Marca

### 2.1 Personalidade-mãe

A personalidade visual da COSMARIA é composta por seis atributos permanentes:

| Atributo | Expressão visual | O que evitar |
|---|---|---|
| **Inteligente** | hierarquia clara, dados organizados, relações visíveis | estética “mágica” ou IA antropomorfizada |
| **Confiável** | consistência, previsibilidade, contraste, mensagens transparentes | surpresa visual sem função, ambiguidade |
| **Precisa** | alinhamento, escalas, números tabulares, estados explícitos | aproximações visuais confusas |
| **Humana** | ritmo confortável, tom acolhedor, fotografia autêntica | frieza hospitalar, robótica |
| **Discreta** | identidade sóbria, proteção visual de dados, baixa exposição | símbolos explícitos de cannabis no Med |
| **Evolutiva** | progressão, continuidade, ciclos, histórico | estética estática ou excessivamente institucional |

### 2.2 Arquétipo visual

O arquétipo predominante é **Sábio**, apoiado por **Cuidador** no Med e por **Construtor/Explorador técnico** no Grow.

- **Sábio:** organiza conhecimento, apresenta evidências e reconhece limites.
- **Cuidador:** reduz ansiedade, acolhe vulnerabilidade e orienta sem julgamento.
- **Construtor técnico:** valoriza método, prática, melhoria contínua e domínio do processo.

Nenhum arquétipo deve virar personagem ou mascote. Eles orientam escolhas de tom, ritmo, iconografia e imagem.

### 2.3 Voz visual

A voz visual deve parecer:

- calma, nunca apática;
- técnica, nunca hermética;
- sofisticada, nunca ostentatória;
- contemporânea, nunca dependente de tendências;
- séria, nunca pesada;
- acolhedora, nunca infantil;
- tecnológica, nunca futurista de entretenimento.

### 2.4 Relação entre personalidade e consistência

Grow, Med e Core não são marcas visualmente independentes. Eles são expressões calibradas da mesma personalidade.

A estrutura, tipografia, iconografia, espaçamento, elevação e comportamento devem permanecer compartilhados. A diferença deve ocorrer principalmente por:

- acento cromático;
- temperatura emocional das imagens;
- intensidade de densidade informacional;
- seleção de exemplos e conteúdo;
- tom de ilustrações contextuais;
- ênfase editorial.

**Justificativa:** diferenças estruturais entre produtos multiplicariam manutenção, aumentariam custo e enfraqueceriam a percepção de ecossistema único.

---

## 3. Emoções transmitidas

### 3.1 Emoções primárias

A plataforma deve transmitir, nesta ordem:

1. **Confiança:** “meus dados e minha jornada estão sendo tratados com seriedade”.
2. **Clareza:** “entendo onde estou, o que aconteceu e o que posso fazer”.
3. **Controle:** “consigo organizar, revisar e decidir”.
4. **Progresso:** “há evolução acumulada ao longo do tempo”.
5. **Cuidado:** “o sistema respeita o contexto e não me julga”.
6. **Competência:** “esta ferramenta entende o assunto”.

### 3.2 Emoções secundárias por contexto

| Contexto | Emoções reforçadas | Emoções reduzidas |
|---|---|---|
| Core | estabilidade, neutralidade, segurança | excitação, urgência |
| Grow | domínio, curiosidade, produtividade, evolução | recreação, improviso |
| Med | calma, privacidade, acolhimento, confiança clínica | exposição, ansiedade, julgamento |
| Comunidade | pertencimento, troca, credibilidade | competição vazia, popularidade superficial |
| IA | compreensão, apoio, transparência | mistério, autoridade absoluta |
| Premium | valor, profundidade, eficiência | pressão, exclusão, ostentação |

### 3.3 Emoções proibidas

A interface não deve induzir:

- culpa por registros ausentes;
- medo por alertas sem contexto;
- euforia associada ao uso recreativo;
- urgência artificial de compra;
- vergonha por dados de saúde;
- sensação de vigilância;
- competição social baseada apenas em números;
- dependência emocional de streaks ou recompensas artificiais.

### 3.4 Intensidade emocional

A COSMARIA opera em uma faixa emocional controlada. A maior parte da interface deve ser calma. A intensidade visual aumenta somente quando existe uma diferença real de prioridade, risco ou ação necessária.

**Justificativa:** quando tudo chama atenção, nada possui prioridade. Em um produto com alertas técnicos e dados de saúde, exagero visual reduz confiança e cria fadiga.

---

## 4. Princípios de UX que governam a aparência

### 4.1 Clareza antes de beleza

Uma composição visual só é considerada boa quando melhora entendimento, decisão ou execução. Elementos decorativos não podem competir com dados, ações ou mensagens.

### 4.2 Hierarquia antes de densidade

O sistema pode apresentar grande volume de informação, desde que a ordem de leitura seja inequívoca. A hierarquia deve ser criada por:

- posição;
- agrupamento;
- escala tipográfica;
- peso;
- contraste;
- espaço;
- sequência de revelação.

Cor não deve ser a principal ferramenta de hierarquia.

### 4.3 Complexidade progressiva

Informações avançadas devem ser apresentadas sem transformar a experiência inicial em um painel técnico intimidante. A linguagem visual deve permitir camadas de profundidade:

1. essencial;
2. contextual;
3. avançada;
4. especialista.

A progressão não deve parecer uma troca de produto ou tema. Ela deve parecer expansão natural do mesmo sistema.

### 4.4 Previsibilidade

A mesma aparência deve produzir o mesmo significado. Elementos interativos devem parecer interativos; elementos informativos não devem imitar botões; cores semânticas não devem mudar de significado entre módulos.

### 4.5 Ação no contexto

Ações devem aparecer próximas da informação que modificam. A interface não deve exigir que o usuário memorize a relação entre uma informação e uma ação distante.

### 4.6 Prevenção de erro

A composição deve tornar consequências visíveis antes da confirmação. Ações destrutivas não devem receber o mesmo tratamento visual de ações comuns.

### 4.7 Privacidade visível

O usuário deve perceber quando um dado está privado, compartilhado, oculto, anonimizado ou exposto. A privacidade não pode permanecer apenas em uma configuração distante.

### 4.8 IA explicável

Toda apresentação de insight, correlação, previsão ou alerta deve distinguir visualmente:

- fato registrado;
- cálculo;
- inferência;
- recomendação;
- confiança;
- limitação.

### 4.9 Mobile-first sem empobrecimento

A experiência móvel é a referência inicial porque registros podem ocorrer no contexto real de cultivo ou tratamento. Telas maiores devem expandir visão e comparação, não introduzir uma linguagem visual diferente.

### 4.10 Acessibilidade como estética

Contraste, tamanho, foco, legibilidade e redução de movimento fazem parte da qualidade visual. Acessibilidade não é uma camada corretiva posterior.

---

## 5. Direção Artística

### 5.1 Definição

A direção artística oficial é:

> **Tecnologia serena para organizar sistemas vivos.**

Ela combina:

- base neutra e profunda;
- cor aplicada com propósito;
- tipografia funcional e refinada;
- geometria precisa com suavidade moderada;
- imagens reais e editoriais;
- visualização de dados honesta;
- movimento discreto;
- profundidade por camadas, não por efeitos.

### 5.2 Palavras-chave do território visual

- ordenado;
- silencioso;
- científico;
- vivo;
- inteligente;
- confiável;
- preciso;
- editorial;
- discreto;
- contemporâneo;
- profundo;
- humano.

### 5.3 Referências conceituais permitidas

As referências abaixo são princípios, não modelos para cópia:

- instrumentos científicos bem organizados;
- cadernos de observação contemporâneos;
- fotografia editorial de ciência e natureza;
- interfaces de saúde digitais confiáveis;
- painéis analíticos com forte hierarquia;
- mapas de relações e ciclos;
- iluminação suave de ambientes tecnológicos premium;
- publicações científicas modernizadas para leitura digital.

### 5.4 Referências conceituais proibidas

- dispensários recreativos;
- cultura de fumaça;
- estética reggae/rastafári;
- folhas de cannabis repetidas;
- neon psicodélico;
- interfaces cyberpunk;
- dashboards financeiros agressivos;
- apps de produtividade infantilizados;
- hospitais estéreis e frios;
- interfaces de cassino;
- estética NFT/cripto;
- gamificação por medalhas e confetes.

### 5.5 Grau de expressividade

A expressão visual deve ser mais forte em:

- onboarding;
- comunicação institucional;
- estados vazios importantes;
- relatórios de evolução;
- momentos de conclusão de ciclo;
- apresentação de valor Premium.

Ela deve ser mais contida em:

- formulários;
- telas clínicas;
- configurações;
- privacidade;
- alertas;
- listas densas;
- visualizações analíticas;
- fluxos de correção de erro.

---

## 6. Estilo Geral

### 6.1 Aparência de base

A aparência geral deve utilizar superfícies limpas, contraste controlado, baixa ornamentação e hierarquia editorial. O sistema deve parecer sofisticado mesmo quando exibe uma tela simples.

### 6.2 Dark Mode e Light Mode

**Decisão:** Dark Mode permanece a expressão principal da marca; Light Mode é equivalente em qualidade e não uma adaptação secundária.

**Justificativa do Dark Mode como expressão principal:**

- reforça profundidade e concentração;
- diferencia a plataforma de aplicativos utilitários genéricos;
- combina com a narrativa de cosmos sem exigir ilustração literal;
- favorece ambientes de uso com iluminação controlada;
- permite que dados e imagens ganhem destaque com menor ruído de fundo.

**Justificativa do Light Mode como equivalente:**

- leitura prolongada e contexto clínico podem exigir maior luminosidade;
- ambientes externos e relatórios se beneficiam de superfícies claras;
- acessibilidade não permite assumir que um único tema serve a todos;
- usuários devem reconhecer a mesma COSMARIA em qualquer tema.

A estrutura visual, hierarquia e significado das cores devem permanecer equivalentes entre temas.

### 6.3 Relação entre tema e produto

Grow, Med e Core usam ambos os temas. Nenhum produto deve possuir tema exclusivo. A diferenciação ocorre por acento e conteúdo, não por transformar o Grow em “escuro” e o Med em “claro”.

### 6.4 Estética de superfícies

As superfícies devem parecer digitais e precisas. Texturas artificiais, ruído, papel, grão ou vidro fosco não devem ser aplicados a toda a interface.

Textura pode existir apenas em:

- fotografia;
- ilustrações editoriais;
- fundos institucionais muito controlados;
- materiais de comunicação externos ao fluxo operacional.

### 6.5 Ornamentação

A ornamentação deve representar no máximo uma camada de apoio. Ela nunca deve ser necessária para compreender a tela.

---

## 7. Minimalismo × Densidade

### 7.1 Posição oficial

A COSMARIA adota **minimalismo informacional**, não minimalismo de conteúdo.

Isso significa:

- remover ruído;
- preservar contexto;
- apresentar o essencial primeiro;
- manter acesso à profundidade;
- evitar esconder dados relevantes apenas para obter uma tela vazia.

### 7.2 Densidade calibrada

A densidade deve variar conforme a tarefa:

| Tipo de tarefa | Densidade recomendada | Motivo |
|---|---|---|
| Check-in e registro rápido | baixa a média | velocidade e redução de erro |
| Dashboard diário | média | visão geral e priorização |
| Timeline | média a alta, com agrupamento | leitura longitudinal |
| Comparação de ciclos | alta, mas estruturada | necessidade analítica |
| Relatório clínico | média, editorial | leitura e compartilhamento |
| Configurações | média | clareza de consequências |
| Comunidade | média | equilíbrio entre conteúdo e contexto |
| Administração | alta | eficiência operacional |

### 7.3 Regra de densidade

A densidade deve ser aumentada por proximidade e alinhamento, não pela redução extrema de fonte ou alvo de toque.

### 7.4 Espaço em branco

Espaço em branco é uma ferramenta de separação semântica. Ele deve indicar:

- mudança de assunto;
- mudança de prioridade;
- início de nova seção;
- separação entre dados e ações;
- descanso antes de conteúdo complexo.

Espaço excessivo que obriga rolagem sem acrescentar clareza deve ser evitado.

### 7.5 Card soup

A interface não deve colocar cada informação dentro de um card. Cards são necessários apenas quando existe uma unidade semântica, interativa, comparável ou transportável.

**Justificativa:** excesso de cards cria fragmentação, aumenta bordas e superfícies, reduz a percepção de hierarquia e dificulta leitura contínua.

---

## 8. Linguagem Visual do COSMARIA Grow

### 8.1 Personalidade específica

Grow deve parecer:

- técnico;
- produtivo;
- experimental;
- organizado;
- vivo;
- progressivo;
- competente.

Não deve parecer recreativo, artesanal improvisado ou excessivamente rural.

### 8.2 Acento cromático

O acento do Grow é um **verde-teal botânico técnico**, de saturação moderada.

**Referência principal:** `#2E9E6B` no tema escuro e `#1F7A52` no tema claro.

**Justificativa:**

- conecta o produto ao universo vivo sem utilizar verde “folha” genérico;
- o componente teal reforça tecnologia e precisão;
- a saturação controlada evita aparência recreativa ou ecológica superficial;
- mantém contraste com semânticos de sucesso, que devem continuar sendo entendidos como estado, não identidade.

### 8.3 Uso do acento

O acento Grow deve ser usado em:

- estado selecionado;
- ação primária;
- progresso de ciclo;
- pontos de destaque editorial;
- dados diretamente relacionados ao contexto Grow quando não houver significado semântico concorrente.

Não deve colorir grandes áreas operacionais, textos longos ou todos os ícones.

### 8.4 Fotografia e imagem

Grow deve utilizar imagens reais de:

- plantas;
- cultivo;
- equipamentos;
- detalhes técnicos;
- ambientes;
- processos;
- materiais;
- evolução temporal.

A fotografia deve valorizar observação, estrutura e saúde da planta. Evitar imagens de consumo, fumaça, festas, buds glamourizados sem contexto técnico ou iconografia recreativa.

### 8.5 Densidade e ritmo

Grow pode operar com densidade um pouco maior que Med em telas analíticas, pois seu público especialista tende a comparar parâmetros e condições. Isso não permite reduzir legibilidade ou consistência.

### 8.6 Geometria

Grow pode enfatizar linhas de progressão, timelines, escalas, grades e relações entre medidas. A geometria deve permanecer compartilhada com o sistema principal.

### 8.7 Estados emocionais

- progresso: reconhecido com sobriedade;
- alerta: orientado à ação;
- problema: específico e não alarmista;
- conclusão: sensação de ciclo completo, sem confete ou gamificação infantil.

### 8.8 Proibições específicas

Grow não deve utilizar:

- verde neon;
- folha de cannabis como padrão dominante;
- estética de loja de cultivo;
- madeira, terra ou fibras como textura geral de UI;
- ícones caricatos;
- linguagem visual de videogame;
- troféus por ações rotineiras.

---

## 9. Linguagem Visual do COSMARIA Med

### 9.1 Personalidade específica

Med deve parecer:

- clínico sem ser hospitalar;
- acolhedor sem ser emocionalmente exagerado;
- discreto;
- seguro;
- sereno;
- legível;
- confiável.

### 9.2 Acento cromático

O acento do Med é um **azul clínico profundo com leve direção índigo**, visualmente distinto do violeta institucional do Core.

**Referência principal oficial:** `#4F7EDC` no tema escuro e `#3F64B5` no tema claro.

**Justificativa:**

- azul comunica estabilidade e confiança sem recorrer ao verde associado à cannabis;
- a distância cromática em relação ao violeta do Core reduz confusão entre contexto institucional e contexto clínico;
- a saturação moderada evita aparência hospitalar ou corporativa genérica;
- funciona como acento discreto em ambientes com dados sensíveis.

Esta definição substitui o valor candidato anterior do Med quando o Design System for revisado.

### 9.3 Uso do acento

O azul Med deve apoiar:

- ações primárias;
- seleção;
- continuidade de tratamento;
- leitura de evolução;
- destaques clínicos neutros.

Não deve representar melhora, sucesso ou segurança clínica por si só. Estados semânticos permanecem independentes.

### 9.4 Fotografia e imagem

Med deve utilizar imagens que representem:

- rotina de cuidado;
- autonomia;
- acompanhamento;
- contexto doméstico digno;
- relação com profissionais de saúde quando aplicável;
- diversidade etária e corporal;
- discrição.

Não utilizar imagens de sofrimento dramatizado, jalecos genéricos apenas para parecer “médico”, folhas de cannabis, fumaça ou estética farmacêutica promocional.

### 9.5 Ritmo e densidade

Med deve possuir ritmo mais respirado em registros clínicos, relatórios e mensagens de alerta. A densidade pode aumentar em timelines e relatórios, mas a leitura deve permanecer editorial.

### 9.6 Tom visual de alerta

Alertas de saúde devem priorizar clareza e orientação. Vermelho intenso deve ser reservado para criticidade real. Mensagens de preenchimento incompleto, sincronização ou ausência de dados não devem parecer emergências médicas.

### 9.7 Privacidade

O Med deve oferecer a expressão mais discreta da plataforma:

- miniaturas sensíveis protegidas quando necessário;
- identificadores neutros;
- menor presença de imagens explícitas;
- estados de privacidade claramente visíveis;
- Modo Discreto coerente e persistente.

### 9.8 Proibições específicas

Med não deve utilizar:

- verde como identidade principal;
- símbolos recreativos;
- estética de dispensário;
- linguagem visual infantil;
- excesso de branco clínico e azul brilhante;
- cruz médica como ornamento genérico;
- imagens de doença para gerar medo;
- promessas visuais de cura.

---

## 10. Linguagem Visual do COSMARIA Core

### 10.1 Função visual

Core representa a plataforma, a conta, o onboarding compartilhado, privacidade, dados, assinatura, configurações e relações entre módulos.

Ele deve ser visualmente neutro em relação a Grow e Med, mas reconhecível como COSMARIA.

### 10.2 Acento cromático

O acento institucional é um **violeta-cosmos refinado**.

**Referência principal:** `#8B7FE0` no tema escuro e `#5F4FCC` no tema claro.

**Justificativa:**

- conecta-se à narrativa de cosmos e organização;
- diferencia a marca-mãe do verde Grow e do azul Med;
- transmite tecnologia sem cair em ciano neon;
- funciona em onboarding, conta, privacidade e comunicação institucional.

### 10.3 Presença do Core

O Core deve aparecer como estrutura estável. Ele não deve competir cromaticamente com o contexto ativo. Em telas compartilhadas, o acento institucional só deve ser usado quando a ação pertence realmente à plataforma e não ao produto aberto.

### 10.4 Transição entre contextos

Ao alternar entre Grow, Med e Core, a estrutura da interface deve permanecer. A mudança de acento deve ser percebida como mudança de contexto dentro do mesmo ecossistema, não como troca de aplicativo sem relação.

### 10.5 Proibições específicas

Core não deve se tornar:

- uma terceira identidade dominante;
- um tema roxo aplicado a toda tela;
- um espaço de experimentação visual;
- uma mistura cromática de Grow e Med;
- um ambiente genérico sem marca.

---

# PARTE II — TERRITÓRIO ARTÍSTICO E FUNDAÇÕES VISUAIS

## 11. Moodboard Conceitual

### 11.1 Função do moodboard

O moodboard da COSMARIA não é uma coleção de telas de referência. Ele é um conjunto de sinais visuais que define atmosfera, materialidade, luz, ritmo e personalidade. Referências externas devem ser utilizadas para extrair princípios, nunca para reproduzir layouts, componentes ou identidades.

### 11.2 Moodboard-mãe: “ordem viva”

A atmosfera institucional deve combinar:

- fundos profundos e neutros;
- luz suave e direcionada;
- precisão de instrumentos científicos;
- composição editorial;
- pontos de cor controlados;
- relações entre linhas, ciclos e dados;
- materiais reais fotografados com alta definição;
- sensação de silêncio visual;
- profundidade sem dramaticidade.

**Imagem mental:** um laboratório contemporâneo e acolhedor observando um sistema vivo com respeito, clareza e método.

### 11.3 Moodboard Grow: “engenharia do cultivo”

Referências conceituais:

- macrofotografia botânica técnica;
- iluminação de estufa controlada, sem dominante magenta;
- folhas, substratos e equipamentos em contexto real;
- gráficos ambientais precisos;
- cadernos de campo contemporâneos;
- ciclos, medições e evolução;
- materiais verdes profundos, minerais, grafite e metal fosco;
- superfícies limpas com detalhes funcionais.

**Evitar:** lifestyle, fumaça, festa, “stoner culture”, verde fluorescente, fundos psicodélicos, ilustração caricata de buds.

### 11.4 Moodboard Med: “cuidado clínico sereno”

Referências conceituais:

- fotografia de rotina doméstica sofisticada e real;
- luz natural suave;
- materiais claros e táteis em pequenas doses;
- azul profundo e neutros quentes;
- documentos clínicos editoriais;
- espaços silenciosos e privados;
- mãos, gestos e objetos de cuidado sem dramatização;
- diversidade de pessoas com postura digna e autônoma.

**Evitar:** hospital branco estéril, banco de imagens de médico apontando prancheta, sofrimento performático, cores farmacêuticas brilhantes, estética de spa.

### 11.5 Moodboard IA: “inteligência transparente”

Referências conceituais:

- linhas de relação;
- campos de probabilidade;
- camadas de evidência;
- intervalos e limites;
- redes discretas;
- anotações científicas;
- mapas de correlação;
- movimento calmo de organização.

**Evitar:** robôs, cérebros luminosos, rostos sintéticos, esferas mágicas, partículas aleatórias, olhos, circuitos neon.

### 11.6 Moodboard Comunidade: “conhecimento compartilhado”

Referências conceituais:

- editoriais de comunidades profissionais;
- documentação colaborativa;
- perfis com credibilidade e contexto;
- conteúdo real produzido por usuários;
- relações sociais discretas;
- reputação baseada em contribuição, não celebridade.

**Evitar:** feed de entretenimento, contadores gigantes de popularidade, estética de influencer, reações exageradas, competição visual.

### 11.7 Moodboard Premium: “profundidade e domínio”

Referências conceituais:

- acabamento editorial de alta qualidade;
- detalhes metálicos quentes muito discretos;
- maior profundidade de conteúdo;
- precisão de relatórios e comparações;
- sensação de acesso ampliado, não de clube exclusivo.

**Evitar:** ouro brilhante, coroas, diamantes, faixas VIP, cadeados dramáticos, luxo de cassino.

### 11.8 Critério de seleção de referências futuras

Uma referência só pode entrar no moodboard oficial quando:

1. representa pelo menos três atributos da marca;
2. não depende de tendência efêmera;
3. pode ser traduzida para ambos os temas;
4. não contradiz privacidade ou postura clínica;
5. não exige cópia de uma identidade externa;
6. possui aplicação potencial em mais de uma tela ou módulo.

---

## 12. Color Psychology e Sistema Cromático

### 12.1 Papel da cor

A cor tem quatro funções distintas:

1. **identidade:** indicar Core, Grow ou Med;
2. **semântica:** comunicar sucesso, atenção, erro ou informação;
3. **hierarquia:** orientar prioridade e seleção;
4. **dados:** diferenciar séries, faixas e categorias.

Essas funções não devem ser confundidas. Um verde de identidade Grow não significa automaticamente sucesso. Um azul de identidade Med não significa automaticamente informação.

### 12.2 Regra de economia cromática

A maior parte da interface deve ser neutra. A cor aparece para orientar, não para preencher.

**Distribuição perceptiva recomendada:**

- 70–85% neutros e superfícies;
- 10–20% conteúdo, bordas e contraste secundário;
- 5–10% acentos e semânticos.

Essa proporção não é uma métrica de implementação, mas um critério visual para evitar interfaces excessivamente coloridas.

### 12.3 Neutros — tema escuro

| Papel | Referência | Intenção |
|---|---:|---|
| Fundo-base | `#0B0F14` | profundidade neutra, sem preto absoluto |
| Superfície principal | `#12181F` | separação sutil do fundo |
| Superfície elevada | `#1A222B` | hierarquia tonal |
| Texto principal | `#EDF1F5` | leitura clara sem branco agressivo |
| Texto secundário | `#9AA7B2` | contexto com contraste controlado |
| Texto terciário | `#6B7885` | metadados não críticos |
| Borda | `#232D38` | estrutura discreta |

**Justificativa:** preto absoluto e branco absoluto criam contraste excessivo e fadiga. Neutros levemente azulados reforçam precisão tecnológica sem alterar a percepção das fotografias e cores de dados.

### 12.4 Neutros — tema claro

| Papel | Referência | Intenção |
|---|---:|---|
| Fundo-base | `#F7F8FA` | luminosidade suave, não branco puro |
| Superfície principal | `#FFFFFF` | conteúdo editorial e leitura |
| Superfície secundária | `#EEF1F4` | separação sem sombra excessiva |
| Texto principal | `#10151A` | alto contraste sem preto absoluto |
| Texto secundário | `#4B5760` | leitura auxiliar |
| Texto terciário | `#6F7C86` | metadados e suporte |
| Borda | `#DDE3E8` | organização silenciosa |

### 12.5 Cores de identidade

| Contexto | Escuro | Claro | Psicologia |
|---|---:|---:|---|
| Core | `#8B7FE0` | `#5F4FCC` | conhecimento, cosmos, tecnologia serena |
| Grow | `#2E9E6B` | `#1F7A52` | vida, produtividade, técnica botânica |
| Med | `#4F7EDC` | `#3F64B5` | confiança clínica, calma, discrição |
| Premium | `#C4A56A` | `#8F6E35` | profundidade, valor e maturidade |

### 12.6 Cores semânticas

| Significado | Escuro | Claro | Regra |
|---|---:|---:|---|
| Sucesso | `#34C77B` | `#1E8F58` | ação concluída ou estado positivo confirmado |
| Atenção | `#E8A93E` | `#A96C16` | requer atenção, sem criticidade imediata |
| Crítico/erro | `#E5675E` | `#B8352D` | falha, risco real ou ação destrutiva |
| Informação | `#4EA1E8` | `#1F71B8` | orientação neutra e contexto |

Nenhuma cor semântica pode ser usada apenas por estética. Ela sempre deve possuir significado consistente.

### 12.7 Premium não é semântico

A cor Premium não pode substituir sucesso, seleção, alerta ou ação primária. Ela serve para identificar profundidade de acesso e valor adicional. Deve ser utilizada em pequenos detalhes, selos, linhas, ilustrações editoriais e momentos de comparação.

### 12.8 Cor e privacidade

Privado, compartilhado e público não devem ser representados por uma escala “ruim → bom”. Privacidade é escolha, não falha.

Recomendação visual:

- privado: neutro protegido;
- compartilhado restrito: acento institucional discreto;
- público: informação clara, não celebração;
- sensível: combinação de ícone, texto e tratamento de conteúdo.

### 12.9 Cor e IA

A IA não deve possuir uma cor semântica exclusiva que faça toda inferência parecer especial ou superior. O contexto do produto permanece dominante. Elementos de IA podem utilizar:

- acento do módulo;
- neutros de profundidade;
- violeta institucional em pequenas assinaturas;
- cores semânticas somente quando o insight tiver severidade real.

### 12.10 Cor em gráficos

Gráficos devem separar três famílias:

1. **sequencial:** uma variável aumentando ou diminuindo;
2. **divergente:** valores em torno de uma referência;
3. **categórica:** séries independentes.

Cores semânticas não devem ser usadas como categorias arbitrárias quando isso puder gerar interpretação falsa.

### 12.11 Escalas sequenciais

- Grow: escala de neutro para verde-teal;
- Med: escala de neutro para azul;
- Core/IA: escala de neutro para violeta;
- criticidade: escala própria de atenção para crítico, apenas quando semanticamente correta.

### 12.12 Escala divergente

Quando houver uma faixa de referência:

- centro ou faixa adequada: neutro ou acento contido;
- desvio moderado: âmbar;
- desvio relevante: coral/vermelho;
- nunca usar vermelho e verde sem forma, rótulo ou padrão complementar.

### 12.13 Cor em fotografias

Fotografias devem manter cores naturais. Não aplicar o acento do módulo como filtro global. A identidade deve vir da seleção, iluminação e composição, não de uma dominante artificial.

### 12.14 Proibições cromáticas

- arco-íris funcional sem significado;
- gradiente em todos os botões;
- verde recreativo saturado;
- roxo neon;
- vermelho para erros leves;
- dourado em grandes áreas Premium;
- cor como único indicador;
- alteração de significado entre módulos;
- opacidade tão baixa que comprometa contraste.

---

## 13. Tipografia

### 13.1 Decisão tipográfica

A interface da COSMARIA deve utilizar uma única família sans-serif variável, contemporânea e altamente legível como base do produto.

**Direção candidata:** **Inter** como referência principal para UI, dados e relatórios digitais — mesmo status de candidata sujeita a validação formal já usado pelos valores do doc 11 §4 (licenciamento e nome final ficam para o doc 13, que ainda não escolheu nenhuma fonte).

**Justificativa:**

- excelente legibilidade em tamanhos pequenos;
- boa diferenciação de caracteres;
- suporte a números tabulares;
- ampla cobertura de pesos;
- comportamento estável em múltiplas plataformas;
- neutralidade suficiente para Grow e Med;
- reduz complexidade de manutenção em comparação com múltiplas famílias.

Uma substituição futura só pode ocorrer por necessidade comprovada de licenciamento, suporte linguístico, desempenho ou identidade, nunca por tendência.

### 13.2 Personalidade tipográfica

A tipografia deve parecer:

- racional;
- limpa;
- contemporânea;
- levemente humanista;
- confiável;
- não ornamental.

### 13.3 Hierarquia recomendada

| Papel | Função | Característica |
|---|---|---|
| Display | comunicação institucional e marcos | uso raro, forte presença, espaço amplo |
| Título de página | contexto principal | claro, curto, sem competir com dados |
| Título de seção | organização | consistente e previsível |
| Título de item | entidade ou conteúdo | peso médio/semibold |
| Corpo | explicação e leitura | ritmo confortável |
| Label | campos e controles | precisão e concisão |
| Metadado | data, origem, status auxiliar | menor ênfase, nunca ilegível |
| Dado | número, unidade, medição | números tabulares, alinhamento consistente |

### 13.4 Escala

A escala deve seguir uma progressão limitada e reutilizável. A referência inicial é:

- 12 — legenda e metadado;
- 14 — texto auxiliar e interface compacta;
- 16 — corpo principal;
- 18 — corpo destacado;
- 20 — título de bloco;
- 24 — título de seção ou página móvel;
- 30 — título de página ampla;
- 38 — destaque editorial;
- 48 — display institucional.

O tamanho final deve respeitar plataforma, densidade e aumento de fonte. A escala não pode ser usada como justificativa para congelar texto em dimensões rígidas.

### 13.5 Pesos

- Regular: leitura longa;
- Medium: labels, navegação e ênfase moderada;
- Semibold: títulos e ações prioritárias;
- Bold: uso raro, apenas para marcos ou números de alto destaque.

Evitar excesso de bold. Quando tudo é pesado, a hierarquia desaparece.

### 13.6 Números e unidades

- números comparáveis devem utilizar algarismos tabulares;
- unidade deve ter hierarquia inferior ao valor;
- valor e unidade não devem quebrar separadamente;
- casas decimais devem ser consistentes dentro da mesma comparação;
- zeros desnecessários devem ser evitados quando não houver exigência técnica;
- sinal, tendência e período devem ser visualmente distintos do valor.

### 13.7 Leitura clínica

Relatórios e timelines do Med devem privilegiar:

- linhas de texto de comprimento moderado;
- espaçamento vertical confortável;
- títulos descritivos;
- números com unidade e contexto;
- ausência de caixa alta extensa;
- não depender de abreviações sem explicação.

### 13.8 Leitura técnica

Grow pode utilizar maior densidade de labels e métricas, mas deve manter:

- unidade visível;
- referência temporal;
- consistência decimal;
- agrupamento por tema;
- distinção entre medido, calculado e recomendado.

### 13.9 Caixa alta

Caixa alta deve ser restrita a:

- siglas técnicas;
- pequenos labels editoriais;
- categorias compactas.

Não utilizar em frases, mensagens de erro, botões longos ou alertas. Caixa alta reduz legibilidade e pode soar agressiva.

### 13.10 Alinhamento

- texto corrido: alinhado ao início;
- números em tabelas: alinhados por valor ou casa decimal;
- títulos: alinhados ao início, salvo composição institucional específica;
- centralização: somente em estados vazios, confirmações ou comunicações de foco único.

### 13.11 Proibições tipográficas

- mais de uma família na interface operacional;
- pesos muito finos;
- títulos decorativos em itálico;
- corpo abaixo do limite de legibilidade;
- texto cinza de baixo contraste;
- labels somente em placeholder;
- truncamento sem acesso ao conteúdo completo;
- caixa alta extensa;
- números proporcionais em comparações.

---

## 14. Iconografia

### 14.1 Papel

Ícones reduzem tempo de reconhecimento, reforçam relações e complementam texto. Eles não devem substituir linguagem quando o significado não for universal.

### 14.2 Estilo oficial

A iconografia deve ser:

- linear;
- geométrica;
- cantos moderadamente suavizados;
- traço uniforme;
- sem detalhes decorativos;
- legível em tamanhos pequenos;
- coerente entre plataformas.

### 14.3 Peso visual

O traço deve possuir peso médio. Traços muito finos desaparecem; traços muito grossos tornam a interface pesada e informal.

### 14.4 Grid

Todos os ícones devem nascer de uma grade consistente, com área de respiro óptico. Ícones com formas naturalmente menores devem receber compensação óptica, não apenas dimensões matemáticas iguais.

### 14.5 Ícone + texto

Ícones isolados são permitidos somente quando:

- o significado é universal;
- há rótulo acessível;
- existe repetição suficiente para aprendizado;
- o contexto elimina ambiguidade.

Ações críticas, privacidade, IA e termos técnicos devem normalmente incluir texto.

### 14.6 Ícones técnicos Grow

Devem representar objetos e fenômenos com precisão suficiente:

- temperatura;
- umidade;
- luz;
- água;
- nutrientes;
- fase;
- sanidade;
- colheita.

Não devem usar metáforas recreativas ou simplificações que confundam grandezas diferentes.

### 14.7 Ícones clínicos Med

Devem ser neutros e dignos. Evitar excesso de cruzes, corações ou símbolos hospitalares. Sintomas podem usar formas abstratas ou corporais discretas, acompanhadas de texto.

### 14.8 Ícones de privacidade

Privado, oculto, compartilhado e público devem possuir símbolos distintos. O cadeado não deve representar tudo.

### 14.9 Ícones de IA

A IA deve utilizar uma assinatura abstrata baseada em relações, camadas ou pontos conectados. Não usar:

- robô;
- varinha mágica;
- cérebro;
- lâmpada como símbolo universal;
- estrela de “mágica” sem explicação.

### 14.10 Ícones de aplicativo

- Grow: referência abstrata a ciclo, crescimento ou estrutura vegetal; sem folha literal dominante.
- Med: símbolo discreto de acompanhamento, equilíbrio ou cuidado; sem cannabis explícita.
- Core/COSMARIA: sistema orbital abstrato, relação ou harmonia; sem planeta ilustrativo.

### 14.11 Cores

Ícones funcionais devem herdar a cor do conteúdo ou estado. Não colorir cada ícone com uma cor diferente. Ícones semânticos devem usar cor + forma + texto.

### 14.12 Proibições

- mistura de ícones preenchidos e lineares sem regra;
- emojis como iconografia do produto;
- ícones 3D em fluxos operacionais;
- ilustrações reduzidas usadas como ícone;
- símbolo de folha para qualquer ação Grow;
- ícones exclusivos sem necessidade semântica real.

---

## 15. Ilustrações

### 15.1 Função

Ilustrações devem explicar, acolher ou dar identidade a momentos de baixa densidade. Não devem competir com dados nem ocupar espaço em tarefas recorrentes.

### 15.2 Estilo

O estilo recomendado é **abstrato-editorial com geometria orgânica controlada**:

- formas simples;
- profundidade por sobreposição;
- poucos elementos;
- cores do contexto em baixa quantidade;
- linhas de relação e ciclos;
- textura mínima;
- sem personagens caricatos.

### 15.3 Ilustrações institucionais

Podem explorar:

- sistemas orbitais abstratos;
- relações entre dados e natureza;
- ciclos;
- camadas de conhecimento;
- expansão e evolução.

### 15.4 Ilustrações Grow

Podem representar:

- fases;
- ambiente;
- observação;
- progresso;
- relações entre parâmetros.

Devem evitar desenho literal de cannabis quando a função puder ser cumprida por metáfora sistêmica.

### 15.5 Ilustrações Med

Devem representar:

- rotina;
- acompanhamento;
- equilíbrio;
- evolução;
- privacidade;
- cuidado.

Sem dramatização de dor ou doença.

### 15.6 Estados vazios

Ilustração de estado vazio só deve existir quando ajuda a explicar o propósito ou reduzir sensação de abandono. Estados vazios frequentes e operacionais podem usar apenas ícone, texto e ação.

### 15.7 Escalabilidade

Toda ilustração deve pertencer a um sistema reutilizável de:

- paleta;
- formas;
- espessura;
- luz;
- perspectiva;
- nível de detalhe.

Ilustrações avulsas em estilos diferentes são proibidas.

### 15.8 Proibições

- personagens infantis;
- mascote de IA;
- estética cartoon recreativa;
- 3D inflável;
- ilustrações stock sem adaptação;
- excesso de metáforas espaciais;
- cenas complexas em telas de trabalho.

---

## 16. Fotografia

### 16.1 Princípio

A fotografia deve tornar o produto mais real, confiável e humano. Ela não deve funcionar como decoração genérica.

### 16.2 Direção de luz

- luz natural ou artificial suave;
- contraste moderado;
- sombras detalhadas;
- altas luzes controladas;
- ausência de HDR agressivo;
- balanço de branco natural;
- sem dominantes de cor artificiais.

### 16.3 Composição

Preferir:

- enquadramentos observacionais;
- detalhes significativos;
- contexto real;
- mãos e ações autênticas;
- profundidade moderada;
- espaço negativo para comunicação institucional.

Evitar poses publicitárias óbvias e pessoas olhando diretamente para a câmera sem necessidade.

### 16.4 Pessoas

A fotografia deve representar diversidade real de:

- idade;
- gênero;
- tonalidade de pele;
- contexto socioeconômico;
- tipos corporais;
- necessidades de cuidado.

A representação deve preservar dignidade. O paciente não é definido por sua condição; o cultivador não é estereotipado.

### 16.5 Grow

- plantas saudáveis ou problemas reais com finalidade educativa;
- equipamentos em uso;
- macrodetalhes tecnicamente úteis;
- ambientes organizados, mas não irreais;
- ausência de consumo recreativo.

### 16.6 Med

- situações de registro e acompanhamento;
- rotina doméstica;
- consulta ou preparação quando funcionalmente relevante;
- produtos apresentados de forma neutra;
- ausência de promessa de resultado.

### 16.7 Conteúdo gerado pelo usuário

Fotos dos usuários devem receber tratamento de enquadramento consistente, mas não filtros que alterem interpretação clínica ou técnica. Correção automática não pode esconder deficiências, pragas, coloração, detalhes do produto ou evidências relevantes.

### 16.8 Privacidade fotográfica

Conteúdo sensível pode receber:

- blur explícito;
- placeholder;
- ocultação até ação;
- indicador de proteção;
- restrição de miniatura.

A proteção deve ser reversível e compreensível.

### 16.9 Proibições

- fumaça como elemento estético;
- buds glamourizados;
- luz neon magenta de cultivo dominando a identidade;
- banco de imagem médico clichê;
- edição que altera dados visuais;
- filtros de acento sobre fotografias operacionais;
- imagens excessivamente perfeitas que reduzam autenticidade.

---

## 17. Gradientes

### 17.1 Posição oficial

Gradientes são recursos excepcionais, não base da interface.

### 17.2 Usos permitidos

- fundo institucional de onboarding;
- passagem sutil entre acento e neutro;
- visualização de intensidade ou probabilidade;
- atmosfera Premium muito discreta;
- máscara sobre imagem para garantir legibilidade;
- indicação de faixa em gráficos.

### 17.3 Características

Gradientes devem ser:

- de baixa saturação;
- com transição longa;
- sem múltiplas cores concorrentes;
- coerentes com o contexto;
- acessíveis quando contêm texto;
- pouco perceptíveis em interfaces operacionais.

### 17.4 Usos proibidos

- botões primários padrão;
- bordas de todos os cards;
- texto degradê;
- fundos animados constantes;
- auroras multicoloridas;
- gradiente arco-íris para IA;
- dourado metálico brilhante no Premium;
- gradiente sem função semântica.

### 17.5 Justificativa

Gradientes chamam atenção e envelhecem rapidamente quando usados como tendência. A contenção preserva longevidade e deixa o recurso disponível para momentos realmente especiais.

---

## 18. Elevação

### 18.1 Conceito

Elevação representa relação espacial e prioridade. Não representa importância de marca nem “beleza”.

### 18.2 Níveis conceituais

1. **Plano-base:** fundo geral.
2. **Plano de conteúdo:** seções e superfícies principais.
3. **Plano interativo:** elementos clicáveis, menus locais e cartões destacados.
4. **Plano temporário:** popovers, folhas e menus.
5. **Plano modal:** decisões que bloqueiam temporariamente o contexto.

### 18.3 Tema escuro

Elevação deve ser percebida principalmente por:

- mudança tonal;
- borda sutil;
- separação espacial;
- overlay.

Sombras profundas perdem qualidade em fundos escuros e devem ser usadas com cautela.

### 18.4 Tema claro

Elevação pode utilizar:

- sombra suave;
- borda leve;
- diferença de superfície;
- maior contraste em planos temporários.

### 18.5 Regra

Quanto maior a elevação, mais temporário e focal o elemento deve ser. Cards comuns não devem parecer modais.

### 18.6 Proibições

- múltiplos níveis de sombra numa mesma tela sem necessidade;
- card elevado apenas para “parecer premium”;
- elementos permanentes flutuando sobre o conteúdo;
- elevação aplicada a tudo.

---

## 19. Sombras

### 19.1 Personalidade

Sombras devem ser suaves, amplas e de baixa opacidade. Não devem criar bordas escuras ou efeito de objeto físico pesado.

### 19.2 Uso

Sombras são adequadas para:

- menus temporários;
- modais;
- folhas sobrepostas;
- elementos arrastados;
- barras flutuantes necessárias;
- superfícies em tema claro que exigem separação.

### 19.3 Dark Mode

No tema escuro, priorizar superfície e borda. Sombra pode existir como reforço secundário, nunca como único meio de separação.

### 19.4 Light Mode

No tema claro, a sombra deve continuar discreta. O sistema não adota estética skeuomórfica ou cartões soltos em uma mesa.

### 19.5 Proibições

- sombra colorida;
- glow permanente;
- sombra preta dura;
- sombra para todo componente;
- sombra interna decorativa;
- elevação inconsistente entre itens equivalentes.

---

## 20. Bordas

### 20.1 Função

Bordas organizam, delimitam e indicam estado. Elas não são decoração.

### 20.2 Uso preferencial

- separar superfícies próximas;
- definir campos;
- indicar foco;
- marcar seleção;
- estruturar tabelas e listas complexas;
- delimitar conteúdo interativo quando a superfície não for suficiente.

### 20.3 Intensidade

A borda padrão deve ser de baixo contraste. Foco, erro e seleção podem aumentar contraste e espessura perceptiva.

### 20.4 Bordas em cards

Cards comuns devem utilizar no máximo uma combinação entre:

- diferença de superfície;
- borda;
- sombra.

Usar os três simultaneamente só é permitido em planos temporários ou casos excepcionais.

### 20.5 Bordas e cor

A cor da borda deve seguir significado:

- neutra: estrutura;
- acento: seleção/foco contextual;
- semântica: erro, atenção ou sucesso real;
- Premium: identificação muito pontual, não contorno dourado de todos os itens.

### 20.6 Proibições

- bordas multicoloridas;
- bordas grossas decorativas;
- contornos brilhantes;
- borda em cada subdivisão sem necessidade;
- usar apenas borda vermelha sem mensagem de erro.

---

## 21. Radius e Geometria

### 21.1 Personalidade geométrica

A geometria da COSMARIA deve combinar estrutura técnica e suavidade humana. Cantos retos em excesso tornam o sistema rígido; arredondamento excessivo o torna informal e infantil.

### 21.2 Escala oficial de radius

| Nível | Referência | Uso visual |
|---|---:|---|
| Pequeno | 4 px | badges compactos, pequenos controles e elementos técnicos |
| Médio | 8 px | campos, botões, cards operacionais e itens de lista destacados |
| Grande | 16 px | modais, folhas, blocos editoriais e superfícies de grande escala |
| Circular | 999 px | avatares, indicadores, chips e controles cuja forma é semanticamente circular/pílula |

### 21.3 Justificativa

Uma escala curta reduz decisões locais e cria reconhecimento. Os valores estabelecem três níveis suficientemente distintos sem criar uma coleção de raios quase iguais.

### 21.4 Regra de hierarquia

O radius aumenta conforme a escala e a independência da superfície. Um pequeno campo não deve possuir o mesmo arredondamento expressivo de um grande modal.

### 21.5 Formas circulares

Círculos devem representar:

- avatar;
- estado pontual;
- indicador;
- ação iconográfica muito familiar;
- marcador em gráfico.

Não transformar todos os botões em pílulas. Pílulas ocupam mais espaço e transmitem caráter mais informal.

### 21.6 Geometria dos módulos

Grow, Med e Core compartilham a mesma escala. Não criar “Grow mais quadrado” ou “Med mais arredondado”. A personalidade específica vem da cor, imagem, conteúdo e ritmo.

### 21.7 Proibições

- radius aleatório por tela;
- cards com cantos excessivamente arredondados;
- mistura de cantos retos e redondos sem hierarquia;
- formas orgânicas irregulares em controles;
- pílulas para todas as ações;
- “squircle” exclusivo sem aplicação consistente em toda a plataforma.

---

## 22. Motion

### 22.1 Filosofia

Movimento deve comunicar mudança, continuidade ou causalidade. A interface não deve se mover apenas para parecer tecnológica.

### 22.2 Personalidade do movimento

O motion da COSMARIA é:

- calmo;
- preciso;
- curto;
- responsivo;
- contínuo;
- sem elasticidade caricata;
- sem aceleração agressiva.

### 22.3 Escala temporal

| Categoria | Referência | Aplicação perceptiva |
|---|---:|---|
| Instantâneo | 100 ms | toque, pressão, mudança local mínima |
| Rápido | 150 ms | hover, foco, pequenas aparições |
| Base | 200 ms | mudança de estado e expansão simples |
| Lento | 300 ms | painel, folha, reorganização de conteúdo |
| Deliberado | 500 ms | onboarding, transição editorial ou mudança contextual importante |

### 22.4 Entrada e saída

- entrada: desacelera ao chegar, transmitindo estabilidade;
- saída: acelera levemente, evitando sensação de atraso;
- mudança no mesmo plano: curva equilibrada;
- ação imediata: resposta visual sem espera perceptível.

### 22.5 Continuidade espacial

Quando um elemento muda de posição ou expansão, o movimento deve ajudar a preservar relação entre origem e destino. A interface não deve fazer conteúdo “teletransportar” quando uma transição simples pode explicar a mudança.

### 22.6 Motion em dados

Gráficos podem animar atualização com suavidade, mas:

- não devem começar sempre do zero;
- não devem alterar a percepção do valor;
- não devem atrasar leitura;
- devem permitir comparação sem movimento obrigatório;
- previsões e intervalos devem surgir de forma legível, não teatral.

### 22.7 Motion em alertas

Alertas não devem pulsar continuamente. Uma entrada discreta é suficiente. Movimento repetitivo só é aceitável para processo realmente ativo e deve cessar quando não houver mudança.

### 22.8 Redução de movimento

Toda transição deve possuir equivalente reduzido ou instantâneo. A redução não pode remover informação; apenas eliminar deslocamento, escala, parallax ou repetição.

### 22.9 Proibições

- bounce exagerado;
- overshoot decorativo;
- confete;
- partículas;
- parallax constante;
- pulsação permanente;
- animação de texto em tarefas recorrentes;
- loaders longos sem progresso;
- movimento que bloqueia ação.

---

## 23. Microinterações

### 23.1 Definição

Microinterações são respostas visuais e táteis a ações pequenas. Elas devem aumentar confiança, não entretenimento.

### 23.2 Princípios

Toda microinteração deve responder a pelo menos uma função:

1. confirmar entrada;
2. indicar estado;
3. prevenir duplicação;
4. orientar continuidade;
5. mostrar relação causa–efeito;
6. informar progresso.

### 23.3 Pressão e seleção

- pressão deve reduzir sutilmente contraste ou escala, sem deformação;
- seleção deve permanecer visível após o toque;
- alternâncias devem mostrar estado anterior e novo de forma inequívoca;
- feedback não deve depender somente de animação.

### 23.4 Salvamento

O salvamento deve mostrar:

- início quando houver espera relevante;
- conclusão;
- falha específica;
- estado local/pendente quando offline.

A confirmação não deve interromper o usuário quando a ação for frequente e reversível.

### 23.5 Upload

Upload de foto ou documento deve comunicar:

- item local;
- progresso;
- conclusão;
- falha;
- retry;
- cancelamento quando permitido;
- proteção de conteúdo sensível.

### 23.6 Alteração de fase ou marco

Marcos importantes podem receber uma microinteração um pouco mais expressiva, baseada em progressão e conclusão. Não utilizar recompensa infantil.

### 23.7 Feedback tátil

Quando suportado, feedback tátil pode reforçar:

- seleção;
- conclusão;
- alerta;
- ação destrutiva.

Deve ser leve e não obrigatório. Não usar vibração para cada toque.

### 23.8 Proibições

- animação diferente para ações equivalentes;
- feedback que oculta resultado;
- microinteração sem estado estático acessível;
- som por padrão;
- celebração excessiva;
- atraso artificial para exibir animação.

---

# PARTE III — PADRÕES DE COMPOSIÇÃO DA INTERFACE

## 24. Navegação

### 24.1 Princípio visual

A navegação deve ser reconhecível, persistente quando necessária e visualmente subordinada ao conteúdo. Ela orienta; não deve se tornar a principal expressão artística da tela.

### 24.2 Navegação primária

- mobile: barra inferior;
- tablet/desktop: barra lateral;
- mesmos destinos, mesma ordem lógica e mesma iconografia;
- mudança de forma não altera significado.

### 24.3 Estado ativo

O item ativo deve ser identificado por combinação de:

- acento do contexto;
- forma ou superfície;
- peso do ícone/texto;
- rótulo.

Nunca depender apenas de cor.

### 24.4 Quantidade e estabilidade

A navegação primária deve manter poucos destinos estáveis. Recursos contextuais, notificações, privacidade e configurações profundas não devem disputar o mesmo nível visual sem necessidade funcional já definida.

### 24.5 Navegação secundária

Tabs e controles segmentados devem ser usados quando os conteúdos:

- pertencem ao mesmo contexto;
- são mutuamente exclusivos;
- precisam de alternância frequente;
- possuem rótulos curtos.

Não utilizar tabs para etapas sequenciais ou categorias demais.

### 24.6 Navegação hierárquica

Telas profundas devem preservar origem e contexto. O retorno deve ser visualmente previsível. Breadcrumbs são adequados em desktop quando a profundidade e o espaço justificarem.

### 24.7 Navegação e módulos

A transição Core → Grow → Med deve manter estrutura e alterar acento contextual. Não criar navegação completamente diferente em cada produto.

### 24.8 Deep links e estados temporários

Ao entrar por notificação ou link, o cabeçalho e a hierarquia visual devem revelar imediatamente:

- módulo atual;
- entidade ou conteúdo aberto;
- caminho de retorno;
- estado de acesso ou privacidade.

### 24.9 Proibições

- navegação escondida apenas por gesto;
- ícones sem rótulo em destinos principais;
- mais de uma navegação primária concorrente;
- ordem diferente entre dispositivos;
- barras coloridas ocupando grande área;
- navegação flutuante decorativa;
- tabs roláveis com dezenas de itens.

---

## 25. Cards

### 25.1 Definição

Card é uma unidade visual que agrupa conteúdo relacionado e, geralmente, permite ação, comparação, navegação ou reutilização. Não é apenas uma caixa com borda.

### 25.2 Quando utilizar

Usar card quando o conteúdo:

- representa uma entidade;
- precisa ser comparado com unidades equivalentes;
- possui ação própria;
- pode aparecer em diferentes contextos;
- exige separação clara do entorno;
- contém estado independente.

### 25.3 Quando não utilizar

Não usar card para:

- cada par label/valor;
- cada parágrafo;
- cada seção de formulário;
- linhas simples de lista;
- conteúdo contínuo de relatório;
- criar profundidade sem necessidade.

### 25.4 Anatomia visual

Sem definir componente técnico, um card deve organizar visualmente:

1. identidade ou título;
2. estado, quando relevante;
3. conteúdo principal;
4. metadados;
5. ação principal ou navegação;
6. ações secundárias discretas.

A ordem deve ser previsível entre entidades.

### 25.5 Card de entidade

Planta, ciclo, tratamento, produto, genética, lote e modelos devem compartilhar estrutura visual, mas a quantidade e o tipo de informação podem variar.

O card deve priorizar:

- nome;
- estado atual;
- contexto temporal;
- métrica principal;
- próxima ação relevante, quando já prevista no fluxo.

### 25.6 Card analítico

Cards de insight e alerta devem diferenciar:

- origem;
- conclusão principal;
- evidência;
- confiança;
- limitação;
- ação sugerida.

Não transformar toda análise em um card colorido de destaque.

### 25.7 Card social

Conteúdo da comunidade deve manter foco no conteúdo, não na moldura. Identidade, contexto, privacidade e ações sociais devem possuir hierarquia secundária clara.

### 25.8 Card Premium

O tratamento Premium pode usar detalhe quente discreto, mas não deve criar um componente estruturalmente diferente. O valor vem do conteúdo e da profundidade, não de uma borda dourada.

### 25.9 Estados

Cards interativos devem mostrar:

- repouso;
- hover quando aplicável;
- foco;
- pressionado;
- selecionado;
- desabilitado;
- carregando;
- erro ou conteúdo indisponível, quando aplicável.

### 25.10 Proibições

- cards dentro de cards em múltiplos níveis;
- sombra forte em todos os cards;
- raio diferente por tipo de entidade;
- ações demais no rodapé;
- inteiro card colorido por identidade;
- card sem hierarquia interna;
- card que imita botão sem parecer conteúdo.

---

## 26. Dashboards

### 26.1 Propósito visual

Dashboard não é uma coleção de widgets. Ele é uma síntese orientada à decisão.

### 26.2 Hierarquia recomendada

A composição deve responder, nesta ordem:

1. Qual é o contexto atual?
2. O que exige atenção agora?
3. Qual é a ação mais relevante?
4. Como está o progresso?
5. Quais informações secundárias ajudam a decidir?
6. O que pode ser explorado depois?

### 26.3 Dashboard Grow

A linguagem visual deve enfatizar:

- ciclos ativos;
- fase e progresso;
- tarefas e alertas;
- condições e tendências;
- continuidade do registro.

Não deve parecer um painel industrial de controle em tempo real quando os dados não são realmente em tempo real.

### 26.4 Dashboard Med

Deve enfatizar:

- tratamento ativo;
- rotina e registros;
- evolução;
- pendências relevantes;
- clareza clínica.

Evitar excesso de métricas simultâneas ou indicadores que possam ser interpretados como diagnóstico.

### 26.5 Dashboard Core

Deve ser neutro e orientado a conta, privacidade, assinatura e acesso aos produtos. Não deve duplicar dashboards de Grow ou Med.

### 26.6 Composição

- uma área principal de prioridade;
- grupos secundários claros;
- alinhamento consistente;
- métricas com contexto;
- poucos tamanhos de card;
- ausência de mosaico aleatório.

### 26.7 Desktop

Telas maiores podem mostrar informações paralelas, mas devem preservar ordem vertical. O olhar precisa encontrar uma narrativa, não apenas uma grade.

### 26.8 Mobile

O dashboard deve ser uma sequência prioritária. A ordem é mais importante que simetria. Não reduzir cards de desktop até ficarem ilegíveis.

### 26.9 Proibições

- “tile wall” sem prioridade;
- gráfico em todo card;
- KPI sem período ou comparação;
- cores demais;
- cards de alturas aleatórias sem lógica;
- indicadores de progresso decorativos;
- informações duplicadas.

---

## 27. Listas

### 27.1 Princípio

Listas são o padrão preferencial para itens repetidos que precisam de leitura, comparação ou ação rápida.

### 27.2 Hierarquia de uma linha

Uma linha deve possuir:

- informação principal;
- contexto secundário;
- estado;
- ação ou indicador de navegação quando necessário.

### 27.3 Densidade

- confortável: uso diário, conteúdo sensível, mobile;
- compacta: administração, comparação e desktop;
- a densidade não deve alterar significado nem remover foco acessível.

### 27.4 Divisores

Divisores devem ser discretos e utilizados quando espaço sozinho não separa itens. Não contornar cada linha como card.

### 27.5 Agrupamento

Listas longas devem ser agrupadas por:

- data;
- estado;
- fase;
- contexto;
- categoria funcional.

O agrupamento deve reduzir esforço de busca, não apenas decorar.

### 27.6 Itens com imagem

Miniaturas devem ter proporção consistente e tamanho suficiente para reconhecimento. Conteúdo sensível deve respeitar proteção visual.

### 27.7 Swipe e gestos

Ações por gesto não podem ser a única forma de acesso. A aparência deve indicar quando há ações adicionais e oferecer alternativa acessível.

### 27.8 Seleção múltipla

Quando o modo de seleção estiver ativo, a mudança visual deve ser clara em toda a lista. A seleção não deve ser confundida com estado do item.

### 27.9 Proibições

- listas de cards sem necessidade;
- três ou mais linhas de metadados por item móvel sem hierarquia;
- ações invisíveis apenas no hover;
- uso de cor como única seleção;
- divisores pesados;
- truncamento de informação crítica.

---

## 28. Gráficos e Visualização de Dados

### 28.1 Princípio central

Gráficos existem para revelar padrões, não para decorar dashboards.

### 28.2 Honestidade visual

- eixos devem ser coerentes;
- cortes de escala devem ser explícitos;
- períodos devem estar visíveis;
- valores ausentes não podem ser interpolados silenciosamente;
- previsões devem ser diferenciadas de dados observados;
- incerteza deve ser exibida quando relevante;
- correlação nunca deve parecer causalidade por tratamento visual.

### 28.3 Tipos preferenciais

- linha: evolução temporal;
- área discreta: tendência acumulada ou faixa;
- barra: comparação de categorias;
- barra empilhada: composição quando o total é relevante;
- scatter: correlação;
- heatmap: densidade ou padrão temporal;
- tabela: precisão e comparação detalhada;
- sparkline: tendência compacta, sempre com contexto textual.

### 28.4 Tipos proibidos ou fortemente restritos

- 3D;
- pizza com muitas categorias;
- donut decorativo para todo percentual;
- gauge de velocímetro;
- radar sem necessidade comprovada;
- bolhas sem escala clara;
- visualizações experimentais que reduzam leitura.

### 28.5 Eixos e grades

Grades devem ser discretas. Rótulos e unidades precisam ser legíveis. O eixo deve apoiar leitura sem dominar o gráfico.

### 28.6 Séries múltiplas

- limitar séries simultâneas;
- usar cor, forma e estilo de linha;
- permitir destacar uma série;
- fornecer legenda próxima ou rótulo direto;
- não depender de oito tons parecidos.

### 28.7 Faixas de referência

Faixas adequadas devem aparecer como áreas suaves, com rótulo e explicação. Não usar apenas verde de fundo.

### 28.8 Previsão e confiança

- dado observado: linha sólida;
- previsão: linha distinta ou tracejada;
- intervalo de confiança: faixa translúcida;
- confiança textual: sempre disponível;
- limitação: próxima ao gráfico, não escondida em tooltip.

### 28.9 Dados clínicos

Gráficos Med devem evitar interpretações alarmistas. Uma piora em escala não deve automaticamente ocupar toda a tela com vermelho. O significado depende do sintoma, período e referência.

### 28.10 Dados Grow

Parâmetros técnicos devem exibir unidade, fase e faixa aplicável. Comparar ciclos exige alinhar tempo absoluto ou fase de forma claramente identificada.

### 28.11 Tooltips

Devem apresentar:

- valor;
- unidade;
- data/período;
- série;
- origem quando relevante;
- distinção entre medido, calculado e previsto.

Tooltips não podem ser a única forma de acessar dados importantes.

### 28.12 Acessibilidade

Todo gráfico deve possuir equivalente textual ou tabular. Cores devem ser complementadas por forma, padrão ou rótulo. A ordem de leitura deve ser definida.

### 28.13 Proibições

- gráficos sem pergunta clara;
- animação que altera percepção;
- semânticos usados como categorias aleatórias;
- legenda distante;
- excesso de casas decimais;
- escala truncada sem indicação;
- previsões visualmente idênticas a dados reais;
- confiança representada apenas por brilho.

---

## 29. Estados Vazios

### 29.1 Função

Estado vazio explica por que não há conteúdo e o que o usuário pode fazer. Ele não é espaço para marketing irrelevante.

### 29.2 Categorias

1. **Primeiro uso:** nenhum dado foi criado.
2. **Resultado vazio:** filtro ou busca não encontrou conteúdo.
3. **Histórico ainda vazio:** a função existe, mas depende de tempo ou registros.
4. **Conteúdo removido/indisponível:** existia, mas não pode ser exibido.
5. **Acesso vazio:** não há item disponível por permissão ou contexto.

Cada categoria precisa de linguagem e ação diferentes.

### 29.3 Composição

Um estado vazio deve conter, conforme necessário:

- ícone ou ilustração discreta;
- título específico;
- explicação curta;
- ação principal;
- ação secundária ou orientação quando útil.

### 29.4 Tom

- direto;
- não culpabilizante;
- orientado ao próximo passo;
- sem humor em contextos clínicos;
- sem celebrar ausência de dados.

### 29.5 Visual

Estados vazios de primeiro uso podem ser mais expressivos. Resultados vazios recorrentes devem ser compactos e não interromper fluxo.

### 29.6 Proibições

- “Nada por aqui” sem explicação;
- ilustração grande em toda ausência;
- CTA para ação não relacionada;
- paywall disfarçado de estado vazio;
- linguagem de culpa;
- esconder filtros ativos.

---

## 30. Estados de Erro

### 30.1 Princípio

Erro deve explicar o que aconteceu, o impacto e a possibilidade de recuperação. Ele não deve apenas comunicar falha.

### 30.2 Hierarquia de erro

1. campo;
2. ação;
3. bloco;
4. tela;
5. sistema/serviço.

O tratamento visual deve ocorrer no menor nível capaz de explicar e resolver o problema.

### 30.3 Erro de campo

- mensagem próxima ao campo;
- borda/indicador semântico;
- ícone quando útil;
- instrução de correção;
- preservar valor digitado.

### 30.4 Erro de ação

Deve informar se a ação foi ou não concluída e oferecer retry quando seguro. Não usar confirmação de erro ambígua.

### 30.5 Erro de tela

Deve preservar navegação e contexto sempre que possível. A tela não deve se tornar um bloqueio total por falha de uma seção secundária.

### 30.6 Erro clínico e sensível

O visual deve ser calmo e específico. Vermelho intenso só quando a criticidade do produto justificar, não para falha de rede ou campo obrigatório.

### 30.7 Erro offline

Distinguir:

- sem conexão;
- salvo localmente;
- aguardando envio;
- falha definitiva;
- conflito.

### 30.8 Proibições

- “Algo deu errado” como única mensagem;
- apagar dados;
- vermelho em toda a tela;
- erro em modal para falhas leves;
- código técnico sem tradução;
- ação de retry sem explicar impacto;
- usar humor.

---

## 31. Loading

### 31.1 Princípio

Loading deve reduzir incerteza. O usuário precisa compreender que o sistema está ativo e, quando relevante, o que está sendo processado.

### 31.2 Tipos

- carregamento inicial;
- atualização local;
- ação em andamento;
- processamento assíncrono;
- upload/download;
- sincronização;
- geração de relatório.

Esses estados não devem ter a mesma aparência.

### 31.3 Indicador indeterminado

Usar quando a duração não pode ser estimada e o conteúdo não possui estrutura previsível. Deve ser pequeno e próximo do local afetado.

### 31.4 Progresso determinado

Usar quando houver etapas ou percentual real. Não simular progresso falso.

### 31.5 Ações em andamento

O elemento acionado deve indicar loading e impedir duplicação quando necessário, preservando seu tamanho para evitar deslocamento.

### 31.6 Processos longos

Devem permitir saída quando funcionalmente possível e mostrar que o processo continuará. A linguagem visual deve diferenciar “processando” de “travado”.

### 31.7 Proibições

- spinner de tela inteira para toda requisição;
- bloquear navegação sem necessidade;
- progresso fictício;
- múltiplos spinners concorrentes;
- animações chamativas;
- conteúdo piscando em atualizações frequentes.

---

## 32. Skeleton

### 32.1 Função

Skeleton antecipa a estrutura do conteúdo e reduz deslocamento perceptivo em carregamentos previsíveis.

### 32.2 Quando usar

- listas;
- cards conhecidos;
- dashboards;
- timelines;
- perfis;
- blocos de dados com layout estável.

### 32.3 Quando não usar

- ações rápidas;
- conteúdo cuja estrutura é desconhecida;
- processos de geração;
- erro ou estado vazio;
- botão isolado.

### 32.4 Aparência

- formas aproximam a estrutura real;
- contraste baixo;
- animação suave ou estática em redução de movimento;
- sem brilho intenso;
- sem detalhes excessivos;
- dimensões estáveis para evitar layout shift.

### 32.5 Conteúdo sensível

Skeleton não deve revelar pelo formato que existe determinado tipo de dado sensível quando o Modo Discreto exigir proteção.

### 32.6 Proibições

- skeleton genérico que não corresponde ao conteúdo;
- shimmer rápido;
- bordas e sombras completas;
- skeleton exibido por tempo mínimo artificial;
- skeleton substituindo feedback de ação.

---

## 33. Feedback Visual

### 33.1 Objetivo

Feedback visual deve confirmar, orientar e proteger. Cada ação relevante precisa de resposta proporcional.

### 33.2 Níveis

| Nível | Tratamento | Exemplo de uso |
|---|---|---|
| Local | mudança no próprio elemento | seleção, toggle, campo |
| Contextual | mensagem próxima ao conteúdo | validação, atualização de bloco |
| Global leve | toast | confirmação reversível |
| Persistente | banner | offline, sincronização, aviso contínuo |
| Bloqueante | modal | exclusão, consentimento crítico |

### 33.3 Confirmação

Ações frequentes e reversíveis devem receber feedback leve. Ações raras, críticas ou irreversíveis devem receber feedback explícito.

### 33.4 Sucesso

Sucesso não exige sempre verde e ícone. Em fluxos frequentes, mudança de estado e texto podem ser suficientes. Verde deve aparecer quando melhora reconhecimento.

### 33.5 Atenção

Atenção deve indicar necessidade de avaliação, não erro. O usuário deve compreender se pode continuar.

### 33.6 Destrutivo

Ação destrutiva deve possuir:

- cor semântica;
- linguagem clara;
- consequência;
- confirmação proporcional;
- alternativa de cancelar.

### 33.7 Feedback de IA

Ações “útil/inútil” ou equivalentes devem ser discretas, sem parecer competição social. O sistema deve confirmar a contribuição sem prometer alteração imediata.

### 33.8 Proibições

- toast para erro que exige correção;
- modal para sucesso comum;
- banner descartável para problema persistente;
- feedback duplicado em três níveis;
- mensagens que desaparecem antes da leitura;
- cor sem texto.

---

## 34. Tom Premium

### 34.1 Definição

Premium deve comunicar **profundidade, eficiência e capacidade ampliada**. Não deve comunicar superioridade social.

### 34.2 Percepção desejada

O usuário deve perceber:

- acesso a análises mais profundas;
- maior controle;
- economia de tempo;
- histórico e comparação ampliados;
- recursos profissionais;
- continuidade do ecossistema.

### 34.3 Linguagem visual

O Premium utiliza a mesma arquitetura visual do produto. Pode acrescentar:

- detalhe cromático quente e discreto;
- maior refinamento editorial;
- visualizações mais completas;
- selos compactos;
- superfícies institucionais específicas em momentos de apresentação de valor.

Não deve criar uma “segunda interface” ou transformar componentes comuns em objetos luxuosos.

### 34.4 Cor Premium

O tom champanhe/bronze deve aparecer em detalhes pequenos. Ele não substitui o acento do módulo. Em uma tela Grow Premium, Grow continua sendo verde-teal; Premium aparece como qualificador secundário.

### 34.5 Paywall

Visualmente, um paywall deve:

- mostrar o valor e contexto da função;
- preservar a identidade do recurso;
- explicar a diferença de acesso;
- utilizar hierarquia clara;
- permitir saída evidente;
- evitar sensação de erro ou punição.

### 34.6 Conteúdo bloqueado

A existência da função pode ser visível, mas o tratamento não deve simular dado real borrado de forma manipulativa. Mostrar amostra conceitual ou descrição honesta é preferível.

### 34.7 Persuasão ética

O visual Premium não deve usar:

- contagem regressiva artificial;
- “última chance” sem base real;
- botão de fechar escondido;
- opção gratuita com contraste propositalmente baixo;
- culpa;
- medo de perda de dados;
- comparação enganosa;
- preço visualmente fragmentado para parecer menor.

### 34.8 Proibições

- coroas;
- diamantes;
- “VIP”;
- ouro brilhante;
- fundos pretos com glow dourado;
- confete após compra;
- Premium como semântico de sucesso;
- alterar estrutura dos componentes somente para assinantes.

---

## 35. Acessibilidade Visual

### 35.1 Princípio

Acessibilidade é requisito de excelência. Uma interface inacessível não é premium, clara ou consistente.

### 35.2 Contraste

- texto e ícones essenciais devem possuir contraste suficiente em ambos os temas;
- estados disabled não podem se tornar invisíveis;
- texto sobre imagem exige proteção por superfície ou máscara;
- contraste deve ser validado em estado padrão, hover, foco, seleção e erro;
- bordas essenciais também precisam ser perceptíveis.

### 35.3 Cor não exclusiva

Toda informação comunicada por cor deve possuir pelo menos um reforço:

- texto;
- ícone;
- forma;
- padrão;
- posição;
- espessura;
- rótulo.

### 35.4 Tamanho e leitura

- corpo principal deve partir de dimensão confortável;
- metadados não podem ser tratados como “letra miúda”;
- aumento de fonte não deve cortar ações ou conteúdo;
- linhas muito longas devem ser evitadas;
- peso fino não deve ser usado para texto operacional.

### 35.5 Foco

Foco deve ser sempre visível, com forma consistente e contraste adequado. Não pode depender apenas de alteração sutil da borda padrão.

### 35.6 Alvos de interação

Ícones pequenos podem existir visualmente, mas a área de interação deve permanecer confortável. A proximidade entre ações destrutivas e comuns deve evitar toques acidentais.

### 35.7 Acessibilidade cognitiva

- linguagem visual previsível;
- poucas decisões simultâneas;
- mensagens específicas;
- agrupamento por relação;
- confirmação proporcional;
- ausência de movimento ou cor excessiva;
- não exigir memória de telas anteriores;
- não esconder informação crítica em hover ou tooltip.

### 35.8 Gráficos

- legenda e rótulos claros;
- alternativa tabular/textual;
- padrões e formas além de cor;
- descrição de tendência;
- foco navegável quando interativo;
- não exigir precisão de ponteiro para acessar valor.

### 35.9 Conteúdo sensível

Proteção visual não deve impedir tecnologias assistivas sem consentimento. O estado oculto deve ser anunciado e permitir revelação de forma controlada.

### 35.10 Redução de movimento

A versão reduzida deve manter causalidade por mudanças de opacidade, estado e posição final. Nenhuma função pode depender de acompanhar animação.

### 35.11 Tema e baixa visão

Dark e Light Mode devem ser avaliados independentemente. Não assumir que Dark é automaticamente mais confortável. Usuário deve poder escolher conforme necessidade.

### 35.12 Testes obrigatórios

Toda família de tela deve ser avaliada com:

- aumento de fonte;
- contraste;
- navegação por teclado quando aplicável;
- leitor de tela;
- redução de movimento;
- daltonismo simulado;
- zoom;
- textos longos;
- estado de foco completo.

---

## 36. Regras de Consistência

### 36.1 Consistência sistêmica

A mesma função deve possuir a mesma linguagem visual em todos os módulos. Exceções exigem diferença semântica real, não preferência estética.

### 36.2 Regra do primeiro padrão

Antes de criar um novo padrão, verificar se um padrão existente resolve pelo menos 80% da necessidade sem perda de compreensão. Se resolver, deve ser reutilizado.

### 36.3 Regra da exceção documentada

Uma exceção só é válida quando:

1. existe necessidade funcional comprovada;
2. a solução padrão causa dano de UX;
3. não pode ser resolvida por composição;
4. possui impacto avaliado em Grow, Med, Core, temas e responsividade;
5. é registrada para futura revisão.

### 36.4 Consistência cromática

- acento identifica contexto;
- semântico identifica estado;
- Premium qualifica acesso;
- paleta de dados representa informação;
- nenhuma dessas camadas substitui outra.

### 36.5 Consistência tipográfica

- mesmos papéis tipográficos em todos os produtos;
- títulos equivalentes possuem mesma hierarquia;
- dados equivalentes usam mesmo tratamento;
- não criar estilo tipográfico para uma única tela.

### 36.6 Consistência espacial

- espaçamento segue uma escala curta;
- alinhamento é previsível;
- gaps equivalentes representam relações equivalentes;
- conteúdo não deve ser deslocado para “equilibrar visualmente” sem respeitar grid.

### 36.7 Consistência de estado

Vazio, erro, loading, offline, bloqueado, sem permissão e processando devem possuir padrões transversais. O conteúdo muda; a lógica visual permanece.

### 36.8 Consistência de ação

- ação primária: uma por região decisória;
- ação secundária: menor ênfase;
- ação terciária: textual ou discreta;
- destrutiva: semântica própria;
- mesma hierarquia em todos os módulos.

### 36.9 Consistência entre temas

Light Mode não pode adicionar ou remover hierarquia. Dark Mode não pode esconder bordas, estados ou conteúdo. A troca altera valores, não significado.

### 36.10 Consistência responsiva

A reorganização por tela deve preservar:

- ordem de prioridade;
- nomes;
- estados;
- ações;
- relações;
- identidade.

### 36.11 Consistência editorial

Uma informação deve receber o mesmo nome, unidade, capitalização e formato em todas as telas. Variação de texto por espaço não pode mudar significado.

### 36.12 Sinais de inconsistência

- mais de três estilos de card equivalentes;
- ações primárias de cores diferentes no mesmo contexto;
- radius local;
- ícone diferente para a mesma função;
- uso alternado de modal e tela para a mesma consequência;
- estados de erro tratados com severidade diferente sem motivo;
- módulos com densidade ou tipografia próprias.

---

## 37. Anti-patterns Visuais

### 37.1 Estética recreativa estereotipada

Proibido:

- folhas repetidas;
- fumaça;
- olhos vermelhos;
- cores reggae;
- linguagem psicodélica;
- buds como ornamento;
- mascotes “stoner”.

**Motivo:** compromete confiança, privacidade e distribuição, além de reduzir o Grow a um estereótipo.

### 37.2 Estética clínica fria

Proibido:

- branco puro dominante;
- azul hospitalar saturado;
- imagens de sofrimento;
- linguagem visual de prontuário burocrático;
- grids excessivamente rígidos sem respiro.

**Motivo:** Med é ferramenta de acompanhamento humano, não sistema hospitalar.

### 37.3 Tecnologia genérica

Proibido:

- neon ciano/roxo;
- circuitos;
- partículas;
- robôs;
- hologramas;
- glow;
- “AI gradients” sem função.

**Motivo:** transforma inteligência explicável em espetáculo e envelhece rapidamente.

### 37.4 Glassmorphism generalizado

Transparência e blur não devem formar a base da interface.

**Motivo:** prejudicam contraste, desempenho, previsibilidade e legibilidade sobre conteúdo variável.

### 37.5 Card soup

Cada grupo de conteúdo dentro de uma caixa.

**Motivo:** fragmenta leitura, aumenta ruído e reduz hierarquia.

### 37.6 Dashboard mosaico

Muitos widgets equivalentes, cores e gráficos sem narrativa.

**Motivo:** impede priorização e aumenta esforço cognitivo.

### 37.7 Minimalismo vazio

Grandes espaços, ícones sem rótulo e dados escondidos para parecer elegante.

**Motivo:** simplicidade visual não pode remover entendimento.

### 37.8 Densidade agressiva

Texto pequeno, linhas apertadas, ações próximas e múltiplos eixos.

**Motivo:** usuários registram e interpretam informações importantes; eficiência não pode gerar erro.

### 37.9 Gamificação superficial

- streaks punitivos;
- confete;
- moedas;
- níveis sem valor funcional;
- ranking de popularidade;
- badges decorativos.

**Motivo:** desvia motivação do progresso real e pode ser inadequado em saúde.

### 37.10 Dark patterns Premium

- urgência falsa;
- fechamento escondido;
- opção gratuita enfraquecida;
- culpa;
- bloqueio surpresa;
- medo de perder dados.

### 37.11 Dependência de cor

Qualquer estado identificado apenas por cor é inválido.

### 37.12 Excesso de modais

Modais para decisões simples, erros leves ou conteúdo informativo.

**Motivo:** quebram contexto e criam carga cognitiva.

### 37.13 Ícones ambíguos

Ações críticas ou técnicas representadas sem rótulo.

### 37.14 Tendência acima da marca

Qualquer estética adotada apenas porque está popular deve ser rejeitada se não reforçar clareza, confiança e longevidade.

### 37.15 Inconsistência como personalização

Grow e Med não devem criar estilos próprios de componentes sob a justificativa de “personalidade”. A personalidade deve operar dentro do sistema compartilhado.

---

## 38. Checklist para Futuras Telas

Toda tela deve passar por este checklist antes de ser aprovada.

### 38.1 Estratégia e contexto

- [ ] A tela pertence claramente a Core, Grow ou Med?
- [ ] O acento utilizado corresponde ao contexto real?
- [ ] A tela respeita regras e fluxo existentes?
- [ ] Nenhuma decisão visual introduz funcionalidade nova?
- [ ] O objetivo principal pode ser descrito em uma frase?

### 38.2 Hierarquia

- [ ] Existe uma ordem de leitura inequívoca?
- [ ] A ação principal é clara sem dominar toda a tela?
- [ ] Informações secundárias possuem contraste adequado?
- [ ] Conteúdo relacionado está agrupado?
- [ ] A tela evita competir com múltiplas prioridades?

### 38.3 Consistência

- [ ] Utiliza padrões já existentes?
- [ ] Tipografia segue os papéis oficiais?
- [ ] Espaçamento segue escala comum?
- [ ] Radius, bordas e elevação são coerentes?
- [ ] Ícones equivalentes são reutilizados?
- [ ] Não existe variante exclusiva sem justificativa?

### 38.4 Cor

- [ ] A cor de identidade não está sendo usada como semântica?
- [ ] Cores semânticas mantêm significado?
- [ ] Informação não depende apenas de cor?
- [ ] O contraste foi validado nos dois temas?
- [ ] A quantidade de cor é proporcional à prioridade?

### 38.5 Conteúdo e dados

- [ ] Valores possuem unidade e período?
- [ ] Dados medidos, calculados e previstos são distintos?
- [ ] Gráficos respondem a uma pergunta clara?
- [ ] Dados ausentes e insuficientes são honestos?
- [ ] Textos podem expandir sem quebrar layout?

### 38.6 Estados

- [ ] Vazio está especificado?
- [ ] Loading está especificado?
- [ ] Erro está especificado?
- [ ] Offline/sincronização estão especificados quando aplicáveis?
- [ ] Sem permissão e bloqueio Premium estão diferenciados?
- [ ] Modo Discreto foi considerado?
- [ ] Processos assíncronos possuem feedback adequado?

### 38.7 Privacidade

- [ ] O nível de visibilidade é perceptível?
- [ ] Dados sensíveis estão protegidos?
- [ ] Compartilhamento mostra consequência antes da ação?
- [ ] A tela não revela relação entre perfis sem consentimento?
- [ ] Miniaturas e notificações respeitam discrição?

### 38.8 Acessibilidade

- [ ] Contraste adequado?
- [ ] Foco visível?
- [ ] Alvos de interação confortáveis?
- [ ] Aumento de fonte funciona?
- [ ] Leitor de tela recebe ordem e rótulos coerentes?
- [ ] Movimento reduzido funciona?
- [ ] Gráficos possuem alternativa?
- [ ] Nenhuma ação depende exclusivamente de gesto?

### 38.9 Responsividade

- [ ] A tela foi concebida primeiro para mobile quando aplicável?
- [ ] A prioridade permanece em tablet e desktop?
- [ ] Não há apenas ampliação do layout móvel?
- [ ] Tabelas e gráficos se adaptam sem perda de informação?
- [ ] Safe areas e teclado foram considerados?
- [ ] Orientação e textos longos foram testados?

### 38.10 Percepção de marca

- [ ] A tela parece COSMARIA mesmo sem logotipo?
- [ ] Transmite confiança, clareza e controle?
- [ ] Evita estética recreativa, hospitalar fria e tecnológica genérica?
- [ ] Possui qualidade premium por refinamento, não ornamento?
- [ ] Continuará visualmente adequada em vários anos?

### 38.11 Aprovação

Uma tela só pode ser aprovada quando:

- não possui falha crítica de acessibilidade;
- não cria exceção sistêmica injustificada;
- funciona nos dois temas;
- possui todos os estados relevantes;
- respeita o contexto de privacidade;
- mantém prioridade e entendimento em mobile;
- está alinhada com esta Constituição Visual.

---

# PARTE IV — LINGUAGENS TRANSVERSAIS ESPECIALIZADAS

## 39. Formulários e Controles

### 39.1 Princípio

Formulários devem reduzir erro e esforço. Aparência elegante não justifica esconder labels, unidades, consequências ou estados.

### 39.2 Labels

Labels devem permanecer visíveis. Placeholder é exemplo ou orientação, não substituto do nome do campo.

### 39.3 Agrupamento

Campos devem ser agrupados por significado e sequência mental. Seções longas precisam de títulos e explicação apenas quando necessária.

### 39.4 Campos numéricos

Devem mostrar:

- unidade;
- formato esperado;
- faixa de referência quando funcionalmente definida;
- precisão adequada;
- estado de validação.

### 39.5 Escalas

Escalas de intensidade devem exibir extremos e direção. Valor selecionado deve ser legível e não depender de posição ou cor.

### 39.6 Seletores

A escolha entre radio, dropdown, chips ou busca deve depender da quantidade e frequência, não de preferência visual. Opções precisam manter ordem estável.

### 39.7 Campos avançados

Complexidade progressiva deve revelar campos avançados dentro da mesma linguagem. Campos ocultos não devem parecer um módulo externo.

### 39.8 Validação

- ocorre no momento adequado;
- não acusa erro antes da interação sem necessidade;
- preserva entrada;
- mostra como corrigir;
- diferencia obrigatório, inválido e indisponível.

### 39.9 Ações

A ação principal do formulário deve permanecer previsível. Em formulários longos, a persistência visual pode ser utilizada quando não ocultar conteúdo.

### 39.10 Proibições

- labels apenas em placeholder;
- campos sem unidade;
- excesso de colunas no mobile;
- bordas coloridas antes de interação;
- validação somente no topo;
- botão desabilitado sem explicação;
- formulário inteiro dentro de múltiplos cards.

---

## 40. Linguagem Visual da Inteligência Artificial

### 40.1 Posição

IA é uma camada de análise, não uma personagem. Ela deve parecer transparente, útil e limitada.

### 40.2 Hierarquia de evidência

Toda apresentação deve diferenciar:

1. **dados utilizados**;
2. **período analisado**;
3. **padrão identificado**;
4. **interpretação**;
5. **confiança**;
6. **limitações**;
7. **ação sugerida**, quando existente.

### 40.3 Assinatura visual

A IA pode receber uma assinatura abstrata pequena baseada em relações ou constelação de pontos. Essa assinatura identifica origem, mas não deve competir com a severidade real.

### 40.4 Confiança

Confiança deve ser apresentada com:

- termo compreensível;
- indicador visual;
- explicação disponível;
- volume/período de dados quando relevante.

Evitar percentuais com falsa precisão quando o modelo não os sustentar.

### 40.5 Cold start

Insights baseados em dados agregados devem ser claramente diferenciados de análises do próprio histórico. O visual deve reduzir autoridade percebida quando a personalização for limitada.

### 40.6 Alertas

A severidade do alerta vem do risco, não do fato de ser gerado por IA. Um insight informativo não recebe cor de atenção apenas para parecer importante.

### 40.7 Previsões

Previsões devem usar:

- distinção do observado;
- intervalo;
- hipótese explícita;
- atualização temporal;
- linguagem probabilística.

### 40.8 Recomendações

A recomendação deve parecer opção fundamentada, não ordem. A ação sugerida pode ter destaque, mas o usuário mantém controle visual e decisório.

### 40.9 Limitações

Limitações não devem ser ocultadas em texto legal distante. Devem estar próximas da interpretação e em hierarquia legível.

### 40.10 Proibições

- “IA mágica”;
- voz absoluta;
- robô/mascote;
- glow em todo insight;
- confiança escondida;
- previsão idêntica a fato;
- cor de erro para baixa confiança;
- recomendação apresentada como diagnóstico.

---

## 41. Linguagem Visual da Privacidade e do Modo Discreto

### 41.1 Privacidade como camada visível

Privacidade deve ser percebida no ponto de uso, não apenas nas configurações. O usuário deve reconhecer o escopo atual antes de publicar, compartilhar ou revelar.

### 41.2 Estados de visibilidade

A linguagem visual deve diferenciar:

- somente usuário;
- contexto restrito;
- seguidores;
- link;
- público;
- anonimizado;
- oculto pelo Modo Discreto.

Cada estado precisa de ícone, texto e explicação quando necessário.

### 41.3 Matriz de privacidade

Visualmente, uma matriz deve priorizar compreensão de dimensão × escopo. Não deve parecer planilha administrativa. Presets podem reduzir complexidade, mantendo acesso à personalização.

### 41.4 Consentimento

Consentimento ativo deve utilizar composição que destaque:

- o que será compartilhado;
- com quem;
- para qual finalidade;
- por quanto tempo ou até revogação;
- efeito da revogação.

A ação de consentir não pode receber tratamento mais atraente que recusar.

### 41.5 Modo Discreto

Quando ativo, o sistema deve indicar discretamente a proteção, sem revelar o conteúdo protegido. A indicação deve ser persistente, mas não ocupar espaço excessivo.

### 41.6 Ocultação

Conteúdo oculto deve preservar estrutura suficiente para não parecer erro. A revelação precisa ser intencional e reversível.

### 41.7 Miniaturas

Miniaturas sensíveis podem ser:

- borradas;
- substituídas por placeholder;
- ocultas;
- reveladas por ação.

A escolha deve ser consistente com o nível de proteção.

### 41.8 Perfis independentes

Grow e Med não devem compartilhar sinais visuais que revelem ligação de identidade sem consentimento. Avatar, nome e reputação permanecem contextuais.

### 41.9 Notificações e superfícies do sistema

O tom visual e textual deve considerar:

- tela bloqueada;
- preview;
- app switcher;
- widgets;
- conteúdo compartilhado;
- exportações.

### 41.10 Proibições

- padrão “público” selecionado por destaque manipulativo;
- cadeado como única explicação;
- esconder consequência em texto secundário;
- revelar tipo de conteúdo no placeholder discreto;
- ligar perfis visualmente sem autorização;
- usar vermelho para privacidade restrita.

---

## 42. Linguagem Visual da Comunidade

### 42.1 Princípio

A Comunidade deve parecer uma rede de conhecimento estruturado, não uma rede de entretenimento.

### 42.2 Prioridade do conteúdo

Publicações devem destacar:

- conteúdo;
- contexto técnico ou clínico;
- origem;
- privacidade;
- credibilidade;
- relações úteis.

Contadores sociais devem possuir hierarquia secundária.

### 42.3 Perfis

Perfis devem transmitir identidade e contribuição sem criar culto à popularidade. Reputação deve ser contextual e baseada em critérios compreensíveis.

### 42.4 Grow

A Comunidade Grow pode ser mais visual e técnica, valorizando fotos, fases, genética, ambiente e parâmetros compartilhados.

### 42.5 Med

A Comunidade Med deve ser mais discreta, textual e protegida. Nome, avatar e biografia podem estar ausentes sem parecer perfil incompleto.

### 42.6 Interações

Curtir, comentar, salvar e seguir devem usar feedback leve. Não devem gerar celebrações ou métricas gigantes.

### 42.7 Fork

Quando uma configuração compartilhada for reutilizada, a origem e o caráter de cópia devem ser visualmente claros. Reutilização não deve parecer autoria original.

### 42.8 Moderação

Conteúdo restringido, removido ou em análise deve receber explicação proporcional, sem exposição desnecessária. Denúncia e bloqueio precisam parecer ações de segurança, não conflito social.

### 42.9 Conteúdo sensível

A comunidade deve permitir proteção de mídia e texto, especialmente no Med. A revelação deve ser intencional.

### 42.10 Proibições

- ranking global de popularidade como foco;
- follow count dominante;
- reações animadas;
- feed infinito sem orientação;
- visual de influencer;
- ligação visual Grow↔Med por inferência;
- anonimato apresentado como perfil “menor”.

---

## 43. Responsividade Visual

### 43.1 Princípio mobile-first

Mobile é o ponto de partida para priorização, ergonomia e registro em contexto. Desktop é expansão de visão, não simples aumento de escala.

### 43.2 Mobile

- uma coluna principal;
- prioridade vertical;
- ações ao alcance;
- labels visíveis;
- gráficos com foco ou scroll controlado;
- formulários sem colunas apertadas;
- navegação inferior estável.

### 43.3 Tablet

- pode combinar navegação lateral compacta e conteúdo ampliado;
- permite painéis auxiliares;
- deve manter toque como referência;
- não assumir precisão de mouse.

### 43.4 Desktop

- largura de leitura controlada;
- múltiplas colunas quando há relação real;
- navegação lateral;
- comparação paralela;
- tabelas e gráficos ampliados;
- painel administrativo com densidade adequada.

### 43.5 Reflow

A ordem de conteúdo deve seguir prioridade semântica. Ao mudar breakpoint, não reorganizar apenas para preencher espaço.

### 43.6 Largura máxima

Textos, formulários e relatórios devem possuir largura máxima de leitura. Dashboards e dados podem usar área maior quando a comparação exigir.

### 43.7 Gráficos

- simplificar rótulos, não dados essenciais;
- permitir foco em série;
- oferecer visão detalhada;
- evitar miniaturização ilegível;
- tabelas podem substituir ou complementar.

### 43.8 Teclado e safe areas

No mobile, campos e ações persistentes devem considerar teclado, área segura e orientação. Nada crítico pode ficar escondido.

### 43.9 Orientação

Landscape pode melhorar gráficos e comparações, mas não deve ser obrigatório para tarefas principais.

### 43.10 Proibições

- versão desktop como mobile esticado;
- versão mobile como desktop comprimido;
- remoção de funcionalidade sem alternativa;
- ações apenas no hover;
- texto reduzido para caber;
- breakpoint baseado apenas em dispositivo, sem considerar conteúdo.

---

## 44. Internacionalização Visual

### 44.1 Princípio

Nenhuma composição deve depender da extensão atual do português brasileiro.

### 44.2 Expansão de texto

Labels, botões, tabs e mensagens devem acomodar expansão. Larguras fixas de texto devem ser evitadas.

### 44.3 Truncamento

Truncamento é permitido para conteúdo repetitivo ou identificadores, desde que o valor completo esteja acessível. Informação clínica, ação, erro e consentimento não podem ser truncados de forma que altere significado.

### 44.4 Datas, números e unidades

A apresentação deve respeitar locale sem alterar hierarquia. Separadores, ordem de data e abreviações podem variar.

### 44.5 Direção de leitura

A estrutura deve usar conceitos de início/fim, não esquerda/direita como significado permanente. Iconografia direcional precisa ser revisável.

### 44.6 Fotografia e cultura

Expansão internacional exige revisão de pessoas, ambientes e símbolos. A identidade não deve ficar associada apenas a um perfil cultural brasileiro específico.

### 44.7 Tom visual

Core, Grow e Med devem manter personalidade mesmo quando o texto muda. A identidade não pode depender de jogos de palavra ou comprimento de slogan.

### 44.8 Proibições

- texto incorporado em imagens funcionais;
- botões de largura rígida;
- bandeiras como seletor principal de idioma;
- abreviações sem localização;
- ícones culturalmente ambíguos sem texto.

---

## 45. Assinaturas Visuais Institucionais

### 45.1 Marca-mãe

A assinatura COSMARIA deve aparecer de forma proporcional ao contexto. Em uso diário, o produto não precisa repetir o logotipo em toda tela.

### 45.2 Grow e Med

As assinaturas devem manter:

- mesma construção tipográfica;
- relação clara com COSMARIA;
- diferenciação por nome e acento;
- ausência de símbolos incompatíveis com discrição.

### 45.3 Relatórios

Relatórios devem utilizar assinatura institucional sóbria, identificação do módulo e contexto do usuário. A marca não deve competir com conteúdo clínico ou técnico.

### 45.4 Conteúdo compartilhado

Quando houver assinatura em conteúdo exportado ou compartilhado, ela deve:

- ser discreta;
- não expor módulo sensível sem escolha;
- preservar autoria e origem;
- evitar aparência de publicidade.

### 45.5 Notificações

A identidade deve ser reconhecida por ícone, nome seguro e tom. Em Modo Discreto, a proteção prevalece sobre reconhecimento de marca.

### 45.6 Parcerias

Co-branding deve manter área de respiro e hierarquia. A marca parceira não pode alterar componentes ou acentos do produto.

### 45.7 Proibições

- watermark dominante;
- repetição de logotipo;
- assinatura Grow em contexto Med;
- marca colorida sobre dado sensível;
- co-branding que pareça recomendação clínica ou comercial indevida.

---

## 46. Validação da Direção Artística

### 46.1 Princípio

Uma Constituição Visual é oficial, mas não imune a evidência. Validação deve confirmar percepção e usabilidade, não abrir votação estética sem critério.

### 46.2 Hipóteses a validar

- Grow é percebido como técnico, não recreativo;
- Med é percebido como clínico, humano e discreto;
- Core é reconhecido como plataforma compartilhada;
- Dark Mode transmite qualidade sem prejudicar leitura;
- Light Mode mantém identidade;
- Core e Med são cromaticamente distinguíveis;
- Premium transmite valor sem ostentação;
- IA parece transparente, não mágica;
- privacidade é compreendida;
- densidade é adequada para iniciantes e especialistas.

### 46.3 Públicos

- cultivadores iniciantes;
- cultivadores experientes;
- pacientes novos;
- pacientes de longo prazo;
- cuidadores, se entrarem no escopo validado;
- profissionais de saúde;
- usuários com baixa visão ou outras necessidades de acesso;
- usuários híbridos Grow + Med.

### 46.4 Métodos

- teste de primeira impressão;
- teste de associação de atributos;
- comparação de temas;
- avaliação de compreensão de estados;
- teste de distinção de módulos;
- teste de gráficos;
- teste de privacidade;
- teste de navegação visual;
- sessão de acessibilidade;
- teste de uso prolongado.

### 46.5 Critérios

A validação deve produzir evidência sobre:

- compreensão;
- confiança;
- velocidade;
- erro;
- percepção de privacidade;
- percepção de profissionalismo;
- fadiga;
- distinção de contexto.

“Gostei” ou “não gostei” sem relação com objetivo não é evidência suficiente para alterar o sistema.

### 46.6 Mudança após validação

Uma mudança deve:

1. resolver problema observado;
2. preservar princípios permanentes;
3. ser avaliada em todos os módulos;
4. atualizar esta Constituição e o Design System;
5. possuir registro de decisão.

---

## 47. Governança da Constituição Visual

### 47.1 Propriedade

A Constituição Visual deve possuir responsáveis claros por:

- direção de produto;
- design system;
- acessibilidade;
- conteúdo;
- marca;
- validação.

Uma única pessoa pode acumular papéis inicialmente, mas as responsabilidades devem permanecer explícitas.

### 47.2 Tipos de mudança

| Tipo | Exemplo | Processo |
|---|---|---|
| Correção | contraste insuficiente | revisão rápida + registro |
| Evolução menor | nova regra de fotografia | revisão de Design System |
| Evolução maior | mudança de personalidade ou acento | validação executiva e com usuários |
| Exceção | necessidade específica de domínio | justificativa e prazo de revisão |
| Depreciação | remoção de padrão antigo | plano de migração |

### 47.3 Controle de versão

Toda versão deve registrar:

- data;
- responsável;
- motivo;
- seções alteradas;
- impacto em tokens, componentes e telas;
- necessidade de migração;
- evidência utilizada.

### 47.4 Relação design–produto–código

A cadeia oficial é:

> Constituição Visual → Design System → UI Kit → Biblioteca de Componentes → Templates → Telas.

Nenhuma tela deve criar regra permanente sem retroalimentar os níveis anteriores.

### 47.5 Processo para novos módulos

Um novo módulo deve:

1. herdar personalidade e fundamentos;
2. justificar necessidade de acento próprio;
3. demonstrar distinção dos existentes;
4. reutilizar tipografia, geometria, motion e componentes;
5. definir fotografia e tom contextual;
6. passar por validação de marca e acessibilidade.

### 47.6 Auditoria

Recomenda-se auditoria periódica para identificar:

- divergência entre design e implementação;
- exceções acumuladas;
- componentes duplicados;
- cores hardcoded;
- padrões desatualizados;
- falhas de acessibilidade;
- inconsistência entre temas;
- tendências infiltradas sem aprovação.

### 47.7 Exceções temporárias

Toda exceção deve ter:

- motivo;
- proprietário;
- escopo;
- risco;
- data de revisão;
- plano de convergência.

Exceção sem prazo tende a se tornar sistema paralelo.

---

## 48. Critérios de Avaliação da Linguagem Visual

### 48.1 Clareza

O usuário identifica contexto, prioridade, estado e ação sem depender de tentativa.

### 48.2 Consistência

Padrões equivalentes mantêm forma e significado entre módulos, temas e dispositivos.

### 48.3 Confiança

A interface parece honesta, segura, precisa e respeitosa.

### 48.4 Discrição

O produto protege contextos sensíveis sem parecer secreto, suspeito ou estigmatizante.

### 48.5 Diferenciação

Grow, Med e Core são distinguíveis sem perder unidade.

### 48.6 Escalabilidade

Novas entidades, dados e módulos podem ser incorporados sem reconstruir a linguagem visual.

### 48.7 Acessibilidade

A experiência mantém compreensão e operação para diferentes capacidades e preferências.

### 48.8 Longevidade

A identidade não depende de efeitos ou tendências de curto ciclo.

### 48.9 Qualidade Premium

O refinamento é percebido em detalhes, não em ornamento.

### 48.10 Adequação ao domínio

Grow parece feito por quem compreende cultivo; Med parece confiável para acompanhamento terapêutico; IA parece fundamentada; Comunidade parece espaço de conhecimento.

---

## 49. Decisões Visuais Consolidadas

### 49.1 Decisões permanentes

1. Uma única linguagem visual para toda a plataforma.
2. Grow, Med e Core compartilham estrutura, tipografia, geometria, elevação e motion.
3. Diferenciação principal por acento cromático, imagem e temperatura editorial.
4. Dark Mode é expressão principal; Light Mode possui paridade total.
5. Minimalismo informacional, não ocultação de conteúdo.
6. Cor de identidade, cor semântica, cor Premium e cor de dados são sistemas separados.
7. Tipografia-base única e funcional.
8. Iconografia linear e compartilhada.
9. Fotografia real, natural e não estereotipada.
10. Gradientes e efeitos são excepcionais.
11. Premium é profundidade, não ostentação.
12. IA é transparente e não antropomorfizada.
13. Privacidade é visível e não julgada.
14. Acessibilidade é requisito artístico.
15. Nenhuma exceção visual local sem governança.

### 49.2 Paleta contextual oficial

- Core: violeta-cosmos.
- Grow: verde-teal técnico.
- Med: azul clínico profundo.
- Premium: champanhe/bronze discreto.

### 49.3 Decisões que dependem de validação contínua

- valores cromáticos exatos após testes de contraste e percepção;
- família tipográfica em casos de expansão linguística;
- ícones finais dos aplicativos;
- nível ideal de densidade por perfil;
- expressão do Modo Discreto por plataforma;
- fotografia institucional em diferentes mercados;
- visualização de confiança e incerteza com usuários reais.

A possibilidade de validação não torna essas decisões indefinidas. A versão presente é a regra oficial até que evidência documentada aprove uma alteração.

---

## 50. Checklist Constitucional de Conformidade

Uma entrega visual da COSMARIA está em conformidade quando atende simultaneamente aos seguintes critérios:

### Identidade

- [ ] Parece parte da COSMARIA sem depender de logotipo.
- [ ] O módulo é reconhecível pelo acento e conteúdo.
- [ ] Não utiliza clichês recreativos, clínicos ou tecnológicos.

### Estrutura

- [ ] A hierarquia é inequívoca.
- [ ] A densidade corresponde à tarefa.
- [ ] O espaço representa relações semânticas.
- [ ] Cards são usados apenas quando necessários.

### Fundações

- [ ] Tipografia segue papéis oficiais.
- [ ] Cor segue a separação entre identidade, semântica, dados e Premium.
- [ ] Radius, bordas, sombras e elevação seguem escalas compartilhadas.
- [ ] Motion possui função e versão reduzida.

### Conteúdo especializado

- [ ] Dados são honestos e contextualizados.
- [ ] IA mostra evidência, confiança e limitação.
- [ ] Privacidade é perceptível.
- [ ] Premium comunica valor sem manipulação.
- [ ] Comunidade prioriza conhecimento.

### Estados

- [ ] Vazio, erro, loading, skeleton, offline e feedback foram definidos.
- [ ] Estados semânticos possuem forma, texto e cor.
- [ ] Processos longos mostram progresso real.

### Acessibilidade e expansão

- [ ] Ambos os temas são completos.
- [ ] Mobile, tablet e desktop preservam prioridade.
- [ ] Texto expandido e aumento de fonte funcionam.
- [ ] Gráficos possuem alternativa.
- [ ] Foco, contraste e toque são adequados.
- [ ] A composição não impede internacionalização.

### Governança

- [ ] Nenhuma exceção não documentada.
- [ ] Novos padrões foram avaliados contra padrões existentes.
- [ ] Mudanças sistêmicas retroalimentam Design System e documentação.
- [ ] A entrega pode ser reutilizada sem criar dívida visual.

---

# Encerramento

A linguagem visual da COSMARIA não deve ser reconhecida por um efeito isolado, uma cor ou um tipo de card. Ela deve ser reconhecida pela combinação consistente de **clareza, ordem, profundidade, confiança, discrição e inteligência**.

A plataforma será visualmente bem-sucedida quando:

- um cultivador sentir que está usando uma ferramenta tecnicamente competente;
- um paciente sentir que seus dados são tratados com cuidado e discrição;
- um profissional de saúde conseguir ler um relatório sem ruído ou promessa indevida;
- um usuário compreender a diferença entre dado, inferência e recomendação;
- Grow e Med parecerem partes do mesmo ecossistema sem se confundirem;
- novos módulos puderem nascer sem exigir uma nova linguagem visual;
- a interface continuar contemporânea após tendências atuais desaparecerem.

Esta Constituição Visual estabelece os limites e a direção. O UI Kit, a Biblioteca de Componentes, os Templates e as telas futuras devem materializar estas regras sem reinterpretar seus princípios fundamentais.
