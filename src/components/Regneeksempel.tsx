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

// Only for the note under B: the example shows one decimal, but B is computed from the exact T̄.
const treDesimalerFormat = new Intl.NumberFormat('nb-NO', { minimumFractionDigits: 3, maximumFractionDigits: 3 })

/** «a + b + c», with a negative term written as «− 3» after the first one. */
function sum(verdier: readonly number[]): string {
  return verdier.map((verdi, i) => (i === 0 ? tall(verdi) : `${verdi < 0 ? '−' : '+'} ${tall(Math.abs(verdi))}`)).join(' ')
}

/** A value inside a formula, in parentheses when negative so «2 − (−2,3)» reads right. */
function iFormel(verdi: number): string {
  return verdi < 0 ? `(${tall(verdi)})` : tall(verdi)
}

/** What the table's f(T) column says, read from its own values so the text cannot contradict the table. */
export function snoandelSetning(andeler: readonly number[], allSnowAtOrBelowC: number): string {
  return andeler.every((andel) => andel === 1)
    ? `Alle timene er ${tall(allSnowAtOrBelowC)} °C eller kaldere, så f(T) er 1 hver time, og all nedbøren blir nysnø.`
    : `Noen av timene er varmere enn ${tall(allSnowAtOrBelowC)} °C, så der blir bare en del av nedbøren nysnø.`
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
      <div className="forklaring-tabell" tabIndex={0} role="region" aria-labelledby="regneeksempel-tabell">
        <table>
          <caption id="regneeksempel-tabell" className="visually-hidden">
            Timesverdier i regneeksempelet
          </caption>
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col" className="tall-celle">Nedbør (mm)</th>
              {/* Abbreviated so the five columns fit a 375px phone also in wider (Linux) fonts. */}
              <th scope="col" className="tall-celle">
                <abbr title="Temperatur">Temp.</abbr> (°C)
              </th>
              <th scope="col" className="tall-celle">f(T)</th>
              <th scope="col" className="tall-celle">Nysnø (mm)</th>
            </tr>
          </thead>
          <tbody>
            {timer.map(({ precipitationMm, temperatureC, andel, nysno }, i) => (
              <tr key={i}>
                <th scope="row">{i + 1}</th>
                <td className="tall-celle">{tall(precipitationMm)}</td>
                <td className="tall-celle">{tall(temperatureC)}</td>
                <td className="tall-celle">{tall(andel)}</td>
                <td className="tall-celle">{tall(nysno)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        {snoandelSetning(timer.map(({ andel }) => andel), allSnowAtOrBelowC)} Hadde en time vært {tall(halvveis)} °C, ville f(T) vært {tall(snowFraction(halvveis))}, og bare halvparten av
        nedbøren den timen ville telt som nysnø.
      </p>

      <h3>S, P og T̄</h3>
      <Formel>{`S = ${sum(timer.map(({ nysno }) => nysno))} = ${tall(S)} mm`}</Formel>
      <Formel>{`P = ${sum(timer.map(({ precipitationMm }) => precipitationMm))} = ${tall(P)} mm`}</Formel>
      <Formel>{`T̄ = (${sum(timer.map(({ temperatureC }) => temperatureC))}) / ${timer.length} = ${tall(T)} °C`}</Formel>

      <h3>Delpoengene</h3>
      <Formel>{`A = ${maxA} · min(1, ${tall(S)} / ${tall(fullSnowMm)}) = ${tall(a)}`}</Formel>
      <Formel>{`B = ${maxB} · min(1, max(0, (${tall(noSnowAtOrAboveC)} − ${iFormel(T)}) / ${tall(coldRangeC)})) = ${tall(b)}`}</Formel>
      <p>
        B regnes med den nøyaktige snittemperaturen, {treDesimalerFormat.format(T)} … °C, ikke med den avrundede
        {` ${tall(T)}`} °C. Regner du etter med {tall(T)} °C, får du derfor et litt annet svar på andre desimal.
      </p>
      <Formel>{`C = ${maxC} · ${tall(S)} / ${tall(P)} = ${tall(c)}`}</Formel>

      <h3>Summen</h3>
      <Formel>{`SnowScore = ${tall(a)} + ${tall(b)} + ${tall(c)} = ${tall(a + b + c)}, avrundet til ${score}`}</Formel>
      <p>
        Tallene står med én desimal, men summen regnes med de nøyaktige verdiene før den avrundes til et helt tall.
        Et sted med disse timene ville fått SnowScore {score}.
      </p>
    </section>
  )
}
