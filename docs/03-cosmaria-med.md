# 03 — COSMARIA Med (Documento 100% Completo)

> Status: **Rascunho para validação.** Depende das decisões dos docs [00](00-visao-geral-da-plataforma.md), [01](01-identidade-da-cosmaria.md) e [02](02-cosmaria-grow.md). Especifica o produto Med em nível de funcionalidades, fluxos, IA, comunidade, Premium e modelo de dados lógico — a arquitetura técnica (doc 04) nasce depois deste documento, a partir dos requisitos reais de Grow + Med juntos.

---

## 1. Objetivos

- Ser **a melhor ferramenta de acompanhamento terapêutico de cannabis medicinal em língua portuguesa** — não uma cópia de Strainprint/Jointly, mas uma evolução clara sobre eles.
- Dar ao paciente uma estrutura clínica real para registrar tratamento, sintomas, dosagem e efeitos — hoje tipicamente feito em papel, planilha, ou não feito de forma alguma.
- Gerar, a partir desse registro, relatórios que o paciente possa **levar ao médico** com confiança, e insights que ajudem o próprio paciente a entender o que funciona para ele.
- Preparar a base de dados (modelo lógico) para a correlação opt-in futura com o COSMARIA Grow — um lote de colheita pode, no futuro, ser referenciado como origem de um tratamento.
- Tratar com o máximo cuidado a sensibilidade do tema: dado de saúde, possível estigma social, e o Modo Discreto (doc 01) como requisito de primeira classe, não um extra.

---

## 2. Problemas que Resolve

| Problema hoje | Como o Med resolve |
|---|---|
| Pacientes registram tratamento em papel/planilha, sem estrutura nem histórico consultável | Diário terapêutico estruturado, com histórico completo e pesquisável |
| Apps existentes (Strainprint, Jointly) são centrados em "sessão de consumo" isolada, pouco ligados a uma visão clínica longitudinal (humor/sono/apetite ao longo de semanas) | Modelo que combina sessão pontual (antes/depois) **e** linha de base diária de bem-estar, dando uma visão clínica mais completa |
| Relatar evolução ao médico é informal (o paciente "conta de memória" na consulta) | Relatório clínico exportável, gerado automaticamente a partir do histórico real |
| Apps de rastreamento de cannabis medicinal têm forte viés de mercado americano/recreativo (ex.: "shopping" integrado no Jointly), pouco adequados ao contexto de paciente sob prescrição no Brasil | Med é 100% focado em acompanhamento clínico, sem qualquer viés de e-commerce (alinhado à decisão de não ter marketplace, doc 00) |
| Nenhum concorrente correlaciona a origem de um produto (cultivo específico) com o resultado terapêutico | Vínculo opt-in com o COSMARIA Grow — diferencial exclusivo da plataforma |
| Cuidadores de pacientes dependentes (ex.: pais de crianças em tratamento, cuidadores de idosos) não têm ferramenta pensada para acompanhar tratamento de terceiros | Ver seção 4 (proposta de suporte a Cuidador/Dependente) |

---

## 3. Escopo

**Incluído**: registro de tratamentos, produtos/dosagens, sintomas e bem-estar, sessões antes/depois, efeitos, evolução clínica, relatórios exportáveis, IA de apoio, comunidade (com privacidade elevada), camada Premium específica do Med.

**Fora de escopo do Med** (reforçando o doc 00): emissão de laudos/prescrição médica (o Med acompanha, não substitui o médico), telemedicina/consulta dentro do app, e-commerce/marketplace de produtos.

---

## 4. Análise Competitiva (Benchmark)

| App | Pontos fortes | Pontos fracos / lacunas |
|---|---|---|
| **Strainprint** | Modelo clínico de sessão antes/depois muito rigoroso (rating de sintoma pré e pós-consumo, ~60 pontos de dado, ~300 condições rastreadas), calendário de sessões, filtro de insights por efeito | Foco quase exclusivo na sessão pontual — pouca ênfase em uma linha de base diária de bem-estar (humor/sono/apetite) entre sessões; sem correlação com origem/cultivo do produto |
| **Jointly** | IA "Spark" para recomendação personalizada orientada a objetivo (reduzir ansiedade, dor, etc.), forte de dados agregados da comunidade (meio milhão de avaliações) | Fortemente acoplado a compra/entrega de produto (e-commerce) — modelo de negócio e experiência não combinam com a postura 100% clínica que a COSMARIA quer para o Med |
| **Leafly / AllBud** | Excelentes bases de dados de strains/produtos e reviews | Não são diários terapêuticos pessoais — servem como referência de produto, não acompanhamento longitudinal do paciente |

