import { readFileSync } from 'node:fs'
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
  // Axe must measure the settled page: mid-animation it sees colours at partial opacity and reports false
  // contrast failures. The app's CSS turns its animations off under reduced motion, which also stops a
  // running one at once.
  await page.emulateMedia({ reducedMotion: 'reduce' })
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
    // Only one status region speaks the count; the panel shows it without being live. (Story 3.8 gives the
    // panel its own, empty NVE status, which never speaks the count.)
    await expect(page.getByRole('status').filter({ hasText: 'treff' })).toHaveCount(1)
    await expect(panel(page).getByRole('status').filter({ hasText: 'treff' })).toHaveCount(0)
    await expect(panel(page).getByRole('status')).toHaveText([''])

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

// Story 3.5 (FR-22): cloud cover in daylight at most X %, combined with AND, in the address as `sky`.
// Demo places at most 60 % (as the app rounds them): Bergen 11,2, Stavanger 25,5, Sirdal 31,5, Voss 37,2
// and Kjerag 46,2. Kirkenes (62,6) is just above.
const SOL_FEM = ['bergen', 'kjerag', 'sirdal-skisenter', 'stavanger', 'voss-resort-fjellheisar']
const skydekke = (page: Page) => page.getByRole('slider', { name: 'Skydekke i dagslys' })

// Story 3.6 (FR-23, NFR-Privacy): distance from the user's own position, 0–200 km in steps of 10, in the
// address as `avstand`. The position itself is asked for only on the user's own move of this slider, and
// is never sent or stored. A position near Oslo (59.9139° N 10.7522° E), as in the distance-sort test
// above: within 150 km lie Oslo, Gaustatoppen (117,5 km), Lillehammer (134,5 km) and Hafjell (147,8 km).
const AVSTAND_FIRE = ['gaustatoppen', 'hafjell', 'lillehammer', 'oslo']
const avstand = (page: Page) => page.getByRole('slider', { name: 'Avstand' })
const avstandHint = (page: Page) => page.locator('#filter-maksAvstandKm-hint')
const heleNorge = (page: Page) => page.getByRole('button', { name: 'Hele Norge' })
const OSLO = { latitude: 59.9139, longitude: 10.7522 }
// Far out in the Norwegian Sea: no demo place is within even the widest active span (190 km, since 200 is «Alle»).
const HAVET = { latitude: 62, longitude: 0 }

test.describe('the sun filter at 1280px', () => {
  test.use({ viewport: DESKTOP })

  test('at most 60 % keeps the five sunniest places, on the map, in the list and in the address', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await expect(skydekke(page)).toHaveAttribute('aria-valuetext', 'Alle')
    await expect(skydekke(page)).toHaveAttribute('step', '10')

    await skydekke(page).fill('60')
    await expect(skydekke(page)).toHaveAttribute('aria-valuetext', 'høyst 60 %')
    await expect(page).toHaveURL(/\/\?sky=60$/)
    await expect(markers(page)).toHaveCount(5)
    for (const id of SOL_FEM) await expect(page.locator(`path[data-sted-id="${id}"]`)).toHaveCount(1)
    await expect(live(page)).toHaveText('5 treff')

    await page.getByRole('link', { name: 'Liste', exact: true }).click()
    await expect(page).toHaveURL(/\/\?visning=liste&sky=60$/)
    await expect(rows(page)).toHaveCount(5)
  })

  test('the address writes `sky` after `temp`, and a shared link restores it', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await skydekke(page).fill('80')
    await nysno(page).fill('2')
    await temperatur(page).fill('0')
    await expect(page).toHaveURL(/\/\?nysno=2&temp=0&sky=80$/)
    // Of the six with at least 2 cm and at most 0 °C, only Jiehkkevárri (75,9 %) is at most 80 %.
    await expect(markers(page)).toHaveCount(1)
    await expect(page.locator('path[data-sted-id="jiehkkevarri"]')).toHaveCount(1)

    await page.goto('/?visning=liste&sky=60')
    await expect(rows(page)).toHaveCount(5)
    await expect(skydekke(page)).toHaveAttribute('aria-valuetext', 'høyst 60 %')
    await expect(skydekke(page)).toHaveValue('60')
  })

  test('a value off the steps of 10 turns the requirement off', async ({ page }) => {
    for (const ugyldig of ['sky=65', 'sky=abc']) {
      await page.goto(`/?${ugyldig}&temp=0`)
      await expect(page).toHaveURL(/\/\?temp=0$/)
      await expect(skydekke(page)).toHaveAttribute('aria-valuetext', 'Alle')
      await expect(page.getByRole('alert')).toHaveCount(0)
    }
  })

  test('at most 0 % suggests 20 %, and «Bruk forslaget» shows Bergen with focus on the slider', async ({ page }) => {
    await page.goto('/?sky=0')
    await expect(markers(page)).toHaveCount(0)
    await expect(banner(page).getByRole('paragraph')).toHaveText('Ingen treff. Prøv skydekke i dagslys høyst 20 %.')
    await brukForslaget(page).click()
    await expect(page).toHaveURL(/\/\?sky=20$/)
    await expect(markers(page)).toHaveCount(1)
    await expect(page.locator('path[data-sted-id="bergen"]')).toHaveCount(1)
    await expect(skydekke(page)).toHaveAttribute('aria-valuetext', 'høyst 20 %')
    await expect(skydekke(page)).toBeFocused()
  })

  test('the place page shows the cloud cover in daylight', async ({ page }) => {
    await page.goto('/sted/bergen?sky=60')
    const rad = page.locator('.tall-liste div').filter({ has: page.getByText('Skydekke i dagslys', { exact: true }) })
    await expect(rad.locator('dd')).toHaveText('11,2 %')
  })
})

