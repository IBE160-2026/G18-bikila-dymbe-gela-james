import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'
import { zoomStep } from './kartZoom'

// Story 3.1: filter on new snow, wind and temperature, on the committed demo data. A side panel from
// 768px and a bottom sheet below; map and list show the same places.

test.beforeEach(async ({ context }) => {
  // Same isolation as kart.spec.ts: nothing from the network, and no leftover latest.json.
  await context.route('**/*', (route) => {
    const { hostname } = new URL(route.request().url())
    return hostname === 'localhost' ? route.continue() : route.abort()
  })
  await context.route('**/data/latest.json', (route) => route.fulfill({ status: 404, body: '' }))
})

const DESKTOP = { width: 1280, height: 800 }
const MOBIL = { width: 375, height: 740 }

// Demo places with at least 2 cm new snow and at most 0 °C, as the app rounds them (Oppdal is −0,04 °C).
const SEKS = ['galdhopiggen', 'gaustatoppen', 'jiehkkevarri', 'oksskolten', 'oppdal-skisenter', 'rondeslottet']
const NAVN_SEKS = ['Galdhøpiggen', 'Gaustatoppen', 'Jiehkkevárri', 'Oksskolten', 'Oppdal Skisenter', 'Rondeslottet']

const markers = (page: Page) => page.locator('path.kart-markor')
const rows = (page: Page) => page.locator('a.liste-rad')
const panel = (page: Page) => page.getByRole('complementary', { name: 'Filter' })
const nysno = (page: Page) => page.getByRole('slider', { name: 'Nysnø' })
const vind = (page: Page) => page.getByRole('slider', { name: 'Vind' })
const temperatur = (page: Page) => page.getByRole('slider', { name: 'Temperatur' })
const filterKnapp = (page: Page) => page.getByRole('button', { name: 'Filter', exact: true })
// Story 3.3: the banner at zero hits, and the one live region for the count and the suggestion.
const banner = (page: Page) => page.locator('.ingen-treff')
const live = (page: Page) => page.getByRole('status').filter({ hasText: 'treff' })
const brukForslaget = (page: Page) => page.getByRole('button', { name: 'Bruk forslaget' })

const BRED_FONT = `* { font-family: Verdana, 'DejaVu Sans', sans-serif !important; }`

async function expectNoBlockingViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const blocking = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical')
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
}

async function box(locator: Locator) {
  const result = await locator.boundingBox()
  if (!result) throw new Error(`${locator.toString()} has no box`)
  return result
}

async function expectNoSidewaysScroll(page: Page): Promise<void> {
  const [scrollWidth, clientWidth] = await page.locator('html').evaluate((el) => [el.scrollWidth, el.clientWidth])
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
}

