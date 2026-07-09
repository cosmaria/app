# 11 — Design System (Documento 100% Completo)

> Status: **Rascunho para validação.** Especificação de produto de nível enterprise — não um guia visual solto. Todos os valores concretos (cor, tipografia, grid, espaçamento, sombra, borda, motion) são **propostas oficiais da arquitetura, candidatas a validação com usuários reais antes do lançamento** — não decisões finais imutáveis. Dark Mode é o padrão da plataforma; Light Mode existe desde o MVP usando exatamente os mesmos tokens. Um único Design System para toda a COSMARIA — Grow, Med e futuros aplicativos compartilham a mesma biblioteca de componentes, diferenciando-se apenas pelos **Accent Tokens**.

---

## 1. Objetivos

- Especificar um Design System completo — fundações, componentes, padrões, governança — comparável em rigor aos melhores do mercado (Apple HIG, Material Design, IBM Carbon, Atlassian Design System, Fluent), usados aqui **apenas como referência de qualidade, nunca copiados**.
- Dar forma visual a tudo que os docs 00–10 já definiram estruturalmente: Modelo de Estados (doc 10 §5), Arquétipos de Tela (doc 10 §4), narrativa de marca (doc 01), explicabilidade (doc 05), privacidade granular (doc 02/06), Premium (doc 07).
- Garantir **uma única biblioteca de componentes** para Grow, Med e futuros aplicativos — nunca duplicada, diferenciada apenas por Accent Tokens.
- Preparar desde o início: Dark/Light Mode, acessibilidade WCAG AA+, internacionalização visual, responsividade (mobile/tablet/desktop), motion.

---

## 2. Problemas que Resolve

| Problema | Como este documento resolve |
|---|---|
| Componentes foram mencionados de forma fragmentada e por vezes duplicada em docs 02/03/05/06/07/10 (ex.: "Gráfico de série temporal", "Matriz de Privacidade", "Paywall" cada um citado 2–3 vezes) | Biblioteca única consolidada (seção 7), uma definição por componente |
| Risco de Grow e Med desenvolverem sistemas visuais paralelos ao longo do tempo | Accent Tokens (seção 5.1) como único ponto de diferenciação permitido |
| Risco de "guia visual" superficial, insuficiente para implementação real | Teste de Completude (seção 20) aplicado a este próprio documento antes de finalizá-lo |
| Ausência de tratamento explícito de acessibilidade, i18n visual e responsividade em qualquer documento anterior | Seções dedicadas (9, 10, 11) |

---

## 3. Escopo

**Incluído**: tokens de design completos, sistema de estados globais (visual), biblioteca de componentes (incluindo IA/Privacidade/Premium), ícones, feedback, formulários, navegação, layout responsivo, acessibilidade, i18n visual, motion, governança de biblioteca compartilhada.

**Fora de escopo**: escolha de framework de UI/tecnologia de renderização (doc 13), estrutura de pastas de componente no código (doc 14).

---

## 4. Filosofia do Design System

- **Um sistema, múltiplas identidades**: a mesma biblioteca de componentes serve Grow, Med e qualquer app futuro. A única coisa que muda entre eles é o valor dos **Accent Tokens** (seção 5.1) — nunca um componente reimplementado, nunca uma variante de código paralela.
- **Dark Mode como padrão, Light Mode como cidadão de primeira classe**: ambos usam exatamente os mesmos nomes de token — só o valor por trás muda. Nenhum componente é desenhado "pensando só no escuro" e adaptado depois.
- **Inspiração de qualidade, nunca cópia**: Apple HIG (clareza e hierarquia tipográfica), Material Design (sistema de elevação e motion), IBM Carbon (rigor de tokens e documentação de estados), Atlassian (densidade de informação em produtos complexos), Fluent (acessibilidade e Windows/multi-plataforma) — cada um contribui um princípio, nenhum é copiado literalmente.
- **Narrativa visual herdada do doc 01**: "cosmos + harmonia" — ordem dentro da complexidade, ciência e precisão. Isso se traduz em: paleta de base escura e precisa (não "recreativa"/orgânica-caótica), tipografia com boa hierarquia (comunica organização), e Accent Tokens que diferenciam Grow (técnico, produtivo) de Med (calmo, clínico, discreto) sem nunca depender de imagética literal de cannabis.
- **Todo valor concreto é candidato**: cada token de cor/tipografia/espaçamento nesta versão é uma proposta fundamentada, mas **marcada explicitamente como sujeita a validação com usuários reais** antes do lançamento (decisão já registrada no doc 01 para o ícone do Med, generalizada aqui para todo o sistema).

