# 01 — Identidade da COSMARIA

> Status: **Concluído e validado em 2026-07-08**, com uma única escolha em aberto e não-bloqueante (seleção final da tagline). Este documento define a identidade (nome, arquitetura de marca, tom de voz, valores, narrativa, direção visual conceitual); o **Design System visual detalhado** (cores, tipografia, componentes) fica no doc 11.

---

## 1. Objetivos

- Definir uma identidade de marca que sustente **dois produtos distintos** (Grow e Med) sob uma origem comum, sem confundir os públicos nem diluir a mensagem de nenhum dos dois.
- Construir confiança imediata em uma categoria sensível (cultivo e saúde relacionados a cannabis) — a marca precisa comunicar seriedade, cuidado e profissionalismo antes mesmo do usuário abrir o app.
- Criar uma base de nome, tom de voz e valores estável o suficiente para durar anos e suportar expansão para novos países e novos módulos (ex.: futuros produtos além de Grow/Med).
- Diferenciar claramente do universo "lifestyle/recreativo" de cannabis, reforçando o posicionamento de ferramenta séria de organização, acompanhamento e conhecimento (alinhado à postura legal definida no doc 00).

---

## 2. Problemas que Resolve

| Problema | Como a identidade resolve |
|---|---|
| Marcas de cannabis no mercado tendem a ser genéricas, excessivamente "lifestyle" ou, no extremo oposto, excessivamente clínicas e frias | COSMARIA busca um meio-termo: confiável e profissional, mas humano e acolhedor |
| Usuário de Med pode ter receio de exposição/estigma social ao usar um app "de cannabis" | Identidade do Med deve transmitir discrição, cuidado clínico e privacidade desde o primeiro contato visual/verbal |
| Cultivador quer ser levado a sério como "produtor", não estereotipado | Identidade do Grow deve comunicar competência técnica e comunidade de prática, não estética recreativa |
| Ter dois apps sob uma mesma empresa pode gerar mensagens desalinhadas se não houver uma identidade-mãe coesa | Arquitetura de marca explícita (seção 5) define como COSMARIA, Grow e Med se relacionam visual e verbalmente |
| Falta de consistência verbal (nomes de funcionalidades, tom, terminologia) gera retrabalho e experiência fragmentada | Glossário de tom de voz e valores serve de referência única para todo conteúdo futuro (produto, marketing, suporte) |

---

## 3. Escopo

**Incluído neste documento:**
- Nome da plataforma e dos apps (validação, não recriação do zero).
- Arquitetura de marca (relação COSMARIA ↔ Grow ↔ Med).
- Território de significado do nome "COSMARIA" (narrativa/origem a validar).
- Valores de marca e tom de voz (geral + por app).
- Direção conceitual de identidade visual (nível de intenção, não especificação técnica).
- Candidatos a tagline/posicionamento verbal.
- Riscos de marca (nome, domínio, marca registrada).

**Fora de escopo (tratado em outros documentos):**
- Paleta de cores, tipografia, componentes de UI → doc 11 (Design System).
- Nome de funcionalidades específicas dentro de Grow/Med → docs 03/04.
- Estratégia de marketing e aquisição → não coberta nesta sequência de documentos (pode ser adicionada depois, se desejar).

---

## 4. Funcionalidades (Entregáveis da Identidade)

Este documento, ao final, deve produzir os seguintes artefatos de referência para todos os documentos seguintes:

- Nome validado da plataforma e dos dois apps.
- Diagrama/regra de arquitetura de marca.
- Lista de valores de marca (3 a 5, com definição de cada um).
- Guia de tom de voz (geral + variação por app).
- Taglines candidatas para plataforma, Grow e Med.
- Direção conceitual de identidade visual (para orientar o doc 11).
- Lista de riscos de marca a resolver antes do lançamento (trademark, domínio).

---

## 5. Estrutura Modular — Arquitetura de Marca

Esta é a decisão mais importante deste documento. Há três modelos possíveis:

