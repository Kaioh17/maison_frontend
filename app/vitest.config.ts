import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

/**
 * Kept separate from `vite.config.ts` on purpose: the app config registers
 * VitePWA, whose service-worker build has no place in a unit test run. Vitest
 * prefers this file when present.
 *
 * `tsconfigPaths()` is required so `@components/*`, `@pages/*`, etc. resolve in
 * tests exactly as they do in the app.
 */
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: false,
  },
})
