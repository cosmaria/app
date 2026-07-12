-- Migração 023 — Comunidade: grafo social e interações (doc 06 §7/§12).
-- Seguimento, Curtida, Comentário + contadores denormalizados na publicação. Executada por
-- `db:migrate`. Nenhuma FK atravessa schema: perfis referenciados por ID (doc 08 §11).

-- Up Migration

-- Contadores denormalizados (doc 08 §escalabilidade): o feed nunca faz COUNT por item.
ALTER TABLE comunidade.publicacao
  ADD COLUMN IF NOT EXISTS curtidas    INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comentarios INTEGER NOT NULL DEFAULT 0;

-- Seguimento — aresta do grafo social entre dois PerfilPublico do MESMO contexto (doc 06 §2).
-- FK do conteúdo não existe (perfis vivem no schema core); a integridade é por ID.
CREATE TABLE IF NOT EXISTS comunidade.seguimento (
  id                 UUID PRIMARY KEY,
  seguidor_perfil_id UUID NOT NULL,
  seguido_perfil_id  UUID NOT NULL,
  contexto           TEXT NOT NULL,
  criado_em          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_seguimento_contexto CHECK (contexto IN ('GROW', 'MED')),
  -- Não é possível seguir a si mesmo.
  CONSTRAINT ck_seguimento_distinto CHECK (seguidor_perfil_id <> seguido_perfil_id),
  -- Seguir é idempotente pela chave natural.
  CONSTRAINT uq_seguimento UNIQUE (seguidor_perfil_id, seguido_perfil_id)
);
CREATE INDEX IF NOT EXISTS idx_seguimento_seguidor
  ON comunidade.seguimento (seguidor_perfil_id);
CREATE INDEX IF NOT EXISTS idx_seguimento_seguido
  ON comunidade.seguimento (seguido_perfil_id);

-- Curtida — 0—1 por (perfil, publicação). FK à publicação (mesmo schema): CASCADE.
CREATE TABLE IF NOT EXISTS comunidade.curtida (
  id            UUID PRIMARY KEY,
  perfil_id     UUID NOT NULL,
  publicacao_id UUID NOT NULL REFERENCES comunidade.publicacao (id) ON DELETE CASCADE,
  contexto      TEXT NOT NULL,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_curtida_contexto CHECK (contexto IN ('GROW', 'MED')),
  CONSTRAINT uq_curtida UNIQUE (perfil_id, publicacao_id)
);
CREATE INDEX IF NOT EXISTS idx_curtida_publicacao ON comunidade.curtida (publicacao_id);

-- Comentário — N por publicação. FK à publicação (mesmo schema): CASCADE.
CREATE TABLE IF NOT EXISTS comunidade.comentario (
  id            UUID PRIMARY KEY,
  perfil_id     UUID NOT NULL,
  publicacao_id UUID NOT NULL REFERENCES comunidade.publicacao (id) ON DELETE CASCADE,
  contexto      TEXT NOT NULL,
  texto         TEXT NOT NULL,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_comentario_contexto CHECK (contexto IN ('GROW', 'MED'))
);
CREATE INDEX IF NOT EXISTS idx_comentario_publicacao
  ON comunidade.comentario (publicacao_id, criado_em DESC);

-- Down Migration

DROP TABLE IF EXISTS comunidade.comentario;
DROP TABLE IF EXISTS comunidade.curtida;
DROP TABLE IF EXISTS comunidade.seguimento;
ALTER TABLE comunidade.publicacao
  DROP COLUMN IF EXISTS comentarios,
  DROP COLUMN IF EXISTS curtidas;
