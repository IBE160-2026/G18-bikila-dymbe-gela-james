import type { Sted } from '../../shared/contracts/published'
import ForklaringIllustrasjon from '../components/ForklaringIllustrasjon'
import Regneeksempel from '../components/Regneeksempel'
import ScoreBadge from '../components/ScoreBadge'
import { medEnhet, tall } from '../lib/format'
import { TIERS } from '../lib/scoreTier'
import { SNOWSCORE, SNOWSCORE_VERSION, WINDOW_HOURS } from '../lib/snowscore'

// Story 2.1 (FR-8): what SnowScore measures and how it is computed. Every number on the page comes from
// SNOWSCORE, WINDOW_HOURS and the tier bounds, never written by hand (AD-6). The page needs no data.

const {
  maxA,
  maxB,
  maxC,
  fullSnowMm,
  allSnowAtOrBelowC,
  noSnowAtOrAboveC,
  coldRangeC,
  minPrecipitationMm,
  maxMissingShare,
  cmPerMm,
} = SNOWSCORE

type Endring = { versjon: string; endring: string; begrunnelse: string }

/**
 * Newest first. Add a row, and bump SNOWSCORE_VERSION, every time a SNOWSCORE parameter changes.
 * Each row is a record of what changed then, so its numbers are written out and never read from SNOWSCORE.
 */
export const ENDRINGSLOGG: readonly Endring[] = [
  {
    versjon: '1.0',
    endring: 'Nevneren i B (Kuldebonus) endret fra 6 til 16.',
    begrunnelse:
      'Full kuldebonus kommer først ved T̄ ≈ −14 °C i stedet for −4 °C. Da skiller B mellom «akkurat kaldt nok» ' +
      'og «arktisk kaldt», i stedet for at nesten alle norske vintersteder får full poengsum.',
  },
]

/** A computed score to show a tier's badge with; only `score` matters to ScoreBadge. */
function eksempel(score: number): Sted['snowScore'] {
  return { kind: 'score', score, a: 0, b: 0, c: 0, newSnowMm: 0, precipitationMm: 0, meanTemperatureC: 0 }
}

/** «70 til 100», «45 til 69» …, from the tier bounds in scoreTier.ts (highest tier first). */
function trinnSpenn(index: number): string {
  const ovre = index === 0 ? maxA + maxB + maxC : TIERS[index - 1].min - 1
  return `${TIERS[index].min} til ${ovre}`
}

function Formel({ children }: { children: string }) {
  return <p className="formel">{children}</p>
}

