'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type BeeButtonAlign = 'left' | 'center' | 'right';
type BeeButtonSize = 'sm' | 'md';

type BeeButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  align?: BeeButtonAlign;
  size?: BeeButtonSize;
  active?: boolean;
  download?: boolean | string;
  target?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
};

const ALIGN_CLASSES: Record<BeeButtonAlign, { root: string; underline: string }> = {
  left: { root: 'items-start', underline: 'origin-left' },
  center: { root: 'items-center', underline: 'origin-center' },
  right: { root: 'items-end', underline: 'origin-right' },
};

const SIZE_CLASSES: Record<BeeButtonSize, string> = {
  sm: 'text-[9px] tracking-[0.45em]',
  md: 'text-[11px] tracking-[0.5em]',
};

/**
 * Bouton standard du site (T-037) — style « Co-create a journey » de la home :
 * label uppercase + underline doré animé au hover (persistant quand `active`).
 */
export function BeeButton({
  children,
  href,
  onClick,
  icon,
  align = 'left',
  size = 'sm',
  active = false,
  download,
  target,
  type = 'button',
  disabled = false,
  className,
  'aria-label': ariaLabel,
}: BeeButtonProps) {
  const alignClasses = ALIGN_CLASSES[align];
  const rootClass = cn(
    'group relative inline-flex flex-col font-display uppercase text-white transition-opacity duration-300',
    alignClasses.root,
    SIZE_CLASSES[size],
    disabled && 'pointer-events-none opacity-40',
    className
  );
  const underlineClass = cn(
    'mt-1.5 h-px w-full scale-x-0 rounded-full bg-gradient-to-r from-[rgba(249,215,162,0.18)] via-[rgba(244,199,122,0.75)] to-[rgba(255,240,225,0.95)] transition-transform duration-300 ease-out group-hover:scale-x-100',
    alignClasses.underline,
    active && 'scale-x-100'
  );

  const content = (
    <>
      <span className="inline-flex items-center gap-2">
        {icon}
        <span>{children}</span>
      </span>
      <span aria-hidden className={underlineClass} />
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        download={download}
        target={target}
        aria-label={ariaLabel}
        className={rootClass}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={active || undefined}
      className={rootClass}
    >
      {content}
    </button>
  );
}
