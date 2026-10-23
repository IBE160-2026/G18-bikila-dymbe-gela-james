import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    // AD-4: unit tests are colocated with the code; contract tests run against the recorded fixtures.
    include: ['src/**/*.test.{ts,tsx}', 'shared/**/*.test.ts', 'scripts/**/*.test.ts', 'tests/contract/**/*.test.ts'],
    // The demo runs and the SnowScore property tests (1000 runs each) take well under 2 s alone, but with the
    // whole suite in parallel on a busy Windows machine they went over the default 5 s, which stopped the
    // pre-push hook at random. One shared 15 s gives that room without a list of exceptions to keep up to
    // date, and still stops a test that really hangs.
    testTimeout: 15_000,
  },
})
