'use client';
import { useState } from 'react';
import type { Workspace } from '@/lib/community/types';
import { Icon } from './horizon-icons';
export function ReviewNotes({
  w,
  recordId,
  refresh,
}: {
  w: Workspace;
  recordId?: string;
  refresh: () => Promise<unknown>;
}) {
  const [note, setNote] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const notes = w.events.filter((e) => e.record_id === recordId && e.comment);
  return (
    <section className="review-notes">
      <h3>Review notes</h3>
      <div className="review-note-list">
        {notes.length ? (
          notes.map((e) => (
            <article key={e.id}>
              <small>
                {e.actor} · {new Date(e.created_at).toLocaleDateString('en-GB')}
              </small>
              <p>{e.comment}</p>
            </article>
          ))
        ) : (
          <div className="review-note-empty">
            <Icon name="message" />
            <p>No review notes yet.</p>
          </div>
        )}
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy || !recordId) return;
          setBusy(true);
          setError('');
          try {
            const r = await fetch('/api/community/comments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ projectId: w.project.id, recordId, comment: note }),
            });
            const d = await r.json();
            if (!r.ok) throw Error(d.error);
            setNote('');
            await refresh();
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Please retry.');
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          <span className="sr-only">Review note</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={2000}
            required
            placeholder={recordId ? 'Add a review note…' : 'Save a record to add notes'}
            disabled={!recordId || busy}
          />
        </label>
        <button className="text-link" disabled={!recordId || busy || !note.trim()}>
          Save note <Icon name="arrow" />
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
