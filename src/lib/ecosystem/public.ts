import 'server-only';
import { sqlClient } from '@/lib/db/client';
import type { StoredMedia } from './media';
export type PublicPoetAsset = {
  id: string;
  title: string;
  description: string;
  credit: string;
  creator: string;
  portfolio: string;
  slot: string;
  mime: string;
  location: string;
  aiDisclosure: string;
  position: number;
};
const visible = `a.scope='studio' AND a.status='published' AND a.authenticity='approved' AND a.rights_review='approved' AND a.safety='approved' AND a.human_creative='approved' AND a.rights_scope='public_journeys' AND a.rights_evidence<>'' AND a.rights_expires_at>=CURRENT_DATE AND a.ai_disclosure<>'ai_generated' AND c.status IN ('approved','active') AND m.storage_state='complete' AND m.purpose='public_rendition' AND ja.public_media_id=a.public_media_id AND (coalesce((m.metadata->>'softFade')::boolean,false)=false OR a.soft_fade_consent)`;
export async function publicPoetAssets(slug: string): Promise<PublicPoetAsset[]> {
  const rows = await sqlClient().query(
    `SELECT a.id,a.title,a.description,a.credit,a.slot,a.location,a.ai_disclosure,c.display_name,c.portfolio_url,m.mime,ja.position FROM bee_ecosystem_journey_assets ja JOIN bee_ecosystem_assets a ON a.id=ja.asset_id JOIN bee_ecosystem_creators c ON c.id=a.creator_id JOIN bee_ecosystem_media m ON m.id=ja.public_media_id JOIN journeys j ON j.id::text=ja.journey_id WHERE j.slug=$1 AND j.published AND ${visible} ORDER BY ja.published_at,ja.position,a.id`,
    [slug]
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    credit: r.credit,
    creator: r.display_name,
    portfolio: r.portfolio_url,
    slot: r.slot,
    mime: r.mime,
    location: r.location,
    aiDisclosure: r.ai_disclosure,
    position: r.position,
  }));
}
export async function publicPoetMedia(assetId: string): Promise<StoredMedia | undefined> {
  const [row] = await sqlClient().query<StoredMedia>(
    `SELECT m.* FROM bee_ecosystem_journey_assets ja JOIN bee_ecosystem_assets a ON a.id=ja.asset_id JOIN bee_ecosystem_creators c ON c.id=a.creator_id JOIN bee_ecosystem_media m ON m.id=ja.public_media_id JOIN journeys j ON j.id::text=ja.journey_id WHERE a.id=$1 AND j.published AND ${visible} LIMIT 1`,
    [assetId]
  );
  return row;
}