test.describe('the sun filter at 375px', () => {
  test.use({ viewport: MOBIL })

  test('the sheet with four sliders does not scroll sideways, even with a wide font', async ({ page }) => {
    for (const width of [320, 375]) {
      await page.setViewportSize({ width, height: MOBIL.height })
      await page.goto('/')
      await expect(markers(page)).toHaveCount(24)
      await page.addStyleTag({ content: BRED_FONT })

      await filterKnapp(page).click()
      await expect(skydekke(page)).toBeAttached()
      await skydekke(page).scrollIntoViewIfNeeded()
      expect((await box(skydekke(page))).height).toBeGreaterThanOrEqual(44)
      await nysno(page).fill('2')
      await vind(page).fill('8')
      await temperatur(page).fill('-15')
      await skydekke(page).fill('60')
      await expectNoSidewaysScroll(page)
      await filterKnapp(page).click()
      const chips = page.getByRole('list', { name: 'Aktive krav' }).getByRole('listitem')
      await expect(chips).toHaveText(['Nysnø minst 2 cm', 'Vind høyst 8 m/s', 'Temperatur høyst −15 °C', 'Skydekke i dagslys høyst 60 %'])
      await expectNoSidewaysScroll(page)
    }
  })

  test('the open sheet with the sun filter has no serious or critical WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/?sky=60')
    await expect(markers(page)).toHaveCount(5)
    await filterKnapp(page).click()
    await expect(skydekke(page)).toHaveAttribute('aria-valuetext', 'høyst 60 %')
    await expectNoBlockingViolations(page)
  })
})

// Story 3.4 (FR-15): «Pudderdag» and «Sol etter snøfall» fill the whole filter in one action (shared/filter.ts
// HURTIGVALG). Both give zero hits on the demo data, so pressing one shows the Story 3.3 suggestion banner.
const pudderdag = (page: Page) => page.getByRole('button', { name: 'Pudderdag' })
const solEtterSnofall = (page: Page) => page.getByRole('button', { name: 'Sol etter snøfall' })

test.describe('the quick picks at 1280px', () => {
  test.use({ viewport: DESKTOP })

  test('«Pudderdag» fills the filter in one action, updates the address and shows as pressed', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await expect(pudderdag(page)).toHaveAttribute('aria-pressed', 'false')

    await pudderdag(page).click()
    await expect(page).toHaveURL(/\/\?nysno=10&vind=8&temp=-2$/)
    await expect(pudderdag(page)).toHaveAttribute('aria-pressed', 'true')
    await expect(nysno(page)).toHaveAttribute('aria-valuetext', 'minst 10 cm')
    await expect(vind(page)).toHaveAttribute('aria-valuetext', 'høyst 8 m/s')
    await expect(temperatur(page)).toHaveAttribute('aria-valuetext', 'høyst −2 °C')
    await expect(skydekke(page)).toHaveAttribute('aria-valuetext', 'Alle')
    // Zero hits on the demo data: the Story 3.3 banner, never an empty surface, and focus stays on the chip.
    await expect(markers(page)).toHaveCount(0)
    await expect(banner(page)).toBeVisible()
    await expect(pudderdag(page)).toBeFocused()
  })

  test('«Sol etter snøfall» replaces the whole filter, so a requirement it does not mention goes to «Alle»', async ({ page }) => {
    await page.goto('/?temp=0')
    await expect(temperatur(page)).toHaveAttribute('aria-valuetext', 'høyst 0 °C')

    await solEtterSnofall(page).click()
    await expect(page).toHaveURL(/\/\?nysno=5&sky=30$/)
    await expect(temperatur(page)).toHaveAttribute('aria-valuetext', 'Alle')
    await expect(nysno(page)).toHaveAttribute('aria-valuetext', 'minst 5 cm')
    await expect(skydekke(page)).toHaveAttribute('aria-valuetext', 'høyst 30 %')
    await expect(solEtterSnofall(page)).toHaveAttribute('aria-pressed', 'true')
    await expect(markers(page)).toHaveCount(0)
    await expect(banner(page)).toBeVisible()
  })

  test('moving a slider afterwards un-presses the chip but keeps the rest of the filter', async ({ page }) => {
    await page.goto('/')
    await pudderdag(page).click()
    await expect(pudderdag(page)).toHaveAttribute('aria-pressed', 'true')

    await vind(page).fill('10')
    await expect(pudderdag(page)).toHaveAttribute('aria-pressed', 'false')
    await expect(nysno(page)).toHaveAttribute('aria-valuetext', 'minst 10 cm')
    await expect(temperatur(page)).toHaveAttribute('aria-valuetext', 'høyst −2 °C')
    await expect(page).toHaveURL(/\/\?nysno=10&vind=10&temp=-2$/)
  })

  test('a link with exactly a quick pick’s values shows its chip as pressed', async ({ page }) => {
    await page.goto('/?nysno=5&sky=30')
    await expect(solEtterSnofall(page)).toHaveAttribute('aria-pressed', 'true')
    await expect(pudderdag(page)).toHaveAttribute('aria-pressed', 'false')
  })

  test('the quick picks have no serious or critical WCAG 2.1 AA violations, closed or active', async ({ page }) => {
    await page.goto('/')
    await expectNoBlockingViolations(page)
    await pudderdag(page).click()
    await expectNoBlockingViolations(page)
  })
})

