import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// Story 1.6: a data file published more than 90 min ago gets the banner «Viser siste kjente data» on
// Utforsk and the place page, never on the explanation page, and the rest of the page works as before.

const BANNER = 'Viser siste kjente data fra kl. 20:30'

// Wide enough that the filter panel is a fixed side panel, as in filter.spec.ts.
test.use({ viewport: { width: 1280, height: 800 } })

test.beforeEach(async ({ context }) => {
  // Same isolation as kart.spec.ts: nothing from the network, and no leftover latest.json.
  await context.route('**/*', (route) => {
    const { hostname } = new URL(route.request().url())
    return hostname === 'localhost' ? route.continue() : route.abort()
  })
  await context.route('**/data/latest.json', (route) => route.fulfill({ status: 404, body: '' }))
  // The demo file has generert equal to referenceTime (20:30:29 UTC); a copy published two hours
  // earlier is old against the demo's "now". 18:30 UTC is 20:30 in Norway in October.
  await context.route('**/data/demo.json', async (route) => {
    const response = await route.fetch()
    const data = await response.json()
    data.generert = '2026-10-07T18:30:29Z'
    await route.fulfill({ response, json: data })
  })
})

const banner = (page: Page) => page.locator('.banner-stale-data')

async function utenAxeBrudd(page: Page) {
  // As in filter.spec.ts: axe must measure the settled page, not colours mid-animation.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const blocking = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical')
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
}

test('Utforsk shows the banner at the top, and the list and the filter work as before', async ({ page }) => {
  await page.goto('/?visning=liste')
  await expect(banner(page)).toHaveText(BANNER)
  // The banner sits in a status region that is mounted while empty, so it is announced when filled in.
  await expect(page.getByRole('status').filter({ has: banner(page) })).toHaveText(BANNER)
  // Above the content, not on top of it.
  const bannerBox = await banner(page).boundingBox()
  const mainBox = await page.locator('main').boundingBox()
  expect(bannerBox!.y + bannerBox!.height).toBeLessThanOrEqual(mainBox!.y + 1)

  // The same filter step as filter.spec.ts: at least 2 cm new snow leaves eight places.
  await expect(page.locator('a.liste-rad')).toHaveCount(24)
  const nysno = page.getByRole('slider', { name: 'Nysnø' })
  await nysno.focus()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  await expect(nysno).toHaveAttribute('aria-valuetext', 'minst 2 cm')
  await expect(page.locator('a.liste-rad')).toHaveCount(8)
  await expect(banner(page)).toHaveText(BANNER)
  await utenAxeBrudd(page)
})

test('the map view and the place page show the banner too', async ({ page }) => {
  await page.goto('/')
  await expect(banner(page)).toHaveText(BANNER)
  await expect(page.locator('.kart')).toBeVisible()

  await page.goto('/sted/gaustatoppen')
  await expect(banner(page)).toHaveText(BANNER)
  await expect(page.getByRole('heading', { level: 1, name: 'Gaustatoppen' })).toBeVisible()
  await utenAxeBrudd(page)
})

test('the explanation page has no banner', async ({ page }) => {
  await page.goto('/slik-beregner-vi-snowscore')
  await expect(page.getByRole('heading', { level: 1, name: 'Slik beregner vi SnowScore' })).toBeVisible()
  await expect(banner(page)).toHaveCount(0)
  await expect(page.getByRole('status').filter({ hasText: 'Viser siste kjente data' })).toHaveCount(0)
})
