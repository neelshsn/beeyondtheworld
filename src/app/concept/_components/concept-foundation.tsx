'use client';

import { SmartVideo } from '@/components/primitives/smart-video';

import {
  conceptNodes,
  type ConceptEditorialNode,
  type ConceptInteractiveNode,
} from '@content/concept';

import Image from 'next/image';

import { useCallback, useEffect, useMemo, useRef } from 'react';

import { AnimatePresence, motion, type Transition } from 'framer-motion';

import { ConceptGoToIndexOptions, ConceptTrackProvider } from '../_context/concept-track-context';

import { Icono } from '../_components/icono';

import { useBodyScrollLock } from '../_hooks/use-body-scroll-lock';

import { useMotionPreferenceGuard } from '../_hooks/use-motion-preference-guard';

import { usePrefersReducedMotion } from '../_hooks/use-prefers-reduced-motion';

import { useConceptInteractionStore } from '../_store/use-concept-interaction-store';

const SNAP_TIMEOUT = 140;

const ENTER_INTERACTIVE_SELECTOR =
  'button, a, input, textarea, select, [role="button"], [data-interactive]';

export function ConceptFoundation() {
  useBodyScrollLock();

  useMotionPreferenceGuard();

  const prefersReducedMotion = usePrefersReducedMotion();

  const trackRef = useRef<HTMLDivElement | null>(null);

  const isProgrammaticScrollRef = useRef(false);

  const pendingIndexRef = useRef<number | null>(null);

  const targetIndexRef = useRef(0);

  const snapTimeoutRef = useRef<number | undefined>(undefined);

  const hasAppliedOpenParamRef = useRef(false);

  const currentIndex = useConceptInteractionStore((state) => state.currentIndex);

  const openIndex = useConceptInteractionStore((state) => state.openIndex);

  const setCurrentIndex = useConceptInteractionStore((state) => state.setCurrentIndex);

  const selectIndex = useConceptInteractionStore((state) => state.selectIndex);

  const setOpenIndex = useConceptInteractionStore((state) => state.setOpenIndex);

  const totalNodes = conceptNodes.length;

  const progressValue = totalNodes > 0 ? ((currentIndex + 1) / totalNodes) * 100 : 0;

  const activeNode = conceptNodes[Math.max(0, Math.min(conceptNodes.length - 1, currentIndex))];

  const activeBackground = activeNode?.kind === 'interactive' ? activeNode.background : undefined;

  const goToIndex = useCallback(
    (index: number, { smooth = true, preserveOpen = false }: ConceptGoToIndexOptions = {}) => {
      const clamped = Math.max(0, Math.min(conceptNodes.length - 1, index));

      const container = trackRef.current;

      if (!preserveOpen) {
        setOpenIndex(null);
      }

      if (!container) {
        pendingIndexRef.current = clamped;

        setCurrentIndex(clamped);

        return;
      }

      const width = container.clientWidth || window.innerWidth || 1;

      const behavior = smooth && !prefersReducedMotion ? 'smooth' : 'auto';

      targetIndexRef.current = clamped;

      isProgrammaticScrollRef.current = true;

      container.scrollTo({
        left: clamped * width,

        behavior,
      });

      if (behavior === 'auto') {
        setCurrentIndex(clamped);

        isProgrammaticScrollRef.current = false;
      }
    },

    [prefersReducedMotion, setCurrentIndex, setOpenIndex]
  );

  useEffect(() => {
    if (!trackRef.current || pendingIndexRef.current === null) {
      return;
    }

    const pending = pendingIndexRef.current;

    pendingIndexRef.current = null;

    goToIndex(pending, { smooth: false });
  }, [goToIndex]);

  useEffect(() => {
    const container = trackRef.current;

    if (!container) {
      return;
    }

    const handleScroll = () => {
      const width = container.clientWidth || window.innerWidth || 1;

      const nextIndex = Math.round(container.scrollLeft / width);

      setCurrentIndex(nextIndex);

      if (openIndex !== null && openIndex !== nextIndex) {
        setOpenIndex(null);
      }

      if (isProgrammaticScrollRef.current && nextIndex === targetIndexRef.current) {
        isProgrammaticScrollRef.current = false;

        return;
      }

      if (snapTimeoutRef.current !== undefined) {
        window.clearTimeout(snapTimeoutRef.current);
      }

      snapTimeoutRef.current = window.setTimeout(
        () => {
          if (isProgrammaticScrollRef.current) {
            return;
          }

          const snapIndex = Math.round(container.scrollLeft / width);

          goToIndex(snapIndex, { smooth: false });
        },
        prefersReducedMotion ? 0 : SNAP_TIMEOUT
      );
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);

      if (snapTimeoutRef.current !== undefined) {
        window.clearTimeout(snapTimeoutRef.current);

        snapTimeoutRef.current = undefined;
      }
    };
  }, [goToIndex, openIndex, prefersReducedMotion, setCurrentIndex, setOpenIndex]);

  useEffect(() => {
    const container = trackRef.current;

    if (!container) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return;
      }

      event.preventDefault();

      container.scrollBy({
        left: event.deltaY,

        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => container.removeEventListener('wheel', handleWheel);
  }, [prefersReducedMotion]);

  useEffect(() => {
    const container = trackRef.current;

    if (!container) {
      return;
    }

    let isPointerActive = false;

    let startX = 0;

    let startScrollLeft = 0;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }

      const target = event.target as HTMLElement | null;

      if (
        target?.closest('button, a, input, textarea, select, [role="button"], [data-interactive]')
      ) {
        return;
      }

      isPointerActive = true;

      startX = event.clientX;

      startScrollLeft = container.scrollLeft;

      container.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isPointerActive) {
        return;
      }

      const deltaX = event.clientX - startX;

      container.scrollLeft = startScrollLeft - deltaX;
    };

    const releasePointer = (event: PointerEvent) => {
      if (!isPointerActive) {
        return;
      }

      isPointerActive = false;

      if (container.hasPointerCapture(event.pointerId)) {
        container.releasePointerCapture(event.pointerId);
      }

      const width = container.clientWidth || window.innerWidth || 1;

      const snapIndex = Math.round(container.scrollLeft / width);

      // Preserve the open panel when the pointer is released/cancelled on the
      // same node (e.g. a vertical scroll gesture inside the detail panel on
      // mobile fires `pointercancel` and must not close the panel).
      const openAtRelease = useConceptInteractionStore.getState().openIndex;

      goToIndex(snapIndex, {
        smooth: !prefersReducedMotion,
        preserveOpen: openAtRelease !== null && openAtRelease === snapIndex,
      });
    };

    container.addEventListener('pointerdown', handlePointerDown);

    container.addEventListener('pointermove', handlePointerMove);

    container.addEventListener('pointerup', releasePointer);

    container.addEventListener('pointercancel', releasePointer);

    return () => {
      container.removeEventListener('pointerdown', handlePointerDown);

      container.removeEventListener('pointermove', handlePointerMove);

      container.removeEventListener('pointerup', releasePointer);

      container.removeEventListener('pointercancel', releasePointer);
    };
  }, [goToIndex, prefersReducedMotion]);

  const handleOpenRequest = useCallback(
    (index: number) => {
      if (conceptNodes[index]?.kind !== 'interactive') {
        setOpenIndex(null);
        return;
      }

      const shouldOpen = openIndex !== index;

      selectIndex(index, { openCards: shouldOpen });

      goToIndex(index, { preserveOpen: shouldOpen });
    },

    [goToIndex, openIndex, selectIndex, setOpenIndex]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();

        goToIndex(currentIndex + 1);

        return;
      }

      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();

        goToIndex(currentIndex - 1);

        return;
      }

      if (event.key === 'Escape' && openIndex !== null) {
        event.preventDefault();

        setOpenIndex(null);

        return;
      }

      if (event.key === 'Enter') {
        const activeElement = document.activeElement as HTMLElement | null;

        if (activeElement && activeElement.closest(ENTER_INTERACTIVE_SELECTOR)) {
          return;
        }

        if (conceptNodes[currentIndex]?.kind !== 'interactive') {
          return;
        }

        event.preventDefault();

        handleOpenRequest(currentIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, goToIndex, handleOpenRequest, openIndex, setOpenIndex]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const applyHash = () => {
      const hash = window.location.hash.replace('#', '');

      if (!hash) {
        return;
      }

      const index = conceptNodes.findIndex((node) => node.id === hash);

      if (index >= 0) {
        goToIndex(index, { smooth: false });
      }
    };

    applyHash();

    window.addEventListener('hashchange', applyHash);

    return () => window.removeEventListener('hashchange', applyHash);
  }, [goToIndex]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const node = conceptNodes[currentIndex];

    if (!node) {
      return;
    }

    const desiredHash = `#${node.id}`;

    const params = window.location.search;

    const nextUrl = `${window.location.pathname}${params}${desiredHash}`;

    if (`${params}${desiredHash}` !== `${window.location.search}${window.location.hash}`) {
      history.replaceState(null, '', nextUrl);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    if (openIndex !== null) {
      params.set('open', '1');
    } else {
      params.delete('open');
    }

    const search = params.toString();

    const nextUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;

    if (nextUrl !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      history.replaceState(null, '', nextUrl);
    }
  }, [openIndex]);

  useEffect(() => {
    if (typeof window === 'undefined' || hasAppliedOpenParamRef.current) {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    if (params.get('open') !== '1') {
      hasAppliedOpenParamRef.current = true;

      return;
    }

    const hash = window.location.hash.replace('#', '');

    const hashIndex = conceptNodes.findIndex((node) => node.id === hash);

    const targetIndex = hashIndex >= 0 ? hashIndex : currentIndex;

    if (conceptNodes[targetIndex]?.kind === 'interactive') {
      selectIndex(targetIndex, { openCards: true });
    } else {
      setOpenIndex(null);
    }

    goToIndex(targetIndex, { preserveOpen: true });

    hasAppliedOpenParamRef.current = true;
  }, [currentIndex, goToIndex, selectIndex, setOpenIndex]);

  const contextValue = useMemo(
    () => ({
      currentIndex,

      goToIndex,
    }),

    [currentIndex, goToIndex]
  );

  return (
    <ConceptTrackProvider value={contextValue}>
      <div className="relative h-screen w-screen overflow-hidden bg-black text-white">
        {activeBackground ? (
          <BackgroundCanvas
            background={activeBackground}
            prefersReducedMotion={prefersReducedMotion}
          />
        ) : null}

        <main className="relative z-10 h-full w-full">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={totalNodes}
            aria-valuenow={currentIndex + 1}
            aria-valuetext={`${currentIndex + 1} of ${totalNodes}`}
          >
            <div
              aria-hidden
              className="h-full w-full origin-left bg-gradient-to-r from-[#f6c452] via-[#f0a87a] to-[#f7d799]"
              style={{
                transform: `scaleX(${Math.max(0, Math.min(100, progressValue)) / 100})`,

                transformOrigin: 'left center',

                transition: 'transform 600ms var(--bee-ease)',
              }}
            />
          </div>

          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-between px-4 sm:px-10 lg:px-14">
            <NavArrow
              direction="left"
              onClick={() => goToIndex(currentIndex - 1)}
              hidden={currentIndex <= 0}
            />
            <NavArrow
              direction="right"
              onClick={() => goToIndex(currentIndex + 1)}
              hidden={currentIndex >= totalNodes - 1}
            />
          </div>

          <div
            ref={trackRef}
            className="concept-track flex h-full min-h-0 snap-x snap-mandatory overflow-x-auto scroll-smooth"
            style={{ scrollbarWidth: 'none' }}
          >
            {conceptNodes.map((node, index) => (
              <section
                key={node.id}
                className={`relative flex h-full w-screen flex-shrink-0 snap-center items-center justify-center px-5 py-10 sm:px-12 md:px-16 ${
                  node.kind === 'editorial' ? 'bg-[#f3eee4] text-[#30261f]' : ''
                }`}
                aria-hidden={index !== currentIndex}
              >
                {node.kind === 'interactive' ? (
                  <>
                    <div
                      className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/65"
                      aria-hidden
                    />
                    <ConceptSlide
                      node={node}
                      isCurrent={index === currentIndex}
                      isOpen={openIndex === index}
                      prefersReducedMotion={prefersReducedMotion}
                      onToggle={() => handleOpenRequest(index)}
                      onFocus={() => goToIndex(index, { smooth: false, preserveOpen: true })}
                    />
                  </>
                ) : (
                  <ConceptEditorialSlide
                    node={node}
                    isCurrent={index === currentIndex}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                )}
              </section>
            ))}
          </div>
        </main>
      </div>
    </ConceptTrackProvider>
  );
}

