# Integration handoff

The delivered application runs as a single-operator Next.js workspace. Its default generator is deterministic and uses guided intake plus manually approved sources. In hosted environments, configure `DATABASE_URL` to use Neon-backed persistence. Without it, local development and tests use the file adapter. Live integrations are intentionally stubs: ChatGPT connector authorization does not transfer into this app.

## Data repository

`src/lib/factory/repository.ts` selects Neon whenever `DATABASE_URL` is configured and uses optimistic revisions to prevent silent concurrent overwrites. An empty database is initialized with the workspace table and fictional demos. `src/lib/factory/store.ts` remains the local/test adapter and writes `.factory-data/workspace.json`; it is never used for hosted persistence when Neon is configured. No customer data should be committed to Git.

`docs/schema.sql` covers User, Organization, Project, BusinessProfile, SourceAsset, EvidenceItem, FactLock, Opportunity, Offer, Recommendation, SkillFile, WorkflowSpec, ContentAtom, ContentAsset, Approval, Integration, ExportPackage, KPIBaseline, KPIReport and AuditLog. The original Drizzle schema remains as a reference. The PostgreSQL schema has not been migrated or tested against a hosted database. Integrate it behind the repository interface with transactional optimistic revisions and authenticated organization scoping.

## Access

For a hosted operator instance, set `FACTORY_ACCESS_PASSWORD` to a strong secret supplied by your secret manager. HTTP Basic authentication uses username `operator`; terminate TLS at the trusted host. All pages and API routes pass through the same middleware. `npm start` fails closed with HTTP 503 without a password unless `FACTORY_LOCAL_ONLY=true` is explicitly set. That local-only override is for loopback testing; never expose it publicly. This is not multi-user authentication, SSO, or tenant isolation.

## Public-site scan

The operator explicitly starts a scan. The scanner accepts one public HTTPS domain, resolves public IPv4 addresses and pins the request to a checked address, rejects credentials and custom ports, does not follow redirects, limits content to 500 KB and limits duration to 10 seconds. It only accepts HTML. Captured text enters the source ledger unapproved. It does not execute JavaScript, scrape protected pages, inspect GBP/socials or fabricate performance observations. Paste an approved source when the page is inaccessible. Network-dependent scan success must be verified in the deployment environment.

## Mock adapters

`src/lib/integrations/adapters.ts` exposes `prepare(project)` and `execute(plan)`. Preparation is local. Execution always rejects. Downloaded Make/n8n/Zapier files are implementation specifications, not executable native blueprints. The UI and files identify that distinction.

To implement a live connector:

1. Resolve the account, scopes and exact destination using server-held managed credentials.
2. Validate the submitted schema and source permissions.
3. Display the actual destination, fields and payload to the operator for review.
4. Persist approval bound to a hash of the payload and destination; invalidate after edits.
5. Claim an idempotency record before the external write.
6. Execute only the approved action; verify the provider response and read back the created object.
7. Record a redacted audit event with provider object ID, status and correlation ID.
8. Retry 429/5xx at most three times with backoff; route auth failures and exhausted retries to a human.

### HubSpot

Map consented intake email to `contact.email`, verified name to `contact.firstname`, and service/owner to verified portal properties. Do not treat a public phone number or social profile as permission to contact. Discover property IDs, enum values and object write permissions before implementation. Never create a contact or company from inferred personal data. During this build the ChatGPT HubSpot connector reported contact/deal read/write access, but company writes required reauthorization and portal onboarding was incomplete. No CRM records were read into this app or modified.

### Drive / Docs / Notion

Retain `/skills`, `/workspace`, `/automation`, `/baseline`, `/documentation`, `/portfolio`, `/exports`. Prepare the folder manifest, confirm the target folder and permissions, then upload/create reviewed files. Google Docs and Notion adapters must convert structured headings and paragraphs rather than claiming Markdown was already delivered. Verify file IDs and links after actual writes. The provided Drive folder returned no files during this build.

### AI generation

The original AI SDK code is retained for reference but is not called by default. A production LLM adapter must receive approved source excerpts as data, use a bounded structured output schema, recompute scores server-side, preserve fact locks, validate the output, and return a draft with evidence and uncertainty. Never enable website URL-only hallucinated research. Model/API credentials stay server-side. Humanization must preserve exact prices, numeric values, names, links, keywords, quotation and certainty; semantic review is required beyond automated text checks.

### LooperAI handoff

The supplied LooperAI source uses separate ingestion, maker/checker humanization, tenant context and publication handlers. This MVP carries over source traceability, separate review state and bounded recovery. It does not invoke LooperAI's immediate ingestion trigger, recursive humanizer, Inngest jobs or outbound publishing. Future connection requires an explicit adapter contract and payload-bound approval.
