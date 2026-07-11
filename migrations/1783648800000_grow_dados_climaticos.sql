-- Migração 015 — Dados Climáticos / Módulo Outdoor (doc 02 §6, doc 08 §12 — Arquétipo A).
-- Executada por `db:migrate`.
--
-- Entidade do MÓDULO OUTDOOR desacoplado: enriquece um ambiente outdoor (0—1) com
-- localização aproximada e o gancho de clima/solar. O núcleo Ambiente/Planta/Ciclo nunca
-- depende dela. `fonte = MANUAL` no MVP; `PROVEDOR_EXTERNO` fica reservado para a API
-- climática (Versão 2), sem alterar este schema.
--
-- Localização é opt-in e aproximada (doc 02 §16 — privacidade); nunca coordenada exata
-- por padrão. UNIQUE em ambiente_id garante o 0—1; CASCADE limpa junto com o ambiente.

-- Up Migration

CREATE TABLE IF NOT EXISTS grow.dados_climaticos (
  id                     UUID PRIMARY KEY,
  usuario_id             UUID NOT NULL,
  ambiente_id            UUID NOT NULL UNIQUE REFERENCES grow.ambiente (id) ON DELETE CASCADE,
  localizacao_aproximada TEXT,
  latitude_aproximada    NUMERIC,
  longitude_aproximada   NUMERIC,
  fonte                  TEXT NOT NULL,
  observacoes            TEXT,
  criado_em              TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_clima_fonte CHECK (fonte IN ('MANUAL', 'PROVEDOR_EXTERNO')),
  CONSTRAINT ck_clima_latitude CHECK (
    latitude_aproximada IS NULL OR latitude_aproximada BETWEEN -90 AND 90
  ),
  CONSTRAINT ck_clima_longitude CHECK (
    longitude_aproximada IS NULL OR longitude_aproximada BETWEEN -180 AND 180
  )
);

-- Down Migration

DROP TABLE IF EXISTS grow.dados_climaticos;
