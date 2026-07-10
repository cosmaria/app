-- Migração 010 — Núcleo do COSMARIA Grow: Genética, Ambiente, Ciclo, Planta.
-- Doc 02 §5.1-5.4, doc 08 §12.2. Executada por `db:migrate`.
--
-- PRIMEIRO schema fora do Core (doc 04 §16 — schema por módulo). Nenhuma FK atravessa
-- schemas: a referência a `core.usuario` é por ID, sem integridade referencial de banco
-- (Padrão de Referência Cross-Módulo, doc 08 §11). O expurgo de dados de uma Conta
-- excluída acontece por reação ao evento `ContaExclusaoSolicitada`, não por CASCADE.

-- Up Migration

CREATE SCHEMA IF NOT EXISTS grow;

-- Genetica — Arquétipo A, praticamente estática após criada.
-- Códigos estáveis em `tipo` (doc 08 §8): o texto exibido vem de tradução por idioma.
CREATE TABLE IF NOT EXISTS grow.genetica (
  id                        UUID PRIMARY KEY,
  usuario_id                UUID NOT NULL,
  nome                      TEXT NOT NULL,
  tipo                      TEXT NOT NULL,
  linhagem                  TEXT,
  breeder                   TEXT,
  caracteristicas_esperadas TEXT,
  criado_em                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em             TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_genetica_tipo CHECK (tipo IN ('FOTOPERIODICA', 'AUTOFLORESCENTE'))
);
CREATE INDEX IF NOT EXISTS idx_genetica_usuario ON grow.genetica (usuario_id);

-- Ambiente — o espaço físico tem histórico próprio: hospeda N ciclos ao longo do tempo.
CREATE TABLE IF NOT EXISTS grow.ambiente (
  id                 UUID PRIMARY KEY,
  usuario_id         UUID NOT NULL,
  nome               TEXT NOT NULL,
  tipo               TEXT NOT NULL,
  largura_cm         INTEGER,
  comprimento_cm     INTEGER,
  altura_cm          INTEGER,
  capacidade_plantas INTEGER,
  criado_em          TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_ambiente_tipo CHECK (tipo IN ('INDOOR', 'OUTDOOR', 'ESTUFA'))
);
-- Contagem de ambientes simultâneos (gate de LimiteDePlano, doc 07 §9).
CREATE INDEX IF NOT EXISTS idx_ambiente_usuario ON grow.ambiente (usuario_id);

-- CicloCultivo — entidade central do Grow.
-- `transicoes` é JSONB append-only: a lista datada de mudanças de fase é a base de TODA
-- métrica de duração (doc 02 §5.12) e do que a IA analisa. Fica junto do agregado porque
-- nunca é consultada isoladamente, só junto do ciclo.
CREATE TABLE IF NOT EXISTS grow.ciclo_cultivo (
  id            UUID PRIMARY KEY,
  usuario_id    UUID NOT NULL,
  ambiente_id   UUID NOT NULL REFERENCES grow.ambiente (id),
  nome          TEXT NOT NULL,
  fase_atual    TEXT NOT NULL,
  transicoes    JSONB NOT NULL DEFAULT '[]'::jsonb,
  iniciado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  encerrado_em  TIMESTAMPTZ,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_ciclo_fase CHECK (
    fase_atual IN ('GERMINACAO', 'VEGETATIVO', 'PRE_FLORACAO', 'FLORACAO', 'COLHEITA', 'SECAGEM', 'CURA')
  )
);
CREATE INDEX IF NOT EXISTS idx_ciclo_usuario ON grow.ciclo_cultivo (usuario_id);
CREATE INDEX IF NOT EXISTS idx_ciclo_ambiente ON grow.ciclo_cultivo (ambiente_id);
-- Ciclos ativos: índice parcial, muito menor que o histórico completo.
CREATE INDEX IF NOT EXISTS idx_ciclo_ativos
  ON grow.ciclo_cultivo (usuario_id) WHERE encerrado_em IS NULL;

-- Planta — unidade central de registro. Fase PRÓPRIA, independente da do ciclo:
-- é o que sustenta a colheita escalonada (0—N colheitas por ciclo, doc 04 §25).
CREATE TABLE IF NOT EXISTS grow.planta (
  id            UUID PRIMARY KEY,
  usuario_id    UUID NOT NULL,
  ciclo_id      UUID NOT NULL REFERENCES grow.ciclo_cultivo (id) ON DELETE CASCADE,
  genetica_id   UUID NOT NULL REFERENCES grow.genetica (id),
  nome          TEXT NOT NULL,
  origem        TEXT NOT NULL,
  planta_mae_id UUID REFERENCES grow.planta (id),
  fase_atual    TEXT NOT NULL,
  germinada_em  TIMESTAMPTZ,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_planta_origem CHECK (origem IN ('SEMENTE', 'CLONE', 'PLANTA_MAE')),
  CONSTRAINT ck_planta_fase CHECK (
    fase_atual IN ('GERMINACAO', 'VEGETATIVO', 'PRE_FLORACAO', 'FLORACAO', 'COLHEITA', 'SECAGEM', 'CURA')
  )
);
CREATE INDEX IF NOT EXISTS idx_planta_ciclo ON grow.planta (ciclo_id);
CREATE INDEX IF NOT EXISTS idx_planta_genetica ON grow.planta (genetica_id);
CREATE INDEX IF NOT EXISTS idx_planta_usuario ON grow.planta (usuario_id);

-- Down Migration

DROP TABLE IF EXISTS grow.planta;
DROP TABLE IF EXISTS grow.ciclo_cultivo;
DROP TABLE IF EXISTS grow.ambiente;
DROP TABLE IF EXISTS grow.genetica;
DROP SCHEMA IF EXISTS grow;
