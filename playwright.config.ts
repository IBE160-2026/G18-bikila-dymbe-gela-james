import { defineConfig, devices } from '@playwright/test'

// AD-4: the E2E tests run against production builds served by `vite preview`. The data file is chosen when
// the app is built, so demo mode and normal mode each get their own build and port. Neither command runs
// `prebuild`, so no test needs the network or files from `npm run data`.
const DEMO_PORT = 4173
const NORMAL_PORT = 4174
const NORMAL_OUT_DIR = 'node_modules/.cache/e2e-normal'
const NORMAL_SPEC = /normalmodus\.spec\.ts$/
// Story 2.1b: the mirrored sliders behave differently between browser engines, so this file also runs in
// Firefox and WebKit. Only this file: the rest of E2E stays Chromium, so the suite does not run three times.
const NETTLESER_SPEC = /slidere\.spec\.ts$/
// `npm run test:e2e:nettlesere` names only these two projects; they read the demo build alone, so that run
// does not build and serve the normal-mode app as well.
const BARE_NETTLESERE = process.argv.some((arg) => /^--project=(firefox|webkit)$/.test(arg)) &&
  !process.argv.some((arg) => /^--project=(chromium|normalmodus)$/.test(arg))

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
    {
      name: 'firefox',
      testMatch: NETTLESER_SPEC,
      use: { ...devices['Desktop Firefox'], baseURL: `http://localhost:${DEMO_PORT}` },
    },
    {
      name: 'webkit',
      testMatch: NETTLESER_SPEC,
      use: { ...devices['Desktop Safari'], baseURL: `http://localhost:${DEMO_PORT}` },
    },
  ],
  webServer: [
    {
      command: `npm run build:demo && npm run preview -- --port ${DEMO_PORT} --strictPort`,
      url: `http://localhost:${DEMO_PORT}`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    ...(BARE_NETTLESERE
      ? []
      : [
          {
            command: `npm run build --ignore-scripts -- --outDir ${NORMAL_OUT_DIR} && npx vite preview --outDir ${NORMAL_OUT_DIR} --port ${NORMAL_PORT} --strictPort`,
            url: `http://localhost:${NORMAL_PORT}`,
            reuseExistingServer: false,
            timeout: 120_000,
          },
        ]),
  ],
})
