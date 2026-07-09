# 00 — Visão Geral da Plataforma COSMARIA

> Status: **Concluído e validado em 2026-07-08.** Este documento é a base de todos os demais. As decisões consolidadas estão registradas na seção final.

---

## 1. Objetivos

A COSMARIA existe para se tornar **o maior ecossistema em língua portuguesa dedicado ao cultivo e ao uso medicinal de cannabis**, unindo em uma única plataforma:

- Um diário de cultivo completo e inteligente (**COSMARIA Grow**).
- Um sistema de acompanhamento terapêutico para pacientes de cannabis medicinal (**COSMARIA Med**).
- Uma camada de inteligência artificial que aprende com o histórico de cada usuário e, no futuro, cruza dados entre cultivo e uso medicinal.
- Uma comunidade de cultivadores e pacientes que hoje está fragmentada em grupos de redes sociais, planilhas manuais e apps genéricos (muitos em inglês, sem foco em cannabis).

**Objetivos estratégicos de negócio:**

1. Ser a referência nº 1 em língua portuguesa para cultivo e uso medicinal de cannabis — hoje esse espaço não tem um player dominante.
2. Construir uma base de dados proprietária (com consentimento do usuário) sobre cultivo e efeitos terapêuticos, que se torna um ativo de valor crescente (para IA, para insights, para eventuais parcerias de pesquisa).
3. Criar um produto com retenção de longo prazo (diário = uso recorrente diário/semanal), não um app de uso único.
4. Viabilizar monetização sustentável via assinatura premium, mantendo a confiança do usuário (dados sensíveis de saúde e, em muitas jurisdições, atividade juridicamente delicada).

**Objetivos de produto:**

- Ser o **melhor diário de cultivo do mercado** — mais completo, mais inteligente e mais fácil de usar que concorrentes generalistas.
- Dar a pacientes de cannabis medicinal uma ferramenta clínica de qualidade para acompanhar tratamento, sintomas e evolução — hoje geralmente feito em papel ou planilha.
- Preparar, desde o dia 1, a arquitetura para que Grow e Med conversem entre si no futuro (ex.: "este óleo que você usa veio deste cultivo — veja a correlação com seus sintomas").

### 1.1 Filosofia de Produto — Transformar Dados em Conhecimento

A COSMARIA não existe para ser um repositório de registros. O diferencial central da plataforma é uma camada de IA que aprende continuamente com o histórico de cada usuário e, no futuro, também com dados agregados anonimizados, para transformar dados brutos em conhecimento acionável. Exemplos de capacidades que orientam o design desde já (detalhamento completo no documento 05):

- Identificar padrões entre cultivos de um mesmo usuário (e, futuramente, entre usuários).
- Sugerir melhorias específicas com base no histórico registrado.
- Comparar ciclos de cultivo entre si automaticamente.
- Prever rendimento com base em variáveis registradas ao longo do ciclo.
- Identificar possíveis problemas antes que se agravem (ex.: sinais precoces de praga/deficiência).
- Relacionar (sempre de forma opt-in) um cultivo específico do Grow com os resultados terapêuticos obtidos posteriormente no Med.

Esta filosofia é um princípio transversal: toda decisão de modelagem de dados (doc 08) deve preservar a granularidade e a estrutura necessárias para que a IA consiga, no futuro, gerar esses insights — não apenas armazenar o dado de forma "solta". *(Detalhamento completo da arquitetura de IA — motores independentes, explicabilidade máxima, priorização do histórico do próprio usuário como princípio permanente — no doc 05.)*

---

## 2. Problemas que Resolve

