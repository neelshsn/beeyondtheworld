import { expect, test } from '@playwright/test';

test.describe('Concept canvas navigation', () => {
  test('hash landing and paging', async ({ page }) => {
    await page.goto('/concept#sustainability');

    await expect(
      page.getByRole('heading', {
        name: 'Sustainable nectar gathering',
        level: 2,
      })
    ).toBeVisible();

    await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL(/#rseLabel$/);
    await expect(page.getByRole('heading', { name: 'CSR hive standard', level: 2 })).toBeVisible();

    await page.keyboard.press('ArrowLeft');
    await expect(page).toHaveURL(/#sustainability$/);
  });
});