**Conclusão do benchmark**: nenhum concorrente combina (1) rigor clínico de sessão antes/depois, (2) visão longitudinal de bem-estar diário (não só por sessão), (3) relatório pronto para o médico, e (4) ausência total de viés comercial/e-commerce. Esse é o espaço de diferenciação do COSMARIA Med.

### Diferenciais Estratégicos Propostos

| Pergunta-guia | Proposta de diferencial |
|---|---|
| **O que nenhum concorrente faz hoje?** | Correlação opt-in entre um **lote de cultivo específico** (COSMARIA Grow) e o resultado terapêutico relatado — nenhum concorrente tem essa ponte, porque nenhum é ao mesmo tempo diário de cultivo e diário terapêutico. |
| **Como simplificar a experiência?** | Um "check-in de linha de base" diário (humor/sono/apetite/dor em segundos) **separado** da sessão antes/depois (mais detalhada, no momento do uso) — o paciente não precisa abrir o app só quando usa o produto. |
| **Como criar mais valor?** | Relatório clínico gerado automaticamente, pronto para ser mostrado/exportado ao médico — resolve diretamente o problema #3 da seção 2. |
| **Como aumentar retenção?** | Linha de base diária (mesmo em dias sem uso) mantém o hábito de registro vivo, diferente de apps focados só na sessão de consumo. |
| **Como aumentar efeito de rede?** | Insights agregados e anonimizados **devolvidos à própria comunidade** (não vendidos a terceiros — mantendo a decisão do doc 00 de não monetizar dados): ex. "pacientes com perfil de sintoma semelhante ao seu relataram melhora com produtos de perfil X" — valor cresce com mais usuários participando (opt-in). |
| **Como tornar a IA realmente útil?** | IA ancorada no histórico clínico do próprio paciente (correlação dose × horário × produto × sintoma ao longo do tempo), não recomendações genéricas de "qual cannabis usar" — mais rigor clínico, menos "recomendação de produto" no estilo Jointly. |

### Ideia adicional a validar — Suporte a Cuidador/Dependente

Cuidadores de pacientes que não podem se autorregistrar (crianças em tratamento, idosos, pessoas com deficiência) são um caso de uso real e não atendido pelos concorrentes pesquisados. Proposta: permitir que uma conta gerencie um ou mais **perfis de dependente**, com o mesmo diário terapêutico completo, mas sem exigir que o dependente tenha sua própria conta. Apresento como decisão em aberto (ver Perguntas Estratégicas) por envolver questões de modelo de conta/permissão que merecem sua validação antes de entrar em escopo.

*(Todas as propostas desta seção aguardam sua aprovação — ver Perguntas Estratégicas.)*

---

## 5. Funcionalidades (Detalhamento Completo)

### 5.0 Complexidade Progressiva

Mesma lógica adotada no Grow (doc 02, seção 5.0): um único fluxo, com nível essencial por padrão e Modo Especialista para quem quer registrar cada detalhe clínico desde o início. Recomendo reutilizar o mesmo Módulo de Complexidade Progressiva do Core (não duplicar a lógica entre Grow e Med) — a validar no doc 04 (Arquitetura).

### 5.1 Tratamentos
- Registro de um tratamento: condição/motivo, data de início (e fim, se aplicável), objetivo terapêutico, médico responsável (opcional, texto livre — não é integração com prontuário).
- Um usuário pode ter múltiplos tratamentos ao longo do tempo (histórico completo, inclusive tratamentos encerrados).

