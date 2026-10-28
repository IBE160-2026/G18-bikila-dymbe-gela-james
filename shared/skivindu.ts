// Story 4.2 (FR-17): the best ski window, the "when" next to SnowScore's "where". AD-6: the single
// implementation; the pipeline writes the result to the data file and the app only reads it (AD-2).
import { snowFraction } from './snowscore'
import { erDagslystime } from './sol'

export const SKIVINDU = {
  /** Hours the pipeline looks ahead, from the hour containing the reference time. */
  periodeTimer: 48,
  /** Length of the window when there are enough consecutive candidate hours. */
  vinduTimer: 4,
  /** An hour has snowfall when precipitation × snowFraction(T) is at least this many mm (inclusive). */
  snofallMm: 0.1,
} as const

const HOUR_MS = 3_600_000

/** One hour of the period. A missing MET step is an hour with nulls. */
export interface SkivinduTime {
  /** ISO 8601 UTC, on the whole hour. */
  time: string
  vindMs: number | null
  skydekke: number | null
  nedborMm: number | null
  temperaturC: number | null
}

export interface Skivindu {
  /** First hour of the window, ISO 8601 UTC. */
  start: string
  /** Number of hours, 1–4; under 4 when no longer consecutive run of candidate hours exists. */
  timer: number
  /** Mean wind over the window in m/s, unrounded. */
  snittVindMs: number
  /** Mean cloud cover over the window in %, unrounded. */
  snittSkydekke: number
  /** True when snow fell in the period, so the window starts after the last snowfall hour. */
  etterSnofall: boolean
}

export interface SkivinduResultat {
  skivindu: Skivindu | null
  /** True when no hour of the period is a daylight hour (polar night): the window ignores daylight. */
  skivinduUtenDagslys: boolean
}

/** Missing precipitation or temperature counts as no snow. */
function harSnofall({ nedborMm, temperaturC }: SkivinduTime): boolean {
  if (nedborMm === null || temperaturC === null) return false
  return nedborMm * snowFraction(temperaturC) >= SKIVINDU.snofallMm
}

interface Kandidat {
  ms: number
  time: string
  vindMs: number
  skydekke: number
}

const mean = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length

/**
 * Wind in whole m/s for the ranking. Rounds to 6 decimals first, so a mean that is x.5 in decimals but
 * x.4999… after float summation (1.2, 1.4, 1.6, 1.8) still rounds up, as the golden table says.
 */
const heleMs = (vind: number) => Math.round(Math.round(vind * 1e6) / 1e6)

/**
 * The best window in `timer` (the period, one entry per hour in time order) at `lat`/`lon`.
 *
 * A candidate hour has wind and cloud cover, comes after the period's last hour with snowfall, and is a
 * daylight hour (shared/sol.ts erDagslystime). When the period has no daylight hour at all, daylight is
 * ignored and `skivinduUtenDagslys` is true. The window is 4 consecutive candidate hours, or the longest
 * consecutive run when none is that long. Among windows of that length the lowest mean wind rounded to
 * whole m/s wins, then the lowest mean cloud cover, then the earliest. No candidate gives `skivindu: null`.
 */
export function besteSkivindu(timer: readonly SkivinduTime[], lat: number, lon: number): SkivinduResultat {
  const dagslys = timer.map((t) => erDagslystime(t.time, lat, lon))
  const skivinduUtenDagslys = timer.length > 0 && !dagslys.includes(true)
  const sisteSnofall = timer.findLastIndex(harSnofall)

  // Runs of consecutive candidate hours; a non-candidate or a gap in time ends a run.
  const rekker: Kandidat[][] = []
  let rekke: Kandidat[] = []
  timer.forEach((t, i) => {
    const kandidat =
      i > sisteSnofall && t.vindMs !== null && t.skydekke !== null && (skivinduUtenDagslys || dagslys[i])
    if (!kandidat) {
      rekke = []
      return
    }
    const ms = Date.parse(t.time)
    const forrige = rekke.at(-1)
    if (forrige === undefined || ms - forrige.ms !== HOUR_MS) {
      rekke = []
      rekker.push(rekke)
    }
    rekke.push({ ms, time: t.time, vindMs: t.vindMs as number, skydekke: t.skydekke as number })
  })

  const lengde = Math.min(SKIVINDU.vinduTimer, Math.max(0, ...rekker.map((r) => r.length)))
  if (lengde === 0) return { skivindu: null, skivinduUtenDagslys }

  let beste: { vind: number; sky: number; vindu: Kandidat[] } | null = null
  for (const r of rekker) {
    for (let i = 0; i + lengde <= r.length; i++) {
      const vindu = r.slice(i, i + lengde)
      const vind = mean(vindu.map((k) => k.vindMs))
      const sky = mean(vindu.map((k) => k.skydekke))
      // Windows are visited in time order, so strict comparisons keep the earliest on a tie.
      const bedre =
        beste === null ||
        heleMs(vind) < heleMs(beste.vind) ||
        (heleMs(vind) === heleMs(beste.vind) && sky < beste.sky)
      if (bedre) beste = { vind, sky, vindu }
    }
  }
  if (beste === null) return { skivindu: null, skivinduUtenDagslys }

  return {
    skivindu: {
      start: beste.vindu[0].time,
      timer: lengde,
      snittVindMs: beste.vind,
      snittSkydekke: beste.sky,
      etterSnofall: sisteSnofall >= 0,
    },
    skivinduUtenDagslys,
  }
}
