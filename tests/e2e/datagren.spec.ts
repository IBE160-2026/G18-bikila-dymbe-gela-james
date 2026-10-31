import { expect, test } from '@playwright/test'

// Story 1.11: only `npm run dev` reads the branch `data`. Every other spec aborts calls outside
// localhost and falls through to the demo data, so they would pass even if the production build read it.

test('the production build never asks for the file on the branch data', async ({ page, context }) => {
  await context.route('**/*', (route) => {
    const { hostname } = new URL(route.request().url())
    return hostname === 'localhost' ? route.continue() : route.abort()
  })
  await context.route('**/data/latest.json', (route) => route.fulfill({ status: 404, body: '' }))

  const urls: string[] = []
  page.on('request', (request) => urls.push(request.url()))

  await page.goto('/')
  // The banner comes after the whole chain of sources has been tried.
  await expect(page.getByText('Demodata – ikke ekte prognoser')).toBeVisible()

  expect(urls.some((url) => url.endsWith('/data/latest.json'))).toBe(true)
  expect(urls.filter((url) => url.includes('raw.githubusercontent.com'))).toEqual([])
})
