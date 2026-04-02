'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

type Category = 'bees' | 'flowers' | 'honey';

const CATEGORIES: Category[] = ['bees', 'flowers', 'honey'];

const CATEGORY_IMAGES: Record<Category, string> = {
  bees: '/assets/campaigns/almaaz-kenya/almaaz-kenya-carousel-01.jpg',
  flowers: '/assets/journeys/bolivia-september-2026/bolivia-september-2026-gallery-10.png',
  honey: '/assets/campaigns/almaaz-kenya/almaaz-kenya-gallery-01.jpg',
};

const DEFAULT_IMAGE = '/assets/campaigns/almaaz-kenya/almaaz-kenya-gallery-01.jpg';

/** Desktop: bees & honey → image LEFT, flowers → image RIGHT */
const IMAGE_SIDE: Record<Category, 'left' | 'right'> = {
  bees: 'left',
  flowers: 'right',
  honey: 'left',
};

/** Mobile icons position: bees & honey → LEFT, flowers → RIGHT */
const MOBILE_ICONS_SIDE: Record<Category, 'left' | 'right'> = {
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

  // Track whether user has reached the last category (must visit all before advancing)
  const reachedEndRef = useRef(false);

  // Scroll-based navigation: cycle through categories on scroll within this panel
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let accumulatedDelta = 0;
    const THRESHOLD = 80;

    const onWheel = (e: WheelEvent) => {
      // Always block while animating — never let events leak to parent
      if (isAnimatingRef.current) {
        e.stopPropagation();
        return;
      }

      const currentIdx = active === null ? -1 : CATEGORIES.indexOf(active);

      accumulatedDelta += e.deltaY;
      if (Math.abs(accumulatedDelta) < THRESHOLD) {
        // Still accumulating — block parent from acting on partial scroll
        e.stopPropagation();
        return;
      }

      const direction = accumulatedDelta > 0 ? 1 : -1;
      accumulatedDelta = 0;

      if (direction === 1) {
        // Scrolling down → next category
        const nextIdx = currentIdx + 1;
        if (nextIdx < CATEGORIES.length) {
          e.stopPropagation();
          switchCategory(CATEGORIES[nextIdx]!);
          // Mark when we reach the last category
          if (nextIdx === CATEGORIES.length - 1) {
            reachedEndRef.current = true;
          }
        } else if (!reachedEndRef.current) {
          // Haven't visited last category yet — block advancement
          e.stopPropagation();
        }
        // If reachedEnd AND at last category, let parent handle → advance to next panel
      } else {
        // Scrolling up → previous category
        if (currentIdx > 0) {
          e.stopPropagation();
          switchCategory(CATEGORIES[currentIdx - 1]!);
        } else if (currentIdx === 0) {
          // Go back to default state
          e.stopPropagation();
          resetToDefault();
          reachedEndRef.current = false;
        }
        // If at default state, let parent handle scroll to previous panel
      }
    };

    let touchStartY = 0;

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (isAnimatingRef.current) {
        e.stopPropagation();
        return;
      }

      const deltaY = touchStartY - (e.changedTouches[0]?.clientY ?? 0);
      if (Math.abs(deltaY) < 40) return;

      const currentIdx = active === null ? -1 : CATEGORIES.indexOf(active);
      const direction = deltaY > 0 ? 1 : -1;

      if (direction === 1) {
        const nextIdx = currentIdx + 1;
        if (nextIdx < CATEGORIES.length) {
          e.stopPropagation();
          switchCategory(CATEGORIES[nextIdx]!);
          if (nextIdx === CATEGORIES.length - 1) reachedEndRef.current = true;
        } else if (!reachedEndRef.current) {
          e.stopPropagation();
        }
      } else {
        if (currentIdx > 0) {
          e.stopPropagation();
          switchCategory(CATEGORIES[currentIdx - 1]!);
        } else if (currentIdx === 0) {
          e.stopPropagation();
          resetToDefault();
          reachedEndRef.current = false;
        }
      }
    };

    section.addEventListener('wheel', onWheel, { passive: false });
    section.addEventListener('touchstart', onTouchStart, { passive: true });
    section.addEventListener('touchend', onTouchEnd, { passive: false });
    return () => {
      section.removeEventListener('wheel', onWheel);
      section.removeEventListener('touchstart', onTouchStart);
      section.removeEventListener('touchend', onTouchEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- switchCategory/resetToDefault change with active
  }, [active]);

  const resetToDefault = useCallback(() => {
    if (isAnimatingRef.current || active === null) return;
    isAnimatingRef.current = true;

    const section = sectionRef.current;
    if (!section) return;

    const twoColEl = section.querySelector<HTMLElement>('[data-two-col]');
    const imageColEl = section.querySelector<HTMLElement>('[data-cat-image]');
    const textColEl = section.querySelector<HTMLElement>('[data-cat-text]');
    const iconsEl = section.querySelector<HTMLElement>('[data-icons-overlay]');

    if (!twoColEl || !imageColEl || !textColEl) return;

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(twoColEl, { visibility: 'hidden' });
        setActive(null);
        isAnimatingRef.current = false;
      },
    });

    // Wipe out both columns
    tl.to(imageColEl, { clipPath: 'inset(100% 0 0 0)', duration: 0.9, ease: 'power2.inOut' }, 0);
    tl.to(textColEl, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'power2.inOut' }, 0);

    // Show icons overlay
    if (iconsEl) {
      tl.to(iconsEl, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.6);
    }
  }, [active]);

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
        /* --- First reveal: single-column → two-column --- */
        setActive(cat);

        twoColEl.style.direction = side === 'left' ? 'ltr' : 'rtl';
        gsap.set(twoColEl, { visibility: 'visible' });

        // Inverse sweep: image from bottom, text from top
        gsap.set(imageColEl, { clipPath: 'inset(100% 0 0 0)' });
        gsap.set(textColEl, { clipPath: 'inset(0 0 100% 0)' });

        if (iconsEl) {
          gsap.to(iconsEl, { opacity: 0, duration: 0.4, ease: 'power2.in' });
        }

        const textEls = textColEl.querySelectorAll<HTMLElement>('[data-animate-text]');
        gsap.set(textEls, { opacity: 0, y: 28 });

        const tl = gsap.timeline({
          onComplete: () => {
            isAnimatingRef.current = false;
          },
        });

        // Inverse sweep animation
        tl.to(
          imageColEl,
          { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'power2.inOut' },
          0.3
        );
        tl.to(textColEl, { clipPath: 'inset(0 0 0% 0)', duration: 1.4, ease: 'power2.inOut' }, 0.6);
        tl.to(textEls, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.12 }, 1.6);
      } else {
        /* --- Category switching --- */
        const prevSide = IMAGE_SIDE[active];
        const needsFlip = prevSide !== side;

        const tl = gsap.timeline({
          onComplete: () => {
            isAnimatingRef.current = false;
          },
        });

        tl.to(
          imageColEl,
          { clipPath: 'inset(100% 0 0 0)', duration: 0.9, ease: 'power2.inOut' },
          0
        );
        tl.to(textColEl, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'power2.inOut' }, 0);

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

        tl.to(
          imageColEl,
          { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'power2.inOut' },
          1.0
        );
        tl.to(textColEl, { clipPath: 'inset(0 0 0% 0)', duration: 1.2, ease: 'power2.inOut' }, 1.1);

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

  // Desktop: menu opposite to image side. Mobile: explicit per category.
  const desktopMenuSide = active ? (IMAGE_SIDE[active] === 'right' ? 'left' : 'right') : 'right';
  const mobileIconsSide = active ? MOBILE_ICONS_SIDE[active] : 'left';

  return (
    <section ref={sectionRef} className="home-snap-panel relative overflow-hidden">
      {/* ── Default state: full-screen image + icon overlay ── */}
      <div className="absolute inset-0">
        <Image src={DEFAULT_IMAGE} alt="" fill sizes="100vw" className="object-cover" priority />
      </div>

      {/* Dark overlay for default state */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,3,1,0.05)_0%,rgba(4,3,1,0.25)_60%,rgba(4,3,1,0.55)_100%)]" />

      {/* Icons overlay — vertical column, right-centered */}
      <div
        data-icons-overlay
        className="absolute right-8 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-8 sm:right-12 lg:right-20"
      >
        {CATEGORIES.map((cat) => {
          const icon = CATEGORY_ICONS[cat];
          const isHovered = hoveredIcon === cat;

          return (
            <button
              key={cat}
              onMouseEnter={() => setHoveredIcon(cat)}
              onMouseLeave={() => setHoveredIcon(null)}
              className="relative h-12 w-12 rounded-full transition-transform duration-300 [box-shadow:0_0_20px_rgba(244,187,82,0.15),0_0_40px_rgba(244,187,82,0.08)] hover:scale-110 hover:[box-shadow:0_0_28px_rgba(244,187,82,0.3),0_0_56px_rgba(244,187,82,0.15)] lg:h-14 lg:w-14"
              aria-label={icon.label}
            >
              <Image
                src={isHovered ? icon.gold : icon.white}
                alt=""
                fill
                sizes="56px"
                className="object-contain transition-opacity duration-300"
              />
            </button>
          );
        })}
      </div>

      {/* ── Two-row (mobile) / Two-column (desktop) layout — hidden until first category ── */}
      <div
        data-two-col
        className="absolute inset-0 z-20 grid grid-rows-2 lg:grid-cols-2 lg:grid-rows-1"
        style={{ visibility: 'hidden' }}
      >
        {/* Image: bottom on mobile (order-2), column on desktop (order-1) */}
        <div
          data-cat-image
          className="relative order-2 min-h-0 lg:order-1"
          style={{ direction: 'ltr' }}
        >
          <Image
            src={currentImage}
            alt=""
            fill
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover object-top"
          />
        </div>

        {/* Text: top on mobile (order-1), column on desktop (order-2) */}
        <div
          data-cat-text
          className="relative order-1 flex flex-col items-center justify-center bg-[#efe3d1] px-6 py-6 sm:px-12 sm:py-12 lg:order-2 lg:px-16 lg:py-16"
          style={{ direction: 'ltr' }}
        >
          {/* Icons — vertical column positioned left/right on mobile, absolute on desktop */}
          <div
            className={`absolute top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-5 lg:gap-8 ${
              mobileIconsSide === 'left' ? 'left-3 sm:left-5' : 'right-3 sm:right-5'
            } ${
              desktopMenuSide === 'left' ? 'lg:left-6 xl:left-12' : 'lg:right-6 xl:right-12'
            }`}
          >
            {CATEGORIES.map((cat) => {
              const icon = CATEGORY_ICONS[cat];
              const isActive = active === cat;
              const isHovered = hoveredIcon === cat;

              return (
                <button
                  key={cat}
                  onMouseEnter={() => setHoveredIcon(cat)}
                  onMouseLeave={() => setHoveredIcon(null)}
                  className="relative h-10 w-10 rounded-full transition-transform duration-300 [box-shadow:0_0_18px_rgba(244,187,82,0.12),0_0_36px_rgba(244,187,82,0.06)] hover:scale-110 hover:[box-shadow:0_0_24px_rgba(244,187,82,0.25),0_0_48px_rgba(244,187,82,0.12)] sm:h-11 sm:w-11 lg:h-10 lg:w-10"
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
          <div className="flex max-w-md flex-col items-center justify-center px-2 lg:px-8">
            {active && (
              <>
                <h2
                  data-animate-text
                  className="mb-4 text-center text-[clamp(1.4rem,4vw,3.6rem)] leading-[1.15] tracking-[0.03em] text-[#1b130e] lg:mb-8"
                >
                  {CATEGORY_CONTENT[active].subtitle}
                </h2>
                <div
                  data-animate-text
                  className="max-w-md text-center font-sans text-[clamp(0.68rem,0.95vw,0.9rem)] leading-[1.7] tracking-[0.01em] text-[#1b130e]/70 lg:leading-[1.85]"
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
