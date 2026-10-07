import type { OsmElement } from './build'
import { USER_AGENT, type HttpDeps } from './http'

export const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

export const SKI_RESORT_QUERY = `[out:json][timeout:180];
area["ISO3166-1"="NO"][admin_level=2]->.norway;
nwr["landuse"="winter_sports"]["name"](area.norway);
out center tags;`

export interface OverpassOptions {
  mirrors?: string[]
  attemptsPerMirror?: number
  baseDelayMs?: number
}

/**
 * Overpass answers "too busy" with HTTP 200 and an HTML page, with 429/504, or by timing out,
 * so anything that is not a JSON body with an `elements` array counts as a failed attempt.
 */
async function queryOnce(mirror: string, query: string, deps: HttpDeps): Promise<OsmElement[]> {
  const response = await deps.fetch(mirror, {
    method: 'POST',
    headers: {
      'User-Agent': USER_AGENT,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({ data: query }).toString(),
    signal: AbortSignal.timeout(200_000),
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  let body: unknown
  try {
    body = JSON.parse(text)
  } catch {
    throw new Error('svaret var ikke JSON (serveren er trolig opptatt)')
  }
  const { elements, remark } = body as { elements?: unknown; remark?: unknown }
  // A runtime error or timeout inside Overpass gives a partial result with a `remark`.
  if (typeof remark === 'string' && /error|timed out/i.test(remark)) throw new Error(`Overpass: ${remark}`)
  if (!Array.isArray(elements)) throw new Error('svaret mangler elements')
  return elements as OsmElement[]
}

export async function fetchSkiResorts(deps: HttpDeps, options: OverpassOptions = {}): Promise<OsmElement[]> {
  const mirrors = options.mirrors ?? OVERPASS_MIRRORS
  const attempts = options.attemptsPerMirror ?? 3
  const baseDelay = options.baseDelayMs ?? 10_000
  const failures: string[] = []

  for (const mirror of mirrors) {
    for (let attempt = 0; attempt < attempts; attempt++) {
      if (attempt > 0) await deps.sleep(baseDelay * 2 ** (attempt - 1))
      try {
        return await queryOnce(mirror, SKI_RESORT_QUERY, deps)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        failures.push(`${mirror} (forsøk ${attempt + 1}): ${message}`)
      }
    }
  }
  throw new Error(`Overpass svarte ikke på noe speil:\n  ${failures.join('\n  ')}`)
}
