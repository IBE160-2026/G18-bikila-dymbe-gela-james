import { useState } from 'react'
import { delpoeng, tall } from '../lib/format'
import { SNOWSCORE, WINDOW_HOURS, computeSnowScore, type SnowScoreResult } from '../lib/snowscore'
import { REGNEEKSEMPEL } from './Regneeksempel'
import ScoreBadge from './ScoreBadge'

// Story 2.4 (FR-10, Bør ha): try your own precipitation and temperature. The calculator only builds the
// hourly input; the score itself always comes from computeSnowScore (AD-6), never from a copy here.

export const NEDBOR_GRENSER = { min: 0, max: 500 } as const
export const TEMPERATUR_GRENSER = { min: -50, max: 30 } as const

type Felt = { verdi: number; feil: null } | { verdi: null; feil: string }

/** Parses a Norwegian number («−2,5», «-2.5», «12»), or explains why it is not a valid value. */
export function lesTall(tekst: string, grenser: { min: number; max: number }, enhet: string): Felt {
  const renset = tekst.trim().replace(',', '.').replace('−', '-')
  // Number('') is 0 and Number('1e2') is 100, so only plain decimals are accepted. «5,» and «,5» are
  // accepted, so no error flashes while the user is typing «5,5».
  if (!/^[-+]?(\d+(\.\d*)?|\.\d+)$/.test(renset)) return { verdi: null, feil: 'Skriv et tall, for eksempel 12 eller −2,5.' }
  const verdi = Number(renset)
  if (verdi < grenser.min || verdi > grenser.max) {
    return { verdi: null, feil: `Velg et tall fra ${tall(grenser.min)} til ${tall(grenser.max)} ${enhet}.` }
  }
  return { verdi, feil: null }
}

/**
 * The window the calculator scores: WINDOW_HOURS hours with the precipitation spread evenly and the same
 * temperature every hour, so S = P · f(T) and T̄ = T.
 */
export function kalkulatorTimer(nedborMm: number, temperaturC: number) {
  return Array.from({ length: WINDOW_HOURS }, () => ({ precipitationMm: nedborMm / WINDOW_HOURS, temperatureC: temperaturC }))
}

export type KalkulatorResultat =
  | { kind: 'score'; resultat: Extract<SnowScoreResult, { kind: 'score' }> }
  | { kind: 'ugyldig'; nedborFeil: string | null; temperaturFeil: string | null }

export function kalkuler(nedborTekst: string, temperaturTekst: string): KalkulatorResultat {
  const nedbor = lesTall(nedborTekst, NEDBOR_GRENSER, 'mm')
  const temperatur = lesTall(temperaturTekst, TEMPERATUR_GRENSER, '°C')
  if (nedbor.verdi === null || temperatur.verdi === null) {
    return { kind: 'ugyldig', nedborFeil: nedbor.feil, temperaturFeil: temperatur.feil }
  }
  const resultat = computeSnowScore(kalkulatorTimer(nedbor.verdi, temperatur.verdi))
  // Every hour has both values, so the module always returns a score here.
  if (resultat.kind !== 'score') throw new Error('Kalkulatoren fikk ufullstendige data')
  return { kind: 'score', resultat }
}

/**
 * The calculator starts at the worked example's total precipitation and mean temperature (as the page shows
 * them, with one decimal), so the two sections can be compared. Computed when called, not at module load.
 */
export function startverdier() {
  const eksempel = computeSnowScore(REGNEEKSEMPEL)
  if (eksempel.kind !== 'score') return { nedbor: '0', temperatur: '0', eksempelScore: null }
  return { nedbor: tall(eksempel.precipitationMm), temperatur: tall(eksempel.meanTemperatureC), eksempelScore: eksempel.score }
}

/**
 * Where the start values come from, and, only when the two computed scores differ, why. The reason is the
 * one thing the calculator does differently: the same temperature every hour, from a rounded mean.
 */
