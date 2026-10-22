import { expect, type Page } from '@playwright/test'

/**
 * Clicks Leaflet's «Zoom in» or «Zoom out» and waits until the zoom animation has ended. Leaflet zooms
 * from its current level, which only changes when the animation ends, so a second click during the
 * 250 ms animation is lost. The zoom proxy's target transform is set as the animation starts, and the
 * map pane carries `leaflet-zoom-anim` until it ends.
 */
export async function zoomStep(page: Page, name: 'Zoom in' | 'Zoom out'): Promise<void> {
  const proxy = page.locator('.leaflet-proxy')
  // The proxy's only inline style is its transform.
  const transform = () => proxy.evaluate((el) => el.getAttribute('style'))
  const before = await transform()
  await page.getByRole('button', { name }).click()
  await expect.poll(transform).not.toBe(before)
  await expect(page.locator('.leaflet-map-pane')).not.toHaveClass(/leaflet-zoom-anim/)
}
