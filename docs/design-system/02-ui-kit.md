# 02 — UI Kit da Plataforma COSMARIA

> **Status:** versão oficial inicial, subordinada ao `../11-design-system.md` e ao `01-visual-language.md`.

> **Natureza:** especificação visual e comportamental de componentes. Não contém código, framework, HTML, CSS, React ou decisão de arquitetura de software.

> **Versão:** 1.0 — 2026-07-12.

> **Autoridade:** este documento transforma os fundamentos e a Constituição Visual em componentes, padrões e critérios verificáveis. Nenhuma tela pode introduzir uma solução visual que contrarie ou contorne estas regras.

## Índice

**PARTE I — AUTORIDADE, ESCOPO E METODOLOGIA**
- 0. Como utilizar este UI Kit
- 1. Autoridade e hierarquia documental
- 2. Filosofia do UI Kit
- 3. Arquitetura do UI Kit
- 4. Modelo oficial de especificação de componentes
- 5. Taxonomia e nomenclatura
**PARTE II — FUNDAÇÕES APLICADAS**
- 6. Temas e contextos visuais
- 7. Sistema cromático aplicado
- 8. Sistema tipográfico aplicado
- 9. Espaçamento e ritmo
- 10. Grid, layout e alinhamento
- 11. Geometria, radius e forma
- 12. Bordas, divisores e contornos
- 13. Superfícies, elevação e sombras
- 14. Opacidade, overlays e transparência
- 15. Iconografia aplicada
- 16. Motion aplicado
**PARTE III — MODELOS DE ESTADO E COMPORTAMENTO**
- 17. Estados globais de tela e dados
- 18. Estados de interação dos componentes
- 19. Modelo responsivo dos componentes
- 20. Acessibilidade transversal
- 21. Conteúdo e internacionalização transversal
**PARTE IV — PRIMITIVOS VISUAIS**
- 22. Texto
- 23. Ícone
- 24. Imagem, thumbnail e avatar
- 25. Separadores e agrupadores
**PARTE V — AÇÕES E CONTROLES**
- 26. Botões
- 27. Links e ações textuais
- 28. Campo de texto
- 29. Campo numérico e de medição
- 30. Seletores
- 31. Escala de intensidade
- 32. Seleção de data e horário
- 33. Busca e filtros
- 34. Upload e captura de mídia
**PARTE VI — NAVEGAÇÃO**
- 35. Navegação primária
- 36. Navegação superior
- 37. Tabs
- 38. Voltar e breadcrumb
- 39. Paginação e continuidade de listas
**PARTE VII — CONTEÚDO, ENTIDADES E DADOS**
- 40. Badge de status
- 41. Card de entidade
- 42. Itens de lista
- 43. Timeline
- 44. Painel de estatísticas
- 45. Comparação de entidades
- 46. Gráfico de série temporal
- 47. Galeria de mídia
**PARTE VIII — FEEDBACK, OVERLAYS E ESTADOS**
- 48. Validação inline e erro de campo
- 49. Toast
- 50. Banner
- 51. Modal de confirmação
- 52. Estado vazio
- 53. Loading
- 54. Skeleton
- 55. Estado de erro de tela
- 56. Estado offline e sincronização
- 57. Estado sem permissão e conteúdo privado
**PARTE IX — COMPONENTES ESPECIALIZADOS**
- 58. Card de explicabilidade da IA
- 59. Indicador de confiança
- 60. Selo de dados agregados
- 61. Card de alerta da IA
- 62. Matriz de privacidade granular
- 63. Seletor de escopo de visibilidade
- 64. Selo de vínculo de perfis
- 65. Indicador de Modo Discreto
- 66. Paywall e upsell
- 67. Badge de categoria Premium
- 68. Comparador Free versus Premium
**PARTE X — PADRÕES DE COMPOSIÇÃO**
- 69. Padrão de formulário
- 70. Padrão de listagem
- 71. Padrão de detalhe de entidade
- 72. Padrão de dashboard
- 73. Padrão de timeline
- 74. Padrão analítico e de relatório
- 75. Padrão de configuração
- 76. Padrão de onboarding e wizard
- 77. Padrão de Comunidade
- 78. Padrão de conteúdo bloqueado
**PARTE XI — MATRIZES DE CONFORMIDADE**
- 79. Matriz de cobertura dos componentes
- 80. Matriz Core × Grow × Med
- 81. Matriz Dark × Light
- 82. Matriz mobile × tablet × desktop
- 83. Matriz de estados por componente
- 84. Matriz de acessibilidade
**PARTE XII — GOVERNANÇA E QUALIDADE**
- 85. Critérios de criação de novos componentes
- 86. Processo de alteração
- 87. Versionamento e depreciação
- 88. Processo de exceção
- 89. Auditoria de consistência
- 90. Checklist de aprovação de componente
- 91. Checklist de aprovação de futuras telas
- 92. Decisões consolidadas
- 93. Encerramento
**ANEXO A — Ordem recomendada de produção do UI Kit**
**ANEXO B — Regra de rastreabilidade**
**ANEXO C — Especificações dimensionais oficiais**
**ANEXO D — Contratos de composição e limites sistêmicos**

# PARTE I — AUTORIDADE, ESCOPO E METODOLOGIA

## 0. Como utilizar este UI Kit

### 0.1 Propósito do documento

Converter as decisões do Design System e da Constituição Visual em uma biblioteca especificável, auditável e reutilizável. O UI Kit define como os elementos da interface devem parecer, se organizar, reagir e se adaptar, sem criar fluxos ou regras de negócio.

### 0.2 Papel do UI Kit na plataforma

O UI Kit é a ponte entre intenção e execução. Ele elimina a lacuna entre “a plataforma deve parecer clara e confiável” e “qual anatomia, estado e hierarquia um controle deve possuir”.

### 0.3 O que este documento define

- fundações aplicadas aos componentes;
- anatomia, variantes, tamanhos e estados;
- regras de conteúdo, responsividade e acessibilidade;
- composição entre componentes;
- anti-patterns e critérios de aceitação;
- governança, versionamento e auditoria.

### 0.4 O que este documento não define

- regras de negócio;
- entidades, APIs ou arquitetura técnica;
- fluxos novos;
- priorização de roadmap;
- implementação em qualquer framework;
- cópia final de todas as telas;
- exceções locais não aprovadas.

### 0.5 Público responsável por sua utilização

Product Design, Design System, UX Writing, Research, Engenharia, QA, Produto e fornecedores autorizados. Cada disciplina utiliza o mesmo vocabulário para reduzir divergência entre arquivo de design, documentação e produto implementado.

### 0.6 Relação com produto, design e desenvolvimento

Produto define necessidade e regra de negócio; UX define jornada e comportamento; Visual Language define expressão; UI Kit define componentes; desenvolvimento implementa; QA verifica conformidade. Nenhuma camada deve substituir a responsabilidade da anterior.

### 0.7 Linguagem normativa

“Deve” indica obrigação. “Não deve” indica proibição. “Pode” indica opção condicionada. “Recomenda-se” indica preferência forte passível de exceção documentada. “Excepcional” exige aprovação formal.

### 0.8 Critério central de decisão

Quando houver mais de uma solução aceitável, prevalece a que oferecer maior clareza, consistência, acessibilidade, reutilização e menor custo sistêmico de manutenção.

### 0.9 Regra de precedência documental

1. Documentos de produto e fluxos definem o que precisa acontecer.
2. `01-visual-language.md` define a Constituição Visual.
3. `../11-design-system.md` define fundações e arquitetura sistêmica.
4. `02-ui-kit.md` detalha os componentes.
5. Templates e telas aplicam essas decisões sem reinterpretá-las.

### 0.10 Processo para resolver conflitos entre documentos

O conflito deve ser registrado, classificado e resolvido na fonte de maior autoridade antes da produção. Não se cria uma variante para “acomodar” uma contradição. Até a decisão, aplica-se a opção mais conservadora, acessível e reversível.

## 1. Autoridade e hierarquia documental

### 1.1 Relação com o `../11-design-system.md`

O documento 11 é a fonte dos tokens, estados globais, arquitetura de biblioteca, acessibilidade mínima e princípio de biblioteca única.

### 1.2 Relação com o `01-visual-language.md`

O documento 01 governa personalidade, temperatura visual, limites de expressão, uso de cor, materialidade, imagem, motion e percepção de marca.

### 1.3 Relação com os fluxos de UX

O UI Kit não altera navegação nem estados funcionais. Ele fornece componentes para representar os fluxos já aprovados.

### 1.4 Relação com os futuros templates

Templates combinarão componentes aprovados em estruturas recorrentes. Um template não pode criar componentes implícitos ou alterar anatomias.

### 1.5 Relação com as telas finais

Telas finais são instâncias dos templates e padrões. Toda diferença precisa ser explicável por conteúdo, contexto ou regra de negócio, nunca por preferência individual.

### 1.6 Relação com a implementação

A implementação deve preservar semântica, estados, comportamento responsivo e acessibilidade. Fidelidade não se limita a pixels; inclui ordem, foco, feedback, conteúdo e prioridade.

### 1.7 Limites de interpretação

Nenhum valor pode ser “aproximado” sem registro. Quando a documentação não cobrir um caso, deve-se compor com elementos existentes ou abrir proposta de evolução.

### 1.8 Proibição de decisões isoladas

É proibido criar cor, sombra, raio, padrão de navegação ou componente exclusivo em uma tela sem aprovação sistêmica.

### 1.9 Tratamento de decisões ainda não validadas

Decisões candidatas continuam oficiais até evidência aprovada. Devem ser marcadas como monitoradas, não tratadas como opcionais.

### 1.10 Processo de atualização por dependência

Uma alteração na Constituição Visual ou no Design System exige análise de impacto neste UI Kit, nos templates, nas telas e na implementação antes da publicação.

## 2. Filosofia do UI Kit

### 2.1 Uma biblioteca para toda a plataforma

Todos os componentes pertencem à COSMARIA. Core, Grow e Med usam a mesma base. **Justificativa:** esta regra reduz fragmentação e preserva confiança ao longo do crescimento do ecossistema.

### 2.2 Componentes pertencem à COSMARIA, não a um módulo

A entidade muda; o padrão de interação permanece. **Justificativa:** esta regra reduz fragmentação e preserva confiança ao longo do crescimento do ecossistema.

### 2.3 Diferenciação por contexto, não por duplicação

Accent token, conteúdo e tom editorial diferenciam contextos; anatomia não. **Justificativa:** esta regra reduz fragmentação e preserva confiança ao longo do crescimento do ecossistema.

### 2.4 Consistência antes de personalização

Personalização não pode comprometer previsibilidade. **Justificativa:** esta regra reduz fragmentação e preserva confiança ao longo do crescimento do ecossistema.

### 2.5 Composição antes de especialização

Novas necessidades devem ser resolvidas combinando componentes antes de criar outro. **Justificativa:** esta regra reduz fragmentação e preserva confiança ao longo do crescimento do ecossistema.

### 2.6 Clareza antes de ornamentação

Efeitos só permanecem quando explicam hierarquia ou estado. **Justificativa:** esta regra reduz fragmentação e preserva confiança ao longo do crescimento do ecossistema.

### 2.7 Escalabilidade antes de conveniência local

Uma economia pequena em uma tela não justifica dívida em dezenas de telas futuras. **Justificativa:** esta regra reduz fragmentação e preserva confiança ao longo do crescimento do ecossistema.

### 2.8 Acessibilidade como característica estrutural

Acessibilidade integra anatomia e estados; não é camada posterior. **Justificativa:** esta regra reduz fragmentação e preserva confiança ao longo do crescimento do ecossistema.

### 2.9 Mobile-first sem redução funcional

Mobile define prioridade e sequência, não uma versão incompleta. **Justificativa:** esta regra reduz fragmentação e preserva confiança ao longo do crescimento do ecossistema.

### 2.10 Dark e Light Mode como implementações equivalentes

Os temas preservam hierarquia, significado e legibilidade, alterando apenas valores contextuais. **Justificativa:** esta regra reduz fragmentação e preserva confiança ao longo do crescimento do ecossistema.

## 3. Arquitetura do UI Kit

### 3.1 Fundações

Cor, tipografia, spacing, grid, geometria, elevação, opacidade e motion.

### 3.2 Primitivos visuais

Texto, ícone, imagem, avatar e separadores.

### 3.3 Controles interativos

Botões, links, campos, seletores, escalas, busca e upload.

### 3.4 Componentes de conteúdo

Cards, listas, timeline, estatísticas, comparação, gráficos e galerias.

### 3.5 Componentes de navegação

Navegação primária, topo, tabs, voltar, breadcrumb e paginação.

### 3.6 Componentes de feedback

Validação, toast, banner, modal, loading, skeleton, erros e offline.

### 3.7 Componentes de dados

Métricas, séries temporais, faixas, previsões e comparações.

### 3.8 Componentes especializados

IA, privacidade, Modo Discreto e Premium.

### 3.9 Padrões de composição

Formulário, listagem, detalhe, dashboard, timeline, relatório, configuração, onboarding, comunidade e bloqueio.

### 3.10 Templates futuros

Estruturas de tela construídas exclusivamente com os níveis anteriores.

### 3.11 Relação entre primitivas, componentes e padrões

Primitivas formam componentes; componentes formam padrões; padrões formam templates.

### 3.12 Critérios para decidir o nível correto de abstração

Use o nível mais baixo capaz de resolver o problema sem duplicar regras.

## 4. Modelo oficial de especificação de componentes

Todo componente novo ou revisado deve usar a ficha abaixo. A ausência de um campo significa que a especificação está incompleta.

### 4.1 Nome oficial

Único, funcional, independente de tela.

### 4.2 Propósito

Resultado que o componente permite alcançar.

### 4.3 Problema que resolve

Fricção ou necessidade recorrente.

### 4.4 Justificativa de existência

Por que composição não é suficiente.

### 4.5 Quando utilizar

Condições objetivas.

### 4.6 Quando não utilizar

Alternativas e limites.

### 4.7 Anatomia

Partes e ordem semântica.

### 4.8 Elementos obrigatórios

Partes que preservam compreensão.

### 4.9 Elementos opcionais

Slots condicionais.

### 4.10 Propriedades conceituais

Características controláveis.

### 4.11 Variantes

Diferenças funcionais, nunca cosméticas.

### 4.12 Tamanhos

Escala limitada e motivada.

### 4.13 Estados de interação

Default, hover, focus, active, disabled, loading e validação.

### 4.14 Estados de sistema

Offline, erro, sucesso, privado, Premium e outros aplicáveis.

### 4.15 Hierarquia visual

Prioridade interna.

### 4.16 Comportamento responsivo

Reflow, largura, densidade e touch.

### 4.17 Comportamento em Dark Mode

Contraste, superfície e elevação.

### 4.18 Comportamento em Light Mode

Contraste, sombra e borda.

### 4.19 Aplicação em Core, Grow e Med

Parâmetros contextuais permitidos.

### 4.20 Regras de conteúdo

Labels, limites e tom.

### 4.21 Regras de acessibilidade

Semântica, foco, leitor de tela e contraste.

### 4.22 Regras de internacionalização

Expansão, locale e direção.

### 4.23 Motion e feedback

Transições funcionais.

### 4.24 Dependências

Primitivas e componentes usados.

### 4.25 Limites de composição

Quantidades e aninhamentos.

### 4.26 Anti-patterns

Usos que degradam consistência.

### 4.27 Critérios de aceitação

Condições verificáveis.

### 4.28 Exemplos conceituais de uso

Contextos válidos, sem desenhar telas.

### 4.29 Exceções permitidas

Somente aprovadas e versionadas.

### 4.30 Histórico de decisões

Mudanças e justificativas.

## 5. Taxonomia e nomenclatura

### 5.1 Convenção de nomes

Nomes em português na documentação e equivalência técnica registrada posteriormente. Preferir substantivos funcionais. **Justificativa:** nomenclatura estável reduz ambiguidade e custo de comunicação.

### 5.2 Nomes funcionais versus nomes visuais

O nome descreve função, não aparência. “Banner de atenção”, não “faixa amarela”. **Justificativa:** nomenclatura estável reduz ambiguidade e custo de comunicação.

### 5.3 Nomes de variantes

Variantes expressam propósito: primário, secundário, destrutivo, compacto. **Justificativa:** nomenclatura estável reduz ambiguidade e custo de comunicação.

### 5.4 Nomes de tamanhos

Usar pequeno, médio e grande somente quando todos forem necessários e tiverem regras claras. **Justificativa:** nomenclatura estável reduz ambiguidade e custo de comunicação.

### 5.5 Nomes de estados

Usar taxonomia única: default, hover, focus visible, active, selected, disabled, read-only, loading, success, warning, error. **Justificativa:** nomenclatura estável reduz ambiguidade e custo de comunicação.

### 5.6 Nomes de propriedades

Devem representar intenção: “ênfase”, “severidade”, “selecionado”; não detalhes de pintura. **Justificativa:** nomenclatura estável reduz ambiguidade e custo de comunicação.

### 5.7 Nomes específicos de contexto

Somente conteúdo ou acento podem trazer Core, Grow ou Med. Não duplicar o componente. **Justificativa:** nomenclatura estável reduz ambiguidade e custo de comunicação.

### 5.8 Termos proibidos

“Especial”, “custom”, “novo”, “bonito”, “premiumizado” e nomes de tela como definição permanente. **Justificativa:** nomenclatura estável reduz ambiguidade e custo de comunicação.

### 5.9 Critérios para renomear um componente

Renomear apenas quando o nome induzir uso incorreto ou não representar mais seu escopo. **Justificativa:** nomenclatura estável reduz ambiguidade e custo de comunicação.

### 5.10 Vocabulário compartilhado entre design e desenvolvimento

A mesma denominação deve aparecer em documentação, biblioteca visual, backlog, testes e implementação. **Justificativa:** nomenclatura estável reduz ambiguidade e custo de comunicação.

# PARTE II — FUNDAÇÕES APLICADAS

## 6. Temas e contextos visuais

### 6.1 Tema Dark

Expressão principal da plataforma. Usa fundos profundos, elevação por contraste de superfície e bordas sutis.

