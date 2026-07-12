-- Migração 026 — Med: snapshot do Lote vinculado ao Produto (integração opt-in Grow↔Med).
-- Doc 03 §5.2/§18, doc 04 §23. A coluna `lote_id` já existia (inerte); agora ganha o
-- snapshot copiado do Grow no ato do vínculo, para o Med exibir a procedência sem ler o
-- schema do Grow. Sem FK (o Lote vive no schema grow — referência por ID, doc 08 §11).
-- Executada por `db:migrate`.

-- Up Migration

ALTER TABLE med.produto
  ADD COLUMN IF NOT EXISTS lote_snapshot JSONB;

-- Coerência: ou não há vínculo, ou há id E snapshot juntos.
ALTER TABLE med.produto
  ADD CONSTRAINT ck_produto_lote_vinculo
  CHECK ((lote_id IS NULL AND lote_snapshot IS NULL) OR (lote_id IS NOT NULL AND lote_snapshot IS NOT NULL));

-- Down Migration

ALTER TABLE med.produto DROP CONSTRAINT IF EXISTS ck_produto_lote_vinculo;
ALTER TABLE med.produto DROP COLUMN IF EXISTS lote_snapshot;