### 5.2 Produtos e Dosagens
- Cadastro de produto utilizado (nome, tipo — óleo, flor, comestível, extrato, etc., concentração de CBD/THC quando conhecida, fabricante/fornecedor opcional).
- Registro de dose (quantidade, horário, via de administração — oral, sublingual, inalada, tópica, etc.), vinculado a um Tratamento.
- **Vínculo opcional (opt-in) a um Lote do COSMARIA Grow** — quando o produto usado vem de um cultivo próprio já registrado.

### 5.3 Sintomas e Bem-estar (linha de base diária)
- Registro diário rápido de: **humor**, **ansiedade**, **dor**, **sono**, **apetite** (escalas simples, ex. 0–10), independente de uso de produto no dia.
- Histórico contínuo, mesmo em dias sem dose — sustenta a visão longitudinal (diferencial da seção 4).

### 5.4 Sessões Antes/Depois (uso pontual)
- No momento de uma dose, registrar **intensidade do(s) sintoma(s)-alvo antes** e, após um intervalo (configurável, inspirado no modelo Strainprint), **solicitar o registro depois**.
- Permite calcular efetividade percebida por produto/dose/sintoma ao longo do tempo.

### 5.5 Efeitos
- Registro de **efeitos positivos** (ex.: alívio, relaxamento, melhora de apetite) e **efeitos adversos** (ex.: sonolência excessiva, boca seca, ansiedade paradoxal), com intensidade e duração.

### 5.6 Evolução Clínica
- Timeline consolidada cruzando tratamento, produto/dose, sintomas (linha de base + sessões) e efeitos ao longo do tempo — a "história clínica" do paciente dentro do app.

### 5.7 Relatórios
- Geração de relatório (PDF/exportável) por período, resumindo tratamento, produtos/doses, evolução de sintomas e efeitos — pensado para ser levado a uma consulta médica.

---

## 6. Estrutura Modular

```
COSMARIA Med
│
├── Tratamento
├── Produto e Dosagem (Registro de Uso)
├── Sintomas e Bem-estar (linha de base diária)
├── Sessão Antes/Depois (vinculada a um Registro de Uso)
├── Efeitos (positivos/adversos)
├── Evolução Clínica (motor de agregação sobre os módulos acima)
├── Relatórios (exportação clínica)
├── IA do Med (consome todos os módulos acima — ver seção 8)
├── Comunidade do Med (com Motor de Privacidade Granular compartilhado do Grow — ver seção 9)
├── Premium do Med (ver seção 10)
├── Módulo de Complexidade Progressiva (transversal, compartilhado com o Grow via Core)
└── [Proposto] Perfil de Cuidador/Dependente — ver seção 4, decisão pendente
```

Princípio: assim como no Grow, cada módulo evolui de forma independente, mas todos alimentam a mesma timeline central do paciente — é essa timeline que a IA, a Evolução Clínica e os Relatórios consultam.

---

## 7. Fluxos (principais)

1. **Início de tratamento**: usuário cria um Tratamento → cadastra produto(s) que pretende usar.
2. **Check-in diário de linha de base**: independente de uso, registro rápido de humor/sono/apetite/dor/ansiedade.
3. **Registro de dose**: usuário registra uma dose → app pergunta sintoma-alvo antes → após o intervalo configurado, notifica pedindo o registro "depois".
4. **Registro de efeito**: a qualquer momento, associado a uma dose ou de forma livre.
5. **Consulta de evolução**: usuário acessa a timeline consolidada, vê gráficos de sintomas ao longo do tempo por produto/dose.
6. **Geração de relatório**: usuário seleciona um período → app gera relatório pronto para exportar/mostrar ao médico.
7. **Vínculo opt-in com o Grow**: ao cadastrar um produto, usuário pode (opcionalmente) selecionar um Lote já existente no COSMARIA Grow como origem.
8. **Publicação na comunidade (opcional)**: usuário decide compartilhar parte do tratamento (ex.: "este produto ajudou com X sintoma"), com o mesmo motor de privacidade granular do Grow.

---

## 8. Requisitos de Inteligência Artificial (nível de produto — Med)

> Escopo: requisitos de produto do Med; a arquitetura técnica compartilhada do serviço de IA fica no doc 05, escrito depois de Grow e Med juntos.

