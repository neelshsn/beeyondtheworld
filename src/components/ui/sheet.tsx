'use client';

import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';

import { cn } from '@/lib/utils';

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/25 backdrop-blur-[6px] transition data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in',
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & {
    side?: 'top' | 'bottom' | 'left' | 'right';
  }
>(({ side = 'right', className, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 flex h-full w-[88vw] max-w-[420px] flex-col border-l border-border/40 bg-[var(--menu-bg,rgba(255,255,255,0.95))] text-foreground shadow-[var(--menu-shadow,0_40px_120px_-45px_rgba(87,62,38,0.45))] transition ease-in-out data-[state=closed]:duration-200 data-[state=open]:duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out supports-[backdrop-filter]:bg-[var(--menu-bg,rgba(255,255,255,0.7))] supports-[backdrop-filter]:backdrop-blur-xl',
        side === 'right' &&
          'right-0 top-0 rounded-l-[2rem] data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
        side === 'left' &&
          'left-0 top-0 rounded-r-[2rem] data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
        side === 'top' &&
          'left-0 top-0 h-[88vh] w-full rounded-b-[2rem] data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        side === 'bottom' &&
          'bottom-0 left-0 h-[88vh] w-full rounded-t-[2rem] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        className
      )}
      data-side={side}
      {...props}
    />
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('grid gap-2 text-center sm:text-left', className)} {...props} />
);
SheetHeader.displayName = 'SheetHeader';

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-auto flex flex-col gap-2', className)} {...props} />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetPortal,
  SheetOverlay,
};
