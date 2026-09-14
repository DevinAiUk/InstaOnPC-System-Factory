# InstaOnPC System Factory v1

Private campaign workspace and Local Lead Engine factory. See [v1 operator and production handoff](docs/V1-RELEASE.md) for current setup, functionality, connection requirements and verification.

This fork uses the Sites/Vinext Worker runtime with durable D1 storage. Run `npm ci`, `npm run lint`, `npm test`, and `npm run build`. For built-runtime HTTP verification, run `node scripts/verify-runtime.mjs`. Live AI requires a server-side OpenAI key.

---

## Original project documentation

# InstaOnPC System Factory

A responsive Next.js + TypeScript + Tailwind operator workspace for turning a business intake into a reviewed Local Lead Engine delivery package. Neutral surfaces, a dark sidebar and a teal accent. No generic AI landing page.

## Run locally

Requires Node.js 22+ and npm.

```bash
cd system-factory
npm ci
npm run dev
```

Open http://localhost:3001. Three fictional projects seed automatically on first access. New projects and edits persist across refreshes and restarts in `.factory-data/workspace.json`. No database or AI key is needed for mock mode.

```bash
npm test
npm run lint
npm run build
# For a loopback-only production smoke test:
FACTORY_LOCAL_ONLY=true npm start
```

For a hosted single-operator instance, use a durable disk and set `FACTORY_ACCESS_PASSWORD` in the host's secret manager. Sign in as `operator`. Without a password the production server fails closed. Use HTTPS. Do not set the local-only override on an exposed host.

## What works

- Guided intake with field validation, project search, dashboard, missing-input review and a bounded public HTML scan.
- Exact weighted 0–100 opportunity scores, three ranked alternatives, rationale, adjustable assumptions and selection.
- Eight named Manus-style skill generators, plus offer, workflow, outreach, service content, SOP and reporting drafts.
- Editable modules with owners, next actions, approval/rejection, fact locks, module locks, version history and targeted regeneration.
- Source ledger, approval gates and humanization; no invented web audits or promised outcomes.
- 30/60/90-day task ownership and completion; baseline/current result logging with sources and truthful change calculations.
- Real ZIP, Markdown, CSV, workspace JSON and workflow specification downloads. Printable client document for Save as PDF.
- Shared voice/output/intake controls, manifest and SHA-256 checksums in the seven-folder export bundle.
- Explicit mock adapters for HubSpot, Drive, Docs, Notion, Make, n8n and Zapier. No outbound delivery, sending, publishing or activation.
- All core routes, loading/error/empty states, responsive navigation and keyboard focus states.

## Operator walkthrough

1. Create a project with a business name, industry, location, services and objective.
2. Review the intake; scan its public website or paste approved source text. Approve the source in Business Intelligence.
3. Review the revenue-leak audit and choose an opportunity. Adjust score assumptions if needed.
4. Generate/review assets in System Builder. Lock business facts and any finished modules.
5. Edit a skill in Skill Studio, save a version and approve its draft. Regenerate individual modules to preserve unrelated edits.
6. In Outreach/Content Studio, regenerate after approving evidence, review the source references and humanize before approval.
7. Review workflow field maps, consent, disclosure, failure handling and tests. The specification remains inactive.
8. Assign the 90-day roadmap, record baselines and review reporting.
9. Export the draft delivery ZIP, inspect its manifest and checksums, then review with the client.

## Routes and architecture

`/` dashboard; `/projects`; `/projects/new`; `/settings`.

`/projects/[id]` overview plus `/intake`, `/intelligence`, `/audit`, `/opportunities`, `/offer`, `/system`, `/skills`, `/workflows`, `/outreach`, `/content`, `/visibility`, `/roadmap`, `/reporting`, `/export`.

- `src/components/factory/`: shared shell, intake, workspace views and module editor.
- `src/lib/factory/`: data model, deterministic generators, persistent repository, validation, scanner and exports.
- `src/app/api/projects/`: project CRUD and validated action/scan/download endpoints.
- `src/lib/integrations/adapters.ts`: external adapter contracts with intentionally blocked writes.
- `docs/schema.sql`: all requested database entities and relationships for the PostgreSQL integration phase.

## Practical limits

This is a functional single-operator MVP with mock generation and integrations. It is not a verified multi-tenant production service. The disk repository requires a single writer process; deploy behind private access on a durable volume. The included database schema is a future integration artifact, not a running database connection. Automated claim checks are a first pass and cannot establish factual entailment; operator fact review is required.

Public scanning does not execute JavaScript, follow redirects or inspect protected/GBP/social content. Network-dependent scan success depends on the host. Make exports are implementation specifications, not native import-tested blueprints. Google Docs, Drive and Notion delivery are mock adapters. PDF output uses the browser print dialog. No live deployment or external business-system mutation is implied by an approved module.

Expansion into e-commerce, authority content and operations templates is deferred until three real manual client runs pass review. Fictional demos never count.

See [Integration instructions](docs/INTEGRATIONS.md), [Source reconciliation](docs/SOURCE-RECONCILIATION.md), and [QA report](docs/QA.md).

For the staged Lakebase Postgres and BM25 search migration, see
[Neon production handoff](docs/NEON.md). Neon uses Lakebase Search rather than
the deprecated `pg_search` preload for new projects.
