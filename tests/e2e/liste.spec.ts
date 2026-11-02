import AxeBuilder from '@axe-core/playwright'
import { expect, test, type BrowserContext, type Locator, type Page } from '@playwright/test'

// Story 1.8: the list view as the keyboard and screen-reader alternative to the map.

/** Same isolation as kart.spec.ts: nothing from the network. */
async function isolate(context: BrowserContext): Promise<void> {
  await context.route('**/*', (route) => {
    const { hostname } = new URL(route.request().url())
    return hostname === 'localhost' ? route.continue() : route.abort()
  })
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
  await expect(page).toHaveURL(/\/sted\/bergen\?visning=liste&sortering=navn$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bergen')

  // Story 3.2: the order is in the address, so Back keeps it.
  await page.goBack()
  await expect(page).toHaveURL(/\/\?visning=liste&sortering=navn$/)
  await expect(rows(page)).toHaveCount(24)
  await expect(rows(page).first()).toContainText('Bergen')
  await expect(sortering).toHaveValue('navn')
  await sortering.selectOption('score')
  await expect(page).toHaveURL(/\/\?visning=liste$/)

  // The place page's own «Tilbake» link also returns to the list, not the map.
  await tabTo(page, rows(page).first())
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/sted\/gaustatoppen\?visning=liste$/)
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

// Story 1.8b: destination cards. The same fields at the same place on every card, so values can be compared.
// CI runs on Linux, whose fonts are wider than Windows' (PR #33–#38), so the narrow checks use a wide font.
const BRED_FONT = `* { font-family: Verdana, 'DejaVu Sans', sans-serif !important; }`

/** A bounding box that must exist: a missing element fails here instead of passing as zeros. */
async function boks(locator: Locator) {
  const box = await locator.boundingBox()
  expect(box, locator.toString()).not.toBeNull()
  return box!
}

/** Every visible card's own box and its wind value's box, in page order. */
async function kortOgVind(page: Page) {
  const antall = await rows(page).count()
  const resultat = []
  for (let i = 0; i < antall; i++) {
    const kort = rows(page).nth(i)
    resultat.push({ kort: await boks(kort), vind: await boks(kort.locator('.liste-felt').nth(1).locator('.liste-felt-verdi')) })
  }
  return resultat
}

async function ingenSidevisRulling(page: Page): Promise<void> {
  const [scrollWidth, clientWidth] = await page.locator('html').evaluate((el) => [el.scrollWidth, el.clientWidth])
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
}

test('wide screens put cards side by side, with the values in line across each row of cards', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/?visning=liste')
  await expect(rows(page)).toHaveCount(24)
  const alle = await kortOgVind(page)
  expect(Math.abs(alle[0].kort.y - alle[1].kort.y)).toBeLessThan(1)
  expect(alle[1].kort.x).toBeGreaterThan(alle[0].kort.x + alle[0].kort.width - 1)

  // In every row of cards, wrapped names («Store Skagastølstind») and «Utdatert» included, the wind values
  // share one line and sit at the same place in each card.
  const rader = new Map<number, typeof alle>()
  for (const element of alle) rader.set(Math.round(element.kort.y), [...(rader.get(Math.round(element.kort.y)) ?? []), element])
  expect([...rader.values()].some((rad) => rad.length > 1)).toBe(true)
  for (const rad of rader.values()) {
    for (const { kort, vind } of rad) {
      expect(Math.abs(vind.y - rad[0].vind.y)).toBeLessThan(1)
      expect(Math.abs(vind.x - kort.x - (rad[0].vind.x - rad[0].kort.x))).toBeLessThan(1)
    }
  }

  // Chrome puts a space around grid items in the name, as it did when the row was already a grid before the
  // cards; the words and their order are the same.
  await expect(rows(page).first()).toHaveAccessibleName(/^Gaustatoppen ?, 58 · Godt ?, Nysnø 10 cm ?, Vind 12 m\/s ?, Temp −6,4 °C$/)
})

for (const width of [320, 375]) {
  test(`cards are one column and the list does not scroll sideways at ${width}px, even with a wide font and NVE`, async ({ page }) => {
    await page.setViewportSize({ width, height: 740 })
    // «Nysnø siste 24 t» is the longest label; its value must still line up with wind and temperature.
    await page.goto('/?visning=liste&nysnokilde=nve')
    await expect(rows(page).first()).toContainText('Nysnø siste 24 t')
    await page.addStyleTag({ content: BRED_FONT })
    const [forste, andre] = await kortOgVind(page).then((alle) => alle.slice(0, 2))
    expect(Math.abs(forste.kort.x - andre.kort.x)).toBeLessThan(1)
    expect(andre.kort.y).toBeGreaterThan(forste.kort.y)
    const verdier = rows(page).first().locator('.liste-felt-verdi')
    const [nysno, vind] = [await boks(verdier.nth(0)), await boks(verdier.nth(1))]
    expect(Math.abs(nysno.y - vind.y)).toBeLessThan(1)
    await ingenSidevisRulling(page)
  })
}

test('sorted by distance, a card shows «Avstand» over «0 km», and a screen reader still hears «0 km unna»', async ({ browser }) => {
  const context = await browser.newContext({
    geolocation: { latitude: 59.9139, longitude: 10.7522 },
    permissions: ['geolocation'],
    viewport: { width: 375, height: 740 },
  })
  await isolate(context)
  const page = await context.newPage()
  await page.goto('/?visning=liste')
  await page.getByLabel('Sorter etter').selectOption('avstand')
  const forste = rows(page).first()
  const avstand = forste.locator('.liste-felt').nth(3)
  await expect(avstand.locator('.liste-felt-etikett')).toHaveText('Avstand')
  await expect(avstand.locator('.liste-felt-etikett')).toHaveAttribute('aria-hidden', 'true')
  // «unna» is for the screen reader only, so the card shows «0 km».
  await expect(avstand.locator('.liste-felt-verdi')).toHaveText('0 km unna')
  await expect(avstand.locator('.liste-felt-verdi .visually-hidden')).toHaveText(' unna')
  await expect(forste).toHaveAccessibleName(/^Oslo ?,.* ?, 0 km unna$/)
  await page.addStyleTag({ content: BRED_FONT })
  await ingenSidevisRulling(page)
  await context.close()
})
