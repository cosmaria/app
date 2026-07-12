-- Migração 019 — Sintomas Diários (linha de base) e Efeitos do COSMARIA Med.
-- Doc 03 §5.3, §5.5. Executada por `db:migrate`.
--
-- Ambas são séries APPEND-ONLY (Arquétipo B): nunca UPDATE nem DELETE. O sintoma diário é
-- independente de uso (sustenta a visão longitudinal); o efeito ancora numa dose (0—N).

-- Up Migration

-- RegistroDeSintomaDiario — check-in de bem-estar, todas as dimensões opcionais (0–10),
-- mas ao menos uma preenchida (a aplicação garante). `registrado_em` posiciona o ponto.
CREATE TABLE IF NOT EXISTS med.sintoma_diario (
  id            UUID PRIMARY KEY,
  usuario_id    UUID NOT NULL,
  humor         SMALLINT,
  ansiedade     SMALLINT,
  dor           SMALLINT,
  sono          SMALLINT,
  apetite       SMALLINT,
  registrado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  observacoes   TEXT,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_sintoma_humor CHECK (humor IS NULL OR humor BETWEEN 0 AND 10),
  CONSTRAINT ck_sintoma_ansiedade CHECK (ansiedade IS NULL OR ansiedade BETWEEN 0 AND 10),
  CONSTRAINT ck_sintoma_dor CHECK (dor IS NULL OR dor BETWEEN 0 AND 10),
  CONSTRAINT ck_sintoma_sono CHECK (sono IS NULL OR sono BETWEEN 0 AND 10),
  CONSTRAINT ck_sintoma_apetite CHECK (apetite IS NULL OR apetite BETWEEN 0 AND 10),
  -- Ao menos uma dimensão informada — um check-in vazio é ruído.
  CONSTRAINT ck_sintoma_ao_menos_uma CHECK (
    num_nonnulls(humor, ansiedade, dor, sono, apetite) >= 1
  )
);
CREATE INDEX IF NOT EXISTS idx_sintoma_usuario
  ON med.sintoma_diario (usuario_id, registrado_em DESC);

-- RegistroDeEfeito — positivo/adverso de uma dose (0—N por dose).
CREATE TABLE IF NOT EXISTS med.efeito (
  id              UUID PRIMARY KEY,
  usuario_id      UUID NOT NULL,
  registro_uso_id UUID NOT NULL REFERENCES med.registro_uso (id) ON DELETE CASCADE,
  tipo            TEXT NOT NULL,
  descricao       TEXT NOT NULL,
  intensidade     SMALLINT,
  duracao_minutos INTEGER,
  registrado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_efeito_tipo CHECK (tipo IN ('POSITIVO', 'ADVERSO')),
  CONSTRAINT ck_efeito_intensidade CHECK (intensidade IS NULL OR intensidade BETWEEN 0 AND 10),
  CONSTRAINT ck_efeito_duracao CHECK (duracao_minutos IS NULL OR duracao_minutos >= 0)
);
CREATE INDEX IF NOT EXISTS idx_efeito_registro_uso ON med.efeito (registro_uso_id);
CREATE INDEX IF NOT EXISTS idx_efeito_usuario ON med.efeito (usuario_id);

-- Down Migration

DROP TABLE IF EXISTS med.efeito;
DROP TABLE IF EXISTS med.sintoma_diario;
