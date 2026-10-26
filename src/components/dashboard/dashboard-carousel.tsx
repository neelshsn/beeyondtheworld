'use client';
/* eslint-disable @next/next/no-img-element -- Private media must use the authenticated endpoint directly. */

import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState, type ReactNode, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, ImageIcon } from 'lucide-react';
import './dashboard.css';

export type DashboardSlide = {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  meta?: string;
  badge?: string;
};
type Props = {
  items: DashboardSlide[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onOpen?: (id: string) => void;
  openLabel?: string;
  label?: string;
  renderMedia?: (item: DashboardSlide, active: boolean) => ReactNode;
  layout?: 'atlas' | 'strip';
};
export function DashboardCarousel({
  items,
  selectedId,
  onSelect,
  onOpen,
  openLabel = 'Open',
  label = 'Browse productions',
  renderMedia,
  layout = 'atlas',
}: Props) {
  const [ref, api] = useEmblaCarousel({
    align: 'start',
    containScroll: false,
    loop: false,
    skipSnaps: false,
  });
  const [canPrev, setCanPrev] = useState(false),
    [canNext, setCanNext] = useState(false);
  const selected = Math.max(
    0,
    items.findIndex((item) => item.id === selectedId)
  );
  const select = useCallback(() => {
    if (!api) return;
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
    const item = items[api.selectedScrollSnap()];
    if (item && item.id !== selectedId) onSelect(item.id);
  }, [api, items, onSelect, selectedId]);
  useEffect(() => {
    if (!api) return;
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
    api.on('select', select).on('reInit', select);
    return () => {
      api.off('select', select).off('reInit', select);
    };
  }, [api, select]);
  useEffect(() => {
    if (!api || api.selectedScrollSnap() === selected) return;
    api.scrollTo(
      selected,
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, [api, selected]);
  return (
    <section
      className={`bee-carousel bee-carousel--${layout}`}
      aria-label={label}
      aria-roledescription="carousel"
    >
      <div
        ref={ref}
        className="bee-carousel__viewport"
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            api?.scrollNext();
          }
          if (event.key === 'ArrowLeft') {
            event.preventDefault();
            api?.scrollPrev();
          }
        }}
      >
        <div className="bee-carousel__track">
          {items.map((item, i) => {
            const active = i === selected;
            const distance = Math.min(Math.abs(i - selected), 3);
            return (
              <div
                key={item.id}
                className={`bee-carousel__slide ${active ? 'is-active' : ''}`}
                style={{ '--slide-basis': [40, 27, 23, 18][distance] + '%' } as CSSProperties}
              >
                <button
                  type="button"
                  className="bee-carousel__card"
                  aria-pressed={active}
                  aria-label={`${item.title}${item.badge ? ' · ' + item.badge : ''}${active && onOpen ? ' · ' + openLabel : ''}`}
                  onClick={() => {
                    if (active && onOpen) onOpen(item.id);
                    else {
                      onSelect(item.id);
                      api?.scrollTo(i);
                    }
                  }}
                >
                  {renderMedia ? (
                    renderMedia(item, active)
                  ) : item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      loading={i < 3 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  ) : (
                    <span className="bee-carousel__placeholder">
                      <ImageIcon aria-hidden size={30} />
                    </span>
                  )}
                  <span className="bee-carousel__shade" aria-hidden />
                  <span className="bee-carousel__caption">
                    {item.subtitle && (
                      <span className="bee-carousel__eyebrow">{item.subtitle}</span>
                    )}
                    <span className="bee-carousel__title">{item.title}</span>
                    {item.meta && <span className="bee-carousel__meta">{item.meta}</span>}
                    {item.badge && <span className="bee-carousel__badge">{item.badge}</span>}
                    {active && onOpen && (
                      <span className="bee-carousel__open">
                        {openLabel}
                        <ArrowRight size={15} />
                      </span>
                    )}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bee-carousel__controls">
        <span aria-live="polite" aria-atomic="true">
          {items.length ? String(selected + 1).padStart(2, '0') : '00'}
          <span className="bee-carousel__divider" />
          {String(items.length).padStart(2, '0')}
        </span>
        <div>
          <button
            type="button"
            onClick={() => api?.scrollPrev()}
            disabled={!canPrev}
            aria-label="Previous item"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => api?.scrollNext()}
            disabled={!canNext}
            aria-label="Next item"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
