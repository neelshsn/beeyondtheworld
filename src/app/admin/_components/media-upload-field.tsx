'use client';

import { upload } from '@vercel/blob/client';
import { Check, ExternalLink, FileText, Loader2, UploadCloud, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type MediaKind = 'image' | 'video' | 'document';

const KIND_CONFIG: Record<
  MediaKind,
  { accept: string; description: string; maxSize: number; folder: string }
> = {
  image: {
    accept: 'image/jpeg,image/png,image/webp,image/avif,image/gif',
    description: 'JPG, PNG, WebP, AVIF ou GIF',
    maxSize: 25 * 1024 * 1024,
    folder: 'images',
  },
  video: {
    accept: 'video/mp4,video/webm,video/quicktime',
    description: 'MP4, WebM ou MOV',
    maxSize: 500 * 1024 * 1024,
    folder: 'videos',
  },
  document: {
    accept: 'application/pdf',
    description: 'PDF',
    maxSize: 25 * 1024 * 1024,
    folder: 'documents',
  },
};

function readableSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))} Mo`;
  return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
}

function safeFileName(fileName: string) {
  const extension = fileName.includes('.') ? `.${fileName.split('.').pop()}` : '';
  const stem = extension ? fileName.slice(0, -extension.length) : fileName;
  const normalized = stem
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `${normalized || 'media'}${extension.toLowerCase()}`;
}

function isExpectedFile(file: File, kind: MediaKind) {
  return KIND_CONFIG[kind].accept.split(',').includes(file.type);
}

export function MediaUploadField({
  label,
  value,
  onChange,
  kind = 'image',
  accept,
  help,
  className,
  disabled = false,
  onBusyChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  kind?: MediaKind;
  accept?: string;
  help?: string;
  className?: string;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  const inputId = useId();
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const progressId = `${inputId}-progress`;
  const urlId = `${inputId}-url`;
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const config = KIND_CONFIG[kind];
  const busy = progress !== null;

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const selectFile = async (file?: File) => {
    if (!file || busy || disabled) return;
    setError(null);
    setSuccess(false);

    if (!isExpectedFile(file, kind)) {
      setError(`Choisis un fichier ${config.description}.`);
      return;
    }
    if (file.size > config.maxSize) {
      setError(`Ce fichier est trop lourd. Taille maximale : ${readableSize(config.maxSize)}.`);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setProgress(0);
    onBusyChange?.(true);

    try {
      const pathname = `bee-media/${config.folder}/${Date.now()}-${safeFileName(file.name)}`;
      const blob = await upload(pathname, file, {
        access: 'public',
        handleUploadUrl: '/api/admin/media/upload',
        multipart: file.size > 4 * 1024 * 1024,
        abortSignal: controller.signal,
        clientPayload: JSON.stringify({ originalName: file.name, size: file.size }),
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });
      onChange(blob.url);
      setSuccess(true);
    } catch (cause) {
      if (controller.signal.aborted) {
        setError('Envoi annulé. Rien n’a été publié.');
      } else {
        setError(cause instanceof Error ? cause.message : 'Envoi impossible. Réessaie.');
      }
    } finally {
      abortRef.current = null;
      setProgress(null);
      onBusyChange?.(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div>
        <label
          htmlFor={inputId}
          className="block text-[10px] uppercase tracking-[0.3em] text-white/60"
        >
          {label}
        </label>
        <p id={helpId} className="mt-1 text-xs leading-relaxed text-white/55">
          {help ?? `${config.description} · maximum ${readableSize(config.maxSize)}`}
        </p>
      </div>

      {value ? (
        <div className="overflow-hidden border border-white/15 bg-black/25">
          {kind === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt={`Aperçu du média choisi pour ${label}`}
              className="h-36 w-full object-cover"
            />
          ) : kind === 'video' ? (
            <video
              src={value}
              className="h-36 w-full bg-black object-contain"
              controls
              preload="metadata"
              aria-label={`Aperçu vidéo pour ${label}`}
            />
          ) : (
            <div className="flex min-h-24 items-center justify-center gap-3 px-4 text-sm text-white/70">
              <FileText aria-hidden="true" className="size-6 text-[#f4bb52]" />
              PDF prêt à être utilisé
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 border-t border-white/10 p-2">
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 px-2 text-xs text-white/65 underline underline-offset-4 hover:text-[#f4bb52] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4bb52]"
              aria-label={`Voir le fichier pour ${label} dans un nouvel onglet`}
            >
              Voir le fichier <ExternalLink aria-hidden="true" className="size-3.5" />
            </a>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="ml-auto min-h-11 text-white/65 hover:bg-white/10 hover:text-white"
              disabled={disabled || busy}
              onClick={() => {
                onChange('');
                setSuccess(false);
              }}
            >
              <X aria-hidden="true" className="size-4" /> Retirer
            </Button>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          'flex min-h-28 flex-col items-center justify-center gap-2 border border-dashed px-4 py-4 text-center transition-colors',
          dragging ? 'border-[#f4bb52] bg-[#f4bb52]/10' : 'border-white/20 bg-white/[0.03]',
          (busy || disabled) && 'opacity-70'
        )}
        aria-busy={busy}
        onDragEnter={(event) => {
          event.preventDefault();
          if (disabled || busy) return;
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void selectFile(event.dataTransfer.files[0]);
        }}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept ?? config.accept}
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
          disabled={disabled || busy}
          onChange={(event) => void selectFile(event.target.files?.[0])}
        />
        {busy ? (
          <>
            <Loader2 aria-hidden="true" className="size-5 animate-spin text-[#f4bb52]" />
            <p id={progressId} className="text-sm text-white/80" role="status" aria-live="polite">
              Envoi en cours… {progress}%
            </p>
            <div
              className="h-1.5 w-full max-w-56 overflow-hidden bg-white/10"
              role="progressbar"
              aria-label={`Envoi du fichier pour ${label}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress ?? 0}
            >
              <div
                className="h-full bg-[#f4bb52] transition-[width]"
                style={{ width: `${progress ?? 0}%` }}
              />
            </div>
            <button
              type="button"
              className="min-h-11 px-3 text-xs text-white/70 underline underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4bb52]"
              onClick={() => abortRef.current?.abort()}
            >
              Annuler
            </button>
          </>
        ) : (
          <>
            <UploadCloud aria-hidden="true" className="size-5 text-[#f4bb52]" />
            <button
              type="button"
              className="min-h-11 border border-[#f4bb52] px-4 text-xs uppercase tracking-[0.18em] text-[#f4bb52] transition-colors hover:bg-[#f4bb52] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4bb52]"
              disabled={disabled}
              aria-label={`${value ? 'Remplacer' : 'Choisir'} le fichier pour ${label}`}
              aria-describedby={`${helpId}${error ? ` ${errorId}` : ''}`}
              onClick={() => inputRef.current?.click()}
            >
              {value ? 'Remplacer le fichier' : 'Choisir un fichier'}
            </button>
            <p className="text-xs text-white/40">ou dépose-le ici</p>
          </>
        )}
      </div>

      {success ? (
        <p className="flex items-center gap-2 text-xs text-emerald-300" role="status">
          <Check aria-hidden="true" className="size-4" /> Fichier envoyé. Enregistre ensuite tes
          changements.
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs leading-relaxed text-red-300" role="alert">
          {error}
        </p>
      ) : null}

      <details className="text-xs text-white/55">
        <summary className="min-h-11 cursor-pointer py-3 hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4bb52]">
          Option avancée : utiliser une adresse existante
        </summary>
        <label htmlFor={urlId} className="sr-only">
          Adresse existante pour {label}
        </label>
        <input
          id={urlId}
          className="mt-1 min-h-11 w-full rounded-none border border-white/15 bg-white/5 px-3 py-2 text-base text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#f4bb52] sm:text-sm"
          value={value}
          placeholder="https://… ou /assets/…"
          disabled={disabled || busy}
          onChange={(event) => {
            onChange(event.target.value);
            setSuccess(false);
          }}
        />
      </details>
    </div>
  );
}