---

## 5. Fundações — Design Tokens

### 5.1 Cor

**Neutros de base (compartilhados por toda a plataforma — mesmo nome de token, valor por tema)**

| Token | Dark (padrão) | Light |
|---|---|---|
| `color.bg.base` | `#0B0F14` | `#F7F8FA` |
| `color.bg.surface` | `#12181F` | `#FFFFFF` |
| `color.bg.surface-2` | `#1A222B` | `#EEF1F4` |
| `color.text.primary` | `#EDF1F5` | `#10151A` |
| `color.text.secondary` | `#9AA7B2` | `#4B5760` |
| `color.text.tertiary` | `#6B7885` | `#7C8790` |
| `color.border` | `#232D38` | `#DDE3E8` |

**Semânticos (compartilhados, independentes do Accent Token — nunca usados como identidade visual de app)**

| Token | Dark | Light | Uso |
|---|---|---|---|
| `color.semantic.success` | `#34C77B` | `#1E9A5C` | Confirmação, sucesso |
| `color.semantic.warning` | `#E8A93E` | `#B9791E` | Atenção, alerta de IA (severidade média) |
| `color.semantic.critical` | `#E5675E` | `#C6382E` | Erro, alerta de IA (severidade alta) |
| `color.semantic.info` | `#4EA1E8` | `#1F71B8` | Informativo, dica |

**Accent Tokens (o único ponto de diferenciação visual entre apps — seção 13 detalha a governança)**

| Token | Dark | Light | Racional |
|---|---|---|---|
| `color.accent.core` | `#8B7FE0` (violeta-cosmos) | `#5F4FCC` | Plataforma/onboarding/telas de Conta — nem Grow nem Med |
| `color.accent.grow` | `#2E9E6B` (verde-teal botânico) | `#1F7A52` | Técnico, produtivo — reforça a identidade de cultivo sem depender de folha literal |
| `color.accent.med` | `#6E7FE8` (índigo calmo) | `#4A5BC4` | Deliberadamente **não verde** — evita qualquer leitura recreativa; comunica confiança clínica e discrição (doc 01) |
| `color.accent.future-*` | *(reservado)* | *(reservado)* | Novo app futuro registra um novo token `color.accent.[nome]` — nunca reaproveita nem modifica os existentes |

*(Candidatos a validação — ver seção 4. Recomendo teste de contraste e percepção com usuários reais do Med antes do lançamento, como já sugerido no doc 01.)*

### 5.2 Tipografia

- **Papel Display/Título**: sans-serif geométrica com leve toque humanista — prioriza clareza em telas pequenas e boa distinção numérica (relevante para dados de doc 02/03/05). Peso de 600–700 para títulos.
- **Papel Corpo**: mesma família ou par próximo, peso 400–500, otimizada para leitura longa (relatórios, timeline).
- **Papel Utilitário/Dado**: fonte com números tabulares (`tabular-nums`) para qualquer valor numérico alinhado em coluna (parâmetros, doses, estatísticas) — requisito direto dos docs 02/03/05.
- **Escala tipográfica** (tokens, relação ~1.2–1.25): `type.scale.xs` (12) · `sm` (14) · `base` (16) · `md` (18) · `lg` (20) · `xl` (24) · `2xl` (30) · `3xl` (38) · `4xl` (48).
- Nomes de tipografia real (licenciamento) ficam para o doc 13 — aqui definimos **papel e escala**, não a fonte específica.