### Opção A — Marca-mãe com sub-marcas descritivas ("branded house")
`COSMARIA` como marca principal; `COSMARIA Grow` e `COSMARIA Med` como sub-marcas descritivas. É o modelo que já vínhamos usando como nome de trabalho.

- **Vantagens**: constrói uma única reputação/confiança que beneficia os dois produtos; marketing e SEO se reforçam mutuamente; mais barato construir uma marca forte do que duas; facilita cross-sell natural ("você já usa o Grow, conheça o Med").
- **Desvantagens**: qualquer problema reputacional em um app pode respingar no outro; um paciente de Med pode preferir não ter na tela do celular um app cujo nome remete a "cultivo"; menos flexibilidade para posicionar os dois públicos de forma totalmente distinta.

### Opção B — Marcas independentes ("house of brands")
Dois nomes de produto totalmente distintos (ex.: um nome só para o app de cultivo, outro só para o de uso medicinal), com "COSMARIA" existindo apenas como empresa por trás (mencionada discretamente, tipo "by COSMARIA").

- **Vantagens**: isola risco reputacional entre os dois públicos; permite tom, visual e posicionamento totalmente sob medida para cada público (crucial para o receio de estigma do paciente medicinal); nomes podem ser mais fortes individualmente em app stores/SEO de nicho.
- **Desvantagens**: dobra o esforço e custo de construção de marca; perde o efeito de reforço mútuo; a promessa de "ecossistema unificado" (central à visão do doc 00) fica menos visível para o usuário final; cross-sell exige mais trabalho de comunicação.

### Opção C — Marca endossada ("endorsed brand")
Nomes de produto distintos, mas com endosso visível da COSMARIA (ex.: "Cultiva, por COSMARIA" / "Alivia, por COSMARIA") — meio-termo entre A e B.

- **Vantagens**: mitiga parcialmente o problema de estigma (o nome do produto não precisa conter referência direta a cultivo/cannabis), mas ainda transmite a força institucional da COSMARIA; permite tom mais sob medida por público que a Opção A.
- **Desvantagens**: arquitetura de marca mais complexa de manter e comunicar; exige decidir e validar dois novos nomes de produto (trabalho adicional não previsto); risco de diluir a clareza que "COSMARIA Grow"/"COSMARIA Med" já têm hoje como nomes de trabalho.

### Recomendação

Considerando que (i) você já vem usando "COSMARIA Grow" e "COSMARIA Med" consistentemente, (ii) a visão do doc 00 é explicitamente de **ecossistema unificado** e (iii) o modelo de negócio depende de reforço mútuo de confiança entre os dois produtos, **recomendo a Opção A (branded house)** como padrão, com uma ressalva: o receio de estigma do paciente medicinal é real e vale a pena resolver por outros meios (não necessariamente pelo nome), como:

- Um **ícone de app e paleta visual do Med propositalmente mais discretos/clínicos** (não cannábicos), mesmo mantendo o nome "COSMARIA Med" (fica para o doc 11, mas a intenção já nasce aqui).
- O **"modo discreto"** já sugerido no doc 00 (ocultar nomes sensíveis em notificações/capturas de tela).

Isso resolve a preocupação central da Opção B/C sem pagar o custo de construir duas marcas do zero. Fica como recomendação — decisão final é sua (ver perguntas estratégicas).

```
COSMARIA (marca-mãe / plataforma)
│
├── COSMARIA Grow   → público: cultivadores. Tom: técnico, entusiasta, comunidade de prática.
├── COSMARIA Med    → público: pacientes. Tom: clínico, acolhedor, discreto.
└── [futuros módulos: ex. COSMARIA Business/Research — cabem na mesma arquitetura sem redesenho]
```

---

## 6. Fluxos (onde a identidade aparece)

A identidade não é só um logotipo — ela se manifesta em pontos de contato que precisam de consistência verbal/tonal desde já:

1. **Listagem na app store**: nome, ícone, descrição curta — primeiro contato, precisa comunicar em segundos "isso é sério e profissional".
2. **Onboarding**: linguagem de boas-vindas define a primeira impressão de tom (mais técnica no Grow, mais acolhedora no Med).
3. **Notificações/lembretes**: tom de voz do dia a dia (ex.: lembrete de rega vs. lembrete de dose de medicamento têm registros emocionais diferentes).
4. **Comunidade**: identidade verbal usada por outros usuários ao interagir (a marca "empresta" tom para a própria comunidade).
5. **Materiais de suporte/erro**: mensagens de erro, e-mails transacionais — precisam soar como a mesma "pessoa" em qualquer app.
6. **Futuro site oficial**: onde marketplace/cursos/consultorias vão viver (doc 00) — precisa herdar a mesma identidade-mãe.

---

## 7. Casos de Uso

- Um cultivador vê o COSMARIA Grow anunciado em uma comunidade de cultivo e decide instalar — a identidade precisa transmitir "feito por quem entende de cultivo", não "mais um app genérico de plantas".
- Um paciente busca "diário de cannabis medicinal" e encontra o COSMARIA Med — a identidade precisa parecer tão confiável quanto um app de saúde mainstream, sem parecer que "é sobre drogas".
- Um usuário híbrido (cultiva para uso próprio medicinal) percebe, pela consistência visual/verbal entre os dois apps, que eles são parte do mesmo ecossistema — reforçando a decisão de integração opt-in do doc 00.
- Um parceiro institucional (associação, clínica) avalia se assina um plano B2B — a identidade precisa comunicar solidez/profissionalismo suficiente para uma decisão de compra institucional.

---

## 8. Boas Práticas

1. **Consistência antes de criatividade** — qualquer novo texto de produto (botão, notificação, e-mail) deve ser checado contra o guia de tom de voz deste documento antes de ser escrito, não depois.
2. **Vocabulário técnico correto, sem jargão desnecessário** — especialmente no Med, onde o usuário pode estar em um momento vulnerável (tratamento de saúde).
3. **Nunca usar humor ou informalidade em contextos sensíveis** (sintomas, efeitos adversos, dor) — reservar tom mais leve para contextos de comunidade/cultivo.
4. **Marca única, vozes calibradas por público** — mesma "personalidade" de fundo, sotaque diferente por app (ver seção 9).
5. **Documentar decisões de nomenclatura** à medida que aparecem (nomes de funcionalidades, entidades) para evitar inconsistência entre os documentos 03/04 em diante.

---

## 9. Valores de Marca e Tom de Voz (proposta para validação)

### Valores (validados em 2026-07-08)

| Valor | O que significa na prática |
|---|---|
| **Conhecimento** | A marca existe para transformar registro em entendimento (eco da filosofia "dados em conhecimento" do doc 00) |
| **Cuidado** | Tom nunca é frio ou puramente técnico quando o assunto é saúde ou o esforço do cultivador |
| **Confiança** | Postura legal neutra, transparência sobre dados, seriedade visual e verbal |
| **Comunidade** | Reconhecimento de que cultivo e tratamento são jornadas compartilhadas, não solitárias |
| **Precisão** | Terminologia correta (técnica no Grow, clínica no Med) — a marca não "infantiliza" o usuário |
| **Inteligência** | A IA não é um recurso a mais, é parte da identidade — a marca "pensa junto" com o usuário |
| **Evolução Contínua** | O produto (e o próprio usuário, via insights) está sempre melhorando ciclo após ciclo, tratamento após tratamento |
| **Organização** | Um dos maiores valores percebidos de um bom diário é impor estrutura ao caos — a marca celebra isso |
| **Precisão Científica** | Base em dados e método, nunca em achismo — reforça Conhecimento e Inteligência com rigor |

Estes 9 valores devem aparecer de forma consistente em toda a plataforma (produto, comunicação, suporte, comunidade) — servem de checklist para qualquer texto ou decisão de tom publicado a partir de agora.

