# syntax=docker/dockerfile:1.7-labs
# Dockerfile do Modular Monolith (apps/api) para deploy no Cloud Run (doc 13 §10).
# Multi-stage: instala deps + build no estágio "builder", runtime enxuto no final.
# Contexto de build = raiz do monorepo (para acessar o workspace inteiro).

# ---- Estágio 1: build ----
FROM node:22-alpine AS builder
WORKDIR /workspace

# Copia SÓ os manifestos, preservando a estrutura de diretórios (COPY --parents).
# Os manifestos das libs precisam existir ANTES do `npm ci`: é ele quem cria os
# symlinks node_modules/@cosmaria/* dos workspaces. Sem eles, `nx build api` builda
# core-domain mas core-application não consegue resolver '@cosmaria/core-domain'.
# Copiar só os manifestos (e não o código) mantém a camada do `npm ci` em cache
# quando apenas o código-fonte muda.
COPY --parents package.json package-lock.json nx.json tsconfig.base.json ./
COPY --parents apps/*/package.json libs/*/*/package.json ./

RUN npm ci

# Copia o restante do código e builda o api
COPY . .
RUN npx nx build api

# ---- Estágio 2: runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copia apenas o necessário para rodar
COPY --from=builder /workspace/apps/api/dist ./dist
COPY --from=builder /workspace/apps/api/package.json ./
COPY --from=builder /workspace/node_modules ./node_modules
# As libs são workspaces: node_modules/@cosmaria/* são symlinks para libs/**/dist.
COPY --from=builder /workspace/libs ./libs

# Cloud Run injeta a porta via variável PORT
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/main.js"]
