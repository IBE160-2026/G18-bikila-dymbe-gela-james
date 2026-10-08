import { describe, expect, it, vi } from 'vitest'
import type { LoadResult } from '../lib/data/loadPublishedData'
import { createSharedLoader } from './useSteder'

describe('createSharedLoader', () => {
  it('loads once and hands every caller the same result', async () => {
    const loaded: LoadResult = { status: 'error', message: 'x' }
    const loadFn = vi.fn(() => Promise.resolve(loaded))
    const loader = createSharedLoader(loadFn)

    expect(loader.current()).toBeNull()
    const [first, second] = await Promise.all([loader.load(), loader.load()])
    expect(await loader.load()).toBe(loaded)
    expect(first).toBe(loaded)
    expect(second).toBe(loaded)
    expect(loader.current()).toBe(loaded)
    expect(loadFn).toHaveBeenCalledTimes(1)
  })
})
