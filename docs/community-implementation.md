# Bee Community — implementation contract

The October 9, 2026 user request authorizes implementation, test account provisioning and production deployment to beeyondtheworld.com, superseding the earlier deferred-dashboard sequence. The user delegated UX choices and authorized use of Beeyondtheworld Drive assets.

## Canonical sources

- BEE_ECOSYSTEM_MASTER_BRIEF_V2.pdf, 21 pages: one project, role-specific views; Bee / Flower / Honey; P0 NGO, production and brand reporting. Marketplace / agencies remain P1, media distribution P2.
- Beeyondtheworld_dashboards_Brands.pdf, 13 pages: brief, visual direction, approvals, delivered assets and impact visibility.
- Beeyondtheworld_dashboards_dirprod.pdf, 14 pages: crew, scouting, production readiness, bookings, source handoff and production footprint.
- 64 supplied visual references: blue desert, copper landscape, muted gold, editorial serif titles, restrained transparent panels. Existing Cannia / Avenir fonts and official bee mark are reused.

## Product decisions

- `/community` is a private, noindex workspace, reachable through the existing Community menu. Existing `/client` and editorial CMS access remain available.
- A single project joins every record. Project membership determines the role. NGO governance, expenses and allocations are scoped to the NGO organization; production and creative budgets are hidden from NGO users. Expert access requires record assignment.
- Eleven roles: Bee Core, Brand, Production Director, Artistic Director, Stylist, Photographer, Filmmaker, Makeup/Hair, Editor, NGO and Expert.
- Fourteen record types implement brief/concept, trust, locations, tasks, bookings, production milestones, allocations, Blooms, field actions, expenses, evidence, indicators and creative assets.
- Durable writes use PostgreSQL 18 on the existing VPS, through mutually authenticated TLS and dedicated application identities. The original Neon database is retained as a rollback source; it is no longer the application runtime. Additive schema lives in `drizzle/0010-community.sql`. The eight existing CMS tables were copied and their row digests compared before cutover.
- Each mutation appends an actor/time/state audit event in the same SQL statement. Optimistic versions reject stale edits. Sessions use random tokens stored as hashes, 12-hour expiry, HttpOnly / SameSite cookies and persistent login throttling. Accounts are provisioned by an operator; no public bootstrap route exists.
- Files are private, project/role checked on every download, limited to 3 MB and validated by file signatures. Larger files use explicit shared HTTPS links. No server-side URL fetching or automatic third-party sharing is performed.
- In-app attention lists are derived from role permissions and pending transitions. No emails, calendar invitations, bookings, signatures or payments are sent automatically.
- Desktop navigation uses stable chapter names rather than multiple conflicting carousels. Mobile uses a drawer and stacked layouts. Native dialogs preserve keyboard focus. Motion respects reduced-motion preferences.

## Metric mapping

| Metric                    | Implementation                                                                                                     | Source                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Production footprint      | Sum approved booking activity × selected factor, in kgCO2e                                                         | Bee_Production_Carbon_Booking_Framework_v2, Carbon_Summary B5:B10 and Factor_Library    |
| Expense evidence coverage | Evidenced impact expense amount / approved, paid or evidenced impact expense amount; no value for zero denominator | Bee_Global_CSR_Production_Traceability_Framework, 08_Metric_Dictionary row 2            |
| Local impact spend        | Sum approved impact expenses explicitly marked local                                                               | Same workbook, metric dictionary row 6; no conversion to an unverified social valuation |
| Validated indicators      | Only status `validated`; linked Bee-reviewed evidence mandatory; assigned expert validation when required          | Master Brief pages 13–16                                                                |

The seven offered planning factors map to cells D6, D10, D18, D20, D27, D29 and D33. They retain their activity units. These are the supplied internal planning proxies, not a carbon certification or externally validated factor library. Positive impacts do not offset production emissions. No inferred beneficiaries, sustainability labels or invented return-on-investment multiples.

## Asset provenance

- `namibia.webp`: generated through the built-in image tool. Prompt: photorealistic Namibian Deadvlei desert, sculptural acacia on the right, copper dunes, muted blue sky, dusk, quiet negative space; no people, type or logos. Illustrative scenery only.
- `garden.webp`: generated through the built-in image tool. Prompt: aspirational regenerative tropical flower garden, bamboo nursery, mountains and golden sunset, blue sky, quiet negative space; no people, type or logos. Illustrative scenery only.
- Campaign images reuse the existing authorized Craie Maroc media in the site; sample use is clearly separated from a real Namibia campaign.
- Scouting links to the authorized Drive Namibia reference (`1RV_rAGYWYW_UfUebGv31H2cKSG2dabLg`). No bulk Drive import or public redistribution of the archive.

## Test workspace and limits

The Namibia workspace, organizations, names, amounts, states and future dates are fictional fixtures, visibly marked DEMO. Eleven unique-password test users have access only to this project; Bee Core membership does not grant CMS administration or access to other projects. Passwords are not committed.

P0 captures and links the source workflow. Automated AI interpretation, image authenticity certification, external signatures, payment movement, booking engines, live weather/sun APIs, external notifications, automated commercial pricing and marketplaces are not claimed. Production credentials should be provisioned through an operator workflow; the included seed is for demonstration only.

## VPS operations

- `bee_site` is the production database; `bee_site_qa` is isolated validation. Dedicated roles and client certificates cannot access each other's database. The existing TLS pooler endpoint is reused; no PostgreSQL TCP listener or new public port was opened.
- Runtime uses `pg` / Drizzle node-postgres, with a three-connection application pool. No Neon HTTP driver remains. Schema changes run explicitly under the database owner; runtime cannot create tables, change Community accounts/memberships, or rewrite audit events.
- Private TLS environment variables: `DATABASE_SSL_CA_BASE64`, `DATABASE_SSL_CERT_BASE64`, `DATABASE_SSL_KEY_BASE64`, plus `DATABASE_URL`. No SSL override or certificate bypass. Vercel continues to serve the application; database state lives on the VPS.
- Backups: daily PostgreSQL custom dump, encrypted Swiss Backup under the dedicated `default/beeyond-site` repository prefix, timer at 03:40 UTC with up to ten minutes jitter. A snapshot was retrieved and restored to `bee_site_restore_20261010`; all 16 table counts matched (sessions and throttling intentionally excluded). No retention purge is configured.
- Shared pooler server certificate expires on 2027-01-05; certificate rotation must preserve the existing XNS client trust and refresh Beeyond environment values when client certificates are rotated. Beeyond client certificates expire after 180 days.
- A return to the old application must account for any new writes after cutover; do not simply switch back to the older Neon snapshot and lose them. Keep the prior deployment and source dump until acceptance.
