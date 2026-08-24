import { expect, test } from '@playwright/test';

test.describe('Concept canvas navigation', () => {
  test('hash landing and paging', async ({ page }) => {
    await page.goto('/concept#csrLabel');

    await expect(
      page.getByRole('heading', {
        name: 'CSR LABEL',
        level: 2,
      })
    ).toBeVisible();

    await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL(/#communities$/);
    await expect(
      page.getByRole('heading', { name: 'WORLDWIDE COMMUNITIES', level: 2 })
    ).toBeVisible();

    await page.keyboard.press('ArrowLeft');
    await expect(page).toHaveURL(/#csrLabel$/);
  });
});
