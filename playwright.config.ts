import { defineConfig, devices } from '@playwright/test'

// AD-4: the E2E tests run against production builds served by `vite preview`. The data file is chosen when
// the app is built, so demo mode and normal mode each get their own build and port. Neither command runs
// `prebuild`, so no test needs the network or files from `npm run data`.
const DEMO_PORT = 4173
const NORMAL_PORT = 4174
const NORMAL_OUT_DIR = 'node_modules/.cache/e2e-normal'
const NORMAL_SPEC = /normalmodus\.spec\.ts$/

export default defineConfig({
  testDir: 'tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: NORMAL_SPEC,
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${DEMO_PORT}` },
    },
    {
      name: 'normalmodus',
      testMatch: NORMAL_SPEC,
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${NORMAL_PORT}` },
    },
  ],
  webServer: [
    {
      command: `npm run build:demo && npm run preview -- --port ${DEMO_PORT} --strictPort`,
      url: `http://localhost:${DEMO_PORT}`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `npm run build --ignore-scripts -- --outDir ${NORMAL_OUT_DIR} && npx vite preview --outDir ${NORMAL_OUT_DIR} --port ${NORMAL_PORT} --strictPort`,
      url: `http://localhost:${NORMAL_PORT}`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
})
