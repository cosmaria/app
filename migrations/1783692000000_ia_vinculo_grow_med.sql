-- Migração 027 — IA: registro de opt-in da correlação cruzada Grow×Med (doc 00, doc 05 §8).
-- A IA aprende o consentimento pelo evento `ProdutoVinculadoALote`/`ProdutoDesvinculadoDoLote`
-- (nunca lê o schema do Med, doc 04 §24). Guarda só a CHAVE do vínculo — nenhum dado clínico.
-- Executada por `db:migrate`. Referências por ID (doc 08 §11).

-- Up Migration

CREATE TABLE IF NOT EXISTS ia.vinculo_grow_med (
  usuario_id UUID NOT NULL,
  produto_id UUID NOT NULL,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (usuario_id, produto_id)
);
-- "Este usuário tem algum vínculo ativo?" — habilita a correlação cruzada.
CREATE INDEX IF NOT EXISTS idx_vinculo_grow_med_usuario
  ON ia.vinculo_grow_med (usuario_id);

-- Down Migration

DROP TABLE IF EXISTS ia.vinculo_grow_med;