### 5.3 Espaçamento

Escala de base 4px: `space.1` (4) · `space.2` (8) · `space.3` (12) · `space.4` (16) · `space.6` (24) · `space.8` (32) · `space.12` (48) · `space.16` (64) · `space.24` (96). Todo layout usa `gap`/spacing por token, nunca margem ad-hoc (mesmo princípio de disciplina já aplicado a dados/APIs nos docs 08/09).

### 5.4 Bordas e Raio

`radius.sm` (4px, inputs/badges) · `radius.md` (8px, cards) · `radius.lg` (16px, modais/folhas) · `radius.pill` (999px, chips/tags).

### 5.5 Sombra e Elevação

Elevação é um **token de nível (0–5)**, não uma sombra fixa — renderizada diferente por tema:
- **Dark**: elevação = clareamento sutil da superfície (`color.bg.surface` → `surface-2` → ...) + borda sutil, quase sem sombra projetada (sombras "somem" em fundo escuro).
- **Light**: elevação = sombra suave crescente (`elevation.1`: sombra rasa e discreta … `elevation.5`: sombra pronunciada para modais).

### 5.6 Opacidade

`opacity.disabled` (40%) · `opacity.overlay` (60%, scrims de modal) · `opacity.hover-overlay` (8–12%, camada de hover sobre superfícies).

### 5.7 Motion

- Durações: `motion.instant` (100ms) · `motion.fast` (150ms) · `motion.base` (200ms) · `motion.slow` (300ms) · `motion.deliberate` (500ms, transições de tela/onboarding).
- Easing: `motion.ease-standard` (entra/sai simétrico), `motion.ease-decelerate` (elementos entrando), `motion.ease-accelerate` (elementos saindo).
- **Regra obrigatória**: respeitar `prefers-reduced-motion` do sistema operacional — toda animação tem uma versão instantânea equivalente.

### 5.8 Grid e Breakpoints

`breakpoint.mobile` (< 600px) · `breakpoint.tablet` (600–1024px) · `breakpoint.desktop` (> 1024px). Grid de 4 colunas (mobile), 8 colunas (tablet), 12 colunas (desktop), gutter = `space.4`.

---

## 6. Sistema de Estados Globais Reutilizável (forma visual do doc 10 §5)

> Dois níveis distintos de estado — não confundir um com o outro:

### 6.1 Estados de Tela/Dado (doc 10 §5, forma visual)
Vazio · Carregando · Erro · Sucesso · Offline · Premium/Bloqueado · Sem Permissão · Modo Discreto (variante transversal). Cada um com composição visual própria (ex.: Vazio = ilustração conceitual simples + texto + CTA; Erro = ícone semântico `critical` + mensagem específica + botão de retry).

### 6.2 Estados de Interação de Componente (novo, nível de componente)
Default · Hover · Focus · Active · Disabled · Loading · Erro · Sucesso — aplicáveis a qualquer componente interativo (botão, input, card clicável). `Focus` é sempre visível (obrigatório para acessibilidade, seção 9) e nunca removido por estilo.

---

## 7. Biblioteca de Componentes (consolidada — substitui todas as menções fragmentadas em docs 02/03/05/06/07/10)

> Metodologia: mesmo princípio de arquétipos/composição dos docs 08–10 — cada componente listado uma única vez, com seus 8 estados de interação (seção 6.2) implícitos por padrão, salvo nota em contrário.

