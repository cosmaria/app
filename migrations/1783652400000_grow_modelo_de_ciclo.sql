-- Migração 016 — ModeloDeCiclo (doc 02 §7, doc 08 §289 — Arquétipo A, Premium).
-- Executada por `db:migrate`.
--
-- Template NOMEADO e reutilizável de configuração de ciclo (ambiente/genética/rotina
-- padrão), distinto de clonar o último ciclo. O gate de Premium é da aplicação (via
-- PREMIUM_PUBLIC_API), não do banco. As referências a ambiente/genética são FRACAS
-- (ON DELETE SET NULL): excluir o ambiente/genética não apaga o modelo — só zera o padrão.

-- Up Migration

CREATE TABLE IF NOT EXISTS grow.modelo_de_ciclo (
  id            UUID PRIMARY KEY,
  usuario_id    UUID NOT NULL,
  nome          TEXT NOT NULL,
  ambiente_id   UUID REFERENCES grow.ambiente (id) ON DELETE SET NULL,
  genetica_id   UUID REFERENCES grow.genetica (id) ON DELETE SET NULL,
  fase_inicial  TEXT,
  rotina_padrao TEXT,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_modelo_fase CHECK (
    fase_inicial IS NULL OR
    fase_inicial IN ('GERMINACAO', 'VEGETATIVO', 'PRE_FLORACAO', 'FLORACAO', 'COLHEITA', 'SECAGEM', 'CURA')
  )
);
CREATE INDEX IF NOT EXISTS idx_modelo_usuario ON grow.modelo_de_ciclo (usuario_id);

-- Down Migration

DROP TABLE IF EXISTS grow.modelo_de_ciclo;
