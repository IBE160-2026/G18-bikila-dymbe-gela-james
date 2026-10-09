import { tall } from '../lib/format'
import { SNOWSCORE, WINDOW_HOURS, computeSnowScore, snowFraction } from '../lib/snowscore'

// Story 2.2 (FR-9): the brief's worked example, from hourly values to the final score. Every number is
// computed by the shared module, so the example cannot drift from the formula (AD-6).

/**
 * The brief's 6-hour window. The only copy in the app; Regneeksempel.test.tsx checks it equals the
 * «Briefens eksempel» case in tests/golden/snowscore.json.
 */
export const REGNEEKSEMPEL: readonly { precipitationMm: number; temperatureC: number }[] = [
  { precipitationMm: 1, temperatureC: -1 },
  { precipitationMm: 3, temperatureC: -3 },
  { precipitationMm: 4, temperatureC: -4 },
  { precipitationMm: 3, temperatureC: -3 },
  { precipitationMm: 1, temperatureC: -2 },
  { precipitationMm: 0, temperatureC: -1 },
]

const toDesimalerFormat = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 2 })

/**
 * Two decimals, so a reader can redo each step by hand: with T̄ as −2,3, B would come out as 6,7, but the
 * module's −2,333… gives 6,77.
 */
function presis(verdi: number): string {
  return toDesimalerFormat.format(Math.round(verdi * 100) / 100 + 0)
}

/** «a + b + c», with a negative term written as «− 3» after the first one. */
function sum(verdier: readonly number[]): string {
  return verdier.map((verdi, i) => (i === 0 ? presis(verdi) : `${verdi < 0 ? '−' : '+'} ${presis(Math.abs(verdi))}`)).join(' ')
}

/** A value inside a formula, in parentheses when negative so «2 − (−2,33)» reads right. */
function iFormel(verdi: number): string {
  return verdi < 0 ? `(${presis(verdi)})` : presis(verdi)
}

function Formel({ children }: { children: string }) {
  return <p className="formel">{children}</p>
}

/** Each hour with its snow fraction f(T) and the new snow it adds, p × f(T). */
export function timerMedSnoandel() {
  return REGNEEKSEMPEL.map((time) => {
    const andel = snowFraction(time.temperatureC)
    return { ...time, andel, nysno: time.precipitationMm * andel }
  })
}

export default function Regneeksempel() {
  const resultat = computeSnowScore(REGNEEKSEMPEL)
  // The example has no missing hours, so this cannot happen; fail loudly rather than show wrong numbers.
  if (resultat.kind !== 'score') throw new Error('Regneeksempelet mangler timer')
  const { a, b, c, score, newSnowMm: S, precipitationMm: P, meanTemperatureC: T } = resultat
  const { maxA, maxB, maxC, fullSnowMm, allSnowAtOrBelowC, noSnowAtOrAboveC, coldRangeC } = SNOWSCORE
  const timer = timerMedSnoandel()
  const halvveis = (allSnowAtOrBelowC + noSnowAtOrAboveC) / 2

  return (
    <section aria-labelledby="regneeksempel">
      <h2 id="regneeksempel">Regneeksempel</h2>
      <p>
        En ekte SnowScore regnes over {WINDOW_HOURS} timer. For at eksempelet skal være lett å regne etter, bruker vi
        her et kortere vindu på {REGNEEKSEMPEL.length} timer. Tabellen viser nedbør og temperatur time for time,
        snøandelen f(T) og hvor mye av nedbøren som blir nysnø.
      </p>
      <div className="forklaring-tabell regneeksempel-tabell">
        <table>
          <caption className="visually-hidden">Timesverdier i regneeksempelet</caption>
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col" className="tall-celle">Nedbør (mm)</th>
              <th scope="col" className="tall-celle">Temperatur (°C)</th>
              <th scope="col" className="tall-celle">f(T)</th>
              <th scope="col" className="tall-celle">Nysnø (mm)</th>
            </tr>
          </thead>
          <tbody>
            {timer.map(({ precipitationMm, temperatureC, andel, nysno }, i) => (
              <tr key={i}>
                <th scope="row">{i + 1}</th>
                <td className="tall-celle">{presis(precipitationMm)}</td>
                <td className="tall-celle">{presis(temperatureC)}</td>
                <td className="tall-celle">{presis(andel)}</td>
                <td className="tall-celle">{presis(nysno)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Alle timene er {tall(allSnowAtOrBelowC)} °C eller kaldere, så f(T) er 1 hver time, og all nedbøren blir nysnø.
        Hadde en time vært {tall(halvveis)} °C, ville f(T) vært {tall(snowFraction(halvveis))}, og bare halvparten av
        nedbøren den timen ville telt som nysnø.
      </p>

      <h3>S, P og T̄</h3>
      <Formel>{`S = ${sum(timer.map(({ nysno }) => nysno))} = ${presis(S)} mm`}</Formel>
      <Formel>{`P = ${sum(timer.map(({ precipitationMm }) => precipitationMm))} = ${presis(P)} mm`}</Formel>
      <Formel>{`T̄ = (${sum(timer.map(({ temperatureC }) => temperatureC))}) / ${timer.length} = ${presis(T)} °C`}</Formel>

      <h3>Delpoengene</h3>
      <Formel>{`A = ${maxA} · min(1, ${presis(S)} / ${tall(fullSnowMm)}) = ${presis(a)}`}</Formel>
      <Formel>{`B = ${maxB} · min(1, max(0, (${tall(noSnowAtOrAboveC)} − ${iFormel(T)}) / ${tall(coldRangeC)})) = ${presis(b)}`}</Formel>
      <Formel>{`C = ${maxC} · ${presis(S)} / ${presis(P)} = ${presis(c)}`}</Formel>

      <h3>Summen</h3>
      <Formel>{`SnowScore = ${presis(a)} + ${presis(b)} + ${presis(c)} = ${presis(a + b + c)}, avrundet til ${score}`}</Formel>
      <p>
        Tallene står med to desimaler, men summen regnes med de nøyaktige verdiene før den avrundes til et helt tall.
        Et sted med disse timene ville fått SnowScore {score}.
      </p>
    </section>
  )
}