### 6.2 Tema Light

Possui paridade integral. Usa fundos claros neutros, borda e sombra discreta para separar planos.

### 6.3 Contexto Core

Usa acento violeta-cosmos para conta, onboarding, billing, privacidade e áreas transversais.

### 6.4 Contexto Grow

Usa acento verde-teal técnico. A linguagem permanece precisa, não orgânica ou recreativa.

### 6.5 Contexto Med

Usa acento índigo clínico. A linguagem é serena, discreta e não diagnóstica.

### 6.6 Contexto Comunidade

Herda o acento do contexto de origem e prioriza conteúdo sobre métricas sociais.

### 6.7 Contexto IA

IA não recebe tema próprio. Usa estrutura neutra, assinatura discreta e severidade separada.

### 6.8 Contexto Premium

Premium usa champanhe/bronze discreto como categoria, sem substituir identidade ou semântica.

### 6.9 Contexto de privacidade

Usa sinais neutros e informativos. Privado não é erro e não deve ser vermelho.

### 6.10 Modo Discreto

É uma camada transversal que oculta conteúdo sensível sem alterar estrutura ou navegação.

### 6.11 Hierarquia entre tema, contexto e estado

Tema define ambiente; contexto define acento; estado define semântica; Premium define entitlement. As camadas não se substituem.

### 6.12 Combinações permitidas

Qualquer contexto pode existir em Dark/Light, com estados semânticos e, quando aplicável, Premium ou Modo Discreto.

### 6.13 Combinações proibidas

Não usar acento de contexto como cor de erro, sucesso, alerta ou Premium.

### 6.14 Critérios para futuros aplicativos

Novo módulo registra um único acento, demonstra contraste e usa toda a biblioteca sem duplicação.

## 7. Sistema cromático aplicado

### 7.1 Princípios de aplicação da cor

A cor organiza identidade, semântica e dados. Cada função possui um sistema separado. A interface deve ser predominantemente neutra, usando cor de forma econômica para manter significado.

### 7.2 Neutros de fundo

| Token | Dark | Light | Uso |

| --- | --- | --- | --- |

| `color.bg.base` | #0B0F14 | #F7F8FA | Plano mais distante e fundo de aplicação. |

| `color.bg.surface` | #12181F | #FFFFFF | Superfície principal de conteúdo. |

| `color.bg.surface-2` | #1A222B | #EEF1F4 | Superfície secundária ou elevada. |



### 7.3 Neutros de superfície

Superfícies devem ser diferenciadas primeiro por contraste de plano, borda e espaçamento. Nunca criar cores locais de card.

### 7.4 Cores de texto

| Token | Dark | Light | Uso |

| --- | --- | --- | --- |

| `color.text.primary` | #EDF1F5 | #10151A | Informação principal. |

| `color.text.secondary` | #9AA7B2 | #4B5760 | Informação auxiliar relevante. |

| `color.text.tertiary` | #6B7885 | #7C8790 | Metadados não essenciais, desde que mantenham contraste. |



### 7.5 Cores de borda

`color.border` usa #232D38 no Dark e #DDE3E8 no Light. Bordas de estado devem ser derivadas de tokens semânticos validados, não cores improvisadas.

### 7.6 Accent Core

Dark #8B7FE0; Light #5F4FCC. Uso: ação primária, item ativo e foco contextual em superfícies Core.

### 7.7 Accent Grow

Dark #2E9E6B; Light #1F7A52. Uso restrito a identidade e seleção no Grow. Não sinaliza sucesso.

### 7.8 Accent Med

Dark #6E7FE8; Light #4A5BC4. Uso restrito à identidade e seleção no Med. Não sinaliza informação clínica segura ou recomendação.

### 7.9 Cores semânticas

| Semântica | Dark | Light | Regra |

| --- | --- | --- | --- |

| Sucesso | #34C77B | #1E9A5C | Ação concluída ou condição positiva confirmada. |

| Atenção | #E8A93E | #B9791E | Situação que requer avaliação, não falha. |

| Crítico | #E5675E | #C6382E | Erro, risco ou ação destrutiva. |

| Informativo | #4EA1E8 | #1F71B8 | Informação neutra relevante. |



### 7.10 Cores de interação

Hover usa overlay neutro de 8–12%; active aumenta contraste; disabled reduz ênfase sem apagar legibilidade.

### 7.11 Cores de seleção

Seleção usa acento do contexto acompanhado de forma, marcador ou texto.

### 7.12 Cores de foco

Focus ring deve ser claramente distinto da borda e manter contraste mínimo de 3:1 com superfícies adjacentes.

### 7.13 Cores de campos

Default neutro; focus contextual; erro crítico; sucesso apenas quando confirmação explícita agrega valor.

### 7.14 Cores de feedback

Feedback usa semântica e ícone. Identidade não substitui severidade.

### 7.15 Cores de privacidade

Privado, restrito, link e público usam diferenciação neutra/informativa com ícone e texto.

### 7.16 Cores de IA

A origem IA usa assinatura discreta; confiança e severidade usam escalas próprias e rótulos.

### 7.17 Cores Premium

Champanhe/bronze discreto somente para categoria Premium. Nunca para erro, seleção principal ou dado clínico.

### 7.18 Cores de visualização de dados

Séries usam paletas acessíveis e estáveis. A mesma variável mantém a mesma cor dentro de uma análise.

### 7.19 Regras para cor sobre superfícies

Todo par deve ser testado nos dois temas e nos estados hover, focus, disabled e selected.

### 7.20 Contraste obrigatório

Texto normal 4,5:1; texto grande e elementos visuais essenciais 3:1; foco 3:1.

### 7.21 Dependência proibida de cor

Estado, tendência, privacidade, confiança e seleção sempre recebem sinal adicional.

### 7.22 Aplicações cromáticas proibidas

Fundos inteiros com acento, gradientes decorativos em controles, vermelho para privado, verde Grow como sucesso e dourado Premium como ação principal universal.

## 8. Sistema tipográfico aplicado

### 8.1 Família tipográfica oficial

Inter é a família tipográfica candidata para interface, dados e relatórios digitais — reduz variação, oferece números tabulares e mantém legibilidade consistente. Segue o mesmo status dos valores do doc 11 §4: candidata sujeita a validação formal, não uma decisão definitiva (licenciamento e nome final ficam para o doc 13, que ainda não escolheu fonte alguma).

### 8.2 Fontes de fallback

Fallback deve ser sans-serif de sistema com métricas próximas. A troca não pode alterar hierarquia nem quebrar controles. A lista técnica será definida na implementação sem mudar esta regra visual.

### 8.3 Papéis tipográficos

| Papel | Tamanho de referência | Peso | Uso |

| --- | --- | --- | --- |

| Display | 48 | Semibold/Bold | Comunicação institucional rara. |

| Título de página amplo | 30 | Semibold | Contexto de páginas amplas. |

| Título de página móvel | 24 | Semibold | Contexto principal mobile. |

| Título de bloco | 20 | Semibold | Seção ou grupo. |

| Corpo destacado | 18 | Regular/Medium | Resumo relevante. |

| Corpo | 16 | Regular | Leitura principal. |

| Auxiliar | 14 | Regular/Medium | Ajuda, metadata e UI compacta. |

| Legenda | 12 | Medium | Uso restrito e contrastado. |

| Dado | 14–30 | Medium/Semibold | Métrica com tabular nums. |



### 8.4 Escala tipográfica

12, 14, 16, 18, 20, 24, 30, 38 e 48. Valores fora da escala exigem alteração sistêmica.

### 8.5 Pesos

Regular para leitura, Medium para labels, Semibold para títulos e ações, Bold raro.

### 8.6 Altura de linha

Deve crescer conforme leitura: títulos compactos; corpo entre 1,4 e 1,6; metadados no mínimo 1,3.

### 8.7 Espaçamento entre letras

Normal para corpo; ajuste mínimo em títulos; caixa alta técnica com tracking moderado.

### 8.8 Títulos de página

Curto, alinhado ao início e com apenas um nível principal por tela.

### 8.9 Títulos de seção

Organizam conteúdo; não competem com título de página.

### 8.10 Títulos de componente

Identificam bloco, não repetem título da página.

### 8.11 Corpo principal

16 como referência, nunca abaixo do limite de leitura.

### 8.12 Corpo secundário

14 ou 16, com contraste suficiente.

### 8.13 Labels

Sempre visíveis, concisos e associados ao controle.

### 8.14 Texto auxiliar

Explica formato, consequência ou faixa. Não repete o label.

### 8.15 Texto de ação

Verbo específico, sentence case, sem caixa alta.

### 8.16 Legendas

Uso restrito a informação não essencial; nunca esconder condição crítica.

### 8.17 Badges

Texto curto; uma linha; peso Medium; sem frases.

### 8.18 Dados e números tabulares

Usar números tabulares para comparação e alinhamento.

### 8.19 Unidades científicas

Unidade sempre visível, menor que o valor e inseparável na quebra.

### 8.20 Dosagens e informações clínicas

Valor, unidade, via e horário devem ser inequívocos; evitar abreviações não explicadas.

### 8.21 Datas e horários

Formatados por locale; indicar fuso quando relevante.

### 8.22 Truncamento

Permitido somente quando o conteúdo completo estiver acessível e não for crítico.

### 8.23 Quebra de linha

Botões e labels curtos preferem uma linha; conteúdo explicativo deve envolver naturalmente.

### 8.24 Ampliação de texto

Componentes devem suportar aumento sem sobreposição, corte ou perda de ação.

### 8.25 Regras tipográficas proibidas

Múltiplas famílias, pesos finos, corpo minúsculo, texto decorativo, placeholders como label e números proporcionais em tabelas.

## 9. Espaçamento e ritmo

### 9.1 Escala oficial

| Token | Valor | Uso típico |

| --- | --- | --- |

| `space.1` | 4 | Ajuste mínimo interno. |

| `space.2` | 8 | Ícone-texto e microagrupamento. |

| `space.3` | 12 | Controles compactos. |

| `space.4` | 16 | Padding e gap padrão. |

| `space.6` | 24 | Entre grupos. |

| `space.8` | 32 | Entre seções. |

| `space.12` | 48 | Separação ampla. |

| `space.16` | 64 | Marcos editoriais. |

| `space.24` | 96 | Uso institucional raro. |



### 9.2 Espaçamento interno

Controles usam padding suficiente para alvo e legibilidade; superfícies seguem escala.

### 9.3 Espaçamento externo

Pertence ao container ou padrão de composição, não ao componente isolado.

### 9.4 Espaçamento entre texto e ícone

Preferência `space.2`; aumentar apenas em componentes grandes.

### 9.5 Espaçamento entre campos

`space.4` dentro de grupos e `space.6` entre grupos.

### 9.6 Espaçamento entre seções

`space.8` ou `space.12` conforme hierarquia.

### 9.7 Espaçamento entre cards

`space.3` mobile; `space.4` ou `space.6` em telas amplas.

### 9.8 Espaçamento em listas

Densidade definida por altura e padding; divisores não substituem ritmo.

### 9.9 Espaçamento em dashboards

Prioridade visual deve ser criada por grupos, não gaps aleatórios.

### 9.10 Ritmo vertical

Repetição consistente de intervalos torna a interface previsível.

### 9.11 Densidade confortável

Padrão para Med, leitura longa e mobile.

### 9.12 Densidade compacta

Permitida em dados Grow e desktop quando legibilidade e alvo forem preservados.

### 9.13 Densidade responsiva

Reorganiza conteúdo; não reduz texto ou alvo abaixo do mínimo.

### 9.14 Espaçamentos proibidos

Valores intermediários sem token, margens negativas e gaps usados para corrigir anatomia incorreta.

### 9.15 Proibição de valores arbitrários

Toda exceção exige token ou revisão do padrão.

## 10. Grid, layout e alinhamento

### 10.1 Grid mobile

4 colunas, gutter `space.4`, margens laterais mínimas `space.4`.

### 10.2 Grid tablet

8 colunas, gutter `space.4`; margens podem aumentar conforme largura.

### 10.3 Grid desktop

12 colunas, gutter `space.4`; conteúdo usa largura máxima apropriada.

### 10.4 Colunas

Componentes ocupam colunas inteiras; não usar frações arbitrárias.

### 10.5 Gutter

Constante por breakpoint para preservar alinhamento.

### 10.6 Margens externas

Devem criar zona segura e leitura confortável.

### 10.7 Larguras máximas

Texto longo, formulários e relatórios têm largura menor que dashboards.

### 10.8 Áreas seguras

Respeitar notch, barras do sistema, teclado e controles persistentes.

### 10.9 Alinhamento horizontal

Alinhar ao início; centralização apenas em foco único.

### 10.10 Alinhamento vertical

Baseado em linha de texto e centro óptico de controles.

### 10.11 Layout de uma coluna

Padrão mobile e para leitura linear.

### 10.12 Layout de múltiplas colunas

Somente quando relações paralelas forem úteis.

### 10.13 Reflow responsivo

Preserva ordem semântica ao mudar de colunas para sequência.

### 10.14 Regra de agrupamento

Proximidade deve representar relação real.

### 10.15 Regra de proximidade

Itens relacionados mais próximos que grupos distintos.

### 10.16 Regra de continuidade

Ações e estados permanecem próximos do objeto afetado.

### 10.17 Layouts proibidos

Mosaico aleatório, colunas apertadas, texto muito largo e reorganização que altera significado.

## 11. Geometria, radius e forma

### 11.1 Personalidade geométrica

Geometria precisa, contemporânea e suavemente humanizada. Formas não devem parecer lúdicas nem hospitalares.

### 11.2 Escala de radius

| Token | Valor | Uso |

| --- | --- | --- |

| `radius.sm` | 4 | Inputs, badges e elementos compactos. |

| `radius.md` | 8 | Cards e controles padrão. |

| `radius.lg` | 16 | Modais, sheets e superfícies principais. |

| `radius.pill` | 999 | Chips e tags; nunca cards. |



### 11.3 Radius de controles

Inputs e botões usam `sm` ou `md` conforme altura; mesma família geométrica.

### 11.4 Radius de cards

`md` como padrão. Card de destaque não aumenta radius sem mudar função.

### 11.5 Radius de overlays

`lg` em modal/sheet, respeitando borda da viewport no mobile.

### 11.6 Radius pill

Somente itens curtos e autocontidos.

### 11.7 Formas circulares

Avatar, radio, indicadores e icon buttons quando a semântica exigir.

### 11.8 Formas técnicas

Grow não recebe cantos mais agressivos; precisão vem de densidade e dados.

### 11.9 Formas clínicas

Med não recebe arredondamento infantil; serenidade vem de espaço e tom.

### 11.10 Relação entre forma e hierarquia

Superfícies maiores podem usar radius maior; filhos nunca devem parecer mais arredondados que o container sem intenção.

### 11.11 Aninhamento de superfícies arredondadas

Evitar múltiplas camadas. Quando necessário, o raio interno deve ser proporcional ao padding.

### 11.12 Formas proibidas

Raio aleatório, cards pill, hexágonos futuristas e formas orgânicas decorativas.

## 12. Bordas, divisores e contornos

### 12.1 Papel das bordas

Separar planos e comunicar estado, nunca decorar.

### 12.2 Bordas de superfície

1px visual ou equivalente, baixa ênfase.

### 12.3 Bordas de campo

Default neutra, focus clara e erro semântico.

### 12.4 Bordas de seleção

Acento contextual acompanhado de fundo/ícone.

### 12.5 Bordas de foco

Independentes da borda do componente; não podem ser cortadas.

### 12.6 Bordas de erro

Crítico + mensagem; cor isolada é insuficiente.

### 12.7 Bordas semânticas

Somente quando estado afeta toda a superfície.

### 12.8 Divisores de lista

Sutis e alinhados ao conteúdo; podem ser omitidos quando spacing basta.

### 12.9 Divisores de seção

Usados com parcimônia em configurações e relatórios.

### 12.10 Contraste de borda

Deve ser perceptível sem competir com conteúdo.

### 12.11 Bordas em Dark Mode

Mais importantes que sombra para separar superfícies.

### 12.12 Bordas em Light Mode

Podem combinar com sombra rasa.

### 12.13 Uso excessivo de bordas

Evitar grade visual em toda a tela.

### 12.14 Contornos proibidos

Traços duplos, bordas coloridas decorativas e contorno espesso permanente.

## 13. Superfícies, elevação e sombras

### 13.1 Hierarquia de superfícies

Elevação representa relação espacial e prioridade temporária. Não representa importância de negócio por si só.

### 13.2 Superfície base

Fundo da aplicação.

### 13.3 Superfície primária

Conteúdo principal.

### 13.4 Superfície secundária

Agrupamentos e áreas auxiliares.

### 13.5 Superfície elevada

Menus, popovers e elementos temporários.

### 13.6 Superfície sobreposta

Modal/sheet com scrim.

### 13.7 Escala de elevação

Níveis 0–5. O nível cresce apenas com sobreposição e distância perceptiva.

### 13.8 Elevação no Dark Mode

Clareamento sutil + borda; sombra mínima.

### 13.9 Elevação no Light Mode

Sombra suave crescente + possível borda.

### 13.10 Sombras funcionais

Sugerem separação e movimento; não criam glow.

### 13.11 Sombras de overlays

Mais pronunciadas, ainda difusas e neutras.

### 13.12 Relação entre sombra e borda

Usar o mínimo necessário; evitar duplicar contraste agressivo.

### 13.13 Relação entre sombra e contraste

Conteúdo deve permanecer legível sem depender da sombra.

### 13.14 Elevação em componentes interativos

Hover pode elevar levemente somente cards clicáveis em desktop; mobile usa pressed.

### 13.15 Elevação proibida

Elevar cada card, badge ou botão.

### 13.16 Sombras proibidas

Sombras coloridas, duras, longas ou decorativas.

## 14. Opacidade, overlays e transparência

### 14.1 Opacidade de conteúdo secundário

Preferir tokens de texto em vez de opacidade sobre texto.

### 14.2 Opacidade de estado disabled

Referência 40%, preservando compreensão; label pode permanecer mais legível.

### 14.3 Opacidade de hover

Overlay 8–12% sobre a superfície.

