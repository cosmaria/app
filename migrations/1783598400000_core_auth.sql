-- Migração 001 — schema `core` + tabelas de autenticação (doc 08 §12.1/§14).
-- Schema por módulo (doc 04 §16): cada módulo só acessa o próprio schema.
-- Executada pela ferramenta node-pg-migrate (Sprint de Infraestrutura, 2026-07-09) —
-- NUNCA no boot da app; sempre via comando dedicado `db:migrate` (doc 09, stateless).

-- Up Migration

CREATE SCHEMA IF NOT EXISTS core;

-- Habilita geração de UUID no banco (opcional; os ids também vêm da aplicação).
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Entidade Usuário (Conta) — doc 08 §12.1
CREATE TABLE IF NOT EXISTS core.usuario (
  id            UUID PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  senha_hash    TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'ATIVO',
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Entidade SessaoDeAutenticacao (refresh tokens) — doc 08 §14
CREATE TABLE IF NOT EXISTS core.sessao_de_autenticacao (
  id                  UUID PRIMARY KEY,
  usuario_id          UUID NOT NULL REFERENCES core.usuario (id) ON DELETE CASCADE,
  refresh_token_hash  TEXT NOT NULL,
  expira_em           TIMESTAMPTZ NOT NULL,
  revogada_em         TIMESTAMPTZ,
  criado_em           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessao_usuario ON core.sessao_de_autenticacao (usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessao_expira ON core.sessao_de_autenticacao (expira_em);

-- Down Migration

DROP TABLE IF EXISTS core.sessao_de_autenticacao;
DROP TABLE IF EXISTS core.usuario;
DROP SCHEMA IF EXISTS core CASCADE;