### 7.1 Dados e Conteúdo
- **Card de Entidade** (genérico, parametrizável): usado por Planta, Ciclo, Tratamento, Produto, Genética, Modelo (Ciclo/Tratamento), Lote — um único componente-base com slots de conteúdo, não um componente por entidade.
- **Componente de Timeline**: linha do tempo de eventos + mídia — usado por Planta (Grow) e Evolução Clínica (Med).
- **Gráfico de Série Temporal**: um único componente (era mencionado separadamente em docs 02/03/05) — eixo tempo × valor, com marcação de confiança/limitação quando usado por IA (seção 7.5).
- **Badge de Status**: fase de vida, alerta ativo, ciclo validado, categoria Premium (doc 07 §8) — um componente, conteúdo/cor semântica variam.
- **Componente de Comparação**: tabela/gráfico entre 2+ itens (ciclos, ou futuramente outros).
- **Upload/Galeria de Mídia**: usado por Grow (fotos) e Med (exames) — mesma entidade `Mídia` do Core (doc 08), mesmo componente.
- **Painel de Estatísticas**: usado por Perfil Público (visitas/alcance) e por relatórios agregados.

### 7.2 Sistema de Formulários e Validação
- **Input de Texto/Número** (com variante "com faixa de referência visual", usada por parâmetros do Grow).
- **Seletor** (dropdown/radio) — usado por fase de vida, tipo de efeito, via de administração (todos os catálogos código+tradução do doc 08 §8 passam por este componente).
- **Escala de Intensidade**: componente compartilhado entre check-in diário e Sessão Antes/Depois (Med) — um único componente, dois contextos de uso.
- **Validação inline**: erro de campo aparece no próprio campo, nunca só num resumo genérico no topo — mensagem específica (mesmo princípio do doc 10 §5, Erro).
- **Chave de idempotência client-side**: reforço de UX — botão de submissão desabilita (`Disabled`) imediatamente após o primeiro toque, evitando duplo envio (doc 09 princípio 6).

### 7.3 Sistema de Feedback Visual
- **Toast**: confirmação leve, não bloqueia a tela (ex.: "Registro salvo").
- **Banner**: aviso persistente até dispensado (ex.: "Modo offline — alterações salvas localmente", doc 04 §17).
- **Modal de Confirmação**: ações destrutivas ou importantes (ex.: confirmação de transição de fase, exclusão de conta em duas etapas — doc 10).
- **Inline Error**: erro de campo/ação específica.

### 7.4 Sistema de Navegação
- **Navegação Primária** (bottom nav mobile / sidebar desktop-tablet): Dashboard, Comunidade, Configurações — nunca inclui Central de Notificações/Privacidade em destaque (decisão do usuário, doc 10).
- **Tabs**: alternância dentro de uma tela (ex.: Feed Grow vs. Feed Med, se ambos os apps estiverem instalados).
- **Breadcrumb/Voltar**: navegação hierárquica em telas de detalhe profundas (Planta → Ciclo → Ambiente).

### 7.5 Componentes de Inteligência Artificial (doc 05)
- **Card de Explicabilidade**: estrutura fixa e obrigatória — dados usados, período, confiança, limitações, motivo (doc 05 §7) — usado por Insight, Alerta, Recomendação, Digest.
- **Indicador de Confiança**: visual (não só texto) do nível de confiança estatística.
- **Selo "Baseado em Dados Agregados"**: sinalização obrigatória em cold-start (doc 05 §8) — nunca omitido.
- **Card de Alerta**: variante de severidade (`semantic.warning`/`critical`) + CTA de ação sugerida.

### 7.6 Componentes de Privacidade
- **Matriz de Privacidade Granular**: grade dimensão × escopo (doc 02 §9.1) com presets rápidos + "personalizar" (melhoria já registrada).
- **Seletor de Escopo de Visibilidade**: seguidores/link*/público.
- **Selo de Vínculo de Perfis**: discreto, opcional (doc 06 §18).
- **Indicador de Modo Discreto Ativo**: badge/ícone persistente quando ativado.

### 7.7 Componentes de Premium
- **Componente de Paywall/Upsell**: mostra o valor da funcionalidade bloqueada, nunca apenas "bloqueado" (doc 07 §4, princípio "valor primeiro").
- **Badge de Categoria Premium**: IA/Produtividade/Relatórios/Automação/Comunidade/Personalização/Armazenamento/Profissional (doc 07 §8) — cor semântica própria, distinta dos Accent Tokens de app.
- **Comparador Free vs. Premium**: tabela/lista lado a lado.