### 14.4 Opacidade de scrim

Referência 60%, ajustada por tema para manter foco.

### 14.5 Transparência em superfícies

Excepcional; não usar glassmorphism generalizado.

### 14.6 Transparência em dados

Permitida para intervalo e comparação, nunca para esconder série.

### 14.7 Transparência e acessibilidade

Contraste deve ser calculado no resultado final.

### 14.8 Transparência no Modo Discreto

Conteúdo sensível é oculto/substituído, não apenas reduzido em opacidade.

### 14.9 Usos proibidos

Texto essencial translúcido, cards transparentes sobre imagem e overlay que impede foco visível.

## 15. Iconografia aplicada

### 15.1 Biblioteca iconográfica oficial

Conjunto único linear, consistente e com licença adequada; a escolha final deve preservar estilo descrito.

### 15.2 Grid de construção

Grade comum, proporções ópticas consistentes.

### 15.3 Peso visual

Traço médio, nem fino nem pesado.

### 15.4 Tamanhos

16, 20, 24 e 32 como referências; 24 em controles de toque.

### 15.5 Alinhamento óptico

Ícone centralizado visualmente, não apenas geometricamente.

### 15.6 Ícones de navegação

Metáforas universais, acompanhadas de label na navegação primária.

### 15.7 Ícones de ação

Verbo visual claro; tooltip/label quando isolado.

### 15.8 Ícones de estado

Pareados com semântica e texto.

### 15.9 Ícones de feedback

Consistentes entre toast, banner, erro e modal.

### 15.10 Ícones técnicos Grow

Precisos, neutros e sem folha como atalho genérico.

### 15.11 Ícones clínicos Med

Discretos e não hospitalares; evitar cruz médica como decoração.

### 15.12 Ícones de IA

Abstração de relações/dados; nenhum robô ou cérebro brilhante.

### 15.13 Ícones de privacidade

Cadeado, olho e escopo acompanhados de texto.

### 15.14 Ícones Premium

Marca de categoria discreta; não coroa ou diamante ostentativo.

### 15.15 Ícone acompanhado de texto

Padrão preferencial para ações importantes.

### 15.16 Ícone isolado

Somente metáfora inequívoca, com nome acessível.

### 15.17 Label acessível

Obrigatório para todo ícone interativo.

### 15.18 Ícones preenchidos e de contorno

Não alternar estilos arbitrariamente; preenchido pode indicar seleção somente se sistematizado.

### 15.19 Estados dos ícones

Herda estado do controle; nunca cria semântica independente.

### 15.20 Usos proibidos

Mistura de bibliotecas, emojis operacionais, ícones sem label ambíguos e uso decorativo excessivo.

## 16. Motion aplicado

### 16.1 Escala temporal

| Token | Duração | Uso |

| --- | --- | --- |

| `motion.instant` | 100ms | Pressed e feedback imediato. |

| `motion.fast` | 150ms | Hover e pequenos estados. |

| `motion.base` | 200ms | Transições padrão. |

| `motion.slow` | 300ms | Overlays e reorganização. |

| `motion.deliberate` | 500ms | Onboarding/transição de contexto, uso raro. |



### 16.2 Curvas de movimento

Standard para mudanças simétricas; decelerate na entrada; accelerate na saída.

### 16.3 Feedback instantâneo

Pressão e seleção devem responder em até `instant`.

### 16.4 Transições rápidas

Hover, focus e troca de estado simples.

### 16.5 Transições padrão

Expansão, tabs e atualização local.

### 16.6 Transições complexas

Somente quando ajudam continuidade espacial.

### 16.7 Entrada

Elemento desacelera ao chegar.

### 16.8 Saída

Elemento acelera ao sair.

### 16.9 Alteração de estado

Não deve mover layout inesperadamente.

### 16.10 Atualização de dados

Interpolação leve; valores e eixos permanecem compreensíveis.

### 16.11 Loading

Motion contínuo discreto; sem pulsação agressiva.

### 16.12 Motion em overlays

Scrim e superfície entram coordenados.

### 16.13 Motion em navegação

Preserva direção e relação hierárquica.

### 16.14 Feedback tátil

Leve em seleção, sucesso ou ação crítica; nunca em toda interação.

### 16.15 Redução de movimento

Versão equivalente instantânea obrigatória.

### 16.16 Movimentos proibidos

Bounce recreativo, parallax decorativo, brilho pulsante, confete e animação que bloqueia ação.

# PARTE III — MODELOS DE ESTADO E COMPORTAMENTO

## 17. Estados globais de tela e dados

### 17.1 Estado inicial

Interface pronta antes de qualquer dado ou interação. A representação deve usar texto, ícone e composição compatíveis, sem depender apenas de cor.

### 17.2 Estado vazio

Ausência legítima de conteúdo, com explicação e ação quando aplicável. A representação deve usar texto, ícone e composição compatíveis, sem depender apenas de cor.

### 17.3 Estado carregando

Primeira obtenção de dados; estrutura previsível e não bloqueio desnecessário. A representação deve usar texto, ícone e composição compatíveis, sem depender apenas de cor.

### 17.4 Estado atualizando

Dados existentes permanecem visíveis enquanto nova versão é buscada. A representação deve usar texto, ícone e composição compatíveis, sem depender apenas de cor.

### 17.5 Estado processando

Operação assíncrona após envio; comunica continuidade e expectativa. A representação deve usar texto, ícone e composição compatíveis, sem depender apenas de cor.

### 17.6 Estado pendente

Ação registrada, ainda não concluída por dependência externa ou futura. A representação deve usar texto, ícone e composição compatíveis, sem depender apenas de cor.

### 17.7 Estado sucesso

Ação concluída ou dado confirmado; feedback proporcional. A representação deve usar texto, ícone e composição compatíveis, sem depender apenas de cor.

### 17.8 Estado erro

Falha específica com causa compreensível e recuperação. A representação deve usar texto, ícone e composição compatíveis, sem depender apenas de cor.

### 17.9 Estado crítico

Risco elevado, perda potencial ou ação destrutiva; uso restrito. A representação deve usar texto, ícone e composição compatíveis, sem depender apenas de cor.

### 17.10 Estado offline

Sem conectividade; conteúdo local preservado. A representação deve usar texto, ícone e composição compatíveis, sem depender apenas de cor.

### 17.11 Estado sincronizando

Mudanças locais sendo enviadas. A representação deve usar texto, ícone e composição compatíveis, sem depender apenas de cor.

### 17.12 Estado com dado em cache

Dado disponível de leitura, com origem/atualização indicada quando relevante. A representação deve usar texto, ícone e composição compatíveis, sem depender apenas de cor.

### 17.13 Estado com dado desatualizado

Dado potencialmente antigo; marca temporal e atualização. A representação deve usar texto, ícone e composição compatíveis, sem depender apenas de cor.

### 17.14 Estado sem permissão

Usuário autenticado sem autorização para o recurso. A representação deve usar texto, ícone e composição compatíveis, sem depender apenas de cor.

### 17.15 Estado privado

Recurso existe, mas está intencionalmente restrito. A representação deve usar texto, ícone e composição compatíveis, sem depender apenas de cor.

### 17.16 Estado Premium ou bloqueado

Funcionalidade conhecida, acesso depende do plano. A representação deve usar texto, ícone e composição compatíveis, sem depender apenas de cor.

### 17.17 Estado indisponível

Serviço ou recurso temporariamente não oferecido. A representação deve usar texto, ícone e composição compatíveis, sem depender apenas de cor.

### 17.18 Estado removido

Conteúdo excluído, moderado ou revogado com explicação proporcional. A representação deve usar texto, ícone e composição compatíveis, sem depender apenas de cor.

### 17.19 Estado sob Modo Discreto

Camada que oculta nomes, imagens e detalhes sensíveis. A representação deve usar texto, ícone e composição compatíveis, sem depender apenas de cor.

### 17.20 Prioridade entre estados simultâneos

Segurança/privacidade > erro crítico > permissão > offline/sync > Premium > carregamento > sucesso. O estado de maior risco domina; os demais podem aparecer secundariamente. A representação deve usar texto, ícone e composição compatíveis, sem depender apenas de cor.

## 18. Estados de interação dos componentes

### 18.1 Default

Estado estável e reconhecível.

### 18.2 Hover

Somente ponteiro; overlay discreto, sem alterar layout.

### 18.3 Focus

Componente recebe foco lógico.

### 18.4 Focus visible

Anel visível obrigatório para navegação por teclado e quando a plataforma indicar.

### 18.5 Active ou pressed

Feedback imediato de pressão.

### 18.6 Selected

Escolha atual, indicada por acento + forma/texto.

### 18.7 Unselected

Alternativa disponível sem destaque principal.

### 18.8 Disabled

Indisponível; ação não executável, com motivo quando não óbvio.

### 18.9 Read-only

Valor consultável e selecionável, mas não editável; não deve parecer disabled.

### 18.10 Loading

Ação em andamento; evita submissão duplicada e preserva label/contexto.

### 18.11 Success

Confirmação quando o componente precisa mostrar resultado local.

### 18.12 Warning

Entrada válida, mas com condição que requer atenção.

### 18.13 Error

Entrada ou ação inválida; mensagem específica.

### 18.14 Estado misto

Aplicável a checkbox de seleção parcial e controles equivalentes.

### 18.15 Interação por toque

Alvo mínimo 44×44 e feedback pressed.

### 18.16 Interação por mouse

Hover e cursor coerente, sem depender deles para compreensão.

### 18.17 Interação por teclado

Tab, setas, Enter, Espaço e Escape conforme padrão do controle.

### 18.18 Interação por leitor de tela

Nome, papel, estado, valor e instruções anunciados.

### 18.19 Regras de transição entre estados

Mudanças previsíveis; erro não apaga entrada; loading não muda largura.

### 18.20 Combinações de estado proibidas

Disabled + loading, error + success simultâneos, selected sem interação clara, focus invisível.

## 19. Modelo responsivo dos componentes

### 19.1 Princípio mobile-first

Definir primeiro sequência, toque e largura limitada.

### 19.2 Comportamento fluido

Larguras e gaps crescem dentro de limites.

### 19.3 Comportamento adaptativo

Navegação e overlays podem mudar de forma por breakpoint.

### 19.4 Mudança de dimensão

Controle pode ficar full-width no mobile e intrínseco no desktop.

### 19.5 Mudança de orientação

Layout interno pode passar de horizontal para vertical.

### 19.6 Mudança de composição

Tabela pode virar lista sem perder relações.

### 19.7 Mudança de densidade

Desktop pode compactar dados, mantendo alvos e leitura.

### 19.8 Reordenação de conteúdo

Somente se preservar ordem semântica e foco.

### 19.9 Ocultação permitida

Metadados redundantes podem ser colapsados com acesso alternativo.

### 19.10 Ocultação proibida

Ações, estado, unidade, privacidade e informação crítica.

### 19.11 Componentes full-width

Formulários, banners e ações principais mobile.

### 19.12 Componentes de largura intrínseca

Badges, chips e ações curtas.

### 19.13 Componentes com largura máxima

Formulários, modais e textos longos.

### 19.14 Comportamento em teclado virtual

Campos e ações ativas permanecem visíveis; scroll ajusta sem perder contexto.

### 19.15 Comportamento em safe areas

Bottom nav, sheets e ações persistentes respeitam insetos.

### 19.16 Testes responsivos obrigatórios

320px, 375px, 600px, 768px, 1024px, 1280px e telas amplas, além de texto ampliado.

## 20. Acessibilidade transversal

### 20.1 Critério mínimo WCAG

WCAG 2.1 AA é piso; requisitos de plataforma e domínio podem elevar o nível.

### 20.2 Contraste

Testar todos os estados nos dois temas.

### 20.3 Tamanho mínimo de texto

12 somente metadado não crítico; corpo padrão 16.

### 20.4 Alvos mínimos de interação

44×44 em toque; espaçamento evita toques acidentais.

### 20.5 Foco visível

Nunca removido; não pode ser ocultado por overflow.

### 20.6 Ordem de foco

Segue ordem de leitura e ação.

### 20.7 Ordem de leitura

Conteúdo visual e semântico devem coincidir.

### 20.8 Labels acessíveis

Todo controle possui nome persistente.

### 20.9 Descrições auxiliares

Usadas para formato, consequência e contexto.

### 20.10 Estados anunciáveis

Loading, sucesso, erro e atualização precisam de anúncio adequado.

### 20.11 Erros anunciáveis

Erro ligado ao campo e incluído em resumo quando múltiplo.

### 20.12 Atualizações assíncronas

Não mover foco; anunciar mudança sem interromper.

### 20.13 Conteúdo não dependente de cor

Ícone, texto, forma ou padrão adicional.

### 20.14 Conteúdo não dependente de gesto

Toda ação por swipe/drag possui alternativa.

### 20.15 Texto ampliado

Sem corte, sobreposição ou perda de ação.

### 20.16 Redução de movimento

Respeitada em todos os componentes.

### 20.17 Leitor de tela

Semântica correta e conteúdo decorativo oculto.

### 20.18 Teclado

Operação completa sem mouse.

### 20.19 Acessibilidade cognitiva

Rótulos previsíveis, uma ação principal e erros acionáveis.

### 20.20 Gráficos acessíveis

Resumo textual, tabela ou navegação por pontos.

### 20.21 Conteúdo clínico sensível

Linguagem não alarmista, confirmação em ações destrutivas e privacidade visível.

### 20.22 Critérios de reprovação

Falha de foco, contraste, leitor de tela, zoom, teclado, alvo ou dependência exclusiva de cor reprova o componente.

## 21. Conteúdo e internacionalização transversal

### 21.1 Regras de labels

Conciso, específico e persistente.

### 21.2 Regras de texto auxiliar

Explica sem duplicar.

### 21.3 Regras de placeholder

Exemplo opcional; nunca label.

### 21.4 Regras de mensagens de erro

Dizer o que ocorreu e como corrigir.

### 21.5 Regras de confirmações

Informar resultado, não celebrar excessivamente.

### 21.6 Regras de estados vazios

Explicar motivo e próximo passo.

### 21.7 Regras de conteúdo Premium

Mostrar valor e limite sem manipulação.

### 21.8 Regras de conteúdo de IA

Distinguir dado, inferência, confiança e limitação.

### 21.9 Truncamento

Somente com acesso ao conteúdo completo.

### 21.10 Expansão de texto

Acomodar ao menos 30% e textos multilinha.

### 21.11 Pluralização

Gerenciada por locale, nunca concatenada.

### 21.12 Datas e horas

Formato local e contexto temporal.

### 21.13 Números e separadores

Locale correto e precisão consistente.

### 21.14 Unidades

Símbolo padronizado e não separável do valor.

### 21.15 Percentuais

Dizer base e período quando relevantes.

### 21.16 Dosagens

Valor, unidade e via explícitos.

### 21.17 Locales futuros

Nenhum componente fixa largura pelo português atual.

### 21.18 Direções de leitura futuras

Usar início/fim lógicos; ícones direcionais espelham quando necessário.

### 21.19 Conteúdo proibido dentro de componentes

Texto legal crítico em tooltip, frases em badges, erro genérico, promessa absoluta de IA e linguagem estigmatizante.

# PARTE IV — PRIMITIVOS VISUAIS

## 22. Texto

### 22.1 Texto de título

Contextualiza página ou bloco.

### 22.2 Texto de seção

Agrupa conteúdo relacionado.

### 22.3 Texto de corpo

Explica e informa.

### 22.4 Texto secundário

Complementa sem competir.

### 22.5 Texto auxiliar

Orienta uma ação ou entrada.

### 22.6 Texto de dado

Valor com tabular nums e unidade.

### 22.7 Texto de label

Nome persistente do controle.

### 22.8 Texto de ação

Verbo claro e específico.

### 22.9 Texto de legenda

Contexto não essencial.

### 22.10 Texto semântico

Mensagem de sucesso, atenção ou erro com ícone.

### 22.11 Texto truncado

Uso controlado e conteúdo completo acessível.

### 22.12 Texto expansível

Conteúdo longo com ação explícita de expandir/recolher.

**Regra de aceitação:** o papel tipográfico, contraste, quebra e importância devem permanecer corretos em Dark, Light, texto ampliado e idiomas longos.

## 23. Ícone

### 23.1 Ícone decorativo

Não recebe nome acessível e não comunica informação.

### 23.2 Ícone informativo

Acompanha texto e reforça significado.

### 23.3 Ícone interativo

Possui alvo, estado e label acessível.

### 23.4 Ícone semântico

Usa forma estável para sucesso, atenção, crítico e informação.

### 23.5 Ícone com label

Padrão para navegação e ações importantes.

### 23.6 Ícone isolado

Somente metáfora universal e tooltip quando aplicável.

### 23.7 Ícone contextual

Mantém desenho; recebe acento do contexto.

### 23.8 Estado e cor do ícone

Herda o controle e nunca contradiz o texto.

## 24. Imagem, thumbnail e avatar

### 24.1 Imagem de conteúdo

Mantém proporção, metadata e alternativa textual quando útil.

### 24.2 Thumbnail

Representação compacta com crop previsível.

### 24.3 Imagem de entidade

Identifica planta, ciclo, produto ou publicação sem substituir título.

### 24.4 Imagem clínica

Proteção reforçada, sem crop que remova contexto relevante.

### 24.5 Imagem de cultivo

Fidelidade e data/fase quando necessárias.

### 24.6 Avatar de perfil

Forma circular, tamanho limitado e fallback estável.

### 24.7 Avatar anônimo

Símbolo neutro, sem sugerir perfil incompleto.

### 24.8 Fallback de imagem

Placeholder contextual e neutro.

### 24.9 Estado carregando

Skeleton estrutural.

### 24.10 Estado indisponível

Placeholder + explicação se necessário.

### 24.11 Conteúdo sensível

Borrado/oculto com ação intencional de revelar.

### 24.12 Modo Discreto

Substitui imagem e rótulo sem revelar categoria sensível.

## 25. Separadores e agrupadores

### 25.1 Divider horizontal

Separa linhas ou seções com baixa ênfase.

### 25.2 Divider vertical

Uso raro em desktop, nunca para compensar layout confuso.

