'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import './dashboard.css';

type DashboardShellProps = {
  image: string;
  title?: ReactNode;
  eyebrow?: string;
  meta?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  topActions?: ReactNode;
  children: ReactNode;
  layout?: 'atlas' | 'stacked';
  className?: string;
  backHref?: string;
  backLabel?: string;
  footer?: ReactNode;
  scope?: 'studio' | 'demo';
};

export function DashboardNavigation({
  backHref = '/dashboard',
  backLabel = 'All productions',
  topActions,
  onBack,
  scope,
}: {
  backHref?: string;
  backLabel?: string;
  topActions?: ReactNode;
  onBack?: () => void;
  scope?: 'studio' | 'demo';
}) {
  const [menu, setMenu] = useState(false);
  const suffix = scope === 'demo' ? '?scope=demo' : '';
  return (
    <header
      className="bee-dashboard__header"
      onKeyDown={(event) => {
        if (event.key === 'Escape') setMenu(false);
      }}
    >
      <div className="bee-dashboard__brand">
        <Link href="/" aria-label="Beeyondtheworld home">
          <Image src="/assets/icones/Ico Gold BEE-13.svg" alt="" width={30} height={32} priority />
        </Link>
        {onBack ? (
          <button className="bee-dashboard__back" onClick={onBack}>
            {backLabel}
          </button>
        ) : (
          <Link href={backHref} className="bee-dashboard__back">
            {backLabel}
          </Link>
        )}
      </div>
      <div className="bee-dashboard__top-actions">{topActions}</div>
      <button
        className="bee-dashboard__menu-trigger"
        onClick={() => setMenu(!menu)}
        aria-expanded={menu}
        aria-controls="dashboard-navigation"
        aria-label={menu ? 'Close workspace menu' : 'Open workspace menu'}
      >
        {menu ? <X size={17} /> : <Menu size={17} />}
        <span>Workspace</span>
      </button>
      {menu && (
        <nav
          id="dashboard-navigation"
          className="bee-dashboard__menu"
          aria-label="Workspace navigation"
        >
          <Link href="/dashboard" onClick={() => setMenu(false)}>
            Productions
          </Link>
          <Link href={'/dashboard/creative' + suffix} onClick={() => setMenu(false)}>
            Creative Studio
          </Link>
          <Link href={'/dashboard/ecosystem' + suffix} onClick={() => setMenu(false)}>
            Visual Poets & partners
          </Link>
          <a href="/sales/">Sales CRM</a>
          <Link href="/community" onClick={() => setMenu(false)}>
            Community · Bloom
          </Link>
        </nav>
      )}
    </header>
  );
}

/** The site's photographic canvas, with a quiet private workspace navigation. */
export function DashboardShell({
  image,
  title,
  eyebrow,
  meta,
  description,
  actions,
  topActions,
  children,
  layout = 'atlas',
  className = '',
  backHref = '/dashboard',
  backLabel = 'All productions',
  footer,
  scope,
}: DashboardShellProps) {
  const reducedMotion = useReducedMotion();
  return (
    <div className={`bee-dashboard bee-dashboard--${layout} ${className}`}>
      <div className="bee-dashboard__backdrop" aria-hidden>
        <AnimatePresence initial={false}>
          <motion.div
            key={image}
            className="bee-dashboard__backdrop-image"
            style={{ backgroundImage: `url(${JSON.stringify(image)})` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>
      </div>
      <div className="bee-dashboard__veil" aria-hidden />
      <DashboardNavigation
        backHref={backHref}
        backLabel={backLabel}
        topActions={topActions}
        scope={scope}
      />
      <main className={`bee-dashboard__main bee-dashboard__main--${layout}`}>
        {title && (
          <section className="bee-dashboard__editorial">
            {eyebrow && <p className="bee-dashboard__eyebrow">{eyebrow}</p>}
            <h1 className="bee-dashboard__title">{title}</h1>
            {meta && <div className="bee-dashboard__meta">{meta}</div>}
            {description && <div className="bee-dashboard__description">{description}</div>}
            {actions && <div className="bee-dashboard__actions">{actions}</div>}
          </section>
        )}
        <div className="bee-dashboard__content">{children}</div>
      </main>
      {footer && <footer className="bee-dashboard__footer">{footer}</footer>}
    </div>
  );
}