---

## 8. Sistema de Ícones

- Um único conjunto de ícones para toda a plataforma (nenhum ícone exclusivo de Grow ou Med — reforça "um sistema, múltiplas identidades", seção 4).
- Ícones semânticos (sucesso/aviso/crítico/info) sempre pareados com a cor semântica correspondente, nunca só a cor sozinha (acessibilidade — não depender só de cor para transmitir significado, seção 9).
- Peso/estilo consistente (mesma grade, mesma espessura de traço) — decisão de biblioteca específica de ícones fica para o doc 13/14.

---

## 9. Acessibilidade (WCAG 2.1 AA como piso, não teto)

- Contraste mínimo AA (4.5:1 texto normal, 3:1 texto grande) validado para **todos** os pares token de texto/fundo, em ambos os temas — os valores propostos na seção 5.1 devem ser testados com ferramenta de contraste antes do lançamento (parte do que fica marcado como "candidato").
- Nenhuma informação transmitida **só** por cor (reforça seção 8 — ícone + cor, nunca cor isolada).
- Estado `Focus` sempre visível e nunca removido (seção 6.2).
- Alvos de toque mínimos de 44×44px (mobile).
- Suporte a leitor de tela: todo componente interativo tem rótulo acessível; toda imagem/mídia gerada pelo usuário permite descrição alternativa opcional.
- Suporte a `prefers-reduced-motion` (seção 5.7) e a aumento de fonte do sistema sem quebra de layout.

---

## 10. Internacionalização Visual

- Nenhum componente assume comprimento fixo de texto — botões/labels acomodam expansão de até ~30% (alemão/português tendem a ser mais longos que o inglês de referência).
- Estrutura preparada para **RTL** (right-to-left): layout lógico (`start`/`end`, não `left`/`right`) em todos os componentes desde já — não implementado para nenhum idioma RTL agora, mas nenhuma decisão desta seção impede.
- Catálogos código+tradução (doc 08 §8) renderizam sempre através do Seletor (seção 7.2), nunca texto hardcoded.
- Números/datas/moeda formatados pela camada de apresentação por locale (doc 04 §19), nunca fixos no componente.

---

## 11. Layout Responsivo (Desktop, Tablet, Mobile)

- Mobile-first na especificação de cada componente; breakpoints (seção 5.8) reorganizam densidade, não removem funcionalidade.
- Navegação primária muda de forma (bottom nav → sidebar) nos breakpoints tablet/desktop, mas usa os mesmos itens e mesma lógica (seção 7.4).
- Telas T2 (Listagem) em desktop podem usar grid de múltiplas colunas; em mobile, lista única — mesmo componente-base, layout responsivo, não dois componentes.
- Painel Administrativo (doc 10) é desktop-first por natureza de uso, mas não exclui mobile.

---

## 12. Animação e Microinterações

- Transição de tela: `motion.deliberate` com `ease-standard`.
- Feedback de toque (botão pressionado): `motion.instant`.
- Toast/Banner: entra com `ease-decelerate`, sai com `ease-accelerate`.
- Gráficos (seção 7.1): transição suave ao atualizar dado, nunca "pulo" abrupto de valor.
- Nenhuma animação decorativa sem função — cada microinteração comunica um estado (carregando, sucesso, erro) ou orienta atenção (novo alerta).

---

## 13. Governança: Biblioteca Única para Grow, Med e Futuros Aplicativos

- **Regra permanente**: nenhum componente novo é criado "para o Grow" ou "para o Med" — todo componente é da plataforma, parametrizado por Accent Token e conteúdo.
- Um novo aplicativo futuro registra um novo `color.accent.[nome]` (seção 5.1) e, se necessário, novos ícones/ilustrações de estado Vazio — nunca uma nova biblioteca de componentes.
- Antes de criar qualquer componente novo (docs futuros, ou já na implementação), consultar esta seção 7 e o [Catálogo de Domínio](catalogo-de-dominio.md) — mesmo princípio de consulta prévia já aplicado a entidades/eventos/APIs.

