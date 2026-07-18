# 03 — Component Library da Plataforma COSMARIA

> **Status:** Versão 1.0 — especificação normativa inicial.
> **Data:** 2026-07-12.
> **Autoridade:** subordinado ao `../11-design-system.md`, `01-visual-language.md` e `02-ui-kit.md`.
> **Escopo:** descrição completa das famílias de componentes oficiais. Não contém código, React, HTML ou CSS.

## 0. Propósito e autoridade

Este documento transforma o UI Kit em uma biblioteca de componentes auditável. Ele define o contrato visual e comportamental de cada família de componente: por que existe, como é construída, quais variantes são permitidas, quais estados deve suportar, quais dimensões e espaçamentos utiliza, como se adapta, como preserva acessibilidade e quais usos são proibidos.

A hierarquia obrigatória é:

**Design System → Visual Language → UI Kit → Component Library → Templates → Telas.**

Em caso de conflito, prevalece a decisão mais alta na hierarquia. Este documento não pode alterar regra de negócio, entidade, fluxo ou roadmap. Uma necessidade que não cabe nos componentes existentes deve passar pelo processo de governança; não autoriza componente local improvisado.

## Princípios normativos da biblioteca

- **Biblioteca única:** Core, Grow e Med usam as mesmas famílias. Diferenças são obtidas por conteúdo, contexto e tokens, nunca por cópia do componente.
- **Composição antes de especialização:** Slots e propriedades resolvem variação. Um novo componente só existe quando a semântica ou comportamento não pode ser obtido por composição.
- **Tema, contexto, estado e entitlement separados:** Dark/Light definem ambiente; Core/Grow/Med definem acento; estados definem semântica; Premium define acesso. Nenhuma camada substitui outra.
- **Uma anatomia por problema:** Componentes equivalentes devem ter a mesma ordem de leitura, estados e limites em todas as telas.
- **Mobile-first sem perda:** A adaptação muda composição e densidade, não remove conteúdo, ação, privacidade ou explicabilidade essencial.
- **Acessibilidade estrutural:** Contraste, foco, leitor de tela, texto ampliado, teclado e redução de movimento fazem parte do componente, não são revisão posterior.
- **Conteúdo honesto:** Dados ausentes, estimados, previstos, privados e Premium são nomeados explicitamente. A interface não usa decoração para sugerir certeza ou valor.
- **Sem valores arbitrários:** Dimensão, espaçamento, radius, cor, elevação e motion usam escalas oficiais. Exceções exigem revisão sistêmica.

## Contrato comum de todos os componentes

Todo componente oficial deve:

- possuir nome único e funcional;
- declarar anatomia, elementos obrigatórios e opcionais;
- usar somente tokens e dimensões aprovados;
- cobrir todos os estados aplicáveis, inclusive loading, erro, disabled, read-only, offline, private e Discreet;
- manter equivalência perceptiva em Dark e Light;
- preservar alvo mínimo de 44×44px quando interativo;
- suportar texto ampliado sem sobreposição ou perda de ação;
- ter nome, ordem de foco e comportamento de teclado definidos;
- não depender exclusivamente de cor, hover, gesto ou animação;
- registrar anti-patterns e critérios de aceitação;
- ser rastreável à versão do UI Kit e à implementação correspondente.

## Inventário oficial

A versão 1.0 contém **70 famílias oficiais de componentes**, organizadas nas categorias abaixo. Variantes internas não criam novas famílias.

### Primitivos

1. Text · 2. Icon · 3. Image · 4. Thumbnail · 5. Avatar · 6. Divider · 7. Tag / Chip

### Ações e formulários

8. Button · 9. Icon Button · 10. Link · 11. Text Field · 12. Text Area · 13. Numeric / Measurement Field · 14. Search Field · 15. Select / Dropdown · 16. Radio Group · 17. Checkbox · 18. Switch · 19. Segmented Control · 20. Intensity Scale · 21. Date Picker · 22. Time Picker · 23. Date-Time Picker · 24. Date Range Picker · 25. Filter Bar · 26. Upload & Media Capture

### Navegação

27. Bottom Navigation · 28. Sidebar Navigation · 29. Top App Bar / Page Header · 30. Tabs · 31. Back Navigation / Breadcrumb · 32. Pagination · 33. Incremental Loading / Continuation · 34. Step Indicator · 35. Overflow Menu / Popover

### Dados e conteúdo

36. Counter Badge · 37. Status Badge · 38. Entity Card · 39. List Item · 40. Timeline · 41. Statistics Panel · 42. Entity Comparison · 43. Data Table · 44. Time-Series Chart · 45. Media Gallery · 46. Media Viewer

### Feedback e overlays

47. Inline Validation · 48. Toast · 49. Banner · 50. Modal Dialog · 51. Bottom Sheet · 52. Tooltip · 53. Empty State · 54. Loading Indicator · 55. Progress Indicator · 56. Skeleton · 57. Screen Error State · 58. Offline / Sync Status · 59. Permission / Private State

### Componentes especializados

60. AI Explainability Card · 61. Confidence Indicator · 62. Aggregated Data Seal · 63. AI Alert Card · 64. Privacy Matrix · 65. Visibility Scope Selector · 66. Profile Link Seal · 67. Discreet Mode Indicator · 68. Paywall / Upsell · 69. Premium Category Badge · 70. Free vs Premium Comparator

# PARTE I — ESPECIFICAÇÕES DOS COMPONENTES

## 1. Text

**Categoria:** Primitivos  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Representar todo conteúdo verbal, numérico e editorial da interface com hierarquia previsível.

### Justificativa

Texto é a principal camada de compreensão do produto. Uma única família e papéis tipográficos fixos reduzem ruído, sustentam dados técnicos e clínicos e preservam internacionalização.

### Anatomia

1. Conteúdo textual.
2. Papel tipográfico.
3. Peso.
4. Altura de linha.
5. Cor semântica.
6. Comportamento de quebra ou truncamento.

### Variantes permitidas

- Display.
- Título de página.
- Título de seção.
- Título de componente.
- Corpo destacado.
- Corpo.
- Auxiliar.
- Legenda.
- Dado tabular.
- Texto semântico.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Escala | 12, 14, 16, 18, 20, 24, 30, 38 e 48px |
| Corpo principal | 16px |
| Auxiliar | 14px |
| Legenda | 12px, uso restrito |
| Linha de corpo | 1,4–1,6 |
| Linha de metadado | mínimo 1,3 |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Normal.
- Secundário.
- Terciário.
- Semântico: informativo, sucesso, atenção ou crítico.
- Oculto/substituído no Modo Discreto quando sensível.

### Regras de iconografia

Ícones não substituem texto essencial. Quando texto e ícone coexistirem, o texto mantém a semântica principal.

### Regras de conteúdo

Sentence case; verbos específicos em ações; números tabulares em comparações; unidades inseparáveis do valor; datas e horários por locale.

### Casos de uso

- Títulos, labels, instruções, métricas, mensagens, conteúdo clínico, dados técnicos e relatórios.

### Quando não utilizar

- Texto decorativo, múltiplas famílias, corpo abaixo do mínimo, caixa alta extensiva, placeholder como label.

### Responsividade

Deve reflow sem corte; títulos podem reduzir de 30 para 24 no mobile; texto ampliado aumenta altura de containers.

### Acessibilidade

Contraste 4,5:1 para texto normal; 3:1 para texto grande; suporte a zoom e leitor de tela; ordem semântica coerente.

### Core, Grow, Med e temas

A família candidata é Inter (sujeita a validação formal, doc 11 §4; licenciamento e nome final ficam para o doc 13, que ainda não escolheu fonte). Core, Grow e Med variam conteúdo e acento, nunca família ou escala.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Truncar dado crítico.
- Usar peso fino.
- Aplicar opacidade para criar texto secundário em vez de token.
- Alinhar parágrafos longos ao centro.

### Critérios de aceitação

- [ ] Usa apenas escala oficial.
- [ ] Mantém hierarquia nos dois temas.
- [ ] Suporta expansão de texto.
- [ ] Números comparáveis usam tabular nums.
- [ ] Conteúdo completo permanece acessível.

## 2. Icon

**Categoria:** Primitivos  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Comunicar ação, categoria ou estado por uma metáfora visual padronizada.

### Justificativa

Uma única biblioteca linear com peso médio impede mistura estilística e reduz ambiguidade. Ícones são reforço semântico, não decoração.

### Anatomia

1. Glyph.
2. Caixa de alinhamento.
3. Cor herdada.
4. Nome acessível quando interativo.

### Variantes permitidas

- Decorativo.
- Informativo.
- Interativo.
- Semântico.
- Contextual.
- Preenchido para seleção sistematizada.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Tamanhos | 16, 20, 24 e 32px |
| Padrão em controles | 20px |
| Padrão de toque/navegação | 24px |
| Alvo interativo | mínimo 44×44px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Default.
- Hover — somente em dispositivos com apontador.
- Focus visible.
- Active/pressed.
- Disabled quando aplicável.
- Selected.
- Semântico.

### Regras de iconografia

É o próprio componente. Deve usar grade e alinhamento óptico comuns; não misturar bibliotecas; todo ícone interativo isolado recebe label acessível e tooltip quando necessário.

### Regras de conteúdo

Metáforas universais; nomes consistentes; ícones técnicos Grow sem folha genérica; ícones Med não hospitalares; IA sem robô ou cérebro brilhante.

### Casos de uso

- Ações inequívocas, navegação, status, privacidade, dados técnicos e clínicos.

### Quando não utilizar

- Substituir labels de ações importantes
- Usar emojis operacionais
- Escolher ícone apenas por estética.

### Responsividade

Tamanho visual pode permanecer, mas alvo não reduz. Em navegação primária sempre acompanhado de label.

### Acessibilidade

Nome programático obrigatório em ícones interativos; decorativos devem ser ignorados por tecnologias assistivas.

### Core, Grow, Med e temas

A cor do ícone herda controle ou semântica. Accent nunca substitui cores de erro, sucesso ou atenção.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Mistura de traço e preenchimento sem regra.
- Ícones ambíguos isolados.
- Cores locais.
- Animação contínua decorativa.

### Critérios de aceitação

- [ ] Pertence à biblioteca aprovada.
- [ ] Mantém peso óptico.
- [ ] Tem label acessível.
- [ ] Alvo mínimo preservado.
- [ ] Funciona em Dark e Light.

## 3. Image

**Categoria:** Primitivos  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Exibir fotografia, ilustração ou mídia de domínio preservando proporção, contexto e privacidade.

### Justificativa

A imagem pode carregar evidência de cultivo, contexto clínico ou identidade. Regras únicas evitam deformação, exposição indevida e inconsistência editorial.

### Anatomia

1. Container.
2. Mídia.
3. Texto alternativo ou descrição.
4. Fallback.
5. Camada de privacidade quando aplicável.

### Variantes permitidas

- Conteúdo.
- Entidade.
- Grow.
- Med.
- Institucional.
- Sensível.
- Ilustração funcional.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Largura | fluida dentro do container |
| Altura | derivada da proporção; não fixar sem necessidade |
| Radius | coerente com container; md como referência |
| Crop | center/subject-aware, sem distorção |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Loading.
- Loaded.
- Unavailable.
- Error.
- Sensitive.
- Discreet.

### Regras de iconografia

Ícones podem indicar mídia indisponível, sensível ou ação de ampliar; nunca cobrir conteúdo relevante.

### Regras de conteúdo

Alt text descreve função e evidência, não aparência irrelevante. Conteúdo UGC mantém metadados essenciais quando permitido.

### Casos de uso

- Fotos de plantas, exames autorizados, perfis, registros, ilustrações de estado e conteúdo institucional.

### Quando não utilizar

- Usar imagem decorativa em telas densas
- Exibir dado sensível sem controle
- Deformar proporção.

### Responsividade

Adapta crop e tamanho; não oculta sujeito. Em mobile pode ocupar largura total; em desktop respeita largura máxima e contexto.

### Acessibilidade

Alternativa textual; controles de mídia acessíveis; não depender da imagem para transmitir estado.

### Core, Grow, Med e temas

Grow favorece documentação técnica; Med favorece neutralidade e cuidado; Modo Discreto substitui conteúdo, não apenas aplica blur.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Filtros pesados.
- Banco de imagem recreativo.
- Glassmorphism sobre foto.
- Texto essencial sobre imagem sem contraste.

### Critérios de aceitação

- [ ] Mantém proporção.
- [ ] Tem fallback.
- [ ] Protege conteúdo sensível.
- [ ] Possui descrição adequada.
- [ ] Não altera hierarquia entre temas.

## 4. Thumbnail

**Categoria:** Primitivos  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Representar mídia em listas, cards, galerias e seletores com proporção e tamanho consistentes.

### Justificativa

Miniaturas padronizadas aumentam escaneabilidade e evitam que imagens dominem conteúdo funcional.

### Anatomia

1. Container.
2. Imagem.
3. Indicador opcional de tipo/quantidade.
4. Estado de seleção opcional.

### Variantes permitidas

- Compacta.
- Padrão.
- Selecionável.
- Com contador.
- Sensível.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Compacta | 40×40px |
| Padrão mobile | 56×56px |
| Padrão desktop | 56–64px |
| Radius | sm ou md conforme container |
| Alvo quando interativa | 44×44px mínimo |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Default.
- Hover — somente em dispositivos com apontador.
- Focus visible.
- Active/pressed.
- Disabled quando aplicável.
- Loading.
- Selected.
- Unavailable.

### Regras de iconografia

Ícone pequeno pode indicar vídeo, comparação ou indisponibilidade; não usar múltiplos overlays.

### Regras de conteúdo

Sem texto interno, salvo contador curto. Descrição pertence ao item associado.

### Casos de uso

- Listas com mídia, cards de entidade, galeria, upload e comparação.

### Quando não utilizar

- Usar como imagem principal de relatório
- Aplicar proporções diferentes dentro da mesma lista.

### Responsividade

Mantém dimensão prevista; pode reduzir de 64 para 56 ou 40 conforme densidade, sem desaparecer quando essencial.

### Acessibilidade

Estado selecionado não depende apenas de borda colorida; nome vem do item associado.

### Core, Grow, Med e temas

Mesma geometria nos contextos; conteúdo sensível respeita Modo Discreto.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Cropping inconsistente.
- Contorno colorido decorativo.
- Múltiplos badges sobrepostos.

### Critérios de aceitação

- [ ] Tamanho oficial.
- [ ] Proporção estável.
- [ ] Loading e erro previstos.
- [ ] Seleção acessível.
- [ ] Sem exposição sensível.

## 5. Avatar

**Categoria:** Primitivos  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Representar uma identidade pública, conta ou perfil contextual sem expor ligação não autorizada.

### Justificativa

A Comunidade possui perfis independentes por contexto. O avatar precisa manter reconhecimento sem inferir identidade entre Grow e Med.

### Anatomia

1. Imagem ou monograma.
2. Container circular.
3. Status opcional.
4. Nome associado fora do avatar.

### Variantes permitidas

- Imagem.
- Monograma.
- Anônimo Med.
- Conta.
- Perfil Grow.
- Perfil Med.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Tamanhos | 24, 32, 40, 56 e 80px |
| Forma | circular |
| Status pontual | 8–10px, sempre explicado |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Default.
- Loading.
- Fallback.
- Unavailable.
- Selected.
- Discreet.

### Regras de iconografia

Ícone de pessoa só como fallback neutro. Ícone de vínculo ou status fica fora do conteúdo principal.

### Regras de conteúdo

Nome nunca deve ser inferido da imagem. Monograma usa caracteres autorizados e mantém contraste.

### Casos de uso

- Perfis, comentários, publicação, seleção de identidade contextual e conta.

### Quando não utilizar

- Reutilizar automaticamente o mesmo avatar em Grow e Med
- Usar foto real como requisito no Med.

### Responsividade

Tamanho muda conforme contexto; não reduzir abaixo de 24px; em listas interativas o alvo pertence à linha.

### Acessibilidade

Alt text/nome acessível; status anunciado; fallback não depende da cor.

### Core, Grow, Med e temas

Perfis Grow e Med são independentes. Avatar anônimo do Med é neutro, não estigmatizante.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Borda colorida sem significado.
- Indicador de presença não suportado pelo produto.
- Inferir vínculo entre contextos.

### Critérios de aceitação

- [ ] Tamanho aprovado.
- [ ] Fallback previsto.
- [ ] Perfil contextual correto.
- [ ] Status explicado.
- [ ] Modo Discreto validado.

## 6. Divider

**Categoria:** Primitivos  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Separar grupos de conteúdo somente quando spacing e hierarquia não forem suficientes.

### Justificativa

Divisores em excesso criam grade visual e elevam densidade. Um componente único mantém espessura, cor e alinhamento consistentes.

### Anatomia

1. Linha.
2. Inset opcional.
3. Orientação.

### Variantes permitidas

- Horizontal full.
- Horizontal inset.
- Vertical.
- Separador de seção.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Espessura | 1px visual |
| Cor | color.border |
| Espaço externo | definido pelo padrão de composição |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Default.

### Regras de iconografia

Não utiliza ícone.

### Regras de conteúdo

Não contém texto. Títulos de seção são componentes separados.

### Casos de uso

- Listas densas, configurações, tabelas e relatórios.

### Quando não utilizar

- Separar cada card
- Substituir espaço negativo
- Criar bordas decorativas.

### Responsividade

Pode desaparecer no mobile quando o agrupamento por spacing for suficiente; sentido da informação deve permanecer.

### Acessibilidade

Decorativo e ignorado pelo leitor de tela, salvo separação semântica implementada pelo container.

### Core, Grow, Med e temas

Cor neutra nos três contextos.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Traço duplo.
- Espessura variável.
- Acento de app.
- Sombra.

### Critérios de aceitação

- [ ] 1px visual.
- [ ] Alinhado ao conteúdo.
- [ ] Não compete com informação.
- [ ] Uso justificado.

## 7. Tag / Chip

