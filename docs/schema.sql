-- PostgreSQL integration schema. Not used by the single-operator local adapter.
-- Every project belongs to an organization; enforce membership in the authenticated API.
BEGIN;
CREATE TABLE organizations (id uuid PRIMARY KEY, name text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE users (id uuid PRIMARY KEY, organization_id uuid NOT NULL REFERENCES organizations(id), email text NOT NULL UNIQUE, role text NOT NULL CHECK (role IN ('owner','operator','reviewer')));
CREATE TABLE projects (id uuid PRIMARY KEY, organization_id uuid NOT NULL REFERENCES organizations(id), owner_id uuid NOT NULL REFERENCES users(id), name text NOT NULL, status text NOT NULL DEFAULT 'intake', revision integer NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX projects_org_idx ON projects(organization_id);
CREATE TABLE business_profiles (id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, version integer NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', payload jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (project_id));
CREATE INDEX business_profiles_project_idx ON business_profiles(project_id);
CREATE TABLE source_assets (id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, version integer NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', payload jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX source_assets_project_idx ON source_assets(project_id);
CREATE TABLE evidence_items (id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, version integer NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', payload jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX evidence_items_project_idx ON evidence_items(project_id);
CREATE TABLE fact_locks (id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, version integer NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', payload jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX fact_locks_project_idx ON fact_locks(project_id);
CREATE TABLE opportunities (id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, version integer NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', payload jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX opportunities_project_idx ON opportunities(project_id);
CREATE TABLE offers (id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, version integer NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', payload jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX offers_project_idx ON offers(project_id);
CREATE TABLE recommendations (id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, version integer NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', payload jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX recommendations_project_idx ON recommendations(project_id);
CREATE TABLE skill_files (id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, version integer NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', payload jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX skill_files_project_idx ON skill_files(project_id);
CREATE TABLE workflow_specs (id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, version integer NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', payload jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX workflow_specs_project_idx ON workflow_specs(project_id);
CREATE TABLE content_atoms (id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, version integer NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', payload jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX content_atoms_project_idx ON content_atoms(project_id);
CREATE TABLE content_assets (id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, version integer NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', payload jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX content_assets_project_idx ON content_assets(project_id);
CREATE TABLE approvals (id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, version integer NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', payload jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX approvals_project_idx ON approvals(project_id);
CREATE TABLE integrations (id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, version integer NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', payload jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX integrations_project_idx ON integrations(project_id);
CREATE TABLE export_packages (id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, version integer NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', payload jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX export_packages_project_idx ON export_packages(project_id);
CREATE TABLE kpi_baselines (id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, version integer NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', payload jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX kpi_baselines_project_idx ON kpi_baselines(project_id);
CREATE TABLE kpi_reports (id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, version integer NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', payload jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX kpi_reports_project_idx ON kpi_reports(project_id);
CREATE TABLE audit_logs (id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, version integer NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', payload jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX audit_logs_project_idx ON audit_logs(project_id);
CREATE TABLE source_atom_links (atom_id uuid NOT NULL REFERENCES content_atoms(id), source_id uuid NOT NULL REFERENCES source_assets(id), source_location text NOT NULL, exact_fact text NOT NULL, PRIMARY KEY(atom_id, source_id));
CREATE TABLE asset_versions (id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id), asset_id uuid NOT NULL, version integer NOT NULL, body text NOT NULL, approval_status text NOT NULL DEFAULT 'draft', saved_at timestamptz NOT NULL DEFAULT now(), UNIQUE(asset_id,version));
-- Use optimistic revisions with transactional writes. Never store credentials in payloads.
-- Production service must scope every query by authenticated organization membership.
COMMIT;
