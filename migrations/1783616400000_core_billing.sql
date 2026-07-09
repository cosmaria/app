-- Migração 006 — Billing & Premium (doc 07, doc 08 §12.6).
-- Executada por `db:migrate`.

-- Up Migration

-- AssinaturaPremium — 1—1 com a Conta. A assinatura é da plataforma, não de um app:
-- não existe coluna de "app", por decisão (doc 07 §5).
-- Nenhum valor monetário mora aqui: preço é preco_regional, desconto é cupom.
CREATE TABLE IF NOT EXISTS core.assinatura_premium (
  id                 UUID PRIMARY KEY,
  usuario_id         UUID NOT NULL UNIQUE REFERENCES core.usuario (id) ON DELETE CASCADE,
  plano              TEXT NOT NULL DEFAULT 'GRATUITO',
  status             TEXT NOT NULL DEFAULT 'ATIVA',
  moeda              TEXT,
  ciclo_de_cobranca  TEXT,
  cupom_id           UUID,
  preco_regional_id  UUID,
  vigente_ate        TIMESTAMPTZ,
  iniciada_em        TIMESTAMPTZ,
  cancelada_em       TIMESTAMPTZ,
  criado_em          TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- LimiteDePlano — Arquétipo D (Configuração). O valor NUNCA é constante de código:
-- ajustá-lo é um UPDATE, não um deploy (doc 07, decisão consolidada #1).
-- valor NULL = ilimitado.
CREATE TABLE IF NOT EXISTS core.limite_de_plano (
  id          UUID PRIMARY KEY,
  chave       TEXT NOT NULL,
  plano       TEXT NOT NULL,
  valor       INTEGER,
  vigente_de  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_limite_chave_plano UNIQUE (chave, plano)
);

CREATE TABLE IF NOT EXISTS core.cupom_ou_promocao (
  id               UUID PRIMARY KEY,
  codigo           TEXT NOT NULL UNIQUE,
  tipo_de_desconto TEXT NOT NULL,
  valor            INTEGER NOT NULL,
  moeda            TEXT,
  valido_de        TIMESTAMPTZ NOT NULL DEFAULT now(),
  valido_ate       TIMESTAMPTZ,
  usos_maximos     INTEGER,
  usos_realizados  INTEGER NOT NULL DEFAULT 0,
  ativo            BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS core.periodo_gratuito_configuracao (
  id            UUID PRIMARY KEY,
  plano         TEXT NOT NULL UNIQUE,
  duracao_dias  INTEGER NOT NULL DEFAULT 0,
  ativo         BOOLEAN NOT NULL DEFAULT false
);

-- PrecoRegional — preço por país/moeda desde o dia 1 (i18n, doc 07 §9.1).
CREATE TABLE IF NOT EXISTS core.preco_regional (
  id             UUID PRIMARY KEY,
  pais           TEXT NOT NULL,
  moeda          TEXT NOT NULL,
  plano          TEXT NOT NULL,
  ciclo          TEXT NOT NULL,
  valor_centavos INTEGER NOT NULL,
  CONSTRAINT uq_preco_pais_plano_ciclo UNIQUE (pais, plano, ciclo)
);

-- FKs da assinatura para o catálogo de configuração (aditivas, nunca destrutivas).
ALTER TABLE core.assinatura_premium
  ADD CONSTRAINT fk_assinatura_cupom
  FOREIGN KEY (cupom_id) REFERENCES core.cupom_ou_promocao (id) ON DELETE SET NULL;
ALTER TABLE core.assinatura_premium
  ADD CONSTRAINT fk_assinatura_preco_regional
  FOREIGN KEY (preco_regional_id) REFERENCES core.preco_regional (id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- Dados de CONFIGURAÇÃO (não são seed de desenvolvimento — são a política vigente).
-- ---------------------------------------------------------------------------

-- Limite do plano gratuito: 2 ambientes simultâneos no Grow (doc 07 §9, valor inicial
-- explicitamente revisável com dado real de uso). Premium = ilimitado (NULL).
-- Histórico e ciclos são ilimitados nos DOIS planos, por isso não têm linha aqui:
-- limite ausente significa ilimitado, e capar histórico é proibido (doc 07 §4).
INSERT INTO core.limite_de_plano (id, chave, plano, valor) VALUES
  ('11111111-0000-4000-8000-000000000001', 'grow.ambientes_simultaneos', 'GRATUITO', 2),
  ('11111111-0000-4000-8000-000000000002', 'grow.ambientes_simultaneos', 'PREMIUM',  NULL)
ON CONFLICT (chave, plano) DO NOTHING;

-- Trial nasce DESLIGADO: se e quando existir período gratuito é decisão de negócio,
-- não de arquitetura (doc 07 §9.1). Ligar = UPDATE, sem desenvolvimento.
INSERT INTO core.periodo_gratuito_configuracao (id, plano, duracao_dias, ativo) VALUES
  ('22222222-0000-4000-8000-000000000001', 'PREMIUM', 0, false)
ON CONFLICT (plano) DO NOTHING;

-- Nenhum PrecoRegional é inserido: valor de preço é decisão comercial, jamais versionada
-- em migration (doc 07 §9.1). Sem preço configurado, o upgrade recusa com
-- PRECO_NAO_CONFIGURADO em vez de arbitrar um valor.

-- Down Migration

ALTER TABLE core.assinatura_premium DROP CONSTRAINT IF EXISTS fk_assinatura_preco_regional;
ALTER TABLE core.assinatura_premium DROP CONSTRAINT IF EXISTS fk_assinatura_cupom;
DROP TABLE IF EXISTS core.preco_regional;
DROP TABLE IF EXISTS core.periodo_gratuito_configuracao;
DROP TABLE IF EXISTS core.cupom_ou_promocao;
DROP TABLE IF EXISTS core.limite_de_plano;
DROP TABLE IF EXISTS core.assinatura_premium;