- **Correlação dose × sintoma × efeito** no histórico do próprio paciente — qual produto/dose/horário se associa a melhora ou piora de qual sintoma.
- **Identificação de padrões de efeito adverso** (ex.: certo produto consistentemente associado a um efeito colateral).
- **Relatório automático de evolução clínica** (mesma lógica do relatório de ciclo do Grow, seção 8 do doc 02), gerado periodicamente.
- **Insights agregados anonimizados (opt-in)**: ex. "pacientes com perfil de sintoma semelhante relataram X" — sempre como funcionalidade gratuita devolvida à comunidade, nunca vendida a terceiros (decisão do doc 00).
- **Correlação futura com o Grow (opt-in)**: quando um produto está vinculado a um Lote do Grow, a IA pode relacionar características do cultivo (genética, ambiente) ao resultado terapêutico relatado.

---

## 9. Requisitos de Comunidade (nível de produto — Med)

> Escopo: requisitos de produto do Med; especificação completa/compartilhada de Comunidade (moderação, infraestrutura social) fica no doc 06.

- Reaproveita o **Motor de Privacidade Granular do Core** (formalizado no doc 04, §12 — o mesmo serviço usado pelo Grow, doc 02 §9.1): todo registro nasce privado; compartilhamento é granular por dimensão (ex.: compartilhar apenas "este produto ajudou com dor", sem expor dosagem exata, tratamento completo ou identidade real) e por escopo (seguidores/amigos*/link*/público). O Med registra seu **próprio vocabulário de dimensões** (produto, dosagem, tratamento completo, sintomas, efeitos) junto ao motor do Core — não reaproveita as dimensões do Grow, só o mecanismo.
- Pesquisar/trocar experiências por **produto**, **sintoma-alvo** e **perfil de concentração (CBD/THC)** — busca estruturada, não só texto livre (mesmo princípio do Grow).
- **Identidade na comunidade do Med — decidido no doc 06**: o Perfil Público do Med é totalmente independente do Perfil Público do Grow (mesma Conta, identidades públicas distintas). Nome, avatar e biografia são **opcionais** — o usuário pode permanecer completamente anônimo na comunidade do Med. Nenhuma ligação entre os dois perfis é exposta publicamente, salvo se o próprio usuário optar por revelá-la.
- **Sem mecanismo de "fork"** equivalente ao do Grow (não faz sentido "clonar" um tratamento de outra pessoa da mesma forma que se clona um cultivo) — a forma de aprendizado aqui é via insights agregados (seção 8), não cópia direta.

---

## 10. Requisitos de Sistema Premium (nível de produto — Med)

> Escopo: requisitos específicos do Med; modelo de negócio e regras gerais do Premium ficam no doc 07. **Decidido no doc 07**: existe uma única Assinatura COSMARIA Premium, pertencente à Conta (não ao aplicativo) — o que segue são as funcionalidades do Med que essa mesma assinatura desbloqueia, não um plano Premium separado do Med.

**Gratuito (deve permanecer extremamente útil)**: registro completo de tratamentos/produtos/doses/sintomas/efeitos, check-in diário, sessões antes/depois, timeline de evolução clínica, um relatório básico exportável.

**Premium (Med)** — mesmo princípio duro do Grow (nunca capar registro básico):
- IA avançada (correlações mais profundas, detecção de padrões de efeito adverso).
- Relatórios clínicos completos/personalizáveis (múltiplos formatos, períodos customizados).
- Histórico e armazenamento ampliados (ex.: anexar exames/documentos ao tratamento — usa a entidade `Mídia`, Core, compartilhada com o Grow desde a revisão arquitetural dos docs 08/09, não uma capacidade própria do Med).
- Suporte a múltiplos tratamentos simultâneos sem limite.
- (Se aprovado) Perfis de cuidador/dependente ilimitados.

---

## 11. Modelo de Dados Lógico do Med (conceitual)

> Escopo: entidades e relacionamentos conceituais, para orientar os docs 04 e 08. Tecnologia-agnóstico.

