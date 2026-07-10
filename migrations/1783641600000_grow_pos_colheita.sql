-- Migração 013 — Pós-colheita: Colheita, Secagem, Cura, Lote (doc 02 §5.11, doc 08 §12.2).
-- Executada por `db:migrate`.
--
-- Fluxo Colheita → Secagem → Cura → Lote. A Colheita é 0—N por ciclo (colheita escalonada,
-- doc 04 §25); as demais etapas são 1—1 com a anterior, garantido por UNIQUE. O CASCADE
-- encadeado faz todo o pós-colheita sumir junto com o ciclo.
--
-- O Lote é entidade PURA do Grow: a referência opt-in do Med (doc 03/09) virá por
-- ID+snapshot pela public-api quando o Med existir, sem alterar este schema.

-- Up Migration

-- Colheita — fato histórico (Arquétipo B). `plantas` é o subconjunto de plantas colhidas;
-- não há FK de array em Postgres, então a posse das plantas é validada na aplicação
-- (Padrão de Referência dentro do próprio schema, sem integridade referencial de array).
CREATE TABLE IF NOT EXISTS grow.colheita (
  id                UUID PRIMARY KEY,
  usuario_id        UUID NOT NULL,
  ciclo_id          UUID NOT NULL REFERENCES grow.ciclo_cultivo (id) ON DELETE CASCADE,
  plantas           UUID[] NOT NULL,
  peso_umido_gramas NUMERIC,
  colhido_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  observacoes       TEXT,
  criado_em         TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Colheita sem planta seria registro sobre o nada, e quebraria o rendimento por planta.
  -- `cardinality` (não `array_length`) porque array_length de um array vazio é NULL, e um
  -- CHECK passa quando o resultado é NULL — deixaria o array vazio escapar.
  CONSTRAINT ck_colheita_plantas CHECK (cardinality(plantas) >= 1),
  CONSTRAINT ck_colheita_peso CHECK (peso_umido_gramas IS NULL OR peso_umido_gramas >= 0)
);
CREATE INDEX IF NOT EXISTS idx_colheita_ciclo_tempo
  ON grow.colheita (ciclo_id, colhido_em DESC);

-- Secagem — 1—1 com a Colheita (UNIQUE). `finalizada_em` é transição monotônica.
CREATE TABLE IF NOT EXISTS grow.secagem (
  id               UUID PRIMARY KEY,
  usuario_id       UUID NOT NULL,
  colheita_id      UUID NOT NULL UNIQUE REFERENCES grow.colheita (id) ON DELETE CASCADE,
  iniciada_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
  finalizada_em    TIMESTAMPTZ,
  temperatura_c    NUMERIC,
  umidade_relativa NUMERIC,
  observacoes      TEXT,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_secagem_duracao CHECK (finalizada_em IS NULL OR finalizada_em >= iniciada_em)
);

-- Cura — 1—1 com a Secagem (UNIQUE). Acrescenta o registro de "burping".
CREATE TABLE IF NOT EXISTS grow.cura (
  id               UUID PRIMARY KEY,
  usuario_id       UUID NOT NULL,
  secagem_id       UUID NOT NULL UNIQUE REFERENCES grow.secagem (id) ON DELETE CASCADE,
  iniciada_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
  finalizada_em    TIMESTAMPTZ,
  temperatura_c    NUMERIC,
  umidade_relativa NUMERIC,
  burping          TEXT,
  observacoes      TEXT,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_cura_duracao CHECK (finalizada_em IS NULL OR finalizada_em >= iniciada_em)
);

-- Lote — unidade terminal, 1—1 com a Cura (UNIQUE). Carrega o rendimento seco final.
CREATE TABLE IF NOT EXISTS grow.lote (
  id               UUID PRIMARY KEY,
  usuario_id       UUID NOT NULL,
  cura_id          UUID NOT NULL UNIQUE REFERENCES grow.cura (id) ON DELETE CASCADE,
  codigo           TEXT NOT NULL,
  peso_seco_gramas NUMERIC NOT NULL,
  observacoes      TEXT,
  gerado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_lote_peso CHECK (peso_seco_gramas >= 0)
);
CREATE INDEX IF NOT EXISTS idx_lote_usuario ON grow.lote (usuario_id);

-- Down Migration

DROP TABLE IF EXISTS grow.lote;
DROP TABLE IF EXISTS grow.cura;
DROP TABLE IF EXISTS grow.secagem;
DROP TABLE IF EXISTS grow.colheita;