---

## 14. Boas Práticas

- Todo valor de token (seção 5) é referenciado pelo nome, nunca hardcoded num componente.
- Nenhum componente novo nasce sem os 8 estados de interação (seção 6.2) e, se aplicável, os 8 estados de tela (seção 6.1) considerados.
- Grow e Med nunca divergem em espaçamento, tipografia ou estrutura de componente — só em Accent Token.

---

## 15. Riscos

| Risco | Observação |
|---|---|
| Valores de cor/tipografia ainda não validados com usuários reais | Marcados explicitamente como candidatos (seção 4) — ação de validação recomendada antes do lançamento |
| Accent do Med (`#6E7FE8`) e do Core (`#8B7FE0`) são visualmente próximos (ambos violeta-azulados) | Risco de confusão entre contexto "plataforma" e contexto "Med" — validar com teste de usuário; ajuste de tom é simples (são só valores de token) |
| RTL preparado mas nunca testado visualmente | Aceitável — não é MVP funcional, é só não-bloqueio estrutural (seção 10) |

---

## 16. Auditoria Cruzada Obrigatória (Docs 00–10) — antes de finalizar

> Verificação: toda entidade, fluxo, tela, API, estado, evento, componente e funcionalidade definidos anteriormente têm representação neste Design System.

| Verificação | Achado | Correção |
|---|---|---|
| Toda entidade tem um Card/representação visual? | Sim, via **Card de Entidade genérico** (seção 7.1) — incluindo as adicionadas na revisão 00-09 (Genética, Lote, ModeloDeCiclo/Tratamento) |
| Todo estado do doc 10 §5 tem forma visual? | Sim (seção 6.1) |
| Toda tela do doc 10 (incluindo Painel Administrativo, adicionado na pré-auditoria deste documento) usa componentes desta biblioteca? | Sim — nenhuma tela exige componente fora do catálogo da seção 7 |
| Todo componente mencionado nos docs 02/03/05/06/07/10 foi consolidado (sem duplicação)? | Sim — "Gráfico de série temporal", "Matriz de Privacidade", "Paywall" e "Seletor de Complexidade" (mencionados 2–3× cada) agora têm uma única definição (seção 7) |
| Toda funcionalidade Premium (doc 07 §8, 8 categorias) tem componente correspondente? | Sim — Badge de Categoria Premium (seção 7.7) cobre as 8 categorias |
| Todo evento que gera notificação (doc 09 revisão: `SeguimentoIniciado`, `ComentarioCriado`, `CurtidaRegistrada`, `AssinaturaAtualizada`, `PagamentoFalhou`) tem representação visual (Toast/Banner)? | Sim (seção 7.3) — nenhum evento de notificação social ou de billing ficou sem componente |
| Modo Discreto (doc 01) está representado em todos os níveis (estado de tela **e** componente)? | Sim — Indicador de Modo Discreto Ativo (seção 7.6) + variante de estado (seção 6.1) |

**Conclusão da auditoria**: nenhuma lacuna encontrada que exigisse correção retroativa em docs anteriores além das já aplicadas na pré-auditoria (doc 10, componentes/Painel Administrativo, feitas antes de iniciar este documento). Design System consistente com toda a documentação 00–10.

---

## 17. Sugestões de Melhorias

- Validar Accent Tokens de Med e Core com usuários reais antes do lançamento (risco da seção 15).
- Considerar, no doc 14, gerar os tokens desta seção 5 como arquivo único de configuração (ex.: JSON/YAML de tokens), consumido por qualquer stack escolhida no doc 13 — não hardcoded por plataforma (iOS/Android/Web).

---

## 18. Classificação de Escopo (MVP / V2 / V3 / Futuro / Pesquisa)

