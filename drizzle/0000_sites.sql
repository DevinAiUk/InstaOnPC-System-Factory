CREATE TABLE IF NOT EXISTS factory_documents (id TEXT PRIMARY KEY, kind TEXT NOT NULL, payload TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS factory_documents_kind ON factory_documents(kind,updated_at);
CREATE TABLE IF NOT EXISTS factory_locks (id TEXT PRIMARY KEY, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS factory_limits (id TEXT PRIMARY KEY, count INTEGER NOT NULL);
