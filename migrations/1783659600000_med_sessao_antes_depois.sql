-- Migração 018 — Sessão Antes/Depois do COSMARIA Med (doc 03 §5.4).
-- Executada por `db:migrate`.
--
-- 0—1 com a dose: uma dose tem no máximo uma sessão (UNIQUE registro_uso_id). O "depois"
-- é monotônico (aplicação garante), e o par de intensidades sustenta a efetividade
-- percebida por dose/produto — o diferencial clínico central do Med.

-- Up Migration

CREATE TABLE IF NOT EXISTS med.sessao_antes_depois (
  id                   UUID PRIMARY KEY,
  usuario_id           UUID NOT NULL,
  registro_uso_id      UUID NOT NULL UNIQUE REFERENCES med.registro_uso (id) ON DELETE CASCADE,
  sintoma_alvo         TEXT NOT NULL,
  intensidade_antes    SMALLINT NOT NULL,
  intensidade_depois   SMALLINT,
  intervalo_minutos    INTEGER NOT NULL,
  registrada_depois_em TIMESTAMPTZ,
  criado_em            TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Escala 0–10 (doc 03 §5.4). `depois` é opcional até ser registrado.
  CONSTRAINT ck_sessao_intensidade_antes CHECK (intensidade_antes BETWEEN 0 AND 10),
  CONSTRAINT ck_sessao_intensidade_depois CHECK (
    intensidade_depois IS NULL OR intensidade_depois BETWEEN 0 AND 10
  ),
  CONSTRAINT ck_sessao_intervalo CHECK (intervalo_minutos >= 0),
  -- Depois preenchido <=> tem data do "depois" (coerência de estado).
  CONSTRAINT ck_sessao_depois CHECK (
    (intensidade_depois IS NOT NULL) = (registrada_depois_em IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS idx_sessao_usuario ON med.sessao_antes_depois (usuario_id);

-- Down Migration

DROP TABLE IF EXISTS med.sessao_antes_depois;
