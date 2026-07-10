-- Migração 011 — Registro Ambiental: série temporal com VPD/PPFD/DLI (doc 02 §5.6).
-- Executada por `db:migrate`.

-- Up Migration

-- RegistroAmbiental — Arquétipo B (série temporal, doc 08 §6).
--
-- APPEND-ONLY por contrato: o repositório não expõe UPDATE nem DELETE. Corrigir uma
-- medição é registrar outra, com novo timestamp — reescrever o passado falsificaria a
-- série que a IA analisa.
--
-- `origem` existe desde o MVP mesmo com só 'MANUAL' em uso: quando entrarem sensores
-- IoT ou importação (doc 05 §16), nenhuma migração será necessária.
--
-- `vpd_kpa` e `dli` são DERIVADOS, calculados uma vez na criação e persistidos. As
-- fórmulas são determinísticas (doc 02 §5.6), então guardá-los não cria divergência —
-- só evita recalcular a série inteira a cada leitura ou comparação entre ciclos.
--
-- `planta_id` é nulo quando a medição é do ambiente (temperatura, umidade) e preenchido
-- quando é específica de uma planta (pH/EC do substrato dela). É o que permite o
-- "check-in diário único" (doc 02 §4) sem duplicar a leitura de ar por planta.
CREATE TABLE IF NOT EXISTS grow.registro_ambiental (
  id                UUID PRIMARY KEY,
  usuario_id        UUID NOT NULL,
  ciclo_id          UUID NOT NULL REFERENCES grow.ciclo_cultivo (id) ON DELETE CASCADE,
  planta_id         UUID REFERENCES grow.planta (id) ON DELETE CASCADE,
  registrado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  origem            TEXT NOT NULL DEFAULT 'MANUAL',

  temperatura_c     NUMERIC(5, 2),
  umidade_relativa  NUMERIC(5, 2),
  ph                NUMERIC(4, 2),
  ec                NUMERIC(6, 3),
  ppfd              NUMERIC(7, 2),
  horas_de_luz      NUMERIC(4, 2),

  vpd_kpa           NUMERIC(6, 3),
  dli               NUMERIC(7, 3),

  observacoes       TEXT,

  CONSTRAINT ck_registro_origem CHECK (origem IN ('MANUAL', 'SENSOR', 'IMPORTADO')),
  -- Faixas físicas, não agronômicas: rejeitam ruído de sensor, nunca opinam sobre o que
  -- é "saudável" — os limiares por fase pertencem ao Motor de Alertas da IA (doc 05).
  CONSTRAINT ck_registro_umidade CHECK (umidade_relativa IS NULL OR (umidade_relativa >= 0 AND umidade_relativa <= 100)),
  CONSTRAINT ck_registro_ph CHECK (ph IS NULL OR (ph >= 0 AND ph <= 14)),
  CONSTRAINT ck_registro_horas_de_luz CHECK (horas_de_luz IS NULL OR (horas_de_luz >= 0 AND horas_de_luz <= 24)),
  CONSTRAINT ck_registro_ppfd CHECK (ppfd IS NULL OR ppfd >= 0),
  CONSTRAINT ck_registro_ec CHECK (ec IS NULL OR ec >= 0),
  -- Um check-in sem nenhuma medição é ruído, não dado.
  CONSTRAINT ck_registro_alguma_medicao CHECK (
    temperatura_c IS NOT NULL OR umidade_relativa IS NOT NULL OR ph IS NOT NULL
    OR ec IS NOT NULL OR ppfd IS NOT NULL OR horas_de_luz IS NOT NULL
  )
);

-- Leitura dominante: a série de um ciclo, do mais recente ao mais antigo.
-- Também é a chave natural do particionamento temporal futuro (doc 08 §6).
CREATE INDEX IF NOT EXISTS idx_registro_ciclo_tempo
  ON grow.registro_ambiental (ciclo_id, registrado_em DESC);
-- Série de uma planta específica (pH/EC do substrato dela).
CREATE INDEX IF NOT EXISTS idx_registro_planta
  ON grow.registro_ambiental (planta_id) WHERE planta_id IS NOT NULL;

-- Down Migration

DROP TABLE IF EXISTS grow.registro_ambiental;