function ConceptEditorialSlide({
  node,
  isCurrent,
  prefersReducedMotion,
}: {
  node: ConceptEditorialNode;
  isCurrent: boolean;
  prefersReducedMotion: boolean;
}) {
  const isColumns = node.layout === 'columns';

  return (
    <motion.article
      initial={false}
      animate={{ opacity: isCurrent ? 1 : 0.38, y: isCurrent || prefersReducedMotion ? 0 : 14 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.75, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-3 text-center"
    >
      <h2
        className={
          isColumns
            ? 'font-title text-[clamp(2.8rem,7vw,6.8rem)] normal-case leading-[0.88] tracking-[-0.025em] text-[#3b2e25]'
            : 'font-menu text-[clamp(2rem,4.5vw,4.6rem)] uppercase leading-[0.96] tracking-[0.025em] text-[#3b2e25]'
        }
      >
        {node.title}
      </h2>

      <div
        className={
          isColumns
            ? 'mt-12 grid w-full max-w-5xl gap-8 text-left sm:mt-16 md:grid-cols-2 md:gap-16 lg:gap-24'
            : 'mt-10 max-w-4xl sm:mt-14'
        }
      >
        {node.body.map((paragraph, index) => (
          <p
            key={`${node.id}-${index}`}
            className={
              isColumns
                ? 'text-[#493a30]/82 font-sans text-[clamp(0.76rem,1vw,0.96rem)] leading-[1.85]'
                : 'text-[#493a30]/86 font-sans text-[clamp(0.7rem,1.05vw,0.98rem)] uppercase leading-[1.95] tracking-[0.12em]'
            }
          >
            {paragraph}
          </p>
        ))}
      </div>
    </motion.article>
  );
}

function ConceptSlide({
  node,
  isCurrent,
  isOpen,
  prefersReducedMotion,
  onToggle,
  onFocus,
}: {
  node: ConceptInteractiveNode;
  isCurrent: boolean;
  isOpen: boolean;
  prefersReducedMotion: boolean;
  onToggle: () => void;
  onFocus: () => void;
}) {
  const sharedTransition = useMemo<Transition>(
    () => ({
      duration: prefersReducedMotion ? 0 : 0.65,
      ease: prefersReducedMotion ? ([0, 0, 1, 1] as const) : ([0.16, 1, 0.3, 1] as const),
    }),
    [prefersReducedMotion]
  );

  return (
    <div
      className={`relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-9 text-center sm:gap-12 ${
        isOpen
          ? 'max-sm:max-h-full max-sm:overflow-y-auto max-sm:overscroll-y-contain max-sm:pt-6'
          : ''
      }`}
    >
      <motion.div layout transition={sharedTransition} className="flex flex-col items-center">
        <motion.div
          className="relative flex flex-col items-center"
          animate={
            prefersReducedMotion
              ? { y: 0, scale: 1, filter: 'drop-shadow(0 16px 42px rgba(0,0,0,0.32))' }
              : {
                  y: isOpen ? -18 : 0,
                  scale: isOpen ? 0.95 : 1,
                  filter: isOpen
                    ? 'drop-shadow(0 26px 60px rgba(0,0,0,0.55))'
                    : 'drop-shadow(0 18px 42px rgba(0,0,0,0.35))',
                }
          }
          transition={sharedTransition}
        >
          <Icono
            node={node}
            isActive={isCurrent}
            isExpanded={isOpen}
            onSelect={onToggle}
            onFocus={onFocus}
          />
        </motion.div>
      </motion.div>

      <div className="relative grid w-full justify-items-center">
        <AnimatePresence initial={false}>
          {!isOpen ? (
            <motion.div
              key="concept-collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, pointerEvents: 'none' }}
              transition={sharedTransition}
              className="col-start-1 row-start-1 flex max-w-4xl flex-col items-center gap-6 text-center sm:gap-8"
            >
              <h2
                className="font-title text-3xl uppercase leading-[1.05] tracking-[0em] text-white sm:text-5xl md:text-6xl"
                style={{
                  textShadow:
                    '0 0 22px rgba(255,255,255,0.95), 0 0 48px rgba(255,255,255,0.55), 0 14px 38px rgba(0,0,0,0.6)',
                }}
              >
                {node.title}
              </h2>

              <p
                className="max-w-3xl whitespace-pre-line text-[13px] uppercase tracking-[0.2em] text-white/80 sm:text-base sm:tracking-[0.24em]"
                style={{ textShadow: '0 12px 32px rgba(0,0,0,0.55)' }}
              >
                {node.description}
              </p>

              <ConceptActionButton
                label="Discover"
                isOpen={isOpen}
                controlsId={`concept-detail-${node.id}`}
                onClick={onToggle}
              />
            </motion.div>
          ) : (
            <motion.div
              key="concept-expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, pointerEvents: 'none' }}
              transition={sharedTransition}
              className="col-start-1 row-start-1 flex w-full flex-col items-center gap-8 text-center sm:gap-10"
            >
              <h3
                className="font-title text-3xl normal-case leading-[1.05] text-white sm:text-5xl md:text-6xl"
                style={{
                  textShadow:
                    '0 0 22px rgba(255,255,255,0.95), 0 0 48px rgba(255,255,255,0.55), 0 14px 38px rgba(0,0,0,0.6)',
                }}
              >
                {node.openTitle}
              </h3>

              <ConceptDetailsPanel node={node} />

              <ConceptActionButton
                label="Close"
                isOpen={isOpen}
                controlsId={`concept-detail-${node.id}`}
                onClick={onToggle}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ConceptActionButton({
  label,
  isOpen,
  controlsId,
  onClick,
}: {
  label: string;
  isOpen: boolean;
  controlsId: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-controls={controlsId}
      onClick={onClick}
      className="group relative inline-flex flex-col items-center px-2 py-2 font-display text-[9px] uppercase tracking-[0.45em] text-white transition-opacity duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6c452]/35 sm:text-[11px] sm:tracking-[0.5em]"
    >
      <span>{label}</span>
      <span
        aria-hidden
        className="mt-1.5 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-[rgba(249,215,162,0.18)] via-[rgba(244,199,122,0.75)] to-[rgba(255,240,225,0.95)] transition-transform duration-300 ease-out group-hover:scale-x-100"
      />
    </button>
  );
}

function ConceptDetailsPanel({ node }: { node: ConceptInteractiveNode }) {
  if (!node.details?.length) {
    return null;
  }

  const detailCount = node.details.length;

  const columnClass =
    detailCount === 1
      ? 'sm:grid-cols-1 lg:grid-cols-1'
      : detailCount === 2
        ? 'sm:grid-cols-2 lg:grid-cols-2'
        : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div id={`concept-detail-${node.id}`} className="w-full max-w-6xl p-2 sm:p-4">
      <div className={`grid justify-items-center gap-8 ${columnClass}`}>
        {node.details.map((detail, detailIndex) => (
          <div
            key={`${node.id}-detail-${detailIndex}`}
            className="flex flex-col items-center gap-5 text-center"
            style={{ transitionDelay: `${detailIndex * 90}ms` }}
          >
            <span className="bg-white/12 inline-flex h-16 w-16 items-center justify-center rounded-full shadow-[0_0_52px_rgba(246,196,82,0.45)] sm:h-20 sm:w-20">
              <Image
                src={detail.icon}
                alt=""
                width={68}
                height={68}
                className="h-11 w-11 object-contain drop-shadow-[0_0_24px_rgba(246,196,82,0.85)] sm:h-16 sm:w-16"
                aria-hidden
              />
            </span>

            <p className="text-sm leading-relaxed text-white/90 sm:text-base">{detail.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NavArrow({
  direction,
  hidden,
  onClick,
}: {
  direction: 'left' | 'right';
  hidden?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={direction === 'left' ? 'Previous concept' : 'Next concept'}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      onClick={onClick}
      disabled={hidden}
      className={`group pointer-events-auto flex h-14 w-20 items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:h-16 sm:w-28 ${
        hidden ? 'invisible' : ''
      }`}
      style={{ transitionTimingFunction: 'var(--bee-ease)' }}
    >
      <span
        className={`relative block h-10 w-20 transition duration-500 group-hover:scale-105 sm:h-12 sm:w-24 ${
          direction === 'left' ? 'rotate-180' : ''
        }`}
      >
        <Image
          src="/assets/icones/feedbacks/site-arrow.svg"
          alt=""
          fill
          sizes="96px"
          className="object-contain"
        />
      </span>
    </button>
  );
}

function BackgroundCanvas({
  background,
  prefersReducedMotion,
}: {
  background: ConceptInteractiveNode['background'];
  prefersReducedMotion: boolean;
}) {
  const posterSrc =
    background.type === 'video' ? (background.poster ?? background.src) : background.src;
  const shouldUseImage = prefersReducedMotion || background.type === 'image';

  return (
    <div className="absolute inset-0" aria-hidden>
      <div className="relative h-full w-full bg-black">
        {shouldUseImage ? (
          <Image src={posterSrc} alt="" fill priority sizes="100vw" className="object-cover" />
        ) : (
          <SmartVideo
            wrapperClassName="absolute inset-0"
            className="h-full w-full object-cover"
            sources={[{ src: background.src, type: 'video/mp4' }]}
            poster={posterSrc}
            fallbackImage={posterSrc}
            autoPlay
            muted
            loop
            playsInline
            priority
            aria-hidden
          />
        )}

        <div className="from-black/72 via-black/38 to-black/32 absolute inset-0 bg-gradient-to-b" />
      </div>
    </div>
  );
}