export function sammenligning(nedbor: string, temperatur: string, startScore: number | null, eksempelScore: number | null): string {
  const fra = `Kalkulatoren starter på ${nedbor} mm og ${temperatur} °C, som er nedbøren og snittemperaturen i regneeksempelet over.`
  if (startScore === null || eksempelScore === null || startScore === eksempelScore) return fra
  return (
    `${fra} Den gir likevel SnowScore ${startScore}, mens eksempelet gir ${eksempelScore}, fordi kalkulatoren ` +
    'bruker samme temperatur hver time og en snittemperatur avrundet til én desimal.'
  )
}

function Inndata({
  id,
  etikett,
  verdi,
  feil,
  negativ,
  onChange,
}: {
  id: string
  etikett: string
  verdi: string
  feil: string | null
  /** The iPhone's decimal keypad has no minus sign, so a field that takes negative numbers uses the text one. */
  negativ: boolean
  onChange: (verdi: string) => void
}) {
  return (
    <div className="kalkulator-felt">
      <label htmlFor={id}>{etikett}</label>
      <input
        id={id}
        type="text"
        inputMode={negativ ? 'text' : 'decimal'}
        autoComplete="off"
        value={verdi}
        aria-invalid={feil !== null}
        aria-describedby={feil === null ? undefined : `${id}-feil`}
        onChange={(event) => onChange(event.target.value)}
      />
      {feil !== null && (
        <p id={`${id}-feil`} className="kalkulator-feil">
          {feil}
        </p>
      )}
    </div>
  )
}

export default function Kalkulator() {
  const start = startverdier()
  const [nedbor, setNedbor] = useState(start.nedbor)
  const [temperatur, setTemperatur] = useState(start.temperatur)
  const utregning = kalkuler(nedbor, temperatur)
  const startUtregning = kalkuler(start.nedbor, start.temperatur)
  const startScore = startUtregning.kind === 'score' ? startUtregning.resultat.score : null
  const { maxA, maxB, maxC } = SNOWSCORE

  return (
    <section aria-labelledby="prov-selv">
      <h2 id="prov-selv">Prøv selv</h2>
      <p>
        Kalkulatoren er en læringshjelp. Tallene i kartet, i listen og på stedssidene regnes ut automatisk fra
        prognosen fra Meteorologisk institutt (i demomodus fra innspilte svar), og det du skriver her, endrer dem
        ikke.
      </p>
      <p>
        Skriv inn nedbør og temperatur, så regner vi ut SnowScore med den samme koden som lager tallene i kartet.
        For enkelhets skyld fordeler kalkulatoren nedbøren jevnt over alle {WINDOW_HOURS} timene, med samme
        temperatur hver time. {sammenligning(start.nedbor, start.temperatur, startScore, start.eksempelScore)}
      </p>
      <div className="kalkulator">
        <Inndata
          id="kalkulator-nedbor"
          etikett={`Nedbør i ${WINDOW_HOURS} timer (mm)`}
          verdi={nedbor}
          feil={utregning.kind === 'ugyldig' ? utregning.nedborFeil : null}
          negativ={false}
          onChange={setNedbor}
        />
        <Inndata
          id="kalkulator-temperatur"
          etikett="Snittemperatur (°C)"
          verdi={temperatur}
          feil={utregning.kind === 'ugyldig' ? utregning.temperaturFeil : null}
          negativ
          onChange={setTemperatur}
        />
      </div>
      <div className="kalkulator-resultat">
        {utregning.kind === 'score' && (
          <dl className="sted-tall">
            <div>
              <dt>A Nysnøpotensial</dt>
              <dd>{delpoeng(utregning.resultat.a, maxA)}</dd>
            </div>
            <div>
              <dt>B Kuldebonus</dt>
              <dd>{delpoeng(utregning.resultat.b, maxB)}</dd>
            </div>
            <div>
              <dt>C Snøandel</dt>
              <dd>{delpoeng(utregning.resultat.c, maxC)}</dd>
            </div>
          </dl>
        )}
        {/* Only this line is live, so a screen reader hears the new score, not the whole list on every key. */}
        <p className="kalkulator-sum" aria-live="polite">
          {utregning.kind === 'score' ? (
            <>
              SnowScore: <ScoreBadge snowScore={utregning.resultat} />
            </>
          ) : (
            'Rett verdiene over for å se SnowScore.'
          )}
        </p>
      </div>
    </section>
  )
}
