# Carry the light — production rehearsal

Project: `b0000000-0000-4000-8000-000000000203`.
Entry: `/community/test?project=b0000000-0000-4000-8000-000000000203#project`.

The original Craie Morocco campaign is inspiration only. This rehearsal contains fictional people, dates, providers, amounts, agreements and impact measurements. AI photography illustrates the intended production; it is never field evidence. There are no actual master films, payments or signed contracts in this dataset.

The existing Bee test account is a member and can switch among 12 enabled test identities. Normal accounts cannot impersonate roles. Role selection is signed, session-bound and scoped to the demo project. The new case does not modify the earlier Morocco project or its user edits.

The fixture contains 428 records and 205 authenticated attachments, including 38 clearly marked exercise PDFs. It covers the complete client brief, four scouting locations, frames and discipline references, two looks with four views, four collection products, readiness, scheduling, six bookings, postproduction and impact evidence. Amounts total EUR 34,500 (creative 12,000; production 14,000; Bee 6,000; impact 2,500). Two production services have no applicable carbon factor; their estimate remains explicitly unavailable.

## Testing the journey

Open “Test the whole production” on the project overview. Each stage lists its responsible roles and links to the relevant pages. Change roles with the top-right selector.

1. Brand completes the brief; Bee reviews it.
2. Local partner completes the trust file; Bee verifies it.
3. Production and creatives develop scouting, frames and looks. Bee then brand approve the creative direction.
4. Production prepares bookings, itinerary, call sheet and readiness; Bee approves the budget and readiness gate.
5. Crew update fitting checks, frames, previews and source files.
6. Editor prepares a version. Bee reviews it before brand approval. Reviews must reference the current version.
7. Bee records rights before final delivery and archive.
8. Partner submits actions, expenses and evidence. Bee reviews; the assigned independent expert checks the higher-risk indicator. Bee can then approve the report.

Records start prefilled at their initial workflow state. Files persist in PostgreSQL on the VPS, with checksums and per-project permissions. Role handoffs use the same saved records. The production verification changes only a test draft to its existing content; the rehearsal remains available from its beginning.

## Reproducible installation

Use the existing VPS database environment (including mutual-TLS certificate variables). Run `node scripts/seed-carry-light.mjs bee_site_qa` or `bee_site` only after selecting the intended connection. The script verifies the database name, checks the existing test Bee identity, and inserts the new case in one transaction. It refuses to overwrite an existing case. It does not run during deployment and contains no credentials. Other fictional identities are accessed via the signed role switch.

Source: `scripts/fixtures/carry-light.json`; optimized new images: `public/assets/community/carry-light/`; synthetic documents: `scripts/fixtures/carry-light-documents/`.
