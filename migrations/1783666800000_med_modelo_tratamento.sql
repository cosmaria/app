-- Migração 020 — Modelos de Tratamento do COSMARIA Med (doc 03 §10, Premium).
-- Executada por `db:migrate`.
--
-- Template nomeado que pré-preenche um novo tratamento. Criar é gated por Premium (no caso
-- de uso, HTTP 402); ler/remover o que já é do usuário nunca é limitado (doc 07 §9).

-- Up Migration

CREATE TABLE IF NOT EXISTS med.modelo_tratamento (
  id              UUID PRIMARY KEY,
  usuario_id      UUID NOT NULL,
  nome            TEXT NOT NULL,
  condicao_padrao TEXT,
  objetivo_padrao TEXT,
  notas           TEXT,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_modelo_tratamento_usuario ON med.modelo_tratamento (usuario_id);

-- Down Migration

DROP TABLE IF EXISTS med.modelo_tratamento;
