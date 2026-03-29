# Home Page Panels Extension — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the home page from 3 stacked panels to 7 panels + footer, adding Concept, Categories, Journeys, Concept Reprise, and Footer sections.

**Architecture:** Each new panel is a standalone component following the existing `home-*-panel.tsx` pattern. The orchestrator `home-experience.tsx` grows from `PANEL_COUNT=3` to `PANEL_COUNT=7` with new GSAP clip-path transitions. Panel 6 (Journeys) uses internal horizontal scrolling that intercepts wheel events before they bubble to the panel navigator. A lightweight canvas-based ripple cursor overlay adds water distortion to journey cards.

**Tech Stack:** Next.js 15 App Router, GSAP (already installed), Tailwind CSS, SmartVideo primitive, Canvas 2D API for ripple effect.

**Spec:** `docs/superpowers/specs/2026-03-29-home-panels-extension-design.md`

---

## Chunk 1: Foundation Panels (Concept + Categories)

### Task 1: Create HomeConceptPanel component

**Files:**

- Create: `src/app/_components/home-concept-panel.tsx`

- [ ] **Step 1: Create the component file**

```tsx
'use client';

import Link from 'next/link';
import { SmartVideo } from '@/components/primitives';

const CONCEPT_VIDEO = '/assets/concept/sustainable.mp4';

export function HomeConceptPanel() {
  return (
    <section className="home-snap-panel relative overflow-hidden bg-[#040301] text-white">
      {/* Background Video */}
      <div className="absolute inset-0">
        <SmartVideo
          wrapperClassName="absolute inset-0"
          className="h-full w-full object-cover"
          src={CONCEPT_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
        />
      </div>

      {/* Dark overlay for legibility */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,3,1,0.18)_0%,rgba(4,3,1,0.08)_40%,rgba(4,3,1,0.35)_70%,rgba(4,3,1,0.65)_100%)]" />

      {/* Center text */}
      <div className="relative flex h-full items-center justify-center px-8">
        <p
          data-animate-text
          className="max-w-lg text-center font-script text-[clamp(1.2rem,2.2vw,2rem)] lowercase leading-[1.7] tracking-[0.02em] text-white/90"
        >
          Dream-sustained by design, luminous in delivery
        </p>
      </div>

      {/* Bottom-right: Concept title */}
      <div className="absolute bottom-12 right-8 sm:bottom-16 sm:right-12 lg:bottom-20 lg:right-20">
        <h2
          data-animate-text
          className="font-menu text-[clamp(2.4rem,7vw,8rem)] uppercase leading-[0.9] tracking-[0.02em] text-white"
        >
          Concept
        </h2>
      </div>

      {/* Bottom-left: CTA */}
      <div className="absolute bottom-12 left-8 sm:bottom-16 sm:left-12 lg:bottom-20 lg:left-20">
        <Link
          href="/concept"
          data-animate-text
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-none border border-white/25 bg-white/10 px-8 py-2.5 font-display text-[9px] uppercase tracking-[0.45em] text-white transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-white/60 hover:bg-white/15"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#f6c452bf] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100" />
          Discover
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify file renders without errors**

Run: `npx next build --no-lint 2>&1 | head -20` (or start dev server and check console)

- [ ] **Step 3: Commit**

```bash
git add src/app/_components/home-concept-panel.tsx
git commit -m "feat(home): add concept panel component"
```

---

### Task 2: Create HomeCategoriesPanel component

**Files:**

- Create: `src/app/_components/home-categories-panel.tsx`

This is the most complex panel — two columns with interactive category switching. The left column image changes with a clip-path wipe when switching categories. The right column has 3 icon buttons that show/hide content.

- [ ] **Step 1: Create the component file**

```tsx
'use client';

import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { gsap } from 'gsap';

type Category = 'bees' | 'flowers' | 'honey';

const CATEGORY_IMAGES: Record<Category, string> = {
  bees: '/assets/campaigns/almaaz-kenya/almaaz-kenya-carousel-01.jpg',
  flowers: '/assets/journeys/bolivia-september-2026/bolivia-september-2026-gallery-10.png',
  honey: '/assets/campaigns/almaaz-kenya/almaaz-kenya-gallery-01.jpg',
};

const DEFAULT_IMAGE = '/assets/campaigns/almaaz-kenya/almaaz-kenya-gallery-09.jpg';

