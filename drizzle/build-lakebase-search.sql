-- Run with DATABASE_URL_UNPOOLED after initial project/source/asset ingestion.
-- Lakebase BM25 computes corpus statistics when the index is built.
CREATE INDEX IF NOT EXISTS search_documents_bm25
  ON search_documents
  USING lakebase_bm25 (search_tsv)
  WITH (default_limit = 20);

ANALYZE search_documents;
