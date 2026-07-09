-- Migração 005 — Identidade Social: Perfil Público por contexto + Vínculo de Perfis (doc 06, doc 08 §12.1).
-- Executada por `db:migrate`.

-- Up Migration

-- PerfilPúblico — uma Conta tem NO MÁXIMO um perfil por contexto de aplicativo.
-- Nome/avatar/biografia são opcionais: o perfil nasce anônimo (doc 06 §7.3/§19).
CREATE TABLE IF NOT EXISTS core.perfil_publico (
  id             UUID PRIMARY KEY,
  usuario_id     UUID NOT NULL REFERENCES core.usuario (id) ON DELETE CASCADE,
  contexto       TEXT NOT NULL,
  nome_exibicao  TEXT,
  avatar_url     TEXT,
  biografia      TEXT,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em  TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Chave natural: garante no banco a idempotência da criação lazy (doc 06, Riscos Técnicos).
  CONSTRAINT uq_perfil_publico_usuario_contexto UNIQUE (usuario_id, contexto)
);
CREATE INDEX IF NOT EXISTS idx_perfil_publico_contexto
  ON core.perfil_publico (contexto);

-- RegistroDeVinculoDePerfis — opt-in explícito, reversível (Versão 2, desligado por flag).
-- `perfil_ids` guarda 2+ perfis da MESMA Conta; `visivel_em` diz em quais contextos o
-- vínculo aparece a terceiros (doc 06 §18 — revelação parcial).
CREATE TABLE IF NOT EXISTS core.registro_vinculo_perfis (
  id          UUID PRIMARY KEY,
  usuario_id  UUID NOT NULL REFERENCES core.usuario (id) ON DELETE CASCADE,
  perfil_ids  UUID[] NOT NULL,
  visivel_em  TEXT[] NOT NULL,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  revogado_em TIMESTAMPTZ,
  CONSTRAINT ck_vinculo_dois_perfis CHECK (array_length(perfil_ids, 1) >= 2),
  CONSTRAINT ck_vinculo_um_contexto CHECK (array_length(visivel_em, 1) >= 1)
);
CREATE INDEX IF NOT EXISTS idx_vinculo_perfis_usuario
  ON core.registro_vinculo_perfis (usuario_id);
-- Busca do vínculo vigente que contém um perfil (GIN sobre o array de ids).
CREATE INDEX IF NOT EXISTS idx_vinculo_perfis_ids
  ON core.registro_vinculo_perfis USING GIN (perfil_ids);

-- Down Migration

DROP TABLE IF EXISTS core.registro_vinculo_perfis;
DROP TABLE IF EXISTS core.perfil_publico;
