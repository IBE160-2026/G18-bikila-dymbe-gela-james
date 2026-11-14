import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

// Story 3.9 (FR-32, UJ-4): search for a place by name on the demo data, above the map and the list.

test.beforeEach(async ({ context }) => {
  // Same isolation as kart.spec.ts: nothing from the network.
  await context.route('**/*', (route) => {
    const { hostname } = new URL(route.request().url())
    return hostname === 'localhost' ? route.continue() : route.abort()
  })
})

const DESKTOP = { width: 1280, height: 800 }
const MOBIL = { width: 375, height: 740 }

const felt = (page: Page) => page.getByRole('combobox', { name: 'Søk etter sted' })
const forslag = (page: Page) => page.getByRole('listbox', { name: 'Forslag' }).getByRole('option')
const markers = (page: Page) => page.locator('path.kart-markor')
const rows = (page: Page) => page.locator('a.liste-rad')
const sokLive = (page: Page) => page.locator('.sted-sok [aria-live="polite"]')
const treffLive = (page: Page) => page.getByRole('status').filter({ hasText: 'treff' })

async function expectNoBlockingViolations(page: Page): Promise<void> {
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

/** True when the centre of `locator` is the element itself, not something painted over it. */
async function isOnTop(locator: Locator): Promise<boolean> {
  return locator.evaluate((el) => {
    const { x, y, width, height } = el.getBoundingClientRect()
    const top = el.ownerDocument.elementFromPoint(x + width / 2, y + height / 2)
    return top !== null && (top === el || el.contains(top))
  })
}

test.describe('at 1280px', () => {
  test.use({ viewport: DESKTOP })

  test('«gaus» → Enter opens Gaustatoppen with the search in the address, and Back shows Utforsk as before', async ({ page }) => {
    await page.goto('/?visning=liste&nysno=2')
    await expect(rows(page)).not.toHaveCount(0)
    const antall = await rows(page).count()
    await expect(treffLive(page)).toHaveText(`${antall} treff`)

    await felt(page).fill('gaus')
    await expect(forslag(page)).toHaveCount(1)
    await expect(forslag(page).first()).toContainText('Gaustatoppen')
    // Gaustatoppen has at least 2 cm new snow, so the filter shows it and the suggestion says nothing more.
    await expect(rows(page).filter({ hasText: 'Gaustatoppen' })).toHaveCount(1)
    await expect(forslag(page).first()).not.toContainText('Oppfyller ikke filteret')
    await expect(sokLive(page)).toHaveText('1 sted')
    // Typing changes neither the address, the hit count nor the list.
    await expect(page).toHaveURL(/\/\?visning=liste&nysno=2$/)
    await expect(treffLive(page)).toHaveText(`${antall} treff`)
    await expect(rows(page)).toHaveCount(antall)

    // Enter with nothing highlighted opens the first suggestion.
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/sted\/gaustatoppen\?visning=liste&nysno=2$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gaustatoppen')

    await page.goBack()
    await expect(page).toHaveURL(/\/\?visning=liste&nysno=2$/)
    await expect(rows(page)).toHaveCount(antall)
    await expect(felt(page)).toHaveValue('')
  })

  test('the keyboard moves the highlight, Escape closes and then clears, and leaving the field closes the list', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await felt(page).fill('skisenter')
    await expect(forslag(page)).toHaveText([/Hemsedal skisenter/, /Oppdal Skisenter/, /Sirdal Skisenter/])
    await expect(sokLive(page)).toHaveText('3 steder')
    await expect(felt(page)).toHaveAttribute('aria-expanded', 'true')
    await expect(felt(page)).not.toHaveAttribute('aria-activedescendant')

    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    const andre = forslag(page).nth(1)
    await expect(andre).toHaveAttribute('aria-selected', 'true')
    await expect(felt(page)).toHaveAttribute('aria-activedescendant', (await andre.getAttribute('id')) ?? '')
    await page.keyboard.press('ArrowUp')
    await expect(forslag(page).first()).toHaveAttribute('aria-selected', 'true')

    await page.keyboard.press('Escape')
    await expect(forslag(page)).toHaveCount(0)
    await expect(felt(page)).toHaveAttribute('aria-expanded', 'false')
    await expect(felt(page)).toHaveValue('skisenter')
    await page.keyboard.press('Escape')
    await expect(felt(page)).toHaveValue('')
    await expect(page).toHaveURL(/\/$/)

    await felt(page).fill('oppdal')
    await expect(forslag(page)).toHaveCount(1)
    await page.keyboard.press('Tab')
    await expect(forslag(page)).toHaveCount(0)

    // Arrow down reopens the list and highlights the first, and Enter opens the highlighted one.
    await felt(page).focus()
    await page.keyboard.press('ArrowDown')
    await expect(forslag(page).first()).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/sted\/oppdal-skisenter$/)
  })

  test('a mouse click opens the place page from the map view', async ({ page }) => {
    await page.goto('/?vind=8')
    await expect(markers(page)).not.toHaveCount(0)
    await felt(page).fill('tromso')
    await expect(forslag(page)).toHaveText([/^Tromsø,/, /^Tromsø Alpinpark,/])
    await forslag(page).nth(1).click()
    await expect(page).toHaveURL(/\/sted\/tromso-alpinpark\?vind=8$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tromsø Alpinpark')
    await page.getByRole('link', { name: 'Tilbake', exact: true }).click()
    await expect(page).toHaveURL(/\/\?vind=8$/)
  })

  test('a place the filter hides is still found, marked «Oppfyller ikke filteret»; incomplete data says so', async ({ page }) => {
    await page.goto('/?visning=liste&nysno=20')
    await expect(rows(page).filter({ hasText: 'Oslo' })).toHaveCount(0)
    await felt(page).fill('oslo')
    await expect(forslag(page)).toHaveCount(1)
    await expect(forslag(page).first()).toContainText('Oslo')
    await expect(forslag(page).first()).toContainText('Oppfyller ikke filteret')
    await expect(page).toHaveURL(/\/\?visning=liste&nysno=20$/)

    await felt(page).fill('trondheim')
    await expect(forslag(page).first()).toContainText('Trondheim')
    await expect(forslag(page).first()).toContainText('Ufullstendige data')
  })

  test('no hits says what was searched for and how many places SnowFinder covers', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await felt(page).fill('xyz')
    const tekst = 'Fant ingen steder som heter «xyz». SnowFinder dekker 24 steder i Norge.'
    await expect(page.locator('.sted-sok-ingen')).toHaveText(tekst)
    await expect(sokLive(page)).toHaveText(tekst)
    await expect(forslag(page)).toHaveCount(0)
    await expect(markers(page)).toHaveCount(24)

    await felt(page).fill('   ')
    await expect(page.locator('.sted-sok-ingen')).toHaveCount(0)
    await expect(sokLive(page)).toHaveText('')
  })

  test('the field and the suggestions are large enough to tap, and the open list floats over the map', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    expect((await box(felt(page))).height).toBeGreaterThanOrEqual(44)
    await felt(page).fill('t')
    await expect(forslag(page)).toHaveCount(4)
    for (const rad of await forslag(page).all()) {
      expect((await box(rad)).height).toBeGreaterThanOrEqual(44)
      expect(await isOnTop(rad)).toBe(true)
    }
  })

  test('the open list has no serious or critical WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await felt(page).fill('t')
    await page.keyboard.press('ArrowDown')
    await expect(forslag(page)).toHaveCount(4)
    await expectNoBlockingViolations(page)
  })
})

