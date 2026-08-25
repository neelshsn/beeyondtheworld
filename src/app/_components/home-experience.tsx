'use client';

import { gsap } from 'gsap';
import Image from 'next/image';
import { useCallback, useEffect, useRef } from 'react';

import { HomeHeroPanel } from './home-hero-panel';
import { HomeCreativePanel } from './home-creative-panel';
import { HomeJourneysPanel } from './home-journeys-panel';
import { HomeConceptPanel } from './home-concept-panel';
import { HomeCategoriesPanel } from './home-categories-panel';
import { HomeManifestoPanel } from './home-manifesto-panel';
import { HomeFooter } from './home-footer';

/* T-006 : réactiver en passant à true (ré-affiche le triptyque « We are bees / the world
   as flowers / the honey of advertising » et sa scroll interception interne) */
const SHOW_CATEGORIES_PANEL = false;

const PANEL_COUNT = SHOW_CATEGORIES_PANEL ? 7 : 6;
const MOBILE_BP = '(max-width: 1023px)';

/* T-003 : animations d'entrée/sortie des textes de la home désactivées temporairement
   (refonte à venir). Repasser à true pour restaurer les fades/slides d'apparition. */
const TEXT_ENTRY_ANIMATIONS_ENABLED = false;

/** Staggered fade-in for all [data-animate-text] inside a panel */
function animateTextIn(panel: HTMLElement, delay = 0) {
  const els = panel.querySelectorAll<HTMLElement>('[data-animate-text]');
  if (!TEXT_ENTRY_ANIMATIONS_ENABLED) {
    /* T-003 : textes rendus statiques et pleinement visibles */
    gsap.set(els, { opacity: 1, y: 0 });
    return;
  }
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
  if (!TEXT_ENTRY_ANIMATIONS_ENABLED) return; /* T-003 : textes statiques, pas de fade-out */
  const els = panel.querySelectorAll<HTMLElement>('[data-animate-text]');
  gsap.to(els, { opacity: 0, y: -16, duration: 0.6, ease: 'power2.in', stagger: 0.06 });
}

/** Get clip-path values for dual-sweep based on viewport */
function getDualSweepClips() {
  const isMobile = window.matchMedia(MOBILE_BP).matches;
  if (isMobile) {
    // Mobile: top row sweeps left→right, bottom row sweeps right→left
    return {
      leftHidden: 'inset(0 0 0 100%)', // top row hidden on left side
      leftVisible: 'inset(0 0 0 0%)', // reveals left→right
      rightHidden: 'inset(0 100% 0 0)', // bottom row hidden on right side
      rightVisible: 'inset(0 0% 0 0)', // reveals right→left
    };
  }
  // Desktop: vertical sweeps in opposite directions
  return {
    leftHidden: 'inset(0 0 100% 0)', // hidden below
    leftVisible: 'inset(0 0 0% 0)',
    rightHidden: 'inset(100% 0 0 0)', // hidden above
    rightVisible: 'inset(0% 0 0 0)',
  };
}

type HomeExperienceProps = {
  coCreateHref: string;
};

