# Ideias Futuras — COSMARIA

> Documento companion, fora da sequência numerada 00–15. Acompanha todo o projeto e é atualizado sempre que uma ideia boa surge mas não entra no escopo do MVP. Objetivo: nunca perder uma ideia, mas também nunca deixá-la inflar o escopo atual sem decisão consciente.

## Como usar este documento

Toda ideia nova (de qualquer documento, de qualquer conversa) passa por esta classificação antes de virar escopo ativo:

- **MVP** — entra na primeira versão lançável.
- **Versão 2** — boa ideia, mas não essencial para provar o produto; entra logo após o MVP.
- **Versão 3** — relevante, mas depende de escala/maturidade que o produto ainda não tem.
- **Futuro** — visão de longo prazo, sem prazo definido, mas vale registrar para não esquecer.
- **Pesquisa** — precisa de investigação (técnica, legal, de mercado) antes de virar decisão de escopo.

Cada entrada abaixo cita o documento de origem para rastreabilidade.

---

## Backlog

| Ideia | Categoria | Origem | Descrição |
|---|---|---|---|
| Base pública de genéticas alimentada pela comunidade ("SeedFinder da COSMARIA") | Versão 2 | Doc 02, seção 13 | Banco de genéticas open/colaborativo dentro da própria plataforma, alimentado pelos cultivos registrados pela comunidade |
| Integração com sensores IoT (temperatura, umidade, pH/EC automatizados) | Futuro | Doc 02, seções 13/14 | Reduz registro manual conectando hardware de monitoramento ambiental direto ao Grow |
| Selo "ciclo validado" (registro consistente do início ao fim) | Versão 2 | Doc 02, seção 17 | Sinaliza qualidade do dado para IA e para a comunidade; Growlogs completos ganham mais credibilidade |
| Suporte a cultivo comercial/profissional (múltiplas salas, compliance de operação) | Futuro | Doc 02, seção 13 | Fora do escopo atual (só cultivo individual), mas modelo de dados já não deve bloquear essa evolução |
| API de clima e dados solares para Outdoor (previsão do tempo, radiação solar) | Versão 2 | Doc 02, seções 5/14, decisão 2026-07-08 | Outdoor básico (registro manual) é MVP; a automação via API climática é módulo desacoplado, priorizado depois |
| Compartilhamento "apenas com amigos" (distinto de "seguidores") na Comunidade | Pesquisa | Doc 02, seção 9, decisão 2026-07-08 | Precisa definir se "amigos" é um conceito de relação mútua distinto de "seguir" (unilateral) antes de virar escopo — ver doc 06 |
| Compartilhamento "somente via link" (growlog não listado, acessível só por URL) | Versão 2 | Doc 02, seção 9, decisão 2026-07-08 | Requer geração/expiração de links e controle de acesso — detalhar no doc 06 |
| Vínculo opt-in Produto (Med) ↔ Lote (Grow) | Versão 2 | Doc 03, seção 18 | Depende do doc 04 (Arquitetura) definir como Grow e Med se referenciam tecnicamente entre si |
| IA — insights agregados anonimizados entre pacientes do Med | Versão 2 | Doc 03, seções 8/18 | Depende de massa crítica de usuários opt-in; sempre devolvido gratuitamente à comunidade, nunca vendido a terceiros |
| Suporte a Cuidador/Dependente (tratar terceiros: filhos, idosos) | Pesquisa → possível Versão 2 | Doc 03, seções 4/18 | Diferencial não coberto por Strainprint/Jointly; exige modelo de permissão de acesso a dado de saúde de terceiros — decisão pendente com o usuário |
| Base de referência de produtos/concentrações compartilhada pela comunidade do Med | Futuro | Doc 03, seção 18 | Análogo à base pública de genéticas do Grow |
| Cliente offline-first completo (fila de sincronização + resolução de conflito) para check-in do Grow e dose do Med | Versão 2 | Doc 04, seção 17, decisão 2026-07-08 | MVP será online-first por decisão do usuário; offline-first fica registrado para reavaliação futura caso conectividade ruim vire um problema real de retenção |
| Extração de um módulo do Modular Monolith para microsserviço (ex.: IA) | Futuro | Doc 04, seções 5/20 | Só deve ser decidido com métricas reais de uso por módulo, nunca por preferência tecnológica |
| Réplicas de leitura e cache avançado de banco | Versão 2 | Doc 04, seção 18 | MVP opera com uma instância de banco única bem dimensionada |
| Integrações com sensores IoT, wearables, Apple Health, Google Health Connect, Garmin, Fitbit | Futuro | Doc 05, seção 16 | Arquitetura já prevê um Adaptador de Fontes Externas (contrato único) — nenhuma implementada agora, mas nenhuma bloqueada |
| Importação de exames laboratoriais | Futuro | Doc 05, seção 16 | Mesmo padrão de adaptador de fonte externa |
| Integração com APIs meteorológicas (além do Módulo Outdoor do Grow) | Futuro | Doc 05, seção 16 | Pode alimentar tanto o Grow (clima) quanto futuras correlações da IA |
| Geração de baseline sintético para coortes pequenas (privacidade) | Futuro | Doc 05, seção 9/15 | Técnica observada em pesquisa de anonimização; não é MVP |
| Motor de Aprendizado do Usuário (personalização de limiares/prioridades) | Versão 2 | Doc 05, seção 6.7/20 | MVP funciona sem personalização; evolui com volume de uso |
| Motor de Recomendações com agregados anonimizados entre usuários | Versão 2 | Doc 05, seção 20 | Depende de massa crítica de usuários opt-in |
| Plano "Plus" intermediário (Estratégia 3 de monetização) | Versão 2 | Doc 07, seção 7/12 | Avaliar se dado de uso real mostra demanda por ponto de entrada mais barato que o Premium completo |
| Add-on de IA separado da assinatura Premium (Estratégia 2) | Versão 3 | Doc 07, seção 7/12 | Só faz sentido quando Motor de Recomendações/Aprendizado do Usuário estiverem maduros |
| COSMARIA Business plenamente detalhado (B2B unificado) | Futuro | Doc 07, seção 11/12 | Unifica menções fragmentadas de docs 00/02/03; detalhamento completo depende de validação de demanda |
| Entidade `Organizacao` (multi-tenancy real para o COSMARIA Business) | Futuro | Doc 08, seção 9/19 | Não modelada agora; `Usuário`/`AssinaturaPremium` já preparados para receber referência aditiva no futuro, sem migração destrutiva |
| Tradução de catálogos internos para outros idiomas além do português | Futuro | Doc 08, seção 8/19 | Estrutura código+tradução já é MVP; preencher outros idiomas é Futuro |
| Motor de armazenamento dedicado para séries temporais (fora do banco relacional principal) | Pesquisa | Doc 08, seção 18 | Decisão a avaliar no doc 13, conforme volume real de uso |

---

## Registro de decisões de escopo (log)

- 2026-07-08 — Doc 02 (Grow): usuário aprovou os 6 diferenciais competitivos como MVP (previsão de rendimento, check-in único, alertas acionáveis, relatório automático, fork de cultivo, IA ancorada no histórico). Ver [docs/02-cosmaria-grow.md](02-cosmaria-grow.md).
- 2026-07-08 — Doc 02 (Grow): privacidade granular da comunidade (fotos/resultados/genética/localização/datas/equipamentos/parâmetros/rendimento + escopos seguidores/amigos/link/público) classificada como **MVP no nível de modelo de dados e regras**, com dois sub-recursos (link não-listado, conceito de "amigos") adiados — ver linhas do backlog acima.