- **Usuário** (compartilhado com a plataforma) 1—N **Tratamento**
- **Tratamento** 1—N **Produto** (produtos associados àquele tratamento)
- **Produto** 1—N **RegistroDeUso** (dose, horário, via de administração)
- **RegistroDeUso** 0—1 **Lote** (referência opt-in a uma entidade do COSMARIA Grow)
- **RegistroDeUso** 0—1 **SessãoAntesDepois** (par de registros de sintoma pré/pós)
- **Usuário** 1—N **RegistroDeSintomaDiario** (linha de base: humor, ansiedade, dor, sono, apetite — independente de uso)
- **RegistroDeUso** 0—N **RegistroDeEfeito** (positivo/adverso, intensidade, duração)
- **Tratamento** 1—N **Relatorio** (gerado por período)
- **Tratamento/RegistroDeUso** 0—1 **PublicaçãoComunidade** 1—1 **ConfiguraçãoDeCompartilhamento** — *entidade única do Core (doc 04), não duplicada; Med registra seu próprio vocabulário de dimensões* (produto, dosagem, tratamento completo, sintomas, efeitos)
- **Usuário** 1—1 **PreferênciaDeComplexidade** — *entidade única do Core (doc 04), referenciada, não duplicada*
- *(Proposto, pendente de aprovação)* **Usuário** 1—N **PerfilDependente** — cada dependente com sua própria árvore de Tratamento/Produto/RegistroDeUso/Sintomas

---

## 12. Boas Práticas

- Terminologia sempre clínica e precisa (doc 01: tom "assistente clínico de confiança") — nunca usar linguagem que soe recreativa.
- Toda tela que envolve registro de sintoma deve ser rápida o suficiente para não desencorajar o uso em momentos de desconforto (ex.: dor) — poucos toques, escalas simples.
- Relatórios exportáveis devem ser pensados para o olhar de um profissional de saúde, não só do próprio paciente — clareza e objetividade acima de estética.
- Modo Discreto (doc 01) deve ser tratado como requisito de primeira classe em toda notificação e tela deste módulo, não um extra configurável depois.

---

## 13. Escalabilidade Futura

- Modelo de dados deve suportar múltiplos tratamentos simultâneos e histórico de longo prazo (anos) sem degradar a leitura da timeline.
- Estrutura de Produto deve suportar, no futuro, uma base de referência de produtos/concentrações compartilhada (semelhante à base de genéticas do Grow), alimentada pela comunidade ou por fontes oficiais.
- Se o suporte a Cuidador/Dependente for aprovado, o modelo de permissão deve já nascer pensando em múltiplos dependentes por conta e, potencialmente, em compartilhamento de acesso entre cuidadores (ex.: ambos os pais) — não decidir isso em detalhe agora, mas não modelar de forma que bloqueie essa evolução.

---

## 14. Possíveis Integrações

- **Exportação para prontuário eletrônico / formatos usados por profissionais de saúde** — mencionado no doc 00, detalhar formato exato no doc 09 (APIs).
- **Lembretes de dose** via notificação push (Core) — mesma infraestrutura do Grow.
- **Vínculo opt-in com o COSMARIA Grow** (Lote → Produto) — integração interna à própria plataforma, não externa.

---

## 15. Oportunidades de Monetização (específicas do Med)

Mesmo princípio do doc 00/02 (sem monetização de dados): Premium do Med (seção 10) e, futuramente, planos profissionais/B2B para clínicas/associações que queiram acompanhar múltiplos pacientes — a detalhar no doc 07.

---

## 16. Riscos (específicos do Med)

| Risco | Observação |
|---|---|
| Dado de saúde é extremamente sensível (LGPD) | Reforça a necessidade de o Motor de Privacidade Granular (seção 9) e o Modo Discreto (doc 01) serem tratados como requisitos não-negociáveis, não features opcionais |
| Estigma social pode inibir o registro completo ou a participação na comunidade | Mitigado pela proposta de identidade distinta na comunidade do Med (seção 9) — decisão pendente de validação |
| Relatório mal interpretado pode ser confundido com orientação médica | Relatórios devem deixar explícito que são registro do paciente, não diagnóstico ou prescrição (reforça a postura legal do doc 00) |
| Suporte a Cuidador/Dependente, se aprovado, introduz complexidade de permissão de acesso a dado de saúde de terceiros | Precisa de modelagem cuidadosa de consentimento/permissão — não é um CRUD trivial |

---

## 17. Sugestões de Melhorias