test.describe('the quick picks at 375px', () => {
  test.use({ viewport: MOBIL })

  test('each chip is at least 44px tall, and pressing one does not scroll the sheet sideways, even with a wide font', async ({ page }) => {
    for (const width of [320, 375]) {
      await page.setViewportSize({ width, height: MOBIL.height })
      await page.goto('/')
      await expect(markers(page)).toHaveCount(24)
      await page.addStyleTag({ content: BRED_FONT })

      await filterKnapp(page).click()
      await expect(pudderdag(page)).toBeVisible()
      expect((await box(pudderdag(page))).height).toBeGreaterThanOrEqual(44)
      expect((await box(solEtterSnofall(page))).height).toBeGreaterThanOrEqual(44)
      await expectNoSidewaysScroll(page)

      await pudderdag(page).click()
      await expect(page).toHaveURL(/\/\?nysno=10&vind=8&temp=-2$/)
      await expect(pudderdag(page)).toHaveAttribute('aria-pressed', 'true')
      await expect(pudderdag(page)).toBeFocused()
      await expectNoSidewaysScroll(page)
    }
  })

  test('the open sheet with the quick picks has no serious or critical WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/')
    await filterKnapp(page).click()
    await expect(pudderdag(page)).toBeVisible()
    await expectNoBlockingViolations(page)
    await pudderdag(page).click()
    await expectNoBlockingViolations(page)
  })
})

// Story 3.6 (FR-23, NFR-Privacy): the fifth requirement, distance from the user's own position. The I/O
// & Edge-Case Matrix in project-workspace/implementation-artifacts/spec-3-6-filtrer-pa-avstand.md: a move
// away from «Alle» asks for the position; a refusal has no effect and says so; a link with `avstand` set
// never asks on its own; zero hits can suggest easing the distance like any other requirement; and no
// outgoing request ever carries the position's lat/lon.
test.describe('the distance filter at 1280px', () => {
  test.use({ viewport: DESKTOP })

  test('moving the slider away from «Alle» asks for the position, and a grant narrows kart and liste', async ({ page, context }) => {
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation(OSLO)
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await expect(avstand(page)).toHaveAttribute('aria-valuetext', 'Alle')

    await avstand(page).fill('150')
    await expect(avstand(page)).toHaveAttribute('aria-valuetext', 'høyst 150 km')
    await expect(page).toHaveURL(/\/\?avstand=150$/)
    await expect(markers(page)).toHaveCount(4)
    for (const id of AVSTAND_FIRE) await expect(page.locator(`path[data-sted-id="${id}"]`)).toHaveCount(1)
    await expect(live(page)).toHaveText('4 treff')

    // The same four places on the list, and the map/list switch keeps the limit in the address.
    await page.getByRole('link', { name: 'Liste', exact: true }).click()
    await expect(page).toHaveURL(/\/\?visning=liste&avstand=150$/)
    await expect(rows(page)).toHaveCount(4)
  })

  // «Hele Norge» (Kelly, 2026-10-25): lets the user drop just the distance requirement, to discover the
  // best snow conditions nationally again, without «Nullstill» also clearing the other four requirements.
  test('«Hele Norge» resets only the distance requirement, leaving another active requirement untouched', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation(OSLO)
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await expect(heleNorge(page)).toHaveCount(0)

    await vind(page).fill('10')
    await avstand(page).fill('150')
    await expect(page).toHaveURL(/\/\?vind=10&avstand=150$/)
    await expect(heleNorge(page)).toBeVisible()
    expect((await box(heleNorge(page))).height).toBeGreaterThanOrEqual(44)

    await heleNorge(page).click()
    await expect(page).toHaveURL(/\/\?vind=10$/)
    await expect(avstand(page)).toHaveAttribute('aria-valuetext', 'Alle')
    await expect(vind(page)).toHaveAttribute('aria-valuetext', 'høyst 10 m/s')
    await expect(heleNorge(page)).toHaveCount(0)
    await expect(avstand(page)).toBeFocused()
  })

  test('a refused position leaves every place shown, and explains why under the slider', async ({ page }) => {
    // No grantPermissions: the browser denies the request, as a real refusal would.
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await expect(avstandHint(page)).toHaveCount(0)

    await avstand(page).fill('100')
    await expect(avstandHint(page)).toHaveText('Fikk ikke tilgang til posisjonen din. Avstandskravet har ingen effekt.')
    await expect(avstandHint(page)).toHaveAttribute('role', 'status')
    await expect(avstand(page)).toHaveAttribute('aria-describedby', 'filter-maksAvstandKm-hint')
    // The requirement has no effect: still every place, not an empty result.
    await expect(markers(page)).toHaveCount(24)
    await expect(banner(page)).toHaveCount(0)

    // Moving the slider back to «Alle» clears the stale refusal text, instead of leaving it under an
    // inactive slider.
    await avstand(page).fill('200')
    await expect(avstand(page)).toHaveAttribute('aria-valuetext', 'Alle')
    await expect(avstandHint(page)).toHaveCount(0)
  })

  test('a link with `avstand` set shows the slider there without asking for the position on its own', async ({ page }) => {
    await page.goto('/?avstand=100')
    await expect(avstand(page)).toHaveAttribute('aria-valuetext', 'høyst 100 km')
    await expect(avstand(page)).toHaveValue('100')
    // No automatic request: nothing to say yet, and the requirement has no effect without a position.
    await expect(avstandHint(page)).toHaveCount(0)
    await expect(markers(page)).toHaveCount(24)
  })

  test('zero hits with a known position can suggest easing distance, same as any other requirement', async ({ page, context }) => {
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation(HAVET)
    await page.goto('/?visning=liste')
    await expect(rows(page)).toHaveCount(24)

    await avstand(page).fill('10')
    await expect(rows(page)).toHaveCount(0)
    await expect(banner(page).getByRole('paragraph')).toHaveText('Ingen treff. Prøv uten avstandskravet.')
    await expect(live(page)).toHaveText('Ingen treff. Prøv uten avstandskravet.')

    await brukForslaget(page).click()
    await expect(rows(page)).toHaveCount(24)
    await expect(page).toHaveURL(/\/\?visning=liste$/)
    await expect(avstand(page)).toHaveAttribute('aria-valuetext', 'Alle')
    await expect(avstand(page)).toBeFocused()
  })

  test('no outgoing request carries the position, granted or refused', async ({ page, context }) => {
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation(OSLO)
    const forespørsler: { url: string; postData: string | null }[] = []
    page.on('request', (request) => forespørsler.push({ url: request.url(), postData: request.postData() }))

    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await avstand(page).fill('150')
    await expect(markers(page)).toHaveCount(4)
    await page.getByRole('link', { name: 'Liste', exact: true }).click()
    await expect(rows(page)).toHaveCount(4)

    expect(forespørsler.length).toBeGreaterThan(0)
    for (const { url, postData } of forespørsler) {
      expect(url, url).not.toMatch(/59[.,]9139|10[.,]7522/)
      if (postData) expect(postData, postData).not.toMatch(/59[.,]9139|10[.,]7522/)
    }
  })

  test('the distance filter has no serious or critical WCAG 2.1 AA violations, idle or with its status text', async ({ page }) => {
    await page.goto('/')
    await expectNoBlockingViolations(page)
    await avstand(page).fill('100')
    await expect(avstandHint(page)).toBeVisible()
    await expectNoBlockingViolations(page)
  })
})