**Categoria:** Primitivos  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Representar classificação curta, filtro, seleção leve ou atributo autocontido.

### Justificativa

A forma pill é reservada a conteúdo curto. Separar tag informativa de chip interativo evita que status, filtros e botões pareçam iguais.

### Anatomia

1. Container pill.
2. Label.
3. Ícone opcional.
4. Ação de remover opcional quando interativo.

### Variantes permitidas

- Tag neutra.
- Tag contextual.
- Chip selecionável.
- Chip de filtro.
- Chip removível.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Altura informativa | 24–28px |
| Chip selecionável | mínimo 36px; alvo 44px |
| Padding horizontal | 8–12px |
| Gap | 8px |
| Ícone | 16px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Default.
- Hover — somente em dispositivos com apontador.
- Focus visible.
- Active/pressed.
- Disabled quando aplicável.
- Selected.
- Removable.

### Regras de iconografia

Ícone apenas reforça categoria ou remoção. “X” possui nome acessível específico.

### Regras de conteúdo

Uma a três palavras; sem frases; ordem estável; label não deve mudar ao selecionar.

### Casos de uso

- Filtros, atributos técnicos, categorias e seleção leve de múltiplos itens.

### Quando não utilizar

- Decisão clínica importante
- Substituir radio em opções mutuamente exclusivas
- Representar erro complexo.

### Responsividade

Pode quebrar para múltiplas linhas como grupo; cada chip mantém alvo e leitura.

### Acessibilidade

Estado selecionado usa forma/ícone além de cor; remoção acessível; grupo recebe label.

### Core, Grow, Med e temas

Accent contextual apenas em seleção. Status semântico deve usar Badge de Status.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Chips gigantes.
- Muitas cores.
- Label truncado.
- Pill usado como card.

### Critérios de aceitação

- [ ] Função inequívoca.
- [ ] Altura correta.
- [ ] Seleção não depende de cor.
- [ ] Label curto.
- [ ] Não confunde com status.

## 8. Button

**Categoria:** Ações e formulários  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Executar uma ação explícita e local com hierarquia clara.

### Justificativa

Botões padronizados controlam prioridade, previnem múltiplas ações primárias e sustentam idempotência visual.

### Anatomia

1. Container.
2. Label obrigatório.
3. Ícone inicial e/ou final opcional (ordem: inicial → label → final).
4. Indicador de loading opcional.

### Variantes permitidas

- Primário.
- Secundário.
- Terciário.
- Destrutivo.
- Baixo destaque.
- Com ícone.
- Full-width.
- Intrínseco.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Pequeno | 36px visual; alvo 44px; padding 12px; ícone 16px; radius.sm |
| Médio | 44px; padding 16px; ícone 20px; radius.md |
| Grande | 52px; padding 24px; ícone 24px; radius.md |
| Gap ícone–texto | 8px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Default.
- Hover — somente em dispositivos com apontador.
- Focus visible.
- Active/pressed.
- Disabled quando aplicável.
- Loading.
- Success apenas quando útil.

### Regras de iconografia

No máximo um ícone por posição — inicial (significado) e/ou final (direção/continuidade); ordem inicial → label → final. Loading oculta os ícones sem alterar a largura. O label permanece obrigatório (Button não vira IconButton).

### Regras de conteúdo

Verbo específico, curto e em sentence case. Evitar “OK”, “Sim” e “Enviar” sem objeto quando o contexto não for inequívoco.

### Casos de uso

- Criar, salvar, confirmar, registrar, iniciar, concluir, excluir e alterar estado.

### Quando não utilizar

- Navegar para conteúdo quando Link é apropriado
- Mais de uma ação primária por superfície.

### Responsividade

Full-width ou empilhado no mobile quando necessário; intrínseco no desktop; dois lado a lado apenas com labels legíveis.

### Acessibilidade

Alvo mínimo 44×44; foco 3:1; estado anunciado; loading preserva nome; teclado Enter/Space.

### Core, Grow, Med e temas

Accent do contexto somente no primário. Destrutivo sempre crítico, nunca accent.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Gradiente decorativo.
- Sombra forte.
- Botão disabled sem explicação.
- Mudança de tamanho entre estados.
- Ícone ambíguo sem label.

### Critérios de aceitação

- [ ] Uma ação primária por grupo.
- [ ] Dimensão oficial.
- [ ] Idempotência.
- [ ] Contraste e foco.
- [ ] Label específico.
- [ ] Loading sem layout shift.

## 9. Icon Button

**Categoria:** Ações e formulários  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Executar ação inequívoca em espaço restrito sem label visível.

### Justificativa

Separá-lo do Button impede que ações ambíguas sejam reduzidas prematuramente a ícones e garante alvo, tooltip e acessibilidade consistentes.

### Anatomia

1. Container de alvo (mínimo 44×44).
2. Ícone central (decorativo — não anunciado, evita duplicação).
3. Nome acessível obrigatório (`accessibilityLabel`).

Tooltip **não** é interno no React Native; em desktop/web é composto externamente quando houver infraestrutura oficial (ver ui-kit §26.8).

### Propriedades (eixos independentes — não confundir entre si)

**Hierarchy** (propósito visual, consistente com o Button):

- `primary` — accent contextual + `color.text.on-accent`;
- `secondary` — superfície neutra + borda estrutural;
- `tertiary` — baixa ênfase;
- `destructive` — semântica crítica + `color.text.on-critical`, nunca accent.

**Shape** (só geometria — não altera hierarchy, estado nem alvo):

- `roundedSquare` (default) — radius oficial do sistema (`radius.md`);
- `circular` — radius integral (`radius.pill`).

**Selected** é ESTADO (não hierarchy) — ver "Estados".

> "Neutral", "Accent selecionado", "Circular" e "Quadrado arredondado" **não** formam uma única categoria de variantes. Hierarchy, shape e selected são eixos independentes.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Alvo | 44×44px (nunca abaixo) |
| Ícone | 20–24px |
| Radius | `roundedSquare` = `radius.md`; `circular` = radius integral (`radius.pill`) |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Default.
- Hover — somente em dispositivos com apontador.
- Focus visible.
- Active/pressed.
- Disabled quando aplicável.
- Selected (estado toggle: `selected?: boolean`; `accessibilityState.selected`; ring de accent).
- Loading quando aplicável.

Precedência visual quando estados coexistem: **disabled → loading → pressed → selected → default**. `selected` pode coexistir com disabled/loading/pressed; a acessibilidade reflete todos (`disabled`/`busy`/`selected`).

### Regras de iconografia

Um único ícone da biblioteca oficial. A metáfora deve ser inequívoca no contexto.

### Regras de conteúdo

Sem texto visível; nome acessível deve descrever ação e objeto, como “Excluir foto”.

### Casos de uso

- Voltar, fechar, menu, favoritar, editar, expandir e ações de mídia.

### Quando não utilizar

- Ação primária complexa
- Ícone pouco conhecido
- Grupo com muitos ícones sem labels.

### Responsividade

Não reduz abaixo de 44px. Em mobile ações secundárias podem migrar para menu.

### Acessibilidade

`accessibilityLabel` obrigatório (nunca ausência silenciosa); `accessibilityHint` opcional; `accessibilityState` para `disabled`/`busy`/`selected`; focus visible e feedback de pressed. Tooltip apenas em desktop/web, composto externamente — nunca interno no React Native.

### Core, Grow, Med e temas

Accent apenas em selected ou ação contextual; destrutivo usa crítico.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Ícone de 16px em alvo pequeno.
- Ação sem `accessibilityLabel` (nome acessível obrigatório).
- Tratar `shape` ou `selected` como se fossem `hierarchy`.
- Vários icon buttons adjacentes sem separação.

### Critérios de aceitação

- [ ] 44×44.
- [ ] Ícone oficial.
- [ ] `accessibilityLabel` obrigatório.
- [ ] Tooltip (desktop/web) composto externamente quando ambíguo — nunca interno no RN.
- [ ] Estado `selected` claro (ring de accent + `accessibilityState.selected`).

## 10. Link

**Categoria:** Ações e formulários  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Navegar para outro recurso, rota ou documento mantendo semântica de navegação.

### Justificativa

A distinção visual e comportamental entre link e botão preserva previsibilidade, histórico e acessibilidade.

### Anatomia

1. Label.
2. Sublinhado ou sinal visual.
3. Ícone opcional de externo/download.

### Variantes permitidas

- Inline.
- Independente.
- Navegação.
- Externo.
- Download.
- Destrutivo raro.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Altura | derivada do texto; alvo 44px quando ação isolada |
| Gap com ícone | 8px |
| Ícone | 16px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Default.
- Hover.
- Focus visible.
- Visited quando útil.
- Disabled somente se inevitável.

### Regras de iconografia

Ícone informa saída, download ou direção; não decorar links inline.

### Regras de conteúdo

Label deve indicar destino; evitar “clique aqui”. Links externos podem informar que sairão do produto.

### Casos de uso

- Navegação, abertura de relatório, ajuda, termos e referências.

### Quando não utilizar

- Executar ação local
- Parecer botão primário
- Depender apenas da cor.

### Responsividade

Quebra de linha permitida em texto; alvo isolado preserva 44px; não truncar destino crítico.

### Acessibilidade

Sublinhado ou sinal além de cor; propósito compreensível fora de contexto; foco visível.

### Core, Grow, Med e temas

Cor de link pode usar accent contextual, mantendo contraste. Link destrutivo usa crítico.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Texto genérico.
- Remover sublinhado sem alternativa.
- Mudar rota sem atualizar foco/título.

### Critérios de aceitação

- [ ] Semântica de navegação.
- [ ] Destino claro.
- [ ] Foco e contraste.
- [ ] Ícone correto quando externo.

## 11. Text Field

**Categoria:** Ações e formulários  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Coletar texto curto com label persistente, ajuda e validação contextual.

### Justificativa

Uma anatomia única reduz erros, elimina placeholder como label e mantém consistência entre formulários Grow, Med e Core.

### Anatomia

1. Label.
2. Container de entrada.
3. Valor ou placeholder.
4. Prefixo/ícone opcional.
5. Sufixo/ação opcional.
6. Texto auxiliar.
7. Mensagem de estado.

### Variantes permitidas

- Padrão.
- Com prefixo.
- Com sufixo.
- Com ícone.
- Sensível.
- Somente leitura.
- Opcional.
- Obrigatório.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Compacto | 44px |
| Padrão | 48px |
| Confortável | 56px |
| Padding | 12–16px |
| Label–campo | 8px |
| Campo–ajuda | 4px |
| Ícone | 20px |
| Borda | 1px |
| Focus ring | 2px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Default.
- Hover.
- Focus visible.
- Filled.
- Disabled.
- Read-only.
- Warning.
- Error.
- Success quando útil.

### Regras de iconografia

Ícone só quando explica categoria ou ação. Reveal de campo sensível tem label acessível.

### Regras de conteúdo

Label específico; “opcional” quando aplicável; placeholder apenas como exemplo; erro explica correção.

### Casos de uso

- Nomes, títulos, identificadores, notas curtas e dados textuais.

### Quando não utilizar

- Números estruturados, opções fechadas, datas, texto longo.

### Responsividade

Full-width no mobile; largura baseada no dado no desktop; cresce com texto ampliado.

### Acessibilidade

Label programático; descrição e erro associados; erro anunciado; não perde valor; autocomplete apropriado.

### Core, Grow, Med e temas

Focus usa accent contextual; erro usa crítico; campo sensível respeita Modo Discreto.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Placeholder como label.
- Erro somente por cor.
- Largura excessiva para dado curto.
- Ícones múltiplos.

### Critérios de aceitação

- [ ] Label persistente.
- [ ] Altura oficial.
- [ ] Valor preservado.
- [ ] Erro acionável.
- [ ] Foco visível.
- [ ] Texto ampliado testado.

## 12. Text Area

**Categoria:** Ações e formulários  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Coletar conteúdo textual de múltiplas linhas com leitura e edição confortáveis.

### Justificativa

Textos longos exigem altura, contagem e redimensionamento próprios. Tratá-los como Text Field alto gera experiências inconsistentes.

### Anatomia

1. Label.
2. Área de edição.
3. Placeholder opcional.
4. Contador opcional.
5. Texto auxiliar.
6. Mensagem de estado.

### Variantes permitidas

- Padrão.
- Com contador.
- Autoexpansível.
- Somente leitura.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Altura mínima | 96px |
| Padding | 12–16px |
| Label–campo | 8px |
| Campo–ajuda | 4px |
| Largura de formulário | máximo recomendado 640px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Default.
- Hover.
- Focus visible.
- Filled.
- Disabled.
- Read-only.
- Warning.
- Error.

### Regras de iconografia

Ícones não são usados dentro da área, salvo ação clara fora do fluxo de digitação.

### Regras de conteúdo

Orientação sobre tipo de conteúdo, não frases genéricas. Contador somente quando limite afeta sucesso.

### Casos de uso

- Observações de cultivo, descrição, biografia, comentário e notas clínicas livres.

### Quando não utilizar

- Dados estruturados que precisam ser comparados ou analisados
- Texto de uma linha.

### Responsividade

Ocupa largura disponível; autoexpansão tem limite e depois rolagem; teclado não cobre ação persistente.

### Acessibilidade

Label e erro associados; suporte a navegação por teclado; não bloquear colagem; texto ampliado.

### Core, Grow, Med e temas

Mesmo componente em todos os contextos; conteúdo Med pode receber proteção sensível.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Altura fixa pequena.
- Campo sem label.
- Limite invisível.
- Scroll interno prematuro.

### Critérios de aceitação

- [ ] Mínimo 96px.
- [ ] Contador correto.
- [ ] Valor preservado.
- [ ] Erro anunciado.
- [ ] Redimensionamento previsível.

## 13. Numeric / Measurement Field

**Categoria:** Ações e formulários  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Coletar números, medições, doses e parâmetros com precisão, unidade e faixa contextual.

### Justificativa

Dados técnicos e clínicos não podem depender de texto livre. O componente separa valor, unidade, referência e validação, preservando comparabilidade.

### Anatomia

1. Label.
2. Entrada numérica.
3. Unidade persistente.
4. Controle de incremento opcional.
5. Faixa de referência opcional.
6. Texto auxiliar.
7. Mensagem de estado.

### Variantes permitidas

- Inteiro.
- Decimal.
- Com unidade.
- Com faixa de referência.
- Clínico.
- Técnico Grow.
- Com stepper.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Alturas | 44, 48 ou 56px conforme densidade |
| Padding | 12–16px |
| Unidade | visível e não editável quando possível |
| Stepper | alvos de 44px |
| Precisão | definida pelo domínio |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Default.
- Focus visible.
- Filled.
- Disabled.
- Read-only.
- Out-of-reference.
- Warning.
- Error.

### Regras de iconografia

Ícones raros; incremento/decremento usam símbolos universais com labels acessíveis.

### Regras de conteúdo

Mostrar unidade, limites e precisão. Diferenciar “inválido” de “fora da faixa recomendada”.

### Casos de uso

- pH, EC, temperatura, umidade, peso, dose, concentração, duração e quantidade.

### Quando não utilizar

- Valores qualitativos
- Opções discretas pequenas
- Números sem unidade conhecida tratados como texto.

### Responsividade

Largura acompanha magnitude do dado no desktop; full-width no mobile; teclado numérico apropriado.

### Acessibilidade

Valor e unidade anunciados juntos; sinais não dependem de cor; stepper operável por teclado.

### Core, Grow, Med e temas

Grow diferencia medido/calculado/recomendado; Med evita aparência diagnóstica e abreviações não explicadas.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Converter fora da vista do usuário.
- Arredondar silenciosamente.
- Usar verde Grow para “dentro da faixa”.
- Unidade dentro do placeholder.

### Critérios de aceitação

- [ ] Unidade inequívoca.
- [ ] Locale correto.
- [ ] Precisão consistente.
- [ ] Faixa não confundida com erro.
- [ ] Valor preservado.

## 14. Search Field

**Categoria:** Ações e formulários  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Permitir busca textual com estado ativo, limpeza e retorno de resultados.

### Justificativa

Busca é um comportamento, não apenas um campo com lupa. Um componente próprio padroniza debounce, limpeza, vazio e acessibilidade.

### Anatomia

1. Label acessível.
2. Ícone de busca.
3. Entrada.
4. Ação de limpar.
5. Indicador de loading opcional.

### Variantes permitidas

- Padrão.
- Compacta.
- Com sugestões.
- Dentro de barra de filtros.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Altura | 44–48px |
| Ícone | 20px |
| Padding | 12–16px |
| Ação limpar | alvo 44px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Idle.
- Focus visible.
- Typing.
- Loading.
- Results.
- No results.
- Error.

### Regras de iconografia

Lupa no início; limpar no final; loading não substitui label.

### Regras de conteúdo

Placeholder pode indicar escopo, como “Buscar genéticas”; resultado sem correspondência deve explicar filtros ativos.

### Casos de uso

- Busca de entidades, feed, comunidade, genéticas, produtos e configurações.

### Quando não utilizar

- Filtrar por opções estruturadas quando seletor é melhor
- Disparar busca sem indicar processamento.

### Responsividade

Pode ocupar largura total; sugestões viram sheet/overlay no mobile; preserva termo ao retornar.

### Acessibilidade

Role search, nome acessível, resultados anunciados sem interromper digitação, ação limpar nomeada.

### Core, Grow, Med e temas

Accent contextual no focus; resultados seguem contexto de origem e isolamento de comunidade.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Lupa como botão sem nome.
- Busca automática agressiva.
- Limpar termo ao erro.
- Misturar busca Grow/Med sem contexto.

### Critérios de aceitação

- [ ] Escopo claro.
- [ ] Loading previsto.
- [ ] No-results específico.
- [ ] Termo preservado.
- [ ] Resultados anunciáveis.

## 15. Select / Dropdown

**Categoria:** Ações e formulários  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Selecionar uma opção de lista média ou longa, com busca quando necessária.

### Justificativa

