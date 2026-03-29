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

const DEFAULT_IMAGE = '/assets/campaigns/almaaz-kenya/almaaz-kenya-gallery-01.jpg';

/** bees & honey → image LEFT, flowers → image RIGHT */
const IMAGE_SIDE: Record<Category, 'left' | 'right'> = {
  bees: 'left',
  flowers: 'right',
  honey: 'left',
};

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
  const sectionRef = useRef<HTMLElement>(null);
  const isAnimatingRef = useRef(false);

  const switchCategory = useCallback(
    (cat: Category) => {
      if (cat === active || isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      const section = sectionRef.current;
      if (!section) return;

      const twoColEl = section.querySelector<HTMLElement>('[data-two-col]');
      const imageColEl = section.querySelector<HTMLElement>('[data-cat-image]');
      const textColEl = section.querySelector<HTMLElement>('[data-cat-text]');
      const iconsEl = section.querySelector<HTMLElement>('[data-icons-overlay]');

      if (!twoColEl || !imageColEl || !textColEl) return;

      const side = IMAGE_SIDE[cat];

      if (active === null) {
        /* --- First click: single-column → two-column reveal --- */
        setActive(cat);

        // Configure column order based on image side
        twoColEl.style.direction = side === 'left' ? 'ltr' : 'rtl';

        // Show the two-column layout
        gsap.set(twoColEl, { visibility: 'visible' });
        gsap.set(imageColEl, { clipPath: 'inset(100% 0 0 0)' });
        gsap.set(textColEl, { clipPath: 'inset(0 0 100% 0)' });

        // Hide icons overlay
        if (iconsEl) {
          gsap.to(iconsEl, { opacity: 0, duration: 0.4, ease: 'power2.in' });
        }

        // Fade out content elements initially
        const textEls = textColEl.querySelectorAll<HTMLElement>('[data-animate-text]');
        gsap.set(textEls, { opacity: 0, y: 28 });

        const tl = gsap.timeline({
          onComplete: () => {
            isAnimatingRef.current = false;
          },
        });

        // Image column wipes bottom→top
        tl.to(
          imageColEl,
          {
            clipPath: 'inset(0% 0 0 0)',
            duration: 1.4,
            ease: 'power2.inOut',
          },
          0.3
        );

        // Text column wipes top→bottom
        tl.to(
          textColEl,
          {
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.4,
            ease: 'power2.inOut',
          },
          0.6
        );

        // Fade in text
        tl.to(
          textEls,
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            stagger: 0.12,
          },
          1.6
        );
      } else {
        /* --- Category switching: inverse wipe both columns --- */
        const prevSide = IMAGE_SIDE[active];
        const needsFlip = prevSide !== side;

        const tl = gsap.timeline({
          onComplete: () => {
            isAnimatingRef.current = false;
          },
        });

        // Step 1: Wipe out both columns simultaneously in opposite directions
        tl.to(
          imageColEl,
          {
            clipPath: 'inset(100% 0 0 0)',
            duration: 0.9,
            ease: 'power2.inOut',
          },
          0
        );

        tl.to(
          textColEl,
          {
            clipPath: 'inset(0 0 100% 0)',
            duration: 0.9,
            ease: 'power2.inOut',
          },
          0
        );

        // Step 2: Mid-transition — update state and column order
        tl.call(
          () => {
            setActive(cat);
            if (needsFlip) {
              twoColEl.style.direction = side === 'left' ? 'ltr' : 'rtl';
            }
            const textEls = textColEl.querySelectorAll<HTMLElement>('[data-animate-text]');
            gsap.set(textEls, { opacity: 0, y: 28 });
          },
          [],
          0.95
        );

        // Step 3: Wipe in both columns in opposite directions
        tl.to(
          imageColEl,
          {
            clipPath: 'inset(0% 0 0 0)',
            duration: 1.2,
            ease: 'power2.inOut',
          },
          1.0
        );

        tl.to(
          textColEl,
          {
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.2,
            ease: 'power2.inOut',
          },
          1.1
        );

        // Step 4: Fade in text
        tl.call(
          () => {
            const textEls = textColEl.querySelectorAll<HTMLElement>('[data-animate-text]');
            gsap.to(textEls, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: 'power2.out',
              stagger: 0.12,
            });
          },
          [],
          1.8
        );
      }
    },
    [active]
  );

  const currentImage = active ? CATEGORY_IMAGES[active] : DEFAULT_IMAGE;

  return (
    <section ref={sectionRef} className="home-snap-panel relative overflow-hidden">
      {/* ── Default state: full-screen image + icon overlay ── */}
      <div className="absolute inset-0">
        <Image src={DEFAULT_IMAGE} alt="" fill sizes="100vw" className="object-cover" priority />
      </div>

      {/* Icons overlay — vertical column, right-centered */}
      <div
        data-icons-overlay
        className="absolute right-8 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-8 sm:right-12 lg:right-20"
      >
        {(Object.keys(CATEGORY_ICONS) as Category[]).map((cat) => {
          const icon = CATEGORY_ICONS[cat];
          const isHovered = hoveredIcon === cat;
          const isActive = active === cat;

          return (
            <button
              key={cat}
              onClick={() => switchCategory(cat)}
              onMouseEnter={() => setHoveredIcon(cat)}
              onMouseLeave={() => setHoveredIcon(null)}
              className="relative h-12 w-12 transition-transform duration-300 hover:scale-110 lg:h-14 lg:w-14"
              aria-label={icon.label}
            >
              <Image
                src={isHovered || isActive ? icon.gold : icon.white}
                alt=""
                fill
                sizes="56px"
                className="object-contain transition-opacity duration-300"
              />
            </button>
          );
        })}
      </div>

      {/* ── Two-column layout (hidden until first category click) ── */}
      <div
        data-two-col
        className="absolute inset-0 z-20 grid grid-cols-1 lg:grid-cols-2"
        style={{ visibility: 'hidden' }}
      >
        {/* Image column */}
        <div
          data-cat-image
          className="relative min-h-[50vh] lg:min-h-0"
          style={{ direction: 'ltr' }}
        >
          <Image src={currentImage} alt="" fill sizes="50vw" className="object-cover object-top" />
        </div>

        {/* Text column */}
        <div
          data-cat-text
          className="relative flex flex-col items-center justify-center bg-[#efe3d1] px-8 py-12 sm:px-12 lg:px-16 lg:py-16"
          style={{ direction: 'ltr' }}
        >
          {/* Icons inside two-col view — same vertical column, right-side */}
          <div className="absolute right-6 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-8 sm:right-8 lg:right-12">
            {(Object.keys(CATEGORY_ICONS) as Category[]).map((cat) => {
              const icon = CATEGORY_ICONS[cat];
              const isActive = active === cat;
              const isHovered = hoveredIcon === cat;

              return (
                <button
                  key={cat}
                  onClick={() => switchCategory(cat)}
                  onMouseEnter={() => setHoveredIcon(cat)}
                  onMouseLeave={() => setHoveredIcon(null)}
                  className="relative h-10 w-10 transition-transform duration-300 hover:scale-110"
                  aria-label={icon.label}
                >
                  <Image
                    src={isActive || isHovered ? icon.gold : icon.white}
                    alt=""
                    fill
                    sizes="40px"
                    className={`object-contain transition-opacity duration-300 ${
                      !isActive && !isHovered ? 'opacity-40 brightness-0' : ''
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Category content — centered */}
          <div className="flex max-w-md flex-col items-center justify-center px-4 lg:px-8">
            {active && (
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
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
