import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    // AD-4: unit tests are colocated with the code; contract tests run against the recorded fixtures.
    include: ['src/**/*.test.{ts,tsx}', 'shared/**/*.test.ts', 'scripts/**/*.test.ts', 'tests/contract/**/*.test.ts'],
  },
})