O componente evita dropdowns para escolhas pequenas e mantém consistência de menus, estados e comportamento mobile.

### Anatomia

1. Label.
2. Controle.
3. Valor ou placeholder.
4. Ícone de expansão.
5. Lista de opções.
6. Descrição opcional.
7. Mensagem de estado.

### Variantes permitidas

- Seleção única.
- Com busca.
- Com descrição.
- Com ícone.
- Hierárquico simples.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Controle | 44–48px |
| Linha de opção | mínimo 44px; 56px com descrição |
| Menu | elevação 2–3 |
| Padding | 12–16px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Closed.
- Hover.
- Focus visible.
- Open.
- Selected.
- Disabled.
- Error.
- Loading.

### Regras de iconografia

Chevron indica expansão; ícones de opção apenas reforçam texto.

### Regras de conteúdo

Placeholder “Selecione…” somente antes de escolha; opções em ordem estável; desabilitada explica motivo quando relevante.

### Casos de uso

- Catálogos longos: genética, fase, via, tipo de produto, ambiente.

### Quando não utilizar

- Duas opções
- Até 5–7 opções comparáveis que cabem como radio
- Ações imediatas.

### Responsividade

Popover no desktop; sheet ou menu seguro no mobile; largura não menor que controle; lista rolável.

### Acessibilidade

Semântica combobox/listbox; teclado completo; opção e estado anunciados; foco retorna ao controle.

### Core, Grow, Med e temas

A lista herda contexto; opções de Med não devem expor conteúdo sensível em previews.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Menu estreito.
- Ordem instável.
- Fechar sem preservar escolha.
- Dropdown dentro de dropdown.

### Critérios de aceitação

- [ ] Componente correto para quantidade.
- [ ] Teclado.
- [ ] Foco restaurado.
- [ ] Opções legíveis.
- [ ] Erro associado.

## 16. Radio Group

**Categoria:** Ações e formulários  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Apresentar opções mutuamente exclusivas visíveis e comparáveis.

### Justificativa

Expor opções reduz carga de memória e torna consequência mais transparente do que esconder em dropdown.

### Anatomia

1. Label do grupo.
2. Opções.
3. Radio visual.
4. Label por opção.
5. Descrição opcional.
6. Mensagem de estado.

### Variantes permitidas

- Vertical.
- Horizontal quando curto.
- Com descrição.
- Com ícone.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Radio | 20×20px |
| Alvo da opção | mínimo 44px |
| Linha com descrição | mínimo 56px |
| Gap entre opções | 8–12px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Unselected.
- Hover.
- Focus visible.
- Selected.
- Disabled.
- Error.

### Regras de iconografia

Ícone opcional nunca substitui label. Radio mantém forma circular.

### Regras de conteúdo

Labels paralelos e mutuamente exclusivos; consequência explicada quando não óbvia.

### Casos de uso

- Propósito inicial, tipo de ambiente, método, via ou escolha de escopo importante.

### Quando não utilizar

- Seleção múltipla
- Listas longas
- Efeito imediato binário.

### Responsividade

Vertical no mobile; horizontal somente se labels curtos e sem quebra; reflow sem alterar ordem.

### Acessibilidade

Fieldset/legend, setas ou Tab conforme padrão, estado e disabled anunciados.

### Core, Grow, Med e temas

Accent contextual indica seleção; nunca usar cor sem marcador interno.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Radio sem label.
- Opção pré-selecionada que implica consentimento.
- Mais de sete opções densas.

### Critérios de aceitação

- [ ] Grupo nomeado.
- [ ] Uma seleção.
- [ ] Alvo 44px.
- [ ] Consequência clara.
- [ ] Erro no grupo.

## 17. Checkbox

**Categoria:** Ações e formulários  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Permitir seleção independente, múltipla ou confirmação explícita.

### Justificativa

Checkbox diferencia escolhas independentes de estados imediatos e suporta estado misto em hierarquias.

### Anatomia

1. Checkbox visual.
2. Label.
3. Descrição opcional.
4. Estado misto opcional.

### Variantes permitidas

- Simples.
- Com descrição.
- Grupo múltiplo.
- Misto.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Visual | 20×20px |
| Alvo total | 44×44px mínimo |
| Gap label | 8–12px |
| Linha com descrição | mínimo 56px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Unchecked.
- Hover.
- Focus visible.
- Checked.
- Indeterminate.
- Disabled.
- Error.

### Regras de iconografia

Check interno sistematizado. Não usar ícone externo adicional para seleção.

### Regras de conteúdo

Label descreve o que será verdadeiro quando marcado. Consentimento nunca pré-marcado.

### Casos de uso

- Filtros múltiplos, confirmação de termos, inclusão de itens e seleção em lote.

### Quando não utilizar

- Efeito binário imediato
- Opções mutuamente exclusivas
- Consentimento implícito.

### Responsividade

Grupo quebra verticalmente; label pode envolver; alvo permanece.

### Acessibilidade

Label clicável; estado anunciado; indeterminate exposto; foco visível.

### Core, Grow, Med e temas

Accent contextual em seleção; crítico não é usado para unchecked.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Checkbox como bullet.
- Pré-seleção de consentimento.
- Label negativo confuso.
- Alvo apenas no quadrado.

### Critérios de aceitação

- [ ] Semântica correta.
- [ ] Alvo 44px.
- [ ] Estado misto previsto.
- [ ] Consentimento explícito.
- [ ] Erro do grupo.

## 18. Switch

**Categoria:** Ações e formulários  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Ativar ou desativar uma configuração binária com efeito imediato.

### Justificativa

O switch comunica mudança de estado persistente. Separá-lo de checkbox impede uso indevido para submissão ou seleção múltipla.

### Anatomia

1. Trilho.
2. Thumb.
3. Label.
4. Descrição opcional.
5. Estado atual.

### Variantes permitidas

- Padrão.
- Com descrição.
- Em item de configuração.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Dimensão | 48×28px |
| Thumb | aprox. 24px |
| Alvo | mínimo 44px de altura |
| Gap label | 12px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Off.
- Hover.
- Focus visible.
- Pressed.
- On.
- Disabled.
- Loading raro.
- Error de persistência.

### Regras de iconografia

Sem ícone no thumb como padrão. Label textual mantém significado.

### Regras de conteúdo

Label nomeia a configuração, não “Ligado/Desligado”. Resultado imediato deve ser compreensível.

### Casos de uso

- Notificações, Modo Discreto, preferências e recursos binários imediatos.

### Quando não utilizar

- Salvar formulário
- Escolha entre modos múltiplos
- Ação destrutiva sem confirmação.

### Responsividade

Permanece na extremidade da linha; texto envolve sem comprimir controle.

### Acessibilidade

Role switch, estado anunciado, operação por Space, área total clicável.

### Core, Grow, Med e temas

On usa accent contextual; erro de persistência usa feedback separado.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Switch que exige botão Salvar.
- Trocar label ao alternar.
- Ação irreversível imediata.

### Critérios de aceitação

- [ ] Efeito imediato.
- [ ] Dimensão oficial.
- [ ] Estado persistido ou erro comunicado.
- [ ] Label estável.
- [ ] Teclado.

## 19. Segmented Control

**Categoria:** Ações e formulários  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Alternar entre poucas opções equivalentes que modificam uma visualização local.

### Justificativa

O componente fornece comparação imediata sem abrir menu e evita tabs para mudanças que não alteram estrutura de navegação.

### Anatomia

1. Container.
2. Segmentos.
3. Label por segmento.
4. Indicador selecionado.

### Variantes permitidas

- Dois segmentos.
- Três ou quatro segmentos.
- Com ícone reforçador.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Altura | mínimo 44px |
| Segmento | alvo mínimo 44px |
| Padding horizontal | 12–16px |
| Radius | md no grupo; interno proporcional |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Default.
- Hover.
- Focus visible.
- Selected.
- Disabled.

### Regras de iconografia

Ícone opcional, sempre com texto salvo metáfora universal e espaço extremamente restrito aprovado.

### Regras de conteúdo

Labels curtos, paralelos e sem alteração ao selecionar.

### Casos de uso

- Período local, visualização lista/grade, agrupamento e modo de comparação.

### Quando não utilizar

- Navegação principal
- Mais de quatro opções
- Opções com descrição longa.

### Responsividade

Pode rolar horizontalmente apenas em exceção; preferir empilhar outro seletor quando não couber.

### Acessibilidade

Semântica radio ou tabs conforme efeito; setas/Tab; seleção não depende de cor.

### Core, Grow, Med e temas

Indicador usa accent contextual; estrutura idêntica nos módulos.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Segmentos com larguras arbitrárias.
- Ícones sem texto ambíguos.
- Misturar ação e filtro.

### Critérios de aceitação

- [ ] Até quatro opções.
- [ ] Altura 44px.
- [ ] Seleção inequívoca.
- [ ] Sem mudança de layout.
- [ ] Teclado.

## 20. Intensity Scale

**Categoria:** Ações e formulários  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Registrar intensidade de forma rápida, comparável e acessível.

### Justificativa

Uma escala compartilhada entre check-in e sessão mantém significado estável e melhora qualidade longitudinal dos dados.

### Anatomia

1. Pergunta/label.
2. Escala ou pontos.
3. Valor selecionado.
4. Labels de extremos.
5. Ajuda opcional.

### Variantes permitidas

- Discreta 0–10.
- Poucos níveis rotulados.
- Com valor numérico.
- Antes/Depois.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Área de seleção | mínimo 44px de altura |
| Ponto visual | mínimo 20px; alvo 44px |
| Valor | mínimo 16px |
| Labels extremos | mínimo 14px |
| Gap | 8–12px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Initial sem valor.
- Hover.
- Focus visible.
- Selected.
- Disabled.
- Error.

### Regras de iconografia

Ícones emocionais não substituem números/labels e devem ser evitados em contexto clínico.

### Regras de conteúdo

Extremos explícitos e estáveis; mesma direção sempre representa maior intensidade; “não se aplica” é opção separada quando válida.

### Casos de uso

- Dor, ansiedade, humor, apetite, severidade e avaliações antes/depois.

### Quando não utilizar

- Métricas contínuas precisas
- Escalas com direção invertida
- Resultados diagnósticos.

### Responsividade

Labels podem mover para acima/abaixo, nunca desaparecer. Pontos mantêm alvo em telas estreitas.

### Acessibilidade

Operação por setas, valor anunciado com extremos, foco visível, alternativa textual.

### Core, Grow, Med e temas

Grow e Med usam a mesma estrutura, mas labels de domínio variam. Cor não indica “bom/ruim” automaticamente.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Gradiente vermelho–verde como significado único.
- Faces emoji.
- Valor pré-selecionado.
- Escala sem extremos.

### Critérios de aceitação

- [ ] Direção estável.
- [ ] Sem valor inicial.
- [ ] Alvo 44px.
- [ ] Labels presentes.
- [ ] Teclado e leitor de tela.

## 21. Date Picker

**Categoria:** Ações e formulários  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Selecionar uma data com contexto de calendário e validação temporal.

### Justificativa

A temporalidade é central ao Grow e ao Med. Componentes especializados evitam formatos ambíguos, erros de fuso e inconsistência entre filtros e registros.

### Anatomia

1. Label.
2. Valor formatado.
3. Ação de abrir seletor.
4. Calendário/relógio.
5. Texto auxiliar.
6. Mensagem de estado.

### Variantes permitidas

- Data única.
- Data aproximada.
- Com restrições.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Controle | 44–48px |
| Alvo de dia/hora | 44×44px |
| Popover | elevação 3 |
| Mobile | sheet ou tela segura |
| Formato | locale do usuário |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Idle.
- Focus visible.
- Open.
- Selected.
- Disabled.
- Error.
- Unavailable.

### Regras de iconografia

Calendário ou relógio reforçam função; setas de navegação têm labels acessíveis.

### Regras de conteúdo

Usar formato local e valor textual inequívoco. Indicar fuso quando afeta significado. Restrições devem ser explicadas.

### Casos de uso

- Início/fim de tratamento, eventos, colheita, fase e registros retroativos.

### Quando não utilizar

- Horário isolado
- Período com comparação quando Date Range é mais adequado.

### Responsividade

Popover em desktop e sheet/tela no mobile; não cortar calendário; teclado virtual não deve cobrir ação.

### Acessibilidade

Navegação por teclado; dias desabilitados anunciados; valor completo; erro associado; não depender de cor para seleção.

### Core, Grow, Med e temas

Mesma estrutura em todos os contextos; datas sensíveis respeitam privacidade e Modo Discreto.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Formato fixo estrangeiro.
- Datas desabilitadas sem motivo.
- Fechar sem confirmar valor quando confirmação for necessária.
- Fuso implícito em evento crítico.

### Critérios de aceitação

- [ ] Locale correto.
- [ ] Restrições claras.
- [ ] Alvo 44px.
- [ ] Teclado.
- [ ] Valor preservado.

## 22. Time Picker

**Categoria:** Ações e formulários  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Selecionar horário local ou recorrente com formato de locale.

### Justificativa

A temporalidade é central ao Grow e ao Med. Componentes especializados evitam formatos ambíguos, erros de fuso e inconsistência entre filtros e registros.

### Anatomia

1. Label.
2. Valor formatado.
3. Ação de abrir seletor.
4. Calendário/relógio.
5. Texto auxiliar.
6. Mensagem de estado.

### Variantes permitidas

- Horário único.
- Com recorrência.
- Com fuso quando relevante.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Controle | 44–48px |
| Alvo de dia/hora | 44×44px |
| Popover | elevação 3 |
| Mobile | sheet ou tela segura |
| Formato | locale do usuário |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Idle.
- Focus visible.
- Open.
- Selected.
- Disabled.
- Error.
- Unavailable.

### Regras de iconografia

Calendário ou relógio reforçam função; setas de navegação têm labels acessíveis.

### Regras de conteúdo

Usar formato local e valor textual inequívoco. Indicar fuso quando afeta significado. Restrições devem ser explicadas.

### Casos de uso

- Dose, lembrete, tarefa e sessão.

### Quando não utilizar

- Duração
- Data completa.

### Responsividade

Popover em desktop e sheet/tela no mobile; não cortar calendário; teclado virtual não deve cobrir ação.

### Acessibilidade

Navegação por teclado; dias desabilitados anunciados; valor completo; erro associado; não depender de cor para seleção.

### Core, Grow, Med e temas

Mesma estrutura em todos os contextos; datas sensíveis respeitam privacidade e Modo Discreto.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Formato fixo estrangeiro.
- Datas desabilitadas sem motivo.
- Fechar sem confirmar valor quando confirmação for necessária.
- Fuso implícito em evento crítico.

### Critérios de aceitação

- [ ] Locale correto.
- [ ] Restrições claras.
- [ ] Alvo 44px.
- [ ] Teclado.
- [ ] Valor preservado.

## 23. Date-Time Picker

**Categoria:** Ações e formulários  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Selecionar data e horário como um único instante.

### Justificativa

A temporalidade é central ao Grow e ao Med. Componentes especializados evitam formatos ambíguos, erros de fuso e inconsistência entre filtros e registros.

### Anatomia

1. Label.
2. Valor formatado.
3. Ação de abrir seletor.
4. Calendário/relógio.
5. Texto auxiliar.
6. Mensagem de estado.

### Variantes permitidas

- Combinado.
- Agora.
- Retroativo.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Controle | 44–48px |
| Alvo de dia/hora | 44×44px |
| Popover | elevação 3 |
| Mobile | sheet ou tela segura |
| Formato | locale do usuário |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Idle.
- Focus visible.
- Open.
- Selected.
- Disabled.
- Error.
- Unavailable.

### Regras de iconografia

Calendário ou relógio reforçam função; setas de navegação têm labels acessíveis.

### Regras de conteúdo

Usar formato local e valor textual inequívoco. Indicar fuso quando afeta significado. Restrições devem ser explicadas.

### Casos de uso

- Eventos técnicos, dose e registro com instante preciso.

### Quando não utilizar

- Quando só um dos valores é necessário.

### Responsividade

Popover em desktop e sheet/tela no mobile; não cortar calendário; teclado virtual não deve cobrir ação.

### Acessibilidade

Navegação por teclado; dias desabilitados anunciados; valor completo; erro associado; não depender de cor para seleção.

### Core, Grow, Med e temas

Mesma estrutura em todos os contextos; datas sensíveis respeitam privacidade e Modo Discreto.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Formato fixo estrangeiro.
- Datas desabilitadas sem motivo.
- Fechar sem confirmar valor quando confirmação for necessária.
- Fuso implícito em evento crítico.

### Critérios de aceitação

- [ ] Locale correto.
- [ ] Restrições claras.
- [ ] Alvo 44px.
- [ ] Teclado.
- [ ] Valor preservado.

## 24. Date Range Picker

**Categoria:** Ações e formulários  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Selecionar período com início e fim para filtros, relatórios e comparações.

### Justificativa

A temporalidade é central ao Grow e ao Med. Componentes especializados evitam formatos ambíguos, erros de fuso e inconsistência entre filtros e registros.

### Anatomia

1. Label.
2. Valor formatado.
3. Ação de abrir seletor.
4. Calendário/relógio.
5. Texto auxiliar.
6. Mensagem de estado.

### Variantes permitidas

- Período livre.
- Presets.
- Período máximo.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Controle | 44–48px |
| Alvo de dia/hora | 44×44px |
| Popover | elevação 3 |
| Mobile | sheet ou tela segura |
| Formato | locale do usuário |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Idle.
- Focus visible.
- Open.
- Selected.
- Disabled.
- Error.
- Unavailable.

### Regras de iconografia

Calendário ou relógio reforçam função; setas de navegação têm labels acessíveis.

### Regras de conteúdo

Usar formato local e valor textual inequívoco. Indicar fuso quando afeta significado. Restrições devem ser explicadas.

### Casos de uso

- Relatórios, séries temporais, filtros e comparação.

### Quando não utilizar

- Datas independentes sem relação.

### Responsividade

