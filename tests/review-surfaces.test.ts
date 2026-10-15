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
  new Function(readFileSync('public/review/label-model.js', 'utf8'))();
  new Function(readFileSync('public/review/email-review.js', 'utf8'))();
  new Function(readFileSync('public/review/tale-model.js', 'utf8'))();
  new Function(readFileSync('public/review/tale-workspace.js', 'utf8'))();
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
  it('reopens a metric review after editing its measurement and carries it to consolidation', () => {
    document.body.innerHTML =
      '<button id="baseline-toggle"></button><div id="interactive"></div><div class="screenwrap"></div>';
    const render = (id: string) =>
      reviewWindow.BeeReviewV2.render(pages.find((p) => p.role === 'bee' && p.id === id)!);
    render('evidence-register');
    (document.querySelector('[data-em-select="natural-beauty"]') as HTMLButtonElement).click();
    const change = (key: string, value: string) => {
      const el = document.querySelector(`[data-field="${key}"]`) as HTMLInputElement;
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };
    change('em-natural-beauty-n', '3');
    change('em-natural-beauty-ref', 'EXERCISE / register');
    change('em-natural-beauty-risk', 'Standard');
    change('em-natural-beauty-review', 'Reviewed in exercise');
    change('em-natural-beauty-decision', 'Accepted in exercise');
    expect(document.querySelector('#interactive')!.textContent).toContain('Accepted in exercise');
    change('em-natural-beauty-n', '2');
    expect(
      (document.querySelector('[data-field="em-natural-beauty-review"]') as HTMLSelectElement).value
    ).toBe('Pending');
    expect(
      (document.querySelector('[data-field="em-natural-beauty-decision"]') as HTMLSelectElement)
        .value
    ).toBe('Pending');
    expect(document.querySelector('.em-result')!.textContent).toContain('40.0%');
    render('bee-certified');
    expect(document.querySelector('.statrow')!.textContent).toContain('1 / 37');
    expect(document.querySelector('#interactive')!.textContent).toContain('Not issued');
  });
});