test.describe('at 1280px', () => {
  test.use({ viewport: DESKTOP })

  test('the panel is a fixed left side panel, and map and list show the same six places', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await expect(filterKnapp(page)).toBeHidden()
    await expect(page.getByRole('heading', { level: 2, name: 'Filter' })).toBeVisible()

    const panelBox = await box(panel(page))
    const kartBox = await box(page.locator('.kart'))
    expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(kartBox.x)
    expect(Math.abs(panelBox.y - kartBox.y)).toBeLessThan(2)

    // Every requirement starts at «Alle», and nothing is hidden.
    for (const slider of [nysno(page), vind(page), temperatur(page)]) {
      await expect(slider).toHaveAttribute('aria-valuetext', 'Alle')
    }
    await expect(page.getByRole('button', { name: 'Nullstill' })).toHaveCount(0)

    // The keyboard moves a slider one step at a time.
    await nysno(page).focus()
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await expect(nysno(page)).toHaveAttribute('aria-valuetext', 'minst 2 cm')
    await expect(markers(page)).toHaveCount(8)
    await temperatur(page).fill('0')
    await expect(temperatur(page)).toHaveAttribute('aria-valuetext', 'høyst 0 °C')
    await expect(markers(page)).toHaveCount(6)
    for (const id of SEKS) await expect(page.locator(`path[data-sted-id="${id}"]`)).toHaveCount(1)
    await expect(page.getByRole('button', { name: 'Nullstill' })).toBeVisible()

    // The filter survives the switch to the list, which shows the same six places.
    await page.getByRole('link', { name: 'Liste', exact: true }).click()
    await expect(page).toHaveURL(/\/\?visning=liste&nysno=2&temp=0$/)
    await expect(rows(page)).toHaveCount(6)
    const names = await page.locator('.liste-navn').allTextContents()
    expect([...names].sort(new Intl.Collator('nb').compare)).toEqual(NAVN_SEKS)
    await expect(nysno(page)).toHaveValue('2')
    await expect(temperatur(page)).toHaveValue('0')
  })

  test('changing a requirement keeps the zoom and position of the map', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    // Oksskolten lies near the middle of Norway, so it stays in view when zooming in on the centre.
    const oksskolten = page.locator('path[data-sted-id="oksskolten"]')
    const start = await box(oksskolten)
    await zoomStep(page, 'Zoom in')
    await zoomStep(page, 'Zoom in')
    const zoomed = await box(oksskolten)
    expect(zoomed.width).toBeGreaterThan(start.width + 2)

    await nysno(page).fill('2')
    await expect(markers(page)).toHaveCount(8)
    // A new fit to Norway would shrink the marker and move it back; it stays where the user left it.
    const after = await box(oksskolten)
    expect(after.x).toBeCloseTo(zoomed.x, 0)
    expect(after.y).toBeCloseTo(zoomed.y, 0)
    expect(after.width).toBeCloseTo(zoomed.width, 0)
  })

  test('zero hits say so, show no markers, and «Nullstill» brings every place back', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await nysno(page).fill('30')
    await expect(banner(page)).toContainText('Ingen treff. Prøv nysnø minst 12 cm.')
    await expect(markers(page)).toHaveCount(0)

    await banner(page).getByRole('button', { name: 'Nullstill' }).click()
    await expect(markers(page)).toHaveCount(24)
    await expect(banner(page)).toHaveCount(0)
    for (const slider of [nysno(page), vind(page), temperatur(page)]) {
      await expect(slider).toHaveAttribute('aria-valuetext', 'Alle')
    }
    await expect(page.getByRole('button', { name: 'Nullstill' })).toHaveCount(0)
    // Focus is not lost with the button: it moves to the first slider.
    await expect(nysno(page)).toBeFocused()
  })

  test('zero hits in the list say so too, and «Nullstill» brings every row back', async ({ page }) => {
    await page.goto('/?visning=liste')
    await expect(rows(page)).toHaveCount(24)
    await nysno(page).fill('30')
    await expect(banner(page)).toBeVisible()
    await expect(live(page)).toHaveText('Ingen treff. Prøv nysnø minst 12 cm.')
    await expect(rows(page)).toHaveCount(0)

    await banner(page).getByRole('button', { name: 'Nullstill' }).click()
    await expect(rows(page)).toHaveCount(24)
    await expect(banner(page)).toHaveCount(0)
    await expect(live(page)).toHaveText('24 treff')
  })

  test('the page with an active filter has no serious or critical WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/?visning=liste')
    await expect(rows(page)).toHaveCount(24)
    await vind(page).fill('10')
    await expect(page.getByRole('button', { name: 'Nullstill' })).toBeVisible()
    await expectNoBlockingViolations(page)
  })
})

