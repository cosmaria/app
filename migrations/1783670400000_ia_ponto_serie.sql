-- Migração 021 — Série temporal da IA: PontoDeSerie (doc 05 §6, doc 04 §16).
-- Executada por `db:migrate`. PRIMEIRO schema do módulo IA.
--
-- A IA mantém a PRÓPRIA série temporal, alimentada pelo Adaptador de Ingestão (assina os
-- eventos de Grow/Med). Nunca lê o schema de outro módulo (doc 04 §24). Append-only.
-- `origem_id` guarda o ID do registro bruto de Grow/Med por schema/módulo (referência por
-- ID, sem FK cross-schema — Padrão de Referência Cross-Módulo, doc 08 §11), sustentando a
-- rastreabilidade exigida pelo doc 05 §7.2.

-- Up Migration

CREATE SCHEMA IF NOT EXISTS ia;

CREATE TABLE IF NOT EXISTS ia.ponto_serie (
  id          UUID PRIMARY KEY,
  usuario_id  UUID NOT NULL,
  dominio     TEXT NOT NULL,
  fator       TEXT NOT NULL,
  valor       NUMERIC NOT NULL,
  ocorrido_em TIMESTAMPTZ NOT NULL,
  origem_id   UUID NOT NULL,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_ponto_dominio CHECK (dominio IN ('GROW', 'MED'))
);

-- Consulta central: pontos de um fator de um usuário em ordem cronológica (Motor de Correlação).
CREATE INDEX IF NOT EXISTS idx_ponto_usuario_fator
  ON ia.ponto_serie (usuario_id, dominio, fator, ocorrido_em);

-- Down Migration

DROP TABLE IF EXISTS ia.ponto_serie;
DROP SCHEMA IF EXISTS ia;
