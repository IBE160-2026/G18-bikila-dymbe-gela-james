import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// Story 2.1: «Slik beregner vi SnowScore», reached from the navigation, the list and the place page.

test.beforeEach(async ({ context }) => {
  // Same isolation as sted.spec.ts: nothing from the network.
  await context.route('**/*', (route) => {
    const { hostname } = new URL(route.request().url())
    return hostname === 'localhost' ? route.continue() : route.abort()
  })
})

const NAVN = 'Slik beregner vi SnowScore'
const nav = (page: Page) => page.getByRole('navigation', { name: 'Hovedmeny' })

async function expectExplanation(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/slik-beregner-vi-snowscore$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(NAVN)
  await expect(nav(page).getByRole('link', { name: NAVN })).toHaveAttribute('aria-current', 'page')
}

test('the navigation opens the page, with its seven sections, three described graphs and the worked example', async ({ page }) => {
  await page.goto('/')
  await nav(page).getByRole('link', { name: NAVN }).click()
  await expectExplanation(page)

  for (const name of ['Kort fortalt', 'Steg for steg', 'Regneeksempel', 'Datakilder og begrensninger', 'Datakvalitet', 'Prøv selv', 'Endringslogg']) {
    await expect(page.getByRole('heading', { level: 2, name })).toBeVisible()
  }
  const graphs = page.getByRole('img')
  await expect(graphs).toHaveCount(3)
  for (const [i, delpoeng] of ['A Nysnøpotensial', 'B Kuldebonus', 'C Snøandel'].entries()) {
    await expect(graphs.nth(i)).toHaveAttribute('aria-label', new RegExp(`^Graf for ${delpoeng}: `))
  }
  // Story 2.2: the worked example ends in the brief's score.
  await expect(page.getByText('SnowScore = 36 + 6,8 + 15 = 57,8, avrundet til 58')).toBeVisible()
  // Story 2.5: the example's sub-scores with the same bars and text as on the place page.
  const eksempel = page.locator('section[aria-labelledby="regneeksempel"] .tall-liste')
  await expect(eksempel.locator('dd')).toHaveText(['36,0 av 60', '6,8 av 25', '15,0 av 15'])
  await expect(eksempel.locator('.delpoeng-stolpe[aria-hidden="true"]')).toHaveCount(3)
  const eksempelFyll = eksempel.locator('.delpoeng-stolpe > span')
  await expect(eksempelFyll.nth(0)).toHaveAttribute('style', /^width: 60%;?$/)
  // B is 6,77… of 25 ≈ 27,1 %, computed from the unrounded value.
  await expect(eksempelFyll.nth(1)).toHaveAttribute('style', /^width: 27(\.\d+)?%;?$/)
  await expect(eksempelFyll.nth(2)).toHaveAttribute('style', /^width: 100%;?$/)
  // Story 2.3: the sources point to Varsom, and the quality panel describes the demo data set.
  await expect(page.getByRole('link', { name: 'Varsom.no' })).toHaveAttribute('href', 'https://www.varsom.no/')
  await expect(page.locator('.datakvalitet')).toContainText('Du ser demodata: innspilte svar fra MET og NVE')
  await expect(page.locator('.datakvalitet')).toContainText('24 steder')
  const forsteRad = page.locator('section[aria-labelledby="endringslogg"] tbody tr').first()
  await expect(forsteRad.locator('th')).toHaveText('1.0')
  await expect(forsteRad).toContainText('endret fra 6 til 16')

  // «SnowFinder» goes back to the map and takes over aria-current.
  await nav(page).getByRole('link', { name: 'SnowFinder' }).click()
  await expect(nav(page).getByRole('link', { name: 'SnowFinder' })).toHaveAttribute('aria-current', 'page')
})

for (const [visning, adresse] of [
  ['map', '/'],
  ['list', '/?visning=liste'],
] as const) {
  // Story 2.1b: from 768px only the navigation's link is shown, so Utforsk does not show it twice.
  test(`the ${visning} shows the link once, in the navigation, and the decorative logo`, async ({ page }) => {
    await page.goto(adresse)
    await expect(page.getByRole('link', { name: NAVN })).toHaveCount(1)
    await expect(page.locator('main').getByRole('link', { name: NAVN })).toHaveCount(0)
    // The logo is decorative: it loads, and the link's name is still only «SnowFinder».
    const logo = nav(page).locator('img.app-logo')
    await expect(logo).toHaveAttribute('alt', '')
    await expect(logo).toHaveJSProperty('complete', true)
    await expect(logo).not.toHaveJSProperty('naturalWidth', 0)
    await expect(nav(page).getByRole('link', { name: 'SnowFinder', exact: true })).toBeVisible()
    await nav(page).getByRole('link', { name: NAVN }).click()
    await expectExplanation(page)
  })
}

test('the link in the SnowScore card opens the page from the place page', async ({ page }) => {
  await page.goto('/sted/gaustatoppen')
  const lenke = page.locator('.sted-kort').getByRole('link', { name: NAVN })
  const box = await lenke.boundingBox()
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
  await lenke.click()
  await expectExplanation(page)
})