- Lembretes de dose que já vêm com o registro de "antes" pré-preenchido a partir do último check-in de linha de base, reduzindo atrito.
- Um indicador visual de "tratamento estável" vs. "tratamento em ajuste" na timeline, com base na variação recente de sintomas — ajuda o paciente (e o médico) a perceber rapidamente se algo mudou.

---

## 18. Classificação de Escopo (MVP / V2 / V3 / Futuro / Pesquisa)

| Funcionalidade | Classificação | Observação |
|---|---|---|
| Tratamentos, Produtos/Dosagens, Sintomas/Bem-estar diário, Efeitos, Evolução Clínica (seções 5.1–5.6) | **MVP** | Núcleo do produto |
| Sessão Antes/Depois | **MVP** | Diferencial central, inspirado e superando o modelo Strainprint |
| Relatório clínico exportável (básico) | **MVP** | Resolve diretamente o problema #3 da seção 2 |
| Relatório clínico avançado/customizável | **Versão 2** | Parte do Premium (seção 10) |
| IA — correlação dose × sintoma × efeito no próprio histórico | **MVP** (correlação básica) / **Versão 2** (refinada) | Mesma lógica de evolução gradual do Grow |
| IA — insights agregados anonimizados entre pacientes | **Versão 2** | Depende de massa crítica de usuários opt-in |
| Vínculo opt-in Produto ↔ Lote do Grow | **Versão 2** | Depende do doc 04 (Arquitetura) definir como os dois apps se referenciam tecnicamente |
| Comunidade do Med (privacidade granular + busca estruturada) | **MVP** (infraestrutura, reaproveitada do Grow) | Mesmo motor, aplicado ao domínio do Med |
| Identidade distinta na comunidade do Med (nome/avatar próprios) | **MVP** proposto | Ver Perguntas Estratégicas — decisão pendente |
| Suporte a Cuidador/Dependente | **Versão 2 (confirmado 2026-07-08)** | Não entra no MVP. Arquitetura já preparada: papel Dependente/Responsável modelado na Autorização (doc 04, §11) desde já, para que a Versão 2 não exija redesenho |
| Base de referência de produtos/concentrações compartilhada pela comunidade | **Futuro** | Análogo à base de genéticas do Grow — ver [Ideias Futuras](ideias-futuras.md) |

Itens não-MVP foram adicionados ao documento companion [Ideias Futuras](ideias-futuras.md).

---

## Perguntas Estratégicas — status em 2026-07-08 (revisão cruzada antes do doc 06)

Ao revisar este documento antes de iniciar o doc 06, identifiquei que **destas 5 perguntas originais, só a nº 2 foi respondida** (via aprovação do doc 05) — as demais nunca foram formalmente decididas e ficaram pendentes ao longo dos docs 04/05. Registrando o status real:

1. **Diferenciais competitivos da seção 4** (correlação opt-in com o Grow, check-in de linha de base + sessão antes/depois, relatório automático, insights agregados, IA ancorada no histórico) — **ainda não aprovado formalmente**, embora nenhum documento posterior os tenha contestado.
2. **Suporte a Cuidador/Dependente** — ✅ **respondida**: Versão 2 (ver seção 18 e doc 04).
3. **Identidade na comunidade do Med** — ✅ **respondida no doc 06**: Perfil Público do Med totalmente independente do Grow, nome/avatar/biografia opcionais, anonimato permitido.
4. **Rigor da Sessão Antes/Depois** (obrigatória vs. opcional a cada dose) — **ainda em aberto**.
5. **Formato do relatório clínico** — **ainda em aberto**, mas pode legitimamente esperar o doc 09 (APIs) sem bloquear o doc 06.

As perguntas 1, 4 e 5 não bloqueiam o Documento 06. A pergunta 3 bloqueia, pois molda diretamente o modelo de identidade da Comunidade — será reapresentada no plano do doc 06.

---

## Artefatos para Implementação

> Escrito para que este módulo possa ser entregue diretamente ao Claude Code para implementação. Reflete o estado atual da especificação (seções 1–18) — decisões pendentes nas Perguntas Estratégicas podem alterar detalhes aqui, especialmente o suporte a Cuidador/Dependente.