test.describe('the distance filter at 375px', () => {
  test.use({ viewport: MOBIL })

  test('the sheet with five sliders does not scroll sideways, even with a wide font', async ({ page }) => {
    for (const width of [320, 375]) {
      await page.setViewportSize({ width, height: MOBIL.height })
      await page.goto('/')
      await expect(markers(page)).toHaveCount(24)
      await page.addStyleTag({ content: BRED_FONT })

      await filterKnapp(page).click()
      await expect(avstand(page)).toBeAttached()
      await avstand(page).scrollIntoViewIfNeeded()
      expect((await box(avstand(page))).height).toBeGreaterThanOrEqual(44)
      await avstand(page).fill('100')
      await expect(avstandHint(page)).toBeVisible()
      await expectNoSidewaysScroll(page)
      await filterKnapp(page).click()
      const chips = page.getByRole('list', { name: 'Aktive krav' }).getByRole('listitem')
      await expect(chips).toHaveText(['Avstand høyst 100 km'])
      await expectNoSidewaysScroll(page)
    }
  })

  test('the open sheet with the distance filter has no serious or critical WCAG 2.1 AA violations', async ({ page, context }) => {
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation(OSLO)
    await page.goto('/')
    await filterKnapp(page).click()
    await avstand(page).fill('150')
    await expect(avstand(page)).toHaveAttribute('aria-valuetext', 'høyst 150 km')
    await expectNoBlockingViolations(page)
  })

  // «Hele Norge» (Kelly, 2026-10-25): the same click-through as at 1280px, through the open sheet.
  test('«Hele Norge» resets only the distance requirement, leaving another active requirement untouched', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation(OSLO)
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)

    await filterKnapp(page).click()
    await vind(page).fill('10')
    await avstand(page).fill('150')
    await expect(page).toHaveURL(/\/\?vind=10&avstand=150$/)
    await expect(heleNorge(page)).toBeVisible()
    expect((await box(heleNorge(page))).height).toBeGreaterThanOrEqual(44)

    await heleNorge(page).click()
    await expect(page).toHaveURL(/\/\?vind=10$/)
    await expect(avstand(page)).toHaveAttribute('aria-valuetext', 'Alle')
    await expect(vind(page)).toHaveAttribute('aria-valuetext', 'høyst 10 m/s')
    await expect(heleNorge(page)).toHaveCount(0)
    await expect(avstand(page)).toBeFocused()
  })
})

