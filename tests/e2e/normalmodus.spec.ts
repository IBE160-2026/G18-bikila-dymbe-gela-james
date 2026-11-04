import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'

// Story 1.11c: a build without `--mode demo` reads latest.json and never demo.json, even though demo.json
// is in this build. Runs in its own Playwright project, against its own build (playwright.config.ts).

const demo = JSON.parse(readFileSync(new URL('../../public/data/demo.json', import.meta.url), 'utf8')) as {
  referenceTime: string
}
const live = JSON.stringify({ ...demo, mode: 'live' })
const DEMOBANNER = 'Demodata – ikke ekte prognoser'

/** Every call for a data file. Full addresses, so a call to another host is caught too. */
function samleDatakall(page: Page): string[] {
  const urls: string[] = []
  page.on('request', (request) => {
    if (/\/data\/[^/]+\.json$/.test(new URL(request.url()).pathname)) urls.push(request.url())
  })
  return urls
}

test.beforeEach(async ({ context }) => {
  // Nothing from the network; only the local preview server answers.
  await context.route('**/*', (route) => {
    const { hostname } = new URL(route.request().url())
    return hostname === 'localhost' ? route.continue() : route.abort()
  })
})

test('with a latest.json the places are shown without the demo banner, and only that file is read', async ({
  page,
  context,
  baseURL,
}) => {
  await context.route('**/data/latest.json', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: live }),
  )
  const datakall = samleDatakall(page)
  // The clock is locked to the time of the data, so the age limits (NFR-3) keep the places.
  await page.clock.install({ time: new Date(demo.referenceTime) })

  await page.goto('/?visning=liste')

  await expect(page.locator('a.liste-rad')).toHaveCount(24)
  await expect(page.getByText(DEMOBANNER)).toHaveCount(0)
  expect(datakall).toEqual([`${baseURL}/data/latest.json`])
})

test('without a latest.json the app says so and never falls back to the demo.json in the build', async ({
  page,
  context,
  request,
  baseURL,
}) => {
  // The test proves nothing unless the file it must not read is really there. `request` bypasses the routes.
  const demoFil = await request.get('/data/demo.json')
  expect((await demoFil.json()).mode).toBe('demo')

  await context.route('**/data/latest.json', (route) => route.fulfill({ status: 404, body: '' }))
  const datakall = samleDatakall(page)

  await page.goto('/')

  await expect(page.getByText('Fant ingen værdata')).toBeVisible()
  await expect(page.getByText(DEMOBANNER)).toHaveCount(0)
  expect(datakall).toEqual([`${baseURL}/data/latest.json`])
})