test.describe('at 375px', () => {
  test.use({ viewport: MOBIL })

  test('the panel is a bottom sheet that opens with «Filter» and shows active requirements as chips', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)

    // Closed: the sheet sits at the bottom of the screen, full width, with only the button showing.
    const sheet = await box(panel(page))
    expect(Math.abs(sheet.y + sheet.height - MOBIL.height)).toBeLessThan(2)
    expect(sheet.x).toBeLessThanOrEqual(0)
    expect(sheet.width).toBeGreaterThanOrEqual(MOBIL.width - 1)
    const knapp = filterKnapp(page)
    const knappBox = await box(knapp)
    expect(knappBox.height).toBeGreaterThanOrEqual(44)
    await expect(knapp).toHaveAttribute('aria-expanded', 'false')
    await expect(knapp).toHaveAttribute('aria-controls', 'filter-innhold')
    await expect(nysno(page)).toBeHidden()

    await knapp.click()
    await expect(knapp).toHaveAttribute('aria-expanded', 'true')
    await expect(nysno(page)).toBeVisible()
    const sliderBox = await box(nysno(page))
    expect(sliderBox.height).toBeGreaterThanOrEqual(44)
    await nysno(page).fill('2')
    await temperatur(page).fill('0')
    await expect(markers(page)).toHaveCount(6)

    await knapp.click()
    await expect(knapp).toHaveAttribute('aria-expanded', 'false')
    await expect(nysno(page)).toBeHidden()
    const chips = page.getByRole('list', { name: 'Aktive krav' }).getByRole('listitem')
    await expect(chips).toHaveText(['Nysnø minst 2 cm', 'Temperatur høyst 0 °C'])

    // The list shows the same six, and the filter is still set.
    await page.getByRole('link', { name: 'Liste', exact: true }).click()
    await expect(rows(page)).toHaveCount(6)
    await expect(chips).toHaveCount(2)

    // «Nullstill» on the closed sheet clears everything and leaves focus on «Filter».
    await panel(page).getByRole('button', { name: 'Nullstill' }).click()
    await expect(rows(page)).toHaveCount(24)
    await expect(chips).toHaveCount(0)
    await expect(knapp).toBeFocused()
  })

  test('the sheet does not scroll the page sideways, even with a wide font', async ({ page }) => {
    for (const width of [320, 375]) {
      await page.setViewportSize({ width, height: MOBIL.height })
      await page.goto('/')
      await expect(markers(page)).toHaveCount(24)
      await page.addStyleTag({ content: BRED_FONT })
      await expectNoSidewaysScroll(page)

      await filterKnapp(page).click()
      await nysno(page).fill('10')
      await vind(page).fill('8')
      await temperatur(page).fill('-15')
      await expectNoSidewaysScroll(page)
      await filterKnapp(page).click()
      await expect(page.getByRole('list', { name: 'Aktive krav' }).getByRole('listitem')).toHaveCount(3)
      await expectNoSidewaysScroll(page)
    }
  })

  test('the open sheet has no serious or critical WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await filterKnapp(page).click()
    await temperatur(page).fill('-5')
    await expectNoBlockingViolations(page)
    await filterKnapp(page).click()
    await expectNoBlockingViolations(page)
  })
})