test('a direct address with a trailing slash shows the page; an unknown sub-path does not', async ({ page }) => {
  await page.goto('/slik-beregner-vi-snowscore/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(NAVN)
  await page.goto('/slik-beregner-vi-snowscore/x')
  await expect(page.getByText('Fant ikke siden')).toBeVisible()
})

test('the calculator updates A, B, C and the score as you type, and explains an invalid value', async ({ page }) => {
  await page.goto('/slik-beregner-vi-snowscore')
  const resultat = page.locator('.kalkulator-resultat')
  const nedbor = page.getByLabel('Nedbør i 24 timer (mm)')
  const temperatur = page.getByLabel('Snittemperatur (°C)')
  await expect(resultat).toContainText('58 · Godt')
  // Story 2.5: the start values give A 36 of 60 and a full C.
  const fyll = resultat.locator('.delpoeng-stolpe > span')
  await expect(fyll.nth(0)).toHaveAttribute('style', /^width: 60%;?$/)
  await expect(fyll.nth(2)).toHaveAttribute('style', /^width: 100%;?$/)

  // 20 mm at −14 °C gives full A and full B: 60 + 25 + 15 = 100. No reload: the URL stays the same.
  await nedbor.fill('20')
  await temperatur.fill('-14')
  await expect(resultat).toContainText('60,0 av 60')
  await expect(resultat).toContainText('25,0 av 25')
  await expect(resultat).toContainText('100 · Svært godt')
  // Story 2.5: the bars follow the input without a reload; A and B are full, and so is C.
  await expect(fyll).toHaveCount(3)
  for (let i = 0; i < 3; i++) await expect(fyll.nth(i)).toHaveAttribute('style', /^width: 100%;?$/)
  await expect(page).toHaveURL(/\/slik-beregner-vi-snowscore$/)

  // Rain at 5 °C gives no new snow, no cold bonus and no snow share.
  await temperatur.fill('5')
  await expect(resultat).toContainText('0 · Lite')
  for (let i = 0; i < 3; i++) await expect(fyll.nth(i)).toHaveAttribute('style', /^width: 0%;?$/)

  await nedbor.fill('mye')
  await expect(nedbor).toHaveAttribute('aria-invalid', 'true')
  await expect(nedbor).toHaveAttribute('aria-describedby', 'kalkulator-nedbor-feil')
  await expect(page.locator('#kalkulator-nedbor-feil')).toHaveText('Skriv et tall, for eksempel 12 eller −2,5.')
  await expect(resultat).toHaveText('Rett verdiene over for å se SnowScore.')
  await expect(resultat.locator('.delpoeng-stolpe')).toHaveCount(0)
})

test.describe('at 375px', () => {
  test.use({ viewport: { width: 375, height: 740 } })

  test('the ☰ menu shows the links, opens the page and closes again', async ({ page }) => {
    await page.goto('/')
    const knapp = nav(page).getByRole('button', { name: 'Meny' })
    const lenke = nav(page).getByRole('link', { name: NAVN })
    await expect(knapp).toHaveAttribute('aria-expanded', 'false')
    await expect(lenke).toBeHidden()

    const box = await knapp.boundingBox()
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(44)

    await knapp.click()
    await expect(knapp).toHaveAttribute('aria-expanded', 'true')
    await expect(lenke).toBeVisible()
    await lenke.click()
    await expect(page).toHaveURL(/\/slik-beregner-vi-snowscore$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(NAVN)
    // Choosing a link closes the menu; opening it again shows the current page marked.
    await expect(knapp).toHaveAttribute('aria-expanded', 'false')
    await expect(lenke).toBeHidden()
    await knapp.click()
    await expect(lenke).toHaveAttribute('aria-current', 'page')

    // No sideways scrolling on a phone.
    const scrollWidth = await page.locator('html').evaluate((html) => html.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(375)
  })

  for (const [visning, adresse] of [
    ['map', '/'],
    ['list', '/?visning=liste'],
  ] as const) {
    // Story 2.1b: the navigation's link is folded behind ☰ here, so the one next to the switch is shown
    // instead, and the explanation stays one tap away from map and list (Story 2.1, FR-8).
    test(`the ${visning} shows the link next to the switch, and only that one`, async ({ page }) => {
      await page.goto(adresse)
      await expect(page.getByRole('link', { name: NAVN })).toHaveCount(1)
      const lenke = page.locator('main').getByRole('link', { name: NAVN })
      const box = await lenke.boundingBox()
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
      await lenke.click()
      // The navigation's own link, which expectExplanation checks, is behind ☰ at this width.
      await expect(page).toHaveURL(/\/slik-beregner-vi-snowscore$/)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(NAVN)
    })
  }

  test('going Back closes an open ☰ menu', async ({ page }) => {
    await page.goto('/')
    const knapp = nav(page).getByRole('button', { name: 'Meny' })
    await knapp.click()
    await nav(page).getByRole('link', { name: NAVN }).click()
    await expect(page).toHaveURL(/\/slik-beregner-vi-snowscore$/)
    await knapp.click()
    await expect(knapp).toHaveAttribute('aria-expanded', 'true')

    await page.goBack()
    await expect(page).toHaveURL(/\/$/)
    await expect(knapp).toHaveAttribute('aria-expanded', 'false')
    await expect(nav(page).getByRole('link', { name: NAVN })).toBeHidden()
  })

  test('«SnowFinder» from «Fant ikke siden» closes an open ☰ menu', async ({ page }) => {
    // «Fant ikke siden» and the map share the root as their link address, so the menu keys on the route too.
    await page.goto('/finnes-ikke')
    await expect(page.getByText('Fant ikke siden')).toBeVisible()
    const knapp = nav(page).getByRole('button', { name: 'Meny' })
    await knapp.click()
    await expect(knapp).toHaveAttribute('aria-expanded', 'true')

    await nav(page).getByRole('link', { name: 'SnowFinder' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('.kart')).toBeVisible()
    await expect(knapp).toHaveAttribute('aria-expanded', 'false')
    await expect(nav(page).getByRole('link', { name: NAVN })).toBeHidden()
  })

  test('«SnowFinder» from a filtered map closes an open ☰ menu', async ({ page }) => {
    // Story 3.2: the filtered map and the plain map are one route type with two addresses.
    await page.goto('/?nysno=2')
    await expect(page.locator('.kart')).toBeVisible()
    const knapp = nav(page).getByRole('button', { name: 'Meny' })
    await knapp.click()
    await expect(knapp).toHaveAttribute('aria-expanded', 'true')

    await nav(page).getByRole('link', { name: 'SnowFinder' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(knapp).toHaveAttribute('aria-expanded', 'false')
    await expect(nav(page).getByRole('link', { name: NAVN })).toBeHidden()
  })
})

// CI runs on Linux, whose fonts are wider than Windows'; a page that fits locally overflowed there (PR #33–#38).
// A deliberately wide font makes the check fail on every platform when anything is too wide for a phone.
const TABELLER = ['Timesverdier i regneeksempelet', 'Endringer i SnowScore-formelen, nyeste først']
const BRED_FONT = `* { font-family: Verdana, 'DejaVu Sans', sans-serif !important; }`

for (const width of [320, 375]) {
  test(`the page does not scroll sideways at ${width}px, even with a wide font`, async ({ page }) => {
    await page.setViewportSize({ width, height: 740 })
    await page.goto('/slik-beregner-vi-snowscore')
    await expect(page.getByRole('img')).toHaveCount(3)
    await page.addStyleTag({ content: BRED_FONT })
    const html = page.locator('html')
    const [scrollWidth, clientWidth] = await html.evaluate((el) => [el.scrollWidth, el.clientWidth])
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
    // The tables may scroll inside their own region instead, which keyboard users can reach.
    for (const navn of TABELLER) {
      await expect(page.getByRole('region', { name: navn })).toHaveAttribute('tabindex', '0')
    }
  })
}

test('at 320px with a wide font the sub-score values in the worked example and the calculator stay inside their rows', async ({ page }) => {
  // Story 2.5: the bars must not push the page or a value sideways.
  await page.setViewportSize({ width: 320, height: 740 })
  await page.goto('/slik-beregner-vi-snowscore')
  const verdier = page.locator(
    'section[aria-labelledby="regneeksempel"] dd.delpoeng-verdi, .kalkulator-resultat dd.delpoeng-verdi',
  )
  await expect(verdier).toHaveCount(6)
  await page.addStyleTag({ content: BRED_FONT })
  const [scrollWidth, clientWidth] = await page.locator('html').evaluate((el) => [el.scrollWidth, el.clientWidth])
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
  for (const dd of await verdier.all()) {
    const [ddScroll, ddClient] = await dd.evaluate((el) => [el.scrollWidth, el.clientWidth])
    expect(ddScroll).toBeLessThanOrEqual(ddClient)
  }
})

test('both tables fit a 375px phone in the page font, without scrolling inside', async ({ page }) => {
  // The inner scrolling is only a safety net for wide fonts; with the page's own font the tighter
  // cells must be enough, or a later column or padding change would quietly hide part of a table.
  await page.setViewportSize({ width: 375, height: 740 })
  await page.goto('/slik-beregner-vi-snowscore')
  for (const navn of TABELLER) {
    const [scrollWidth, clientWidth] = await page
      .getByRole('region', { name: navn })
      .evaluate((el) => [el.scrollWidth, el.clientWidth])
    expect(scrollWidth, navn).toBeLessThanOrEqual(clientWidth)
  }
})

for (const [bredde, viewport] of [
  ['wide', { width: 1280, height: 800 }],
  ['narrow', { width: 375, height: 740 }],
] as const) {
  test(`the page has no serious or critical WCAG 2.1 AA violations (${bredde})`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/slik-beregner-vi-snowscore')
    await expect(page.getByRole('img')).toHaveCount(3)
    if (bredde === 'narrow') await nav(page).getByRole('button', { name: 'Meny' }).click()
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    const blocking = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical')
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([])
  })
}
