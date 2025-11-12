import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    exclude: ['tests/**/*.spec.ts', 'node_modules', '.next', 'playwright.config.ts'],
  },
});
