-- Migração 017 — Núcleo do COSMARIA Med: Tratamento, Produto, Registro de Uso.
-- Doc 03 §5.1-5.3, doc 08 §11. Executada por `db:migrate`.
--
-- PRIMEIRO schema do Med (doc 04 §16 — schema por módulo). Nenhuma FK atravessa schemas:
-- a referência a `core.usuario` é por ID, sem integridade referencial de banco (Padrão de
-- Referência Cross-Módulo, doc 08 §11). O expurgo de dados de uma Conta excluída acontece
-- por reação ao evento `ContaExclusaoSolicitada`, não por CASCADE.

-- Up Migration

CREATE SCHEMA IF NOT EXISTS med;

-- Tratamento — Arquétipo A, entidade central do Med. Encerrado é terminal, mas o
-- histórico permanece (a evolução clínica e o relatório médico dependem dele).
CREATE TABLE IF NOT EXISTS med.tratamento (
  id                 UUID PRIMARY KEY,
  usuario_id         UUID NOT NULL,
  condicao           TEXT NOT NULL,
  objetivo           TEXT,
  medico_responsavel TEXT,
  status             TEXT NOT NULL,
  iniciado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  encerrado_em       TIMESTAMPTZ,
  criado_em          TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_tratamento_status CHECK (status IN ('ATIVO', 'ENCERRADO')),
  -- Encerrado <=> tem data de encerramento (coerência de estado).
  CONSTRAINT ck_tratamento_encerramento CHECK (
    (status = 'ENCERRADO') = (encerrado_em IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS idx_tratamento_usuario ON med.tratamento (usuario_id);
-- Tratamentos ativos: índice parcial, menor que o histórico completo.
CREATE INDEX IF NOT EXISTS idx_tratamento_ativos
  ON med.tratamento (usuario_id) WHERE status = 'ATIVO';

-- Produto — Arquétipo A. Pertence a um tratamento (1—N). `lote_id` é a referência opt-in
-- ao Lote do Grow: modelada desde já (Versão 2, doc 03 §18), inerte no MVP — sem FK, pois
-- vive em outro schema/módulo (referência por ID + snapshot, doc 04 §23).
CREATE TABLE IF NOT EXISTS med.produto (
  id               UUID PRIMARY KEY,
  usuario_id       UUID NOT NULL,
  tratamento_id    UUID NOT NULL REFERENCES med.tratamento (id) ON DELETE CASCADE,
  nome             TEXT NOT NULL,
  tipo             TEXT NOT NULL,
  concentracao_cbd TEXT,
  concentracao_thc TEXT,
  fabricante       TEXT,
  lote_id          UUID,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_produto_tipo CHECK (
    tipo IN ('OLEO', 'FLOR', 'COMESTIVEL', 'EXTRATO', 'CONCENTRADO', 'CAPSULA', 'TOPICO', 'OUTRO')
  )
);
CREATE INDEX IF NOT EXISTS idx_produto_tratamento ON med.produto (tratamento_id);
CREATE INDEX IF NOT EXISTS idx_produto_usuario ON med.produto (usuario_id);

-- RegistroDeUso — Arquétipo B, série de doses APPEND-ONLY: nunca UPDATE nem DELETE.
-- `usado_em` (não `criado_em`) é quem posiciona a dose na linha clínica (doc 03 §5.2).
CREATE TABLE IF NOT EXISTS med.registro_uso (
  id          UUID PRIMARY KEY,
  usuario_id  UUID NOT NULL,
  produto_id  UUID NOT NULL REFERENCES med.produto (id) ON DELETE CASCADE,
  quantidade  NUMERIC(10, 3) NOT NULL,
  unidade     TEXT NOT NULL,
  via         TEXT NOT NULL,
  usado_em    TIMESTAMPTZ NOT NULL DEFAULT now(),
  observacoes TEXT,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_registro_uso_quantidade CHECK (quantidade >= 0),
  CONSTRAINT ck_registro_uso_unidade CHECK (
    unidade IN ('MG', 'ML', 'GOTAS', 'GRAMA', 'UNIDADE', 'PUFF', 'OUTRA')
  ),
  CONSTRAINT ck_registro_uso_via CHECK (
    via IN ('ORAL', 'SUBLINGUAL', 'INALADA', 'TOPICA', 'OUTRA')
  )
);
CREATE INDEX IF NOT EXISTS idx_registro_uso_produto ON med.registro_uso (produto_id, usado_em DESC);
CREATE INDEX IF NOT EXISTS idx_registro_uso_usuario ON med.registro_uso (usuario_id);

-- Down Migration

DROP TABLE IF EXISTS med.registro_uso;
DROP TABLE IF EXISTS med.produto;
DROP TABLE IF EXISTS med.tratamento;
DROP SCHEMA IF EXISTS med;
