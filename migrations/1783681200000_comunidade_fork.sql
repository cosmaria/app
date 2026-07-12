-- Migração 024 — Comunidade: RegistroDeFork (doc 06 §8, doc 02 §9.2).
-- Grafo de atribuição de forks (quem copiou o Growlog de quem), exclusivo do contexto Grow.
-- Executada por `db:migrate`. Perfis referenciados por ID (doc 08 §11).

-- Up Migration

CREATE TABLE IF NOT EXISTS comunidade.registro_de_fork (
  id                       UUID PRIMARY KEY,
  publicacao_origem_id     UUID NOT NULL REFERENCES comunidade.publicacao (id) ON DELETE CASCADE,
  conteudo_origem_id       UUID NOT NULL,
  autor_original_perfil_id UUID NOT NULL,
  forker_perfil_id         UUID NOT NULL,
  contexto                 TEXT NOT NULL,
  criado_em                TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_fork_contexto CHECK (contexto = 'GROW'),
  -- Forkar de novo a mesma origem é idempotente pela chave natural.
  CONSTRAINT uq_fork UNIQUE (forker_perfil_id, publicacao_origem_id)
);
-- Reputação por perfil (Com-5): forks recebidos por autor original.
CREATE INDEX IF NOT EXISTS idx_fork_autor_original
  ON comunidade.registro_de_fork (autor_original_perfil_id);

-- Down Migration

DROP TABLE IF EXISTS comunidade.registro_de_fork;
