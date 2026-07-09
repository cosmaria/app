-- Migração 007 — Notificações: preferências, Modo Discreto e Central (doc 04 §15, doc 10).
-- Executada por `db:migrate`.

-- Up Migration

-- PreferenciaDeNotificacao — Arquétipo D (Configuração), uma linha por Usuário.
-- `canais_por_categoria` é JSONB: categorias novas (Grow, Med, Comunidade) entram sem
-- migração destrutiva. Categoria ausente cai no padrão definido no domínio.
-- `fuso_horario` nasce 'UTC': supor o fuso do mercado inicial seria hardcode (doc 00, i18n).
CREATE TABLE IF NOT EXISTS core.preferencia_de_notificacao (
  id                      UUID PRIMARY KEY,
  usuario_id              UUID NOT NULL UNIQUE REFERENCES core.usuario (id) ON DELETE CASCADE,
  canais_por_categoria    JSONB NOT NULL DEFAULT '{}'::jsonb,
  modo_discreto           BOOLEAN NOT NULL DEFAULT false,
  silencio_inicio_minutos INTEGER,
  silencio_fim_minutos    INTEGER,
  fuso_horario            TEXT NOT NULL DEFAULT 'UTC',
  atualizado_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_silencio_inicio CHECK (silencio_inicio_minutos IS NULL OR (silencio_inicio_minutos >= 0 AND silencio_inicio_minutos < 1440)),
  CONSTRAINT ck_silencio_fim    CHECK (silencio_fim_minutos    IS NULL OR (silencio_fim_minutos    >= 0 AND silencio_fim_minutos    < 1440))
);

-- Notificacao — entidade descoberta na implementação (ver Catálogo de Domínio).
-- O doc 04 §15 exige que a notificação silenciada seja "registrada sem envio", e o doc 10
-- especifica a Central de Notificações: nenhum dos dois existe sem persistir a notificação.
-- Guarda as DUAS versões do conteúdo — a completa e a discreta (doc 01 §15).
CREATE TABLE IF NOT EXISTS core.notificacao (
  id                 UUID PRIMARY KEY,
  usuario_id         UUID NOT NULL REFERENCES core.usuario (id) ON DELETE CASCADE,
  categoria          TEXT NOT NULL,
  titulo             TEXT NOT NULL,
  corpo              TEXT NOT NULL,
  titulo_discreto    TEXT NOT NULL,
  corpo_discreto     TEXT NOT NULL,
  status             TEXT NOT NULL DEFAULT 'PENDENTE',
  canais_despachados TEXT[] NOT NULL DEFAULT '{}',
  criado_em          TIMESTAMPTZ NOT NULL DEFAULT now(),
  lida_em            TIMESTAMPTZ
);

-- Central de Notificações: lista do usuário, mais recentes primeiro.
CREATE INDEX IF NOT EXISTS idx_notificacao_usuario_criado
  ON core.notificacao (usuario_id, criado_em DESC);
-- Badge de não lidas: índice parcial, muito menor que o total de notificações.
CREATE INDEX IF NOT EXISTS idx_notificacao_nao_lidas
  ON core.notificacao (usuario_id) WHERE lida_em IS NULL;

-- Down Migration

DROP TABLE IF EXISTS core.notificacao;
DROP TABLE IF EXISTS core.preferencia_de_notificacao;
