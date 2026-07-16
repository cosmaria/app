# Design System COSMARIA — Índice da Subpasta

> **Autoridade raiz:** [`../11-design-system.md`](../11-design-system.md). Este README apenas organiza e contextualiza os documentos abaixo — não introduz nem altera nenhuma decisão normativa.

## Por que esta subpasta existe

`11-design-system.md` estabeleceu as fundações do Design System (tokens, estados globais, biblioteca de componentes em nível de resumo, governança). Os seis documentos abaixo aprofundam essa base em especificação de nível de implementação — direção artística completa, anatomia detalhada de cada componente, templates de tela reutilizáveis e os manuais de construção da biblioteca no Figma.

Eles vivem numa subpasta separada, com numeração própria (01–06), para não colidir com a sequência principal de documentos do produto (`docs/00-...` até `docs/15-implementacao.md`), que já está validada e parcialmente implementada em código (a numeração 12–15 já pertence a Roadmap, Stack Tecnológica, Estrutura do Código e Implementação). Os arquivos originais chegaram numerados 12–17 (continuando a partir do 11); essa numeração foi ajustada para 01–06 apenas como renomeação de arquivo e de referências cruzadas — nenhum conteúdo normativo foi alterado.

## Hierarquia de autoridade

```
docs/11-design-system.md   (fundações — tokens, estados, governança)
        │
        ▼
01-visual-language.md          Constituição Visual — personalidade, direção artística, emoção, cor, tipografia, motion
        │
        ▼
02-ui-kit.md                   UI Kit — anatomia, variantes, estados e critérios de aceitação de cada componente
        │
        ▼
03-component-library.md        Component Library — as 70 famílias oficiais de componentes, especificação completa
        │
        ▼
04-screen-templates.md         Screen Templates — 7 shells e 35 templates reutilizáveis de tela
        │
        ▼
05-figma-component-library.md  Figma Component Library — como construir/publicar a biblioteca de componentes no Figma
        │
        ▼
06-figma-screen-templates.md   Figma Screen Templates — como construir/publicar shells e templates no Figma
```

Cada documento é subordinado a todos os anteriores na cadeia. Um documento posterior nunca redefine uma decisão de um anterior — ele traduz para o próximo nível de operacionalização. Conflitos se resolvem sempre a favor do documento mais acima nesta cadeia (e, acima de todos, das regras de negócio e fluxos de UX dos docs 00–10).

## Documentos

| Arquivo | Conteúdo | Contém código/implementação? |
| --- | --- | --- |
| [01-visual-language.md](01-visual-language.md) | Constituição Visual: filosofia, personalidade, direção artística, cor, tipografia, iconografia, motion, linguagem de IA/privacidade/comunidade/Premium | Não |
| [02-ui-kit.md](02-ui-kit.md) | UI Kit: fundações aplicadas, modelos de estado, primitivos, ações/controles, navegação, dados, feedback, componentes especializados, padrões de composição | Não |
| [03-component-library.md](03-component-library.md) | Component Library: as 70 famílias oficiais de componentes com anatomia, variantes, estados, responsividade e critérios de aceitação | Não |
| [04-screen-templates.md](04-screen-templates.md) | Screen Templates: shells, regiões estruturais e os 35 templates de tela (T01–T35) | Não |
| [05-figma-component-library.md](05-figma-component-library.md) | Manual de construção/governança da biblioteca de componentes no Figma (variables, Auto Layout, component sets, publicação, handoff) | Não |
| [06-figma-screen-templates.md](06-figma-screen-templates.md) | Manual de construção/governança dos shells e screen templates no Figma | Não |

Nenhum destes documentos contém código, React, HTML, CSS ou decisão de arquitetura de software — são especificações normativas de produto visual, seguindo o mesmo princípio de "documentação antes de código" do restante do projeto.

## Como usar

- Para decidir um **valor de token** (cor, espaçamento, radius, motion): consulte primeiro `../11-design-system.md`.
- Para entender **por que** a plataforma parece do jeito que parece (personalidade, emoção, direção artística): `01-visual-language.md`.
- Para especificar ou revisar um **componente**: `02-ui-kit.md` (regras aplicadas) e `03-component-library.md` (ficha completa da família).
- Para montar uma **tela nova**: comece por `04-screen-templates.md` (qual template se aplica) antes de desenhar do zero.
- Para **construir ou revisar algo no Figma**: `05-figma-component-library.md` (componentes) e `06-figma-screen-templates.md` (shells/templates).

## Status

Versão 1.0 de todos os seis documentos — especificação normativa inicial, datada de 2026-07-12. Ainda não validados formalmente pelo usuário nem confrontados em auditoria cruzada com os docs 00–11 (essa auditoria, se desejada, é um próximo passo natural antes de tratar os valores aqui como definitivos).
