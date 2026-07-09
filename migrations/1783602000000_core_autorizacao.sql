-- Migração 002 — Autorização & Permissões (RBAC, doc 04 §11).
-- Adiciona os papéis de acesso à Conta. Toda conta existente e nova nasce com
-- [USUARIO]; papéis elevados (ADMIN/MODERADOR/SUPORTE/DEPENDENTE) são concedidos
-- por operação administrativa (épicas futuras). Executada por `db:migrate`.

-- Up Migration

ALTER TABLE core.usuario
  ADD COLUMN IF NOT EXISTS papeis TEXT[] NOT NULL DEFAULT ARRAY['USUARIO'];

-- Down Migration

ALTER TABLE core.usuario
  DROP COLUMN IF EXISTS papeis;
