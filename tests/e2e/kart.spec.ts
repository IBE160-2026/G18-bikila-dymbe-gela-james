import { expect, test } from '@playwright/test'
import { zoomStep } from './kartZoom'

// Story 1.7 smoke test: map -> place page -> back, on the committed demo data.

test.beforeEach(async ({ context }) => {
  // Never fetch map tiles (or anything else) from the network; only the local preview server answers.
  await context.route('**/*', (route) => {
    const { hostname } = new URL(route.request().url())
    return hostname === 'localhost' ? route.continue() : route.abort()
  })
})

const markers = 'path.kart-markor'
const hemsedal = 'path[data-sted-id="hemsedal-skisenter"]'

test('the map shows every demo place and a marker opens its place page', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Demodata – ikke ekte prognoser')).toBeVisible()
  await expect(page.locator(markers)).toHaveCount(24)

  // Markers start small at country level and grow when the user zooms in (Story 1.7b).
  // The largest marker on screen: zooming moves single places (Hemsedal too) out of view.
  const width = () =>
    page.locator(markers).evaluateAll((paths) => Math.max(...paths.map((p) => p.getBoundingClientRect().width)))
  const before = await width()
  // The first fit can be below zoom 5, where markers are still at their minimum, so zoom in twice. Each step
  // waits for Leaflet's animation, which would otherwise swallow the second click (Story 3.1 made this visible).
  await zoomStep(page, 'Zoom in')
  await zoomStep(page, 'Zoom in')
  await expect.poll(width).toBeGreaterThan(before + 2)
  const zoomedIn = await width()
  await zoomStep(page, 'Zoom out')
  await zoomStep(page, 'Zoom out')
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

// Review 2026-11-18: the front page says how fresh the data is and explains the map colours.
test('the map has a legend above it and the front page says when the data was updated', async ({ page }) => {
  await page.goto('/')
  // The demo file is generated 2026-10-07T20:30:29Z, which is 22:30 in Norway, the same day as the demo clock.
  await expect(page.getByText('Oppdatert kl. 22:30', { exact: true })).toBeVisible()
  const legend = page.getByRole('list', { name: 'Fargeforklaring' })
  await expect(legend.getByRole('listitem')).toHaveText(['70–100 Svært godt', '45–69 Godt', '20–44 Middels', '0–19 Lite', 'Ufullstendige data'])
  // A strip above the map, never on top of it: its bottom edge is at or above the map's top edge.
  const legendBox = await legend.boundingBox()
  const mapBox = await page.locator('.kart').boundingBox()
  if (!legendBox || !mapBox) throw new Error('The legend and the map must both be rendered')
  expect(legendBox.y + legendBox.height).toBeLessThanOrEqual(mapBox.y)
  // The list view has no map, so it has no legend.
  await page.getByRole('link', { name: 'Liste', exact: true }).click()
  await expect(page.getByRole('list', { name: 'Fargeforklaring' })).toHaveCount(0)
})

// Review 2026-11-18: on a phone the legend is still shown, above the map and clear of the closed bottom sheet.
test('at 375 px the legend is visible above the map and not under the bottom sheet', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  const legend = page.getByRole('list', { name: 'Fargeforklaring' })
  await expect(legend).toBeVisible()
  const legendBox = await legend.boundingBox()
  const mapBox = await page.locator('.kart').boundingBox()
  const sheetBox = await page.locator('.filter').boundingBox()
  if (!legendBox || !mapBox || !sheetBox) throw new Error('The legend, the map and the sheet must all be rendered')
  expect(legendBox.y + legendBox.height).toBeLessThanOrEqual(mapBox.y)
  expect(legendBox.y + legendBox.height).toBeLessThanOrEqual(sheetBox.y)
})

// Change proposal 2026-11-20 (solution 1): on a small phone the map comes straight after the legend, and
// «Best akkurat nå» under it, so the map is seen above the bottom sheet without scrolling.
test('at 375 × 667 the map starts right under the legend, before «Best akkurat nå»', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')
  const legend = page.getByRole('list', { name: 'Fargeforklaring' })
  const rad = page.getByRole('region', { name: 'Best akkurat nå' })
  await expect(legend).toBeVisible()
  await expect(rad).toBeAttached()
  const legendBox = await legend.boundingBox()
  const mapBox = await page.locator('.kart').boundingBox()
  const radBox = await rad.boundingBox()
  const sheetBox = await page.locator('.filter').boundingBox()
  if (!legendBox || !mapBox || !radBox || !sheetBox) throw new Error('The legend, the map, the row and the sheet must all be rendered')
  // Nothing between the legend and the map but the legend's own small margin.
  expect(mapBox.y - (legendBox.y + legendBox.height)).toBeLessThan(16)
  expect(radBox.y).toBeGreaterThanOrEqual(mapBox.y + mapBox.height)
  // Well over the 59 px measured before the change are seen above the closed sheet.
  expect(sheetBox.y - mapBox.y).toBeGreaterThan(200)
  const [scrollWidth, clientWidth] = await page.locator('html').evaluate((el) => [el.scrollWidth, el.clientWidth])
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
})
