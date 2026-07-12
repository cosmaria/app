-- Migração 022 — Comunidade: projeção de leitura de publicações (doc 06 §8, doc 04 §9.1).
-- Executada por `db:migrate`.
--
-- PRIMEIRO schema da Comunidade (doc 04 §16 — schema por módulo). Nenhuma FK atravessa
-- schema: `perfil_publico_id` referencia `core.perfil_publico` por ID, e `conteudo_id`
-- referencia o Ciclo (Grow) / Tratamento (Med) por ID — sempre sem integridade referencial
-- de banco (Padrão de Referência Cross-Módulo, doc 08 §11). A publicação é uma PROJEÇÃO
-- alimentada por evento; o conteúdo de origem nunca é lido daqui.

-- Up Migration

CREATE SCHEMA IF NOT EXISTS comunidade;

-- PublicaçãoComunidade — o registro projetado de `GrowlogPublicado` /
-- `PublicacaoComunidadeMedCriada`. Única por conteúdo de origem (modulo + conteudo_id):
-- reprojetar o mesmo conteúdo atualiza, não duplica (idempotência diante de reentrega).
CREATE TABLE IF NOT EXISTS comunidade.publicacao (
  id                UUID PRIMARY KEY,
  perfil_publico_id UUID NOT NULL,
  contexto          TEXT NOT NULL,
  modulo            TEXT NOT NULL,
  tipo_conteudo     TEXT NOT NULL,
  conteudo_id       UUID NOT NULL,
  escopo            TEXT NOT NULL,
  titulo            TEXT,
  resumo            TEXT,
  -- Parâmetros técnicos compartilhados (chave→valor), indexados pela busca estruturada.
  dimensoes         JSONB NOT NULL DEFAULT '{}'::jsonb,
  publicado_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_publicacao_contexto CHECK (contexto IN ('GROW', 'MED')),
  CONSTRAINT ck_publicacao_escopo CHECK (
    escopo IN ('PRIVADO', 'AMIGOS', 'SEGUIDORES', 'LINK', 'PUBLICO')
  ),
  -- Um conteúdo de origem tem no máximo uma publicação (doc 06 §12).
  CONSTRAINT uq_publicacao_conteudo UNIQUE (modulo, conteudo_id)
);

-- Feed escopado por contexto, mais recentes primeiro (doc 06 §2).
CREATE INDEX IF NOT EXISTS idx_publicacao_feed
  ON comunidade.publicacao (contexto, publicado_em DESC);
-- Publicações de um perfil (feed próprio, futura tela de perfil).
CREATE INDEX IF NOT EXISTS idx_publicacao_perfil
  ON comunidade.publicacao (perfil_publico_id);
-- Busca estruturada: containment (`dimensoes @> ...`) usa este índice; o `->> ILIKE`
-- do MVP ainda faz varredura, aceitável no volume atual (doc 06 §Riscos).
CREATE INDEX IF NOT EXISTS idx_publicacao_dimensoes
  ON comunidade.publicacao USING gin (dimensoes);

-- Down Migration

DROP TABLE IF EXISTS comunidade.publicacao;
DROP SCHEMA IF EXISTS comunidade;