| Item | Classificação |
|---|---|
| Tokens completos (cor, tipografia, espaçamento, borda, sombra, opacidade, motion, grid), Dark+Light Mode | **MVP** |
| Biblioteca de componentes (seção 7 completa) | **MVP** |
| Acessibilidade AA, i18n visual, responsividade | **MVP** |
| RTL implementado/testado visualmente | **Futuro** |
| Validação de tokens com usuários reais | **Pesquisa** (ação pré-lançamento) |

---

## 19. Revisão Final de Arquitetura

- **Dificulta futuras integrações?** Não.
- **Dificulta internacionalização?** Não — seção 10 trata isso explicitamente.
- **Dificulta escalabilidade?** Não — biblioteca única e Accent Tokens escalam para N apps futuros sem redesenho.
- **Dificulta integração com novos aplicativos futuros?** Não — é exatamente o caso de uso que a governança da seção 13 resolve.

Nenhuma limitação relevante encontrada.

---

## 20. Teste de Completude (novo, aplicado a este documento)

> "Uma equipe experiente conseguiria implementar esta parte do sistema utilizando apenas este documento, sem precisar tomar decisões arquiteturais importantes?"

**Resposta**: Sim, com uma ressalva explícita e já assumida: os **valores exatos** de token (cores, tipografia específica) são candidatos, não definitivos — uma equipe pode implementar a **estrutura completa** (nomes de token, arquétipos de componente, estados, governança) imediatamente, e trocar os valores propostos por versões validadas sem retrabalho estrutural, já que todo componente referencia o **nome** do token, nunca o valor diretamente (seção 14). Isso não é uma lacuna de completude — é uma decisão explícita e documentada (seção 4) de separar "sistema" (completo) de "valor final" (a validar).

---

## Perguntas Estratégicas — antes de avançar para o Documento 12 (Roadmap)

1. Confirma a auditoria de cor da seção 15 (Accent do Med e do Core visualmente próximos) como aceitável para esta fase, a ajustar na validação com usuários?
2. Autoriza seguir para o doc 12 já com os tokens desta versão como base do Roadmap de implementação, mesmo sendo candidatos?

Pode responder de forma direta e objetiva — assim que tivermos essas respostas, seguimos para o **Documento 12 — Roadmap**.

---

## Artefatos para Implementação

### Checklist Técnico
- [ ] Implementar tokens (seção 5) como arquivo único de configuração, consumível por qualquer plataforma
- [ ] Implementar os dois temas (Dark padrão, Light) sobre o mesmo conjunto de nomes de token
- [ ] Implementar biblioteca de componentes (seção 7) com os 8 estados de interação (seção 6.2)
- [ ] Implementar Accent Tokens por app (Grow, Med) com mecanismo de registro para apps futuros
- [ ] Validar contraste WCAG AA de todos os pares token texto/fundo antes do lançamento

### Lista de Módulos
Não introduz módulo de domínio novo — é uma camada de apresentação transversal a Core/Grow/Med/Comunidade/IA/Premium.

### Lista de Telas
Nenhuma nova — consome o catálogo do doc 10.

### Lista de Componentes Reutilizáveis
Catálogo completo na seção 7 (substitui todas as menções fragmentadas anteriores).

### Lista de Entidades do Banco
Nenhuma.

### Lista de APIs Necessárias
Nenhuma nova.

### Lista de Permissões
Nenhuma nova.

### Eventos
Nenhum novo — este documento consome os eventos já catalogados para acionar Toast/Banner (seção 7.3).

### Casos de Teste
- Todo componente renderiza corretamente em Dark e Light apenas trocando o valor do token, sem lógica condicional de tema no componente
- Nenhum componente quebra layout com texto expandido em ~30% (seção 10)
- Contraste AA validado para todos os pares de token propostos
- Accent Token de um app nunca vaza para outro (ex.: tela do Med nunca usa `color.accent.grow`)

### Dependências com Outros Módulos
Nenhuma nova — consome decisões de todos os módulos anteriores como fonte de conteúdo.

### Riscos Técnicos
- Ferramenta de geração/sincronização de tokens entre design e código é decisão do doc 13/14 — este documento define a estrutura lógica, não a ferramenta
