import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// Story 1.9: the place page with the full score, its basis and the data age marks, in demo mode.

test.beforeEach(async ({ context }) => {
  // Same isolation as kart.spec.ts: nothing from the network, and no leftover latest.json.
  await context.route('**/*', (route) => {
    const { hostname } = new URL(route.request().url())
    return hostname === 'localhost' ? route.continue() : route.abort()
  })
  await context.route('**/data/latest.json', (route) => route.fulfill({ status: 404, body: '' }))
})

/** The value next to a label in the page's definition lists. */
const verdi = (page: Page, navn: string) => page.locator('.tall-liste div').filter({ has: page.getByText(navn, { exact: true }) }).locator('dd')

test('Gaustatoppen from the list shows the sub-scores, the data and the source time', async ({ page }) => {
  await page.goto('/?visning=liste')
  await page.locator('a.liste-rad').filter({ hasText: 'Gaustatoppen' }).click()
  await expect(page).toHaveURL(/\/sted\/gaustatoppen\?visning=liste$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gaustatoppen')
  await expect(page.locator('.sted-score')).toHaveText('58 · Godt')

  await expect(verdi(page, 'A Nysnøpotensial')).toHaveText('30,0 av 60')
  await expect(verdi(page, 'B Kuldebonus')).toHaveText('13,1 av 25')
  await expect(verdi(page, 'C Snøandel')).toHaveText('15,0 av 15')
  await expect(verdi(page, 'Nysnø neste døgn')).toHaveText('10 cm')
  await expect(verdi(page, 'Temperatur, snitt')).toHaveText('−6,4 °C')
  await expect(verdi(page, 'Vind, maks')).toHaveText('12 m/s')
  await expect(verdi(page, 'Skydekke, snitt')).toHaveText('85 %')
  await expect(verdi(page, 'Skydekke i dagslys')).toHaveText('87,9 %')
  await expect(verdi(page, 'Høyde')).toHaveText('1\u00a0882 moh.')
  await expect(verdi(page, 'NVE-nysnø siste døgn')).toHaveText('0 mm')
  await expect(page.getByText('Prognose fra MET, oppdatert 7. oktober 2026 kl. 22:30')).toBeVisible()
  await expect(page.getByText(/^Utdatert/)).toHaveCount(0)

  // EXPERIENCE.md: touch targets of at least 44px, also for «Tilbake».
  const tilbake = await page.getByRole('link', { name: 'Tilbake', exact: true }).boundingBox()
  expect(tilbake?.height ?? 0).toBeGreaterThanOrEqual(44)
  expect(tilbake?.width ?? 0).toBeGreaterThanOrEqual(44)
})

test('Kirkenes is marked «Utdatert» with its time, on the page and in the list', async ({ page }) => {
  await page.goto('/?visning=liste')
  const rad = page.locator('a.liste-rad').filter({ hasText: 'Kirkenes' })
  await expect(rad).toContainText('Utdatert · data fra 7. oktober 2026 kl. 18:30')

  await page.goto('/sted/kirkenes')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kirkenes')
  await expect(page.locator('p.utdatert')).toHaveText('Utdatert · data fra 7. oktober 2026 kl. 18:30')
})

test('Trondheim shows «Ufullstendige data» as text, without a badge or sub-scores', async ({ page }) => {
  await page.goto('/sted/trondheim')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Trondheim')
  await expect(page.locator('.sted-score')).toHaveText('Ufullstendige data')
  await expect(page.locator('.score-badge')).toHaveCount(0)
  await expect(page.getByText('A Nysnøpotensial')).toHaveCount(0)
  await expect(verdi(page, 'Temperatur, snitt')).toHaveText('–')
})

for (const id of ['gaustatoppen', 'kirkenes', 'trondheim', 'hafjell']) {
  test(`the place page for ${id} has no serious or critical WCAG 2.1 AA violations`, async ({ page }) => {
    await page.goto(`/sted/${id}`)
    await expect(page.locator('.sted-kort')).toHaveCount(3)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    const blocking = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical')
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
  })
}

// Story 4.2 (FR-17): the best ski window card, read from the data file.

const skivindu = (page: Page) => page.locator('section.skivindu')

/** The page has no horizontal scrolling. */
async function utenSidelengsRulling(page: Page) {
  const [scrollWidth, clientWidth] = await page.locator('html').evaluate((el) => [el.scrollWidth, el.clientWidth])
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
}

test('Hafjell shows the best ski window in Norwegian time with wind and cloud cover, right of SnowScore at 1280 px', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/sted/hafjell')
  const kort = skivindu(page)
  await expect(kort.getByRole('heading', { level: 2 })).toHaveText('Beste skivindu')
  // 2026-10-09T11:00Z is Friday 13:00 in Norway (CEST); four hours.
  await expect(kort.locator('.skivindu-tid')).toHaveText('fredag 13–17')
  await expect(kort).toContainText('Snittvind 1 m/s, skydekke 91 %, etter snøfallet')
  await expect(kort).not.toContainText('Mørketid')

  const score = await page.locator('section.snowscore').boundingBox()
  const vindu = await kort.boundingBox()
  const grunnlag = await page.locator('section.grunnlag').boundingBox()
  expect(vindu!.x).toBeGreaterThan(score!.x + score!.width - 1)
  expect(Math.abs(vindu!.y - score!.y)).toBeLessThan(1)
  // Grunnlag stays in the left column, under SnowScore.
  expect(Math.abs(grunnlag!.x - score!.x)).toBeLessThan(1)
  expect(grunnlag!.y).toBeGreaterThan(score!.y + score!.height - 1)
  await utenSidelengsRulling(page)
})

test('at 375 px the ski window card is under SnowScore and above Grunnlag, without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto('/sted/hafjell')
  await expect(skivindu(page).locator('.skivindu-tid')).toHaveText('fredag 13–17')
  const score = await page.locator('section.snowscore').boundingBox()
  const vindu = await skivindu(page).boundingBox()
  const grunnlag = await page.locator('section.grunnlag').boundingBox()
  expect(vindu!.y).toBeGreaterThan(score!.y + score!.height - 1)
  expect(grunnlag!.y).toBeGreaterThan(vindu!.y + vindu!.height - 1)
  expect(Math.abs(vindu!.x - score!.x)).toBeLessThan(1)
  await utenSidelengsRulling(page)
})

test('Gaustatoppen, where it snows through the period, keeps the card with a message', async ({ page }) => {
  await page.goto('/sted/gaustatoppen')
  await expect(skivindu(page)).toContainText('Fant ikke noe skivindu de neste 48 timene.')
})

test('a data file with skivinduUtenDagslys shows the polar night text in the card', async ({ page }) => {
  // The demo data is from 7 October, with no polar night anywhere; the flag is set in a copy of the file,
  // with the window moved to night hours as the pipeline would pick them (08.10 01:00 UTC = 03:00 in Norway).
  await page.route('**/data/demo.json', async (route) => {
    const response = await route.fetch()
    const data = await response.json()
    for (const sted of data.steder) if (sted.id === 'tromso') {
        sted.skivinduUtenDagslys = true
        sted.skivindu = { ...sted.skivindu, start: '2026-10-08T01:00:00Z' }
      }
    await route.fulfill({ response, json: data })
  })
  await page.goto('/sted/tromso')
  await expect(skivindu(page)).toContainText('Mørketid – vindu vist uten dagslys')
  await expect(skivindu(page).locator('.skivindu-tid')).toHaveText('torsdag 03–07')
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const blocking = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical')
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
})