Popover em desktop e sheet/tela no mobile; não cortar calendário; teclado virtual não deve cobrir ação.

### Acessibilidade

Navegação por teclado; dias desabilitados anunciados; valor completo; erro associado; não depender de cor para seleção.

### Core, Grow, Med e temas

Mesma estrutura em todos os contextos; datas sensíveis respeitam privacidade e Modo Discreto.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Formato fixo estrangeiro.
- Datas desabilitadas sem motivo.
- Fechar sem confirmar valor quando confirmação for necessária.
- Fuso implícito em evento crítico.

### Critérios de aceitação

- [ ] Locale correto.
- [ ] Restrições claras.
- [ ] Alvo 44px.
- [ ] Teclado.
- [ ] Valor preservado.

## 25. Filter Bar

**Categoria:** Ações e formulários  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Agrupar busca, filtros, ordenação e contagem sem competir com conteúdo.

### Justificativa

Filtros fragmentados geram combinações inconsistentes. Uma barra estabelece ordem, persistência e resumo do estado aplicado.

### Anatomia

1. Busca opcional.
2. Ação Filtros.
3. Chips aplicados.
4. Ordenação.
5. Contagem de resultados.
6. Limpar.

### Variantes permitidas

- Compacta.
- Padrão.
- Desktop expandida.
- Mobile em sheet.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Altura dos controles | 44px |
| Gap | 8–12px |
| Chips | 36px visual; alvo 44px |
| Espaço para grupo | 16px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Idle.
- Active filters.
- Loading.
- No results.
- Error.

### Regras de iconografia

Ícones de filtro, ordenar e limpar sempre acompanhados de label quando significado não for universal.

### Regras de conteúdo

Exibir número de filtros ativos e termos legíveis; “Limpar tudo” só aparece quando há estado.

### Casos de uso

- Listagens, comunidade, relatórios, timeline e galeria.

### Quando não utilizar

- Formulário de criação
- Filtros que alteram regra de negócio.

### Responsividade

Desktop pode mostrar controles; mobile abre sheet e mantém chips/resumo visível.

### Acessibilidade

Grupo nomeado; ordem de foco; alterações anunciadas; resultados atualizados sem perda de foco.

### Core, Grow, Med e temas

Herda accent do contexto somente para estados selecionados.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Muitos controles em uma linha.
- Filtros escondidos sem contador.
- Reset automático ao navegar para detalhe.

### Critérios de aceitação

- [ ] Estado persistido.
- [ ] Resumo visível.
- [ ] Mobile resolvido.
- [ ] No-results considera filtros.
- [ ] Teclado.

## 26. Upload & Media Capture

**Categoria:** Ações e formulários  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Selecionar, capturar, visualizar e enviar mídia com progresso, falha e pendência offline.

### Justificativa

Mídia é evidência importante e pode ser sensível. Um fluxo único protege conteúdo, comunica upload e evita perda de arquivos.

### Anatomia

1. Área de ação.
2. Opções câmera/arquivo.
3. Preview.
4. Nome/metadado.
5. Progresso.
6. Ações cancelar/retry/remover.
7. Mensagem de estado.

### Variantes permitidas

- Arquivo único.
- Múltiplos.
- Captura de câmera.
- Com legenda.
- Sensível.
- Pendente offline.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Área de ação | mínimo 44px; dropzone desktop pode ser maior |
| Thumbnail | 56px padrão |
| Ações | 44×44px |
| Gap | 12–16px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Idle.
- Permission required.
- Capturing.
- Selected.
- Uploading.
- Uploaded.
- Pending offline.
- Error.
- Cancelled.

### Regras de iconografia

Câmera, arquivo, remover e retry usam ícones oficiais com labels.

### Regras de conteúdo

Informar formatos/limites antes da seleção. Erro identifica arquivo e próxima ação. Legenda não substitui alt text.

### Casos de uso

- Fotos de cultivo, mídia de comunidade, documentos/exames autorizados e avatar.

### Quando não utilizar

- Upload invisível
- Apagar original local sem confirmação
- Expor preview sensível.

### Responsividade

Mobile usa câmera/galeria; desktop aceita seleção e drag-and-drop como complemento; estado persiste ao navegar quando permitido.

### Acessibilidade

Permissão explicada antes do prompt; progresso anunciado; ações nomeadas; não depender de drag.

### Core, Grow, Med e temas

Med aplica proteção elevada; Modo Discreto substitui preview; contexto não cruza mídia sem consentimento.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Spinner sem nome de arquivo.
- Retry global para múltiplos erros.
- Remoção sem desfazer/confirmação quando já salvo.

### Critérios de aceitação

- [ ] Permissões tratadas.
- [ ] Preview seguro.
- [ ] Progresso determinado quando possível.
- [ ] Offline previsto.
- [ ] Erro por arquivo.

## 27. Bottom Navigation

**Categoria:** Navegação  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Fornecer acesso persistente às áreas primárias no mobile.

### Justificativa

A navegação inferior posiciona destinos frequentes ao alcance do polegar e mantém estrutura consistente entre contextos.

### Anatomia

1. Container.
2. Itens.
3. Ícone.
4. Label.
5. Indicador ativo.
6. Badge opcional.

### Variantes permitidas

- Core.
- Grow.
- Med.
- Com badge de contagem.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Altura | 64px + safe area |
| Item | mínimo 48px de largura; alvo 44px |
| Ícone | 24px |
| Label | 12–14px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Inactive.
- Pressed.
- Focus visible.
- Active.
- Badge.

### Regras de iconografia

Ícone sempre com label. Preenchimento para ativo somente se sistematizado.

### Regras de conteúdo

Destinos curtos e estáveis. Não usar para notificações/privacidade como itens primários se a IA aprovada não os inclui.

### Casos de uso

- Dashboard, Comunidade, Configurações e destinos primários aprovados.

### Quando não utilizar

- Ações de criação
- Mais de cinco destinos
- Itens que mudam por tela.

### Responsividade

Exclusiva do mobile; corresponde à Sidebar em telas amplas; respeita safe area.

### Acessibilidade

Role navigation, item ativo anunciado, ordem estável, alvo mínimo.

### Core, Grow, Med e temas

Accent do contexto no item ativo; Modo Discreto não altera arquitetura.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Label oculto.
- Botão flutuante central não documentado.
- Cores diferentes por item.
- Reordenar destinos por uso.

### Critérios de aceitação

- [ ] Quantidade aprovada.
- [ ] Correspondência com Sidebar.
- [ ] Safe area.
- [ ] Label sempre visível.
- [ ] Ativo inequívoco.

## 28. Sidebar Navigation

**Categoria:** Navegação  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Fornecer navegação primária e contextual em tablet e desktop.

### Justificativa

A Sidebar preserva destinos da Bottom Navigation e aproveita largura sem criar arquitetura paralela.

### Anatomia

1. Container.
2. Marca/contexto.
3. Itens.
4. Ícone.
5. Label.
6. Indicador ativo.
7. Área de conta opcional.

### Variantes permitidas

- Compacta.
- Expandida.
- Overlay aprovado.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Compacta | 72px |
| Expandida | 240–280px |
| Item | mínimo 44px de altura |
| Ícone | 24px |
| Top bar coexistente | 64px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Inactive.
- Hover.
- Focus visible.
- Active.
- Collapsed.
- Expanded.

### Regras de iconografia

Ícones com labels na expandida; compacta exige tooltip e nome acessível.

### Regras de conteúdo

Destinos iguais ao mobile. Rótulos não mudam entre estados.

### Casos de uso

- Tablet e desktop, navegação persistente e alternância de contexto aprovada.

### Quando não utilizar

- Reduzir conteúdo abaixo da largura mínima
- Criar árvore profunda como navegação primária.

### Responsividade

Alterna expandida/compacta conforme espaço; overlay somente quando aprovado; conteúdo respeita max-width.

### Acessibilidade

Landmark navigation, foco, tooltip na compacta e item ativo anunciado.

### Core, Grow, Med e temas

Acento contextual; Core gerencia transição entre módulos sem misturar identidades.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Sidebar com cores de app em fundo inteiro.
- Submenus ilimitados.
- Ícone sem tooltip na compacta.

### Critérios de aceitação

- [ ] Largura oficial.
- [ ] Destinos equivalentes ao mobile.
- [ ] Conteúdo não comprimido.
- [ ] Teclado.
- [ ] Ativo claro.

## 29. Top App Bar / Page Header

**Categoria:** Navegação  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Identificar página, contexto e ações principais sem competir com o conteúdo.

### Justificativa

Um cabeçalho único mantém retorno, título e ações previsíveis em todos os fluxos.

### Anatomia

1. Botão voltar opcional.
2. Título.
3. Subtítulo/contexto opcional.
4. Ação principal opcional.
5. Ações secundárias/menu.

### Variantes permitidas

- Mobile.
- Desktop.
- Sticky.
- Transparente sobre conteúdo somente em caso aprovado.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Mobile | 56px |
| Desktop | 64px |
| Ações | 44×44px |
| Gap | 8–16px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Default.
- Scrolled.
- Focus within.
- With loading/status.

### Regras de iconografia

Voltar, menu e ações secundárias usam ícones oficiais; ação principal prefere label.

### Regras de conteúdo

Um título principal por tela; títulos longos envolvem ou truncam apenas com acesso ao completo.

### Casos de uso

- Todas as telas de aplicação e detalhes.

### Quando não utilizar

- Repetir informações do conteúdo
- Exibir muitas ações
- Ocultar contexto do app.

### Responsividade

Mobile prioriza voltar+título+uma ação; ações extras em overflow. Desktop permite mais espaço.

### Acessibilidade

Heading correto, foco restaurado ao navegar, ações nomeadas, sticky não oculta conteúdo.

### Core, Grow, Med e temas

Accent aparece em ação/estado, não em fundo completo. Transição Core/Grow/Med é explícita.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Duas linhas fixas sem necessidade.
- Título central que muda alinhamento entre telas.
- Ação crítica apenas por ícone.

### Critérios de aceitação

- [ ] Altura oficial.
- [ ] Título único.
- [ ] Máximo de ações.
- [ ] Retorno previsível.
- [ ] Contexto visível.

## 30. Tabs

**Categoria:** Navegação  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Alternar entre seções irmãs dentro do mesmo contexto e nível hierárquico.

### Justificativa

Tabs padronizadas evitam navegação secundária fragmentada e preservam estado entre conteúdos relacionados.

### Anatomia

1. Tablist.
2. Tabs.
3. Label.
4. Contagem opcional.
5. Indicador ativo.

### Variantes permitidas

- Fixas.
- Roláveis.
- Com contagem.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Altura mobile | mínimo 44px |
| Desktop | 40px mínimo; 44px preferencial |
| Padding horizontal | 12–16px |
| Gap | 0–8px conforme estilo |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Inactive.
- Hover.
- Focus visible.
- Active.
- Disabled raro.

### Regras de iconografia

Ícones raros; não substituir labels. Contagem é texto/badge neutro.

### Regras de conteúdo

Labels curtos e paralelos. Não alterar nome conforme conteúdo.

### Casos de uso

- Seções de detalhe, feeds ou visualizações relacionadas.

### Quando não utilizar

- Ação binária local
- Navegação primária
- Segundo nível de tabs do mesmo peso.

### Responsividade

Roláveis em telas estreitas; ativo permanece visível; conteúdo preserva posição quando apropriado.

### Acessibilidade

Role tablist/tab/tabpanel; setas; estado active; foco distinto da seleção.

### Core, Grow, Med e temas

Accent contextual no indicador; estrutura idêntica.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Tabs dentro de tabs equivalentes.
- Contagem colorida sem semântica.
- Truncamento severo.

### Critérios de aceitação

- [ ] Um nível.
- [ ] Altura correta.
- [ ] Teclado.
- [ ] Ativo visível.
- [ ] Conteúdo associado.

## 31. Back Navigation / Breadcrumb

**Categoria:** Navegação  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Permitir retorno previsível e representar hierarquia em telas profundas.

### Justificativa

Voltar e breadcrumb resolvem necessidades diferentes: histórico no mobile e localização hierárquica em desktop.

### Anatomia

1. Ação voltar.
2. Trilha de ancestrais no desktop.
3. Item atual.
4. Separadores.

### Variantes permitidas

- Voltar mobile.
- Breadcrumb desktop.
- Breadcrumb truncado.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Botão voltar | 44×44px |
| Breadcrumb | 32–40px de altura |
| Gap | 8px |
| Ícone | 20–24px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Default.
- Hover.
- Focus visible.
- Current.

### Regras de iconografia

Seta de voltar; chevron como separador, ignorado por leitor de tela.

### Regras de conteúdo

Ancestrais com labels reais. Item atual não é link. Títulos longos truncam com acesso ao completo.

### Casos de uso

- Planta → Ciclo → Ambiente, detalhe de tratamento e configurações profundas.

### Quando não utilizar

- Representar histórico complexo como breadcrumb
- Usar em telas de primeiro nível.

### Responsividade

Mobile usa voltar; desktop pode combinar breadcrumb e título. Preserva filtros e posição da origem.

### Acessibilidade

Landmark breadcrumb, aria-current equivalente, foco após navegação.

### Core, Grow, Med e temas

Neutro; accent somente em link/focus conforme contexto.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Voltar para destino fixo incorreto.
- Breadcrumb com todos os cliques históricos.
- Separador lido como texto.

### Critérios de aceitação

- [ ] Destino correto.
- [ ] Estado preservado.
- [ ] Item atual claro.
- [ ] Teclado.
- [ ] Sem redundância.

## 32. Pagination

**Categoria:** Navegação  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Navegar entre páginas discretas de dados mantendo posição e contexto.

### Justificativa

Paginação explícita é útil em desktop, relatórios e listas onde orientação e retorno importam.

### Anatomia

1. Anterior.
2. Números de página.
3. Atual.
4. Próximo.
5. Resumo opcional.

### Variantes permitidas

- Compacta.
- Completa.
- Anterior/Próximo.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Controle | 44×44px alvo |
| Gap | 4–8px |
| Altura | 44px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Default.
- Hover.
- Focus visible.
- Current.
- Disabled.
- Loading.

### Regras de iconografia

Setas acompanham nome acessível. Números são texto.

### Regras de conteúdo

Resumo como “21–40 de 120”; nunca depender de reticências sem contexto.

### Casos de uso

- Tabelas, administração, busca e relatórios extensos.

### Quando não utilizar

- Feeds contínuos mobile
- Listas curtas.

### Responsividade

Pode simplificar para anterior/próximo no mobile; posição da lista e filtros são preservados.

### Acessibilidade

Nav nomeada; atual anunciado; links acessíveis; foco no início do novo conteúdo.

### Core, Grow, Med e temas

Accent contextual no atual; sem cores locais.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Muitos números.
- Recarregar e perder filtros.
- Botões menores que 44px.

### Critérios de aceitação

- [ ] Total e atual claros.
- [ ] Estado preservado.
- [ ] Alvo mínimo.
- [ ] Loading comunicado.

## 33. Incremental Loading / Continuation

**Categoria:** Navegação  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Carregar mais itens de uma lista sem perder continuidade ou posição.

### Justificativa

Feeds e timelines precisam de continuidade, mas infinito sem controle prejudica orientação. O componente explicita carregamento, fim e retry.

### Anatomia

1. Sentinela ou ação Carregar mais.
2. Indicador.
3. Mensagem de fim.
4. Retry.

### Variantes permitidas

- Automático controlado.
- Botão Carregar mais.
- Timeline.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Ação | 44px de altura |
| Área de status | padding 16–24px |
| Spinner | 20–24px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Idle.
- Loading more.
- Loaded.
- End.
- Error.

### Regras de iconografia

Spinner e retry usam ícones oficiais; status possui texto.

### Regras de conteúdo

“Fim dos resultados” ou mensagem contextual. Erro não remove itens já carregados.

### Casos de uso

- Feed, timeline, galeria e listas mobile.

### Quando não utilizar

- Conteúdo onde página é unidade de trabalho
- Carregar indefinidamente sem orientação.

### Responsividade

Mantém scroll; desktop pode preferir paginação; retorno ao detalhe restaura posição.

### Acessibilidade

Novos itens anunciados sem mover foco; ação acessível; fim comunicado.

### Core, Grow, Med e temas

Neutro, com accent apenas na ação.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Spinner eterno.
- Duplicar itens.
- Ocultar erro.
- Perder posição ao voltar.

### Critérios de aceitação

- [ ] Posição preservada.
- [ ] Fim previsto.
- [ ] Retry local.
- [ ] Sem duplicação.
- [ ] Anúncio acessível.

## 34. Step Indicator

**Categoria:** Navegação  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Mostrar progresso e localização em onboarding ou formulário multietapas.

### Justificativa

A indicação de etapas reduz incerteza e permite distribuir complexidade sem ocultar extensão do fluxo.

### Anatomia

1. Lista de etapas ou barra.
2. Etapa atual.
3. Concluídas.
4. Futuras.
5. Label opcional.

### Variantes permitidas

- Numérico.
- Barra de progresso por etapas.
- Compacto mobile.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Alvo quando navegável | 44px |
| Indicador visual | 20–28px |
| Gap | 8–16px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Upcoming.
- Current.
- Completed.
- Error.
- Disabled/not reachable.

### Regras de iconografia

Check pode indicar concluído; erro usa semântica crítica com texto.

### Regras de conteúdo

Mostrar “Etapa X de Y” no mobile quando labels não couberem; não prometer etapas ocultas.

### Casos de uso

- Onboarding, criação complexa e configurações guiadas.

### Quando não utilizar

- Fluxos curtos de uma tela
- Etapas que mudam dinamicamente sem explicação.

### Responsividade

Compacta para mobile; lista completa em desktop; não remover no texto ampliado.

### Acessibilidade

Current e completed anunciados; navegação somente quando permitida; não depender de cor.

### Core, Grow, Med e temas

Accent contextual para current/completed; erro separado.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Progresso falso.
- Pular números.
- Tornar todas as etapas clicáveis sem suporte.

