import { expect, test, type Page } from '@playwright/test'

// Story 2.1b: all five filter sliders start at «Alle» on the left and get stricter to the right. The four
// «høyst» sliders are mirrored with dir="rtl". WebKit moved a mirrored range by its number, so the right
// arrow key loosened the requirement there until FilterPanel handled Left and Right itself (2026-11-02).
// This file runs in Chromium with the rest of E2E, and on its own in Firefox and WebKit
// (`npm run test:e2e:nettlesere`). Real Safari on a Mac and an iPhone is checked in the user test.

test.beforeEach(async ({ context }) => {
  // Same isolation as the other E2E tests: nothing from the network.
  await context.route('**/*', (route) => {
    const { hostname } = new URL(route.request().url())
    return hostname === 'localhost' ? route.continue() : route.abort()
  })
})

const SLIDERE = [
  // New snow is not mirrored: the browser moves it by itself, and the right end is its highest number.
  { navn: 'Nysnø', speilet: false, strengest: 'minst 30 cm', ettSteg: 'minst 1 cm', toSteg: 'minst 2 cm' },
  { navn: 'Vind', speilet: true, strengest: 'høyst 0 m/s', ettSteg: 'høyst 24 m/s', toSteg: 'høyst 23 m/s' },
  { navn: 'Temperatur', speilet: true, strengest: 'høyst −20 °C', ettSteg: 'høyst 9 °C', toSteg: 'høyst 8 °C' },
  { navn: 'Skydekke i dagslys', speilet: true, strengest: 'høyst 0 %', ettSteg: 'høyst 90 %', toSteg: 'høyst 80 %' },
  { navn: 'Avstand', speilet: true, strengest: 'høyst 0 km', ettSteg: 'høyst 190 km', toSteg: 'høyst 180 km' },
] as const

const slider = (page: Page, navn: string) => page.getByRole('slider', { name: navn, exact: true })

for (const { navn, speilet, strengest, ettSteg, toSteg } of SLIDERE) {
  test(`${navn}: «Alle» on the left, the right arrow key stricter and the left arrow key looser`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')
    const el = slider(page, navn)
    await expect(el).toHaveAttribute('aria-valuetext', 'Alle')
    if (speilet) await expect(el).toHaveAttribute('dir', 'rtl')
    else await expect(el).not.toHaveAttribute('dir', 'rtl')
    // «Alle» fills the whole track from the thumb on the left.
    await expect(el).toHaveAttribute('style', /--fra: ?0%; ?--til: ?100%/)

    // The keyboard, one step at a time: right is stricter, left is looser, and left stops at «Alle».
    await el.focus()
    await page.keyboard.press('ArrowRight')
    await expect(el).toHaveAttribute('aria-valuetext', ettSteg)
    // Up and Down follow the number, as a screen reader expects: Up is looser on a «høyst» slider.
    await page.keyboard.press('ArrowUp')
    await expect(el).toHaveAttribute('aria-valuetext', speilet ? 'Alle' : toSteg)
    await page.keyboard.press('ArrowDown')
    await expect(el).toHaveAttribute('aria-valuetext', ettSteg)
    await page.keyboard.press('ArrowRight')
    await expect(el).toHaveAttribute('aria-valuetext', toSteg)
    await page.keyboard.press('ArrowLeft')
    await expect(el).toHaveAttribute('aria-valuetext', ettSteg)
    await page.keyboard.press('ArrowLeft')
    await expect(el).toHaveAttribute('aria-valuetext', 'Alle')
    await page.keyboard.press('ArrowLeft')
    await expect(el).toHaveAttribute('aria-valuetext', 'Alle')

    // Home and End follow the number: the lowest is the strictest «høyst», the highest the strictest «minst».
    await page.keyboard.press('Home')
    await expect(el).toHaveAttribute('aria-valuetext', speilet ? strengest : 'Alle')
    await page.keyboard.press('End')
    await expect(el).toHaveAttribute('aria-valuetext', speilet ? 'Alle' : strengest)

    // The pointer: the right end is the strictest value, and the fill runs from the thumb to the right. The box
    // is read before each click, since zero hits at the strictest value can move the page around the slider.
    const boks = async () => {
      const box = await el.boundingBox()
      expect(box).not.toBeNull()
      return box!
    }
    const hoyre = await boks()
    await el.click({ position: { x: hoyre.width - 3, y: hoyre.height / 2 } })
    await expect(el).toHaveAttribute('aria-valuetext', strengest)
    await expect(el).toHaveAttribute('style', /--fra: ?100%; ?--til: ?100%/)
    // At the strictest end, the right arrow key goes no further.
    await page.keyboard.press('ArrowRight')
    await expect(el).toHaveAttribute('aria-valuetext', strengest)
    const venstre = await boks()
    await el.click({ position: { x: 3, y: venstre.height / 2 } })
    await expect(el).toHaveAttribute('aria-valuetext', 'Alle')
  })
}
