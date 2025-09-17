import { cn } from '@/lib/utils';

export type AssetPlaceholderProps = {
  label: string;
  fileName: string;
  placement: string;
  recommendedDimensions: string;
  type: 'image' | 'video';
  className?: string;
};

export function AssetPlaceholder({
  label,
  fileName,
  placement,
  recommendedDimensions,
  type,
  className,
}: AssetPlaceholderProps) {
  return (
    <div
      className={cn(
        'placeholder-panel relative overflow-hidden text-[11px] tracking-[0.4em]',
        type === 'video' ? 'bg-white/25' : 'bg-white/35',
        className
      )}
    >
      <div className="relative z-10 flex flex-col items-center gap-2 text-center">
        <span className="rounded-full border border-foreground/30 px-3 py-1 text-[10px] tracking-[0.5em]">
          {type === 'video' ? 'VIDEO' : 'IMAGE'}
        </span>
        <p className="font-display text-xs tracking-[0.45em] text-foreground/80">{label}</p>
        <p className="text-[10px] tracking-[0.4em] text-foreground/60">{recommendedDimensions}</p>
        <div className="flex flex-col items-center gap-1 text-[9px] tracking-[0.4em] text-foreground/50">
          <span>{fileName}</span>
          <span className="uppercase">place in {placement}</span>
        </div>
      </div>
    </div>
  );
}
