import { delpoeng } from '../lib/format'
import { SNOWSCORE } from '../lib/snowscore'

// Story 2.5 (FR-16, UX step 3): A, B and C with a grey bar each, filled against the sub-score's own
// maximum. The one list for the SnowScore card, the worked example and the calculator.

/** How full a sub-score's bar is, in percent of its maximum, clamped to 0–100. */
export function fyllProsent(verdi: number, maks: number): number {
  if (!(maks > 0) || !Number.isFinite(verdi)) return 0
  return Math.min(100, Math.max(0, (verdi / maks) * 100))
}

type Props = { a: number; b: number; c: number }

export default function Delpoengliste({ a, b, c }: Props) {
  const rader: [string, number, number][] = [
    ['A Nysnøpotensial', a, SNOWSCORE.maxA],
    ['B Kuldebonus', b, SNOWSCORE.maxB],
    ['C Snøandel', c, SNOWSCORE.maxC],
  ]
  return (
    <dl className="tall-liste">
      {rader.map(([navn, verdi, maks]) => (
        <div key={navn}>
          <dt>{navn}</dt>
          <dd className="delpoeng-verdi">
            {/* Decorative: the text after it carries the number, so a screen reader hears the same as before. */}
            <span className="delpoeng-stolpe" aria-hidden="true">
              <span style={{ width: `${fyllProsent(verdi, maks)}%` }} />
            </span>
            {delpoeng(verdi, maks)}
          </dd>
        </div>
      ))}
    </dl>
  )
}