// Story 3.2 (FR-21): the filter, the view and the list order live in the address, so a link can be
// shared and Back from a place page shows the same search.
test.describe('the address at 1280px', () => {
  test.use({ viewport: DESKTOP })

  const navn = (page: Page) => page.locator('.liste-navn').allTextContents()
  // A string, since the E2E tsconfig has no DOM types.
  const historikk = (page: Page) => page.evaluate<number>('window.history.length')

  test('a shared list link opens the list with the same filter and the same six places', async ({ page }) => {
    await page.goto('/?visning=liste&nysno=2&temp=0')
    await expect(rows(page)).toHaveCount(6)
    await expect(page.getByRole('link', { name: 'Liste', exact: true })).toHaveAttribute('aria-current', 'page')
    await expect(nysno(page)).toHaveAttribute('aria-valuetext', 'minst 2 cm')
    await expect(vind(page)).toHaveAttribute('aria-valuetext', 'Alle')
    await expect(temperatur(page)).toHaveAttribute('aria-valuetext', 'høyst 0 °C')
    expect([...(await navn(page))].sort(new Intl.Collator('nb').compare)).toEqual(NAVN_SEKS)
  })

  test('a link without visning opens the map with the same filter', async ({ page }) => {
    await page.goto('/?nysno=2&temp=0')
    await expect(markers(page)).toHaveCount(6)
    for (const id of SEKS) await expect(page.locator(`path[data-sted-id="${id}"]`)).toHaveCount(1)
    await expect(page.getByRole('link', { name: 'Kart', exact: true })).toHaveAttribute('aria-current', 'page')
  })

  test('invalid values turn their requirement off and keep the valid ones', async ({ page }) => {
    await page.goto('/?nysno=abc&vind=99&temp=0')
    // The address is rewritten to the search it shows, so copying it does not share the junk again.
    await expect(page).toHaveURL(/\/\?temp=0$/)
    await expect(nysno(page)).toHaveAttribute('aria-valuetext', 'Alle')
    await expect(vind(page)).toHaveAttribute('aria-valuetext', 'Alle')
    await expect(temperatur(page)).toHaveAttribute('aria-valuetext', 'høyst 0 °C')
    await expect(page.getByRole('alert')).toHaveCount(0)
    expect(await markers(page).count()).toBeGreaterThan(0)
  })

  test('a slider change rewrites the address without a new history step, and the default leaves it', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    const steg = await historikk(page)

    await vind(page).fill('10')
    await expect(page).toHaveURL(/\/\?vind=10$/)
    await nysno(page).fill('2')
    await expect(page).toHaveURL(/\/\?nysno=2&vind=10$/)
    expect(await historikk(page)).toBe(steg)

    // Back to 0 cm is «Alle», which the address does not write.
    await nysno(page).fill('0')
    await expect(page).toHaveURL(/\/\?vind=10$/)
    await page.getByRole('button', { name: 'Nullstill' }).click()
    await expect(page).toHaveURL(/\/$/)
    expect(await historikk(page)).toBe(steg)
  })

  test('the switch keeps the filter, and «SnowFinder» opens the map without one', async ({ page }) => {
    await page.goto('/?nysno=2&temp=0')
    await expect(markers(page)).toHaveCount(6)
    await page.getByRole('link', { name: 'Liste', exact: true }).click()
    await expect(page).toHaveURL(/\/\?visning=liste&nysno=2&temp=0$/)
    await expect(rows(page)).toHaveCount(6)
    await page.getByRole('link', { name: 'Kart', exact: true }).click()
    await expect(page).toHaveURL(/\/\?nysno=2&temp=0$/)
    await expect(markers(page)).toHaveCount(6)

    await page.getByRole('link', { name: 'SnowFinder', exact: true }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(markers(page)).toHaveCount(24)
  })

  test('map → place → Back keeps the filter, by the browser button and by «Tilbake»', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await nysno(page).fill('2')
    await temperatur(page).fill('0')
    await expect(markers(page)).toHaveCount(6)

    const gaustatoppen = page.locator('path[data-sted-id="gaustatoppen"]')
    await gaustatoppen.click()
    // Story 3.2b: the place's address carries the search.
    await expect(page).toHaveURL(/\/sted\/gaustatoppen\?nysno=2&temp=0$/)
    await page.goBack()
    await expect(page).toHaveURL(/\/\?nysno=2&temp=0$/)
    await expect(markers(page)).toHaveCount(6)
    await expect(nysno(page)).toHaveAttribute('aria-valuetext', 'minst 2 cm')
    await expect(temperatur(page)).toHaveAttribute('aria-valuetext', 'høyst 0 °C')

    await gaustatoppen.click()
    await expect(page).toHaveURL(/\/sted\/gaustatoppen\?nysno=2&temp=0$/)
    await page.getByRole('link', { name: 'Tilbake', exact: true }).click()
    await expect(page).toHaveURL(/\/\?nysno=2&temp=0$/)
    await expect(markers(page)).toHaveCount(6)
  })

  test('list → place → Back keeps the filter, the view and the order', async ({ page }) => {
    await page.goto('/?visning=liste&nysno=2&temp=0&sortering=navn')
    await expect(rows(page)).toHaveCount(6)
    await expect(page.getByLabel('Sorter etter')).toHaveValue('navn')
    expect(await navn(page)).toEqual(NAVN_SEKS)

    await rows(page).first().click()
    await expect(page).toHaveURL(/\/sted\/galdhopiggen\?visning=liste&nysno=2&temp=0&sortering=navn$/)
    await page.goBack()
    await expect(page).toHaveURL(/\/\?visning=liste&nysno=2&temp=0&sortering=navn$/)
    expect(await navn(page)).toEqual(NAVN_SEKS)
    await expect(nysno(page)).toHaveAttribute('aria-valuetext', 'minst 2 cm')
  })

  test('sorting by name goes in the address, and the link opens the list sorted by name', async ({ page, context }) => {
    await page.goto('/?visning=liste&nysno=2&temp=0')
    await expect(rows(page)).toHaveCount(6)
    await page.getByLabel('Sorter etter').selectOption('navn')
    await expect(page).toHaveURL(/\/\?visning=liste&nysno=2&temp=0&sortering=navn$/)

    const delt = await context.newPage()
    await delt.goto(page.url())
    await expect(rows(delt)).toHaveCount(6)
    await expect(delt.getByLabel('Sorter etter')).toHaveValue('navn')
    expect(await navn(delt)).toEqual(NAVN_SEKS)
  })

  test('sorting by distance never goes in the address', async ({ page, context }) => {
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 59.9139, longitude: 10.7522 })
    await page.goto('/?visning=liste&sortering=navn')
    await expect(rows(page)).toHaveCount(24)
    await page.getByLabel('Sorter etter').selectOption('avstand')
    await expect(rows(page).first()).toContainText('km unna')
    await expect(page).toHaveURL(/\/\?visning=liste$/)

    await page.getByLabel('Sorter etter').selectOption('navn')
    await expect(page).toHaveURL(/\/\?visning=liste&sortering=navn$/)
  })

  test('a refused position leaves the order in the address unchanged', async ({ page }) => {
    await page.goto('/?visning=liste&sortering=navn')
    await expect(rows(page)).toHaveCount(24)
    await page.getByLabel('Sorter etter').selectOption('avstand')
    await expect(page.getByRole('status').filter({ hasText: 'posisjonen' })).toHaveText(
      'Fikk ikke tilgang til posisjonen din. Listen er sortert etter navn.',
    )
    await expect(page.getByLabel('Sorter etter')).toHaveValue('navn')
    await expect(page).toHaveURL(/\/\?visning=liste&sortering=navn$/)
    expect(await navn(page)).toEqual([...(await navn(page))].sort(new Intl.Collator('nb').compare))
  })
})

