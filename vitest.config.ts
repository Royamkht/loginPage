import { defineConfig } from 'vitest/config';

/**
 * `tests/` is reserved for Playwright (see playwright.config.ts).
 * Vitest must not load those files — Playwright's `test.describe` only works inside `playwright test`.
 */
export default defineConfig({
  test: {
    include: ['src/**/*.test.{ts,js}', 'src/**/*.spec.{ts,js}'],
    exclude: ['node_modules', 'dist', 'tests/**'],
    passWithNoTests: true,
  },
});