### Checklist Técnico
- [ ] Modelar entidades e relacionamentos do Med (seção 11) no schema físico (depende do doc 08)
- [ ] CRUD de Tratamento
- [ ] CRUD de Produto (com concentração CBD/THC) e vínculo opcional a Lote do Grow
- [ ] Registro de Uso (dose, horário, via de administração)
- [ ] Sessão Antes/Depois vinculada a um Registro de Uso, com notificação de acompanhamento após intervalo configurável
- [ ] Check-in diário de linha de base (humor, ansiedade, dor, sono, apetite)
- [ ] Registro de Efeitos (positivos/adversos, intensidade, duração)
- [ ] Motor de Evolução Clínica (agregação da timeline)
- [ ] Geração de Relatório exportável (PDF, período configurável)
- [ ] Integração com o serviço de IA compartilhado (correlações, insights agregados opt-in)
- [ ] Reaproveitar o Motor de Privacidade Granular do Grow (doc 02) para publicações do Med
- [ ] Reaproveitar o Módulo de Complexidade Progressiva do Core
- [ ] Gates de Premium (feature flags) nos pontos definidos na seção 10
- [ ] Suporte ao Modo Discreto (doc 01) em todas as notificações e telas deste módulo
- [ ] (Condicional à aprovação) Módulo de Perfil de Cuidador/Dependente

### Lista de Módulos
Tratamento · Produto e Dosagem · Sintomas e Bem-estar (linha de base) · Sessão Antes/Depois · Efeitos · Evolução Clínica · Relatórios · Integração de IA (consumidor) · Comunidade do Med (consumidor do Motor de Privacidade Granular do Grow) · Premium/Gates (consumidor) · Complexidade Progressiva (consumidor do Core) · *(Proposto)* Perfil de Cuidador/Dependente

### Lista de Telas
- Onboarding do Med (primeiro tratamento)
- Dashboard/Home do Med (tratamentos ativos, check-in do dia)
- Check-in Diário de Linha de Base
- Detalhe do Tratamento
- Criar/Editar Tratamento
- Criar/Editar Produto
- Registrar Dose (Registro de Uso)
- Sessão Antes/Depois (tela "antes" e tela "depois", esta última via notificação)
- Registrar Efeito
- Timeline de Evolução Clínica (gráficos por sintoma/produto)
- Gerar/Visualizar Relatório
- Publicar na Comunidade (privacidade granular, reaproveitando componente do Grow)
- Perfil do Paciente na Comunidade (identidade específica do Med, se aprovado)
- Busca da Comunidade (por produto/sintoma/concentração)
- Configurações do Med (Modo Discreto, complexidade, Premium)
- *(Proposto)* Seletor/Gestão de Perfis de Dependente

### Lista de Componentes Reutilizáveis
- Card de Tratamento / Card de Produto
- Escala de Intensidade (humor/dor/ansiedade/sono/apetite) — componente compartilhado entre check-in diário e sessão antes/depois
- Gráfico de série temporal (reutilizável do Grow — mesma base técnica, domínio diferente)
- Card de Sessão Antes/Depois
- Card de Efeito (positivo/adverso, com badge de intensidade)
- Componente de Timeline Clínica
- Gerador/Preview de Relatório
- Matriz de Privacidade Granular (reaproveitada do Grow, seção 9)
- Seletor de Nível de Complexidade (reaproveitado do Grow)
- Componente de Paywall/Upsell Premium (reaproveitado do Grow)
- *(Proposto)* Seletor de Perfil (para alternar entre o próprio perfil e o de um dependente)

### Lista de Entidades do Banco (conceitual — ver seção 11 e doc 08)
Usuário (ref. Core) · Tratamento · Produto · RegistroDeUso · SessãoAntesDepois · RegistroDeSintomaDiario · RegistroDeEfeito · Relatorio · PublicaçãoComunidade (Med) · ConfiguraçãoDeCompartilhamento (reaproveitada) · PreferênciaDeComplexidade (reaproveitada) · *(Proposto)* PerfilDependente

