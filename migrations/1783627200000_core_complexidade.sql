-- Migração 009 — Complexidade Progressiva e Modo Especialista (doc 02 §5.0/§6).
-- Executada por `db:migrate`.

-- Up Migration

-- PreferenciaDeComplexidade — Arquétipo D (Configuração), uma linha por Usuário.
-- Entidade ÚNICA do Core, nunca duplicada por app (doc 02 §6): quem já é especialista no
-- cultivo não volta ao formulário de iniciante no acompanhamento terapêutico.
-- `campos_habilitados` guarda a habilitação progressiva: campos avançados liberados
-- individualmente, sem que o usuário precise subir de nível.
CREATE TABLE IF NOT EXISTS core.preferencia_de_complexidade (
  id                 UUID PRIMARY KEY,
  usuario_id         UUID NOT NULL UNIQUE REFERENCES core.usuario (id) ON DELETE CASCADE,
  nivel              TEXT NOT NULL DEFAULT 'ESSENCIAL',
  campos_habilitados TEXT[] NOT NULL DEFAULT '{}',
  atualizado_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_nivel_complexidade
    CHECK (nivel IN ('ESSENCIAL', 'AVANCADO', 'ESPECIALISTA'))
);

-- Down Migration

DROP TABLE IF EXISTS core.preferencia_de_complexidade;
