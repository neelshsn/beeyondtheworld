'use client';

import { useCallback } from 'react';

import { Button } from '@/components/ui/button';

export function JourneyExportButton() {
  const handleExport = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }, []);

  return (
    <Button
      onClick={handleExport}
      className="rounded-full border border-foreground/30 bg-white/80 px-6 py-3 font-display text-xs uppercase tracking-[0.35em] text-foreground hover:bg-white"
    >
      Export PDF
    </Button>
  );
}