### Critérios de aceitação

- [ ] Total correto.
- [ ] Atual inequívoca.
- [ ] Erro previsto.
- [ ] Responsivo.
- [ ] Acessível.

## 35. Overflow Menu / Popover

**Categoria:** Navegação  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Agrupar ações secundárias sem sobrecarregar a superfície principal.

### Justificativa

O limite de ações exige um destino consistente para opções adicionais. Menu não deve virar fluxo ou substituir navegação estruturada.

### Anatomia

1. Trigger.
2. Surface elevada.
3. Itens.
4. Ícones opcionais.
5. Separadores raros.
6. Item destrutivo opcional.

### Variantes permitidas

- Menu de ações.
- Popover informativo curto.
- Context menu.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Trigger | 44×44px |
| Item | mínimo 44px |
| Largura | suficiente para label; não menor que trigger em select |
| Elevação | 2–3 |
| Radius | md |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Closed.
- Open.
- Hover.
- Focus visible.
- Disabled item.

### Regras de iconografia

Trigger “mais” com label acessível. Ícones reforçam, não substituem labels.

### Regras de conteúdo

Verbos específicos; destrutiva separada visualmente; máximo de agrupamentos necessário.

### Casos de uso

- Ações secundárias de card, página, mídia e lista.

### Quando não utilizar

- Formulário longo
- Segundo popover
- Navegação primária.

### Responsividade

Popover desktop; sheet/menu seguro no mobile se conteúdo não couber; não sair da viewport.

### Acessibilidade

Foco preso/restaurado conforme padrão, setas/Enter/Escape, itens nomeados.

### Core, Grow, Med e temas

Superfície neutra; semântica apenas em item destrutivo/estado.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Popover dentro de popover.
- Ações sem label.
- Fluxo multietapas.
- Fechar e perder alteração.

### Critérios de aceitação

- [ ] Alvo 44px.
- [ ] Foco restaurado.
- [ ] Sem aninhamento.
- [ ] Labels claros.
- [ ] Viewport segura.

## 36. Counter Badge

**Categoria:** Dados e conteúdo  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Exibir uma contagem curta associada a navegação, item ou ação.

### Justificativa

Contadores precisam de limite e semântica próprios para não competir com Badge de Status.

### Anatomia

1. Container.
2. Número ou marcador.
3. Nome acessível no elemento associado.

### Variantes permitidas

- Numérico.
- Ponto sem número.
- Máximo abreviado.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Altura | 20–24px |
| Padding | 6–8px |
| Mínimo | 20px |
| Texto | 12px Medium |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Default.
- Updated.
- Hidden when zero conforme regra.

### Regras de iconografia

Não usa ícone.

### Regras de conteúdo

Mostrar número até limite aprovado; acima, formato como “99+”. Ponto só quando número não agrega.

### Casos de uso

- Itens não vistos, notificações contextuais e comentários.

### Quando não utilizar

- Status, categoria ou métrica principal.

### Responsividade

Mantém posição sem deslocar label; não cobre ícone; no texto ampliado pode mover.

### Acessibilidade

Nome acessível inclui significado, como “3 alertas não vistos”.

### Core, Grow, Med e temas

Semântica da contagem define cor; não usar crítico só para chamar atenção.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Badge pulsante.
- Contagem sem contexto.
- Cobrir ícone.
- Múltiplos contadores no mesmo item.

### Critérios de aceitação

- [ ] Número correto.
- [ ] Label acessível.
- [ ] Sem layout shift.
- [ ] Uso não semântico.

## 37. Status Badge

**Categoria:** Dados e conteúdo  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Comunicar um único estado, fase, privacidade, categoria ou condição curta.

### Justificativa

Um componente único impede pills multicoloridos e separa semântica de identidade.

### Anatomia

1. Container.
2. Label.
3. Ícone opcional.

### Variantes permitidas

- Neutro.
- Informativo.
- Sucesso.
- Atenção.
- Crítico.
- Fase.
- Privacidade.
- IA.
- Premium.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Pequeno | 24px; padding 8px |
| Médio | 28px; padding 10px |
| Máximo | 32px |
| Ícone | 16–20px |
| Gap | 4–8px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Default.
- Interactive somente se explicitamente controle.
- Discreet.

### Regras de iconografia

Ícone acompanha texto em estados de risco/privacidade quando agrega. Não usar ícone sozinho.

### Regras de conteúdo

Uma linha, poucas palavras e um estado. Não escrever frases.

### Casos de uso

- Fase de ciclo, ativo, pendente, privado, validado, Premium e origem IA.

### Quando não utilizar

- Ação
- Mensagem de erro completa
- Múltiplos estados em um badge.

### Responsividade

Quebra de grupo, mas badge individual não trunca estado crítico. Máximo dois em card de entidade.

### Acessibilidade

Texto e ícone; contraste; significado não depende da cor.

### Core, Grow, Med e temas

Accent só em fase/contexto quando não conflita; semântica sempre usa tokens próprios.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Badge alto como botão.
- Muitas cores.
- Verde Grow como sucesso.
- Vários badges por item.

### Critérios de aceitação

- [ ] Um estado.
- [ ] Altura oficial.
- [ ] Cor correta.
- [ ] Texto curto.
- [ ] Acessível.

## 38. Entity Card

**Categoria:** Dados e conteúdo  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Representar entidades diferentes com uma anatomia comum, slots controlados e navegação previsível.

### Justificativa

A composição por slots permite escalar para novas entidades sem criar cards paralelos e reduz card soup.

### Anatomia

1. Surface.
2. Identidade/título.
3. Tipo/contexto.
4. Até dois status.
5. Metadados.
6. Até três métricas.
7. Mídia opcional.
8. Ação principal implícita.
9. Menu secundário.

### Variantes permitidas

- Compacto.
- Padrão.
- Expandido.
- Clicável.
- Estático.
- Com mídia.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Padding mobile | 16px padrão; 12px compacto |
| Padding desktop | 20–24px padrão; 12–16px compacto |
| Gap interno | 12–16px |
| Gap entre cards | 12px mobile; 16–24px desktop |
| Radius | md |
| Elevação | 0–1 |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Default.
- Hover.
- Focus visible.
- Pressed.
- Selected.
- Disabled.
- Loading.
- Error.
- Private.

### Regras de iconografia

Ícones apenas para tipo, status ou ações. Menu overflow 44×44px.

### Regras de conteúdo

Título curto; metadata essencial; valores com unidade; no máximo uma ação direta além da navegação.

### Casos de uso

- Planta, Ciclo, Ambiente, Genética, Lote, Tratamento, Produto e Modelo.

### Quando não utilizar

- Agrupar campos sem identidade própria
- Formulário
- Mensagem de feedback.

### Responsividade

Lista horizontal no mobile; grid controlado em telas amplas; altura cresce com conteúdo; sem altura fixa com texto ampliado.

### Acessibilidade

Toda superfície focável quando clicável; heading coerente; ações internas separadas; status anunciado.

### Core, Grow, Med e temas

A anatomia não muda entre Core/Grow/Med. Conteúdo e accent contextual variam.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Card dentro de card.
- Fundo inteiro em accent.
- Ações demais.
- Anatomia específica por entidade.
- Hover indispensável no mobile.

### Critérios de aceitação

- [ ] Slots limitados.
- [ ] Mesma anatomia.
- [ ] Foco e alvo.
- [ ] Responsive.
- [ ] Loading/error/private.
- [ ] Sem card soup.

## 39. List Item

**Categoria:** Dados e conteúdo  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Apresentar conteúdo repetido em linha com densidade e alinhamento consistentes.

### Justificativa

Listas são mais eficientes que cards para alto volume. Um item base evita variação de alturas, ações e divisores.

### Anatomia

1. Leading opcional.
2. Título.
3. Descrição/metadado.
4. Status/métrica.
5. Trailing action ou chevron.

### Variantes permitidas

- Simples.
- Com ícone.
- Com imagem.
- Com avatar.
- Com status.
- Selecionável.
- Expansível.
- Sensível.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Compacto mobile | mínimo 48px |
| Padrão mobile | mínimo 56px |
| Com descrição/mídia | mínimo 64px |
| Desktop | 44–60px conforme variante |
| Padding horizontal | 12–16px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Default.
- Hover.
- Focus visible.
- Pressed.
- Selected.
- Disabled.
- Loading.
- Error.

### Regras de iconografia

Leading 20–24px; trailing 20px; icon button mantém 44px.

### Regras de conteúdo

Título uma ou duas linhas conforme criticidade; descrição clara; métricas com unidade.

### Casos de uso

- Configurações, resultados, tarefas, eventos, comentários e seleção.

### Quando não utilizar

- Conteúdo rico que exige múltiplas métricas
- Card promocional.

### Responsividade

Full-width no mobile; densidade compacta no desktop; ações extras em menu; conteúdo não crítico pode truncar.

### Acessibilidade

Linha inteira focável quando navegável; ordem de leitura; ações separadas; status anunciado.

### Core, Grow, Med e temas

Neutro; accent apenas em selected/active.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Misturar alturas aleatórias.
- Muitos trailing controls.
- Divisor em excesso.
- Swipe como única ação.

### Critérios de aceitação

- [ ] Altura mínima.
- [ ] Anatomia estável.
- [ ] Alvo de linha.
- [ ] Ação separada.
- [ ] Texto ampliado.

## 40. Timeline

**Categoria:** Dados e conteúdo  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Organizar eventos cronológicos, mídia e métricas em uma narrativa temporal.

### Justificativa

Grow e Med compartilham necessidade longitudinal. Uma timeline única permite eventos de domínio sem duplicar estrutura.

### Anatomia

1. Agrupador temporal.
2. Linha.
3. Marcador.
4. Data/hora.
5. Tipo de evento.
6. Conteúdo.
7. Mídia/métrica opcional.
8. Ações opcionais.

### Variantes permitidas

- Grow.
- Med.
- Técnica.
- Clínica.
- IA.
- Pendente.
- Compacta.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Marcador | 8–16px conforme semântica |
| Linha | 1–2px neutra |
| Gap evento | 16–24px |
| Padding | 16px mobile; 20–24px desktop |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Loading.
- Loaded.
- Empty.
- Loading more.
- Pending event.
- Error.

### Regras de iconografia

Ícone pode representar tipo de evento, acompanhado de label. Severidade usa semântica.

### Regras de conteúdo

Datas por locale; eventos descrevem ação e objeto; separar observado, inferido e pendente.

### Casos de uso

- Ciclo, planta, evolução clínica, tratamento, mídia e auditoria de histórico.

### Quando não utilizar

- Feed social sem relação temporal principal
- Gráfico quando a pergunta é quantitativa.

### Responsividade

Uma coluna no mobile; agrupamentos e filtros laterais no desktop; carregamento incremental preserva posição.

### Acessibilidade

Ordem semântica cronológica; heading por período; marcadores não dependem de cor; novos eventos anunciados.

### Core, Grow, Med e temas

Mesmo esqueleto; eventos Grow/Med variam conteúdo e accent discreto.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Linha decorativa dominante.
- Todos os eventos com cor diferente.
- Cards aninhados por evento.
- Ordem temporal ambígua.

### Critérios de aceitação

- [ ] Cronologia clara.
- [ ] Tipos identificados.
- [ ] Estados previstos.
- [ ] Responsive.
- [ ] IA distinguida de dado.

## 41. Statistics Panel

**Categoria:** Dados e conteúdo  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Destacar uma métrica principal, contexto temporal e até duas métricas secundárias.

### Justificativa

Limitar informação por painel melhora comparação e impede dashboards formados por dezenas de cards indistintos.

### Anatomia

1. Label da métrica.
2. Valor principal.
3. Unidade.
4. Período.
5. Tendência opcional.
6. Até duas métricas secundárias.
7. Ajuda opcional.

### Variantes permitidas

- Compacto.
- Padrão.
- Com tendência.
- Estimado.
- Sensível.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Padding | 16px mobile; 20–24px desktop |
| Valor | 20–30px Semibold |
| Gap interno | 8–12px |
| Radius | md |
| Elevação | 0–1 |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Loaded.
- Loading.
- Unavailable.
- Estimated.
- Stale.
- Private.

### Regras de iconografia

Ícone pequeno apenas para contexto/ajuda. Tendência usa seta + texto, não cor única.

### Regras de conteúdo

Uma métrica principal; unidade visível; período explícito; estimativa rotulada.

### Casos de uso

- Dashboard, perfil, relatório e resumo de ciclo/tratamento.

### Quando não utilizar

- Múltiplas perguntas analíticas
- Métrica sem contexto
- Gamificação superficial.

### Responsividade

Agrupa em grid responsivo; em mobile empilha; valores não truncam.

### Acessibilidade

Valor e unidade lidos juntos; tendência textual; contraste; tabela alternativa quando necessário.

### Core, Grow, Med e temas

Accent pode destacar foco, sem colorir valor clínico como bom/ruim.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Mais de três métricas.
- Seta verde/vermelha sem texto.
- Valor estimado como exato.
- Todos os cards elevados.

### Critérios de aceitação

- [ ] Uma métrica principal.
- [ ] Período/unidade.
- [ ] Estimated previsto.
- [ ] Grid responsivo.
- [ ] Acessível.

## 42. Entity Comparison

**Categoria:** Dados e conteúdo  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Comparar dois ou mais itens por critérios equivalentes com honestidade visual.

### Justificativa

Comparações estruturadas evitam gráficos enganosos e permitem lidar com dados ausentes ou não comparáveis.

### Anatomia

1. Itens comparados.
2. Critérios.
3. Valores.
4. Referência opcional.
5. Diferença.
6. Notas de comparabilidade.
7. Alternância tabela/gráfico opcional.

### Variantes permitidas

- Dois itens.
- Múltiplos.
- Tabela.
- Gráfico complementar.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Largura | container analítico até 1440px |
| Linha | mínimo 44–52px |
| Gap | 12–16px |
| Header sticky | permitido em desktop |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Loading.
- Loaded.
- Partial.
- Missing data.
- Not comparable.
- Error.

### Regras de iconografia

Ícones apenas para tendência/status e com texto.

### Regras de conteúdo

Critérios usam mesma unidade e período. Dados ausentes são “Sem dado”, não zero.

### Casos de uso

- Ciclos, tratamentos, períodos, produtos e métricas.

### Quando não utilizar

- Itens com bases incompatíveis sem explicação
- Ranking persuasivo sem critério.

### Responsividade

Mobile pode alternar item por item ou rolar horizontalmente com primeiro critério fixo; desktop mostra paralelismo.

### Acessibilidade

Tabela semântica, captions, headers e resumo textual das diferenças principais.

### Core, Grow, Med e temas

Paleta de dados estável; accent identifica entidade, não vencedora.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Destacar “melhor” sem regra.
- Escalas diferentes.
- Zero para ausência.
- Cores sem legenda.

### Critérios de aceitação

- [ ] Unidades/períodos equivalentes.
- [ ] Ausência explícita.
- [ ] Mobile utilizável.
- [ ] Resumo acessível.
- [ ] Sem manipulação.

## 43. Data Table

**Categoria:** Dados e conteúdo  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Exibir conjuntos tabulares densos com alinhamento, ordenação e acessibilidade.

### Justificativa

Tabelas são necessárias para comparação precisa em desktop e relatórios. Um contrato evita usá-las onde cards/listas são melhores.

### Anatomia

1. Caption/título.
2. Cabeçalho.
3. Linhas.
4. Células.
5. Ordenação opcional.
6. Seleção opcional.
7. Paginação/continuação.

### Variantes permitidas

- Padrão.
- Compacta desktop.
- Selecionável.
- Ordenável.
- Com ações.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Linha compacta | mínimo 44px |
| Linha padrão | 52–56px |
| Padding célula | 8–16px |
| Header | 44–48px |
| Largura | segundo conteúdo; container pode rolar |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Loading.
- Loaded.
- Empty.
- Sorted.
- Selected.
- Error.

### Regras de iconografia

Ícones de ordenação e ação têm labels. Não usar ícone sozinho como cabeçalho.

### Regras de conteúdo

Cabeçalhos claros, unidades no cabeçalho, números tabulares e alinhados; ações no final.

### Casos de uso

- Administração, relatórios, comparação detalhada e listas densas desktop.

### Quando não utilizar

- Fluxo mobile principal
- Conteúdo com mídia rica
- Poucas linhas simples.

### Responsividade

No mobile transforma em lista/cartões ou oferece scroll com coluna-chave fixa; nunca reduz texto abaixo do mínimo.

### Acessibilidade

Table semântica, caption, headers associados, ordenação anunciada e teclado.

### Core, Grow, Med e temas

Cores neutras; seleção com accent; semântica em status internos.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Zebra pesada.
- Muitas bordas.
- Texto centralizado em todas as colunas.
- Ação sem label.

### Critérios de aceitação

- [ ] Cabeçalhos/unidades.
- [ ] Números tabulares.
- [ ] Estratégia mobile.
- [ ] Ordenação acessível.
- [ ] Estados completos.

## 44. Time-Series Chart

**Categoria:** Dados e conteúdo  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Visualizar mudança de uma ou mais variáveis ao longo do tempo com referência, eventos e incerteza.

### Justificativa

Séries temporais são centrais à proposta de conhecimento. Uma gramática única evita escalas e cores inconsistentes entre Grow, Med e IA.

### Anatomia

1. Título/pergunta.
2. Área de plot.
3. Eixo temporal.
4. Eixo de valores.
5. Grade.
6. Séries.
7. Legenda.
8. Tooltip.
9. Faixa/meta.
10. Eventos.
11. Resumo textual.

### Variantes permitidas

- Série única.
- Múltiplas séries.
- Com faixa saudável.
- Com meta.
- Com previsão.
- Sparkline.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Altura mínima | 200px |
| Mobile padrão | 240px |
| Desktop | 280–360px |
| Sparkline | abaixo de 200px, sem eixos e com valor textual |
| Alvo de ponto | 44×44px invisível |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Loading.
- Loaded.
- Partial.
- No data.
- Missing periods.
- Estimated.
- Forecast.
- Error.

