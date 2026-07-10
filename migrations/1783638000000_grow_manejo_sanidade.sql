-- Migração 012 — Manejo e Sanidade (doc 02 §5.7/§5.8, doc 08 §12.2 — Arquétipo B).
-- Executada por `db:migrate`.

-- Up Migration

-- EventoManejo — histórico IMUTÁVEL do que o cultivador fez.
-- `planta_id` nulo = manejo do ciclo inteiro (ex.: fertilização de todas as plantas).
CREATE TABLE IF NOT EXISTS grow.evento_manejo (
  id          UUID PRIMARY KEY,
  usuario_id  UUID NOT NULL,
  ciclo_id    UUID NOT NULL REFERENCES grow.ciclo_cultivo (id) ON DELETE CASCADE,
  planta_id   UUID REFERENCES grow.planta (id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL,
  ocorrido_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  observacoes TEXT,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_manejo_tipo CHECK (
    tipo IN ('PODA', 'TOPPING', 'LST', 'SCROG', 'DEFOLIACAO', 'TRANSPLANTE', 'REGA', 'FERTILIZACAO', 'FLUSH')
  )
);
CREATE INDEX IF NOT EXISTS idx_manejo_ciclo_tempo
  ON grow.evento_manejo (ciclo_id, ocorrido_em DESC);

-- EventoSanidade — o doc 02 pede "evolução/resolução", o que só parece contradizer o
-- histórico imutável: `resolvido_em` é uma transição MONOTÔNICA e única (preenchida uma
-- vez, nunca desfeita), não uma edição do que foi observado. Um problema que piorou é uma
-- NOVA ocorrência, com sua própria severidade e data — e é assim que a IA vê reincidência.
CREATE TABLE IF NOT EXISTS grow.evento_sanidade (
  id                  UUID PRIMARY KEY,
  usuario_id          UUID NOT NULL,
  ciclo_id            UUID NOT NULL REFERENCES grow.ciclo_cultivo (id) ON DELETE CASCADE,
  planta_id           UUID REFERENCES grow.planta (id) ON DELETE CASCADE,
  tipo                TEXT NOT NULL,
  severidade          TEXT NOT NULL,
  descricao           TEXT,
  tratamento_aplicado TEXT,
  ocorrido_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolvido_em        TIMESTAMPTZ,
  criado_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_sanidade_tipo CHECK (tipo IN ('PRAGA', 'DOENCA', 'DEFICIENCIA', 'ESTRESSE')),
  CONSTRAINT ck_sanidade_severidade CHECK (severidade IN ('BAIXA', 'MEDIA', 'ALTA')),
  -- Resolver antes de ocorrer é impossível.
  CONSTRAINT ck_sanidade_resolucao CHECK (resolvido_em IS NULL OR resolvido_em >= ocorrido_em)
);
CREATE INDEX IF NOT EXISTS idx_sanidade_ciclo_tempo
  ON grow.evento_sanidade (ciclo_id, ocorrido_em DESC);
-- Problemas em aberto: índice parcial, muito menor que o histórico completo.
CREATE INDEX IF NOT EXISTS idx_sanidade_abertos
  ON grow.evento_sanidade (ciclo_id) WHERE resolvido_em IS NULL;

-- Down Migration

DROP TABLE IF EXISTS grow.evento_sanidade;
DROP TABLE IF EXISTS grow.evento_manejo;
