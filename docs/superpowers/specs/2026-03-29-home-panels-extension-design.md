# Home Page Panels Extension

## Overview

Extend the home page from 3 stacked panels to 7 panels + footer, continuing the existing GSAP clip-path animation system in `home-experience.tsx`.

## Current State

- 3 panels: Hero → Creative → Manifesto
- GSAP-driven clip-path wipe transitions
- Wheel/touch/keyboard navigation
- Panel orchestrator in `home-experience.tsx`

## New Panels

### Panel 4: Concept (Full Screen)

- **Background:** `sustainable.mp4` via SmartVideo
- **Layout:** Bottom-right "Concept" large display text, bottom-left CTA "Discover" → `/concept`, center text "Dream-sustained by design, luminous in delivery"
- **Transition in:** Bottom→top wipe (`inset(100% 0 0 0)` → `inset(0)`)

### Panel 5: Categories (2 Columns)

- **Transition in:** Left column bottom→top wipe, right column top→bottom wipe
- **Left column:** Full-height background image, changes per active category with bottom→top wipe
  - Default: `/assets/campaigns/almaaz-kenya/almaaz-kenya-gallery-09.jpg`
  - THE BEE'S: `/assets/campaigns/almaaz-kenya/almaaz-kenya-carousel-01.jpg`
  - FLOWERS: `/assets/journeys/bolivia-september-2026/bolivia-september-2026-gallery-10.png`
  - HONEY: `/assets/campaigns/almaaz-kenya/almaaz-kenya-gallery-01.jpg`
- **Right column:** Beige `#efe3d1` background
  - Top-right corner: 3 icon buttons stacked/inline
    - Ico 13 → THE BEE'S
    - Ico 14 → FLOWERS
    - Ico 6 → HONEY
  - Icons default: white SVG; active: gold SVG
  - Hover: title fades in beside icon
  - Click: subtitle + body text fade in below

**Category Content:**

THE BEE'S:

- Subtitle: "WE ARE BEE'S" (Cannia uppercase + SaintBartogenia lowercase)
- Body: Beeyondtheworld's community reveals new horizons where our eyes once perceived only boundaries. community reveals new horizons where our eyes once perceived only boundaries.

FLOWERS:

- Subtitle: "the WORLD as FLOWERS" (Cannia uppercase + SaintBartogenia lowercase)
- Body: The world is a living work of art, painted by nature's lights and offered to us like a precious, untouchable flower. Luminous and intricately woven, it opens in soft, silent layers as we move through the unfolding tapestry of our lives. / We design immersive itineraries across the world to produce cinematic and editorial content while honoring and optimizing every resource. Each destination is curated to generate multiple unique campaigns within a single journey, ensuring elevated creativity, refined efficiency, and a responsible approach to production.

HONEY:

- Subtitle: "the HONEY of ADVERTISING" (Cannia uppercase + SaintBartogenia lowercase)
- Body: Our campaigns are the tangible proof that another model is possible: one where beauty aligns with the world instead of taking from it, and where intention leaves a softness that uplifts, sustains, and endures. / Honey is the luminous trace of an ecosystem in harmony, where every action, choice, and collaboration generates positive impact. It embodies the value created when brands embrace a conscious path: producing less, but better; reducing excess, honoring places, creating through connection rather than isolation.

### Panel 6: Our Journeys (Horizontal Scroll)

- **Transition in:** Bottom→top wipe
- **Background:** Beige `#efe3d1`
- **Initial view:** "OUR JOURNEYS" top-left large, Ico Gold BEE-13 right side at >100% viewport size, 10% opacity
- **Horizontal scroll** (wheel vertical → horizontal translate):
  - 3 journey screens, each full-viewport:
    1. India (`/journeys/india-january-2026`) - hero image as background
    2. Morocco (`/journeys/morocco`) - hero image as background
    3. Philippines (`/journeys/philippines`) - hero image as background
  - Each: country name bottom-right + Ico 13 white
  - Cursor ripple: canvas overlay, 2D displacement ripple following mouse
  - Hover: title + icon → gold
  - Click: navigate to journey
- **Final screen:** Beige, decorative gold icon left, "SEE ALL OF OUR JOURNEYS" bottom-right → `/journeys`

### Panel 7: Concept Reprise (2 Columns)

- **Transition in:** Left bottom→top, right top→bottom
- **Left column:** Beige, large "CONCEPT" heading, body text, button "Explore the concept" → `/concept`
- **Right column:** `sustainable.mp4` video

### Footer (Half Screen)

- Revealed on scroll past Panel 7, only 50vh height
- **Background:** Beige `#efe3d1`
- **Center:** Ico Gold BEE-13 large
- **Bottom:** Legal disclaimer text, Adam font, all caps

## Technical Approach

### Components to Create

| Component                 | File                                                 |
| ------------------------- | ---------------------------------------------------- |
| `HomeConceptPanel`        | `src/app/_components/home-concept-panel.tsx`         |
| `HomeCategoriesPanel`     | `src/app/_components/home-categories-panel.tsx`      |
| `HomeJourneysPanel`       | `src/app/_components/home-journeys-panel.tsx`        |
| `HomeConceptReprisePanel` | `src/app/_components/home-concept-reprise-panel.tsx` |
| `HomeFooter`              | `src/app/_components/home-footer.tsx`                |
| `RippleCursor`            | `src/components/primitives/ripple-cursor.tsx`        |

### Modifications

- `home-experience.tsx`: Extend from 3 panels to 7 + footer, add transitions for panels 3→4, 4→5, 5→6, 6→7, 7→footer
- `globals.css`: Add any new utility classes needed

### Animation System

All new transitions follow existing GSAP clip-path patterns:

- Bottom→top wipe: `inset(100% 0 0 0)` → `inset(0)`
- Two-column split: left bottom→top + right top→bottom (mirrors existing Panel 2→3)
- Text fade-in with stagger using `[data-animate-text]`
- Category image transitions: clip-path wipe on image swap

### Ripple Cursor Effect

Lightweight canvas-based 2D water ripple:

- Canvas overlay on journey scroll section
- Mouse position tracked, creates expanding circular distortion
- No WebGL dependency, pure canvas 2D with pixel displacement
- Background image rendered to canvas, distortion applied per frame

### Horizontal Scroll (Panel 6)

- Container wider than viewport (5 screens: intro + 3 journeys + see-all)
- Wheel deltaY mapped to horizontal translateX via GSAP
- Track scroll progress to know when to advance to Panel 7
- Touch swipe horizontal support

## Fonts Usage

- Subtitle pattern: Cannia (`font-menu`) for UPPERCASE words, SaintBartogenia (`font-script`) for lowercase words
- Legal text: Adam (`font-display`) all caps
- Display headings: existing heading classes

## Colors

- Beige: `#efe3d1`
- Gold: `#edb450` / HSL `38 79% 62%`
- White: `#ffffff`
- Dark: `#040301`