| Problema hoje | Como a COSMARIA resolve |
|---|---|
| Cultivadores registram dados de cultivo em cadernos, planilhas ou apps genéricos de plantas (sem contexto de cannabis: fases de vida, EC/pH, genética, VPD, etc.) | Diário de cultivo especializado, com terminologia e fluxos pensados para cannabis |
| Apps de cultivo existentes no mercado são majoritariamente em inglês, com UX datada ou sem inteligência de dados | Produto em português, moderno, com IA nativa desde o design |
| Pacientes medicinais não têm ferramenta estruturada para relacionar dose, produto, sintoma e efeito ao longo do tempo | Diário terapêutico estruturado, pensado com vocabulário clínico, exportável para médicos |
| Falta de dados agregados e anônimos que ajudem cultivadores/pacientes a tomar melhores decisões (ex.: "cultivadores com este perfil de ambiente tiveram X resultado") | Base de dados proprietária + IA que gera recomendações a partir de padrões agregados |
| Comunidade de cultivo/medicinal fragmentada em grupos de Facebook/Telegram, sem histórico estruturado nem busca | Comunidade integrada ao produto, conectada aos dados reais do usuário (não anônima genérica) |
| Ausência de uma plataforma que trate cultivo e uso medicinal como partes de uma mesma jornada | Arquitetura compartilhada entre Grow e Med, permitindo cruzamento de dados futuro |

---

## 3. Escopo

### Escopo incluído na visão da plataforma (v1 conceitual, antes de roadmap detalhado)

- Dois aplicativos (Grow e Med) com identidade visual e proposta de valor próprias, mas login, perfil, billing e IA compartilhados.
- Estrutura de conta única (single sign-on) que permite a um usuário ter acesso a Grow, Med, ou ambos.
- Backend, banco de dados e infraestrutura de IA compartilhados entre os dois apps.
- Camada de comunidade integrada (mas seu escopo funcional detalhado será definido no documento 06).
- Modelo de monetização premium (detalhado no documento 07).

### Fora do escopo desta visão geral (tratado em documentos específicos, não aqui)

- Detalhes funcionais completos do Grow → documento 02.
- Detalhes funcionais completos do Med → documento 03.
- Modelo de dados e schema → documento 08.
- Escolhas de stack tecnológica → documento 13.
- Fluxos de tela e wireframes → documentos 10 e 11.

### Fora do escopo do produto (decisão validada)

- **Marketplace/e-commerce dentro dos apps**: fora de escopo agora e a médio prazo. Marketplace, cursos e consultorias serão oferecidos no **site oficial da COSMARIA**, fora dos aplicativos. Os apps poderão eventualmente integrar essas áreas (ex.: link/deep-link para o site), mas o foco do app continua sendo produtividade e registro de dados, não transação comercial.
- Emissão de laudos médicos ou prescrição — a COSMARIA Med é uma ferramenta de acompanhamento, não substitui prontuário médico nem prescrição.

---

## 4. Funcionalidades (visão macro)

Nível plataforma (detalhamento fica para os documentos 03–07):

- **Conta e perfil único**: um cadastro, com escolha de quais módulos usar (Grow, Med, ou ambos).
- **Diário de cultivo (Grow)**: plantas, ambientes, ciclos, tarefas, fotos, colheitas, insights.
- **Diário terapêutico (Med)**: tratamentos, sintomas, dosagens, produtos, efeitos, evolução clínica.
- **IA transversal**: análises e recomendações baseadas no histórico do usuário, com potencial de cruzar dados Grow ↔ Med (futuro).
- **Comunidade**: espaço social conectado à identidade e dados do usuário (com controles de privacidade).
- **Sistema Premium**: camada de assinatura que desbloqueia funcionalidades avançadas de IA, histórico, exportações, etc.
- **Notificações e lembretes**: tarefas de cultivo, horários de medicação/dose.
- **Exportação de dados**: relatórios para uso pessoal ou compartilhamento com médicos/associações.

---

## 5. Estrutura Modular

Visão de alto nível da modularidade da plataforma (arquitetura detalhada no documento 04, escrito depois de Grow e Med estarem 100% especificados):

```
COSMARIA Platform
│
├── Core (compartilhado)
│   ├── Autenticação e Identidade (conta única)
│   ├── Perfil de Usuário
│   ├── Autorização e Permissões
│   ├── Motor de Privacidade Granular (dimensão × escopo — atualizado no doc 04)
│   ├── Consentimento e Conformidade LGPD (atualizado no doc 04)
│   ├── Billing / Assinaturas (Sistema Premium)
│   ├── Motor de IA / Correlação (serviço compartilhado)
│   ├── Motor de Relatórios (atualizado no doc 04)
│   ├── Complexidade Progressiva (atualizado no doc 04)
│   ├── Notificações
│   ├── Armazenamento de Mídia
│   └── Comunidade
│
├── COSMARIA Grow (módulo/app)
│   ├── Plantas
│   ├── Ambientes (tendas, estufas, outdoor)
│   ├── Ciclos de cultivo
│   ├── Tarefas e lembretes
│   ├── Registro fotográfico
│   ├── Colheitas
│   └── Insights de cultivo (IA)
│
└── COSMARIA Med (módulo/app)
    ├── Tratamentos
    ├── Sintomas
    ├── Produtos e dosagens
    ├── Registro de efeitos
    ├── Linha do tempo clínica
    └── Insights terapêuticos (IA)
```