### 25.3 Separador de seção

Pode combinar título e spacing.

### 25.4 Agrupamento por superfície

Quando o grupo possui contexto ou interação própria.

### 25.5 Agrupamento por espaçamento

Preferido para conteúdo simples.

### 25.6 Agrupamento por título

Necessário quando grupos precisam de nome.

### 25.7 Uso correto e incorreto

Correto: relação semântica clara. Incorreto: caixas em cada item, card soup ou linha em todo espaço.

# PARTE V — AÇÕES E CONTROLES

## 26. Botões

### 26.1 Botão primário

Uma ação principal por contexto visual. Usa acento do contexto, texto de alto contraste e sem ícone obrigatório.

### 26.2 Botão secundário

Alternativa importante sem competir; superfície neutra, borda ou contraste moderado.

### 26.3 Botão terciário

Ação auxiliar em texto/baixo preenchimento.

### 26.4 Botão destrutivo

Usa semântica crítica e exige consequência explícita; não é apenas “primário vermelho”.

### 26.5 Botão de baixo destaque

Ação opcional, como cancelar ou ver detalhes.

### 26.6 Botão com ícone inicial

Ícone reforça verbo; não substitui label.

### 26.7 Botão com ícone final

Reservado a direção/continuidade quando útil.

### 26.8 Botão somente com ícone

Alvo mínimo 44×44, metáfora clara e nome acessível.

### 26.9 Botão full-width

Padrão mobile para ação principal ou modal estreito.

### 26.10 Botão de largura intrínseca

Desktop e ações agrupadas, com largura baseada no conteúdo e padding.

### 26.11 Tamanhos

Pequeno somente desktop/compacto; médio padrão; grande para foco único. Todos preservam alvo.

### 26.12 Estados

Default, hover, focus visible, active, disabled, loading; success/error local somente quando necessário.

### 26.13 Loading

Mantém largura e label ou contexto; indicador não deve causar layout shift.

### 26.14 Idempotência visual

Após primeiro acionamento, entra em loading/disabled para impedir duplo envio.

### 26.15 Hierarquia entre ações

Primário > secundário > terciário. Destrutivo não recebe maior destaque até a confirmação.

### 26.16 Quantidade máxima de ações próximas

Máximo recomendado: uma primária e duas secundárias visíveis no mesmo grupo.

### 26.17 Ações destrutivas

Exigem verbos específicos; quando irreversíveis, confirmação dedicada.

### 26.18 Regras responsivas

No mobile, empilhar quando labels não cabem; primário geralmente ocupa largura total.

### 26.19 Anti-patterns

Múltiplos primários, ícone sem label ambíguo, botão desabilitado sem razão, texto “OK” genérico, gradiente e sombra decorativa.

**Decisão oficial.** Botões iniciam ações e nunca substituem links de navegação.

**Justificativa.** O componente existe para resolver um padrão recorrente com uma única anatomia e um único comportamento. A padronização reduz decisões locais, evita variantes redundantes e torna a experiência previsível em todos os módulos.

| Dimensão | Especificação normativa |

| --- | --- |

| Anatomia | Container, label obrigatório, ícone opcional, indicador de loading opcional. |

| Variantes | Primário, secundário, terciário, destrutivo, baixo destaque; com/sem ícone; pequeno/médio/grande. |

| Estados | Default, hover, focus visible, active, disabled e loading. |

| Quando utilizar | Submissão, criação, confirmação, alteração de estado e ações locais. |

| Quando não utilizar | Navegação para conteúdo quando um link semântico é adequado. |

| Responsividade | Full-width ou empilhado no mobile; intrínseco no desktop. |

| Acessibilidade | Alvo 44×44, nome acessível, foco visível, estado anunciado. |

| Conteúdo | Verbo específico e curto; evitar “Sim/Não” sem contexto. |

| Contextos | Compartilhado entre Core, Grow e Med; apenas acento e conteúdo contextual variam. |

| Critérios de aceitação | Mantém hierarquia, contraste, alvo, idempotência e funcionamento em teclado. |



## 27. Links e ações textuais

### 27.1 Link inline

Navega a referência no texto.

### 27.2 Link independente

Ação de navegação de baixa ênfase.

### 27.3 Link de navegação

Muda local/rota; sem comportamento de botão.

### 27.4 Link externo

Indica saída quando relevante.

### 27.5 Link destrutivo

Uso raro; ação destrutiva deve preferir botão em contexto de decisão.

### 27.6 Link acompanhado de ícone

Ícone externo, download ou direção quando agrega.

### 27.7 Estados

Default, hover, focus, visited quando útil e disabled somente se inevitável.

### 27.8 Acessibilidade

Sublinhado ou sinal além de cor; propósito compreensível fora de contexto.

### 27.9 Diferença entre link e botão

Link navega; botão executa. Aparência não deve inverter semântica.

## 28. Campo de texto

### 28.1 Campo de linha única

Nome, título e dados curtos.

### 28.2 Campo de múltiplas linhas

Observações e descrição; redimensionamento controlado.

### 28.3 Campo com prefixo

Moeda, URL ou contexto fixo; não repetir no valor.

### 28.4 Campo com sufixo

Unidade ou ação clara.

### 28.5 Campo com ícone

Somente quando o ícone explica categoria ou ação.

### 28.6 Campo sensível

Permite revelar/ocultar e protege previews.

### 28.7 Campo somente leitura

Visualmente legível e copiável.

### 28.8 Campo opcional

Indicar “opcional”, não marcar todos obrigatórios.

### 28.9 Campo obrigatório

Obrigatoriedade clara antes da submissão.

### 28.10 Contador de caracteres

Usar quando limite impacta sucesso.

### 28.11 Texto auxiliar

Formato, unidade ou consequência.

### 28.12 Validação

Após interação ou submissão, preservando valor.

### 28.13 Estados

Default, hover, focus, filled, disabled, read-only, warning, error e success quando útil.

### 28.14 Acessibilidade

Label persistente, descrição ligada, erro anunciado e foco claro.

### 28.15 Anti-patterns

Placeholder como label, erro apenas por cor, ícones demais, largura inadequada e mascaramento inesperado.

**Decisão oficial.** Entrada textual com label persistente e validação contextual.

**Justificativa.** O componente existe para resolver um padrão recorrente com uma única anatomia e um único comportamento. A padronização reduz decisões locais, evita variantes redundantes e torna a experiência previsível em todos os módulos.

| Dimensão | Especificação normativa |

| --- | --- |

| Anatomia | Label, controle, valor/placeholder, suporte textual e mensagem de estado. |

| Variantes | Uma linha, múltiplas linhas, prefixo, sufixo, sensível, read-only. |

| Estados | Default, hover, focus, filled, disabled, read-only, warning e error. |

| Quando utilizar | Dados textuais editáveis. |

| Quando não utilizar | Escolhas fechadas, números estruturados ou datas. |

| Responsividade | Full-width no mobile; largura pelo tipo de dado no desktop. |

| Acessibilidade | Label programático, erro associado e operação por teclado. |

| Conteúdo | Label específico, placeholder opcional, ajuda breve e erro acionável. |

| Contextos | Compartilhado entre Core, Grow e Med; apenas acento e conteúdo contextual variam. |

| Critérios de aceitação | Não perde valor, mantém contraste e funciona com texto ampliado. |



## 29. Campo numérico e de medição

### 29.1 Número simples

Quantidade inteira.

### 29.2 Número decimal

Medição com precisão definida pelo domínio.

### 29.3 Número com unidade

Unidade persistente e não editável quando possível.

### 29.4 Número com faixa recomendada

Faixa informativa, não validação automática, salvo regra de negócio.

### 29.5 Número clínico

Evita interpretação; mostra escala e unidade.

### 29.6 Número técnico Grow

Distingue medido, calculado e recomendado.

### 29.7 Incremento e decremento

Somente passos previsíveis; entrada direta continua disponível.

### 29.8 Precisão decimal

Consistente dentro da métrica e locale.

### 29.9 Limites mínimo e máximo

Explicados antes ou no erro.

### 29.10 Validação

Diferencia inválido de fora da referência.

### 29.11 Formatação por locale

Separador e sinal locais sem alterar valor.

### 29.12 Estados

Mesmos do campo, incluindo faixa de atenção independente de erro.

## 30. Seletores

### 30.1 Seletor de opção única

Uma escolha entre opções mutuamente exclusivas.

### 30.2 Seletor de múltiplas opções

Várias escolhas independentes.

### 30.3 Dropdown

Lista média/longa ou espaço restrito; busca quando necessário.

### 30.4 Radio group

Até aproximadamente 5–7 opções visíveis e comparáveis.

### 30.5 Checkbox

Escolha independente ou confirmação explícita.

### 30.6 Switch

Estado binário com efeito imediato; não usar para submissão.

### 30.7 Segmented control

Poucas opções equivalentes que alteram visualização local.

### 30.8 Opção com descrição

Quando consequência ou diferença não é óbvia.

### 30.9 Opção com ícone

Reforço, nunca substituição de texto.

### 30.10 Opção desabilitada

Mantida visível apenas quando o motivo importa.

### 30.11 Estado misto

Seleção parcial em hierarquia.

### 30.12 Seleção obrigatória

Indicar antes do erro.

### 30.13 Seleção opcional

Permitir estado “nenhum”.

### 30.14 Acessibilidade

Agrupamento, label, teclado e anúncio de estado.

### 30.15 Anti-patterns

Dropdown para duas opções, switch para salvar, chips sem significado, ordem instável e seleção só por cor.

## 31. Escala de intensidade

### 31.1 Propósito

Registrar intensidade de modo rápido e comparável.

### 31.2 Uso no check-in diário

Interação breve com valor explícito.

### 31.3 Uso na Sessão Antes/Depois

Mesma escala e orientação para preservar comparação.

### 31.4 Escala numérica

0–10 ou outra escala definida pelo produto; não variar visualmente entre telas equivalentes.

### 31.5 Labels de extremidade

Explicam direção e significado.

### 31.6 Estado inicial

Sem valor ou valor anterior claramente distinguido.

### 31.7 Valor selecionado

Número e descrição visíveis, não apenas posição.

### 31.8 Ajuste por toque

Área ampla e feedback imediato.

### 31.9 Ajuste por teclado

Setas e teclas padrão.

### 31.10 Acessibilidade

Valor, mínimo, máximo e label anunciados.

### 31.11 Comparabilidade dos registros

Mesma orientação e precisão ao longo do tempo.

### 31.12 Anti-patterns

Emoji como única escala, gradiente emocional, extremos sem label e valor inferido apenas por cor.

## 32. Seleção de data e horário

### 32.1 Data

Campo formatado + seletor de calendário.

### 32.2 Horário

Formato local e teclado adequado.

### 32.3 Data e horário combinados

Usar quando a relação é inseparável.

### 32.4 Período

Início e fim com validação clara.

### 32.5 Data aproximada

Estado explicitamente aproximado, sem falsa precisão.

### 32.6 Horário recorrente

Frequência e fuso visíveis.

### 32.7 Datas passadas e futuras

Restrições explicadas.

### 32.8 Formatação por locale

Ordem, mês e relógio locais.

### 32.9 Validação

Erro na parte específica e preservação do valor.

### 32.10 Acessibilidade

Operação por teclado, labels e anúncio de seleção.

## 33. Busca e filtros

### 33.1 Campo de busca

Label/nome acessível, placeholder descritivo e limpeza.

### 33.2 Busca ativa

Consulta visível e resultados atualizados sem perda de foco.

### 33.3 Busca sem resultado

Explica ausência e permite limpar filtros.

### 33.4 Limpeza da busca

Ação clara que mantém foco.

### 33.5 Filtro único

Controle simples próximo ao resultado.

### 33.6 Múltiplos filtros

Sheet/modal mobile ou painel desktop.

### 33.7 Filtros aplicados

Resumo visível e contagem.

### 33.8 Remoção de filtro

Individual e “limpar todos”.

### 33.9 Ordenação

Separada de filtragem e com opção atual visível.

### 33.10 Contagem de resultados

Atualizada e anunciada quando útil.

### 33.11 Comportamento responsivo

Barra compacta mobile; painel persistente apenas quando largura e frequência justificam.

### 33.12 Acessibilidade

Resultados anunciados sem interrupção; chips removíveis com nome completo.

## 34. Upload e captura de mídia

### 34.1 Seleção de arquivo

Tipos e limites antes da escolha.

### 34.2 Captura de foto

Permissão contextual e alternativa pela galeria.

### 34.3 Preview

Mostra arquivo, tamanho e ação de remover.

### 34.4 Upload em andamento

Progresso por item e total quando múltiplo.

### 34.5 Upload concluído

Confirmação discreta.

### 34.6 Upload com erro

Erro específico por item e retry.

### 34.7 Upload pendente offline

Marcador persistente e envio posterior.

### 34.8 Cancelamento

Disponível em processo longo quando seguro.

### 34.9 Reenvio

Preserva metadata e ordem.

### 34.10 Remoção

Confirma quando o arquivo já estiver publicado ou clínico.

### 34.11 Legenda

Opcional, associada ao item.

### 34.12 Conteúdo sensível

Proteção, consentimento e preview discreto.

### 34.13 Permissões negadas

Explica como habilitar e oferece alternativa.

### 34.14 Acessibilidade

Nome de arquivo, progresso e ações anunciados.

# PARTE VI — NAVEGAÇÃO

## 35. Navegação primária

### 35.1 Estrutura oficial

Dashboard, Comunidade e Configurações, conforme fluxo aprovado.

### 35.2 Bottom navigation

Mobile; itens estáveis com ícone e label.

### 35.3 Sidebar

Tablet/desktop; mesma ordem e semântica.

### 35.4 Correspondência entre mobile e desktop

Mudança de forma, não de arquitetura.

### 35.5 Itens permitidos

Somente destinos primários frequentes.

### 35.6 Quantidade máxima

Preferir 3–5; não adicionar atalhos locais.

### 35.7 Estado ativo

Acento contextual + ícone/label; nunca só cor.

### 35.8 Estado inativo

Contraste secundário legível.

### 35.9 Badges e contadores

Somente pendências relevantes; limites numéricos e anúncio acessível.

### 35.10 Accent por contexto

Core, Grow ou Med conforme app atual.

### 35.11 Modo Discreto

Labels sensíveis substituídos conforme regra, sem alterar destinos.

### 35.12 Acessibilidade

Landmark, estado atual e ordem previsível.

### 35.13 Anti-patterns

Mais de cinco destinos, item central exagerado, navegação que muda por tela e ícones sem label.

## 36. Navegação superior

### 36.1 Cabeçalho de página

Contexto, retorno e ações relevantes.

### 36.2 Título

Um título principal, alinhado ao início.

### 36.3 Ação principal

No máximo uma, quando recorrente e contextual.

### 36.4 Ações secundárias

Menu ou ícones com labels acessíveis.

### 36.5 Botão voltar

Preserva pilha e contexto; label quando necessário.

### 36.6 Contexto do aplicativo

Acento e título identificam Core/Grow/Med sem branding excessivo.

### 36.7 Mudança entre Core, Grow e Med

Ação explícita, não tab local quando os apps são contextos distintos.

### 36.8 Comportamento ao rolar

Pode compactar mantendo título/contexto e ações essenciais.

### 36.9 Comportamento responsivo

Desktop integra breadcrumb e ações; mobile prioriza retorno e título.

### 36.10 Acessibilidade

Heading real, controles nomeados e ordem lógica.

## 37. Tabs

### 37.1 Tabs fixas

Poucas opções que cabem sem scroll.

### 37.2 Tabs roláveis

Mais opções, com indicação de continuidade.

### 37.3 Tabs com contagem

Contagem secundária, não badge crítico.

### 37.4 Estado ativo

Indicador + peso + acento.

### 37.5 Estado inativo

Legível sem competir.

### 37.6 Overflow

Scroll horizontal ou menu; não reduzir texto.

### 37.7 Conteúdo responsivo

Não alterar significado entre breakpoints.

### 37.8 Acessibilidade

Papel tablist, setas, selected e painel associado.

### 37.9 Anti-patterns

Tabs para ações, níveis aninhados, mais de uma linha e seleção só por cor.

## 38. Voltar e breadcrumb

### 38.1 Navegação de retorno

Volta ao contexto anterior, não a destino fixo.

### 38.2 Breadcrumb desktop

Mostra hierarquia profunda e links ancestrais.

### 38.3 Hierarquia profunda

Limitar níveis visíveis; colapsar intermediários sem perder acesso.

### 38.4 Preservação de contexto

Filtros, scroll e tab devem ser restaurados.

### 38.5 Títulos longos

Truncamento somente com conteúdo completo disponível.

### 38.6 Uso em detalhe de entidades

Ex.: Ambiente > Ciclo > Planta, respeitando modelo real.

### 38.7 Acessibilidade

Landmark, item atual e nomes claros.

## 39. Paginação e continuidade de listas

### 39.1 Paginação explícita

Preferida em tabelas e contextos administrativos.

### 39.2 Carregamento incremental

Preferido em feeds e timelines, com preservação de posição.

### 39.3 Estado carregando mais

Indicador ao final sem bloquear conteúdo existente.

### 39.4 Fim da lista

Mensagem discreta quando útil.

### 39.5 Erro de continuação

Retry local sem apagar itens.

### 39.6 Preservação da posição

Obrigatória ao abrir e retornar de detalhe.

### 39.7 Acessibilidade

Novos itens anunciados; foco não salta.

### 39.8 Uso por dispositivo

Desktop pode usar paginação; mobile incremental, conforme tarefa.

# PARTE VII — CONTEÚDO, ENTIDADES E DADOS

## 40. Badge de status

### 40.1 Status neutro

Fase, rascunho ou informação sem severidade.

### 40.2 Status informativo

Dado relevante, sem urgência.

### 40.3 Status de sucesso

Concluído, validado ou ativo quando positivo.

### 40.4 Status de atenção

Requer avaliação.

### 40.5 Status crítico

Erro ou risco elevado.

### 40.6 Status de fase

Cor/label estáveis por fase dentro do contexto, não semânticos por padrão.

### 40.7 Status de privacidade

Ícone + texto; neutro.

