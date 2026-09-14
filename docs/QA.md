# QA report

## Automated verification

- Production Next.js build compiles all requested page and API routes.
- TypeScript checks enforce the page, generator, repository and API contracts.
- 13 automated tests cover exact weighted scores; complete demo projects; business-specific generation; persistent state; locked fact rejection; one-module regeneration; approval guards for promises, credentials and field mappings; source linkage; humanization literal preservation; ZIP contents/checksums; CSV formula escaping; public-address rejection; mock-adapter side-effect blocking; API actions, stale versions and downloads; same-host CSRF behind a proxy; and production authentication fail-closed behavior.
- Every exported file listed in SHA256SUMS is read back from the generated ZIP and its hash verified. Eight SKILL.md files are required.

## Browser verification

- Viewed the desktop dashboard and checked its source/project counts and clear demo labels.
- Completed a fictional client intake through all four wizard steps and verified the resulting project and its generated drafts.
- Approved an intake source and locked the business name.
- Edited an opportunity-mapper skill, saved version 2, approved the draft and locked the module.
- Opened the Opportunity Board and its rationale drawer, checking required inputs, assumptions, risks, review needs and measurement definition.
- Inspected the Export Center and its draft acknowledgment/download controls.

Browser testing found a reverse-proxy origin mismatch that rejected legitimate local intake submissions. The middleware now compares the browser's Origin host against the request Host; automated tests verify that foreign origins still fail.

## Limits

A real public scan of example.com could not complete because DNS resolution returned EAI_AGAIN in the build environment. The scanner's rejection controls are tested; live success must be verified on the deployment host. No protected sites or social/GBP data were scraped.

Mobile breakpoints and navigation are implemented; no dedicated mobile-device or screen-reader audit has been completed. No WCAG certification is claimed. Human claim entailment and source accuracy still require operator review.

No native Make import, CRM write, Drive/Docs/Notion delivery, external publishing, live booking, production database migration, or public deployment was performed. No real client outcomes are claimed, and no demo counts toward the three-client validation gate.
