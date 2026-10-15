import { beforeAll, describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import gallery from '../src/lib/review/gallery.json';
import keys from '../src/lib/review/screen-keys.json';

type Page = { id: string; role: string; v2?: string; title: string };
const start = gallery.indexOf('const D=') + 8;
const data = JSON.parse(gallery.slice(start, gallery.indexOf(';window.BEE_REVIEW_DATA', start)));
const pages: Page[] = data.pages.filter((p: Page) => p.v2);
const allowed = new Set(keys);
const reviewWindow = window as typeof window & {
  BEE_REVIEW_DATA: typeof data;
  BeeReviewMath: unknown;
  BeeReviewV2: { render: (page: Page) => void };
};
beforeAll(() => {
  reviewWindow.BEE_REVIEW_DATA = data;
  reviewWindow.BeeReviewMath = createRequire(import.meta.url)('../public/review/review-metrics.js');
  // Execute the actual standalone renderer in the test DOM, with no network or real database.
  new Function(readFileSync('public/review/v2.js', 'utf8'))();
});
describe('all enriched role/page surfaces', () => {
  it.each(pages)('$role / $id renders with valid cross-role links and existing images', (page) => {
    document.body.innerHTML =
      '<button id="baseline-toggle"></button><div id="interactive"></div><div class="screenwrap"></div>';
    reviewWindow.BeeReviewV2.render(page);
    const host = document.getElementById('interactive')!;
    expect(host.querySelector('h1')?.textContent).toBe(page.title);
    expect(host.textContent).not.toContain('undefined');
    for (const a of host.querySelectorAll<HTMLAnchorElement>('a[href^="#view/"]')) {
      expect(allowed.has(a.getAttribute('href')!.slice(6)), a.outerHTML).toBe(true);
    }
    for (const img of host.querySelectorAll<HTMLImageElement>('img')) {
      expect(existsSync('public' + img.getAttribute('src')), img.outerHTML).toBe(true);
    }
    const ids = [...host.querySelectorAll('[id]')].map((el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('retains every original feedback address', () => {
    const original = JSON.parse(readFileSync('src/lib/review/gallery-v1.json', 'utf8')) as string;
    const oldStart = original.indexOf('const D=') + 8;
    const oldData = JSON.parse(original.slice(oldStart, original.indexOf(';const $=', oldStart)));
    for (const p of oldData.pages) expect(allowed.has(p.role + '/' + p.id)).toBe(true);
  });
});