export default function SlikBeregnerViSnowScore() {
  const maksSum = maxA + maxB + maxC
  const kaldest = noSnowAtOrAboveC - coldRangeC
  const minP = medEnhet(minPrecipitationMm, 'mm')

  return (
    <article className="forklaring">
      <h1 className="forklaring-tittel">Slik beregner vi SnowScore</h1>

      <section aria-labelledby="kort-fortalt">
        <h2 id="kort-fortalt">Kort fortalt</h2>
        <p>
          SnowScore er et tall fra 0 til {maksSum} som sier hvor gode snøforholdene ser ut til å bli på et sted de
          neste {WINDOW_HOURS} timene, regnet ut fra værprognosen for nedbør og temperatur.
        </p>
        <p>
          Tallet måler tre ting: hvor mye nysnø som ventes, hvor kaldt det blir, og hvor stor del av nedbøren som
          kommer som snø.
        </p>
        <p>
          Det måler ikke snødybden som ligger der fra før, føret, vinden eller skredfaren, og det er en prognose,
          ikke en garanti for snø.
        </p>
      </section>

      <section aria-labelledby="steg-for-steg">
        <h2 id="steg-for-steg">Steg for steg</h2>
        <p>
          Vi ser på prognosen for hver time de neste {WINDOW_HOURS} timene og regner ut tre delpoeng: A Nysnøpotensial
          (opptil {maxA} poeng), B Kuldebonus (opptil {maxB} poeng) og C Snøandel (opptil {maxC} poeng).
        </p>

        <h3>1. Hvor mye av nedbøren som kommer som snø</h3>
        <p>
          For hver time regner vi ut snøandelen f(T) fra temperaturen T. Ved {medEnhet(allSnowAtOrBelowC, '°C')} eller
          kaldere kommer all nedbør som snø, ved {medEnhet(noSnowAtOrAboveC, '°C')} eller varmere kommer ingen, og
          mellom de to øker andelen jevnt.
        </p>
        <Formel>{`f(T) = min(1, max(0, (${tall(noSnowAtOrAboveC)} − T) / ${tall(noSnowAtOrAboveC - allSnowAtOrBelowC)}))`}</Formel>

        <h3>2. Nysnø, nedbør og temperatur for alle {WINDOW_HOURS} timene</h3>
        <ul>
          <li>
            <strong>S</strong> (nysnø) er summen av nedbøren hver time ganget med f(T) samme time, i mm vann.
          </li>
          <li>
            <strong>P</strong> er all nedbør i vinduet, i mm.
          </li>
          <li>
            <strong>T̄</strong> er snittet av temperaturen time for time, i °C.
          </li>
        </ul>
        <p>
          1 mm vann tilsvarer omtrent {tall(cmPerMm)} cm snø, så S i mm er også omtrent nysnø i cm.
        </p>
        <Formel>S = Σ nedbør × f(T)</Formel>

        <h3>3. A Nysnøpotensial</h3>
        <p>
          A gir poeng for mengden nysnø. Poengene øker jevnt til full poengsum ved {medEnhet(fullSnowMm, 'mm')} nysnø.
        </p>
        <Formel>{`A = ${maxA} · min(1, S / ${tall(fullSnowMm)})`}</Formel>
        <ForklaringIllustrasjon delpoeng="A" />

        <h3>4. B Kuldebonus</h3>
        <p>
          B gir poeng for kulde. Ved en snittemperatur på {medEnhet(noSnowAtOrAboveC, '°C')} eller varmere er B 0, og
          full poengsum kommer ved {medEnhet(kaldest, '°C')} eller kaldere.
        </p>
        <Formel>{`B = ${maxB} · min(1, max(0, (${tall(noSnowAtOrAboveC)} − T̄) / ${tall(coldRangeC)}))`}</Formel>
        <ForklaringIllustrasjon delpoeng="B" />

        <h3>5. C Snøandel</h3>
        <p>C gir poeng for hvor stor del av nedbøren som kommer som snø og ikke som regn.</p>
        <Formel>{`C = ${maxC} · S / P`}</Formel>
        <ForklaringIllustrasjon delpoeng="C" />

        <h3>6. Summen</h3>
        <Formel>SnowScore = A + B + C, avrundet til nærmeste hele tall</Formel>
        <p>
          Kommer det mindre enn {minP} nedbør til sammen i de {WINDOW_HOURS} timene, er B og C alltid 0. En kald,
          tørr dag skal ikke få høy score bare fordi det er kaldt.
        </p>
        <p>
          Mangler prognosen mer enn {tall(maxMissingShare * 100)} % av timene, regner vi ikke ut noen score. Da står
          det <ScoreBadge snowScore={{ kind: 'incomplete', missingShare: 1 }} /> i stedet for et tall.
        </p>

        <h3>Hva tallet betyr</h3>
        <p>Hver score vises med både tall og ord, i fire trinn:</p>
        <ul className="forklaring-trinn">
          {TIERS.map(({ min, info }, index) => (
            <li key={info.tier}>
              <ScoreBadge snowScore={eksempel(min)} /> betyr en score fra {trinnSpenn(index)}
            </li>
          ))}
        </ul>
      </section>

      <Regneeksempel />

      <section aria-labelledby="endringslogg">
        <h2 id="endringslogg">Endringslogg</h2>
        <p>Hver endring i parameterne i formelen får en ny versjon her, med begrunnelse.</p>
        <div className="forklaring-tabell">
          <table>
            <caption className="visually-hidden">Endringer i SnowScore-formelen, nyeste først</caption>
            <thead>
              <tr>
                <th scope="col">Versjon</th>
                <th scope="col">Endring</th>
                <th scope="col">Begrunnelse</th>
              </tr>
            </thead>
            <tbody>
              {ENDRINGSLOGG.map(({ versjon, endring, begrunnelse }) => (
                <tr key={versjon}>
                  <th scope="row">{versjon}</th>
                  <td>{endring}</td>
                  <td>{begrunnelse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="forklaring-versjon">Gjeldende versjon: {SNOWSCORE_VERSION}</p>
      </section>
    </article>
  )
}