export default function HomeExperience({ coCreateHref }: HomeExperienceProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef(0);
  const isAnimatingRef = useRef(false);

  /** Reveal a panel with dual-sweep: responsive direction (horizontal on mobile, vertical on desktop) */
  const revealDualSweep = (panel: HTMLElement, onComplete: () => void) => {
    const leftCol = panel.querySelector<HTMLElement>('[data-col-left]');
    const rightCol = panel.querySelector<HTMLElement>('[data-col-right]');
    const clips = getDualSweepClips();

    gsap.set(panel, { clipPath: 'inset(0% 0 0 0)', visibility: 'visible' });

    if (leftCol && rightCol) {
      gsap.set(leftCol, { clipPath: clips.leftHidden });
      gsap.set(rightCol, { clipPath: clips.rightHidden });

      gsap.to(leftCol, {
        clipPath: clips.leftVisible,
        duration: 1.4,
        ease: 'power3.inOut',
      });
      gsap.to(rightCol, {
        clipPath: clips.rightVisible,
        duration: 1.4,
        ease: 'power3.inOut',
        delay: 0.1,
        onComplete,
      });
    } else {
      onComplete();
    }
  };

  /** Default wipe: bottom → top */
  const revealDefault = (panel: HTMLElement, onComplete: () => void) => {
    gsap.set(panel, { clipPath: 'inset(100% 0 0 0)', visibility: 'visible' });
    gsap.to(panel, {
      clipPath: 'inset(0% 0 0 0)',
      duration: 1,
      ease: 'power3.inOut',
      onComplete,
    });
  };

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
      const outgoingHasDualSweep = outgoing?.querySelector('[data-dual-sweep]');
      const nextHasDualSweep = next.querySelector('[data-dual-sweep]');

      /* T-005 : masquer les panels périmés sous la pile — leur vidéo de fond
         réapparaissait un instant pendant le sweep de sortie du panel Journeys */
      panelEls.forEach((el, i) => {
        if (i !== activeRef.current && i !== index) {
          gsap.set(el, { visibility: 'hidden' });
        }
      });

      /* T-008 : le footer compact ne couvre pas l'écran — garder le panel
         précédent visible derrière lui */
      const nextIsCompact = Boolean(next.querySelector('[data-footer]'));

      /* Always animate text out on the outgoing panel */
      if (outgoing) animateTextOut(outgoing);

      if (outgoingHasDualSweep && outgoing) {
        /* ── Reverse-sweep exit: undo the dual columns before revealing next ── */
        const leftCol = outgoing.querySelector<HTMLElement>('[data-col-left]');
        const rightCol = outgoing.querySelector<HTMLElement>('[data-col-right]');
        const clips = getDualSweepClips();

        const revealNext = () => {
          gsap.set(outgoing, { visibility: 'hidden' });
          /* Reset columns so re-entry works later */
          if (leftCol) gsap.set(leftCol, { clipPath: clips.leftVisible });
          if (rightCol) gsap.set(rightCol, { clipPath: clips.rightVisible });

          if (nextHasDualSweep) {
            revealDualSweep(next, () => {
              animateTextIn(next, 0.1);
              activeRef.current = index;
              isAnimatingRef.current = false;
            });
          } else {
            revealDefault(next, () => {
              animateTextIn(next, 0.1);
              activeRef.current = index;
              isAnimatingRef.current = false;
            });
          }
        };

        if (leftCol && rightCol) {
          /* Reverse the entry direction (back to hidden state) */
          gsap.to(leftCol, {
            clipPath: clips.leftHidden,
            duration: 1,
            ease: 'power3.inOut',
          });
          gsap.to(rightCol, {
            clipPath: clips.rightHidden,
            duration: 1,
            ease: 'power3.inOut',
            onComplete: revealNext,
          });
        } else {
          revealNext();
        }
      } else if (nextHasDualSweep) {
        /* ── Dual-sweep reveal for the incoming panel ── */
        revealDualSweep(next, () => {
          /* T-005 : une fois le panel suivant en place, masquer le sortant
             pour que sa vidéo ne puisse plus transparaître */
          if (outgoing && !nextIsCompact) gsap.set(outgoing, { visibility: 'hidden' });
          animateTextIn(next, 0.1);
          activeRef.current = index;
          isAnimatingRef.current = false;
        });
      } else {
        /* ── Default: wipe next panel bottom → top ── */
        revealDefault(next, () => {
          /* T-005 : idem — le panel sortant est caché une fois recouvert */
          if (outgoing && !nextIsCompact) gsap.set(outgoing, { visibility: 'hidden' });
          animateTextIn(next, 0.1);
          activeRef.current = index;
          isAnimatingRef.current = false;
        });
      }
    } else {
      /* ── Backward ── */
      const current = panelEls[activeRef.current];
      if (!current) return;

      const incoming = panelEls[index];
      const hasDualSweep = current.querySelector('[data-dual-sweep]');

      /* T-005 : le panel entrant a pu être masqué à la fin d'une transition
         aller — le ré-afficher pleinement avant de retirer le panel courant */
      if (incoming) {
        gsap.set(incoming, { visibility: 'visible', clipPath: 'inset(0% 0 0 0)' });
      }

      /* Always animate text out on the current panel */
      animateTextOut(current);

      if (hasDualSweep) {
        /* Dual-sweep exit: reverse the columns */
        const leftCol = current.querySelector<HTMLElement>('[data-col-left]');
        const rightCol = current.querySelector<HTMLElement>('[data-col-right]');
        const clips = getDualSweepClips();

        if (leftCol && rightCol) {
          gsap.to(leftCol, {
            clipPath: clips.leftHidden,
            duration: 1,
            ease: 'power3.inOut',
          });
          gsap.to(rightCol, {
            clipPath: clips.rightHidden,
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
    /* T-005 : fond sombre derrière la pile — le sweep de sortie du panel Journeys
       révèle désormais ce fond au lieu de la vidéo du panel précédent.
       T-009 : h-[100dvh] suit le viewport dynamique mobile (barre d'URL) pour que
       le fond beige du layout n'apparaisse plus en bande sous les panels. */
    <div ref={containerRef} className="home-panel-stack h-[100dvh] bg-[#040301]">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          src="/assets/home/kenya-transition.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,3,1,0.18),rgba(4,3,1,0.36))]" />
      </div>
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

      {/* Panel 5: Triptique (Categories) — T-006 : archivé derrière SHOW_CATEGORIES_PANEL.
          Sa scroll interception interne disparaît avec lui : le scroll passe
          directement au panel Concept. */}
      {SHOW_CATEGORIES_PANEL ? (
        <div data-panel style={{ zIndex: 5 }}>
          <HomeCategoriesPanel />
        </div>
      ) : null}

      {/* Panel 6: Concept */}
      <div data-panel style={{ zIndex: 6 }}>
        <HomeConceptPanel />
      </div>

      {/* Panel 7: Footer — T-008 : bloc compact ancré en bas (hauteur auto,
          hors « snap » plein écran) qui s'enchaîne sur le panel Concept resté visible */}
      <div data-panel style={{ zIndex: 7, top: 'auto', height: 'auto' }}>
        <HomeFooter />
      </div>
    </div>
  );
}
