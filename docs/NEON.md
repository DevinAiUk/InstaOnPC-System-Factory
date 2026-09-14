# Neon production handoff

The application uses the pooled `DATABASE_URL` for serverless query traffic and
the direct `DATABASE_URL_UNPOOLED` for Drizzle migrations. Keep both values in
the deployment secret manager; never commit them.

## Search architecture

Neon's deprecated `pg_search` preload is intentionally not enabled. New Neon
projects should use Lakebase Search:

- `lakebase_text` provides a `lakebase_bm25` index, BM25 relevance, and top-K
  pushdown while keeping standard `tsvector` data.
- A native GIN index is created as a bootstrap/fallback index.
- BM25 is built only after the first corpus is ingested because its corpus
  statistics are calculated at build time.
- Every query is scoped by `organization_id`; application authentication and
  organization authorization must be enforced before multi-tenant launch.
- Result ordering uses BM25 score followed by a stable ID tie-breaker.

## Apply on an isolated Neon branch

1. Rotate any connection string that was shared outside a secret manager.
2. Create a child branch from production and obtain its pooled and direct URLs.
3. Set `DATABASE_URL` and `DATABASE_URL_UNPOOLED` locally without printing them.
4. Apply `drizzle/0000_neon_workspace.sql` through the direct connection.
5. Ingest project, approved-source, and generated-asset documents.
6. Apply `drizzle/build-lakebase-search.sql` through the direct connection.
7. Verify tenant filtering, relevance, empty queries, punctuation, and top-50
   limits before promoting the migration.

The current JSON repository remains the active persistence adapter until its
data migration and transactional repository cutover are verified. The new
`/api/search?q=` route activates only when `DATABASE_URL` is configured and the
Lakebase migration has been applied.
