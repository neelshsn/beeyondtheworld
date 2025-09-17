import { FileDown } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface PDFDownloadProps {
  label: string;
  fileName: string;
  description?: string;
  className?: string;
}

export function PDFDownload({ label, fileName, description, className }: PDFDownloadProps) {
  return (
    <div className={className}>
      <Button
        asChild
        variant="outline"
        className="group inline-flex items-center gap-3 rounded-full border border-foreground/20 bg-white/40 px-6 py-5 text-sm font-semibold uppercase tracking-[0.3em] text-foreground/80 backdrop-blur"
      >
        <Link href={`/pdfs/${fileName}`} download>
          <FileDown className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
          {label}
        </Link>
      </Button>
      {description ? (
        <p className="mt-3 max-w-sm text-xs uppercase tracking-[0.35em] text-muted-foreground/70">
          {description}
        </p>
      ) : null}
    </div>
  );
}