// Story 3.2b (UJ-1 step 6): a place's address carries the search it was opened from, so a shared place
// link and its «Tilbake» keep the filter, the view and the order.
test.describe('the place address at 1280px', () => {
  test.use({ viewport: DESKTOP })

  const tilbake = (page: Page) => page.getByRole('link', { name: 'Tilbake', exact: true })

  test('a place opened from the list carries the search in its address', async ({ page }) => {
    await page.goto('/?visning=liste&nysno=2&temp=0')
    await expect(rows(page)).toHaveCount(6)
    await rows(page).filter({ hasText: 'Gaustatoppen' }).click()
    await expect(page).toHaveURL(/\/sted\/gaustatoppen\?visning=liste&nysno=2&temp=0$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gaustatoppen')
  })

  test('a place opened from the map carries the search in its address', async ({ page }) => {
    await page.goto('/?nysno=2')
    await expect(markers(page)).toHaveCount(8)
    await page.locator('path[data-sted-id="gaustatoppen"]').click()
    await expect(page).toHaveURL(/\/sted\/gaustatoppen\?nysno=2$/)
  })

  test('«Tilbake» on a shared place link opens the list with the same filter and six places', async ({ page }) => {
    await page.goto('/sted/gaustatoppen?visning=liste&nysno=2&temp=0')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gaustatoppen')
    await expect(page.locator('.sted-score')).toHaveText('58 · Godt')
    await expect(tilbake(page)).toHaveAttribute('href', '/?visning=liste&nysno=2&temp=0')
    await tilbake(page).click()
    await expect(page).toHaveURL(/\/\?visning=liste&nysno=2&temp=0$/)
    await expect(rows(page)).toHaveCount(6)
    await expect(nysno(page)).toHaveAttribute('aria-valuetext', 'minst 2 cm')
    await expect(temperatur(page)).toHaveAttribute('aria-valuetext', 'høyst 0 °C')
    expect([...(await page.locator('.liste-navn').allTextContents())].sort(new Intl.Collator('nb').compare)).toEqual(NAVN_SEKS)
  })

  test('«Tilbake» on a place link without a search opens the map without a filter', async ({ page }) => {
    await page.goto('/sted/gaustatoppen')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gaustatoppen')
    await tilbake(page).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(markers(page)).toHaveCount(24)
  })

  test('an invalid value in a place link gives the default, and «Tilbake» keeps the valid ones', async ({ page }) => {
    await page.goto('/sted/gaustatoppen?nysno=abc&temp=0')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gaustatoppen')
    await expect(page.getByRole('alert')).toHaveCount(0)
    // The place address is rewritten to the clean form, as on Utforsk.
    await expect(page).toHaveURL(/\/sted\/gaustatoppen\?temp=0$/)
    await tilbake(page).click()
    await expect(page).toHaveURL(/\/\?temp=0$/)
    await expect(nysno(page)).toHaveAttribute('aria-valuetext', 'Alle')
    await expect(temperatur(page)).toHaveAttribute('aria-valuetext', 'høyst 0 °C')
  })

  test('an unknown place with a search still says so', async ({ page }) => {
    await page.goto('/sted/finnes-ikke?nysno=2')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fant ikke stedet')
    await expect(page.getByRole('link', { name: 'Gå til kartet' })).toHaveAttribute('href', '/?nysno=2')
  })

  test('a marker opens the place with the search set on the map', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await nysno(page).fill('2')
    await temperatur(page).fill('0')
    await expect(markers(page)).toHaveCount(6)
    await page.locator('path[data-sted-id="gaustatoppen"]').click()
    await expect(page).toHaveURL(/\/sted\/gaustatoppen\?nysno=2&temp=0$/)
  })
})

