-- Migração 008 — Armazenamento de Mídia compartilhado (doc 04 §7.1/§16, doc 08 §12.1).
-- Executada por `db:migrate`.

-- Up Migration

-- Midia — capacidade do CORE, não do Grow: `Planta` (Grow) e `Tratamento`/exame (Med)
-- anexam a mesma entidade, e nenhuma lógica de armazenamento é duplicada entre os apps.
-- Referência polimórfica por (modulo, tipo_entidade, entidade_id): sem FK entre schemas,
-- seguindo o Padrão de Referência Cross-Módulo (doc 08 §11).
-- O binário NUNCA entra no banco: só a chave no armazenamento de objetos (doc 04 §16).
CREATE TABLE IF NOT EXISTS core.midia (
  id                     UUID PRIMARY KEY,
  usuario_id             UUID NOT NULL REFERENCES core.usuario (id) ON DELETE CASCADE,
  modulo                 TEXT NOT NULL,
  tipo_entidade          TEXT NOT NULL,
  entidade_id            TEXT,
  tipo                   TEXT NOT NULL,
  nome_arquivo           TEXT NOT NULL,
  tipo_conteudo          TEXT NOT NULL,
  tamanho_bytes          BIGINT NOT NULL,
  chave_de_armazenamento TEXT NOT NULL UNIQUE,
  criado_em              TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_midia_tamanho CHECK (tamanho_bytes > 0)
);

-- Listagem das mídias anexadas a uma entidade de qualquer módulo.
CREATE INDEX IF NOT EXISTS idx_midia_entidade
  ON core.midia (modulo, tipo_entidade, entidade_id);
-- Expurgo por Conta (exclusão LGPD) e listagem do dono.
CREATE INDEX IF NOT EXISTS idx_midia_usuario
  ON core.midia (usuario_id);

-- Limite de tamanho de arquivo por plano (doc 07 §8, categoria Armazenamento).
-- É a tradução verificável de "resolução padrão" (gratuito) vs. "alta resolução sem
-- limite" (Premium): resolução exigiria decodificar a imagem no servidor, tamanho não.
-- Como todo LimiteDePlano, é DADO — ajustar é UPDATE, não deploy. NULL = ilimitado.
INSERT INTO core.limite_de_plano (id, chave, plano, valor) VALUES
  ('33333333-0000-4000-8000-000000000001', 'core.midia_tamanho_maximo_bytes', 'GRATUITO', 5242880),
  ('33333333-0000-4000-8000-000000000002', 'core.midia_tamanho_maximo_bytes', 'PREMIUM',  NULL)
ON CONFLICT (chave, plano) DO NOTHING;

-- Down Migration

DELETE FROM core.limite_de_plano WHERE chave = 'core.midia_tamanho_maximo_bytes';
DROP TABLE IF EXISTS core.midia;