Princípio orientador: **Core não conhece detalhes de Grow ou Med**; Grow e Med consomem serviços do Core. Isso permite evoluir, versionar e até desacoplar cada app sem quebrar o outro.

---

## 6. Fluxos (alto nível)

Fluxos macro da plataforma como um todo (fluxos detalhados de tela ficam no documento 10):

1. **Onboarding inicial**: usuário cria conta → escolhe propósito (cultivo, uso medicinal, ou ambos) → é direcionado ao(s) app(s) relevante(s).
2. **Uso recorrente**: usuário abre o app do dia a dia (Grow ou Med) → registra atividade → recebe insights/lembretes.
3. **Cruzamento futuro Grow↔Med**: usuário com ambos os módulos ativos pode, opcionalmente, vincular um produto usado no Med a um cultivo registrado no Grow.
4. **Upgrade para Premium**: usuário esbarra em um limite ou vê valor em uma funcionalidade avançada → converte para assinante.
5. **Participação na comunidade**: usuário publica, comenta ou consulta conteúdo de outros usuários, com dados de seu perfil/cultivo/tratamento opcionalmente conectados.

---

## 7. Casos de Uso

**Personas iniciais (a validar/expandir no doc 02/03):**

- **Cultivador iniciante** — quer aprender e não errar no primeiro cultivo, precisa de orientação passo a passo.
- **Cultivador experiente** — quer histórico detalhado, comparação entre ciclos, otimização de ambiente.
- **Paciente medicinal novo** — está começando tratamento com cannabis, precisa estruturar o que está tomando e observar efeitos.
- **Paciente medicinal de longo prazo** — quer histórico robusto para levar ao médico, entender padrões entre dose/sintoma.
- **Usuário híbrido** — cultiva para uso próprio medicinal; é o caso de uso que mais justifica a integração Grow↔Med.

**Casos de uso centrais da plataforma (não do app individual):**

- Como plataforma única, permitir que um usuário híbrido não precise recriar sua identidade/perfil em dois produtos diferentes.
- Permitir que a equipe da COSMARIA evolua Grow e Med em velocidades diferentes sem que um bloqueie o outro.
- Permitir, no futuro, que dados agregados (anonimizados) alimentem recomendações de IA cada vez melhores.

---

## 8. Boas Práticas

Princípios que devem guiar **todas** as decisões dos documentos seguintes:

1. **Documentação antes de código** — este processo que estamos seguindo agora.
2. **Modularidade real, não só nominal** — Core, Grow e Med devem poder evoluir e (no limite) ser implantados/escalados independentemente.
3. **Privacidade e dados sensíveis por padrão restritivo** — dados de saúde (Med) e de cultivo (que pode ser juridicamente sensível conforme o país) exigem postura "privacy by design": consentimento explícito, controles granulares de compartilhamento, minimização de dados.
4. **Nomenclatura consistente em português** desde o início (entidades, eventos, documentação), evitando retrabalho de tradução/rebranding depois.
5. **Decisões registradas, não implícitas** — cada escolha relevante deve ficar documentada com alternativas consideradas e justificativa (é assim que este e os próximos documentos serão escritos).
6. **Design para internacionalização futura**, mesmo sendo português o foco inicial (evitar strings hardcoded, formatos de data/hora fixos, etc. — decisão técnica, mas a visão precisa contemplar isso desde já).

---

## 9. Escalabilidade Futura

Para suportar crescimento a milhões de usuários globalmente, a visão da plataforma já precisa considerar:

- **Escalabilidade de produto**: novos módulos além de Grow/Med (ex.: um futuro "COSMARIA Business" para associações/clubes, ou "COSMARIA Research" para pesquisa) devem caber na estrutura Core + módulos sem redesenho.
- **Escalabilidade geográfica**: expansão para outros países lusófonos (Portugal, Angola, Moçambique) e, depois, outros idiomas — a arquitetura de conteúdo/i18n deve ser prevista mesmo que não implementada agora.
- **Escalabilidade legal/regulatória**: cultivo e uso medicinal de cannabis têm status legal muito diferente entre países (e mesmo dentro do Brasil, entre cultivo pessoal, associativo e por prescrição). A plataforma deve ser desenhada para se adaptar a diferentes regimes regulatórios por região, sem reescrever o produto.
- **Escalabilidade de dados/IA**: volume de dados de diário (fotos, séries temporais de sintomas/ambiente) cresce rápido; a arquitetura de IA (doc 05) precisa ser pensada para esse volume desde o início.
- **Escalabilidade organizacional**: documentação modular (este processo) já é, em si, uma decisão de escalabilidade — permite que múltiplos times/desenvolvedores (humanos ou IA) trabalhem em paralelo em módulos diferentes sem depender do contexto inteiro do produto.

---

## 10. Possíveis Integrações

A nível de plataforma (integrações específicas de cada app serão detalhadas depois):

- **Pagamentos/assinaturas**: gateways de pagamento (Stripe e/ou gateways locais brasileiros).
- **Notificações**: push notification, e-mail transacional, WhatsApp (alto uso no Brasil).
- **IA**: provedores de LLM (ex.: Anthropic Claude) para a camada de inteligência artificial transversal.
- **Saúde/clínico (Med)**: possível integração futura com prontuário eletrônico ou exportação em formatos usados por médicos.
- **Comunidade**: possível integração com login social, moderação de conteúdo (IA de moderação).
- **Analytics/observabilidade**: ferramentas de produto (analytics de uso) e de infraestrutura (monitoramento), a definir no doc 04/13.

---

## 11. Oportunidades de Monetização

Decisão validada: **a COSMARIA não monetiza dados de usuários**, nem mesmo agregados/anonimizados. A receita vem exclusivamente de valor entregue diretamente ao usuário ou a organizações parceiras, nunca da exploração dos dados registrados. A explorar em profundidade no documento 07 (Sistema Premium), mapeado aqui em nível de visão:

1. **Assinatura Premium (principal)** — funcionalidades avançadas de IA, análises completas, comparações, diagnósticos, previsões, dashboards, exportações, armazenamento ampliado, funcionalidades profissionais. Princípio duro: o free continua extremamente útil; nunca limitar funcionalidades básicas apenas para forçar assinatura.
2. **Planos profissionais/B2B** — associações de cultivo, clínicas ou grow shops usando a plataforma para gerenciar múltiplos pacientes/cultivadores (potencial forte, dado o contexto brasileiro de associações).
3. **Cursos e conteúdo educacional** — oferecidos no site oficial da COSMARIA, com possível integração/divulgação a partir dos apps.
4. **Consultorias** — serviços profissionais oferecidos via site oficial.
5. **Futuros serviços da COSMARIA** — a definir conforme a plataforma amadurece, sempre seguindo o princípio de não monetizar dados de usuários.

---

## 12. Riscos

| Risco | Categoria | Observação |
|---|---|---|
| Status legal do cultivo pessoal varia e é sensível em várias jurisdições (inclusive Brasil) | Legal/Regulatório | Precisa de postura clara: a COSMARIA é uma ferramenta de registro/diário, não incentiva nem facilita atividade ilegal — mas isso precisa ser definido explicitamente na política do produto |
| Dados de saúde (Med) são dados sensíveis (LGPD no Brasil, GDPR se expandir para Europa) | Legal/Privacidade | Exige arquitetura de dados com consentimento, criptografia e possivelmente anonimização desde o design (doc 08) |
| Dependência de provedores de IA externos (custo, disponibilidade, mudança de política de uso para conteúdo relacionado a cannabis) | Técnico/Fornecedor | Avaliar múltiplos provedores e políticas de uso aceitável |
| App stores (Apple/Google) têm políticas restritivas para conteúdo relacionado a drogas/cannabis | Distribuição | Pode exigir estratégia de publicação cuidadosa (categorização, países disponíveis, possivelmente PWA como alternativa) |
| Ser "dois produtos em um" pode diluir foco e mensagem de marketing | Produto/Negócio | Mitigado por identidade visual distinta por app (doc 01), mas união de marca precisa ser bem calibrada |
| Comunidade pode gerar conteúdo problemático (moderação, desinformação médica) | Produto/Legal | Precisa de política de moderação clara, especialmente para conteúdo relacionado a saúde (doc 06). Reforçado pelo modelo "GitHub para cultivadores": conteúdo é mais estruturado que uma rede social genérica, mas ainda exige moderação |
| Crescimento de dados/IA sem arquitetura pensada para escala pode gerar retrabalho caro depois | Técnico | Mitigado pela abordagem "documentação e arquitetura antes de código" que estamos seguindo |