test.describe('at 375px', () => {
  test.use({ viewport: MOBIL })

  test('the field sits above the map, outside the bottom sheet, and the sheet never covers it', async ({ page }) => {
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    const sheet = page.getByRole('complementary', { name: 'Filter' })
    await expect(sheet.getByRole('combobox')).toHaveCount(0)
    const kart = page.locator('.kart')
    expect((await box(felt(page))).y + (await box(felt(page))).height).toBeLessThanOrEqual((await box(kart)).y)

    // Closed sheet, then open sheet: the field is visible and on top both times.
    await expect(felt(page)).toBeVisible()
    expect(await isOnTop(felt(page))).toBe(true)
    await page.getByRole('button', { name: 'Filter', exact: true }).click()
    await expect(page.getByRole('slider', { name: 'Nysnø' })).toBeVisible()
    await expect(felt(page)).toBeInViewport()
    expect(await isOnTop(felt(page))).toBe(true)
  })

  test('the open list and a long text without hits never scroll the page sideways, even with a wide font', async ({ page }) => {
    for (const width of [320, 375]) {
      await page.setViewportSize({ width, height: MOBIL.height })
      await page.goto('/')
      await expect(markers(page)).toHaveCount(24)
      // CI runs on Ubuntu, whose fonts are wider than on Windows.
      await page.addStyleTag({ content: `* { font-family: Verdana, 'DejaVu Sans', sans-serif !important; }` })
      for (const tekst of ['skisenter', 'tromso', 'enveldiglangtekstutenmellomromsomikkefinnes']) {
        await felt(page).fill(tekst)
        await expect(sokLive(page)).not.toHaveText('')
        const [scrollWidth, clientWidth] = await page.locator('html').evaluate((el) => [el.scrollWidth, el.clientWidth])
        expect(scrollWidth, tekst).toBeLessThanOrEqual(clientWidth)
      }
    }
  })

  test('on a short phone the open list paints over the closed bottom sheet', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 560 })
    await page.goto('/')
    await expect(markers(page)).toHaveCount(24)
    await expect(page.getByRole('button', { name: 'Filter', exact: true })).toHaveAttribute('aria-expanded', 'false')
    await felt(page).fill('t')
    await expect(forslag(page)).toHaveCount(4)
    const siste = forslag(page).last()
    const sheet = await box(page.getByRole('complementary', { name: 'Filter' }))
    const rad = await box(siste)
    // The last suggestion really runs under the sheet, so the check is about which one paints on top. Its
    // centre may be below the screen, so the point is the middle of its part that is on screen.
    expect(rad.y + rad.height).toBeGreaterThan(sheet.y)
    const y = (Math.max(rad.y, sheet.y) + Math.min(rad.y + rad.height, 560)) / 2
    const iToppen = await siste.evaluate((el, [px, py]) => {
      const top = el.ownerDocument.elementFromPoint(px, py)
      return top !== null && (top === el || el.contains(top))
    }, [rad.x + rad.width / 2, y])
    expect(iToppen).toBe(true)
  })

  test.describe('on a touch screen', () => {
    test.use({ hasTouch: true, isMobile: true })

    test('a tap on a suggestion opens the place page', async ({ page }) => {
      await page.goto('/')
      await expect(markers(page)).toHaveCount(24)
      await felt(page).fill('gaus')
      await forslag(page).first().tap()
      await expect(page).toHaveURL(/\/sted\/gaustatoppen$/)
    })
  })

  test('the open list has no serious or critical WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/?visning=liste')
    await expect(rows(page)).toHaveCount(24)
    await felt(page).fill('skisenter')
    await page.keyboard.press('ArrowDown')
    await expect(forslag(page)).toHaveCount(3)
    await expectNoBlockingViolations(page)
  })
})