const CATEGORY_ICONS: Record<Category, { white: string; gold: string; label: string }> = {
  bees: {
    white: '/assets/icones/Ico White BEE-13.svg',
    gold: '/assets/icones/Ico Gold BEE-13.svg',
    label: "THE BEE'S",
  },
  flowers: {
    white: '/assets/icones/Ico White BEE-14.svg',
    gold: '/assets/icones/Ico Gold BEE-14.svg',
    label: 'FLOWERS',
  },
  honey: {
    white: '/assets/icones/Ico White BEE-06.svg',
    gold: '/assets/icones/Ico Gold BEE-06.svg',
    label: 'HONEY',
  },
};

const CATEGORY_CONTENT: Record<Category, { subtitle: React.ReactNode; body: React.ReactNode }> = {
  bees: {
    subtitle: (
      <>
        <span className="font-menu uppercase">WE</span>{' '}
        <span className="font-menu uppercase">ARE</span>{' '}
        <span className="font-menu uppercase">BEE&apos;S</span>
      </>
    ),
    body: (
      <>
        <p>
          Beeyondtheworld&apos;s community reveals new horizons where our eyes once perceived only
          boundaries. community reveals new horizons where our eyes once perceived only boundaries.
        </p>
        <p className="mt-4">
          We whispers dreamlike production tales. while pooling non-competing brands into shared
          journeys, letting them share the logistic while their stories stay singular and unique.
        </p>
        <p className="mt-4">
          Time becomes profitability: we deliver a fully integrated outsourcing model, co-creating
          each step of the visual production journey. Casting, direction, scouting, styling, and
          narrative design merge seamlessly ensuring an elevated, impeccably orchestrated outcome.
        </p>
      </>
    ),
  },
  flowers: {
    subtitle: (
      <>
        <span className="font-script lowercase">the</span>{' '}
        <span className="font-menu uppercase">WORLD</span>{' '}
        <span className="font-script lowercase">as</span>{' '}
        <span className="font-menu uppercase">FLOWERS</span>
      </>
    ),
    body: (
      <>
        <p>
          The world is a living work of art, painted by nature&apos;s lights and offered to us like
          a precious, untouchable flower. Luminous and intricately woven, it opens in soft, silent
          layers as we move through the unfolding tapestry of our lives.
        </p>
        <p className="mt-4">
          We design immersive itineraries across the world to produce cinematic and editorial
          content while honoring and optimizing every resource. Each destination is curated to
          generate multiple unique campaigns within a single journey, ensuring elevated creativity,
          refined efficiency, and a responsible approach to production.
        </p>
      </>
    ),
  },
  honey: {
    subtitle: (
      <>
        <span className="font-script lowercase">the</span>{' '}
        <span className="font-menu uppercase">HONEY</span>{' '}
        <span className="font-script lowercase">of</span>{' '}
        <span className="font-menu uppercase">ADVERTISING</span>
      </>
    ),
    body: (
      <>
        <p>
          Our campaigns are the tangible proof that another model is possible: one where beauty
          aligns with the world instead of taking from it, and where intention leaves a softness
          that uplifts, sustains, and endures.
        </p>
        <p className="mt-4">
          Honey is the luminous trace of an ecosystem in harmony, where every action, choice, and
          collaboration generates positive impact. It embodies the value created when brands embrace
          a conscious path: producing less, but better; reducing excess, honoring places, creating
          through connection rather than isolation.
        </p>
      </>
    ),
  },
};

