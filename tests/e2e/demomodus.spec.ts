import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

// Story 1.11c: a build with `--mode demo` reads demo.json and never latest.json, even when a valid
// latest.json is there to be read.

const demo = JSON.parse(readFileSync(new URL('../../public/data/demo.json', import.meta.url), 'utf8')) as object
const live = JSON.stringify({ ...demo, mode: 'live' })

test('demo mode shows the banner and the 24 demo places, and reads only demo.json', async ({
  page,
  context,
  baseURL,
}) => {
  // Nothing from the network; only the local preview server answers.
  await context.route('**/*', (route) => {
    const { hostname } = new URL(route.request().url())
    return hostname === 'localhost' ? route.continue() : route.abort()
  })
  await context.route('**/data/latest.json', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: live }),
  )

  // Full addresses, so a call to another host is caught too.
  const datakall: string[] = []
  page.on('request', (request) => {
    if (/\/data\/[^/]+\.json$/.test(new URL(request.url()).pathname)) datakall.push(request.url())
  })

  await page.goto('/?visning=liste')

  await expect(page.getByText('Demodata – ikke ekte prognoser')).toBeVisible()
  await expect(page.locator('a.liste-rad')).toHaveCount(24)
  expect(datakall).toEqual([`${baseURL}/data/demo.json`])
})