### Tom de voz — base comum
Direto, respeitoso, sem julgamento, baseado em evidência/prática, nunca sensacionalista em relação a cannabis. Ambos os apps devem transmitir, sempre, **alta qualidade, tecnologia e confiança** — a diferença é de calibragem, não de nível de qualidade percebida.

### Tom de voz — variação por app (validado)

- **COSMARIA Grow**: técnico, organizado, voltado para produtividade — tom de "colega experiente", fala a língua de quem cultiva (fases, parâmetros, jargão técnico correto), com um toque de entusiasmo de comunidade de prática.
- **COSMARIA Med**: humano, acolhedor, clínico — tom de "assistente clínico de confiança", calmo, claro, empático, nunca alarmista; evita qualquer linguagem que soe recreativa.

---

## 10. Escalabilidade Futura

- A arquitetura de marca (Opção A recomendada) precisa comportar **novos módulos futuros** sem parecer remendo — o padrão "COSMARIA + [Nome do módulo]" já é escalável nesse sentido.
- Ao expandir para outros países lusófonos, o nome "COSMARIA" deve ser verificado quanto a significados indesejados ou conflitos em Portugal/Angola/Moçambique (ação futura, não bloqueia agora).
- Tom de voz deve ser documentado de forma clara o suficiente para ser aplicado de forma consistente por múltiplas pessoas (ou por IA gerando conteúdo/notificações) conforme a equipe cresce.
- Se o modelo B2B (associações, clínicas) crescer, pode valer a pena, no futuro, uma sub-identidade "COSMARIA Business" — já cabe na arquitetura modular da seção 5.

---

## 11. Possíveis Integrações

- Co-branding com associações de cultivo e clínicas parceiras (planos B2B do doc 00) — a identidade precisa ter um "modo institucional" (ex.: um kit de marca simplificado para parceiros mencionarem a COSMARIA).
- Presença em comunidades e eventos do setor (cultivo e medicinal) — tom de voz e identidade visual precisam funcionar tanto digitalmente quanto em materiais impressos/eventos, se isso for cogitado no futuro.

---

## 12. Oportunidades de Monetização

A identidade em si não monetiza diretamente, mas **é um ativo que viabiliza monetização**:

- Confiança de marca é pré-requisito para conversão em Premium (usuário paga por algo em que confia, especialmente lidando com dados de saúde).
- Uma identidade percebida como profissional é o que torna plausível vender planos B2B a associações/clínicas.
- Uma marca-mãe forte facilita a extensão futura para cursos/consultorias no site oficial (doc 00) sem precisar reconstruir confiança do zero.

---

## 13. Riscos

| Risco | Categoria | Observação |
|---|---|---|
| Disponibilidade de marca registrada para "COSMARIA" no Brasil (INPI) e em categorias relevantes (software, saúde) | Legal | Busca exploratória feita agora (ver nota abaixo) não substitui uma busca formal em registros oficiais (INPI/USPTO/EUIPO) — recomendo contratar checagem formal antes de investir pesado em marketing sob esse nome |
| Disponibilidade de domínio (.com, .com.br) e handles de redes sociais | Operacional | Não verificado neste documento — ação recomendada antes do doc 12 (Roadmap) |
| Nome "COSMARIA" já é usado por um pequeno negócio não relacionado ("Cosmaria Beauty", salão de beleza) e aparece como sobrenome raro | Legal/Marca | Baixo risco de confusão (categorias completamente diferentes), mas reforça a necessidade de busca formal de marca registrada antes do lançamento |
| App stores restringem conteúdo relacionado a cannabis | Distribuição | Identidade visual/verbal precisa evitar qualquer elemento que pareça promover uso recreativo, reforçando a postura "ferramenta de organização/registro" definida no doc 00 |
| Tom de voz inconsistente entre os dois apps pode confundir a percepção de "ecossistema único" | Produto/Marca | Mitigado pelo guia de tom de voz desta seção — precisa ser respeitado por todos os documentos seguintes |

