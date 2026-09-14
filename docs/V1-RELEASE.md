# InstaOnPC System Factory v1

This release extends the original System Factory into a private campaign workspace. It is a single-operator application, not a multi-tenant CRM. The original project, intake, evidence, fact-lock, skill, workflow, content, roadmap, reporting and export routes remain available.

## Operator flow

1. Open **Campaign workspace**. Add a business, service area, and verified contact information. Optional dictation requires browser microphone support and permission.
2. Use **Find business details** for cited research. Confirm the match before applying suggestions; only empty contact fields change. Location is optional, rounded to approximately 1 km, and used only when you request lookup.
3. Choose a service, consultant name and Professional, Casual or Urgent tone. Urgent does not authorize invented scarcity or competitor claims.
4. Generate an assessment. Review strategy, outreach proposal and voice script. The completeness gauge measures field presence, not truth or predicted sales. Sentiment is an AI interpretation of supplied review entries; no reviews means no chart.
5. Copy one draft or all outputs. Saved lead history restores exact inputs and results without another AI request. History controls require explicit deletion confirmation. Up to 200 recent history entries are displayed.
6. Open CRM export. Choose a suggested Generic, HubSpot or Salesforce header preset, upload a template, or customize all 11 headers. Names must be unique. Custom CRM properties may need separate creation in the destination CRM. The download notification confirms download initiation and the mapping applied; browsers do not expose proof that a file finished saving to disk.
7. For a batch, upload a CSV with up to 25 leads, review guessed input mappings, save, and start. Each row is durably saved. Processing continues while the campaign workspace is open, including while viewing its other tabs. Closing the page pauses the driver; resume the saved batch on return. A failed row can be retried. Completion rate means generation completion, not sales conversion.
8. Download successful batch results as CSV, text or PDF. Drafts are never automatically sent.
9. Ask Factory opens the OpenAI assistant. When viewing a project, it receives that project's approved sources, fact locks, asset statuses and tasks. It cannot mutate data or send messages.

## Hosting and persistence

The private Sites deployment uses its provisioned D1 database and owner-only platform access. `FACTORY_HOST=sites` selects that deployment's authentication arrangement; do not set it on a standalone host. Sites protects the application before requests reach it. Keep the Site owner-private: this release has one shared operator workspace, not per-user tenancy.

Existing Neon project persistence remains available when `DATABASE_URL` is supplied. PostgreSQL migrations are preserved in `drizzle-neon/`; SQLite migrations for this Site live in `drizzle/`. This deployment does not copy, alter, or migrate the user's existing Neon data. Projects are seeded with fictional fixtures. Existing hosted source belongs to the original repository; v1 changes are isolated on the review branch and the private Site source fork.

Outside Sites, configure `FACTORY_ACCESS_PASSWORD` and durable storage. `FACTORY_LOCAL_ONLY` is only for local tests. The campaign features require D1 in this release; the original Next/Neon route is not a drop-in deployment target for campaign APIs.

## Required connections and launch gates

- `OPENAI_API_KEY`: a server-side secret. Enable OpenAI Developers to provision one securely, or use the host's secret settings. Never enter it in lead inputs, source control or chat. Until configured, generation, research and chat return clear connection-required errors. The fictional example is labeled and never presented as an AI call.
- `OPENAI_MODEL`: defaults to `gpt-5.5`. Use a Responses-compatible model available to your account. Requests use the official OpenAI JavaScript SDK, structured output validation and `store:false`.
- `FACTORY_WEBHOOK_ALLOWLIST`: comma-separated, exact HTTPS endpoint URLs. Empty means no external deliveries. Configure only intended CRM receivers. Redirects are not followed. The receiver must honor `Idempotency-Key`; timeout outcomes require receiver inspection before retry.
- `FACTORY_WEBHOOK_SECRET`: a separate random HMAC key for signed ingestion. Empty means the signed endpoint is disabled. Rotate in host settings. Do not reuse the operator password.
- The private Site's access gate also protects `/api/webhook-ingest`. A third-party automation cannot bypass that gate with HMAC alone. An approved authenticated gateway or a separately hosted ingress service is required for machine-to-machine ingestion. The in-app **Test local ingestion** exercises validation and durable deduplication using the operator session; it is explicitly a test path.
- Live OpenAI output quality, rate/account availability, browser microphone behavior and actual CRM delivery must be verified with configured accounts before calling the integration production-ready. No real prospect messages were sent during release verification.