// Story 3.7 (FR-24, decided 2026-10-27, Sena): three checkboxes, none ticked is «Alle», combined with AND,
// in the address as `type` after `avstand`. The demo data has eight of each type. Of the eight cities none
// has new snow, so «by» and at least 1 cm gives zero hits; without the place type it gives 11 (all eight
// summits, and Hemsedal 1,0, Oppdal 2,8 and Trysil 12,6), without new snow only the eight cities.
const skisted = (page: Page) => page.getByRole('checkbox', { name: 'Skisted' })
const fjelltopp = (page: Page) => page.getByRole('checkbox', { name: 'Fjelltopp' })
const by = (page: Page) => page.getByRole('checkbox', { name: 'By' })
const stedstypeGruppe = (page: Page) => page.getByRole('group', { name: 'Stedstype' })

test.describe('the place type filter at 1280px', () => {
  test.use({ viewport: DESKTOP })

  test('one type keeps its eight places, two keep sixteen, on the map, in the list and in the address', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await expect(stedstypeGruppe(page)).toBeVisible()
    for (const boks of [skisted(page), fjelltopp(page), by(page)]) await expect(boks).not.toBeChecked()

    await skisted(page).check()
    await expect(page).toHaveURL(/\/\?type=skisted$/)
    await expect(markers(page)).toHaveCount(8)
    await expect(page.locator('path[data-sted-id="trysil"]')).toHaveCount(1)
    await expect(page.locator('path[data-sted-id="oslo"]')).toHaveCount(0)
    await expect(live(page)).toHaveText('8 treff')

    await by(page).check()
    await expect(page).toHaveURL(/\/\?type=skisted,by$/)
    await expect(markers(page)).toHaveCount(16)

    await page.getByRole('link', { name: 'Liste', exact: true }).click()
    await expect(page).toHaveURL(/\/\?visning=liste&type=skisted,by$/)
    await expect(rows(page)).toHaveCount(16)
  })

  test('the address is the same whatever order the types are ticked in', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await by(page).check()
    await skisted(page).check()
    await expect(page).toHaveURL(/\/\?type=skisted,by$/)
  })

  test('unticking the last type gives «Alle» again, never zero hits', async ({ page }) => {
    await page.goto('/?type=by')
    await expect(markers(page)).toHaveCount(8)
    await by(page).uncheck()
    await expect(page).toHaveURL(/\/$/)
    await expect(markers(page)).toHaveCount(24)
    await expect(banner(page)).toHaveCount(0)
  })

  test('combined with new snow (AND), only the ski resorts with at least 2 cm are left', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await nysno(page).fill('2')
    await skisted(page).check()
    await expect(page).toHaveURL(/\/\?nysno=2&type=skisted$/)
    await expect(markers(page)).toHaveCount(2)
    await expect(page.locator('path[data-sted-id="oppdal-skisenter"]')).toHaveCount(1)
    await expect(page.locator('path[data-sted-id="trysil"]')).toHaveCount(1)
  })

  test('a shared link restores the types and is rewritten to STED_TYPES order', async ({ page }) => {
    await page.goto('/?type=by,fjelltopp')
    await expect(page).toHaveURL(/\/\?type=fjelltopp,by$/)
    await expect(markers(page)).toHaveCount(16)
    await expect(skisted(page)).not.toBeChecked()
    await expect(fjelltopp(page)).toBeChecked()
    await expect(by(page)).toBeChecked()
  })

  test('an invalid or empty type turns the requirement off and keeps the others', async ({ page }) => {
    for (const ugyldig of ['type=innsjo', 'type=']) {
      await page.goto(`/?${ugyldig}&temp=0`)
      await expect(page).toHaveURL(/\/\?temp=0$/)
      for (const boks of [skisted(page), fjelltopp(page), by(page)]) await expect(boks).not.toBeChecked()
      await expect(page.getByRole('alert')).toHaveCount(0)
    }
  })

  test('zero hits suggest dropping the place type, and «Bruk forslaget» moves focus to the first checkbox', async ({ page }) => {
    await page.goto('/?nysno=1&type=by')
    await expect(markers(page)).toHaveCount(0)
    await expect(banner(page).getByRole('paragraph')).toHaveText('Ingen treff. Prøv uten stedstypekravet.')
    await brukForslaget(page).click()
    await expect(page).toHaveURL(/\/\?nysno=1$/)
    await expect(markers(page)).toHaveCount(11)
    await expect(by(page)).not.toBeChecked()
    await expect(skisted(page)).toBeFocused()
  })

  test('«Nullstill» and a quick pick both set the place type back to «Alle»', async ({ page }) => {
    await page.goto('/?type=by')
    await expect(markers(page)).toHaveCount(8)
    await panel(page).getByRole('button', { name: 'Nullstill' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(by(page)).not.toBeChecked()

    await page.goto('/?type=by')
    await expect(markers(page)).toHaveCount(8)
    await page.getByRole('button', { name: 'Pudderdag' }).click()
    await expect(page).toHaveURL(/\/\?nysno=10&vind=8&temp=-2$/)
    await expect(by(page)).not.toBeChecked()
  })

  test('the place type filter has no serious or critical WCAG 2.1 AA violations, idle or active', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await expectNoBlockingViolations(page)
    await page.goto('/?type=skisted,by')
    await expect(markers(page)).toHaveCount(16)
    await expectNoBlockingViolations(page)
  })
})