*Nota de due diligence*: fiz uma busca exploratória na web por "Cosmaria" em contexto de marca/cannabis/app e por domínios `cosmaria.com`/`cosmaria.com.br`. Não encontrei nenhuma marca, app ou empresa de cannabis usando esse nome — os únicos resultados relevantes foram um salão de beleza chamado "Cosmaria Beauty" (sem relação) e "Cosmaria" como sobrenome raro. Isso é um sinal positivo, mas **não substitui uma busca formal de marca registrada** (INPI no Brasil) nem uma checagem de disponibilidade de domínio/redes sociais.

---

## 14. Narrativa de Marca (proposta)

Você deixou em aberto a origem do nome, pedindo uma narrativa elegante, profissional e memorável que combine tecnologia, conhecimento, evolução, natureza, ciência e inovação — evitando qualquer conexão com uso recreativo. Proposta:

> **COSMARIA** nasce do encontro entre **"cosmos"** — o universo, a ordem, o sistema, a ciência que observa e organiza o que parece complexo — e **"ária"**, que ecoa tanto *área* (domínio, campo de conhecimento) quanto *aria* (a peça musical que dá forma e harmonia a algo vivo). COSMARIA é, assim, **o domínio onde natureza e tecnologia entram em harmonia**: um sistema que observa cada planta e cada tratamento como um pequeno universo próprio — com suas variáveis, seus ciclos, sua evolução — e transforma essa observação em conhecimento organizado.

Essa narrativa serve três propósitos práticos:
1. Justifica visualmente uma direção "cósmica/sistêmica" para o doc 11 (Design System) — órbitas, constelações de dados, uma sensação de ordem dentro da complexidade — sem recorrer a imagética recreativa (folhas, fumaça, etc.).
2. Dá ao nome uma leitura dupla e elegante (cosmos + área/harmonia) que soa bem tanto no contexto técnico do Grow quanto no contexto clínico/humano do Med.
3. Reforça, na própria origem do nome, os valores de Conhecimento, Precisão Científica e Evolução Contínua da seção 9.

*(Proposta para sua validação — se preferir outra direção de narrativa, este é o momento de ajustar antes que ela influencie o doc 11.)*

---

## 15. Requisito de Produto — Modo Discreto

Confirmado como **requisito de produto** (não apenas decisão de marca), a ser herdado pelos docs 02/03 (Grow/Med), 10 (Fluxos UX), 11 (Design System) e 13 (Stack Tecnológica). Quando ativado, o Modo Discreto deve (nível de intenção — implementação técnica detalhada nos docs futuros):

- Ocultar nomes sensíveis (plantas, tratamentos, produtos) no conteúdo de notificações.
- Ocultar informações sensíveis na tela ao vivo (ex.: um "modo tela de bloqueio" que esconde dados até desbloqueio/autenticação extra).
- Permitir trocar o ícone do aplicativo por um ícone neutro.
- Permitir trocar o nome exibido no launcher/tela inicial do dispositivo, **se tecnicamente viável**.
- Ocultar/borrar miniaturas de imagens sensíveis em galerias e listas.

**Pendência registrada**: a viabilidade técnica real de troca dinâmica de ícone e, principalmente, de nome exibido no launcher varia entre Android e iOS (iOS é historicamente mais restritivo nesse ponto). Essa pesquisa técnica fica registrada como pendente para os docs 10/11/13, conforme solicitado — não bloqueia o avanço da documentação de produto agora.

---

## 16. Taglines Candidatas (propostas — escolha final pendente)

### Plataforma (COSMARIA)
- "O ecossistema inteligente do cultivo e do cuidado."
- "Onde ciência, natureza e tecnologia se encontram."
- "Conhecimento cultivado, cuidado evoluído."
- "A inteligência por trás do seu cultivo e do seu tratamento."