### Lista de APIs Necessárias
- `POST/GET/PUT/DELETE /tratamentos`
- `POST/GET/PUT/DELETE /produtos`
- `POST /produtos/{id}/vincular-lote` (referência opt-in ao Grow)
- `POST /registros-uso`
- `POST /sessoes` (antes), `PUT /sessoes/{id}` (depois)
- `POST /sintomas-diarios`
- `POST /efeitos`
- `GET /tratamentos/{id}/evolucao`
- `GET /tratamentos/{id}/relatorio?periodo=...`
- `POST /ia/insights` (consumo do serviço de IA compartilhado, doc 05)
- `POST /comunidade/publicacoes` (Med), `GET /comunidade/busca` (produto/sintoma/concentração)
- `GET /usuario/limites-premium`
- *(Proposto)* `POST/GET /dependentes`, `GET /dependentes/{id}/tratamentos`

### Lista de Permissões
- Notificações push (lembrete de dose, sessão "depois", check-in diário)
- Armazenamento local (cache de relatórios gerados)
- Acesso a arquivos (anexar exames/documentos, se aprovado no Premium)

### Eventos (domínio/analytics)
*(Nomenclatura padronizada em PascalCase — ver [Catálogo de Domínio](catalogo-de-dominio.md))*

**Publicados pelo Med**: `TratamentoCriado` · `TratamentoEncerrado` · `ProdutoRegistrado` · `DoseRegistrada` · `SessaoAntesRegistrada` · `SessaoDepoisRegistrada` · `SintomaDiarioRegistrado` · `EfeitoRegistrado` · `RelatorioGerado` · `PublicacaoComunidadeMedCriada`

**Consumidos pelo Med**: `LimitePremiumAtingido` (publicado pelo Core: Billing)

### Notificações
- Lembrete de dose (se configurado pelo usuário)
- Solicitação de registro "depois" após intervalo da Sessão Antes/Depois
- Lembrete de check-in diário de linha de base
- Relatório periódico de evolução clínica (semanal/mensal, configurável)
- Interação social (comentário/curtida/novo seguidor) — respeitando Modo Discreto e a identidade específica do Med

### Casos de Teste
- Fluxo feliz completo: criar tratamento → cadastrar produto → registrar dose → sessão antes/depois completa → check-ins diários → gerar relatório
- Sessão antes/depois: notificação "depois" dispara corretamente após o intervalo configurado
- Vínculo opt-in de produto a um Lote do Grow aparece corretamente na Evolução Clínica quando aplicável
- Publicar experiência na comunidade com privacidade granular oculta exatamente as dimensões configuradas (reaproveitando teste do Grow, seção do doc 02)
- Modo Discreto ativo oculta nomes de tratamento/produto em notificações
- Usuário no plano gratuito não excede limites definidos (bloqueio correto) — *pendente de definição no doc 07*
- *(Se aprovado)* Cuidador consegue alternar entre perfil próprio e perfil de dependente sem misturar dados

### Dependências com Outros Módulos
- Core de Autenticação/Perfil (usuário compartilhado)
- Serviço de IA compartilhado (doc 05)
- **Core: Motor de Privacidade Granular** (doc 04, §12) e **Core: Comunidade** (doc 04/06) — serviços do Core desde a origem, não "emprestados" do Grow (correção da Auditoria incorporada no doc 04)
- **Core: Complexidade Progressiva** (doc 04) — entidade/serviço único
- Sistema Premium/Billing compartilhado (doc 07)
- Módulo de Notificações do Core
- Referência opt-in ao Lote do COSMARIA Grow (via interface pública do Grow, doc 04 §23 — nunca acesso direto ao schema do Grow)

### Riscos Técnicos
- Notificação da Sessão Antes/Depois depende de agendamento confiável (intervalo pode ser minutos ou horas) — falha aqui compromete o diferencial clínico central do Med
- Geração de relatório precisa lidar com históricos longos (anos) sem degradar performance — relevante para o doc 08
- Vínculo Produto ↔ Lote do Grow cria uma dependência de dados entre dois apps/serviços potencialmente distintos — arquitetura (doc 04) precisa definir se é referência direta ou replicada/eventual
- Se o suporte a Cuidador/Dependente for aprovado, o modelo de permissão de acesso a dado de saúde de terceiros precisa de revisão de segurança dedicada antes da implementação
