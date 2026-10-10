# Community editorial test — 10 October 2026

## Scope and visual contract

The user supplied two Namibia references and explicitly requested their luxury, minimal visual direction and interactions. These references are the canonical direction for this iteration: landscape imagery, blue / copper / quiet gold, Cannia and Avenir, a centered image carousel, restrained contextual navigation, large scouting view and thumbnail strip. No new design choice is pending. The subsequent user correction requires a portfolio of all assigned productions, rather than a project dropdown. The only dropdown is the test-role switcher.

`/community/test` is enabled visually for authenticated test accounts in demonstration projects. `/community` retains the previous workspace, with a link to explore this test UI. The test interface reuses the real server records, forms, transitions and file permissions; it is not a disconnected static mockup. Record details/forms open as a side sheet, with native dialog focus containment and Escape handling.

The portfolio presents five real published campaigns at explicitly synthetic rehearsal stages. These stages, task assignments, due dates, approvals and test account names are not historical facts. Historical budgets, permits, exact scouting coordinates, NGO actions and measured impact have not been invented. The existing Namibia simulation remains separately accessible for the NGO and expert flows. The new examples are initialized only in `bee_site_qa` on the VPS for preview verification.

## Component selection from 21st.dev

Reviewed on 10 October 2026:

- [shadcn Carousel](https://21st.dev/@shadcn/components/carousel), MIT: selected interaction pattern, implemented with the already installed `embla-carousel-react`. Centered slides, swipe, buttons, position indicator, keyboard arrows, no autoplay. Custom Bee rendering, no new dependency.
- [Animated Tabs](https://21st.dev/@kuratlielia/components/tabs), MIT: restrained animated indicator and overflow behavior informed the tabs. Custom implementation preserves roving focus, arrows, Home/End, tab/panel relationships and reduced motion. No upstream source copied.
- [shadcn Sheet](https://21st.dev/@shadcn/components/sheet), MIT: selected side-panel interaction. Existing native dialog retained to preserve focus/escape behavior, styled as a side sheet. No upstream source copied.
- [User Profile Dropdown](https://21st.dev/@ravikatiyar162/components/user-profile-dropdown): evaluated for the role control; native labeled select retained for keyboard and mobile reliability. No source copied.

Embla's installed MIT license remains in its package. The interface does not import an entire registry, execute third-party installer scripts or include external sample avatars/media.

## Test-role boundary

The role endpoint requires the existing authenticated account to be a test account with actual membership in the requested demo project. The target must be an enabled test member of the same project. A signed HttpOnly choice is bound to the original session token and one project; the login session is not replaced. Workspace resolves membership against the real user first, then checks the signed choice and test/demo flags on every read and mutation. Normal users, other projects, disabled target accounts, edited cookies and cookies from other sessions cannot inherit the selection. Record actions retain the selected test member's audit identity.

## Representative walkthroughs

1. Maradji · Ibiza: submit/review a brief; the creative direction remains a draft.
2. Craie Studio · Switzerland: prepare the team and complete the scouting dossier. Unknown coordinates/permits remain blank, so a Ready transition still needs real documentation or an explicit test fixture.
3. Craie Studio · Morocco: start with production in progress and role-specific tasks; publish archive references are not represented as recovered rushes.
4. Veganboost · Greece: the editor's version awaits brand review; request changes or approve using the existing permission rules.
5. Almaaz · Kenya: inspect delivered creative records and the archive; impact remains undocumented.

The production map explains the target Bee → brand creative governance and identifies existing permission gaps explicitly. This visual iteration does not claim to resolve all readiness gaps in the previous tutorial.

## Validation

Unit checks cover test-role signature scope, tampering, authentication, demo membership and HttpOnly responses; existing Community permission/transition checks retained. Rendered browser checks cover all eleven roles, portfolio filters/search, project opening, scouting tabs, fullscreen images, side panels, mobile navigation and viewport overflow. Final evidence is recorded with the task deliverables, not credentials.
