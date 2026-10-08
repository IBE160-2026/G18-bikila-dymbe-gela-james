import AxeBuilder from '@axe-core/playwright'
import { expect, test, type BrowserContext, type Locator, type Page } from '@playwright/test'

// Story 1.8: the list view as the keyboard and screen-reader alternative to the map.

/** Same isolation as kart.spec.ts: nothing from the network, and no leftover latest.json. */
async function isolate(context: BrowserContext): Promise<void> {
  await context.route('**/*', (route) => {
    const { hostname } = new URL(route.request().url())
    return hostname === 'localhost' ? route.continue() : route.abort()
  })
  await context.route('**/data/latest.json', (route) => route.fulfill({ status: 404, body: '' }))
}

test.beforeEach(({ context }) => isolate(context))

const rows = (page: Page) => page.locator('a.liste-rad')

/** Presses Tab until `target` has focus, like a keyboard user would; fails if it never does. */
async function tabTo(page: Page, target: Locator, maxPresses = 40): Promise<void> {
  for (let i = 0; i < maxPresses; i++) {
    await page.keyboard.press('Tab')
    if ((await target.and(page.locator(':focus')).count()) === 1) return
  }
  throw new Error(`Tab never reached ${target.toString()}`)
}

test('the list works with the keyboard alone: switch, sort, open a place and come back', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Kart', exact: true })).toHaveAttribute('aria-current', 'page')

  const liste = page.getByRole('link', { name: 'Liste', exact: true })
  await tabTo(page, liste)
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/\?visning=liste$/)
  await expect(liste).toHaveAttribute('aria-current', 'page')

  // Sorted by score: the highest demo score first, incomplete data last and never as 0.
  await expect(rows(page)).toHaveCount(24)
  await expect(rows(page).first()).toContainText('Gaustatoppen')
  await expect(rows(page).first()).toContainText('58 · Godt')
  await expect(rows(page).last()).toContainText('Trondheim')
  await expect(rows(page).last()).toContainText('Ufullstendige data')

  // Sorting by name puts Norwegian letters last.
  const sortering = page.getByLabel('Sorter etter')
  await tabTo(page, sortering)
  await sortering.selectOption('navn')
  await expect(rows(page).first()).toContainText('Bergen')
  await expect(rows(page).last()).toContainText('Voss Resort Fjellheisar')
  const names = await page.locator('.liste-navn').allTextContents()
  expect(names).toEqual([...names].sort(new Intl.Collator('nb').compare))

  // The first row by name is Bergen; Tab to it and open it with Enter.
  const bergen = rows(page).first()
  await tabTo(page, bergen)
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/sted\/bergen$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bergen')

  await page.goBack()
  await expect(page).toHaveURL(/\/\?visning=liste$/)
  await expect(rows(page)).toHaveCount(24)

  // The place page's own «Tilbake» link also returns to the list, not the map.
  await tabTo(page, rows(page).first())
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/sted\/gaustatoppen$/)
  await tabTo(page, page.getByRole('link', { name: 'Tilbake', exact: true }))
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/\?visning=liste$/)
  await expect(rows(page)).toHaveCount(24)

  // And «Kart» leaves the list: no `?visning=liste` may linger in the URL (1.7 finding 21).
  const kart = page.getByRole('link', { name: 'Kart', exact: true })
  await tabTo(page, kart)
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/$/)
  await expect(kart).toHaveAttribute('aria-current', 'page')
  await expect(rows(page)).toHaveCount(0)
})

test('sorting by distance uses the shared position, and a refusal falls back to score', async ({ browser }) => {
  // Allowed: a position in Oslo puts Oslo first, with the distance on every row.
  const allowed = await browser.newContext({ geolocation: { latitude: 59.9139, longitude: 10.7522 }, permissions: ['geolocation'] })
  await isolate(allowed)
  const page = await allowed.newPage()
  await page.goto('/?visning=liste')
  await page.getByLabel('Sorter etter').selectOption('avstand')
  await expect(rows(page).first()).toContainText('Oslo')
  await expect(rows(page).first()).toContainText('0 km unna')
  await expect(page.locator('a.liste-rad:has-text("km unna")')).toHaveCount(24)
  await allowed.close()

  // Refused: a status message, and the list is back on score.
  const refused = await browser.newContext({ permissions: [] })
  await isolate(refused)
  const denied = await refused.newPage()
  await denied.goto('/?visning=liste')
  await denied.getByLabel('Sorter etter').selectOption('avstand')
  await expect(denied.getByRole('status').filter({ hasText: 'posisjonen' })).toHaveText('Fikk ikke tilgang til posisjonen din. Listen er sortert etter score.')
  await expect(denied.getByLabel('Sorter etter')).toHaveValue('score')
  await expect(rows(denied).first()).toContainText('Gaustatoppen')
  await refused.close()
})

test('an unknown visning shows the map', async ({ page }) => {
  await page.goto('/?visning=noe')
  await expect(page.getByRole('link', { name: 'Kart', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(rows(page)).toHaveCount(0)
})

test('the list page has no serious or critical WCAG 2.1 AA violations', async ({ page }) => {
  await page.goto('/?visning=liste')
  await expect(rows(page)).toHaveCount(24)
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  // axe rates colour contrast as serious, so serious must fail too for the 4.5:1 floor to be checked.
  const blocking = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical')
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
})