---

## 13. Sugestões de Melhorias

Pontos que vale considerar ao longo do processo, mesmo que não decididos agora:

- Definir desde já uma **política de dados e privacidade pública** (transparência) como diferencial de confiança, dado o tema sensível — pode virar vantagem competitiva.
- Considerar um **modo "anônimo/discreto"** de uso (ex.: ocultar nomes de plantas/tratamentos em capturas de tela, modo privacidade em notificações) — relevante dado o contexto social do tema.
- Pensar a marca guarda-chuva "COSMARIA" de forma que comporte novos módulos no futuro sem parecer forçado (ex.: não amarrar a marca só a "cultivo + medicinal").
- Avaliar se convém lançar **Grow e Med em momentos diferentes** (MVP focado em um primeiro) versus lançar os dois juntos — ~~decisão histórica descartada: "Grow primeiro, Med em seguida"~~. **Decisão final (doc 12, Roadmap): MVP único**, com Core + Grow + Med + IA + Comunidade + Premium desde o primeiro lançamento — Grow mais maduro funcionalmente, Med com escopo essencial, ambos totalmente integrados desde o dia 1.

---

## 14. Benchmark de Mercado (referência, não cópia)

Referências a analisar continuamente ao longo do projeto — pontos fortes a superar, pontos fracos a eliminar, nunca a copiar diretamente: **Grow with Jane, GrowDiaries, Grow Journal AI, Tetragram, Leafly, SeedFinder, AllBud, Jointly, Strainprint**. Princípio orientador: sempre que houver oportunidade de inovação, a COSMARIA deve preferir criar uma solução própria a reproduzir uma funcionalidade já existente no mercado. Análise competitiva detalhada (o que cada um faz bem/mal) será feita nos documentos 03 (Grow), 04 (Med) e 06 (Comunidade), onde é acionável.

---

## 15. Decisões Consolidadas (validado com o usuário em 2026-07-08)

| # | Tema | Decisão |
|---|---|---|
| 1 | Mercado inicial | Brasil. Arquitetura já nasce preparada para internacionalização futura (sem hardcode de idioma/formato). |
| 2 | Postura legal | Comunicação neutra e profissional: ferramenta de organização/acompanhamento/registro, não incentivo a atividade ilegal. Adaptável à legislação de cada país. |
| 3 | Um app ou dois | **Dois aplicativos separados** (marcas próprias, listagens de loja distintas), compartilhando conta, backend, banco de dados e IA. |
| 4 | Integração Grow ↔ Med | Sempre **opt-in explícito** do usuário, nunca automática. |
| 5 | Marketplace/e-commerce | Fora do escopo dos apps agora e no médio prazo. Vive no site oficial da COSMARIA (marketplace, cursos, consultorias); apps podem integrar essas áreas no futuro, mas o foco do app é produtividade/registro. |
| 6 | Monetização de dados agregados | **Rejeitada.** Nenhuma monetização baseada em dados de usuários, nem anonimizados. Receita via Premium, planos profissionais/B2B, cursos, consultorias e futuros serviços no site oficial. |
| 7 | Prioridade de lançamento | ~~Decisão histórica, substituída~~: "Grow primeiro, Med em seguida" — **não é mais a direção vigente**. **Decisão final (doc 12, Roadmap, confirmada 2026-07-08): MVP único** — Core + Grow + Med + IA + Comunidade + Premium funcionando juntos desde o primeiro lançamento; Grow nasce mais maduro funcionalmente, Med nasce com escopo essencial mas totalmente integrado. |
| 8 | Nomes dos apps | "COSMARIA Grow" e "COSMARIA Med" são nomes de trabalho válidos por ora, podem ser refinados no doc 01 (Identidade). |

