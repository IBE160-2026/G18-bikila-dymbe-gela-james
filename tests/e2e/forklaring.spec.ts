import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// Story 2.1: «Slik beregner vi SnowScore», reached from the navigation, the list and the place page.

test.beforeEach(async ({ context }) => {
  // Same isolation as sted.spec.ts: nothing from the network, and no leftover latest.json.
  await context.route('**/*', (route) => {
    const { hostname } = new URL(route.request().url())
    return hostname === 'localhost' ? route.continue() : route.abort()
  })
  await context.route('**/data/latest.json', (route) => route.fulfill({ status: 404, body: '' }))
})

const NAVN = 'Slik beregner vi SnowScore'
const nav = (page: Page) => page.getByRole('navigation', { name: 'Hovedmeny' })

async function expectExplanation(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/slik-beregner-vi-snowscore$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(NAVN)
  await expect(nav(page).getByRole('link', { name: NAVN })).toHaveAttribute('aria-current', 'page')
}

test('the navigation opens the page, with the three sections and three described graphs', async ({ page }) => {
  await page.goto('/')
  await nav(page).getByRole('link', { name: NAVN }).click()
  await expectExplanation(page)

  for (const name of ['Kort fortalt', 'Steg for steg', 'Endringslogg']) {
    await expect(page.getByRole('heading', { level: 2, name })).toBeVisible()
  }
  const graphs = page.getByRole('img')
  await expect(graphs).toHaveCount(3)
  for (const [i, delpoeng] of ['A Nysnøpotensial', 'B Kuldebonus', 'C Snøandel'].entries()) {
    await expect(graphs.nth(i)).toHaveAttribute('aria-label', new RegExp(`^Graf for ${delpoeng}: `))
  }
  const forsteRad = page.locator('tbody tr').first()
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
  test(`the link next to the map/list switch opens the page from the ${visning}`, async ({ page }) => {
    await page.goto(adresse)
    await page.locator('main').getByRole('link', { name: NAVN }).click()
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

  test('going Back closes an open ☰ menu', async ({ page }) => {
    await page.goto('/')
    await page.locator('main').getByRole('link', { name: NAVN }).click()
    await expect(page).toHaveURL(/\/slik-beregner-vi-snowscore$/)
    const knapp = nav(page).getByRole('button', { name: 'Meny' })
    await knapp.click()
    await expect(knapp).toHaveAttribute('aria-expanded', 'true')

    await page.goBack()
    await expect(page).toHaveURL(/\/$/)
    await expect(knapp).toHaveAttribute('aria-expanded', 'false')
    await expect(nav(page).getByRole('link', { name: NAVN })).toBeHidden()
  })
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
