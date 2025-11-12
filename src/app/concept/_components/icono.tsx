'use client';

import { cn } from '@/lib/utils';

import type { ConceptNode } from '@content/concept';

import { Globe2, Leaf, ShieldCheck, Users } from 'lucide-react';

import { forwardRef, useCallback, type ReactElement } from 'react';

import { usePrefersReducedMotion } from '../_hooks/use-prefers-reduced-motion';

export const BeeGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden focusable="false">
    <path
      d="M32 18c-6 0-11 4-11 10s5 10 11 10 11-4 11-10-5-10-11-10Z"
      fill="currentColor"
      opacity={0.85}
    />

    <ellipse cx="32" cy="42" rx="10" ry="6" fill="currentColor" opacity={0.65} />

    <path
      d="M22 18c-3.5-3.5-7.5-5.5-11-6"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      opacity={0.4}
    />

    <path
      d="M42 18c3.5-3.5 7.5-5.5 11-6"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      opacity={0.4}
    />

    <path d="M24 30h16" stroke="#fdd37a" strokeWidth="4" strokeLinecap="round" opacity={0.85} />

    <path d="M26 38h12" stroke="#f7b948" strokeWidth="4" strokeLinecap="round" opacity={0.75} />
  </svg>
);

export const HoneyGlyph = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden focusable="false">
    <path
      d="M20 10h24a4 4 0 0 1 4 4v2a6 6 0 0 1-6 6H22a6 6 0 0 1-6-6v-2a4 4 0 0 1 4-4Z"
      fill="currentColor"
      opacity={0.8}
    />

    <path d="M18 22h28l3 24c0 6.6-7.2 12-16 12s-16-5.4-16-12Z" fill="currentColor" />

    <path d="M24 4h16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity={0.75} />

    <path d="M32 32c-4 0-7 3-7 7s3 7 7 7 7-3 7-7-3-7-7-7Z" fill="#ffd166" />
  </svg>
);

export type IconRenderer = (props: { className?: string }) => ReactElement;

export const ICON_MAP: Record<ConceptNode['icon'], IconRenderer> = {
  Bee: (props) => <BeeGlyph {...props} />,

  Leaf: ({ className }) => <Leaf className={className} aria-hidden />,

  Shield: ({ className }) => <ShieldCheck className={className} aria-hidden />,

  HeartGlobe: ({ className }) => <Globe2 className={className} aria-hidden />,

  Network: ({ className }) => <Users className={className} aria-hidden />,

  Honey: (props) => <HoneyGlyph {...props} />,
};

const ACCENT_CLASSES: Record<string, string> = {
  'honey-500': 'text-[#f6c452]',

  'honey-600': 'text-[#f0a87a]',

  'leaf-500': 'text-[#8fd3b6]',

  'clay-500': 'text-[#f0a3a3]',

  'ember-500': 'text-[#f59e7a]',

  'pollen-500': 'text-[#f6d36f]',
};

export type IconoProps = {
  node: ConceptNode;

  isActive: boolean;

  isExpanded?: boolean;

  onSelect: () => void;

  onFocus?: () => void;
};

export const Icono = forwardRef<HTMLButtonElement, IconoProps>(function Icono(
  { node, isActive, isExpanded = false, onSelect, onFocus },

  ref
) {
  const IconComponent = ICON_MAP[node.icon];

  const prefersReducedMotion = usePrefersReducedMotion();

  const shouldAnimate = !prefersReducedMotion;

  const accentClass = ACCENT_CLASSES[node.accent ?? ''] ?? 'text-[#f6c452]';

  const isElevated = isActive || isExpanded;

  const shouldGlowDynamically = isExpanded && !prefersReducedMotion;

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();

        onSelect();
      }
    },

    [onSelect]
  );

  return (
    <button
      ref={ref}
      type="button"
      aria-label={`Select ${node.title}`}
      aria-pressed={isActive}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      className={cn(
        'supports-backdrop:bg-white/6 relative grid size-[184px] place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur-xl transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/75 sm:size-[212px]',

        isElevated
          ? 'opacity-100 shadow-[0_0_80px_rgba(246,196,82,0.45)]'
          : 'opacity-85 hover:opacity-100'
      )}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -inset-12 rounded-full blur-3xl transition-all [transition-duration:1400ms]',

          shouldGlowDynamically
            ? 'scale-105 animate-[pulse_6s_ease-in-out_infinite] opacity-95'
            : isElevated
              ? 'scale-100 opacity-85'
              : 'scale-95 opacity-45'
        )}
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(246, 196, 82, 0.58), rgba(246, 196, 82, 0) 72%)',

          transitionTimingFunction: 'var(--bee-ease)',
        }}
      />

      <span
        aria-hidden
        className={cn(
          'from-white/8 pointer-events-none absolute inset-[8%] rounded-full border border-white/25 bg-gradient-to-br via-transparent to-transparent transition-all duration-700',

          isExpanded
            ? 'scale-105 opacity-85'
            : isElevated
              ? 'scale-100 opacity-65'
              : 'scale-95 opacity-35'
        )}
        style={{ transitionTimingFunction: 'var(--bee-ease)' }}
      />

      <span
        className={cn(
          'relative flex size-[128px] items-center justify-center rounded-full bg-white/15 text-white/90 shadow-[0_20px_55px_rgba(246,196,82,0.28)] backdrop-blur-lg transition-transform duration-700 supports-backdrop:bg-white/10 sm:size-[148px]',

          accentClass,

          shouldAnimate ? 'icono-spin' : '',

          isExpanded
            ? 'scale-[1.03] shadow-[0_0_110px_rgba(246,196,82,0.55)] ring-[3px] ring-[#f6c452]/55'
            : isActive
              ? 'ring-2 ring-white/35'
              : 'ring-[1px] ring-white/15'
        )}
        style={{ transitionTimingFunction: 'var(--bee-ease)' }}
      >
        <IconComponent className="size-14 sm:size-16" />
      </span>
    </button>
  );
});