test.describe('the place type filter at 375px', () => {
  test.use({ viewport: MOBIL })

  test('each checkbox is at least 44px tall, the chip shows on the closed sheet, and nothing scrolls sideways', async ({ page }) => {
    for (const width of [320, 375]) {
      await page.setViewportSize({ width, height: MOBIL.height })
      await page.goto('/')
      await expect(markers(page)).toHaveCount(24)
      await page.addStyleTag({ content: BRED_FONT })

      await filterKnapp(page).click()
      for (const boks of [skisted(page), fjelltopp(page), by(page)]) {
        const etikett = page.locator('label.filter-stedstype').filter({ has: boks })
        await etikett.scrollIntoViewIfNeeded()
        expect((await box(etikett)).height).toBeGreaterThanOrEqual(44)
      }
      await nysno(page).fill('2')
      await skisted(page).check()
      await fjelltopp(page).check()
      await expectNoSidewaysScroll(page)
      await filterKnapp(page).click()
      const chips = page.getByRole('list', { name: 'Aktive krav' }).getByRole('listitem')
      await expect(chips).toHaveText(['Nysnø minst 2 cm', 'Stedstype skisted, fjelltopp'])
      await expectNoSidewaysScroll(page)
    }
  })

  test('«Bruk forslaget» on the closed sheet drops the place type and leaves focus on «Filter»', async ({ page }) => {
    await page.goto('/?nysno=1&type=by')
    await expect(markers(page)).toHaveCount(0)
    await expect(skisted(page)).toBeHidden()
    await expect(banner(page).getByRole('paragraph')).toHaveText('Ingen treff. Prøv uten stedstypekravet.')
    await brukForslaget(page).click()
    await expect(page).toHaveURL(/\/\?nysno=1$/)
    await expect(markers(page)).toHaveCount(11)
    await expect(page.getByRole('list', { name: 'Aktive krav' }).getByRole('listitem')).toHaveText(['Nysnø minst 1 cm'])
    // The checkboxes are hidden in the closed sheet, so focus goes to «Filter».
    await expect(filterKnapp(page)).toBeFocused()
  })

  test('the open sheet with the place type filter has no serious or critical WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/?type=fjelltopp')
    await expect(markers(page)).toHaveCount(8)
    await filterKnapp(page).click()
    await expect(fjelltopp(page)).toBeChecked()
    await expectNoBlockingViolations(page)
  })
})

// Story 3.8 (FR-25, decided 2026-10-27, Sena): the new snow source, two radio buttons right under the new
// snow slider, in the address as `nysnokilde=nve` right after `nysno`. On the demo data at least 5 cm gives
// three places from the forecast (Gaustatoppen 10, Jiehkkevárri 6,4 and Trysil 12,6 cm) and two from NVE's
// last day (Jiehkkevárri 53 and Oksskolten 15 mm). No demo place lacks an NVE value, so the test that needs
// one serves a copy of the demo file with Jiehkkevárri's value removed.
const prognose = (page: Page) => page.getByRole('radio', { name: 'Prognose (MET, neste 24 t)' })
const siste24 = (page: Page) => page.getByRole('radio', { name: 'Siste 24 t (NVE, modellert)' })
const kildeGruppe = (page: Page) => page.getByRole('group', { name: 'Datagrunnlag for nysnø' })
const PROGNOSE_TRE = ['gaustatoppen', 'jiehkkevarri', 'trysil']
const NVE_TO = ['jiehkkevarri', 'oksskolten']

async function expectMarkers(page: Page, ids: string[]): Promise<void> {
  await expect(markers(page)).toHaveCount(ids.length)
  for (const id of ids) await expect(page.locator(`path[data-sted-id="${id}"]`)).toHaveCount(1)
}

type DemoSted = { id: string; nveNysnoSisteDognMm: number | null }

/** Serves the demo file with `utenNve(sted)` places' NVE values removed, so a test can show what null does. */
async function serveDemoUtenNve(page: Page, utenNve: (sted: DemoSted) => boolean): Promise<void> {
  const demo = JSON.parse(readFileSync(new URL('../../public/data/demo.json', import.meta.url), 'utf8')) as { steder: DemoSted[] }
  const steder = demo.steder.map((sted) => (utenNve(sted) ? { ...sted, nveNysnoSisteDognMm: null } : sted))
  await page.route('**/data/demo.json', (route) => route.fulfill({ json: { ...demo, steder } }))
}

