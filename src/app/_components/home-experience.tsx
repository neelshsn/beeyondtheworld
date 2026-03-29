'use client';

import { gsap } from 'gsap';
import { useCallback, useEffect, useRef } from 'react';

import { HomeHeroPanel } from './home-hero-panel';
import { HomeCreativePanel } from './home-creative-panel';
import { HomeManifestoPanel } from './home-manifesto-panel';
import { HomeConceptPanel } from './home-concept-panel';
import { HomeCategoriesPanel } from './home-categories-panel';
import { HomeJourneysPanel } from './home-journeys-panel';
import { HomeConceptReprisePanel } from './home-concept-reprise-panel';
import { HomeFooter } from './home-footer';

const PANEL_COUNT = 7;

/** Staggered fade-in for all [data-animate-text] inside a panel */
function animateTextIn(panel: HTMLElement, delay = 0) {
  const els = panel.querySelectorAll<HTMLElement>('[data-animate-text]');
  gsap.set(els, { opacity: 0, y: 28 });
  gsap.to(els, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: 'power2.out',
    stagger: 0.12,
    delay,
  });
}

function animateTextOut(panel: HTMLElement) {
  const els = panel.querySelectorAll<HTMLElement>('[data-animate-text]');
  gsap.to(els, { opacity: 0, y: -16, duration: 0.6, ease: 'power2.in', stagger: 0.06 });
}

type HomeExperienceProps = {
  coCreateHref: string;
};