### Regras de iconografia

Ícones apenas em eventos/ajuda. Legenda usa forma/padrão além de cor.

### Regras de conteúdo

Eixos com unidade; período; fonte; previsão e confiança rotuladas; dado ausente não é interpolado silenciosamente.

### Casos de uso

- pH, EC, temperatura, sintomas, doses, evolução, rendimento e previsões.

### Quando não utilizar

- Poucos valores categóricos
- Comparação exata tabular sem gráfico
- Decoração de dashboard.

### Responsividade

Mobile reduz ticks, não informação essencial; legenda quebra; tooltip acessível; período pode ser alterado.

### Acessibilidade

Resumo/tabela alternativa, foco em pontos, contraste 3:1, padrões para séries, descrição de tendência.

### Core, Grow, Med e temas

Paleta acessível e estável. Accent não domina; IA diferencia observado, inferido e previsto.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Eixo truncado enganoso.
- Duas escalas sem necessidade.
- Verde/vermelho apenas.
- Suavização que altera dado.
- Previsão como linha observada.

### Critérios de aceitação

- [ ] Pergunta única.
- [ ] Unidades/período.
- [ ] Ausência e previsão explícitas.
- [ ] Altura oficial.
- [ ] Alternativa acessível.

## 45. Media Gallery

**Categoria:** Dados e conteúdo  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Organizar múltiplas mídias por grade ou lista com seleção, comparação e privacidade.

### Justificativa

Uma galeria única mantém thumbnails, metadados e estados consistentes e protege mídia sensível.

### Anatomia

1. Cabeçalho/filtros opcionais.
2. Grade/lista.
3. Thumbnail.
4. Metadados.
5. Seleção.
6. Ações.
7. Continuação.

### Variantes permitidas

- Grade.
- Lista.
- Selecionável.
- Comparação.
- Sensível.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Gap mobile | 12px |
| Gap desktop | 16–24px |
| Thumbnail | proporção estável; mínimo 56px em lista |
| Alvo | 44px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Loading.
- Loaded.
- Empty.
- Selected.
- Uploading.
- Error.
- Discreet.

### Regras de iconografia

Ícones para selecionar, ampliar, comparar e menu, todos nomeados.

### Regras de conteúdo

Datas/metadados essenciais; contagem; filtros claros; conteúdo sensível sinalizado.

### Casos de uso

- Fotos de planta, exames autorizados, mídia de comunidade e anexos.

### Quando não utilizar

- Exibir imagens sem contexto
- Misturar perfis/contextos sem consentimento.

### Responsividade

Grade adapta colunas; lista em telas estreitas ou acessibilidade; comparação lado a lado preserva proporção.

### Acessibilidade

Alt text, seleção anunciada, operação por teclado, ordem lógica e viewer com foco.

### Core, Grow, Med e temas

Modo Discreto substitui thumbs; Med aplica proteção; Grow mantém evidência técnica.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Masonry aleatório.
- Cropping inconsistente.
- Ações invisíveis apenas em hover.
- Preview sensível.

### Critérios de aceitação

- [ ] Proporção estável.
- [ ] Estados upload/erro.
- [ ] Privacidade.
- [ ] Teclado.
- [ ] Responsive.

## 46. Media Viewer

**Categoria:** Dados e conteúdo  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Exibir mídia ampliada com contexto, navegação e ações controladas.

### Justificativa

Separar viewer da galeria evita modal genérico e garante zoom, foco, metadata e privacidade adequados.

### Anatomia

1. Overlay/surface.
2. Mídia.
3. Fechar.
4. Navegação anterior/próxima.
5. Metadata.
6. Zoom opcional.
7. Ações.

### Variantes permitidas

- Imagem única.
- Sequência.
- Comparação lado a lado.
- Sensível.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Viewport | respeita margens 16px mobile |
| Ações | 44×44px |
| Elevação | 4 |
| Scrim | aprox. 60% |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Loading.
- Loaded.
- Error.
- Discreet.

### Regras de iconografia

Fechar, anterior/próximo, zoom e menu usam labels acessíveis.

### Regras de conteúdo

Metadata não cobre mídia; título/data visíveis quando relevantes.

### Casos de uso

- Inspeção de fotos, comparação visual e leitura de mídia.

### Quando não utilizar

- Fluxo longo de edição
- Conteúdo textual extenso.

### Responsividade

Full-screen no mobile; modal amplo no desktop; orientação e zoom preservam controles.

### Acessibilidade

Foco preso e restaurado, Escape, setas, descrição da imagem e anúncio de posição.

### Core, Grow, Med e temas

Conteúdo sensível não aparece no app switcher quando plataforma permitir; Modo Discreto bloqueia/revela com ação explícita.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Controles só em hover.
- Fechar pequeno.
- Abrir modal sobre modal.
- Download implícito.

### Critérios de aceitação

- [ ] Foco correto.
- [ ] Controles 44px.
- [ ] Metadata legível.
- [ ] Privacidade.
- [ ] Erro previsto.

## 47. Inline Validation

**Categoria:** Feedback e overlays  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Explicar ajuda, atenção, erro ou confirmação junto ao campo ou ação afetada.

### Justificativa

Feedback local reduz busca visual e cumpre prioridade de erros sem recorrer a mensagens globais genéricas.

### Anatomia

1. Ícone semântico opcional.
2. Mensagem.
3. Ligação com controle.
4. Ação curta opcional.

### Variantes permitidas

- Auxiliar.
- Warning.
- Error.
- Success.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Texto | 14px |
| Gap campo–mensagem | 4px |
| Ícone | 16px |
| Linha | mínimo 1,3 |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Hidden.
- Visible.
- Updated.

### Regras de iconografia

Ícone reforça semântica; não substitui texto.

### Regras de conteúdo

Específica, acionável e sem culpa. Indica o que ocorreu e como corrigir.

### Casos de uso

- Validação de campos, falha de ação local, faixa e confirmação útil.

### Quando não utilizar

- Erro de tela
- Condição persistente global
- Mensagem sem relação com controle.

### Responsividade

Envolve e aumenta altura; nunca sobrepõe próximo campo.

### Acessibilidade

Associada programaticamente, anunciada no momento correto, foco no primeiro erro após submissão.

### Core, Grow, Med e temas

Cores semânticas independentes do contexto.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- “Inválido” sem explicação.
- Tooltip de erro.
- Cor sem texto.
- Apagar valor.

### Critérios de aceitação

- [ ] Mensagem específica.
- [ ] Associação correta.
- [ ] Sem layout overlay.
- [ ] Anúncio acessível.

## 48. Toast

**Categoria:** Feedback e overlays  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Confirmar resultado leve e não bloqueante de ação concluída ou erro recuperável breve.

### Justificativa

Toast evita interrupção, mas sua limitação temporal exige uso apenas para informação não essencial e recuperável.

### Anatomia

1. Surface.
2. Ícone opcional.
3. Mensagem.
4. Ação opcional.
5. Dismiss opcional.

### Variantes permitidas

- Neutro.
- Sucesso.
- Atenção.
- Erro recuperável.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Largura | até 420px |
| Padding | 12–16px |
| Ação | alvo 44px |
| Elevação | 2–3 |
| Radius | md |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Enter.
- Visible.
- Exit.
- Queued.

### Regras de iconografia

Ícone semântico consistente. Máximo uma ação.

### Regras de conteúdo

Uma mensagem curta. Ação como “Desfazer” ou “Tentar novamente”.

### Casos de uso

- Registro salvo, item copiado, ação concluída e erro recuperável sem perda.

### Quando não utilizar

- Consentimento, erro crítico, instrução essencial, condição persistente.

### Responsividade

Posição segura acima da bottom nav; desktop em canto/centro aprovado; empilhamento limitado.

### Acessibilidade

Live region adequada, tempo suficiente, pausa em hover/foco, ação por teclado.

### Core, Grow, Med e temas

Semântica define cor; accent não substitui.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Múltiplos toasts.
- Texto longo.
- Única indicação de ação crítica.
- Desaparecer antes da leitura.

### Critérios de aceitação

- [ ] Mensagem curta.
- [ ] Uma ação.
- [ ] Posição segura.
- [ ] Anunciável.
- [ ] Não essencial.

## 49. Banner

**Categoria:** Feedback e overlays  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Comunicar condição persistente que afeta uma área ou toda a aplicação.

### Justificativa

Banners mantêm contexto de offline, sincronização, privacidade ou risco sem bloquear a tarefa.

### Anatomia

1. Container.
2. Ícone.
3. Título/mensagem.
4. Ação principal.
5. Ação secundária opcional.
6. Dismiss quando permitido.

### Variantes permitidas

- Informativo.
- Atenção.
- Crítico.
- Offline.
- Sincronização.
- Privacidade.
- IA.
- Premium.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Padding | 12–16px |
| Largura | container |
| Ícone | 20px |
| Ações | 44px de alvo |
| Radius | sm–md conforme integração |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Visible.
- Dismissed.
- Updating.
- Resolved.

### Regras de iconografia

Ícone semântico obrigatório em alertas persistentes; ações com labels.

### Regras de conteúdo

Uma condição por banner, uma ação principal e uma secundária. Explica impacto e persistência.

### Casos de uso

- Offline, dado desatualizado, consentimento, aviso de IA e limite Premium contextual.

### Quando não utilizar

- Confirmação leve
- Decisão obrigatória
- Erro de campo.

### Responsividade

Empilha conteúdo no mobile; não cobre navegação; persistente até condição resolver ou usuário dispensar quando permitido.

### Acessibilidade

Role/status/alert conforme severidade; foco em ações; mensagem não depende de cor.

### Core, Grow, Med e temas

Identidade do contexto permanece; semântica governa banner.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Vários banners simultâneos.
- Texto promocional persistente.
- Dismiss em condição crítica sem alternativa.

### Critérios de aceitação

- [ ] Condição única.
- [ ] Impacto claro.
- [ ] Ações limitadas.
- [ ] Não cobre conteúdo.
- [ ] Acessível.

## 50. Modal Dialog

**Categoria:** Feedback e overlays  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Solicitar uma decisão importante, confirmação ou pequena tarefa isolada.

### Justificativa

Modal restringe atenção e, por isso, deve representar uma única decisão. Regras de tamanho e foco evitam fluxos complexos e empilhamento.

### Anatomia

1. Scrim.
2. Surface.
3. Título.
4. Descrição/conteúdo.
5. Ações.
6. Fechar quando permitido.

### Variantes permitidas

- Pequeno.
- Padrão.
- Amplo justificado.
- Confirmação.
- Destrutivo.
- Privacidade.
- Clínico.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Pequeno | até 400px |
| Padrão | 480px |
| Amplo | 640px |
| Margem mobile | 16px |
| Padding | 20–24px |
| Radius | lg |
| Elevação | 4 |
| Scrim | aprox. 60% |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Opening.
- Open.
- Submitting.
- Error.
- Closing.

### Regras de iconografia

Ícone semântico opcional; fechar 44×44px; ações com labels.

### Regras de conteúdo

Título descreve decisão; consequência clara; primária específica; destrutiva nomeia objeto.

### Casos de uso

- Excluir, transição irreversível, consentimento importante, confirmação clínica e conflito.

### Quando não utilizar

- Conteúdo informativo simples
- Fluxo longo
- Segundo modal.

### Responsividade

Pode virar full-screen/sheet no mobile quando conteúdo exige; altura segura com rolagem interna; ações compreensíveis.

### Acessibilidade

Focus trap, foco inicial e retorno, Escape quando permitido, título/descrição associados.

### Core, Grow, Med e temas

Surface neutra; semântica na mensagem/ação, não fundo inteiro.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Modal sobre modal.
- Fechar ao clicar fora em decisão crítica.
- Mais de uma decisão.
- Ações invertidas entre telas.

### Critérios de aceitação

- [ ] Uma decisão.
- [ ] Tamanho oficial.
- [ ] Foco correto.
- [ ] Consequência clara.
- [ ] Loading/error interno.

## 51. Bottom Sheet

**Categoria:** Feedback e overlays  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Apresentar opções ou tarefa curta a partir da borda inferior no mobile.

### Justificativa

Sheet é mais ergonômica que popover em telas estreitas e mantém contexto sem transformar todo menu em nova página.

### Anatomia

1. Scrim opcional.
2. Surface.
3. Handle opcional.
4. Título.
5. Conteúdo.
6. Ações.
7. Fechar.

### Variantes permitidas

- Menu de opções.
- Filtro.
- Seletor.
- Detalhe curto.
- Modal mobile.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Largura | 100% |
| Radius superior | lg |
| Padding | 16–24px |
| Alvos | 44px |
| Elevação | 3–4 |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Opening.
- Open.
- Dragging quando permitido.
- Submitting.
- Error.
- Closing.

### Regras de iconografia

Fechar e ações usam ícones oficiais. Handle não é único meio de fechar.

### Regras de conteúdo

Título e consequência. Itens com labels, não apenas ícones.

### Casos de uso

- Filtros mobile, select longo, ações de mídia e conteúdo curto.

### Quando não utilizar

- Formulário muito longo sem progresso
- Desktop quando popover resolve
- Sheet sobre sheet.

### Responsividade

Mobile-first; em desktop converte para modal/popover conforme função; teclado ajusta altura.

### Acessibilidade

Focus trap, gesto não exclusivo, botão fechar, ordem de leitura e retorno de foco.

### Core, Grow, Med e temas

Neutro; contexto no accent de seleção.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Arrastar como única saída.
- Altura fixa que corta conteúdo.
- Múltiplos níveis.

### Critérios de aceitação

- [ ] Função clara.
- [ ] Alternativa ao gesto.
- [ ] Safe area/teclado.
- [ ] Foco.
- [ ] Sem aninhamento.

## 52. Tooltip

**Categoria:** Feedback e overlays  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Fornecer rótulo ou explicação curta para controle ou dado sem substituir conteúdo necessário.

### Justificativa

Tooltips ajudam ícones e termos técnicos, mas não podem carregar informação crítica porque não existem da mesma forma em toque e leitor de tela.

### Anatomia

1. Surface.
2. Texto curto.
3. Ponteiro opcional.
4. Elemento âncora.

### Variantes permitidas

- Label de ícone.
- Definição curta.
- Dado de gráfico.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Padding | 8–12px |
| Texto | 12–14px |
| Largura | até 280px, salvo tooltip de gráfico |
| Elevação | 2–3 |
| Delay | curto e previsível |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Hidden.
- Visible on hover/focus.
- Pinned no gráfico quando selecionado.

### Regras de iconografia

Não contém ícone como padrão.

### Regras de conteúdo

Uma frase curta. Não inserir ação crítica ou parágrafo longo.

### Casos de uso

- Explicar ícone, abreviação, métrica ou ponto de gráfico.

### Quando não utilizar

- Erro, consentimento, instrução obrigatória, conteúdo exclusivo no mobile.

### Responsividade

Reposiciona dentro da viewport; em toque, informação essencial deve estar disponível por outro meio.

### Acessibilidade

Aparece em foco; relação descrita; não bloqueia alvo; dismiss por Escape.

### Core, Grow, Med e temas

Surface neutra em todos os contextos.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Hover-only.
- Texto longo.
- Tooltip dentro de tooltip.
- Cobrir o dado apontado.

### Critérios de aceitação

- [ ] Curta.
- [ ] Foco/toque resolvidos.
- [ ] Viewport segura.
- [ ] Não contém informação exclusiva.

## 53. Empty State

**Categoria:** Feedback e overlays  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Explicar ausência de conteúdo e orientar a próxima ação sem deixar a tela vazia.

### Justificativa

Estados vazios distinguem primeiro uso, filtros, histórico e dados insuficientes, evitando mensagens genéricas e CTAs incorretos.

### Anatomia

1. Ilustração/ícone opcional.
2. Título.
3. Descrição.
4. Ação principal opcional.
5. Ação secundária opcional.

### Variantes permitidas

- Primeiro uso.
- Nenhum resultado.
- Histórico vazio.
- Conteúdo removido.
- Privado.
- Dados insuficientes.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Largura textual | até 480–640px |
| Gap | 12–16px |
| Ilustração | moderada, não dominante |
| Ação | 44–52px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Default.

### Regras de iconografia

Ícone/ilustração funcional e discreta; não usar mascote recreativo.

### Regras de conteúdo

Título específico; motivo; ação disponível. Nenhum resultado menciona filtros/termo.

### Casos de uso

- Dashboards sem dados, listas, busca, timeline, gráfico e comunidade.

### Quando não utilizar

- Erro de carregamento
- Conteúdo que existe mas está loading.

### Responsividade

Centralizado na área, não necessariamente na viewport inteira; ações empilham no mobile.

### Acessibilidade

Heading, texto e ação em ordem; ilustração decorativa ignorada; não depender de imagem.

### Core, Grow, Med e temas

Ilustração segue linguagem do contexto sem clichês cannabis/saúde.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- “Nada aqui” genérico.
- CTA de criação quando usuário não tem permissão.
- Ilustração excessiva.

### Critérios de aceitação

- [ ] Tipo correto de vazio.
- [ ] Motivo claro.
- [ ] CTA válido.
- [ ] Não confunde com erro.
- [ ] Acessível.

## 54. Loading Indicator

**Categoria:** Feedback e overlays  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Indicar atividade indeterminada em ação, componente ou tela sem sugerir progresso falso.

### Justificativa

Diferentes escopos de loading precisam manter contexto e responder se o usuário pode sair.

### Anatomia

1. Spinner ou indicador.
2. Label contextual opcional.
3. Container de escopo.

### Variantes permitidas

- Inline.
- Button.
- Component.
- Screen.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Spinner | 16–24px conforme contexto |
| Alvo em botão | componente não muda altura |
| Delay de exibição | evitar flash em operação muito rápida, sem ocultar resposta |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Hidden.
- Active.
- Resolved.
- Error transition.