### 40.8 Status Premium

Categoria discreta, sem parecer severidade.

### 40.9 Status de IA

Origem ou confiança, nunca um julgamento mágico.

### 40.10 Status com ícone

Preferido quando semântica precisa de reforço.

### 40.11 Status somente texto

Permitido em fases neutras e baixa densidade.

### 40.12 Tamanhos

Pequeno e médio; altura estável.

### 40.13 Regras de conteúdo

1–3 palavras, sem frase e sem ponto final.

### 40.14 Acessibilidade

Texto suficiente; não depender de cor.

### 40.15 Anti-patterns

Muitos badges por item, cores aleatórias, pills enormes, animação e texto truncado.

## 41. Card de entidade

### 41.1 Estrutura base

Superfície, identidade, conteúdo, status e ação.

### 41.2 Slot de identidade

Título e tipo/contexto.

### 41.3 Slot de status

Máximo recomendado de dois sinais visíveis.

### 41.4 Slot de metadados

Informação temporal ou relacional.

### 41.5 Slot de métricas

Até três métricas prioritárias.

### 41.6 Slot de mídia

Opcional, proporção estável.

### 41.7 Slot de ações

Ação principal implícita no card e menu secundário.

### 41.8 Card clicável

Toda superfície tem foco e alvo; ações internas não conflitam.

### 41.9 Card não clicável

Conteúdo agrupado sem affordance de navegação.

### 41.10 Variante compacta

Lista densa, menos slots.

### 41.11 Variante padrão

Uso geral.

### 41.12 Variante expandida

Resumo rico em dashboard; uso limitado.

### 41.13 Aplicação em Planta

Fase, genética, ambiente e estado.

### 41.14 Aplicação em Ciclo

Fase, progresso, plantas e tarefas.

### 41.15 Aplicação em Ambiente

Tipo, ciclos ativos e condição.

### 41.16 Aplicação em Genética

Nome, tipo e origem.

### 41.17 Aplicação em Lote

Origem, data, quantidade e vínculo.

### 41.18 Aplicação em Tratamento

Objetivo, período e status.

### 41.19 Aplicação em Produto

Tipo, concentração e vínculo.

### 41.20 Aplicação em Modelo

Tipo, atualização e uso.

### 41.21 Estados

Default, hover/focus, selected, disabled, loading, error e privado.

### 41.22 Responsividade

Horizontal/lista no mobile; grid possível no desktop.

### 41.23 Acessibilidade

Título como nome, status anunciado e ações separadas.

### 41.24 Anti-patterns

Card por campo, card dentro de card, superfície toda colorida, ações demais e anatomia diferente por entidade.

**Decisão oficial.** Representar entidades distintas com uma anatomia comum e slots controlados.

**Justificativa.** O componente existe para resolver um padrão recorrente com uma única anatomia e um único comportamento. A padronização reduz decisões locais, evita variantes redundantes e torna a experiência previsível em todos os módulos.

| Dimensão | Especificação normativa |

| --- | --- |

| Anatomia | Identidade, status, metadados, métricas, mídia opcional e ações. |

| Variantes | Compacto, padrão e expandido; clicável ou estático. |

| Estados | Default, hover, focus, selected, disabled, loading, error, private. |

| Quando utilizar | Listagens, dashboards e relações entre entidades. |

| Quando não utilizar | Formulários, mensagens ou agrupamentos sem identidade própria. |

| Responsividade | Lista no mobile; grid controlado em telas amplas. |

| Acessibilidade | Foco em toda superfície quando clicável, heading coerente e ações nomeadas. |

| Conteúdo | Título curto, status limitado e métricas contextualizadas. |

| Contextos | Compartilhado entre Core, Grow e Med; apenas acento e conteúdo contextual variam. |

| Critérios de aceitação | A mesma anatomia serve todas as entidades sem perda de informação essencial. |



## 42. Itens de lista

### 42.1 Item simples

Título e metadata.

### 42.2 Item com ícone

Categoria ou ação.

### 42.3 Item com imagem

Thumbnail estável.

### 42.4 Item com avatar

Perfil e contexto.

### 42.5 Item com status

Badge alinhado sem quebrar título.

### 42.6 Item com métrica

Valor tabular e unidade.

### 42.7 Item com ação

Ação de baixa frequência; menu para múltiplas.

### 42.8 Item selecionável

Checkbox/radio explícito.

### 42.9 Item expansível

Indicador e região controlada.

### 42.10 Item desabilitado

Motivo quando relevante.

### 42.11 Item sensível

Oculta partes sem destruir estrutura.

### 42.12 Divisores

Sutis e opcionais.

### 42.13 Densidade

Confortável ou compacta por contexto.

### 42.14 Estados

Default, hover, focus, selected, disabled, loading.

### 42.15 Acessibilidade

Nome completo, ordem previsível e alvo suficiente.

## 43. Timeline

### 43.1 Estrutura base

Eixo temporal, grupos e eventos.

### 43.2 Linha temporal

Sutil; não domina conteúdo.

### 43.3 Marcador de evento

Forma/ícone por categoria, não cor isolada.

### 43.4 Data e horário

Grupo temporal estável.

### 43.5 Conteúdo textual

Título, resumo e metadata.

### 43.6 Mídia

Preview opcional e protegido.

### 43.7 Métricas

Valores relacionados ao evento.

### 43.8 Evento de fase

Marco distinto e descritivo.

### 43.9 Evento clínico

Discreto, claro e não diagnóstico.

### 43.10 Evento técnico

Dados e unidades visíveis.

### 43.11 Evento de IA

Origem, confiança e limitação.

### 43.12 Evento pendente

Estado visual e próxima ação.

### 43.13 Agrupamento temporal

Dia/semana/mês conforme densidade.

### 43.14 Estado vazio

Explica primeiro registro.

### 43.15 Carregamento incremental

Preserva posição.

### 43.16 Responsividade

Sequência única mobile; filtros e resumo laterais no desktop.

### 43.17 Acessibilidade

Ordem cronológica, headings e resumo textual de relações.

## 44. Painel de estatísticas

### 44.1 Estrutura

Label, valor, unidade, período e contexto.

### 44.2 Métrica principal

Uma por painel; maior ênfase.

### 44.3 Métrica secundária

Até duas, subordinadas.

### 44.4 Tendência

Direção + valor + período; não apenas seta/color.

### 44.5 Período

Sempre visível.

### 44.6 Comparação

Base explícita.

### 44.7 Dado indisponível

Placeholder textual, não zero falso.

### 44.8 Dado estimado

Marcado como estimativa.

### 44.9 Dado sensível

Ocultável pelo Modo Discreto.

### 44.10 Densidade

Poucos tamanhos e alinhamento tabular.

### 44.11 Responsividade

Empilha métricas preservando ordem.

### 44.12 Acessibilidade

Leitura completa de label, valor, unidade, tendência e período.

### 44.13 Anti-patterns

KPI sem contexto, seta verde/vermelha isolada, contadores gigantes e métricas decorativas.

## 45. Comparação de entidades

### 45.1 Comparação entre dois itens

Lado a lado em desktop; sequência emparelhada mobile.

### 45.2 Comparação entre múltiplos itens

Limite de séries/colunas; seleção controlada.

### 45.3 Critérios comparados

Mesma unidade e definição.

### 45.4 Valor de referência

Identificado separadamente.

### 45.5 Destaque de diferença

Valor absoluto/percentual + direção, sem julgamento automático.

### 45.6 Dados ausentes

“Sem dados”, nunca zero.

### 45.7 Dados não comparáveis

Explicar incompatibilidade.

### 45.8 Tabela comparativa

Preferida para precisão.

### 45.9 Visualização gráfica

Preferida para padrão e tendência.

### 45.10 Mobile

Comparação por critério, não tabela esmagada.

### 45.11 Desktop

Colunas alinhadas e cabeçalhos persistentes quando necessário.

### 45.12 Acessibilidade

Tabela semântica ou resumo equivalente.

### 45.13 Honestidade visual

Escalas iguais, sem destacar vencedor quando o domínio não define melhor.

## 46. Gráfico de série temporal

### 46.1 Estrutura

Título, resumo, plot, eixos, legenda e controles.

### 46.2 Eixo temporal

Intervalos legíveis e locale correto.

### 46.3 Eixo de valores

Unidade e domínio explícitos; zero quando necessário.

### 46.4 Grade

Sutil, somente para leitura.

### 46.5 Série única

Acento/dado principal sem competir com semântica.

### 46.6 Séries múltiplas

Paleta acessível, limite prático e interação para isolar.

### 46.7 Faixa de referência

Área translúcida + label.

### 46.8 Meta

Linha distinta, não confundida com dado.

### 46.9 Eventos sobre a série

Marcadores discretos com detalhe.

### 46.10 Períodos sem dados

Lacuna visual; não interpolar sem indicar.

### 46.11 Valores estimados

Traço/área diferente + texto.

### 46.12 Previsões

Separadas do observado e com hipótese.

### 46.13 Intervalo de confiança

Faixa, explicação e alternativa textual.

### 46.14 Tooltip

Valor, data, unidade, origem e status; acessível por teclado.

### 46.15 Zoom ou mudança de período

Controles claros e reset.

### 46.16 Visualização Grow

Parâmetros, faixas por fase e eventos de manejo.

### 46.17 Visualização Med

Sintomas/doses sem sugerir diagnóstico.

### 46.18 Visualização de IA

Evidência, confiança e limitação próximas.

### 46.19 Dark Mode

Contraste sem neon.

### 46.20 Light Mode

Cores ajustadas, não mera inversão.

### 46.21 Responsividade

Resumo e período primeiro; scroll/zoom controlado; não comprimir labels.

### 46.22 Acessibilidade

Resumo textual e tabela dos pontos-chave.

### 46.23 Anti-patterns

3D, eixo truncado enganoso, arco-íris, animação longa, linhas sem unidade e previsão igual a fato.

## 47. Galeria de mídia

### 47.1 Grade

Thumbnails com proporção estável.

### 47.2 Lista

Metadata e acessibilidade ampliadas.

### 47.3 Thumbnail

Crop consistente e indicador de sensibilidade.

### 47.4 Visualização ampliada

Foco, zoom e navegação controlados.

### 47.5 Metadados

Data, fase/contexto, autor e legenda.

### 47.6 Ordenação temporal

Padrão cronológico, reversível.

### 47.7 Seleção múltipla

Modo explícito e contador.

### 47.8 Comparação lado a lado

Somente imagens compatíveis, metadata visível.

### 47.9 Estado carregando

Skeleton de proporção.

### 47.10 Estado vazio

Explica valor do primeiro upload.

### 47.11 Estado com erro

Retry por item.

### 47.12 Conteúdo sensível

Blur/placeholder e revelação intencional.

### 47.13 Modo Discreto

Substitui thumbnails e títulos.

### 47.14 Responsividade

Grade adaptativa; viewer full-screen mobile.

### 47.15 Acessibilidade

Alt opcional, nome do arquivo/contexto e controles por teclado.

# PARTE VIII — FEEDBACK, OVERLAYS E ESTADOS

## 48. Validação inline e erro de campo

### 48.1 Mensagem auxiliar

Orientação antes do erro.

### 48.2 Mensagem de erro

Específica e acionável.

### 48.3 Mensagem de atenção

Entrada permitida com possível consequência.

### 48.4 Mensagem de sucesso

Somente quando confirmação local é útil.

### 48.5 Ícone semântico

Reforça, não substitui texto.

### 48.6 Relação com o campo

Mensagem imediatamente abaixo e semanticamente ligada.

### 48.7 Momento de exibição

Após blur, interação suficiente ou submissão; nunca acusar ao abrir sem necessidade.

### 48.8 Preservação do valor digitado

Obrigatória.

### 48.9 Acessibilidade

Erro anunciado e foco dirigido no resumo quando múltiplos.

### 48.10 Anti-patterns

Erro genérico, tooltip, limpeza do campo, cor isolada e validação agressiva a cada tecla.

## 49. Toast

### 49.1 Confirmação neutra

Ação concluída sem relevância duradoura.

### 49.2 Sucesso

Confirmação positiva breve.

### 49.3 Atenção

Condição recuperável que não exige bloqueio.

### 49.4 Erro recuperável

Erro de ação com alternativa local; erros críticos usam banner/modal/tela.

### 49.5 Ação opcional

Uma ação curta, como desfazer.

### 49.6 Duração

Tempo suficiente para leitura; erro e ação permanecem mais.

### 49.7 Empilhamento

Limitar; agrupar eventos repetidos.

### 49.8 Posicionamento

Não cobre navegação, teclado ou ação persistente.

### 49.9 Comportamento responsivo

Largura segura; mobile próximo ao fundo acima da navegação.

### 49.10 Acessibilidade

Live region adequada, sem mover foco.

### 49.11 Situações em que não deve ser usado

Consentimento, erro de campo, decisão irreversível, informação que precisa persistir.

## 50. Banner

### 50.1 Banner informativo

Mensagem persistente de contexto.

### 50.2 Banner de atenção

Ação recomendada sem bloqueio.

### 50.3 Banner crítico

Risco ou falha importante; uso restrito.

### 50.4 Banner offline

Informa salvamento local e limites.

### 50.5 Banner de sincronização

Estado atual e retry.

### 50.6 Banner de privacidade

Escopo ou exposição relevante.

### 50.7 Banner de IA

Limitação, origem agregada ou alerta contextual.

### 50.8 Banner Premium

Benefício e ação, sem impedir leitura já permitida.

### 50.9 Banner dispensável

Pode fechar e lembrar preferência quando apropriado.

### 50.10 Banner persistente

Permanece enquanto condição existir.

### 50.11 Ação

Máximo uma principal e uma secundária.

### 50.12 Responsividade

Empilha texto e ações no mobile.

### 50.13 Acessibilidade

Role/status apropriado, contraste e foco nas ações.

## 51. Modal de confirmação

### 51.1 Confirmação padrão

Ação importante com consequência clara.

### 51.2 Confirmação importante

Mudança de fase, vínculo ou compartilhamento.

### 51.3 Confirmação destrutiva

Exclusão ou perda; ação crítica explicitamente nomeada.

### 51.4 Confirmação clínica

Evita linguagem diagnóstica e mostra impacto no registro.

### 51.5 Confirmação de privacidade

Mostra o que, com quem e consequência.

### 51.6 Título

Declara a decisão.

### 51.7 Descrição

Explica consequência e reversibilidade.

### 51.8 Ações

Confirmar específica + cancelar seguro.

### 51.9 Scrim

60% referência; foco visual sem perder orientação.

### 51.10 Gerenciamento de foco

Foco inicial seguro, trap, retorno ao acionador.

### 51.11 Fechamento

Escape, cancelar e ícone quando seguro; clique fora não fecha decisões críticas.

### 51.12 Adaptação mobile

Dialog central ou bottom sheet conforme complexidade, sem perda de semântica.

### 51.13 Acessibilidade

Role dialog, título/descrição associados e teclado.

### 51.14 Anti-patterns

Modal para informação simples, ação destrutiva pré-focada, fechar ao clicar fora e texto vago.

## 52. Estado vazio

### 52.1 Primeiro uso

Explica valor e primeira ação.

### 52.2 Nenhum resultado

Relaciona-se à busca/filtros e oferece limpeza.

### 52.3 Histórico ainda vazio

Explica que dados surgirão ao registrar.

### 52.4 Conteúdo removido

Informa remoção sem detalhes indevidos.

### 52.5 Conteúdo privado

Distingue ausência de restrição.

### 52.6 Dados insuficientes

Explica requisito de análise.

### 52.7 Composição

Ícone/ilustração simples, título, descrição e ação.

### 52.8 Ilustração

Conceitual, discreta, sem personagem infantil.

### 52.9 Texto

Específico e não culpabilizante.

### 52.10 Ação principal

Somente quando o usuário pode resolver.

### 52.11 Ação secundária

Ajuda ou exploração opcional.

### 52.12 Acessibilidade

Ordem de heading e imagem decorativa corretamente tratada.

### 52.13 Anti-patterns

Tela em branco, humor inadequado, ilustração dominante e CTA impossível.

## 53. Loading

### 53.1 Loading de ação

Dentro do controle; preserva largura.

### 53.2 Loading de componente

Skeleton ou indicador local.

### 53.3 Loading de tela

Estrutura da tela ou progresso, não spinner central genérico por padrão.

### 53.4 Progresso indeterminado

Quando duração não é mensurável.

### 53.5 Progresso determinado

Quando percentual real existe.

### 53.6 Processo rápido

Evitar indicador piscando; atraso mínimo pode reduzir flicker.

### 53.7 Processo prolongado

Mensagem de etapa, possibilidade de sair e notificação posterior quando suportado.

### 53.8 Cancelamento

Disponível quando seguro.

### 53.9 Preservação de contexto

Dados existentes permanecem durante atualização.

### 53.10 Acessibilidade

Estado busy e mensagem anunciada.

### 53.11 Anti-patterns

Spinner eterno, percentuais falsos, bloquear toda a tela e apagar conteúdo durante refresh.

## 54. Skeleton

### 54.1 Skeleton de texto

Linhas com variação moderada e sem imitar conteúdo sensível.

### 54.2 Skeleton de card

Replica anatomia e dimensões.

### 54.3 Skeleton de lista

Quantidade suficiente para estabilidade.

### 54.4 Skeleton de dashboard

Preserva hierarquia, não todos os detalhes.

### 54.5 Skeleton de gráfico

Reserva título, controles e área de plot.

### 54.6 Skeleton de imagem

Mantém proporção.

### 54.7 Fidelidade estrutural

Evita layout shift.

### 54.8 Motion

Shimmer suave ou pulso; reduzido/estático com preferência.

### 54.9 Conteúdo sensível

Não revelar comprimento/natureza específica quando Modo Discreto.

### 54.10 Acessibilidade

Oculto do leitor de tela; container marcado como loading.

### 54.11 Quando não utilizar

Ações curtas, conteúdo imprevisível ou processo com progresso real.

## 55. Estado de erro de tela

### 55.1 Erro recuperável

Mensagem + retry.

### 55.2 Erro de conexão

Explica conexão e preservação local.

