'use client';

import { gsap } from 'gsap';
import { useCallback, useEffect, useRef } from 'react';

import { HomeHeroPanel } from './home-hero-panel';
import { HomeCreativePanel } from './home-creative-panel';
import { HomeJourneysPanel } from './home-journeys-panel';
import { HomeConceptPanel } from './home-concept-panel';
import { HomeCategoriesPanel } from './home-categories-panel';
import { HomeManifestoPanel } from './home-manifesto-panel';
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
      /* ── Forward ── */
      const next = panelEls[index];
      if (!next) return;

      const outgoing = panelEls[activeRef.current];
      if (outgoing) animateTextOut(outgoing);

      const hasDualSweep = next.querySelector('[data-dual-sweep]');

      if (hasDualSweep) {
        /* Dual-sweep reveal: left column top→bottom, right column bottom→top */
        const leftCol = next.querySelector<HTMLElement>('[data-col-left]');
        const rightCol = next.querySelector<HTMLElement>('[data-col-right]');

        gsap.set(next, { clipPath: 'inset(0% 0 0 0)', visibility: 'visible' });

        if (leftCol && rightCol) {
          gsap.set(leftCol, { clipPath: 'inset(0 0 100% 0)' });
          gsap.set(rightCol, { clipPath: 'inset(100% 0 0 0)' });

          gsap.to(leftCol, {
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.4,
            ease: 'power3.inOut',
          });
          gsap.to(rightCol, {
            clipPath: 'inset(0% 0 0 0)',
            duration: 1.4,
            ease: 'power3.inOut',
            delay: 0.1,
            onComplete: () => {
              animateTextIn(next, 0.1);
              activeRef.current = index;
              isAnimatingRef.current = false;
            },
          });
        }
      } else {
        /* Default: wipe next panel bottom → top */
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
      /* ── Backward ── */
      const current = panelEls[activeRef.current];
      if (!current) return;

      const incoming = panelEls[index];
      const hasDualSweep = current.querySelector('[data-dual-sweep]');

      animateTextOut(current);

      if (hasDualSweep) {
        /* Dual-sweep exit: reverse the columns */
        const leftCol = current.querySelector<HTMLElement>('[data-col-left]');
        const rightCol = current.querySelector<HTMLElement>('[data-col-right]');

        if (leftCol && rightCol) {
          gsap.to(leftCol, {
            clipPath: 'inset(0 0 100% 0)',
            duration: 1,
            ease: 'power3.inOut',
          });
          gsap.to(rightCol, {
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

    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [goTo]);

  return (
    <div ref={containerRef} className="home-panel-stack">
      {/* Panel 1: Hero */}
      <div data-panel style={{ zIndex: 1 }}>
        <HomeHeroPanel />
      </div>

      {/* Panel 2: Creative Visuals Production */}
      <div data-panel style={{ zIndex: 2 }}>
        <HomeCreativePanel coCreateHref={coCreateHref} />
      </div>

      {/* Panel 3: Manifesto — full-screen video */}
      <div data-panel style={{ zIndex: 3 }}>
        <HomeManifestoPanel />
      </div>

      {/* Panel 4: Journeys — Spring/Summer & Fall/Winter */}
      <div data-panel style={{ zIndex: 4 }}>
        <HomeJourneysPanel />
      </div>

      {/* Panel 5: Triptique (Categories) */}
      <div data-panel style={{ zIndex: 5 }}>
        <HomeCategoriesPanel />
      </div>

      {/* Panel 6: Concept */}
      <div data-panel style={{ zIndex: 6 }}>
        <HomeConceptPanel />
      </div>

      {/* Panel 7: Footer */}
      <div data-panel style={{ zIndex: 7 }}>
        <HomeFooter />
      </div>
    </div>
  );
}
