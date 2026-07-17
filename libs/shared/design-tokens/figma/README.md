# Tokens da COSMARIA para o Figma

`cosmaria.tokens.json` é o **export canônico** dos design tokens para o Figma, derivado da fonte única em `../src/` (doc 11 §5 / §17). As coleções e modes espelham exatamente as que o plugin `cosmaria-button-figma-plugin` cria:

| Coleção            | Modes           | Conteúdo                                                       |
| ------------------ | --------------- | -------------------------------------------------------------- |
| `Color/Theme`      | Dark, Light     | neutros de fundo/texto/borda + semânticas                      |
| `Color/Context`    | Core, Grow, Med | accent por contexto (variáveis `accent/dark` e `accent/light`) |
| `Dimension/Scale`  | Default         | spacing, radius, larguras de borda                             |
| `Opacity/Semantic` | Default         | disabled, overlay, hover-overlay                               |

## Como usar

1. Importe `cosmaria.tokens.json` no Figma (via importador de Variables / Tokens Studio), OU use-o como referência para conferir as Variables que o plugin gera.
2. Os valores aqui são a **fonte de verdade**. Se o plugin (ou qualquer arquivo Figma) divergir, o correto é este arquivo.

## Regeneração

Este JSON é derivado de `../src/figma-tokens.ts` (`buildFigmaTokens()`), que é tipado contra os tokens canônicos — se um token for renomeado/removido, o typecheck da lib quebra. Hoje a serialização é feita manualmente a partir dessa função; a automação (um script que roda `buildFigmaTokens()` e escreve este arquivo) fica pendente de um runner de TS no monorepo (não há `tsx`/`ts-node` instalado ainda). Enquanto isso, ao alterar um valor em `../src/`, atualize este JSON no mesmo commit.

## Reconciliação com o plugin (pendências para o designer)

O `cosmaria-button-figma-plugin` **embute os valores inline** no `code.js` e não importa este JSON (`networkAccess: none`). Duas divergências reais a reconciliar antes de tratar o plugin como fonte:

1. **Tons de hover/pressed do accent** (ex.: `#9A90E5`, `#7A6DCF`) que o plugin define **não têm respaldo no doc 11**. O doc 11 / ui-kit §7.10 e §26 prescrevem hover como **overlay neutro de 8–12%** sobre a superfície e active por aumento de contraste — não hexadecimais de accent distintos. A interação do Button (código e Figma) deve seguir o overlay, não os tons inventados. Por isso este export **não** inclui variáveis de hover/pressed de accent: elas não são tokens oficiais.
2. **Fonte "Inter"** é candidata (doc 11 §4), não decisão final — o plugin a fixa como se fosse definitiva.
