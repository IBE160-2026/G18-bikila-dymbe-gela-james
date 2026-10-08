import { expect, test } from '@playwright/test'

// Story 1.7 smoke test: map -> place page -> back, on the committed demo data.

test.beforeEach(async ({ context }) => {
  // Never fetch map tiles (or anything else) from the network; only the local preview server answers.
  await context.route('**/*', (route) => {
    const { hostname } = new URL(route.request().url())
    return hostname === 'localhost' ? route.continue() : route.abort()
  })
  // A latest.json left over from `npm run data` would end up in dist/; pretend it is absent so the
  // app falls back to demo.json, as on a clean clone.
  await context.route('**/data/latest.json', (route) => route.fulfill({ status: 404, body: '' }))
})

const markers = 'path.kart-markor'
const hemsedal = 'path[data-sted-id="hemsedal-skisenter"]'

test('the map shows every demo place and a marker opens its place page', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Demodata – ikke ekte prognoser')).toBeVisible()
  await expect(page.locator(markers)).toHaveCount(24)

  // Markers start small at country level and grow when the user zooms in (Story 1.7b).
  const width = async () => (await page.locator(hemsedal).boundingBox())?.width ?? 0
  const before = await width()
  await page.getByRole('button', { name: 'Zoom in' }).click()
  await expect.poll(width).toBeGreaterThan(before + 2)
  const zoomedIn = await width()
  await page.getByRole('button', { name: 'Zoom out' }).click()
  await expect.poll(width).toBeLessThan(zoomedIn - 2)

  // The score is never colour alone: the tooltip has the number and the label (demo score 7).
  await page.locator(hemsedal).hover()
  await expect(page.locator('.leaflet-tooltip')).toHaveText('Hemsedal skisenter · 7 · Lite')

  // Trondheim has incomplete data: a hollow marker with a dashed border, never a score of 0.
  await expect(page.locator('path[data-sted-id="trondheim"]')).toHaveAttribute('stroke-dasharray', '4 3')

  await page.locator(hemsedal).click()
  await expect(page).toHaveURL(/\/sted\/hemsedal-skisenter$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hemsedal skisenter')

  // The browser's Back button returns to the map.
  await page.goBack()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator(markers)).toHaveCount(24)

  // So does the in-app link on the place page.
  await page.locator(hemsedal).click()
  await expect(page).toHaveURL(/\/sted\/hemsedal-skisenter$/)
  await page.getByRole('link', { name: 'Tilbake', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator(markers)).toHaveCount(24)
})

test('a link to an unknown place says so and links to the map', async ({ page }) => {
  await page.goto('/sted/finnes-ikke')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fant ikke stedet')
  await expect(page.getByRole('link', { name: 'Gå til kartet' })).toBeVisible()
})