## Webhook contract

`POST /api/webhook-ingest`

Headers: `Content-Type: application/json`, `X-Factory-Timestamp: <Unix seconds>`, `X-Factory-Signature: <hex HMAC-SHA256(secret, timestamp + '.' + exact raw body)>`.

The timestamp window is five minutes. `eventId` is a UUID and duplicate IDs are acknowledged without storing a second lead. A valid request stores the lead for operator review; it does not generate outreach or contact the prospect.

```json
{
  "schemaVersion": "1.0",
  "event": "lead.created",
  "eventId": "832f732c-b568-4f9c-9602-4aa55986dfbf",
  "lead": {
    "businessName": "Fictional Bayview Home Services",
    "city": "St. Petersburg, FL",
    "phone": "",
    "address": "",
    "website": "https://bayview.example",
    "rating": "",
    "reviews": "",
    "socials": "",
    "service": "AI Front Desk + Local Lead Engine",
    "agentName": "Devon",
    "introduction": "",
    "tone": "Professional"
  }
}
```

Outbound assessed-lead payloads use `event: lead.assessed` and a `fields` object keyed by the operator's reviewed CRM header mapping. The export modal prints that exact JSON before dispatch. Receipts store status and endpoint, not raw response bodies or authentication headers.

## v1 prompt reconciliation

The default first recommendation is AI Front Desk + Local Lead Engine for Tampa Bay appointment and service businesses. The first card is the required preset, not a claim of superior numeric ranking. The exact score weights remain 25/20/15/15/15/10; the supplied v1 definitions are urgency, value, implementation feasibility, staff readiness, defensibility/compliance, and evidence quality. Values remain operator-reviewable assumptions.

The three visible architecture subsystems are Local Visibility, Supervised AI Front Desk, and CRM Follow-Up. The four-stage operational handoff still makes human review visible. Existing eight skill identifiers and fact-lock controls are retained for compatibility with prior exports. The attached illustrative licensed-HVAC facts and prices are not treated as verified client facts. Proposed chat/escalation SLAs are pilot targets until measured. The existing preflight validates actual asset/evidence conditions; it does not invent 70 passing checks or imply that a green check proves deployment.

## Verification

- TypeScript compilation and 21 unit/API tests.
- Production Worker build.
- Built-runtime HTTP checks: dashboard and campaign rendering, project routes, durable demo seeding, campaign batch save/read, missing-key error state, ingestion deduplication, disallowed outbound URL rejection, chatbot configuration state, and workspace search.
- Original factory tests cover fact locks, selective regeneration, approvals, CSV formula protection, ZIP checksums, and draft-only mock adapters.
- No authenticated browser visual review or live OpenAI/CRM provider test has been claimed.

## Sources

- OpenAI SDK: https://developers.openai.com/api/reference/typescript
- Responses structured outputs: https://developers.openai.com/api/docs/guides/structured-outputs
- Web search: https://developers.openai.com/api/docs/guides/tools-web-search

## Rollback and operations

Keep the original production app unchanged until v1 connections are verified. Roll back the private Site to its previous saved version if a later release fails. Back up the D1 database before schema changes. Do not reset data on read errors. Batch rows persist between page reloads; inspect a running row after interrupted requests. Site migrations use CREATE IF NOT EXISTS for the initial tables. Review OpenAI spend and request limits before increasing batch sizes or opening access to more operators.
