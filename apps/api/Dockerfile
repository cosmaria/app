# Dockerfile do Modular Monolith (apps/api) para deploy no Cloud Run (doc 13 §10).
# Multi-stage: instala deps + build no estágio "builder", runtime enxuto no final.
# Contexto de build = raiz do monorepo (para acessar o workspace inteiro).
# Ponto de partida do Sprint 01 — otimizações (cache de camadas, prune) evoluem depois.

# ---- Estágio 1: build ----
FROM node:22-alpine AS builder
WORKDIR /workspace

# Copia manifestos primeiro (aproveita cache de camada do Docker)
COPY package.json package-lock.json nx.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/
# (libs entram aqui conforme forem consumidas pelo api em sprints seguintes)

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

# Cloud Run injeta a porta via variável PORT
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/main.js"]