export default function HomeExperience({ coCreateHref }: HomeExperienceProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef(0);
  const isAnimatingRef = useRef(false);

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= PANEL_COUNT || index === activeRef.current || isAnimatingRef.current)
      return;

    isAnimatingRef.current = true;
    const container = containerRef.current;
    if (!container) return;

    const direction = index > activeRef.current ? 1 : -1;
    const panelEls = container.querySelectorAll<HTMLElement>('[data-panel]');

    if (direction === 1) {
      const next = panelEls[index];
      if (!next) return;

      const leftCol =
        next.querySelector<HTMLElement>('[data-manifesto-left]') ??
        next.querySelector<HTMLElement>('[data-categories-left]') ??
        next.querySelector<HTMLElement>('[data-reprise-left]');
      const rightCol =
        next.querySelector<HTMLElement>('[data-manifesto-right]') ??
        next.querySelector<HTMLElement>('[data-categories-right]') ??
        next.querySelector<HTMLElement>('[data-reprise-right]');

      /* Hide text of outgoing panel */
      const outgoing = panelEls[activeRef.current];
      if (outgoing) animateTextOut(outgoing);

      if (leftCol && rightCol) {
        /*
         * Panel 2 → 3 choreography:
         * 1. Fade out Panel 2 text+buttons (bg stays visible)
         * 2. Wipe-reveal left beige column (left→right) over Panel 2 bg
         * 3. Wipe-reveal right video column (left→right)
         * 4. Fade-in manifesto text on left
         */
        const textEls = next.querySelectorAll<HTMLElement>('[data-animate-text]');
        gsap.set(next, { visibility: 'visible' });
        gsap.set(leftCol, { clipPath: 'inset(0 100% 0 0)' });
        gsap.set(rightCol, { clipPath: 'inset(100% 0 0 0)' });
        gsap.set(textEls, { opacity: 0, y: 28 });

        const tl = gsap.timeline({
          onComplete: () => {
            activeRef.current = index;
            isAnimatingRef.current = false;
          },
        });

        /* Step 1: fade out Panel 2 text+buttons */
        /* Already handled by animateTextOut(outgoing) above */

        /* Step 2: wipe left beige column left→right */
        tl.to(
          leftCol,
          {
            clipPath: 'inset(0 0% 0 0)',
            duration: 1.6,
            ease: 'power2.inOut',
          },
          0.6
        );

        /* Step 3: wipe right video column bottom→top */
        tl.to(
          rightCol,
          {
            clipPath: 'inset(0% 0 0 0)',
            duration: 1.6,
            ease: 'power2.inOut',
          },
          1.4
        );

        /* Step 4: fade-in manifesto text on left */
        tl.to(
          textEls,
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
            stagger: 0.15,
          },
          2.6
        );
      } else {
        /* Panel 2: wipe from bottom to top */
        gsap.set(next, { clipPath: 'inset(100% 0 0 0)', visibility: 'visible' });
        gsap.to(next, {
          clipPath: 'inset(0% 0 0 0)',
          duration: 1,
          ease: 'power3.inOut',
          onComplete: () => {
            animateTextIn(next, 0.1);
            activeRef.current = index;
            isAnimatingRef.current = false;
          },
        });
      }
    } else {
      const current = panelEls[activeRef.current];
      if (!current) return;

      const leftCol =
        current.querySelector<HTMLElement>('[data-manifesto-left]') ??
        current.querySelector<HTMLElement>('[data-categories-left]') ??
        current.querySelector<HTMLElement>('[data-reprise-left]');
      const rightCol =
        current.querySelector<HTMLElement>('[data-manifesto-right]') ??
        current.querySelector<HTMLElement>('[data-categories-right]') ??
        current.querySelector<HTMLElement>('[data-reprise-right]');

      /* Hide text of outgoing panel */
      animateTextOut(current);

      const incoming = panelEls[index];

      if (leftCol && rightCol) {
        /*
         * Panel 3 → 2 reverse choreography:
         * 1. Fade out manifesto text
         * 2. Wipe-hide right video column (right→left)
         * 3. Wipe-hide left beige column (right→left), revealing Panel 2 bg
         * 4. Fade-in Panel 2 text+buttons
         */
        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(current, { visibility: 'hidden' });
            if (incoming) animateTextIn(incoming, 0.1);
            activeRef.current = index;
            isAnimatingRef.current = false;
          },
        });

        /* Step 1: fade out manifesto text (already called animateTextOut above) */

        /* Step 2: wipe-hide right video column top→bottom */
        tl.to(
          rightCol,
          {
            clipPath: 'inset(100% 0 0 0)',
            duration: 1.4,
            ease: 'power2.inOut',
          },
          0.5
        );

        /* Step 3: wipe-hide left beige column right→left */
        tl.to(
          leftCol,
          {
            clipPath: 'inset(0 100% 0 0)',
            duration: 1.4,
            ease: 'power2.inOut',
          },
          1.2
        );
      } else {
        gsap.to(current, {
          clipPath: 'inset(100% 0 0 0)',
          duration: 1,
          ease: 'power3.inOut',
          onComplete: () => {
            gsap.set(current, { visibility: 'hidden' });
            if (incoming) animateTextIn(incoming, 0.1);
            activeRef.current = index;
            isAnimatingRef.current = false;
          },
        });
      }
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* Initialise: hide panels 2+ and animate panel 1 text */
    const panelEls = container.querySelectorAll<HTMLElement>('[data-panel]');
    panelEls.forEach((el, i) => {
      if (i > 0) {
        el.style.visibility = 'hidden';
      }
    });

    /* Entrance animation for panel 1 text */
    const firstPanel = panelEls[0];
    if (firstPanel) animateTextIn(firstPanel, 0.6);

    let accumulatedDelta = 0;
    const THRESHOLD = 60;
    let touchStartY = 0;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isAnimatingRef.current) return;

      accumulatedDelta += e.deltaY;

      if (Math.abs(accumulatedDelta) < THRESHOLD) return;

      const direction = accumulatedDelta > 0 ? 1 : -1;
      accumulatedDelta = 0;

      // Check if active panel wants to handle scroll internally (e.g. journeys horizontal scroll)
      const currentPanel = panelEls[activeRef.current];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const journeyWheel = (currentPanel as any)?.__journeyWheel as
        | ((delta: number) => boolean)
        | undefined;

      if (journeyWheel) {
        const consumed = journeyWheel(direction * 100);
        if (consumed) return;
      }

      // If on the last panel and scrolling forward, scroll to footer
      if (direction === 1 && activeRef.current === PANEL_COUNT - 1) {
        const footer = wrapperRef.current?.querySelector<HTMLElement>('[data-footer]');
        if (footer) {
          footer.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }

      goTo(activeRef.current + direction);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (isAnimatingRef.current) return;
      const deltaY = touchStartY - (e.changedTouches[0]?.clientY ?? 0);
      if (Math.abs(deltaY) < 40) return;

      if (deltaY > 0) goTo(activeRef.current + 1);
      else goTo(activeRef.current - 1);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isAnimatingRef.current) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goTo(activeRef.current + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goTo(activeRef.current - 1);
      }
    };

    const wrapper = wrapperRef.current ?? container;
    wrapper.addEventListener('wheel', onWheel, { passive: false });
    wrapper.addEventListener('touchstart', onTouchStart, { passive: true });
    wrapper.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      wrapper.removeEventListener('wheel', onWheel);
      wrapper.removeEventListener('touchstart', onTouchStart);
      wrapper.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [goTo]);

  return (
    <div ref={wrapperRef}>
      <div ref={containerRef} className="home-panel-stack">
        <div data-panel style={{ zIndex: 1 }}>
          <HomeHeroPanel />
        </div>
        <div data-panel style={{ zIndex: 2 }}>
          <HomeCreativePanel coCreateHref={coCreateHref} />
        </div>
        <div data-panel style={{ zIndex: 3 }}>
          <HomeManifestoPanel />
        </div>
        <div data-panel style={{ zIndex: 4 }}>
          <HomeConceptPanel />
        </div>
        <div data-panel style={{ zIndex: 5 }}>
          <HomeCategoriesPanel />
        </div>
        <div data-panel style={{ zIndex: 6 }}>
          <HomeJourneysPanel />
        </div>
        <div data-panel style={{ zIndex: 7 }}>
          <HomeConceptReprisePanel />
        </div>
      </div>
      <HomeFooter />
    </div>
  );
}
