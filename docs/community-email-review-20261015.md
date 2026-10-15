# Email review integration — 15 October 2026

This extends the existing comparator rather than the operational community app. The source is Eugénie's `UX DAHSBOARD PROCESS BEEYOND` email and the referenced Drive designs. Accepted Horizon typography, colours and imagery unify the original compositions. Existing role/page feedback keys and reviewer access remain unchanged.

## Scope

- 14 new page definitions, agency/casting as a fifteenth role, 161 additional role/page views. Total 855, of which 374 interactive and 481 original static references.
- Creative and Bloom dashboards; consolidated Bee Certified; separate social, environmental and economic pages.
- Casting network and talent handoff; visual upcycling; chapter sound library; field operations; Honey asset library; evidence register and label methodology.
- Existing specialty pages link to their shared metrics; Tales has the current Visual Tale / Sound Tale structure and includes label documentation in its export.
- Source compositions are linked and eleven optimized reference images can be expanded in the new pages.
- Illustrated report: `/review/email-oct15/report.html`, 25 current screenshots and a 29-page PDF.

## Data and interactions

`label-model.js` defines 37 stable criterion IDs. A quantity, denominator, proof and review are reused in the owner view, metric register, Hive summary and pillar. Empty values do not become zero, invalid denominators cannot produce percentages, and elevated-risk acceptance requires independent review in the exercise. Editing evidence or quantities reopens review. No score or certificate is issued, even with complete exercise criteria.

Local field experiments remain in the existing browser scenario. Only reviewer text and attachments are shared through the existing VPS feedback API. The label criteria are drafts, not certified claims. Country networks and contributor names are illustrative. No agencies, suppliers or artists were actually contracted. Elixir of Honey magazine is explicitly excluded, per the email.

## Verification

- Unit and rendered-surface tests cover every interactive role/page, image availability, cross-role links and original feedback keys.
- Model tests cover missing data, ratios, unique consolidation and risk review. A DOM interaction test verifies measurement changes reopen review and propagate to consolidation.
- QA database checks: both reviewers, multi-image attachments, ownership, optimistic conflicts, anonymous denial and cross-site write denial.
- Browser checks: category/country selectors, metric handoff, editing and review, role switching, read-only brand fields, mobile layout and real JSON download.
- The report includes actual rendered screenshots; PDF pages checked after rendering.

## Next operational phase

Agree the versioned charter, evidence definitions and certification methodology with the business owners. Qualify real country partners and source licences. Operational role permissions, multiuser production records and actual certification are separate from this review release.
