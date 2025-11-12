import { cn } from '@/lib/utils';

const toneMap: Record<string, string> = {
  'on-track': 'bg-emerald-100/60 text-emerald-700 border border-emerald-300/70',
  'at-risk': 'bg-amber-100/70 text-amber-800 border border-amber-300/70',
  complete: 'bg-sky-100/70 text-sky-800 border border-sky-300/70',
  dreaming: 'bg-purple-100/65 text-purple-800 border border-purple-300/70',
  crafting: 'bg-rose-100/65 text-rose-800 border border-rose-300/70',
  delivering: 'bg-indigo-100/65 text-indigo-800 border border-indigo-300/70',
  open: 'bg-blue-100/65 text-blue-800 border border-blue-300/70',
  locked: 'bg-emerald-100/65 text-emerald-800 border border-emerald-300/70',
  wrapped: 'bg-gray-200 text-gray-800 border border-gray-300',
  'in-progress': 'bg-sky-100/60 text-sky-800 border border-sky-300/70',
  'awaiting-approval': 'bg-amber-100/60 text-amber-700 border border-amber-300/70',
  delivered: 'bg-emerald-100/70 text-emerald-800 border border-emerald-300/70',
  now: 'bg-emerald-100/60 text-emerald-700 border border-emerald-300/70',
  soon: 'bg-amber-100/60 text-amber-700 border border-amber-300/70',
  booking: 'bg-sky-100/60 text-sky-800 border border-sky-300/70',
  up: 'bg-emerald-100/60 text-emerald-700 border border-emerald-200/80',
  down: 'bg-rose-100/60 text-rose-700 border border-rose-200/80',
  steady: 'bg-slate-100/70 text-slate-700 border border-slate-200/80',
};

type StatusPillProps = {
  tone: string;
  children: React.ReactNode;
  className?: string;
};

export function StatusPill({ tone, children, className }: StatusPillProps) {
  const toneClasses = toneMap[tone] ?? 'bg-slate-100 text-slate-700 border border-slate-200/80';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.35em]',
        toneClasses,
        className
      )}
    >
      {children}
    </span>
  );
}
