BEGIN;

CREATE EXTENSION IF NOT EXISTS lakebase_text CASCADE;

CREATE TABLE IF NOT EXISTS workspace_projects (
  id text PRIMARY KEY,
  organization_id text NOT NULL DEFAULT 'single-operator',
  name text NOT NULL,
  industry text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  status text NOT NULL,
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workspace_projects_org_updated_idx
  ON workspace_projects (organization_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS search_documents (
  id text PRIMARY KEY,
  organization_id text NOT NULL DEFAULT 'single-operator',
  project_id text NOT NULL REFERENCES workspace_projects(id) ON DELETE CASCADE,
  source_type text NOT NULL CHECK (source_type IN ('project', 'source', 'asset')),
  source_id text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  search_tsv tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B')
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, source_type, source_id)
);

CREATE INDEX IF NOT EXISTS search_documents_scope_idx
  ON search_documents (organization_id, project_id, source_type);

-- Immediate fallback while the corpus is empty or before the BM25 index is
-- built. Run drizzle/build-lakebase-search.sql after initial data ingestion.
CREATE INDEX IF NOT EXISTS search_documents_fts_gin_idx
  ON search_documents USING gin (search_tsv);

COMMIT;