### Regras de iconografia

O indicador é um glyph animado padronizado; não usar logos girando.

### Regras de conteúdo

Para processo perceptível, informar ação: “Carregando relatório”.

### Casos de uso

- Requisição indeterminada, envio breve e carregamento de componente.

### Quando não utilizar

- Processo com progresso mensurável
- Conteúdo cuja estrutura pode ser representada por skeleton.

### Responsividade

Permanece no escopo afetado; não bloquear tela inteira por operação local.

### Acessibilidade

Estado busy e anúncio contextual sem repetição; reduced motion usa alternativa discreta.

### Core, Grow, Med e temas

Cor neutra/accent contextual; crítico não é loading.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Spinner sem contexto prolongado.
- Múltiplos spinners.
- Bloquear navegação sem necessidade.

### Critérios de aceitação

- [ ] Escopo correto.
- [ ] Sem layout shift.
- [ ] Saída permitida comunicada.
- [ ] Acessível.

## 55. Progress Indicator

**Categoria:** Feedback e overlays  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Mostrar avanço mensurável de upload, geração ou processo prolongado.

### Justificativa

Progresso determinado aumenta confiança e permite avaliar espera, cancelamento e conclusão.

### Anatomia

1. Label.
2. Barra ou círculo.
3. Valor/percentual.
4. Estado.
5. Ação cancelar opcional.

### Variantes permitidas

- Linear.
- Circular.
- Upload por item.
- Processo global.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Altura barra | 4–8px visual |
| Área textual | 14–16px |
| Ação | 44px |
| Largura | container |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- 0–100%.
- Paused.
- Completed.
- Error.
- Cancelled.

### Regras de iconografia

Ícone pode indicar pausar/cancelar/concluir; labels acessíveis.

### Regras de conteúdo

Percentual real ou etapas honestas; não animar progresso falso. Informar o que ocorre ao sair.

### Casos de uso

- Upload, exportação, geração de relatório e sincronização grande.

### Quando não utilizar

- Requisição curta/indeterminada
- Gamificação de conclusão.

### Responsividade

Barra full-width no componente; lista de uploads mostra progresso por item.

### Acessibilidade

Valor anunciado em intervalos razoáveis; não anunciar cada 1%; contraste e label textual.

### Core, Grow, Med e temas

Accent contextual para progresso; erro crítico e conclusão sucesso somente quando confirmados.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Parar em 99%.
- Percentual inventado.
- Barra sem label.
- Conclusão antes da persistência.

### Critérios de aceitação

- [ ] Progresso real.
- [ ] Cancelamento definido.
- [ ] Conclusão confirmada.
- [ ] Anúncio acessível.

## 56. Skeleton

**Categoria:** Feedback e overlays  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Representar a estrutura esperada durante carregamento inicial sem simular conteúdo falso.

### Justificativa

Skeleton reduz mudança de layout quando a estrutura é conhecida, mas deve ser fiel e não usado em operações rápidas ou imprevisíveis.

### Anatomia

1. Blocos de texto.
2. Bloco de mídia.
3. Bloco de controle.
4. Animação sutil opcional.

### Variantes permitidas

- Texto.
- Card.
- Lista.
- Dashboard.
- Gráfico.
- Imagem.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Dimensões | iguais à estrutura final |
| Radius | herda elemento |
| Motion | sutil em motion.base/slow; reduzido sem shimmer |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Active.
- Resolved.

### Regras de iconografia

Não usa ícones reais ou conteúdo falso.

### Regras de conteúdo

Sem texto visível; tecnologias assistivas recebem estado “carregando”.

### Casos de uso

- Primeiro carregamento de listas, cards, dashboards, gráficos e imagens.

### Quando não utilizar

- Ação de botão
- Processo prolongado com progresso
- Estrutura desconhecida.

### Responsividade

Número de placeholders corresponde à densidade esperada; não cria scroll artificial enorme.

### Acessibilidade

Skeleton decorativo oculto; container busy com label; reduced motion.

### Core, Grow, Med e temas

Neutro nos dois temas; sem accent.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Shimmer intenso.
- Skeleton diferente do conteúdo.
- Manter após erro.
- Expor forma sensível no Modo Discreto.

### Critérios de aceitação

- [ ] Fidelidade estrutural.
- [ ] Sem conteúdo falso.
- [ ] Motion reduzido.
- [ ] Transição sem layout shift.

## 57. Screen Error State

**Categoria:** Feedback e overlays  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Explicar falha que impede o conteúdo principal e oferecer recuperação ou alternativa.

### Justificativa

Erro de tela precisa ser específico, preservar contexto e não se confundir com vazio.

### Anatomia

1. Ícone/ilustração discreta.
2. Título.
3. Descrição específica.
4. Retry.
5. Ação alternativa.
6. Referência de suporte opcional.

### Variantes permitidas

- Recuperável.
- Conexão.
- Permissão.
- Não encontrado.
- Processamento.
- Relatório.
- Clínico sensível.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Largura textual | até 480–640px |
| Ações | 44px |
| Gap | 12–16px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Visible.
- Retrying.
- Resolved.

### Regras de iconografia

Ícone semântico crítico/informativo conforme causa; não dramatizar.

### Regras de conteúdo

Dizer o que falhou, impacto e ação. Não usar “Algo deu errado” isoladamente.

### Casos de uso

- Falha total de página/recurso ou relatório.

### Quando não utilizar

- Erro de campo ou ação local
- Nenhum dado existente.

### Responsividade

Ocupa área de conteúdo e preserva navegação global; retry não perde filtros/entrada.

### Acessibilidade

Role alert quando apropriado, foco no título/ação, referência legível e não técnica ao usuário.

### Core, Grow, Med e temas

Semântica independente do contexto; Med usa linguagem cuidadosa e não diagnóstica.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Culpar usuário.
- Expor stack/correlation id ao público.
- Redirecionar sem escolha.
- Apagar rascunho.

### Critérios de aceitação

- [ ] Causa específica.
- [ ] Retry/alternativa.
- [ ] Contexto preservado.
- [ ] Acessível.
- [ ] Sem dados técnicos expostos.

## 58. Offline / Sync Status

**Categoria:** Feedback e overlays  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Comunicar conectividade, cache, rascunho local, pendência, sincronização e conflito.

### Justificativa

O contrato offline exige responder se conteúdo está preservado, enviado e atual. Um componente especializado evita status contraditórios.

### Anatomia

1. Indicador global/local.
2. Label de estado.
3. Timestamp opcional.
4. Ação retry/detalhes.
5. Lista de pendências opcional.

### Variantes permitidas

- Offline leitura.
- Offline escrita.
- Rascunho local.
- Pendente.
- Sincronizando.
- Concluído.
- Falha.
- Conflito.
- Cache/stale.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Banner | padding 12–16px |
| Badge local | 24–28px |
| Ação | 44px |
| Ícone | 16–20px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Online.
- Offline.
- Pending.
- Syncing.
- Synced.
- Failed.
- Conflict.
- Stale.

### Regras de iconografia

Nuvem/conexão/refresh com label. Animação só em syncing e reduzida.

### Regras de conteúdo

Distinguir “salvo neste dispositivo” de “sincronizado”. Informar última atualização.

### Casos de uso

- Formulários, uploads, dashboards em cache e fila de alterações.

### Quando não utilizar

- Usar “Salvo” antes da persistência remota sem qualificar.

### Responsividade

Banner global para condição; status local junto ao recurso; não bloquear navegação desnecessariamente.

### Acessibilidade

Estados anunciados sem spam; ações acessíveis; conflito recebe foco/decisão.

### Core, Grow, Med e temas

Cores informativa/atenção/crítico conforme estado; offline não é automaticamente crítico.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Ícone sozinho.
- Spinner eterno.
- Ocultar conflito.
- Perder rascunho ao logout sem aviso.

### Critérios de aceitação

- [ ] Estado inequívoco.
- [ ] Conteúdo preservado.
- [ ] Última atualização.
- [ ] Retry/conflito.
- [ ] Acessível.

## 59. Permission / Private State

**Categoria:** Feedback e overlays  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Explicar indisponibilidade por permissão do sistema, autorização, privacidade, contexto ou consentimento.

### Justificativa

Privado não é erro. Diferenciar causas orienta a ação correta e evita pressão indevida para exposição.

### Anatomia

1. Ícone.
2. Título.
3. Explicação.
4. Escopo/causa.
5. Ação disponível.
6. Alternativa.

### Variantes permitidas

- Permissão do sistema.
- Sem autorização.
- Recurso privado.
- Outro contexto.
- Consentimento necessário.
- Consentimento revogado.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Largura | até 480–640px |
| Ação | 44px |
| Ícone | 24–32px |
| Gap | 12–16px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Visible.
- Requesting permission.
- Granted.
- Denied.

### Regras de iconografia

Cadeado/olho/permissão acompanhado de texto; privado nunca usa vermelho por padrão.

### Regras de conteúdo

Explicar quem controla, o que será exposto e se a decisão é reversível.

### Casos de uso

- Conteúdo compartilhado, câmera, galeria, notificações, lote Grow↔Med e perfis.

### Quando não utilizar

- Erro técnico
- Paywall Premium.

### Responsividade

Mantém estrutura de página; ação abre configuração/sistema quando possível; não loopar prompt.

### Acessibilidade

Causa e ação anunciadas; permissão não solicitada repetidamente; alternativa disponível.

### Core, Grow, Med e temas

Privacidade usa neutro/informativo; contexto isolado permanece explícito.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Red para privado.
- Pressão para tornar público.
- Prompt de sistema sem explicação prévia.
- Misturar com Premium.

### Critérios de aceitação

- [ ] Causa correta.
- [ ] Ação válida.
- [ ] Consequência clara.
- [ ] Sem coerção.
- [ ] Acessível.

## 60. AI Explainability Card

**Categoria:** Componentes especializados  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Apresentar uma inferência de IA com evidências, período, confiança, limitações e ação sugerida.

### Justificativa

A explicabilidade é requisito central. Uma estrutura fixa impede que a IA pareça autoridade opaca e diferencia dado observado de interpretação.

### Anatomia

1. Assinatura IA.
2. Conclusão principal.
3. Dados usados.
4. Período.
5. Motivo/evidências.
6. Indicador de confiança.
7. Limitações.
8. Origem dos dados.
9. Ação recomendada opcional.
10. Feedback do usuário.

### Variantes permitidas

- Insight.
- Recomendação.
- Digest.
- Correlação.
- Cold start.
- Dados insuficientes.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Padding | 16px mobile; 20–24px desktop |
| Gap | 12–16px |
| Radius | md |
| Elevação | 0–1 |
| Ação | 44px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Loading.
- Ready.
- Cold start.
- Insufficient data.
- Stale.
- Error.

### Regras de iconografia

Ícone de IA abstrato e discreto; confiança e limitações têm sinais textuais.

### Regras de conteúdo

Linguagem probabilística; não diagnosticar; uma conclusão principal; dados e limitações legíveis.

### Casos de uso

- Insights Grow, evolução Med, comparações, digest e recomendações.

### Quando não utilizar

- Exibir dado observado simples
- Ocultar método/limitações
- Marketing genérico de IA.

### Responsividade

Empilha seções no mobile; detalhes podem expandir um nível; ação permanece no contexto.

### Acessibilidade

Heading, disclosure, tabela/lista de dados, confiança textual e feedback nomeado.

### Core, Grow, Med e temas

IA não tem tema próprio; card neutro herda contexto; severidade separada.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Robô/cérebro.
- Glow.
- “A IA sabe”.
- Confiança só por cor.
- Ação automática irreversível.

### Critérios de aceitação

- [ ] Todos os campos obrigatórios.
- [ ] Uma conclusão.
- [ ] Limitações.
- [ ] Confiança acessível.
- [ ] Dado/inferência separados.

## 61. Confidence Indicator

**Categoria:** Componentes especializados  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Comunicar qualidade/confiança de uma inferência sem sugerir garantia.

### Justificativa

A confiança precisa de rótulo e explicação; uma barra ou cor isolada induz interpretação excessiva.

### Anatomia

1. Label.
2. Nível ou intervalo.
3. Representação visual.
4. Explicação/tooltip.

### Variantes permitidas

- Baixa.
- Moderada.
- Alta.
- Não calculável.
- Intervalo numérico quando validado.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Altura | 24–28px se badge; 4–8px se barra acompanhada de texto |
| Ícone | 16px |
| Texto | 12–14px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Default.
- Unknown.
- Updated.

### Regras de iconografia

Ícone opcional de informação; nunca selo de aprovação.

### Regras de conteúdo

Usar “Confiança baixa/moderada/alta” e explicar fatores. Alta não significa certeza.

### Casos de uso

- Cards de IA, alertas, previsões e gráficos.

### Quando não utilizar

- Resultado observado
- Qualidade clínica garantida
- Score de usuário.

### Responsividade

Mantém texto visível; barra pode reduzir, mas label não desaparece.

### Acessibilidade

Texto e descrição; forma/padrão além de cor; valores acessíveis.

### Core, Grow, Med e temas

Escala própria de confiança, não accent/semântica de sucesso.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Verde=alta como único sinal.
- Percentual sem metodologia.
- Palavra “certeza”.

### Critérios de aceitação

- [ ] Nível textual.
- [ ] Explicação.
- [ ] Sem garantia.
- [ ] Não depende de cor.

## 62. Aggregated Data Seal

**Categoria:** Componentes especializados  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Sinalizar que um insight usa dados agregados, especialmente durante cold start.

### Justificativa

A origem dos dados afeta confiança e consentimento. O selo obrigatório evita que recomendação agregada pareça pessoal.

### Anatomia

1. Ícone opcional.
2. Label.
3. Acesso à explicação.

### Variantes permitidas

- Dados agregados.
- Histórico pessoal + agregados.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Altura | 24–28px |
| Padding | 8–10px |
| Ícone | 16px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Default.

### Regras de iconografia

Ícone de conjunto/dados neutro, não pessoas identificáveis.

### Regras de conteúdo

Texto explícito “Baseado em dados agregados”; explicação de anonimização e limitação disponível.

### Casos de uso

- Cold start e insights híbridos.

### Quando não utilizar

- Insights exclusivamente pessoais
- Selo Premium.

### Responsividade

Não trunca; pode mover abaixo do título no mobile.

### Acessibilidade

Label completo e explicação acessível.

### Core, Grow, Med e temas

Neutro/informativo; não usar accent para sugerir qualidade.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Esconder em tooltip.
- Usar termo vago “comunidade” sem explicar.
- Selo decorativo.

### Critérios de aceitação

- [ ] Sempre presente quando aplicável.
- [ ] Origem clara.
- [ ] Explicação.
- [ ] Sem inferência de identificação.

## 63. AI Alert Card

**Categoria:** Componentes especializados  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Apresentar alerta gerado por IA com severidade, evidência, confiança, limitação e ação sugerida.

### Justificativa

Alertas acionáveis fecham o ciclo entre conhecimento e ação, mas devem evitar alarmismo e automação não consentida.

### Anatomia

1. Severidade.
2. Título.
3. Evidência.
4. Período.
5. Confiança.
6. Limitação.
7. Ação sugerida.
8. Criar tarefa opcional.
9. Estado/resolução.

### Variantes permitidas

- Informativo.
- Atenção.
- Crítico.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Padding | 16–24px |
| Gap | 12px |
| Ícone | 20px |
| Ação | 44px |
| Radius | md |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- New.
- Viewed.
- Actioned.
- Resolved.
- Ignored.
- Stale.
- Error.

### Regras de iconografia

Ícone semântico de severidade e assinatura IA separada.

### Regras de conteúdo

Descrever padrão, não afirmar causa sem evidência. Ação como sugestão, não ordem.

### Casos de uso

- Risco de parâmetro, tendência clínica relevante, tarefa corretiva.

### Quando não utilizar

- Diagnóstico, prescrição, alerta sem evidência/limitação.

### Responsividade

Empilha ações no mobile; máximo uma principal e uma secundária; resolução mantém histórico.

### Acessibilidade

Severidade textual, foco nas ações, estado anunciado, nenhuma dependência de cor.

### Core, Grow, Med e temas

Grow/Med herdam acento apenas em ações; severidade usa tokens semânticos.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Fundo inteiro vermelho.
- Push alarmista.
- Criar tarefa automaticamente sem consentimento.
- Ocultar confiança.

### Critérios de aceitação

- [ ] Evidência+confiança+limitação.
- [ ] Severidade correta.
- [ ] Ação opcional.
- [ ] Histórico de resolução.
- [ ] Acessível.

## 64. Privacy Matrix

**Categoria:** Componentes especializados  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Configurar visibilidade por dimensão e escopo com presets e personalização explícita.

### Justificativa

Privacidade granular é complexa. A matriz torna consequências visíveis e evita decisões globais que expõem dados sensíveis inadvertidamente.

### Anatomia

1. Título/contexto.
2. Presets.
3. Linhas de dimensões.
4. Colunas de escopo.
5. Seletores por célula.
6. Resumo de consequência.
7. Ações salvar/cancelar.

### Variantes permitidas

- Preset.
- Personalizada.
- Grow.
- Med.
- Read-only summary.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Linha | mínimo 56px |
| Célula interativa | 44×44px |
| Largura desktop | até 800–1280px |
| Mobile | uma dimensão por bloco/sheet |
| Gap | 8–16px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Loading.
- Ready.
- Changed.
- Saving.
- Saved.
- Error.
- Conflict.

### Regras de iconografia

Ícones de privado/seguidores/link/público sempre com texto ou legenda persistente.

### Regras de conteúdo

Cada escopo explica quem vê, encontrabilidade e reversibilidade. Alterações em massa exigem resumo. Privado, seguidores e público são os únicos escopos disponíveis no MVP; link direto é Versão 2 (coluna oculta/desabilitada até habilitado) e Amigos é um escopo em Pesquisa, reservado na estrutura mas não exposto ao usuário (doc 02 §9.1/§18).