Este documento está **concluído**. Seguimos para o **Documento 01 — Identidade da COSMARIA**.

---

## 16. Diretrizes de Processo Permanentes

> Esta seção é **viva** — cresce ao longo do projeto conforme novas diretrizes de processo são estabelecidas. É a referência oficial (não apenas em memória de conversa) para que qualquer pessoa — ou o próprio Claude Code em uma sessão futura de implementação — entenda como este projeto é conduzido, independentemente de em qual documento a diretriz foi originada.

1. **Nunca assumir decisões importantes.** Toda decisão relevante de arquitetura, produto, UX, monetização, IA, banco de dados ou tecnologia deve ser apresentada como alternativas, com vantagens/desvantagens de cada uma e uma recomendação técnica justificada. Só é tratada como definitiva após aprovação explícita do usuário. *(Origem: doc 00/01.)*

2. **Consultoria de produto contínua e superioridade competitiva.** Comparar continuamente com os principais concorrentes mundiais (Grow with Jane, GrowDiaries, Grow Journal AI, Tetragram, Leafly, SeedFinder, AllBud, Jointly, Strainprint, e outros que surgirem). Nunca almejar apenas paridade — sempre buscar superar. Pesquisar continuamente novas funcionalidades e tendências do mercado ao longo de todo o projeto, não só no momento de escrever cada documento. Sempre que uma oportunidade de diferencial competitivo for percebida, interromper o fluxo e apresentá-la antes de continuar. *(Origem: doc 00/01/02.)*

3. **Teste de validação de funcionalidade (5 perguntas).** Toda funcionalidade nova proposta em qualquer parte do projeto deve responder: (1) Isso realmente economiza tempo do usuário? (2) Isso realmente gera conhecimento? (3) Isso incentiva o usuário a voltar ao aplicativo? (4) Isso gera dados úteis para a IA? (5) Isso aumenta o valor da comunidade? Se a resposta for "não" para a maioria, a funcionalidade deve ser repensada antes de entrar em qualquer documento de escopo. *(Origem: doc 02.)*

4. **Classificação obrigatória de escopo.** Toda ideia nova — mesmo que boa — deve ser classificada em **MVP**, **Versão 2**, **Versão 3**, **Futuro** ou **Pesquisa** antes de ser aceita no escopo ativo de um documento, para evitar crescimento descontrolado. Tudo que não for MVP é registrado no documento companion **[Ideias Futuras](ideias-futuras.md)**, que acompanha todo o projeto (fora da sequência numerada 00–15) e nunca deve ser deixado desatualizado. *(Origem: doc 02.)*

5. **Artefatos para Implementação.** A partir do documento 02 (inclusive), todo documento termina com uma seção "Artefatos para Implementação" contendo: checklist técnico, lista de módulos, lista de telas, lista de componentes reutilizáveis, lista de entidades do banco, lista de APIs necessárias, lista de permissões, eventos, notificações, casos de teste, dependências com outros módulos e riscos técnicos. Objetivo: ao final de toda a documentação, o projeto deve poder ser gerado quase mecanicamente a partir desses artefatos — cada um escrito como se o próximo passo fosse entregar aquele módulo ao Claude Code para implementação. Os documentos 00 e 01 (visão e marca, não módulos funcionais) não recebem essa seção. *(Origem: doc 02, confirmado pelo usuário.)*

6a. **Documentação como sistema único — política revisada em 2026-07-08 (após doc 12).** Antes de iniciar qualquer novo documento: verificar consistência apenas com as **dependências diretas** do documento em produção (não mais uma revisão completa de todos os documentos anteriores a cada novo doc), corrigir o que for encontrado, e apresentar um plano do novo documento (objetivo, dependências, decisões que influencia, decisões que dependem dele, riscos, perguntas estratégicas) para aprovação **antes** de escrevê-lo. Uma **auditoria arquitetural global** (revisão de todos os documentos anteriores) só é feita quando solicitada explicitamente pelo usuário, ou na revisão final antes da implementação (doc 15). Prioriza produzir conteúdo novo em vez de revalidar continuamente documentos já estabilizados, preservando contexto. *(Origem: conversa após doc 04; política de revisão ajustada após doc 12.)*