// Story 3.3 (FR-14, UX-DR4): the hit count is always shown and announced once, and zero hits
// suggest the single requirement to ease, with «Bruk forslaget».
test.describe('the hit count and the suggestion at 1280px', () => {
  test.use({ viewport: DESKTOP })

  const antall = (page: Page) => panel(page).locator('.filter-tittel-linje .filter-antall')
  const historikk = (page: Page) => page.evaluate<number>('window.history.length')

  test('the panel shows the count, and one live region says each new count', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await expect(antall(page)).toHaveText('24 treff')
    await expect(live(page)).toHaveText('24 treff')
    // Only one status region speaks the count; the panel shows it without being live.
    await expect(page.getByRole('status').filter({ hasText: 'treff' })).toHaveCount(1)
    await expect(panel(page).getByRole('status')).toHaveCount(0)

    await nysno(page).fill('12')
    await expect(markers(page)).toHaveCount(1)
    await expect(page.locator('path[data-sted-id="trysil"]')).toHaveCount(1)
    await expect(antall(page)).toHaveText('1 treff')
    await expect(live(page)).toHaveText('1 treff')
    await expect(banner(page)).toHaveCount(0)
  })

  test('at least 13 cm suggests 12 cm, and «Bruk forslaget» shows Trysil with focus on the slider', async ({ page }) => {
    await page.goto('/?visning=liste')
    await expect(rows(page)).toHaveCount(24)
    const steg = await historikk(page)
    await nysno(page).fill('13')
    await expect(rows(page)).toHaveCount(0)
    await expect(antall(page)).toHaveText('Ingen treff')
    await expect(banner(page).getByRole('paragraph')).toHaveText('Ingen treff. Prøv nysnø minst 12 cm.')
    // The suggestion is spoken by exactly one status region, never by the banner.
    await expect(live(page)).toHaveCount(1)
    await expect(live(page)).toHaveText('Ingen treff. Prøv nysnø minst 12 cm.')
    await expect(banner(page).getByRole('status')).toHaveCount(0)
    await expect(banner(page)).not.toHaveAttribute('role', 'status')
    for (const knapp of [brukForslaget(page), banner(page).getByRole('button', { name: 'Nullstill' })]) {
      expect((await box(knapp)).height).toBeGreaterThanOrEqual(44)
    }

    // With the keyboard: the suggestion goes the same way as a slider step and replaces the address.
    await brukForslaget(page).focus()
    await page.keyboard.press('Enter')
    await expect(rows(page)).toHaveCount(1)
    await expect(rows(page).first()).toContainText('Trysil')
    await expect(page).toHaveURL(/\/\?visning=liste&nysno=12$/)
    expect(await historikk(page)).toBe(steg)
    await expect(nysno(page)).toHaveAttribute('aria-valuetext', 'minst 12 cm')
    await expect(nysno(page)).toBeFocused()
    await expect(live(page)).toHaveText('1 treff')
    await expect(banner(page)).toHaveCount(0)
  })

  test('a suggestion for wind moves focus to the wind slider', async ({ page }) => {
    await page.goto('/?nysno=10&vind=9&temp=0')
    await expect(banner(page).getByRole('paragraph')).toHaveText('Ingen treff. Prøv vind høyst 12 m/s.')
    await brukForslaget(page).click()
    await expect(page).toHaveURL(/\/\?nysno=10&vind=12&temp=0$/)
    await expect(markers(page)).toHaveCount(1)
    await expect(page.locator('path[data-sted-id="gaustatoppen"]')).toHaveCount(1)
    await expect(vind(page)).toHaveAttribute('aria-valuetext', 'høyst 12 m/s')
    await expect(vind(page)).toBeFocused()
  })

  test('says «Prøv uten nysnøkravet» when only «Alle» gives a place', async ({ page }) => {
    await page.goto('/?nysno=1&vind=3')
    await expect(banner(page).getByRole('paragraph')).toHaveText('Ingen treff. Prøv uten nysnøkravet.')
    await brukForslaget(page).click()
    await expect(page).toHaveURL(/\/\?vind=3$/)
    await expect(markers(page)).toHaveCount(1)
    await expect(page.locator('path[data-sted-id="mo-i-rana"]')).toHaveCount(1)
    await expect(nysno(page)).toHaveAttribute('aria-valuetext', 'Alle')
    await expect(nysno(page)).toBeFocused()
  })

  test('offers only «Nullstill» when no single change gives a place', async ({ page }) => {
    await page.goto('/?nysno=13&temp=-11')
    await expect(banner(page).getByRole('paragraph')).toHaveText(
      'Ingen treff. Det hjelper ikke å endre bare ett krav. Prøv «Nullstill».',
    )
    await expect(brukForslaget(page)).toHaveCount(0)
    await banner(page).getByRole('button', { name: 'Nullstill' }).click()
    await expect(markers(page)).toHaveCount(24)
  })

  test('the zero-hit banner has no serious or critical WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/?visning=liste&nysno=13')
    await expect(brukForslaget(page)).toBeVisible()
    await expectNoBlockingViolations(page)
  })
})

