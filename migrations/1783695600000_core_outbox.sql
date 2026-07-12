-- Migração 028 — Core: outbox de entrega durável de eventos (doc 04 §9; doc 13 §16.1).
-- Transporte durável do barramento: `publicar()` grava aqui e devolve; o despachante
-- (OutboxDispatcher) entrega de forma assíncrona aos assinantes, com retry/backoff,
-- entrega isolada por assinante e dead-letter. NÃO é transacional com o write que o
-- originou (não há unit-of-work no MVP) — a atomicidade write↔outbox fica para a Fase B.
-- Executada por `db:migrate`.

-- Up Migration

CREATE TABLE IF NOT EXISTS core.outbox (
  id           UUID PRIMARY KEY,
  nome         TEXT NOT NULL,
  payload      JSONB NOT NULL,
  ocorrido_em  TIMESTAMPTZ NOT NULL,
  pendentes    JSONB NOT NULL,            -- string[] de assinanteIds ainda não entregues
  status       TEXT NOT NULL DEFAULT 'PENDENTE'
               CHECK (status IN ('PENDENTE', 'ENTREGUE', 'MORTO')),
  tentativas   INT NOT NULL DEFAULT 0,
  proxima_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  ultimo_erro  TEXT,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT now(),
  entregue_em  TIMESTAMPTZ
);

-- O polling do despachante busca só o que está devido: índice parcial nas linhas pendentes,
-- ordenado pela hora da próxima tentativa (backoff).
CREATE INDEX IF NOT EXISTS idx_outbox_devidos
  ON core.outbox (proxima_em)
  WHERE status = 'PENDENTE';

-- Down Migration

DROP TABLE IF EXISTS core.outbox;
