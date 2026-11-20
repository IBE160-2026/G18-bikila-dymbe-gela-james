import { INCOMPLETE_LABEL, TIERS } from '../lib/scoreTier'

/** «70–100 Svært godt», …, «0–19 Lite»: each tier runs from its own minimum to one below the next tier's. */
export function tegnforklaringRader(): { tier: number; tekst: string }[] {
  return TIERS.map(({ min, info }, i) => {
    const maks = i === 0 ? 100 : TIERS[i - 1].min - 1
    return { tier: info.tier, tekst: `${min}–${maks} ${info.label}` }
  })
}

/**
 * FR-12, SRS-F-15, EXPERIENCE.md: the map's colour legend. The bounds come from TIERS, so they live in one
 * place. Each tier has its range and label as text, so the colour is never alone, and incomplete data has
 * the same hollow dashed ring as its marker. Shown as a strip above the map (review 2026-11-18).
 */
export default function Tegnforklaring() {
  return (
    <ul className="tegnforklaring" aria-label="Fargeforklaring">
      {tegnforklaringRader().map(({ tier, tekst }) => (
        <li key={tier}>
          <span className={`tegnforklaring-prikk tegnforklaring-prikk--${tier}`} aria-hidden="true" />
          {tekst}
        </li>
      ))}
      <li>
        <span className="tegnforklaring-prikk tegnforklaring-prikk--ufullstendig" aria-hidden="true" />
        {INCOMPLETE_LABEL}
      </li>
    </ul>
  )
}
