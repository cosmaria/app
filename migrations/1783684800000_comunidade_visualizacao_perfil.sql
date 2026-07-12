-- Migração 025 — Comunidade: VisualizacaoDePerfil (doc 06 §11, Premium; doc 08 minimização).
-- Contador AGREGADO por (perfil, dia). NUNCA um log de quem visitou — minimização de dado e
-- retenção curta (a poda de dias antigos é operação de manutenção, não modelada aqui).
-- Executada por `db:migrate`. Perfil referenciado por ID (doc 08 §11).

-- Up Migration

CREATE TABLE IF NOT EXISTS comunidade.visualizacao_de_perfil (
  perfil_id UUID NOT NULL,
  -- Dia como texto ISO (YYYY-MM-DD): evita conversões de fuso na leitura.
  dia       TEXT NOT NULL,
  total     INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (perfil_id, dia),
  CONSTRAINT ck_visualizacao_total CHECK (total >= 0)
);

-- Down Migration

DROP TABLE IF EXISTS comunidade.visualizacao_de_perfil;
