import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// Story 1.12 (FR-33): «Best akkurat nå», the best three among the hits above the map and the list, on the demo data.

test.beforeEach(async ({ context }) => {
  // Same isolation as kart.spec.ts: nothing from the network.
  await context.route('**/*', (route) => {
    const { hostname } = new URL(route.request().url())
    return hostname === 'localhost' ? route.continue() : route.abort()
  })
})

const seksjon = (page: Page) => page.getByRole('region', { name: /^Best (akkurat nå|blant treffene)$/ })
const rader = (page: Page) => seksjon(page).getByRole('listitem')

test('without a filter, «Best akkurat nå» shows the three best places in the list order, on map and list', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 2, name: 'Best akkurat nå' })).toBeVisible()
  // The demo data's three highest scores, as the list sorted by score shows them first.
  await expect(rader(page)).toHaveText(['Gaustatoppen, 58 · Godt', 'Jiehkkevárri, 53 · Godt', 'Trysil, 50 · Godt'])

  await page.goto('/?visning=liste')
  await expect(rader(page)).toHaveText(['Gaustatoppen, 58 · Godt', 'Jiehkkevárri, 53 · Godt', 'Trysil, 50 · Godt'])
  const forsteTreKort = (await page.locator('a.liste-rad .liste-navn').allTextContents()).slice(0, 3)
  expect(forsteTreKort).toEqual(['Gaustatoppen', 'Jiehkkevárri', 'Trysil'])
})

test('with a filter the heading is «Best blant treffene» and the row picks among the hits only', async ({ page }) => {
  // Nysnø at least 2 cm and at most 0 °C: Trysil (1 °C) is not a hit, so Galdhøpiggen comes third.
  await page.goto('/?nysno=2&temp=0')
  await expect(page.getByRole('heading', { level: 2, name: 'Best blant treffene' })).toBeVisible()
  await expect(rader(page)).toHaveText(['Gaustatoppen, 58 · Godt', 'Jiehkkevárri, 53 · Godt', 'Galdhøpiggen, 41 · Middels'])
})

test('at zero hits the row is not shown, and the zero-hit card explains the result', async ({ page }) => {
  await page.goto('/?nysno=30')
  await expect(page.locator('.ingen-treff')).toBeVisible()
  await expect(seksjon(page)).toHaveCount(0)
})

test('a place in the row opens its place page with the search in the address, and «Tilbake» returns', async ({ page }) => {
  await page.goto('/?visning=liste&nysno=2&temp=0')
  await seksjon(page).getByRole('link', { name: /^Gaustatoppen/ }).click()
  await expect(page).toHaveURL(/\/sted\/gaustatoppen\?visning=liste&nysno=2&temp=0$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gaustatoppen')
  await page.getByRole('link', { name: 'Tilbake', exact: true }).click()
  await expect(page).toHaveURL(/\/\?visning=liste&nysno=2&temp=0$/)
})

test('at 375 px each place is one line between the search and the map, with no sideways scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  const sokBox = await page.locator('.sted-sok').boundingBox()
  const seksjonBox = await seksjon(page).boundingBox()
  const kartBox = await page.locator('.kart').boundingBox()
  if (!sokBox || !seksjonBox || !kartBox) throw new Error('The search, the row and the map must all be rendered')
  expect(seksjonBox.y).toBeGreaterThanOrEqual(sokBox.y + sokBox.height)
  expect(seksjonBox.y + seksjonBox.height).toBeLessThanOrEqual(kartBox.y)
  // One line per place: the name is a single line box, and the row is not in the bottom sheet.
  for (const navn of await seksjon(page).locator('.best-naa-navn').all()) {
    const lineHeight = await navn.evaluate((el) => parseFloat(el.ownerDocument.defaultView?.getComputedStyle(el).lineHeight ?? '0'))
    const box = await navn.boundingBox()
    expect(box?.height ?? Infinity).toBeLessThanOrEqual(lineHeight + 1)
  }
  await expect(page.locator('.filter .best-naa')).toHaveCount(0)
  // The same place in the list view: under the search, above the first card.
  await page.goto('/?visning=liste')
  const listeSok = await page.locator('.sted-sok').boundingBox()
  const listeSeksjon = await seksjon(page).boundingBox()
  const forsteKort = await page.locator('a.liste-rad').first().boundingBox()
  if (!listeSok || !listeSeksjon || !forsteKort) throw new Error('The search, the row and the list must all be rendered')
  expect(listeSeksjon.y).toBeGreaterThanOrEqual(listeSok.y + listeSok.height)
  expect(listeSeksjon.y + listeSeksjon.height).toBeLessThanOrEqual(forsteKort.y)
  const [scrollWidth, clientWidth] = await page.locator('html').evaluate((el) => [el.scrollWidth, el.clientWidth])
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
})

test('at 1280 px the three places stand side by side above the map, beside the filter panel', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  // Wait for the data: the row and the map render only once the places have loaded.
  await expect(seksjon(page).getByRole('link')).toHaveCount(3)
  await expect(page.locator('path.kart-markor')).toHaveCount(24)
  const bokser = await Promise.all((await seksjon(page).getByRole('link').all()).map((lenke) => lenke.boundingBox()))
  const panel = await page.getByRole('complementary', { name: 'Filter' }).boundingBox()
  const kart = await page.locator('.kart').boundingBox()
  if (bokser.some((b) => !b) || !panel || !kart) throw new Error('The row, the panel and the map must all be rendered')
  const [a, b, c] = bokser as { x: number; y: number; width: number; height: number }[]
  expect(Math.abs(a.y - b.y)).toBeLessThan(2)
  expect(Math.abs(b.y - c.y)).toBeLessThan(2)
  expect(a.x).toBeGreaterThanOrEqual(panel.x + panel.width)
  expect(a.y + a.height).toBeLessThanOrEqual(kart.y)
})

test('axe finds no serious or critical problems on Utforsk with the row shown', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(seksjon(page)).toBeVisible()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const blocking = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical')
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
})
