// Measures SM-1 (NFR-1) and SM-12 (NFR-2) for the final report. Run from the repo root:
//   node "project-phase-folders/4-Avslutningsfasen/målinger/mal-ytelse.cjs" [url] [runs] [cpu-slowdown]
// Default url is the published site, 5 runs and CPU 4x slower (0 turns the CPU throttling off). Uses the Chromium that Playwright already installs for E2E.
//
// Mobile profile (same as Lighthouse's mobile default): 412x823 viewport, touch, CPU 4x slower,
// network 150 ms RTT, 1.6 Mbit/s down and 750 kbit/s up. Every run starts with an empty cache.
//
// SM-12: time from navigation start until the map is interactive: Leaflet has drawn the markers
// and a tap on «Zoom in» changes the zoom.
// SM-1: the Event Timing API gives, for each change, the time from the user's input until the next
// paint after the app has re-rendered the hit count and list (the filter has no debounce, so the
// re-render happens in that frame). Changes: arrow keys on all five sliders, the quick choices and
// typing in the search field.
const path = require('node:path')
const { chromium } = require(path.resolve('node_modules/playwright-core'))

const URL_ = process.argv[2] ?? 'https://snowfinder-seven.vercel.app/'
const RUNS = Number(process.argv[3] ?? 5)
const CPU = Number(process.argv[4] ?? 4)
const MOBILE = { viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true }
const NETWORK = { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 }

async function throttle(page) {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Network.enable')
  await cdp.send('Network.emulateNetworkConditions', NETWORK)
  if (CPU > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU })
  return cdp
}

async function measureMap(browser) {
  const context = await browser.newContext(MOBILE)
  const page = await context.newPage()
  await throttle(page)
  await page.goto(URL_, { waitUntil: 'commit' })
  await page.locator('path.kart-markor').first().waitFor({ state: 'attached', timeout: 30000 })
  const markers = await page.evaluate(() => performance.now())
  // Leaflet scales .leaflet-proxy with the zoom, so a changed transform proves the tap zoomed the map.
  const proxy = () => document.querySelector(".leaflet-proxy")?.style.transform ?? ""
  const zoomBefore = await page.evaluate(proxy)
  await page.locator(".leaflet-control-zoom-in").tap()
  const zoomOk = await page
    .waitForFunction((before) => (document.querySelector(".leaflet-proxy")?.style.transform ?? "") !== before, zoomBefore, { timeout: 10000 })
    .then(() => true, () => false)
  const count = await page.locator('path.kart-markor').count()
  const lcp = await page.evaluate(
    () => new Promise((r) => new PerformanceObserver((l) => r(l.getEntries().at(-1)?.startTime ?? null)).observe({ type: 'largest-contentful-paint', buffered: true })),
  )
  await context.close()
  return { markersMs: Math.round(markers), lcpMs: lcp && Math.round(lcp), markers: count, zoomOk }
}

async function measureFilter(browser) {
  const context = await browser.newContext(MOBILE)
  const page = await context.newPage()
  await throttle(page)
  await page.goto(URL_)
  await page.locator('path.kart-markor').first().waitFor({ state: 'attached', timeout: 30000 })
  await page.evaluate(() => {
    window.__events = []
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (e.interactionId) window.__events.push({ id: e.interactionId, name: e.name, duration: e.duration })
    }).observe({ type: 'event', durationThreshold: 16, buffered: false })
  })
  const counts = {}
  const mark = async (label, fn) => {
    const before = await page.evaluate(() => performance.now())
    await fn()
    await page.waitForTimeout(150)
    counts[label] = (counts[label] ?? 0) + 1
    return before
  }

  await page.getByRole('button', { name: 'Filter', exact: true }).tap()
  for (const name of ['Nysnø', 'Vind', 'Temperatur', 'Skydekke i dagslys', 'Avstand']) {
    const slider = page.getByRole('slider', { name, exact: true })
    if (!(await slider.isVisible())) continue
    await slider.focus()
    for (let i = 0; i < 8; i++) await mark('slider', () => page.keyboard.press('ArrowRight'))
    for (let i = 0; i < 8; i++) await mark('slider', () => page.keyboard.press('ArrowLeft'))
  }
  const quick = page.getByRole('list', { name: 'Hurtigvalg' }).locator('button, input')
  for (let i = 0; i < (await quick.count()); i++) await mark('hurtigvalg', () => quick.nth(i).tap())

  await page.keyboard.press('Escape')
  const search = page.getByRole('combobox', { name: 'Søk etter sted' })
  if (await search.isVisible()) {
    for (const word of ['trysil', 'hemsedal', 'oppdal', 'galdhøpiggen']) {
      await search.fill('')
      await search.focus()
      for (const ch of word) await mark('sok', () => page.keyboard.type(ch))
    }
  }
  // One interaction (key press or tap) gives several entries; keep the longest per interaction.
  const events = await page.evaluate(() => window.__events)
  await context.close()
  return { events, counts }
}

function percentile(values, p) {
  const s = [...values].sort((a, b) => a - b)
  return s[Math.min(s.length - 1, Math.ceil((p / 100) * s.length) - 1)]
}

;(async () => {
  const browser = await chromium.launch()
  console.log(`URL: ${URL_}  runs: ${RUNS}  CPU slowdown: ${CPU > 1 ? CPU + "x" : "none"}  ${new Date().toISOString()}`)
  const maps = []
  for (let i = 0; i < RUNS; i++) {
    const m = await measureMap(browser)
    maps.push(m)
    console.log(`SM-12 run ${i + 1}: markers drawn and zoomable after ${m.markersMs} ms (LCP ${m.lcpMs} ms, ${m.markers} markers, zoom ${m.zoomOk ? "ok" : "FAILED"})`)
  }
  const times = maps.map((m) => m.markersMs)
  console.log(`SM-12: median ${percentile(times, 50)} ms, worst ${Math.max(...times)} ms, under 3000 ms in ${times.filter((t) => t < 3000).length}/${times.length}`)

  const f = await measureFilter(browser)
  const longest = new Map()
  for (const e of f.events) longest.set(e.id, Math.max(longest.get(e.id) ?? 0, e.duration))
  const durations = [...longest.values()]
  const changes = Object.values(f.counts).reduce((a, b) => a + b, 0)
  const over = durations.filter((d) => d >= 500).length
  console.log(`SM-1 changes made: ${JSON.stringify(f.counts)}; ${changes} in all, ${durations.length} of them took 16 ms or more`)
  if (durations.length > 0) console.log(`SM-1: p50 ${percentile(durations, 50)} ms, p95 ${percentile(durations, 95)} ms, max ${Math.max(...durations)} ms, ${over} of ${changes} changes at or over 500 ms (the rest under 16 ms count as under 500)`)
  else console.log('SM-1: every change painted in under 16 ms (no Event Timing entries over the threshold)')
  await browser.close()
})()