### 55.3 Erro de permissão

Explica autorização e caminho possível.

### 55.4 Erro de recurso inexistente

Recurso removido ou URL inválida; oferece retorno.

### 55.5 Erro de processamento

Informa que entrada foi preservada e como tentar novamente.

### 55.6 Erro de relatório

Permite reprocessar e mantém parâmetros.

### 55.7 Erro clínico sensível

Tom neutro, sem alarmismo.

### 55.8 Mensagem

Específica e humana.

### 55.9 Ação de retry

No mesmo contexto.

### 55.10 Ação alternativa

Voltar, salvar rascunho ou suporte.

### 55.11 Suporte e diagnóstico

Correlation ID apenas em área de suporte, não poluindo usuário final.

### 55.12 Acessibilidade

Heading, anúncio e foco na ação principal.

## 56. Estado offline e sincronização

### 56.1 Offline de leitura

Mostrar cache e data de atualização.

### 56.2 Offline de escrita

Salvar rascunho e informar necessidade de conexão.

### 56.3 Rascunho local

Indicador discreto e persistente.

### 56.4 Envio pendente

Status por item e fila acessível.

### 56.5 Sincronização ativa

Progresso/atividade sem bloquear.

### 56.6 Sincronização concluída

Confirmação leve.

### 56.7 Falha de sincronização

Retry por item e motivo.

### 56.8 Conflito

Comparação clara e escolha segura; nunca sobrescrever silenciosamente.

### 56.9 Conteúdo em cache

Marcado quando atualidade importa.

### 56.10 Conteúdo desatualizado

Timestamp + ação atualizar.

### 56.11 Sinalização persistente

Banner global apenas enquanto condição afetar múltiplos recursos.

### 56.12 Acessibilidade

Estados anunciados e fila navegável.

## 57. Estado sem permissão e conteúdo privado

### 57.1 Sem permissão do sistema

Câmera, fotos, localização ou notificações; explicar benefício e alternativa.

### 57.2 Sem autorização da conta

Política/RBAC; não sugerir que o recurso não existe.

### 57.3 Recurso privado

Escopo do proprietário; sem CTA enganoso.

### 57.4 Conteúdo de outro contexto

Preserva isolamento Grow/Med.

### 57.5 Consentimento necessário

Mostra finalidade e dados.

### 57.6 Consentimento revogado

Explica efeito e histórico conforme regra.

### 57.7 Ação disponível

Solicitar acesso, ajustar permissão ou voltar, quando permitido.

### 57.8 Linguagem visual

Neutra/informativa, não crítica.

### 57.9 Acessibilidade

Estado e próximo passo lidos em ordem.

# PARTE IX — COMPONENTES ESPECIALIZADOS

## 58. Card de explicabilidade da IA

### 58.1 Estrutura obrigatória

Resultado, evidência, período, confiança, limitações e ação.

### 58.2 Resultado apresentado

Conclusão em linguagem probabilística.

### 58.3 Dados utilizados

Fontes e variáveis legíveis.

### 58.4 Período analisado

Sempre visível.

### 58.5 Motivo

Padrão ou relação identificada.

### 58.6 Confiança

Termo compreensível + indicador.

### 58.7 Limitações

Próximas da interpretação.

### 58.8 Origem dos dados

Próprio histórico ou agregados.

### 58.9 Ação recomendada

Opção, nunca ordem.

### 58.10 Feedback do usuário

Útil/não útil e motivo opcional, sem manipulação.

### 58.11 Cold start

Autoridade reduzida e selo agregado.

### 58.12 Estado com dados insuficientes

Explica o que registrar.

### 58.13 Aplicação Grow

Foco em parâmetros, tendências e manejo.

### 58.14 Aplicação Med

Foco em histórico e correlação, sem diagnóstico.

### 58.15 Acessibilidade

Estrutura por headings e confiança textual.

### 58.16 Anti-patterns

Robô, glow, certeza absoluta, limitação escondida e CTA dominante sem evidência.

## 59. Indicador de confiança

### 59.1 Confiança baixa

Termo explícito e visual de baixa intensidade.

### 59.2 Confiança moderada

Indica utilidade com cautela.

### 59.3 Confiança alta

Não equivale a certeza.

### 59.4 Confiança não calculável

Exibe “não disponível” e motivo.

### 59.5 Valor textual

Obrigatório.

### 59.6 Representação visual

Barra, pontos ou nível discreto, sem velocímetro dramático.

### 59.7 Explicação acessível

Tooltip/expansão com base e limitações.

### 59.8 Uso em gráficos

Próximo à previsão/insight.

### 59.9 Uso em cards

Parte da evidência, não badge promocional.

### 59.10 Uso proibido como garantia

Nunca “100% seguro”, “certeza” ou selo de aprovação clínica.

## 60. Selo de dados agregados

### 60.1 Propósito

Distinguir dados de comunidade do histórico pessoal.

### 60.2 Cold start

Obrigatório quando personalização for limitada.

### 60.3 Localização

Próximo ao insight e à origem.

### 60.4 Texto obrigatório

“Baseado em dados agregados” ou equivalente aprovado.

### 60.5 Explicação complementar

Descreve anonimização e limite.

### 60.6 Relação com consentimento

Não implica que o usuário consentiu com uso próprio; explicar política aplicável.

### 60.7 Acessibilidade

Texto legível e não apenas ícone.

### 60.8 Anti-patterns

Omitir selo, esconder em tooltip ou tratar agregados como personalizados.

## 61. Card de alerta da IA

### 61.1 Alerta informativo

Insight sem urgência.

### 61.2 Alerta de atenção

Possível problema que requer avaliação.

### 61.3 Alerta crítico

Risco elevado com evidência; uso raro.

### 61.4 Evidência

Dados e padrão.

### 61.5 Confiança

Obrigatória.

### 61.6 Limitação

Próxima ao alerta.

### 61.7 Ação sugerida

Contextual e reversível quando possível.

### 61.8 Criação de tarefa

Pré-preenchimento revisável, nunca criação silenciosa.

### 61.9 Estado resolvido

Mantém histórico sem destaque.

### 61.10 Estado ignorado

Permite registrar decisão sem punição.

### 61.11 Aplicação Grow

Severidade baseada em risco de cultivo.

### 61.12 Aplicação Med

Severidade não substitui avaliação médica.

### 61.13 Acessibilidade

Severidade textual, foco e ação nomeada.

## 62. Matriz de privacidade granular

### 62.1 Estrutura dimensão × escopo

Linhas de dados e colunas de visibilidade.

### 62.2 Cabeçalhos

Persistentes e descritivos.

### 62.3 Linhas de dimensão

Nome + explicação quando sensível.

### 62.4 Colunas de escopo

Privado, seguidores e público são os escopos disponíveis no MVP. Link direto é Versão 2 (coluna presente na estrutura, mas oculta/desabilitada até o recurso ser habilitado — doc 02 §9.1/§18). Amigos é um escopo em Pesquisa: reservado na anatomia, sem coluna exposta ao usuário enquanto o conceito não for validado (doc 02 §9.1/§18, [Ideias Futuras](../ideias-futuras.md)).

### 62.5 Estado privado

Padrão seguro, neutro.

### 62.6 Estado seguidores

Escopo de contexto, não conta global.

### 62.7 Estado por link

Explica que qualquer pessoa com link pode acessar, conforme regra. Escopo de Versão 2 — não disponível no MVP (doc 02 §18).

### 62.8 Estado público

Maior exposição, sem destaque manipulativo.

### 62.9 Presets

Configurações rápidas com resumo.

### 62.10 Personalização

Acesso a cada dimensão.

### 62.11 Mudança em massa

Mostra impacto e quantidade.

### 62.12 Confirmação

Necessária ao ampliar exposição sensível.

### 62.13 Consequências visíveis

Resumo antes de salvar.

### 62.14 Mobile

Lista por dimensão com seletor; evitar tabela comprimida.

### 62.15 Desktop

Grade comparável com cabeçalhos fixos.

### 62.16 Acessibilidade

Tabela/fieldset semântico, teclado e estado anunciado.

### 62.17 Anti-patterns

Público pré-destacado, cadeado sem texto, cores de erro e mudanças silenciosas.

## 63. Seletor de escopo de visibilidade

### 63.1 Privado

Somente usuário.

### 63.2 Seguidores

Perfis do mesmo contexto autorizados.

### 63.3 Por link

Acesso por link conforme política. Escopo de Versão 2 — oculto/desabilitado até o recurso ser habilitado (doc 02 §18); não exibir como opção selecionável no MVP.

### 63.4 Público

Descoberta ampla no contexto.

### 63.5 Estado atual

Sempre visível antes de publicar.

### 63.6 Descrição do impacto

Quem verá e onde.

### 63.7 Confirmação de exposição

Ao ampliar para link/público em conteúdo sensível.

### 63.8 Aplicação Grow

Dimensões técnicas e localização podem variar.

### 63.9 Aplicação Med

Privacidade reforçada e anonimato.

### 63.10 Acessibilidade

Opções com descrição e estado selecionado.

## 64. Selo de vínculo de perfis

### 64.1 Estado sem vínculo

Nenhum sinal visual.

### 64.2 Vínculo unilateral

Exibido somente no perfil autorizado.

### 64.3 Vínculo bilateral

Exibido em ambos.

### 64.4 Identidade de contexto

Nome e acento do outro contexto sem revelar dados adicionais.

### 64.5 Reversibilidade

Ação de remover disponível nas configurações.

### 64.6 Discrição visual

Baixa ênfase; nunca badge de reputação.

### 64.7 Acessibilidade

Texto descreve o vínculo e escopo.

### 64.8 Anti-patterns

Inferir vínculo, exibir automaticamente ou usar como prova de identidade real.

## 65. Indicador de Modo Discreto

### 65.1 Estado ativo

Indicador persistente e neutro.

### 65.2 Estado inativo

Não ocupa espaço permanente.

### 65.3 Presença persistente

Cabeçalho/configuração, sem revelar conteúdo.

### 65.4 Conteúdo ocultado

Placeholder estrutural neutro.

### 65.5 Conteúdo revelado temporariamente

Ação intencional, tempo/saída clara.

### 65.6 Notificações

Labels neutros e previews protegidos.

### 65.7 App switcher

Miniatura protegida quando plataforma permitir.

### 65.8 Capturas e compartilhamento

Aviso/ocultação conforme suporte, nunca promessa técnica impossível.

### 65.9 Acessibilidade

Estado anunciado sem expor o dado.

### 65.10 Anti-patterns

Ícone chamativo, revelar categoria pelo placeholder, esconder navegação ou prometer proteção total fora do controle do app.

## 66. Paywall e upsell

### 66.1 Propósito

Explicar valor e condição de acesso.

### 66.2 Valor antes do bloqueio

Usuário entende benefício e contexto.

### 66.3 Contexto da funcionalidade

Nome e resultado da função bloqueada.

### 66.4 Benefício principal

Um benefício concreto, não slogan.

### 66.5 Benefícios secundários

Lista curta e verificável.

### 66.6 Ação de assinatura

Clara, com preço e período antes da confirmação.

### 66.7 Ação de retorno

Visível e sem culpa.

### 66.8 Restauração de compra

Disponível quando aplicável.

### 66.9 Aplicação de cupom

Secundária, sem dominar.

### 66.10 Estado de processamento

Evita duplo pagamento.

### 66.11 Estado de sucesso

Confirma plano e acesso.

### 66.12 Estado de erro

Preserva escolha e oferece retry.

### 66.13 Persuasão ética

Sem contagem regressiva falsa, vergonha ou opção escondida.

### 66.14 Dark Mode

Premium discreto sem glow.

### 66.15 Light Mode

Bronze/champanhe contrastado e sóbrio.

### 66.16 Responsividade

Sequência linear mobile; comparação mais ampla desktop.

### 66.17 Acessibilidade

Preço, recorrência, cancelamento e ações legíveis.

### 66.18 Anti-patterns

Bloqueio opaco, falso desconto, botão cancelar invisível, cor dourada excessiva e acesso prometido sem contexto.

## 67. Badge de categoria Premium

### 67.1 IA

Categoria de funcionalidades analíticas.

### 67.2 Produtividade

Recursos de eficiência.

### 67.3 Relatórios

Exportação e profundidade.

### 67.4 Automação

Ações automáticas.

### 67.5 Comunidade

Recursos sociais Premium.

### 67.6 Personalização

Preferências avançadas.

### 67.7 Armazenamento

Capacidade e histórico.

### 67.8 Profissional

Uso avançado/profissional.

### 67.9 Cor Premium

Champanhe/bronze discreto.

### 67.10 Relação com cores semânticas

Nunca substitui warning/critical/success.

### 67.11 Acessibilidade

Texto obrigatório e contraste.

## 68. Comparador Free versus Premium

### 68.1 Estrutura

Categorias e capacidades alinhadas.

### 68.2 Categorias

Agrupamento consistente.

### 68.3 Funcionalidade disponível

Texto claro + marcador.

### 68.4 Funcionalidade limitada

Limite quantificado.

### 68.5 Funcionalidade indisponível

Não usar apenas “X”; explicar quando necessário.

### 68.6 Comparação mobile

Lista por categoria e plano atual fixo no contexto.

### 68.7 Comparação desktop

Tabela com cabeçalhos e leitura por coluna.

### 68.8 Destaque do plano atual

Neutro e claro.

### 68.9 Ação

Assinar ou gerenciar plano.

### 68.10 Acessibilidade

Tabela semântica e equivalência textual.

### 68.11 Anti-patterns

Recursos vagos, checkmarks sem label, esconder limites e destacar Premium por contraste agressivo.

# PARTE X — PADRÕES DE COMPOSIÇÃO

## 69. Padrão de formulário

### 69.1 Formulário curto

Uma sequência, sem cards desnecessários.

### 69.2 Formulário longo

Seções e salvamento previsível.

### 69.3 Formulário em etapas

Wizard apenas quando dependências e esforço justificam.

### 69.4 Formulário com complexidade progressiva

Campos avançados revelados na mesma estrutura.

### 69.5 Seções

Títulos descritivos e spacing maior entre grupos.

### 69.6 Campos obrigatórios e opcionais

Regra uniforme.

### 69.7 Ações principais

Uma primária; cancelar/voltar secundários.

### 69.8 Salvamento

Explícito ou autosave claramente indicado.

### 69.9 Rascunho local

Status visível em offline.

### 69.10 Validação

Inline + resumo quando múltiplos.

### 69.11 Resumo de erro

Links para campos e foco.

### 69.12 Mobile

Uma coluna e teclado adequado.

### 69.13 Desktop

Largura máxima; múltiplas colunas apenas para dados relacionados.

### 69.14 Acessibilidade

Fieldsets, labels, foco e anúncios.

### 69.15 Anti-patterns

Formulário inteiro em cards, labels flutuantes como única referência, ações distantes e erro só no topo.

## 70. Padrão de listagem

### 70.1 Cabeçalho

Título, contagem e ação.

### 70.2 Busca

Quando volume justificar.

### 70.3 Filtros

Persistência e resumo.

### 70.4 Ordenação

Critério atual visível.

### 70.5 Lista

Itens consistentes.

### 70.6 Grid responsivo

Somente cards que se beneficiam de visão paralela.

### 70.7 Paginação

Conforme tarefa.

### 70.8 Estado vazio

Contextual.

### 70.9 Loading

Skeleton fiel.

### 70.10 Erro

Retry local.

### 70.11 Ação de criação

Visível sem competir com conteúdo.

### 70.12 Seleção múltipla

Modo explícito.

### 70.13 Acessibilidade

Heading, contagem e estados anunciados.

## 71. Padrão de detalhe de entidade

### 71.1 Identidade

Título, tipo e imagem opcional.

### 71.2 Status

Até dois sinais prioritários.

### 71.3 Ações

Uma primária e menu secundário.

### 71.4 Resumo

Informação essencial.

### 71.5 Métricas

Contextualizadas.

### 71.6 Timeline

Histórico cronológico.

### 71.7 Mídia

Galeria associada.

### 71.8 Dados relacionados

Cards/listas, não aninhamento excessivo.

### 71.9 IA

Card de explicabilidade.

### 71.10 Privacidade

Escopo visível.

### 71.11 Premium

Bloqueio contextual.

### 71.12 Responsividade

Sequência mobile; colunas secundárias desktop.

### 71.13 Acessibilidade

Headings e landmarks.

## 72. Padrão de dashboard

### 72.1 Hierarquia principal

Contexto, atenção, ação, progresso e exploração.

### 72.2 Ação prioritária

Uma ação do dia.

### 72.3 Resumo do dia

Informação operacional.

### 72.4 Entidades ativas

Cards compactos.

### 72.5 Tarefas

Ordenadas por prioridade real.

### 72.6 Alertas

Severidade proporcional.

### 72.7 Métricas

Poucas e contextualizadas.

### 72.8 Conteúdo secundário

Depois das necessidades imediatas.

### 72.9 Dashboard Grow

Ciclos, fases, tarefas, condições e alertas.

### 72.10 Dashboard Med

Tratamento, check-in, doses, evolução e pendências.

### 72.11 Dashboard Core

Conta, acesso, privacidade e assinatura.

### 72.12 Mobile

Sequência prioritária.

### 72.13 Tablet

Duas colunas controladas.

### 72.14 Desktop

Narrativa vertical com paralelismo útil.

### 72.15 Estados

Vazio, loading, erro, offline e bloqueado.

### 72.16 Acessibilidade

Ordem de leitura igual à prioridade.

### 72.17 Anti-patterns

Mosaico, KPI sem contexto, card soup e gráfico em todo bloco.

## 73. Padrão de timeline

### 73.1 Timeline Grow

Fases, manejo, parâmetros, fotos, colheita.

### 73.2 Timeline Med

Dose, check-in, sintomas, efeitos e tratamento.

### 73.3 Filtros temporais

Período e categoria.

### 73.4 Agrupamento

Dia/semana/mês.

### 73.5 Inserção de eventos

Ação contextual.

### 73.6 Mídia

Preview protegido.

### 73.7 Métricas

Associadas ao evento.

### 73.8 Eventos da IA

Origem e confiança.

### 73.9 Estados

