import { expect, test } from '@playwright/test';

import { mainNav } from '../src/config/navigation';

test.describe('Main menu navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('navigates via menu and restores focus to trigger', async ({ page }) => {
    const menuButton = page.getByRole('button', { name: 'Menu' });

    for (const item of mainNav) {
      await expect(menuButton).toBeVisible();
      await menuButton.click();

      const dialog = page.getByRole('dialog', { name: 'Primary navigation' });
      await expect(dialog).toBeVisible();

      const link = dialog.getByRole('link', { name: item.label, exact: true });
      await link.click();

      await page.waitForURL((url) => url.pathname === item.href, { timeout: 10_000 });

      await expect(page.getByRole('dialog')).toHaveCount(0);

      await page.waitForFunction(
        () => document.activeElement?.textContent?.trim().toLowerCase() === 'menu'
      );

      await expect(menuButton).toBeFocused();
    }
  });
});
