-- Migração 004 — Consentimento & Conformidade LGPD + Trilha de Auditoria (doc 04 §21, doc 08 §7).
-- Executada por `db:migrate`.

-- Up Migration

-- ConsentimentoRegistro — versionado e revogável (nunca sobrescrito).
CREATE TABLE IF NOT EXISTS core.consentimento_registro (
  id            UUID PRIMARY KEY,
  usuario_id    UUID NOT NULL REFERENCES core.usuario (id) ON DELETE CASCADE,
  tipo          TEXT NOT NULL,
  versao_texto  TEXT NOT NULL,
  concedido_em  TIMESTAMPTZ NOT NULL DEFAULT now(),
  revogado_em   TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_consentimento_usuario_tipo
  ON core.consentimento_registro (usuario_id, tipo);

-- TrilhaDeAuditoria — append-only; SEM FK de autor_id (deve sobreviver à exclusão da conta).
CREATE TABLE IF NOT EXISTS core.trilha_de_auditoria (
  id               UUID PRIMARY KEY,
  entidade_afetada TEXT NOT NULL,
  entidade_id      TEXT,
  acao             TEXT NOT NULL,
  autor_id         UUID,
  detalhe          JSONB NOT NULL DEFAULT '{}'::jsonb,
  registrado_em    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_trilha_registrado_em
  ON core.trilha_de_auditoria (registrado_em DESC);

-- SolicitacaoDeExportacao — portabilidade LGPD.
CREATE TABLE IF NOT EXISTS core.solicitacao_exportacao (
  id            UUID PRIMARY KEY,
  usuario_id    UUID NOT NULL REFERENCES core.usuario (id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'PENDENTE',
  url_download  TEXT,
  solicitado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  concluido_em  TIMESTAMPTZ
);

-- Down Migration

DROP TABLE IF EXISTS core.solicitacao_exportacao;
DROP TABLE IF EXISTS core.trilha_de_auditoria;
DROP TABLE IF EXISTS core.consentimento_registro;