test.describe('the hit count and the suggestion at 375px', () => {
  test.use({ viewport: MOBIL })

  const linjeAntall = (page: Page) => panel(page).locator('.filter-linje .filter-antall')

  test('the closed sheet shows the count, and «Bruk forslaget» leaves focus on «Filter»', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await expect(linjeAntall(page)).toHaveText('24 treff')
    await expect(linjeAntall(page)).toBeVisible()

    await filterKnapp(page).click()
    await nysno(page).fill('13')
    await expect(linjeAntall(page)).toHaveText('Ingen treff')
    await filterKnapp(page).click()
    await expect(nysno(page)).toBeHidden()
    await expect(banner(page).getByRole('paragraph')).toHaveText('Ingen treff. Prøv nysnø minst 12 cm.')
    for (const knapp of [brukForslaget(page), banner(page).getByRole('button', { name: 'Nullstill' })]) {
      expect((await box(knapp)).height).toBeGreaterThanOrEqual(44)
    }

    await brukForslaget(page).click()
    await expect(markers(page)).toHaveCount(1)
    await expect(linjeAntall(page)).toHaveText('1 treff')
    await expect(live(page)).toHaveText('1 treff')
    await expect(page.getByRole('list', { name: 'Aktive krav' }).getByRole('listitem')).toHaveText(['Nysnø minst 12 cm'])
    // The slider is hidden in the closed sheet, so focus goes to «Filter».
    await expect(filterKnapp(page)).toBeFocused()
  })

  test('the banner does not scroll the page sideways, even with a wide font', async ({ page }) => {
    for (const width of [320, 375]) {
      await page.setViewportSize({ width, height: MOBIL.height })
      // Three chips and the longest banner text.
      await page.goto('/?nysno=13&vind=8&temp=-11')
      await expect(banner(page)).toBeVisible()
      await page.addStyleTag({ content: BRED_FONT })
      await expectNoSidewaysScroll(page)
      await page.goto('/?nysno=13&vind=8')
      await expect(brukForslaget(page)).toBeVisible()
      await page.addStyleTag({ content: BRED_FONT })
      await expectNoSidewaysScroll(page)
    }
  })

  test('the zero-hit banner has no serious or critical WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/?nysno=13')
    await expect(brukForslaget(page)).toBeVisible()
    await expectNoBlockingViolations(page)
  })
})