test.describe('the new snow source at 1280px', () => {
  test.use({ viewport: DESKTOP })

  test('NVE’s last day replaces the forecast for the new snow requirement, on the map, in the list and in the address', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await expect(prognose(page)).toBeChecked()
    await nysno(page).fill('5')
    await expectMarkers(page, PROGNOSE_TRE)

    await siste24(page).check()
    await expect(page).toHaveURL(/\/\?nysno=5&nysnokilde=nve$/)
    await expectMarkers(page, NVE_TO)
    await expect(live(page)).toHaveText('2 treff')

    await page.getByRole('link', { name: 'Liste', exact: true }).click()
    await expect(page).toHaveURL(/\/\?visning=liste&nysno=5&nysnokilde=nve$/)
    await expect(rows(page)).toHaveCount(2)
  })

  test('it says plainly, also to a screen reader, that NVE’s values are modelled, not measured snow', async ({ page }) => {
    await page.goto('/')
    await expect(kildeGruppe(page)).toBeVisible()
    await expect(siste24(page)).toBeVisible()
    await expect(kildeGruppe(page)).toHaveAccessibleDescription(/modellerte verdier fra seNorge, ikke målt snø/)
    await expect(page.getByText('NVEs nysnø siste døgn er modellerte verdier fra seNorge, ikke målt snø', { exact: false })).toBeVisible()
  })

  test('a place without an NVE value is hidden only while the new snow requirement is on, never at «Alle»', async ({ page }) => {
    await serveDemoUtenNve(page, ({ id }) => id === 'jiehkkevarri')

    await page.goto('/?nysnokilde=nve')
    await expect(siste24(page)).toBeChecked()
    await expect(markers(page)).toHaveCount(24)
    await expect(page.locator('path[data-sted-id="jiehkkevarri"]')).toHaveCount(1)

    await nysno(page).fill('5')
    await expect(page).toHaveURL(/\/\?nysno=5&nysnokilde=nve$/)
    await expectMarkers(page, ['oksskolten'])
    await expect(page.locator('path[data-sted-id="jiehkkevarri"]')).toHaveCount(0)
  })

  test('the source chosen at «Alle» hides nothing, stays in the address and offers «Nullstill»', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await siste24(page).check()
    await expect(page).toHaveURL(/\/\?nysnokilde=nve$/)
    await expect(markers(page)).toHaveCount(24)
    await expect(panel(page).getByRole('button', { name: 'Nullstill' })).toBeVisible()
  })

  test('a shared link restores the source, and an invalid one gives the forecast', async ({ page }) => {
    await page.goto('/?nysno=5&nysnokilde=nve')
    await expect(siste24(page)).toBeChecked()
    await expectMarkers(page, NVE_TO)

    await page.goto('/?nysno=5&nysnokilde=yr')
    await expect(page).toHaveURL(/\/\?nysno=5$/)
    await expect(prognose(page)).toBeChecked()
    await expectMarkers(page, PROGNOSE_TRE)
    await expect(page.getByRole('alert')).toHaveCount(0)
  })

  test('zero hits from NVE suggest easing new snow along NVE’s values, and keep the source', async ({ page }) => {
    await page.goto('/?nysno=20&nysnokilde=nve&vind=12')
    await expect(markers(page)).toHaveCount(0)
    await expect(banner(page).getByRole('paragraph')).toHaveText('Ingen treff. Prøv nysnø siste 24 t minst 15 cm.')
    await brukForslaget(page).click()
    await expect(page).toHaveURL(/\/\?nysno=15&nysnokilde=nve&vind=12$/)
    await expectMarkers(page, ['oksskolten'])
    await expect(siste24(page)).toBeChecked()
    await expect(nysno(page)).toBeFocused()
  })

  test('«Nullstill» and a quick pick both set the source back to the forecast', async ({ page }) => {
    await page.goto('/?nysno=5&nysnokilde=nve')
    await expectMarkers(page, NVE_TO)
    await panel(page).getByRole('button', { name: 'Nullstill' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(prognose(page)).toBeChecked()

    await page.goto('/?nysno=5&nysnokilde=nve')
    await expectMarkers(page, NVE_TO)
    await page.getByRole('button', { name: 'Pudderdag' }).click()
    await expect(page).toHaveURL(/\/\?nysno=10&vind=8&temp=-2$/)
    await expect(prognose(page)).toBeChecked()
  })

  test('the new snow source has no serious or critical WCAG 2.1 AA violations, idle or on NVE', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await expectNoBlockingViolations(page)
    await page.goto('/?nysno=5&nysnokilde=nve')
    await expectMarkers(page, NVE_TO)
    await expectNoBlockingViolations(page)
  })
})

