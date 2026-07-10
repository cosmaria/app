-- Migração 014 — Tarefas e Lembretes (doc 02 §5.10, doc 08 §Tarefa — Arquétipo A).
-- Executada por `db:migrate`.
--
-- Tarefa é um PLANO DE AÇÃO operacional e mutável (o oposto do manejo, que é histórico
-- imutável): nasce pendente, pode ser editada e é concluída. Recorrência em dias; a
-- próxima ocorrência é gerada pela aplicação ao concluir. `origem = IA` fica modelada,
-- mas a criação a partir de `AlertaGerado` (doc 05) só existe quando a IA existir.

-- Up Migration

CREATE TABLE IF NOT EXISTS grow.tarefa (
  id               UUID PRIMARY KEY,
  usuario_id       UUID NOT NULL,
  ciclo_id         UUID NOT NULL REFERENCES grow.ciclo_cultivo (id) ON DELETE CASCADE,
  planta_id        UUID REFERENCES grow.planta (id) ON DELETE CASCADE,
  titulo           TEXT NOT NULL,
  tipo             TEXT NOT NULL,
  origem           TEXT NOT NULL,
  status           TEXT NOT NULL,
  prevista_para    TIMESTAMPTZ,
  recorrencia_dias INTEGER,
  concluida_em     TIMESTAMPTZ,
  alerta_id        UUID,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_tarefa_tipo CHECK (
    tipo IN ('REGA', 'FERTILIZACAO', 'PODA', 'TRANSPLANTE', 'INSPECAO', 'OUTRO')
  ),
  CONSTRAINT ck_tarefa_origem CHECK (origem IN ('MANUAL', 'IA')),
  CONSTRAINT ck_tarefa_status CHECK (status IN ('PENDENTE', 'CONCLUIDA')),
  -- Recorrência de zero dia seria um agendamento infinito no mesmo instante.
  CONSTRAINT ck_tarefa_recorrencia CHECK (recorrencia_dias IS NULL OR recorrencia_dias >= 1),
  -- Uma tarefa concluída tem data de conclusão; uma pendente não.
  CONSTRAINT ck_tarefa_conclusao CHECK (
    (status = 'CONCLUIDA') = (concluida_em IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS idx_tarefa_usuario ON grow.tarefa (usuario_id);
CREATE INDEX IF NOT EXISTS idx_tarefa_ciclo ON grow.tarefa (ciclo_id);
-- Pendentes por data prevista: a agenda do usuário e a base dos lembretes.
CREATE INDEX IF NOT EXISTS idx_tarefa_pendentes
  ON grow.tarefa (usuario_id, prevista_para) WHERE status = 'PENDENTE';

-- Down Migration

DROP TABLE IF EXISTS grow.tarefa;