### COSMARIA Grow
- "Seu diário de cultivo, mais inteligente a cada ciclo."
- "Cultive com precisão. Colha com conhecimento."
- "Cada planta, uma história. Cada ciclo, mais inteligência."
- "O cultivo levado a sério."

### COSMARIA Med
- "Acompanhe seu tratamento com clareza."
- "Cuidado clínico, registrado com precisão."
- "Sua jornada terapêutica, compreendida em detalhes."
- "Mais clareza sobre o que realmente funciona para você."

*(Escolha não é bloqueante — pode ser feita a qualquer momento, inclusive mais adiante, sem impacto nos próximos documentos.)*

---

## 17. Sugestões de Melhorias

- Considerar registrar a marca "COSMARIA" (e variações "COSMARIA Grow"/"COSMARIA Med") no INPI o quanto antes, mesmo antes do lançamento, dado o tempo que processos de registro de marca levam.
- Reservar domínio e handles de redes sociais para "COSMARIA", "COSMARIA Grow" e "COSMARIA Med" assim que possível, independentemente do estágio de desenvolvimento do produto.
- Ao desenvolver o doc 11 (Design System), considerar testar a percepção do ícone/identidade visual do Med com pacientes reais quanto à sensação de discrição/confiança antes de finalizar.

---

## 18. Decisões Consolidadas (validado com o usuário em 2026-07-08)

| # | Tema | Decisão |
|---|---|---|
| 1 | Arquitetura de marca | **Opção A confirmada** — COSMARIA como marca-mãe; todo produto futuro segue o padrão "COSMARIA + Nome do Produto". |
| 2 | Origem do nome | Sem origem pré-definida pelo usuário — narrativa proposta na seção 14 ("cosmos" + "área/harmonia"), sem conexão com uso recreativo. |
| 3 | Valores de marca | 9 valores confirmados: Conhecimento, Cuidado, Confiança, Comunidade, Precisão, Inteligência, Evolução Contínua, Organização, Precisão Científica. |
| 4 | Tom de voz | Confirmado: Grow técnico/organizado/produtivo; Med humano/acolhedor/clínico; ambos transmitindo alta qualidade, tecnologia e confiança. |
| 5 | Modo Discreto | Confirmado como **requisito de produto** (seção 15), com pesquisa técnica Android/iOS pendente para docs futuros. |
| 6 | Tagline | Propostas na seção 16 — escolha final pendente, não bloqueante. |
| 7 | Registro de marca/domínio | Ainda não iniciado — vira item de ação no Roadmap (doc 12). |

**Diretriz permanente registrada** (vale para todos os documentos daqui em diante): nenhuma decisão importante de arquitetura, produto, UX, monetização, IA, banco de dados ou tecnologia deve ser assumida — sempre apresentar alternativas, vantagens/desvantagens e uma recomendação técnica justificada, só tratando como definitivo após aprovação explícita. Além disso, atuo continuamente como consultor de produto: toda decisão relevante deve ser comparada aos concorrentes mundiais (Grow with Jane, GrowDiaries, Grow Journal AI, Tetragram, Leafly, SeedFinder, AllBud, Jointly, Strainprint), buscando tornar a COSMARIA superior — nunca apenas equivalente — e propondo diferenciais competitivos antes de qualquer implementação.

**Ordem de documentos atualizada** (a pedido do usuário — arquitetura deve nascer para atender ao produto, não o contrário): 00 Visão Geral ✅ · 01 Identidade ✅ · **02 COSMARIA Grow (100% completo)** · 03 COSMARIA Med (100% completo) · 04 Arquitetura Geral · 05 Inteligência Artificial · 06 Comunidade · 07 Sistema Premium · 08 Banco de Dados · 09 APIs · 10 Fluxos do Usuário (UX) · 11 Design System · 12 Roadmap · 13 Stack Tecnológica · 14 Estrutura do Código · 15 Implementação.

Este documento está **concluído**. Seguimos para o **Documento 02 — COSMARIA Grow (100% completo)**.
