import type { Sted as StedData } from '../../shared/contracts/published'
import { SNOWSCORE } from '../../shared/snowscore'
import Lenke from '../components/Lenke'
import ScoreBadge from '../components/ScoreBadge'
import { delpoeng, medEnhet, norskTid, utdatertTekst } from '../lib/format'
import { useEffect } from 'react'
import { href, replace, sted as stedRoute, type UtforskRoute } from '../lib/router'

/** `sok` is the search in the address (Story 3.2b), where «Tilbake» goes when the page was opened directly. */
type Props = { sted: StedData; utdatert: boolean; sok: UtforskRoute }

/** A definition list of label/value pairs; the div wrappers let CSS lay each pair out as one row. */
function Tall({ rader }: { rader: [string, string][] }) {
  return (
    <dl className="tall-liste">
      {rader.map(([navn, verdi]) => (
        <div key={navn}>
          <dt>{navn}</dt>
          <dd>{verdi}</dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * Story 1.9: the full score and what it is built from (FR-16, UJ-1). Incomplete data is text only
 * (ScoreBadge shows «Ufullstendige data») and has no sub-scores, so nothing looks like a real 0.
 */
export default function Sted({ sted, utdatert, sok }: Props) {
  const { snowScore } = sted
  // As on Utforsk (AD-12): a link with invalid or default values is rewritten to the clean address once,
  // so copying it does not share the junk again.
  useEffect(() => {
    const route = stedRoute(sted.id, sok)
    if (href(route, import.meta.env.BASE_URL) !== window.location.pathname + window.location.search) replace(route)
  }, [sted.id, sok])
  const grunnlag: [string, string][] = [
    ['Nysnø neste døgn', medEnhet(sted.nysnoCm, 'cm')],
    ['Temperatur, snitt', medEnhet(sted.temperatur, '°C')],
    ['Vind, maks', medEnhet(sted.vindMaks, 'm/s')],
    ['Skydekke, snitt', medEnhet(sted.skydekke, '%')],
    // Story 3.5: what the sun filter compares with; «–» in the polar night or for a file older than the field.
    ['Skydekke i dagslys', medEnhet(sted.skydekkeDagslys, '%')],
    ['Høyde', medEnhet(sted.hoyde, 'moh.')],
    ['NVE-nysnø siste døgn', medEnhet(sted.nveNysnoSisteDognMm, 'mm')],
  ]

  return (
    <article className="sted">
      <h1 className="sted-navn">{sted.navn}</h1>
      {utdatert && <p className="utdatert">{utdatertTekst(sted.kildeTidspunkt)}</p>}
      <div className="sted-kolonner">
        <section className="sted-kort kort" aria-labelledby="sted-snowscore">
          <h2 id="sted-snowscore">SnowScore</h2>
          <p className="sted-score">
            <ScoreBadge snowScore={snowScore} />
          </p>
          {snowScore.kind === 'score' && (
            <Tall
              rader={[
                ['A Nysnøpotensial', delpoeng(snowScore.a, SNOWSCORE.maxA)],
                ['B Kuldebonus', delpoeng(snowScore.b, SNOWSCORE.maxB)],
                ['C Snøandel', delpoeng(snowScore.c, SNOWSCORE.maxC)],
              ]}
            />
          )}
          <Lenke to={{ name: 'forklaring' }} className="forklaring-lenke">
            Slik beregner vi SnowScore
          </Lenke>
        </section>
        <section className="sted-kort kort" aria-labelledby="sted-grunnlag">
          <h2 id="sted-grunnlag">Grunnlag</h2>
          <Tall rader={grunnlag} />
          <p className="sted-kilde">
            {sted.kildeTidspunkt === null
              ? 'Prognosen fra MET mangler for dette stedet.'
              : `Prognose fra MET, oppdatert ${norskTid(sted.kildeTidspunkt)}`}
          </p>
        </section>
      </div>
      <Lenke to={sok} className="sted-tilbake" tilbake>
        Tilbake
      </Lenke>
    </article>
  )
}
