import Link from 'next/link';
import { sqlClient } from '@/lib/db/client';
import { canPublish, type CreativeItem } from '@/lib/creative/model';
import '../community/creative/workspace.css';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Travel Showreel · Beeyondtheworld',
  description: 'Local stories, curated by the creative studio.',
};
export default async function Showreel() {
  const all = await sqlClient().query<CreativeItem>(
    "SELECT * FROM bee_creative_items WHERE scope='studio'"
  );
  const items = all.filter((x) => x.data.published === 'yes' && canPublish(x, all));
  return (
    <div className="creative-crm">
      <header className="cc-top">
        <Link href="/">BEEYONDTHEWORLD</Link>
        <Link href="/contact">Begin a conversation</Link>
      </header>
      <main>
        <div className="cc-title">
          <div>
            <span className="cc-eyebrow">TRAVEL SHOWREEL · LOCAL CREATIVE SCOUTS</span>
            <h1>
              Every place.
              <br />
              <em>A different soul.</em>
            </h1>
            <p>Stories rooted in a place, told by the people who know it.</p>
          </div>
        </div>
        {items.length ? (
          <div className="cc-cards">
            {items.map((x) => (
              <article key={x.id} className="cc-card">
                <div className="cc-image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={'/api/creative/showreel?image=' + x.id} alt={x.title} />
                </div>
                <div className="cc-card-body">
                  <small>{all.find((p) => p.id === x.data.destinationId)?.title}</small>
                  <h2>{x.title}</h2>
                  <p>{String(x.data.description || '')}</p>
                  <small>{String(x.data.credit || '')}</small>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="cc-empty">
            <h2>New stories are taking shape.</h2>
            <p>Our studio is curating the first destinations with local creators.</p>
            <Link href="/contact">Tell us about your next journey →</Link>
          </div>
        )}
      </main>
    </div>
  );
}