export function HomeCategoriesPanel() {
  const [active, setActive] = useState<Category | null>(null);
  const [hoveredIcon, setHoveredIcon] = useState<Category | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const currentImageRef = useRef<string>(DEFAULT_IMAGE);

  const switchCategory = useCallback(
    (cat: Category) => {
      if (cat === active) return;

      /* Animate content fade out then in */
      const contentEl = contentRef.current;
      if (contentEl) {
        gsap.to(contentEl, {
          opacity: 0,
          y: 12,
          duration: 0.35,
          ease: 'power2.in',
          onComplete: () => {
            setActive(cat);
            gsap.fromTo(
              contentEl,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
            );
          },
        });
      } else {
        setActive(cat);
      }

      /* Animate left image wipe */
      const container = imageContainerRef.current;
      if (!container) return;

      const newSrc = CATEGORY_IMAGES[cat];
      if (newSrc === currentImageRef.current) return;

      // Create a new image layer on top, wipe it in bottom→top
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:absolute;inset:0;clip-path:inset(100% 0 0 0);z-index:2;';
      overlay.innerHTML = `<img src="${newSrc}" alt="" style="width:100%;height:100%;object-fit:cover;" />`;
      container.appendChild(overlay);

      gsap.to(overlay, {
        clipPath: 'inset(0% 0 0 0)',
        duration: 1,
        ease: 'power2.inOut',
        onComplete: () => {
          // Clean up: set main image, remove overlay
          currentImageRef.current = newSrc;
          // Remove all but the last overlay
          const overlays = container.querySelectorAll('div[style*="z-index:2"]');
          overlays.forEach((el, i) => {
            if (i < overlays.length - 1) el.remove();
          });
        },
      });
    },
    [active]
  );

  const currentImage = active ? CATEGORY_IMAGES[active] : DEFAULT_IMAGE;

  return (
    <section className="home-snap-panel relative overflow-hidden">
      <div className="relative grid h-full grid-cols-1 lg:grid-cols-2">
        {/* Left column — Category image */}
        <div
          data-categories-left
          ref={imageContainerRef}
          className="relative min-h-[50vh] lg:min-h-0"
        >
          <Image src={currentImage} alt="" fill sizes="50vw" className="object-cover" priority />
        </div>

        {/* Right column — Beige with icons + content */}
        <div
          data-categories-right
          className="relative flex flex-col bg-[#efe3d1] px-8 py-12 sm:px-12 lg:px-16 lg:py-16"
        >
          {/* Top-right icon menu */}
          <div className="flex items-center justify-end gap-6">
            {(Object.keys(CATEGORY_ICONS) as Category[]).map((cat) => {
              const icon = CATEGORY_ICONS[cat];
              const isActive = active === cat;
              const isHovered = hoveredIcon === cat;

              return (
                <div
                  key={cat}
                  className="relative flex items-center gap-3"
                  onMouseEnter={() => setHoveredIcon(cat)}
                  onMouseLeave={() => setHoveredIcon(null)}
                >
                  {/* Title — appears on hover */}
                  <span
                    className={`font-display text-[10px] uppercase tracking-[0.3em] transition-opacity duration-300 ${
                      isHovered || isActive ? 'opacity-100' : 'opacity-0'
                    } ${isActive ? 'text-[#edb450]' : 'text-[#1b130e]/60'}`}
                  >
                    {icon.label}
                  </span>

                  <button
                    onClick={() => switchCategory(cat)}
                    className="relative h-10 w-10 transition-transform duration-300 hover:scale-110"
                    aria-label={icon.label}
                  >
                    <Image
                      src={isActive ? icon.gold : icon.white}
                      alt=""
                      fill
                      sizes="40px"
                      className={`object-contain transition-opacity duration-300 ${
                        !isActive ? 'opacity-40 brightness-0' : ''
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Category content — centered */}
          <div
            ref={contentRef}
            className="flex flex-1 flex-col items-center justify-center px-4 lg:px-8"
          >
            {active ? (
              <>
                <h2
                  data-animate-text
                  className="mb-8 text-center text-[clamp(1.8rem,4vw,3.6rem)] leading-[1.15] tracking-[0.03em] text-[#1b130e]"
                >
                  {CATEGORY_CONTENT[active].subtitle}
                </h2>
                <div
                  data-animate-text
                  className="max-w-md text-center font-sans text-[clamp(0.75rem,0.95vw,0.9rem)] leading-[1.85] tracking-[0.01em] text-[#1b130e]/70"
                >
                  {CATEGORY_CONTENT[active].body}
                </div>
              </>
            ) : (
              <p
                data-animate-text
                className="text-center font-script text-[clamp(1rem,1.6vw,1.4rem)] lowercase leading-[1.7] text-[#1b130e]/50"
              >
                Select a category to explore
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify it renders**

Run dev server, check no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/_components/home-categories-panel.tsx
git commit -m "feat(home): add categories panel with interactive icon menu"
```

---

### Task 3: Wire Panels 4-5 into HomeExperience orchestrator

**Files:**

- Modify: `src/app/_components/home-experience.tsx`

This task adds Panel 4 (Concept) and Panel 5 (Categories) to the orchestrator and extends the GSAP transition logic. Panel 3→4 uses bottom→top wipe. Panel 4→5 uses two-column split (left bottom→top, right top→bottom) via `data-categories-left` and `data-categories-right` attributes.

- [ ] **Step 1: Update imports and PANEL_COUNT**

At the top of `home-experience.tsx`, add imports for the two new panels and bump the count:

```tsx
import { HomeConceptPanel } from './home-concept-panel';
import { HomeCategoriesPanel } from './home-categories-panel';

const PANEL_COUNT = 5; // was 3
```

- [ ] **Step 2: Generalize the two-column detection in goTo()**

Currently the `goTo` function specifically looks for `[data-manifesto-left]` / `[data-manifesto-right]`. We need to generalize this to also detect `[data-categories-left]` / `[data-categories-right]`. Replace the column detection logic in the **forward direction** block:

Replace the existing forward direction column detection:

```tsx
const leftCol = next.querySelector<HTMLElement>('[data-manifesto-left]');
const rightCol = next.querySelector<HTMLElement>('[data-manifesto-right]');
```

With a generalized approach:

```tsx
const leftCol =
  next.querySelector<HTMLElement>('[data-manifesto-left]') ??
  next.querySelector<HTMLElement>('[data-categories-left]');
const rightCol =
  next.querySelector<HTMLElement>('[data-manifesto-right]') ??
  next.querySelector<HTMLElement>('[data-categories-right]');
```

Do the same for the **reverse direction** block where `current` is queried:

```tsx
const leftCol =
  current.querySelector<HTMLElement>('[data-manifesto-left]') ??
  current.querySelector<HTMLElement>('[data-categories-left]');
const rightCol =
  current.querySelector<HTMLElement>('[data-manifesto-right]') ??
  current.querySelector<HTMLElement>('[data-categories-right]');
```

- [ ] **Step 3: Add new panel elements to JSX**

After the existing Panel 3 div, add:

```tsx
<div data-panel style={{ zIndex: 4 }}>
  <HomeConceptPanel />
</div>
<div data-panel style={{ zIndex: 5 }}>
  <HomeCategoriesPanel />
</div>
```

- [ ] **Step 4: Verify navigation works across all 5 panels**

Start dev server, scroll through all 5 panels forward and backward. Confirm:

- Panel 3→4 (Manifesto→Concept): bottom→top wipe
- Panel 4→5 (Concept→Categories): two-column split animation
- Reverse works correctly for all transitions

- [ ] **Step 5: Commit**

```bash
git add src/app/_components/home-experience.tsx
git commit -m "feat(home): wire concept + categories panels into orchestrator"
```

---

## Chunk 2: Journeys Panel with Horizontal Scroll + Ripple Cursor

### Task 4: Create the RippleCursor canvas component

**Files:**

- Create: `src/components/primitives/ripple-cursor.tsx`

A lightweight canvas-based water ripple effect. Uses two buffers for wave propagation. The canvas is transparent — it only renders the ripple distortion as a semi-transparent overlay.

- [ ] **Step 1: Create the ripple cursor component**

```tsx
'use client';

import { useCallback, useEffect, useRef } from 'react';

type RippleCursorProps = {
  className?: string;
};

export function RippleCursor({ className }: RippleCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const setupRipple = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return () => {};

    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};

    let width = 0;
    let height = 0;
    // Downscale for performance
    const scale = 4;
    let cols = 0;
    let rows = 0;
    let buffer1: Float32Array;
    let buffer2: Float32Array;
    const damping = 0.96;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width;
      canvas!.height = height;
      cols = Math.ceil(width / scale);
      rows = Math.ceil(height / scale);
      buffer1 = new Float32Array(cols * rows);
      buffer2 = new Float32Array(cols * rows);
    }

    resize();

    function drop(x: number, y: number) {
      const col = Math.floor(x / scale);
      const row = Math.floor(y / scale);
      const radius = 3;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const c = col + dx;
          const r = row + dy;
          if (c >= 0 && c < cols && r >= 0 && r < rows) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= radius) {
              buffer1[r * cols + c] = 255 * (1 - dist / radius);
            }
          }
        }
      }
    }

    function step() {
      for (let r = 1; r < rows - 1; r++) {
        for (let c = 1; c < cols - 1; c++) {
          const i = r * cols + c;
          buffer2[i] =
            (buffer1[i - 1] + buffer1[i + 1] + buffer1[i - cols] + buffer1[i + cols]) / 2 -
            buffer2[i];
          buffer2[i] *= damping;
        }
      }
      // Swap buffers
      const tmp = buffer1;
      buffer1 = buffer2;
      buffer2 = tmp;
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      const imageData = ctx!.createImageData(width, height);
      const data = imageData.data;

      for (let r = 1; r < rows - 1; r++) {
        for (let c = 1; c < cols - 1; c++) {
          const val = buffer1[r * cols + c];
          if (Math.abs(val) < 0.5) continue;

          // Render as semi-transparent white/dark based on ripple height
          const intensity = Math.min(Math.abs(val) * 0.8, 80);

          for (let py = 0; py < scale && r * scale + py < height; py++) {
            for (let px = 0; px < scale && c * scale + px < width; px++) {
              const idx = ((r * scale + py) * width + c * scale + px) * 4;
              if (val > 0) {
                data[idx] = 255;
                data[idx + 1] = 255;
                data[idx + 2] = 255;
                data[idx + 3] = intensity;
              } else {
                data[idx] = 0;
                data[idx + 1] = 0;
                data[idx + 2] = 0;
                data[idx + 3] = intensity * 0.5;
              }
            }
          }
        }
      }

      ctx!.putImageData(imageData, 0, 0);
    }

    function animate() {
      step();
      draw();
      rafRef.current = requestAnimationFrame(animate);
    }

    const onMove = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect();
      drop(e.clientX - rect.left, e.clientY - rect.top);
    };

    const onResize = () => resize();

    canvas.addEventListener('mousemove', onMove);
    window.addEventListener('resize', onResize);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      canvas.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    return setupRipple();
  }, [setupRipple]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ pointerEvents: 'none', position: 'absolute', inset: 0 }}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/primitives/ripple-cursor.tsx
git commit -m "feat: add canvas-based ripple cursor effect component"
```

---

### Task 5: Create HomeJourneysPanel component

**Files:**

- Create: `src/app/_components/home-journeys-panel.tsx`

This panel has an internal horizontal scroll: intro screen → 3 journey cards → "see all" screen. Wheel events are intercepted internally: vertical scroll maps to horizontal translate. When the horizontal scroll reaches its end, the next wheel event should advance to Panel 7.

- [ ] **Step 1: Create the component**

```tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { RippleCursor } from '@/components/primitives/ripple-cursor';

const JOURNEYS = [
  {
    slug: 'india-january-2026',
    title: 'INDIA',
    image: '/assets/journeys/india-january-2026/india-january-2026-hero.png',
  },
  {
    slug: 'morocco',
    title: 'MOROCCO',
    image: '/assets/journeys/morocco-2026/morocco-all-journeys-thumbnail.png',
  },
  {
    slug: 'philippines',
    title: 'PHILIPPINES',
    image: '/assets/journeys/philippines-2026/philippines-all-journeys-thumbnail.png',
  },
];

const ICON_WHITE = '/assets/icones/Ico White BEE-13.svg';
const ICON_GOLD = '/assets/icones/Ico Gold BEE-13.svg';
const TOTAL_SCREENS = 5; // intro + 3 journeys + see-all

type HomeJourneysPanelProps = {
  /** Called when horizontal scroll is exhausted and user scrolls forward */
  onScrollExhausted?: (direction: 1 | -1) => void;
};

export function HomeJourneysPanel({ onScrollExhausted }: HomeJourneysPanelProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const screenIndexRef = useRef(0);
  const isScrollingRef = useRef(false);
  const [hoveredJourney, setHoveredJourney] = useState<string | null>(null);

  const scrollToScreen = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track || isScrollingRef.current) return;

    const clamped = Math.max(0, Math.min(index, TOTAL_SCREENS - 1));
    isScrollingRef.current = true;

    gsap.to(track, {
      x: -clamped * window.innerWidth,
      duration: 1,
      ease: 'power2.inOut',
      onComplete: () => {
        screenIndexRef.current = clamped;
        isScrollingRef.current = false;
      },
    });
  }, []);

  /** Exposed for parent orchestrator to intercept wheel events */
  const handleInternalWheel = useCallback(
    (deltaY: number): boolean => {
      if (isScrollingRef.current) return true; // consumed

      const current = screenIndexRef.current;

      if (deltaY > 0) {
        // Scroll forward
        if (current < TOTAL_SCREENS - 1) {
          scrollToScreen(current + 1);
          return true; // consumed
        }
        // At end — bubble to parent
        onScrollExhausted?.(1);
        return false;
      } else {
        // Scroll backward
        if (current > 0) {
          scrollToScreen(current - 1);
          return true;
        }
        onScrollExhausted?.(-1);
        return false;
      }
    },
    [scrollToScreen, onScrollExhausted]
  );

  // Expose handleInternalWheel via data attribute so parent can call it
  useEffect(() => {
    const track = trackRef.current?.parentElement;
    if (track) {
      (track as any).__journeyWheel = handleInternalWheel;
    }
  }, [handleInternalWheel]);

  // Reset horizontal position when panel becomes visible
  useEffect(() => {
    const track = trackRef.current;
    if (track) {
      gsap.set(track, { x: 0 });
      screenIndexRef.current = 0;
    }
  }, []);

  return (
    <section className="home-snap-panel relative overflow-hidden bg-[#efe3d1]">
      {/* Horizontal scroll track */}
      <div ref={trackRef} className="flex h-full" style={{ width: `${TOTAL_SCREENS * 100}vw` }}>
        {/* Screen 1: Intro */}
        <div className="relative flex h-full w-screen flex-shrink-0 items-start justify-between px-8 py-16 sm:px-12 lg:px-20">
          {/* Title top-left */}
          <h2
            data-animate-text
            className="font-menu text-[clamp(2.4rem,6vw,7rem)] uppercase leading-[0.9] tracking-[0.02em] text-[#1b130e]"
          >
            Our
            <br />
            Journeys
          </h2>

          {/* Large decorative icon — right side, overflows */}
          <div className="pointer-events-none absolute right-[-10%] top-1/2 -translate-y-1/2">
            <Image
              src={ICON_GOLD}
              alt=""
              width={1200}
              height={1200}
              className="h-[120vh] w-auto opacity-[0.08]"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Screen 2-4: Journey cards */}
        {JOURNEYS.map((journey) => {
          const isHovered = hoveredJourney === journey.slug;

          return (
            <Link
              key={journey.slug}
              href={`/journeys/${journey.slug}`}
              className="relative flex h-full w-screen flex-shrink-0 items-end justify-end p-8 sm:p-12 lg:p-20"
              onMouseEnter={() => setHoveredJourney(journey.slug)}
              onMouseLeave={() => setHoveredJourney(null)}
            >
              {/* Background image */}
              <Image
                src={journey.image}
                alt={journey.title}
                fill
                sizes="100vw"
                className="object-cover"
              />

              {/* Ripple overlay */}
              <RippleCursor className="z-10" />

              {/* Dark gradient overlay */}
              <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(4,3,1,0.05)_0%,rgba(4,3,1,0.35)_70%,rgba(4,3,1,0.6)_100%)]" />

              {/* Title + icon bottom-right */}
              <div
                className={`relative z-20 flex items-center gap-4 transition-colors duration-500 ${
                  isHovered ? 'text-[#edb450]' : 'text-white'
                }`}
              >
                <h3 className="font-menu text-[clamp(2rem,5vw,5rem)] uppercase leading-[0.9] tracking-[0.02em]">
                  {journey.title}
                </h3>
                <Image
                  src={isHovered ? ICON_GOLD : ICON_WHITE}
                  alt=""
                  width={48}
                  height={48}
                  className="h-10 w-10 lg:h-12 lg:w-12"
                />
              </div>
            </Link>
          );
        })}

        {/* Screen 5: See all */}
        <div className="relative flex h-full w-screen flex-shrink-0 items-end justify-end p-8 sm:p-12 lg:p-20">
          {/* Decorative icon — left side */}
          <div className="pointer-events-none absolute left-[5%] top-1/2 -translate-y-1/2">
            <Image
              src={ICON_GOLD}
              alt=""
              width={800}
              height={800}
              className="h-[90vh] w-auto opacity-[0.08]"
              aria-hidden="true"
            />
          </div>

          {/* CTA bottom-right */}
          <Link
            href="/journeys"
            className="group relative z-10 flex items-center gap-4 text-[#1b130e] transition-colors duration-500 hover:text-[#edb450]"
          >
            <h3 className="font-menu text-[clamp(1.4rem,3.5vw,3.2rem)] uppercase leading-[0.95] tracking-[0.02em]">
              See all of
              <br />
              our journeys
            </h3>
            <Image
              src={ICON_GOLD}
              alt=""
              width={48}
              height={48}
              className="h-10 w-10 lg:h-12 lg:w-12"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/_components/home-journeys-panel.tsx
git commit -m "feat(home): add journeys panel with horizontal scroll and ripple cursor"
```

---

### Task 6: Wire Panel 6 (Journeys) into orchestrator with wheel interception

**Files:**

- Modify: `src/app/_components/home-experience.tsx`

The journeys panel has internal horizontal scrolling, so the orchestrator must route wheel events to it when Panel 6 is active, and only advance to the next/previous panel when the internal scroll is exhausted.

- [ ] **Step 1: Import and update count**

```tsx
import { HomeJourneysPanel } from './home-journeys-panel';

const PANEL_COUNT = 6; // was 5
```

- [ ] **Step 2: Add Panel 6 JSX**

After Panel 5 div:

```tsx
<div data-panel style={{ zIndex: 6 }}>
  <HomeJourneysPanel />
</div>
```

- [ ] **Step 3: Modify wheel handler to intercept for journeys panel**

In the `onWheel` handler, before the normal `goTo` calls, add interception logic:

```tsx
const onWheel = (e: WheelEvent) => {
  e.preventDefault();
  if (isAnimatingRef.current) return;

  accumulatedDelta += e.deltaY;

  if (Math.abs(accumulatedDelta) < THRESHOLD) return;

  const direction = accumulatedDelta > 0 ? 1 : -1;
  accumulatedDelta = 0;

  // Check if journeys panel wants to handle this scroll internally
  const currentPanel = panelEls[activeRef.current];
  const journeyWheel = (currentPanel as any)?.__journeyWheel as
    | ((delta: number) => boolean)
    | undefined;

  if (journeyWheel) {
    const consumed = journeyWheel(direction * 100);
    if (consumed) return;
  }

  goTo(activeRef.current + direction);
};
```

- [ ] **Step 4: Test panel 5→6→ transitions**

Verify:

- Scrolling into Panel 6 shows the journeys intro
- Continued scrolling moves horizontally through journey cards
- After the "See All" screen, next scroll advances to Panel 7
- Backward scrolling reverses correctly

- [ ] **Step 5: Commit**

```bash
git add src/app/_components/home-experience.tsx
git commit -m "feat(home): wire journeys panel with internal horizontal scroll interception"
```

---

## Chunk 3: Concept Reprise + Footer + Final Wiring

### Task 7: Create HomeConceptReprisePanel component

**Files:**

- Create: `src/app/_components/home-concept-reprise-panel.tsx`

Two-column layout: left beige with text, right video. Uses `data-reprise-left` and `data-reprise-right` attributes for the two-column animation.

- [ ] **Step 1: Create the component**

```tsx
'use client';

import Link from 'next/link';
import { SmartVideo } from '@/components/primitives';

const CONCEPT_VIDEO = '/assets/concept/sustainable.mp4';

export function HomeConceptReprisePanel() {
  return (
    <section className="home-snap-panel relative overflow-hidden">
      <div className="relative grid h-full grid-cols-1 lg:grid-cols-2">
        {/* Left column — Beige text */}
        <div
          data-reprise-left
          className="flex flex-col items-start justify-center bg-[#efe3d1] px-8 py-16 sm:px-12 lg:px-20"
        >
          <h2
            data-animate-text
            className="font-menu text-[clamp(2.4rem,6vw,7rem)] uppercase leading-[0.9] tracking-[0.02em] text-[#1b130e]"
          >
            Concept
          </h2>

          <p
            data-animate-text
            className="mt-8 max-w-md font-script text-[clamp(1rem,1.6vw,1.4rem)] lowercase leading-[1.7] tracking-[0.02em] text-[#1b130e]/70"
          >
            Dream-sustained by design, luminous in delivery.
          </p>

          <Link
            href="/concept"
            data-animate-text
            className="group relative mt-10 inline-flex items-center justify-center overflow-hidden rounded-none border border-[#1b130e]/25 bg-[#1b130e]/5 px-8 py-2.5 font-display text-[9px] uppercase tracking-[0.45em] text-[#1b130e] transition-colors duration-300 [transition-timing-function:var(--bee-ease)] hover:border-[#edb450] hover:text-[#edb450]"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#edb45033] to-transparent opacity-0 transition-transform duration-500 group-hover:translate-x-full group-hover:opacity-100" />
            Explore the concept
          </Link>
        </div>

        {/* Right column — Video */}
        <div data-reprise-right className="relative min-h-[50vh] lg:min-h-0">
          <SmartVideo
            wrapperClassName="absolute inset-0"
            className="h-full w-full object-cover"
            src={CONCEPT_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/_components/home-concept-reprise-panel.tsx
git commit -m "feat(home): add concept reprise two-column panel"
```

---

### Task 8: Create HomeFooter component

**Files:**

- Create: `src/app/_components/home-footer.tsx`

Half-screen footer with beige background, centered gold icon, and legal text at bottom.

- [ ] **Step 1: Create the component**

```tsx
import Image from 'next/image';

const ICON_GOLD = '/assets/icones/Ico Gold BEE-13.svg';

const LEGAL_TEXT = `Visual representations of the property, layout plans, and other materials are for illustration purposes only. All information on this website is provided for general informational use and does not constitute an offer or any form of binding commitment. All materials on this website, including design elements, are the intellectual property of the Organization. Any copying, reproduction, distribution (including reposting to other websites or online resources), or other use of these materials is prohibited without the prior written consent of the rights holder.`;

export function HomeFooter() {
  return (
    <footer
      data-footer
      className="relative flex h-[50vh] flex-col items-center justify-between bg-[#efe3d1] px-8 py-12 sm:px-12 lg:px-20"
    >
      {/* Centered icon */}
      <div className="flex flex-1 items-center justify-center">
        <Image
          src={ICON_GOLD}
          alt="Beeyondtheworld"
          width={120}
          height={120}
          className="h-20 w-20 lg:h-28 lg:w-28"
        />
      </div>

      {/* Legal text */}
      <p className="max-w-4xl text-center font-display text-[7px] uppercase leading-[2] tracking-[0.12em] text-[#1b130e]/40 sm:text-[8px]">
        {LEGAL_TEXT}
      </p>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/_components/home-footer.tsx
git commit -m "feat(home): add half-screen footer with legal text"
```

---

### Task 9: Final orchestrator wiring — Panels 7 + Footer

**Files:**

- Modify: `src/app/_components/home-experience.tsx`

Add Panel 7 (Concept Reprise) and the footer. Generalize the two-column detection to also handle `data-reprise-left`/`data-reprise-right`. The footer sits outside the panel stack — it's revealed when scrolling past the last panel.

- [ ] **Step 1: Import new components and update count**

```tsx
import { HomeConceptReprisePanel } from './home-concept-reprise-panel';
import { HomeFooter } from './home-footer';

const PANEL_COUNT = 7; // was 6
```

- [ ] **Step 2: Generalize column detection to include reprise panel**

Update the column detection in both forward and reverse directions:

```tsx
const leftCol =
  next.querySelector<HTMLElement>('[data-manifesto-left]') ??
  next.querySelector<HTMLElement>('[data-categories-left]') ??
  next.querySelector<HTMLElement>('[data-reprise-left]');
const rightCol =
  next.querySelector<HTMLElement>('[data-manifesto-right]') ??
  next.querySelector<HTMLElement>('[data-categories-right]') ??
  next.querySelector<HTMLElement>('[data-reprise-right]');
```

Same for reverse direction (querying `current`).

- [ ] **Step 3: Add Panel 7 + Footer to JSX**

```tsx
<div data-panel style={{ zIndex: 7 }}>
  <HomeConceptReprisePanel />
</div>
```

For the footer, change the container from `home-panel-stack` (which is `height: 100svh; overflow: hidden`) to allow the footer to appear below. Wrap the panels in an inner div and add the footer outside:

```tsx
return (
  <div ref={containerRef}>
    <div className="home-panel-stack">
      <div data-panel style={{ zIndex: 1 }}>
        <HomeHeroPanel />
      </div>
      {/* ... panels 2-7 ... */}
    </div>
    <HomeFooter />
  </div>
);
```

- [ ] **Step 4: Handle scroll from Panel 7 → Footer**

When the user scrolls forward past Panel 7, we need to scroll the page down to reveal the footer. Add footer scroll handling in the wheel handler:

When `activeRef.current === PANEL_COUNT - 1` (last panel) and user scrolls forward:

```tsx
if (direction === 1 && activeRef.current === PANEL_COUNT - 1) {
  // Scroll to footer
  const footer = container.querySelector<HTMLElement>('[data-footer]');
  if (footer) {
    footer.scrollIntoView({ behavior: 'smooth' });
  }
  return;
}
```

- [ ] **Step 5: Update the containerRef to point to the panel stack div**

Since we split the container, make sure `containerRef` still points to the element with `[data-panel]` children. Use a separate ref for the panel stack inner div:

```tsx
const stackRef = useRef<HTMLDivElement | null>(null);
```

And update the panel query selector to use `stackRef` while keeping `containerRef` on the outer wrapper for wheel events.

- [ ] **Step 6: Full integration test**

Verify all 7 panels navigate correctly forward and backward. Verify footer appears on scroll past Panel 7. Verify keyboard navigation works (arrow keys). Verify touch gestures work.

- [ ] **Step 7: Commit**

```bash
git add src/app/_components/home-experience.tsx
git commit -m "feat(home): complete 7-panel orchestrator with footer"
```

---

### Task 10: Add CSS utilities for new panels

**Files:**

- Modify: `src/app/globals.css`

- [ ] **Step 1: Add any needed styles**

After the existing `.home-snap-panel` block, add:

```css
/* Ripple cursor canvas should not block pointer events on parent */
.ripple-canvas {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 10;
}
```

Verify no other CSS is needed — most styling is done via Tailwind inline.

- [ ] **Step 2: Commit if changes were made**

```bash
git add src/app/globals.css
git commit -m "style(home): add ripple canvas utility class"
```

---

### Task 11: Visual QA and polish

**Files:**

- Possibly modify any of the new components for visual adjustments

- [ ] **Step 1: Run dev server and test full experience**

Run: `npm run dev`

Test checklist:

- [ ] Panel 4 (Concept): video plays, text centered, CTA works, "Concept" bottom-right
- [ ] Panel 5 (Categories): icons toggle correctly, image wipes on category change, text fades
- [ ] Panel 6 (Journeys): horizontal scroll works, ripple effect follows cursor, hover turns gold, links work
- [ ] Panel 7 (Concept Reprise): two-column layout, video plays, button links to /concept
- [ ] Footer: appears on scroll, icon centered, legal text readable
- [ ] All reverse transitions work smoothly
- [ ] Mobile/touch: swipe gestures navigate correctly
- [ ] No console errors

- [ ] **Step 2: Fix any visual issues found**

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat(home): complete home page panels extension with all transitions"
```
