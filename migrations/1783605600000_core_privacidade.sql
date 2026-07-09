-- Migração 003 — Motor de Privacidade Granular (doc 04 §12, doc 08 §12.1).
-- ConfiguraçãoDeCompartilhamento: grade dimensão × escopo de um conteúdo, uma por
-- conteúdo (chave natural módulo+tipo+id). Nasce PRIVADA. Executada por `db:migrate`.

-- Up Migration

CREATE TABLE IF NOT EXISTS core.configuracao_de_compartilhamento (
  id             UUID PRIMARY KEY,
  autor_id       UUID NOT NULL REFERENCES core.usuario (id) ON DELETE CASCADE,
  modulo         TEXT NOT NULL,
  tipo_conteudo  TEXT NOT NULL,
  conteudo_id    TEXT NOT NULL,
  escopo_padrao  TEXT NOT NULL DEFAULT 'PRIVADO',
  dimensoes      JSONB NOT NULL DEFAULT '{}'::jsonb,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (modulo, tipo_conteudo, conteudo_id)
);

CREATE INDEX IF NOT EXISTS idx_cfg_compart_autor
  ON core.configuracao_de_compartilhamento (autor_id);

-- Down Migration

DROP TABLE IF EXISTS core.configuracao_de_compartilhamento;