Vazio, loading, erro e privado.

### 73.10 Responsividade

Uma coluna mobile.

### 73.11 Acessibilidade

Sequência cronológica e headings.

## 74. Padrão analítico e de relatório

### 74.1 Resumo executivo

Principais fatos sem interpretação excessiva.

### 74.2 Período analisado

Sempre visível.

### 74.3 Métricas principais

Definidas e contextualizadas.

### 74.4 Gráficos

Poucos e adequados.

### 74.5 Comparações

Mesmas bases.

### 74.6 Explicabilidade

Para IA e correlações.

### 74.7 Limitações

Próximas às conclusões.

### 74.8 Dados ausentes

Declarados.

### 74.9 Exportação

Estado, formato e privacidade.

### 74.10 Relatório Grow

Técnico e comparável.

### 74.11 Relatório Med

Clínico, legível e não diagnóstico.

### 74.12 Visualização em tela

Interativa e responsiva.

### 74.13 Documento exportado

Marca, data, escopo e leitura independente.

### 74.14 Acessibilidade

Resumo textual, tabela e ordem lógica.

## 75. Padrão de configuração

### 75.1 Agrupamento de preferências

Por finalidade.

### 75.2 Item de configuração

Título, descrição e controle/valor.

### 75.3 Configuração com switch

Efeito imediato e reversível.

### 75.4 Configuração com seletor

Opções em tela secundária ou inline.

### 75.5 Configuração destrutiva

Seção separada e confirmação.

### 75.6 Privacidade

Consequência visível.

### 75.7 Notificações

Canais e contexto.

### 75.8 Modo Discreto

Estado e proteção.

### 75.9 Assinatura

Plano, cobrança e gestão.

### 75.10 Responsividade

Lista mobile; painel detalhado desktop.

### 75.11 Acessibilidade

Labels, estado e descrições.

## 76. Padrão de onboarding e wizard

### 76.1 Estrutura

Passos claros e curtos.

### 76.2 Progresso

Posição e total quando útil.

### 76.3 Título e instrução

Uma decisão por passo.

### 76.4 Conteúdo principal

Campos/seleção focados.

### 76.5 Ação primária

Continuar/Concluir.

### 76.6 Ação secundária

Voltar ou pular quando permitido.

### 76.7 Voltar

Preserva dados.

### 76.8 Pular quando permitido

Sem penalidade oculta.

### 76.9 Salvamento de progresso

Automático e indicado em fluxos longos.

### 76.10 Erro

Local e recuperável.

### 76.11 Responsividade

Uma coluna e ação segura.

### 76.12 Acessibilidade

Progresso anunciado, foco no heading e labels.

## 77. Padrão de Comunidade

### 77.1 Perfil público

Identidade contextual.

### 77.2 Card social

Conteúdo antes de métricas.

### 77.3 Publicação

Autor, contexto, escopo, conteúdo e ações.

### 77.4 Mídia

Proteção e metadata.

### 77.5 Metadados

Data, categoria e origem.

### 77.6 Privacidade

Sempre visível ao publicar.

### 77.7 Interações

Leves e secundárias.

### 77.8 Comentários

Hierarquia simples e moderação.

### 77.9 Reputação

Critério explícito, não popularidade pura.

### 77.10 Fork Grow

Origem e autoria preservadas.

### 77.11 Anonimato Med

Perfil completo mesmo sem nome/avatar.

### 77.12 Moderação

Denunciar, bloquear, remover e explicar.

### 77.13 Estados

Privado, sensível, removido e loading.

### 77.14 Responsividade

Feed linear mobile; colunas auxiliares desktop.

### 77.15 Acessibilidade

Headings, ações nomeadas e conteúdo protegido anunciado.

## 78. Padrão de conteúdo bloqueado

### 78.1 Bloqueio Premium

Valor + plano.

### 78.2 Bloqueio por permissão

Política + alternativa.

### 78.3 Bloqueio por privacidade

Escopo do proprietário.

### 78.4 Bloqueio por consentimento

Finalidade e escolha.

### 78.5 Bloqueio por contexto

Isolamento Grow/Med.

### 78.6 Valor preservado

Mostrar o que a função faz sem revelar dado protegido.

### 78.7 Ação disponível

Assinar, solicitar, consentir ou voltar.

### 78.8 Persuasão ética

Sem pressão ou vergonha.

### 78.9 Acessibilidade

Motivo, estado e ação em ordem.

# PARTE XI — MATRIZES DE CONFORMIDADE

## 79. Matriz de cobertura dos componentes

### 79.1 Componentes exigidos pelo Design System

Todos os itens do documento 11 estão representados.

### 79.2 Componentes derivados da Visual Language

Navegação, cards, dashboards, listas, gráficos, estados, Premium, IA e privacidade possuem especificação.

### 79.3 Componentes necessários para os fluxos

Formulários, feedback, mídia, timeline, relatórios e estados cobrem os arquétipos do documento 10.

### 79.4 Componentes compartilhados

A biblioteca é única.

### 79.5 Componentes especializados

Especialização ocorre por função transversal, não por app.

### 79.6 Componentes fora de escopo

Editor rico, mapas avançados, videoconferência e recursos não aprovados.

### 79.7 Lacunas identificadas

Qualquer lacuna vira proposta; não solução local.

### 79.8 Critério para inclusão futura

Recorrência, necessidade comprovada, composição insuficiente e compatibilidade sistêmica.

| Família | Componentes oficiais | Cobertura |

| --- | --- | --- |

| Fundações | Temas, cor, tipografia, spacing, grid, geometria, borda, elevação, opacidade, ícone, motion | Completa |

| Controles | Botão, link, texto, número, seletores, escala, data/hora, busca/filtros, upload | Completa |

| Navegação | Primária, topo, tabs, voltar/breadcrumb, paginação | Completa |

| Conteúdo | Badge, card, lista, timeline, estatística, comparação, gráfico, galeria | Completa |

| Feedback | Validação, toast, banner, modal, vazio, loading, skeleton, erro, offline, permissão | Completa |

| Especializados | IA, confiança, agregados, alertas, privacidade, vínculo, discreto, paywall, Premium | Completa |



## 80. Matriz Core × Grow × Med

### 80.1 Componentes idênticos

Anatomia, estados, spacing, tipografia, geometria, motion e acessibilidade.

### 80.2 Componentes parametrizados por Accent Token

Ações primárias, seleção, navegação ativa e foco contextual.

### 80.3 Conteúdo específico por contexto

Labels, entidades, unidades, tom e imagem.

### 80.4 Diferenças permitidas

Acento, temperatura editorial, fotografia e densidade calibrada.

### 80.5 Diferenças proibidas

Componentes duplicados, radius próprio, shadows próprias, navegação incompatível e semântica cromática distinta.

### 80.6 Validação de futuros módulos

Novo acento + testes; reutilização integral.

| Dimensão | Core | Grow | Med |

| --- | --- | --- | --- |

| Acento | Violeta-cosmos | Verde-teal técnico | Índigo clínico |

| Estrutura | Compartilhada | Compartilhada | Compartilhada |

| Densidade | Neutra | Pode ser compacta em dados | Confortável por padrão |

| Fotografia | Institucional | Cultivo real/técnico | Cuidado real/discreto |

| Semântica | Igual | Igual | Igual |



## 81. Matriz Dark × Light

### 81.1 Equivalência funcional

Todos os componentes e estados existem em ambos.

### 81.2 Equivalência hierárquica

A prioridade visual permanece.

### 81.3 Contraste

Todos os pares testados.

### 81.4 Superfícies

Dark por clareamento; Light por fundo/borda/sombra.

### 81.5 Elevação

Renderização própria por tema.

### 81.6 Estados

Semântica preservada com valores ajustados.

### 81.7 Gráficos

Paletas específicas por tema.

### 81.8 Imagens

Tratamento não deve perder legibilidade do overlay.

### 81.9 Critérios de aprovação

Nenhum tema pode ser considerado derivado ou incompleto.

## 82. Matriz mobile × tablet × desktop

### 82.1 Dimensão

Alvos preservados; larguras adaptam.

### 82.2 Posição

Fluxo linear mobile; paralelismo em telas amplas.

### 82.3 Reflow

Ordem semântica preservada.

### 82.4 Densidade

Confortável mobile, calibrada desktop.

### 82.5 Navegação

Bottom nav para sidebar.

### 82.6 Dados

Resumo primeiro; detalhes expandem.

### 82.7 Overlays

Sheet mobile, popover/modal desktop quando adequado.

### 82.8 Teclado

Virtual e físico suportados.

### 82.9 Critérios de aprovação

Sem ocultar função, unidade, estado ou ação essencial.

## 83. Matriz de estados por componente

### 83.1 Estado obrigatório

Default, focus visible, disabled quando aplicável e loading para ações assíncronas.

### 83.2 Estado opcional

Hover em pointer, success/warning/error conforme semântica.

### 83.3 Estado não aplicável

Não criar estado por completude artificial.

### 83.4 Estados simultâneos

Prioridade documentada; ex.: selected + focus.

### 83.5 Prioridade visual

Segurança, erro, foco, seleção, hover.

### 83.6 Critérios de completude

Matriz de cada componente preenchida e testada.

| Componente | Default | Hover | Focus | Active | Disabled | Loading | Error | Selected |

| --- | --- | --- | --- | --- | --- | --- | --- | --- |

| Botão | Obrig. | Pointer | Obrig. | Obrig. | Obrig. | Assíncrono | Quando ação falha | N/A |

| Input | Obrig. | Pointer | Obrig. | N/A | Obrig. | Raro | Obrig. | N/A |

| Card clicável | Obrig. | Pointer | Obrig. | Obrig. | Quando aplicável | Dados | Dados | Quando seleção |

| Tabs | Obrig. | Pointer | Obrig. | Obrig. | Raro | N/A | N/A | Obrig. |

| Upload | Obrig. | Pointer | Obrig. | Obrig. | Quando aplicável | Obrig. | Obrig. | Quando múltiplo |



## 84. Matriz de acessibilidade

### 84.1 Contraste

AA nos dois temas e estados.

### 84.2 Teclado

Operação completa e foco lógico.

### 84.3 Leitor de tela

Nome, papel, estado e valor.

### 84.4 Texto ampliado

Sem perda até limites de plataforma.

### 84.5 Alvos de interação

44×44 toque.

### 84.6 Redução de movimento

Alternativa instantânea.

### 84.7 Conteúdo não dependente de cor

Sinal redundante.

### 84.8 Visualização de dados

Resumo/tabela e navegação.

### 84.9 Critérios de reprovação

Qualquer falha essencial impede publicação.

# PARTE XII — GOVERNANÇA E QUALIDADE

## 85. Critérios de criação de novos componentes

### 85.1 Problema comprovado

Evidência de uso e fricção.

### 85.2 Inexistência de solução por composição

Documentar tentativas.

### 85.3 Uso recorrente

Mais de um contexto ou alta frequência justificada.

### 85.4 Aplicabilidade transversal

Preferencialmente plataforma inteira.

### 85.5 Compatibilidade com Core, Grow e Med

Sem divergência estrutural.

### 85.6 Compatibilidade com temas

Dark/Light desde a proposta.

### 85.7 Compatibilidade responsiva

Mobile, tablet e desktop.

### 85.8 Acessibilidade

Critérios e testes.

### 85.9 Custo sistêmico

Manutenção, documentação e QA.

### 85.10 Aprovação necessária

Design System owner + Produto + Engenharia quando aplicável.

### 85.11 Proibição de componentes locais não documentados

Experimentos devem usar status experimental e prazo.

## 86. Processo de alteração

### 86.1 Correção visual

Sem mudança semântica; patch.

### 86.2 Nova variante

Exige necessidade funcional distinta.

### 86.3 Novo estado

Exige evento/condição real.

### 86.4 Novo tamanho

Exige contexto que tamanhos existentes não cobrem.

### 86.5 Nova propriedade

Deve representar intenção, não detalhe visual.

### 86.6 Mudança estrutural

Análise de impacto e migração.

### 86.7 Mudança incompatível

Versão major e plano de transição.

### 86.8 Registro de justificativa

Problema, decisão, alternativas e evidência.

### 86.9 Avaliação de impacto

Design, código, QA, acessibilidade e conteúdo.

### 86.10 Aprovação

Responsáveis formais.

### 86.11 Comunicação da mudança

Changelog e aviso aos consumidores.

## 87. Versionamento e depreciação

### 87.1 Versão do UI Kit

SemVer conceitual: major, minor, patch.

### 87.2 Versão do componente

Registrada quando muda contrato.

### 87.3 Mudança compatível

Correção/adição sem quebrar uso.

### 87.4 Mudança incompatível

Anatomia, semântica ou propriedade removida.

### 87.5 Estado experimental

Uso limitado, métrica e prazo.

### 87.6 Estado estável

Aprovado e suportado.

### 87.7 Estado depreciado

Não usar em novas telas.

### 87.8 Prazo de migração

Definido com responsáveis.

### 87.9 Remoção

Somente após auditoria de consumo.

### 87.10 Histórico

Changelog permanente com motivo.

## 88. Processo de exceção

### 88.1 Solicitação

Problema e contexto.

### 88.2 Justificativa

Por que o padrão falha.

### 88.3 Evidência

Teste, dado ou requisito.

### 88.4 Impacto sistêmico

Risco de fragmentação.

### 88.5 Alternativas avaliadas

Composição e ajustes existentes.

### 88.6 Aprovação temporária

Prazo e escopo.

### 88.7 Data de revisão

Obrigatória.

### 88.8 Incorporação ao sistema

Quando recorrente e validada.

### 88.9 Revogação

Retorno ao padrão.

### 88.10 Exceções proibidas

Preferência estética, prazo curto, “só nesta tela” e limitações não verificadas.

## 89. Auditoria de consistência

### 89.1 Auditoria visual

Cor, tipografia, spacing, geometria e elevação.

### 89.2 Auditoria de estados

Cobertura e prioridade.

### 89.3 Auditoria responsiva

Breakpoints, zoom e orientação.

### 89.4 Auditoria de tema

Paridade Dark/Light.

### 89.5 Auditoria de acessibilidade

Automática e manual.

### 89.6 Auditoria de conteúdo

Labels, erros e i18n.

### 89.7 Auditoria de contexto

Core/Grow/Med sem duplicação.

### 89.8 Auditoria de duplicação

Componentes similares e variantes cosméticas.

### 89.9 Auditoria de componentes locais

Detecção e migração.

### 89.10 Frequência da auditoria

A cada release major, trimestre e antes de novos módulos.

## 90. Checklist de aprovação de componente

### 90.1 Necessidade

Deve estar documentado, testado e aprovado. Qualquer item não aplicável precisa de justificativa, não pode ficar em branco.

### 90.2 Anatomia

Deve estar documentado, testado e aprovado. Qualquer item não aplicável precisa de justificativa, não pode ficar em branco.

### 90.3 Variantes

Deve estar documentado, testado e aprovado. Qualquer item não aplicável precisa de justificativa, não pode ficar em branco.

### 90.4 Estados

Deve estar documentado, testado e aprovado. Qualquer item não aplicável precisa de justificativa, não pode ficar em branco.

### 90.5 Temas

Deve estar documentado, testado e aprovado. Qualquer item não aplicável precisa de justificativa, não pode ficar em branco.

### 90.6 Contextos

Deve estar documentado, testado e aprovado. Qualquer item não aplicável precisa de justificativa, não pode ficar em branco.

### 90.7 Responsividade

Deve estar documentado, testado e aprovado. Qualquer item não aplicável precisa de justificativa, não pode ficar em branco.

### 90.8 Acessibilidade

Deve estar documentado, testado e aprovado. Qualquer item não aplicável precisa de justificativa, não pode ficar em branco.

### 90.9 Internacionalização

Deve estar documentado, testado e aprovado. Qualquer item não aplicável precisa de justificativa, não pode ficar em branco.

### 90.10 Conteúdo

Deve estar documentado, testado e aprovado. Qualquer item não aplicável precisa de justificativa, não pode ficar em branco.

### 90.11 Motion

Deve estar documentado, testado e aprovado. Qualquer item não aplicável precisa de justificativa, não pode ficar em branco.

### 90.12 Privacidade

Deve estar documentado, testado e aprovado. Qualquer item não aplicável precisa de justificativa, não pode ficar em branco.

### 90.13 IA, quando aplicável

Deve estar documentado, testado e aprovado. Qualquer item não aplicável precisa de justificativa, não pode ficar em branco.

### 90.14 Premium, quando aplicável

Deve estar documentado, testado e aprovado. Qualquer item não aplicável precisa de justificativa, não pode ficar em branco.

### 90.15 Anti-patterns

Deve estar documentado, testado e aprovado. Qualquer item não aplicável precisa de justificativa, não pode ficar em branco.

### 90.16 Critérios de aceitação

Deve estar documentado, testado e aprovado. Qualquer item não aplicável precisa de justificativa, não pode ficar em branco.

### 90.17 Aprovação final

Deve estar documentado, testado e aprovado. Qualquer item não aplicável precisa de justificativa, não pode ficar em branco.

## 91. Checklist de aprovação de futuras telas

### 91.1 Uso exclusivo de componentes aprovados

Critério obrigatório. A tela deve demonstrar conformidade ou registrar exceção aprovada antes do handoff.

### 91.2 Hierarquia visual

Critério obrigatório. A tela deve demonstrar conformidade ou registrar exceção aprovada antes do handoff.

### 91.3 Contexto correto

Critério obrigatório. A tela deve demonstrar conformidade ou registrar exceção aprovada antes do handoff.

### 91.4 Tema correto

Critério obrigatório. A tela deve demonstrar conformidade ou registrar exceção aprovada antes do handoff.

### 91.5 Espaçamento

Critério obrigatório. A tela deve demonstrar conformidade ou registrar exceção aprovada antes do handoff.

### 91.6 Tipografia

Critério obrigatório. A tela deve demonstrar conformidade ou registrar exceção aprovada antes do handoff.

### 91.7 Cor

Critério obrigatório. A tela deve demonstrar conformidade ou registrar exceção aprovada antes do handoff.

### 91.8 Estados

