import { readFileSync } from 'node:fs'
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type BrowserContext } from '@playwright/test'

// Story 1.9c: live data that is too old. The demo file is served as latest.json with mode "live", and the
// browser clock is locked, so the age limits (3 h / 12 h, NFR-3) act on it as they would in production.

const demo = JSON.parse(readFileSync(new URL('../../public/data/demo.json', import.meta.url), 'utf8')) as {
  referenceTime: string
}
const live = JSON.stringify({ ...demo, mode: 'live' })
const HOUR_MS = 3_600_000
const ref = Date.parse(demo.referenceTime)

async function serveLive(context: BrowserContext) {
  await context.route('**/*', (route) => {
    const { hostname } = new URL(route.request().url())
    return hostname === 'localhost' ? route.continue() : route.abort()
  })
  await context.route('**/data/latest.json', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: live }),
  )
}

test('a first load with only too-old live data explains it, offers a reload and hides the switch', async ({
  page,
  context,
}) => {
  await serveLive(context)
  await page.clock.install({ time: new Date(ref + 13 * HOUR_MS) })
  await page.goto('/?visning=liste')

  await expect(page.getByRole('heading', { level: 2, name: 'Ingen ferske data' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Last inn på nytt' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Visning' })).toHaveCount(0)
  // The page-wide status region existed while loading and was filled in afterwards, so it is announced.
  await expect(page.getByRole('status').filter({ hasText: 'Ingen ferske data' })).toHaveCount(1)

  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([])
})

test('an open tab marks places «Utdatert» and then shows the empty state as the live data ages', async ({
  page,
  context,
}) => {
  await serveLive(context)
  // Every demo place is at most 4 h older than the reference time, so 1 h later they are all still shown.
  await page.clock.install({ time: new Date(ref + 1 * HOUR_MS) })
  await page.goto('/?visning=liste')
  await expect(page.locator('a.liste-rad')).toHaveCount(24)

  await page.clock.fastForward('03:00:00')
  await expect(page.locator('a.liste-rad').filter({ hasText: 'Utdatert' })).toHaveCount(24)

  await page.clock.fastForward('09:00:00')
  await expect(page.locator('a.liste-rad')).toHaveCount(0)
  await expect(page.getByRole('status').filter({ hasText: 'Ingen ferske data' })).toHaveCount(1)
})
