import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    // AD-4: tests are colocated with the app, the shared module and the Edge Functions.
    include: ['src/**/*.test.{ts,tsx}', 'shared/**/*.test.ts', 'supabase/functions/**/*.test.ts'],
  },
})