test.describe('the new snow source at 375px', () => {
  test.use({ viewport: MOBIL })

  test('each choice is at least 44px tall, the chip names the source, and nothing scrolls sideways', async ({ page }) => {
    for (const width of [320, 375]) {
      await page.setViewportSize({ width, height: MOBIL.height })
      await page.goto('/')
      await expect(markers(page)).toHaveCount(24)
      await page.addStyleTag({ content: BRED_FONT })

      await filterKnapp(page).click()
      for (const valg of [prognose(page), siste24(page)]) {
        const etikett = page.locator('label.filter-valg').filter({ has: valg })
        await etikett.scrollIntoViewIfNeeded()
        expect((await box(etikett)).height).toBeGreaterThanOrEqual(44)
      }
      await nysno(page).fill('5')
      await siste24(page).check()
      await expectNoSidewaysScroll(page)
      await filterKnapp(page).click()
      await expect(page.getByRole('list', { name: 'Aktive krav' }).getByRole('listitem')).toHaveText(['Nysnø siste 24 t minst 5 cm'])
      await expectNoSidewaysScroll(page)
    }
  })

  test('the open sheet with the new snow source has no serious or critical WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/?nysno=5&nysnokilde=nve')
    await expectMarkers(page, NVE_TO)
    await filterKnapp(page).click()
    await expect(siste24(page)).toBeChecked()
    await expectNoBlockingViolations(page)
  })

  // Review round 1 (Sena 2A): with new snow at «Alle», the source gets its own chip next to «Nullstill».
  test('the closed sheet shows a chip for the source when new snow is «Alle»', async ({ page }) => {
    await page.goto('/?nysnokilde=nve')
    await expect(markers(page)).toHaveCount(24)
    await expect(page.getByRole('list', { name: 'Aktive krav' }).getByRole('listitem')).toHaveText(['Datagrunnlag siste 24 t (NVE)'])
    await expect(page.locator('.filter-linje').getByRole('button', { name: 'Nullstill' })).toBeVisible()
  })
})

// Review round 1 of Story 3.8 (Sena, 1A and 2A): the list shows the new snow the filter compares with, and
// «Siste 24 t» says so when NVE is missing from the whole run.
test.describe('the new snow source in the list and without NVE at 1280px', () => {
  test.use({ viewport: DESKTOP })

  const rad = (page: Page, id: string) => page.locator(`a.liste-rad[href*="/sted/${id}"]`)

  test('each row shows NVE’s last day with NVE as the source, and the forecast otherwise', async ({ page }) => {
    await page.goto('/?visning=liste&nysno=5&nysnokilde=nve')
    await expect(rows(page)).toHaveCount(2)
    await expect(rad(page, 'oksskolten')).toContainText('Nysnø siste 24 t 15 cm')
    await expect(rad(page, 'oksskolten')).not.toContainText('2,9 cm')

    await prognose(page).check()
    await expect(page).toHaveURL(/\/\?visning=liste&nysno=5$/)
    await expect(rows(page)).toHaveCount(3)
    await expect(rad(page, 'gaustatoppen')).toContainText('Nysnø 10 cm')
  })

  test('with NVE missing for every place, «Siste 24 t» says so and keeps the source', async ({ page }) => {
    await serveDemoUtenNve(page, () => true)
    const melding = page.getByRole('status').filter({ hasText: 'NVE-data mangler i denne kjøringen' })

    await page.goto('/?nysno=5')
    await expectMarkers(page, PROGNOSE_TRE)
    await expect(melding).toHaveCount(0)

    await siste24(page).check()
    await expect(melding).toHaveText('NVE-data mangler i denne kjøringen. Velg «Prognose» for å filtrere på nysnø.')
    await expect(siste24(page)).toBeChecked()
    await expect(markers(page)).toHaveCount(0)

    await prognose(page).check()
    await expect(melding).toHaveCount(0)
    await expectMarkers(page, PROGNOSE_TRE)
  })

  test('the message without NVE has no serious or critical WCAG 2.1 AA violations', async ({ page }) => {
    await serveDemoUtenNve(page, () => true)
    await page.goto('/?nysno=5&nysnokilde=nve')
    await expect(kildeGruppe(page).getByRole('status')).toContainText('NVE-data mangler i denne kjøringen')
    await expectNoBlockingViolations(page)
  })

  test('from 768px the zero-hit banner leaves the NVE message to the open panel, so it is said once', async ({ page }) => {
    await serveDemoUtenNve(page, () => true)
    await page.goto('/?nysno=5&nysnokilde=nve')
    await expect(banner(page)).toBeVisible()
    await expect(banner(page).locator('.ingen-treff-nve')).toBeHidden()
    await expect(page.getByText('NVE-data mangler i denne kjøringen', { exact: false })).toHaveCount(2)
    await expect(page.getByText('NVE-data mangler i denne kjøringen', { exact: false }).locator('visible=true')).toHaveCount(1)
  })
})

// Review round 2 of Story 3.8 (Sena): below 768px the closed sheet hides the panel, so the zero-hit banner
// says why NVE gives no hits.
test.describe('the new snow source without NVE at 375px', () => {
  test.use({ viewport: MOBIL })

  test('the zero-hit banner says NVE is missing while the sheet is closed', async ({ page }) => {
    await serveDemoUtenNve(page, () => true)
    await page.goto('/?nysno=5&nysnokilde=nve')
    await expect(markers(page)).toHaveCount(0)
    await expect(siste24(page)).toBeHidden()
    await expect(banner(page).locator('.ingen-treff-nve')).toHaveText(
      'NVE-data mangler i denne kjøringen. Velg «Prognose» for å filtrere på nysnø.',
    )
    await expectNoSidewaysScroll(page)
    await expectNoBlockingViolations(page)
  })

  test('the banner says nothing about NVE when the forecast is the source', async ({ page }) => {
    await serveDemoUtenNve(page, () => true)
    await page.goto('/?nysno=13')
    await expect(banner(page)).toBeVisible()
    await expect(banner(page).locator('.ingen-treff-nve')).toHaveCount(0)
  })
})