Critério obrigatório. A tela deve demonstrar conformidade ou registrar exceção aprovada antes do handoff.

### 91.9 Feedback

Critério obrigatório. A tela deve demonstrar conformidade ou registrar exceção aprovada antes do handoff.

### 91.10 Responsividade

Critério obrigatório. A tela deve demonstrar conformidade ou registrar exceção aprovada antes do handoff.

### 91.11 Acessibilidade

Critério obrigatório. A tela deve demonstrar conformidade ou registrar exceção aprovada antes do handoff.

### 91.12 Privacidade

Critério obrigatório. A tela deve demonstrar conformidade ou registrar exceção aprovada antes do handoff.

### 91.13 Conteúdo sensível

Critério obrigatório. A tela deve demonstrar conformidade ou registrar exceção aprovada antes do handoff.

### 91.14 IA explicável

Critério obrigatório. A tela deve demonstrar conformidade ou registrar exceção aprovada antes do handoff.

### 91.15 Premium ético

Critério obrigatório. A tela deve demonstrar conformidade ou registrar exceção aprovada antes do handoff.

### 91.16 Internacionalização

Critério obrigatório. A tela deve demonstrar conformidade ou registrar exceção aprovada antes do handoff.

### 91.17 Ausência de componentes locais

Critério obrigatório. A tela deve demonstrar conformidade ou registrar exceção aprovada antes do handoff.

### 91.18 Ausência de exceções não documentadas

Critério obrigatório. A tela deve demonstrar conformidade ou registrar exceção aprovada antes do handoff.

### 91.19 Aprovação constitucional

Critério obrigatório. A tela deve demonstrar conformidade ou registrar exceção aprovada antes do handoff.

## 92. Decisões consolidadas

### 92.1 Decisões permanentes

1. Uma única biblioteca para Core, Grow, Med e futuros módulos.
2. Dark e Light têm paridade.
3. Inter é a tipografia candidata inicial (sujeita a validação formal, doc 11 §4).
4. Escalas de cor, spacing, radius, motion e grid seguem documentos 11 e 01.
5. Identidade, semântica, Premium, IA e dados são camadas cromáticas separadas.
6. Todos os componentes possuem foco visível e suporte a teclado/leitor de tela.
7. Mobile-first define a estrutura.
8. Nenhuma informação essencial depende apenas de cor.
9. Nenhum componente local não documentado é permitido.
10. Privacidade e Modo Discreto são estados transversais de primeira classe.

### 92.2 Decisões dependentes de validação

- valores cromáticos após testes de percepção e contraste;
- biblioteca iconográfica final;
- nível de densidade por perfil e dispositivo;
- expressão técnica do Modo Discreto por plataforma;
- visualização de confiança e incerteza com usuários reais.

### 92.3 Decisões experimentais

Somente componentes explicitamente marcados como experimentais em versões futuras. Esta versão não autoriza experimentos locais.

### 92.4 Exceções aprovadas

Nenhuma exceção permanente registrada na versão 1.0.

### 92.5 Questões em aberto

- definição da biblioteca de ícones após validação de cobertura e licença;
- formalização dos tokens semânticos intermediários na implementação;
- teste com usuários de densidade e escalas de intensidade;
- validação de relatórios Med com profissionais de saúde.

### 92.6 Histórico de alterações

| Versão | Data | Mudança | Justificativa |

| --- | --- | --- | --- |

| 1.0 | 2026-07-12 | Criação do UI Kit oficial | Transformar os documentos 11 e 01 em especificação de componentes e padrões. |



## 93. Encerramento

### 93.1 Papel do UI Kit na longevidade da plataforma

O UI Kit impede que crescimento funcional produza fragmentação visual. Ele deve evoluir por evidência e governança, não por acúmulo de exceções.

### 93.2 Compromisso com consistência

Consistência significa que padrões equivalentes parecem e se comportam de forma equivalente, mesmo quando conteúdo e contexto mudam.

### 93.3 Compromisso com acessibilidade

Nenhum ganho estético justifica excluir pessoas ou ocultar estado, consequência ou conteúdo essencial.

### 93.4 Compromisso com escalabilidade

A biblioteca deve suportar novos módulos por parametrização e composição, sem sistemas paralelos.

### 93.5 Condição para início da Biblioteca de Componentes

A implementação pode iniciar após aprovação deste documento, definição operacional dos tokens e priorização dos componentes fundacionais.

### 93.6 Condição para criação de templates

Templates só devem ser criados depois que fundações, controles, navegação, feedback e conteúdo base estiverem estáveis.

### 93.7 Condição para criação das telas finais

Telas finais devem usar templates e componentes aprovados, cobrir todos os estados relevantes e passar pelos checklists 90 e 91.

# ANEXO A — Ordem recomendada de produção do UI Kit

1. Fundações e tokens aplicados.
2. Texto, ícone, imagem e separadores.
3. Botões, campos, seletores, data/hora e busca.
4. Navegação primária, topo, tabs e retorno.
5. Validação, toast, banner, modal, loading, skeleton e erros.
6. Cards, listas, timeline, estatísticas, comparação, gráficos e galeria.
7. Offline, sincronização, permissões e privacidade.
8. IA e Premium.
9. Padrões de composição.
10. Matrizes, testes e auditoria.

**Justificativa:** a ordem segue dependências. Componentes complexos não devem ser produzidos antes das primitivas e dos estados que os sustentam.

# ANEXO B — Regra de rastreabilidade

Cada componente no arquivo visual e na implementação deve registrar: nome oficial, versão, tokens consumidos, estados suportados, contextos permitidos, status de acessibilidade, link para esta especificação e histórico de alteração. Essa rastreabilidade permite auditoria e reduz divergência entre design e produto.

# ANEXO C — Especificações dimensionais oficiais

Este anexo consolida dimensões visuais de referência para produção do UI Kit. Os valores derivam da escala de 4px do documento 11, do alvo mínimo de toque de 44×44px e dos princípios de densidade do documento 01. Eles são oficiais até que testes de acessibilidade, plataforma ou usabilidade aprovem uma revisão.

## C.1 Princípios dimensionais

1. A dimensão visual de um elemento pode ser menor que 44px apenas quando sua área interativa invisível completar pelo menos 44×44px sem sobrepor outro alvo.
2. Altura não deve ser usada como único indicador de hierarquia. Cor, peso tipográfico e posição mantêm a prioridade.
3. Componentes não devem mudar de altura entre estados como loading, erro ou sucesso.
4. O texto ampliado pode aumentar a altura de um componente. A dimensão mínima nunca deve funcionar como altura máxima.
5. Valores de padding pertencem ao componente; margens entre componentes pertencem ao padrão de composição.

## C.2 Botões

| Tamanho | Altura visual mínima | Padding horizontal | Gap ícone–texto | Ícone | Uso |
| --- | ---: | ---: | ---: | ---: | --- |
| Pequeno | 36px, com alvo de 44px | 12px | 8px | 16px | Tabelas e densidade compacta em desktop |
| Médio | 44px | 16px | 8px | 20px | Padrão da plataforma |
| Grande | 52px | 20px | 8px | 24px | Ação de foco único, onboarding e mobile |
| Somente ícone | 44×44px | — | — | 20–24px | Ações inequívocas |

**Regras adicionais:**

- raio: `radius.md` como padrão; `radius.sm` apenas no tamanho pequeno;
- label: uma linha sempre que possível;
- largura mínima deve acomodar o label sem parecer chip;
- spinner de loading ocupa o slot do ícone ou antecede o label, sem alterar largura;
- dois botões lado a lado no mobile só são permitidos quando ambos mantiverem pelo menos 44px de altura e labels legíveis.

## C.3 Campos de entrada

| Elemento | Dimensão oficial |
| --- | --- |
| Altura compacta | 44px |
| Altura padrão | 48px |
| Altura confortável | 56px, para onboarding ou entrada de foco único |
| Padding horizontal | 12–16px |
| Label–campo | 8px |
| Campo–texto auxiliar | 4px |
| Texto auxiliar–próximo campo | 16px |
| Borda | 1px visual |
| Focus ring | 2px, com afastamento visual suficiente para não se confundir com a borda |
| Textarea mínima | 96px |
| Ícone de campo | 20px |

A altura confortável não cria um segundo sistema de formulário. É uma opção de densidade para contexto de foco único. O mesmo campo preserva anatomia, estados e tipografia.

## C.4 Seletores

| Componente | Dimensão oficial | Observação |
| --- | --- | --- |
| Checkbox visual | 20×20px | Alvo total mínimo 44×44px |
| Radio visual | 20×20px | Alvo total mínimo 44×44px |
| Switch | 48×28px | Thumb de aproximadamente 24px |
| Segmented control | mínimo 44px de altura | Segmentos com largura suficiente para o texto |
| Chip selecionável | mínimo 36px de altura, alvo 44px | Uso controlado; não substitui radio em decisões importantes |
| Linha de opção com descrição | mínimo 56px | Cresce com texto ampliado |

## C.5 Escala de intensidade

- trilho ou área de seleção: mínimo de 44px de altura;
- pontos discretos: mínimo visual de 20px, com alvo de 44px;
- valor selecionado: mínimo de 16px tipográfico e contraste primário;
- labels de extremos: mínimo de 14px, sem truncamento;
- em telas estreitas, labels podem ficar acima e abaixo da escala, mas não podem desaparecer.

## C.6 Navegação

| Componente | Mobile | Tablet/Desktop |
| --- | --- | --- |
| Bottom navigation | 64px + safe area | Não aplicável |
| Item da bottom navigation | mínimo 48px de largura e 44px de alvo | — |
| Sidebar compacta | — | 72px de largura |
| Sidebar expandida | — | 240–280px de largura |
| Top bar | 56px | 64px |
| Tab | mínimo 44px de altura | mínimo 40px; 44px preferencial |
| Breadcrumb | Não obrigatório | 32–40px de altura visual |

A sidebar expandida não deve reduzir a área de conteúdo abaixo de sua largura mínima. Quando isso ocorrer, a navegação deve usar estado compacto ou overlay aprovado.

## C.7 Cards e listas

| Elemento | Mobile | Tablet/Desktop |
| --- | --- | --- |
| Padding de card padrão | 16px | 20–24px |
| Padding de card compacto | 12px | 12–16px |
| Gap interno principal | 12px | 12–16px |
| Gap entre cards | 12px | 16–24px |
| Item de lista compacto | mínimo 48px | mínimo 44px |
| Item de lista padrão | mínimo 56px | mínimo 52px |
| Item com descrição/mídia | mínimo 64px | mínimo 60px |
| Thumbnail compacta | 40×40px | 40–48px |
| Thumbnail padrão | 56×56px | 56–64px |

Cards crescem com o conteúdo. Alturas fixas só podem ser usadas em grids de conteúdo equivalente e devem suportar texto ampliado sem corte.

## C.8 Badges, avatares e indicadores

| Elemento | Tamanhos oficiais |
| --- | --- |
| Badge pequeno | 24px de altura; padding horizontal de 8px |
| Badge médio | 28px de altura; padding horizontal de 10px |
| Avatar | 24, 32, 40, 56 e 80px |
| Indicador de status pontual | 8–10px, sempre acompanhado de explicação |
| Ícone de status | 16 ou 20px |

Badge nunca deve receber altura superior a 32px. Acima disso, o elemento deve ser tratado como controle, card ou banner.

## C.9 Modais, sheets, toasts e banners

| Componente | Dimensão/restrição |
| --- | --- |
| Modal pequeno | até 400px de largura |
| Modal padrão | 480px de largura de referência |
| Modal amplo | 640px, somente conteúdo que justifique |
| Margem lateral mobile | mínimo 16px |
| Bottom sheet | largura total; radius superior `lg` |
| Toast | até 420px; largura segura no mobile |
| Banner | largura do container; padding de 12–16px |
| Scrim | referência de 60%, ajustada por contraste do tema |

Modal não deve ultrapassar a altura segura da viewport. Conteúdo interno pode rolar, mas título e ações críticas devem permanecer compreensíveis.

## C.10 Larguras máximas de conteúdo

| Tipo de conteúdo | Largura máxima de referência | Motivo |
| --- | ---: | --- |
| Texto longo e conteúdo clínico | 720px | Preservar comprimento de linha e leitura |
| Formulário padrão | 640px | Reduzir varredura horizontal e erro |
| Modal/formulário amplo | 800px | Somente quando campos relacionados exigirem paralelismo |
| Conteúdo de aplicação | 1280px | Limitar dispersão em desktop |
| Dashboard analítico | 1440px | Permitir dados paralelos sem criar vazio excessivo |
| Galeria ou comparação visual | 1600px, excepcional | Conteúdo visual se beneficia da largura |

Esses limites são referências de container, não breakpoints. Telas menores usam 100% da largura disponível com margens seguras.

## C.11 Gráficos

- altura mínima de gráfico simples: 200px;
- altura padrão de série temporal mobile: 240px;
- altura padrão desktop: 280–360px, conforme número de séries e anotações;
- área de toque de ponto ou marcador: 44×44px, mesmo quando o marcador visual for menor;
- legenda deve permitir quebra e nunca reduzir a área de plot abaixo do necessário;
- gráficos abaixo de 200px só são permitidos como sparkline sem eixos, acompanhados do valor textual completo.

## C.12 Elevação visual de referência

| Nível | Dark Mode | Light Mode | Uso |
| --- | --- | --- | --- |
| 0 | superfície base, sem sombra | superfície base, sem sombra | Fundo e conteúdo integrado |
| 1 | superfície levemente mais clara + borda | sombra quase imperceptível + borda opcional | Cards e controles elevados discretos |
| 2 | contraste adicional de superfície | sombra rasa e difusa | Menus e cards flutuantes temporários |
| 3 | superfície elevada + borda clara | sombra média difusa | Popovers e sheets |
| 4 | superfície de overlay | sombra forte, ainda suave | Modais |
| 5 | uso excepcional | uso excepcional | Fluxos críticos sobre múltiplos planos |

Níveis 4 e 5 não podem ser usados em conteúdo recorrente. Elevação alta perde significado quando se torna comum.

# ANEXO D — Contratos de composição e limites sistêmicos

## D.1 Quantidade de ações

- uma ação primária por superfície ou etapa;
- até duas ações secundárias visíveis no mesmo grupo;
- ações adicionais entram em menu contextual;
- ações destrutivas não ficam adjacentes à primária sem separação e confirmação;
- cards de entidade exibem no máximo uma ação direta além da navegação principal.

## D.2 Quantidade de informação por componente

- Badge: um estado;
- Painel de estatística: uma métrica principal e até duas secundárias;
- Card de entidade: título, até dois status, até três métricas e metadata essencial;
- Toast: uma mensagem e uma ação opcional;
- Banner: uma condição, uma ação principal e uma secundária;
- Modal de confirmação: uma decisão;
- Card de IA: uma conclusão principal, ainda que use múltiplas evidências;
- Gráfico: uma pergunta analítica principal.

A limitação não serve para ocultar informação. Ela define quando o conteúdo deve ser dividido em componentes ou níveis de detalhe.

## D.3 Aninhamento

- card dentro de card é proibido como padrão;
- superfícies podem conter grupos neutros sem nova elevação;
- no máximo um nível de expansão dentro de lista ou timeline;
- modal não abre outro modal; exceções de sistema operacional devem retornar ao primeiro contexto;
- popover não contém fluxo longo nem outro popover;
- tabs não devem conter um segundo nível de tabs do mesmo peso.

## D.4 Persistência de ações

Ação persistente no rodapé ou cabeçalho é permitida quando:

1. o fluxo é longo;
2. a ação é necessária em qualquer ponto;
3. não cobre conteúdo;
4. respeita safe area e teclado;
5. seu estado reflete validação e salvamento atuais.

Não usar ação persistente apenas para aumentar conversão ou manter um botão “sempre visível”.

## D.5 Prioridade de feedback

1. erro de campo: inline;
2. erro de ação local: inline ou toast com contexto;
3. condição persistente: banner;
4. decisão necessária: modal;
5. falha de tela: estado de erro de tela;
6. condição global: banner global;
7. confirmação leve: toast.

O mesmo evento não deve gerar simultaneamente modal, banner e toast, salvo quando cada um representar uma etapa diferente e necessária.

## D.6 Contrato de estados assíncronos

Toda operação assíncrona deve responder a cinco perguntas:

1. A ação foi recebida?
2. Ainda está em andamento?
3. O usuário pode sair?
4. O conteúdo foi preservado?
5. Como saber o resultado?

O componente deve comunicar essas respostas com loading, processamento, pendência, sucesso ou erro. “Spinner sem contexto” não cumpre o contrato.

## D.7 Contrato de privacidade

Antes de compartilhar, o componente deve deixar evidente:

- qual informação será exposta;
- qual perfil/contexto será utilizado;
- quem poderá ver;
- se o conteúdo é encontrável;
- se a decisão é reversível;
- qual efeito a revogação terá.

Nenhum componente pode presumir que o usuário entende a diferença entre público, seguidores e link sem uma explicação acessível.

## D.8 Contrato de IA

Todo componente que apresenta inferência deve distinguir visualmente:

- dado observado;
- cálculo ou padrão identificado;
- interpretação;
- previsão, quando houver;
- confiança;
- limitação;
- ação sugerida.

A interface deve permitir que uma pessoa compreenda o insight sem interpretar decoração, cor ou autoridade aparente como evidência.

## D.9 Contrato de Premium

Bloqueio Premium deve mostrar:

- funcionalidade;
- benefício;
- limite atual;
- plano necessário;
- preço antes da confirmação;
- possibilidade de voltar;
- restauração ou gestão de compra quando aplicável.

O acesso gratuito existente não pode ser visualmente degradado para tornar o Premium artificialmente superior.

## D.10 Contrato de consistência entre temas

Uma captura de Dark e Light da mesma tela deve preservar:

- ordem de leitura;
- níveis de hierarquia;
- quantidade de superfícies;
- significado de cores;
- foco;
- estados;
- conteúdo;
- densidade;
- acessibilidade.

O Light Mode não é uma versão branca do Dark, e o Dark Mode não é uma inversão automática do Light. Cada tema usa seus valores oficiais para produzir a mesma experiência perceptiva.