6b. **Revisão final de arquitetura, antes de finalizar qualquer documento.** Antes de dar um documento por concluído, responder explicitamente: existe alguma decisão que dificulte futuras integrações? que dificulte internacionalização? que dificulte escalabilidade? que dificulte integração com novos aplicativos futuros da COSMARIA? Qualquer limitação encontrada deve ser apresentada antes de finalizar o documento, não depois. *(Origem: conversa após doc 06.)*

6c. **Separar arquitetura, negócio e comercial em qualquer decisão envolvendo dinheiro.** A partir do doc 08, sempre que surgir uma decisão relacionada a cobrança/preço, separar explicitamente: **arquitetura** (o sistema é capaz de suportar X?), **negócio** (vamos de fato usar X, e quando?) e **comercial** (qual o valor exato, qual a tática de mercado?). Decisões comerciais nunca devem ser incorporadas como limitação técnica da plataforma — a arquitetura prepara o terreno, não fixa a estratégia. *(Origem: doc 07.)*

6d. **API First, com contrato mínimo obrigatório por endpoint.** A partir do doc 09, toda API é documentada com, no mínimo: objetivo, módulo proprietário, autenticação necessária, autorização/permissões, entrada, saída, códigos de erro, eventos publicados, eventos consumidos, impacto na auditoria, impacto na LGPD, impacto na assinatura Premium, limite de rate limit (conceitual), estratégia de versionamento, idempotência quando aplicável, casos de teste obrigatórios. Toda API é classificada como Pública, Interna, Administrativa, Sistema, Webhook ou Futura. Para evitar repetir esses 15 campos em cada endpoint individualmente, endpoints são agrupados por **arquétipo de API** (mesmo princípio de composição já usado para entidades no doc 08) — só endpoints representativos ou singulares recebem tratamento individual completo. *(Origem: doc 09.)*

6e. **Princípios permanentes de toda API.** Stateless; nunca expor ID interno de banco quando um identificador público fizer mais sentido; rastreabilidade por Correlation ID; logs estruturados; observabilidade (logs, métricas, tracing) desde o desenho; idempotência sempre que tecnicamente possível em operações críticas; nenhum endpoint acessa schema de outro módulo diretamente; todo endpoint pensado para distribuição horizontal futura sem mudança de contrato. Aplicam-se também à modelagem de fluxos (doc 10 em diante). *(Origem: doc 09.)*

6f. **Teste de Completude, antes de considerar qualquer documento concluído.** Perguntar sempre: "Uma equipe experiente conseguiria implementar esta parte do sistema utilizando apenas este documento, sem precisar tomar decisões arquiteturais importantes?" Se a resposta for não, o documento ainda não está completo e deve ser expandido — não finalizado com a lacuna registrada como pendência. *(Origem: doc 11.)*

6g. **Cloud Agnostic e Provider Agnostic sempre que possível.** GCP e Anthropic Claude são as implementações oficiais atuais (doc 13), não amarras definitivas. Toda integração externa (nuvem, LLM, pagamento, storage, observabilidade) vive atrás de uma interface definida pelo Domínio/Aplicação — o código específico do provedor fica isolado na Infraestrutura, substituível sem alterar regra de negócio. *(Origem: doc 13.)*

6h. **Não pedir confirmação para decisões já alinhadas com a arquitetura definida.** Quando houver apenas uma opção claramente superior e compatível com os documentos anteriores, assumir a decisão, registrar a justificativa, e seguir para o próximo documento — sem transformar isso em pergunta estratégica. Perguntas ficam reservadas para bifurcações reais, onde mais de uma opção é genuinamente defensável. *(Origem: doc 14.)*

6. **Ambição de referência mundial.** Toda decisão documentada deve ser pensada para um produto que pode escalar a milhões de usuários globalmente e continuar organizado por anos — a COSMARIA não busca ser "só um bom aplicativo", busca ser a melhor plataforma do mundo em cultivo individual e acompanhamento terapêutico. *(Origem: doc 00, reforçado em conversas seguintes.)*
