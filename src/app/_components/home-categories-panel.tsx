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
          currentImageRef.current = newSrc;
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
