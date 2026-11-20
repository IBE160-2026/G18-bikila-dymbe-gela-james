// How much of the map a small phone shows over the bottom sheet when Utforsk opens, without scrolling.
//   node "project-phase-folders/4-Avslutningsfasen/målinger/mal-kart-synlig.cjs" [url] [screenshot.png]
// Viewport 375x667 (iPhone SE size) with touch. Visible map = from the map's top to the sheet's top (or the
// screen's bottom), clipped to the screen. Uses the Chromium that Playwright already installs for E2E.
const { chromium } = require('@playwright/test')

const URL_ = process.argv[2] ?? 'https://snowfinder-seven.vercel.app/'
const BILDE = process.argv[3]
const BREDDE = 375
const HOYDE = 667

;(async () => {
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: BREDDE, height: HOYDE }, hasTouch: true, isMobile: true })
    await page.goto(URL_)
    // The map container is enough; markers are not needed to know where the map is.
    await page.waitForSelector('.kart', { timeout: 15_000 })
    await page.waitForLoadState('networkidle')
    const kart = await page.locator('.kart').boundingBox()
    if (!kart) throw new Error('No map on the page (map view, data loaded?)')
    const ark = await page.locator('.filter').boundingBox()
    const best = await page.locator('.best-naa').boundingBox()
    const bunn = Math.min(HOYDE, ark ? ark.y : HOYDE)
    const synlig = Math.max(0, Math.min(bunn, kart.y + kart.height) - Math.max(0, kart.y))
    console.log(
      `map top ${Math.round(kart.y)} px, map height ${Math.round(kart.height)} px, sheet top ${ark ? Math.round(ark.y) : 'none'} px, ` +
        `visible map ${Math.round(synlig)} px` + (best ? `, «Best akkurat nå» top ${Math.round(best.y)} px` : ''),
    )
    if (BILDE) await page.screenshot({ path: BILDE })
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  } finally {
    await browser.close()
  }
})()
