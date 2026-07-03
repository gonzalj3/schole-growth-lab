import { defineConfig } from 'vitest/config';

// Vitest runs the pure /src/core modules and /evals. No jsdom needed — the core
// is framework-free by design (CLAUDE.md §3), so tests run in a plain node env.
// resolve.tsconfigPaths lets tests use the `@/` alias natively (Vitest v4+).
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts', 'evals/**/*.{test,spec}.ts'],
  },
});