### Casos de uso

- Configuração de publicação, perfil e dados compartilhados.

### Quando não utilizar

- Configuração simples de um único escopo quando Visibility Selector basta.

### Responsividade

Desktop usa grade; mobile transforma linhas em blocos sem ocultar comparação; ação persistente só se cumprir contrato.

### Acessibilidade

Tabela/fieldset semântico, navegação por teclado, estado de cada célula, resumo de mudanças.

### Core, Grow, Med e temas

Privado é neutro; público não usa sucesso; perfis Grow/Med permanecem separados.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Grade apertada no mobile.
- Ícones sem texto.
- Preset que altera sem resumo.
- Salvar automático silencioso.

### Critérios de aceitação

- [ ] Todas as dimensões.
- [ ] Consequência clara.
- [ ] Mobile utilizável.
- [ ] Mudanças resumidas.
- [ ] Acessível.

## 65. Visibility Scope Selector

**Categoria:** Componentes especializados  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Selecionar um escopo de visibilidade para um recurso específico.

### Justificativa

Quando há uma única decisão, um seletor dedicado é mais claro que a matriz completa e mantém vocabulário consistente.

### Anatomia

1. Label.
2. Opções de escopo.
3. Ícone.
4. Descrição do impacto.
5. Estado atual.
6. Confirmação quando exposição aumenta.

### Variantes permitidas

- Privado.
- Seguidores.
- Por link *(Versão 2 — oculto/desabilitado até habilitado, doc 02 §18)*.
- Público.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Opção | mínimo 56px com descrição |
| Ícone | 20px |
| Alvo | 44px |
| Gap | 8–12px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Current.
- Hover.
- Focus visible.
- Selected.
- Saving.
- Error.

### Regras de iconografia

Cadeado, pessoas, link e globo acompanhados de texto.

### Regras de conteúdo

Explicar quem vê, encontrabilidade e se link pode ser repassado. Aumento de exposição recebe confirmação contextual.

### Casos de uso

- Publicação, perfil, relatório compartilhável e mídia.

### Quando não utilizar

- Múltiplas dimensões diferentes
- Permissão técnica do sistema.

### Responsividade

Radio list/sheet no mobile; popover ou grupo no desktop; descrição nunca escondida apenas em tooltip.

### Acessibilidade

Grupo nomeado, estado anunciado, confirmação acessível e foco restaurado.

### Core, Grow, Med e temas

Sem cores de sucesso/erro por escopo; seleção usa accent contextual.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Público em verde.
- Privado em vermelho.
- Escolha prévia mais aberta.
- Labels vagos.

### Critérios de aceitação

- [ ] Escopos oficiais.
- [ ] Impacto explicado.
- [ ] Exposição confirmada.
- [ ] Estado persistido.

## 66. Profile Link Seal

**Categoria:** Componentes especializados  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Sinalizar vínculo público e opcional entre perfis contextuais.

### Justificativa

O vínculo é exceção explícita ao isolamento de identidade. Um selo discreto evita inferência automática e mantém reversibilidade.

### Anatomia

1. Ícone de vínculo.
2. Label.
3. Perfil/contexto relacionado.
4. Ação de ver/desvincular conforme permissão.

### Variantes permitidas

- Unilateral.
- Bilateral.
- Read-only público.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Altura | 24–28px |
| Ícone | 16px |
| Padding | 8–10px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Linked.
- Pending quando suportado.
- Unlinked.

### Regras de iconografia

Ícone de link/contextos, nunca símbolo social genérico.

### Regras de conteúdo

Indicar claramente qual perfil está vinculado e onde o vínculo será exibido.

### Casos de uso

- Perfis públicos quando usuário autorizou vínculo.

### Quando não utilizar

- Inferir vínculo
- Exibir internamente a terceiros sem autorização.

### Responsividade

Não trunca nome/contexto crítico; pode ocupar linha própria no mobile.

### Acessibilidade

Label completo, link com destino e ação de desvincular acessível ao dono.

### Core, Grow, Med e temas

Usa cores neutras/contextuais, não status de verificação.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Badge “verificado”.
- Vínculo automático.
- Ocultar reversibilidade.

### Critérios de aceitação

- [ ] Registro explícito existe.
- [ ] Contextos nomeados.
- [ ] Visibilidade correta.
- [ ] Reversível.

## 67. Discreet Mode Indicator

**Categoria:** Componentes especializados  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Informar persistentemente que o Modo Discreto está ativo e permitir compreender/revelar conteúdo controladamente.

### Justificativa

Ocultação sem indicação causa confusão e risco. O indicador mantém consciência do estado sem expor o conteúdo protegido.

### Anatomia

1. Ícone.
2. Label/estado.
3. Ação de detalhes ou desativar.
4. Indicação de conteúdo oculto.

### Variantes permitidas

- Global.
- Local em conteúdo.
- Revelação temporária.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Global | 24–28px como badge ou item de top bar |
| Ação | 44px |
| Ícone | 16–20px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Inactive.
- Active.
- Temporarily revealed.
- Locking.

### Regras de iconografia

Olho oculto/cadeado com texto; não usar só opacidade.

### Regras de conteúdo

“Modo Discreto ativo” e explicação do que está oculto. Revelação informa duração/condição.

### Casos de uso

- Med, notificações, imagens, app switcher e conteúdo sensível.

### Quando não utilizar

- Privacidade de publicação
- Autorização de acesso.

### Responsividade

Persistente sem ocupar grande área; conteúdo substituído mantém layout; comportamento por plataforma é explícito.

### Acessibilidade

Estado anunciado, controle por teclado/biometria quando aplicável, não revelar em preview assistivo.

### Core, Grow, Med e temas

Camada transversal; não muda accent ou arquitetura de navegação.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Blur parcial legível.
- Indicador escondido.
- Desativar por acidente.
- Revelação sem reocultação.

### Critérios de aceitação

- [ ] Estado persistente.
- [ ] Conteúdo realmente oculto.
- [ ] Revelação controlada.
- [ ] Plataformas testadas.

## 68. Paywall / Upsell

**Categoria:** Componentes especializados  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Explicar funcionalidade bloqueada, valor, limite atual e caminho ético para assinatura.

### Justificativa

Valor primeiro evita bloqueio opaco e dark patterns. Um componente único mantém comparação, preço e retorno consistentes.

### Anatomia

1. Contexto da funcionalidade.
2. Benefício principal.
3. Benefícios secundários.
4. Limite atual.
5. Plano necessário.
6. Preço.
7. CTA assinar.
8. Voltar.
9. Restaurar/gerir compra.
10. Cupom quando aplicável.

### Variantes permitidas

- Inline.
- Tela dedicada.
- Modal raro.
- Limite atingido.
- Descoberta de valor.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Conteúdo | largura 640–720px |
| CTA | 52px em foco mobile; 44px padrão |
| Padding | 20–32px |
| Radius | md/lg conforme superfície |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Available.
- Processing.
- Success.
- Error.
- Already subscribed.

### Regras de iconografia

Badge Premium discreto; ícones de benefícios funcionais; sem coroa/diamante.

### Regras de conteúdo

Preço antes da confirmação; sem urgência falsa; acesso gratuito não é depreciado; ação de voltar clara.

### Casos de uso

- Funcionalidade Premium, limite de armazenamento, IA avançada, relatórios.

### Quando não utilizar

- Sem permissão
- Erro
- Consentimento.

### Responsividade

Mobile uma coluna; desktop comparativo controlado; CTA não cobre conteúdo; gestão/restauração visíveis.

### Acessibilidade

Ordem de leitura, preço e termos acessíveis, foco, compra anunciada e erro recuperável.

### Core, Grow, Med e temas

Premium usa champanhe/bronze discreto como categoria, não ação universal; accent do contexto pode governar CTA.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Contagem regressiva falsa.
- Botão voltar oculto.
- Plano pré-selecionado enganoso.
- Desabilitar recurso gratuito visualmente.

### Critérios de aceitação

- [ ] Valor+limite+plano+preço.
- [ ] Voltar.
- [ ] Restaurar.
- [ ] Sem dark pattern.
- [ ] Estados de compra.

## 69. Premium Category Badge

**Categoria:** Componentes especializados  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Classificar benefícios Premium por categoria sem substituir estado ou identidade.

### Justificativa

Categorias estáveis ajudam comparação e organização, enquanto o tom Premium permanece discreto.

### Anatomia

1. Container.
2. Label.
3. Ícone opcional.

### Variantes permitidas

- IA.
- Produtividade.
- Relatórios.
- Automação.
- Comunidade.
- Personalização.
- Armazenamento.
- Profissional.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Altura | 24–28px |
| Padding | 8–10px |
| Ícone | 16px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Default.

### Regras de iconografia

Ícone funcional da categoria, não símbolo de luxo.

### Regras de conteúdo

Uma categoria curta e oficial.

### Casos de uso

- Paywall, comparador e descrição de benefício.

### Quando não utilizar

- Status de assinatura
- CTA
- Estado semântico.

### Responsividade

Quebra em grupo; badge não trunca.

### Acessibilidade

Texto e ícone, contraste, significado não depende de bronze.

### Core, Grow, Med e temas

Cor Premium exclusiva; não herda accent como substituição.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Coroa.
- Diamante.
- Glow dourado.
- Categorias inventadas localmente.

### Critérios de aceitação

- [ ] Categoria oficial.
- [ ] Altura correta.
- [ ] Cor própria.
- [ ] Texto curto.

## 70. Free vs Premium Comparator

**Categoria:** Componentes especializados  
**Status:** Estável na versão 1.0  
**Dependências:** Tokens de cor, tipografia, spacing, radius, borda, elevação e motion definidos nos documentos 11, 01 e 02.

### Propósito

Comparar capacidades, limites e disponibilidade entre plano gratuito e Premium com transparência.

### Justificativa

Uma comparação padronizada reduz ambiguidade comercial e impede vantagens apresentadas de forma manipulativa.

### Anatomia

1. Título.
2. Planos.
3. Categorias.
4. Linhas de funcionalidade.
5. Disponível/limitado/indisponível.
6. Plano atual.
7. Preço.
8. CTA.

### Variantes permitidas

- Tabela desktop.
- Lista empilhada mobile.
- Resumo por categoria.

### Tamanho, spacing e geometria

| Elemento | Especificação |
| --- | --- |
| Linha | mínimo 52–56px |
| Header | 56px |
| Container | até 800–1280px |
| CTA | 44–52px |

Margens externas pertencem ao padrão de composição, não ao componente. O componente não pode mudar de altura entre estados equivalentes; texto ampliado pode aumentar sua altura, nunca reduzi-la.

### Estados obrigatórios ou aplicáveis

- Loading price.
- Ready.
- Current free.
- Current premium.
- Error price.

### Regras de iconografia

Check, limite e indisponível sempre com texto/label; não usar X vermelho como humilhação.

### Regras de conteúdo

Descrever limite concreto. Não esconder recursos gratuitos ou criar termos vagos.

### Casos de uso

- Página de assinatura, paywall e gestão de plano.

### Quando não utilizar

- Comparar produtos não equivalentes
- Telas pequenas sem adaptação.

### Responsividade

Mobile organiza por funcionalidade/categoria; plano atual sempre claro; CTA após contexto.

### Acessibilidade

Tabela/lista semântica, headers, status textual e preço acessível.

### Core, Grow, Med e temas

Premium discreto; gratuito neutro e digno; accent contextual no CTA.
 A ordem de leitura, densidade funcional, estados e significado devem permanecer equivalentes em Dark e Light.

### Anti-patterns

- Coluna Premium visualmente dominante demais.
- Recursos falsos.
- Preço escondido.
- X vermelho excessivo.

### Critérios de aceitação

- [ ] Limites concretos.
- [ ] Plano atual.
- [ ] Preço.
- [ ] Mobile legível.
- [ ] Sem manipulação.

# PARTE II — CONTRATOS TRANSVERSAIS

## 71. Hierarquia de ações

- Uma ação primária por superfície ou etapa.
- Até duas ações secundárias visíveis no mesmo grupo.
- Ações adicionais entram em Overflow Menu.
- Ação destrutiva não fica adjacente à primária sem separação e confirmação.
- Card de entidade mostra no máximo uma ação direta além da navegação principal.

## 72. Limites de informação

| Componente | Limite |
| --- | --- |
| Status Badge | um estado |
| Statistics Panel | uma métrica principal e até duas secundárias |
| Entity Card | título, até dois status, até três métricas e metadata essencial |
| Toast | uma mensagem e uma ação opcional |
| Banner | uma condição, uma ação principal e uma secundária |
| Modal Dialog | uma decisão |
| AI Explainability Card | uma conclusão principal |
| Time-Series Chart | uma pergunta analítica principal |

Quando o conteúdo excede o limite, ele deve ser dividido por hierarquia, disclosure ou tela de detalhe; não deve ser comprimido até perder compreensão.

## 73. Contrato de aninhamento

- Card dentro de card é proibido como padrão.
- Superfícies podem conter grupos neutros sem nova elevação.
- No máximo um nível de expansão dentro de lista ou timeline.
- Modal não abre outro modal.
- Popover não contém fluxo longo nem outro popover.
- Tabs não contêm segundo nível de tabs do mesmo peso.

## 74. Prioridade de feedback

1. Erro de campo: Inline Validation.
2. Erro de ação local: inline ou Toast contextual.
3. Condição persistente: Banner.
4. Decisão necessária: Modal Dialog.
5. Falha de tela: Screen Error State.
6. Condição global: Banner global.
7. Confirmação leve: Toast.

O mesmo evento não deve disparar simultaneamente vários níveis de feedback, salvo quando representam etapas diferentes e necessárias.

## 75. Contrato assíncrono

Toda operação assíncrona deve responder visualmente: a ação foi recebida; está em andamento; o usuário pode sair; o conteúdo foi preservado; qual foi o resultado. Loading, Progress, Pending, Sync, Success e Error são escolhidos pelo estado real, não por conveniência visual.

## 76. Contrato de privacidade

Antes de compartilhar, o componente deve tornar evidente qual informação será exposta, qual perfil/contexto será utilizado, quem poderá ver, se é encontrável, se é reversível e o efeito da revogação. Privado não é erro e público não é sucesso.

## 77. Contrato de IA

Componentes de IA distinguem dado observado, cálculo/padrão, interpretação, previsão, confiança, limitação e ação sugerida. Nenhum estilo visual pode transformar inferência em certeza, diagnóstico ou prescrição.

## 78. Contrato Premium

Todo bloqueio Premium mostra funcionalidade, benefício, limite atual, plano necessário, preço antes da confirmação, retorno e gestão/restauração de compra. O produto gratuito não pode ser visualmente degradado para aumentar conversão.

## 79. Contrato Dark × Light

A mesma tela nos dois temas preserva ordem de leitura, níveis de hierarquia, quantidade de superfícies, significado de cor, foco, estados, conteúdo, densidade e acessibilidade. Os temas usam valores próprios; não são inversões automáticas.

# PARTE III — GOVERNANÇA

## 80. Criação de novo componente

Um novo componente só pode ser criado quando existe problema recorrente comprovado, nenhuma composição existente resolve sem distorção, o padrão é aplicável além de uma tela e todos os estados, temas, contextos e requisitos de acessibilidade podem ser especificados. Caso contrário, a solução deve usar componentes existentes.

## 81. Alteração e versionamento

Mudanças em anatomia, propriedade, tamanho, variante ou estado devem registrar justificativa, impacto, migração e versão. Mudança incompatível exige versão principal e plano de depreciação. Componentes experimentais não podem aparecer em produção sem aprovação.

## 82. Exceções

Exceção requer problema, evidência, alternativas avaliadas, impacto sistêmico, aprovação, prazo e data de revisão. Exceções permanentes sem incorporação formal são proibidas.

## 83. Rastreabilidade

Cada instância no arquivo de design e na implementação deve registrar nome oficial, versão, tokens consumidos, estados suportados, contextos permitidos, status de acessibilidade, referência a este documento e histórico de alteração.

## 84. Checklist de aprovação de implementação

- [ ] Nome e família correspondem a este catálogo.
- [ ] Anatomia e ordem de leitura estão corretas.
- [ ] Tamanhos e spacing usam valores oficiais.
- [ ] Todos os estados aplicáveis estão implementados.
- [ ] Dark e Light têm equivalência perceptiva.
- [ ] Core, Grow e Med usam parametrização, não cópia.
- [ ] Texto ampliado, teclado e leitor de tela foram testados.
- [ ] Motion reduzido está previsto.
- [ ] Privacidade, IA e Premium cumprem seus contratos quando aplicável.
- [ ] Anti-patterns não estão presentes.
- [ ] Testes visuais e funcionais foram registrados.

## 85. Decisões consolidadas

- A biblioteca é única para toda a COSMARIA.
- Inter é a família tipográfica candidata (sujeita a validação formal, doc 11 §4).
- Alvo interativo mínimo é 44×44px.
- Radius padrão de cards é `md`; overlays usam `lg`; pills são reservados a chips e badges.
- Dark é expressão principal e Light possui paridade integral.
- Accent de contexto nunca representa sucesso, erro, atenção ou Premium.
- Estados críticos possuem texto e sinal além de cor.
- Componentes de IA sempre incluem explicabilidade.
- Privacidade é neutra/informativa e Modo Discreto é uma camada transversal.
- Nenhuma tela pode criar componente local não documentado.

## 86. Histórico

| Versão | Data | Mudança | Justificativa |
| --- | --- | --- | --- |
| 1.0 | 2026-07-12 | Criação da Component Library oficial | Converter o UI Kit em contratos completos e auditáveis para todos os componentes. |

## 87. Encerramento

Esta biblioteca é a referência oficial para a construção dos templates e das telas. Consistência não significa uniformidade cega: significa que problemas equivalentes recebem soluções equivalentes, enquanto conteúdo e contexto podem variar dentro de limites explícitos. Qualquer solução futura deve primeiro demonstrar compatibilidade com estes componentes antes de propor expansão do sistema.
