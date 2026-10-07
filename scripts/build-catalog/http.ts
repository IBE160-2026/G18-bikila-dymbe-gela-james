// Shared HTTP plumbing for the catalog sources. Injected so tests never touch the network.

export const USER_AGENT = 'SnowFinder-catalog/1.0 (IBE160 G18, Hogskolen i Molde; https://github.com/IBE160-2026)'

export type FetchFn = (url: string, init?: RequestInit) => Promise<Response>
export type SleepFn = (ms: number) => Promise<void>

export interface HttpDeps {
  fetch: FetchFn
  sleep: SleepFn
}

export class HttpError extends Error {
  constructor(
    readonly status: number,
    url: string,
  ) {
    super(`HTTP ${status} fra ${url}`)
  }
}

export const defaultDeps: HttpDeps = {
  fetch: (url, init) => fetch(url, init),
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
}

/** Runs `task` over `items` with at most `limit` in flight, preserving order in the result. */
export async function mapLimit<T, R>(items: T[], limit: number, task: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const index = next++
      results[index] = await task(items[index])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

/**
 * GETs JSON with retries on network errors, 429 and 5xx, waiting longer each time.
 * Other 4xx responses fail at once, since retrying will not help.
 */
export async function getJson(url: string, deps: HttpDeps, attempts = 3, baseDelayMs = 1000): Promise<unknown> {
  let lastError: unknown
  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) await deps.sleep(baseDelayMs * 2 ** (attempt - 1))
    try {
      const response = await deps.fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        signal: AbortSignal.timeout(30_000),
      })
      if (response.ok) return await response.json()
      lastError = new HttpError(response.status, url)
      if (response.status !== 429 && response.status < 500) break
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}
