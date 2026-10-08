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
const verdi = (page: Page, navn: string) => page.locator('.sted-tall div').filter({ has: page.getByText(navn, { exact: true }) }).locator('dd')

test('Gaustatoppen from the list shows the sub-scores, the data and the source time', async ({ page }) => {
  await page.goto('/?visning=liste')
  await page.locator('a.liste-rad').filter({ hasText: 'Gaustatoppen' }).click()
  await expect(page).toHaveURL(/\/sted\/gaustatoppen$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gaustatoppen')
  await expect(page.locator('.sted-score')).toHaveText('58 · Godt')

  await expect(verdi(page, 'A Nysnøpotensial')).toHaveText('30,0 av 60')
  await expect(verdi(page, 'B Kuldebonus')).toHaveText('13,1 av 25')
  await expect(verdi(page, 'C Snøandel')).toHaveText('15,0 av 15')
  await expect(verdi(page, 'Nysnø neste døgn')).toHaveText('10 cm')
  await expect(verdi(page, 'Temperatur, snitt')).toHaveText('−6,4 °C')
  await expect(verdi(page, 'Vind, maks')).toHaveText('12 m/s')
  await expect(verdi(page, 'Skydekke, snitt')).toHaveText('85 %')
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

for (const id of ['gaustatoppen', 'kirkenes', 'trondheim']) {
  test(`the place page for ${id} has no serious or critical WCAG 2.1 AA violations`, async ({ page }) => {
    await page.goto(`/sted/${id}`)
    await expect(page.locator('.sted-kort')).toHaveCount(2)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    const blocking = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical')
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
  })
}
