import type { Sted as StedData } from '../../shared/contracts/published'
import { SNOWSCORE } from '../../shared/snowscore'
import Lenke from '../components/Lenke'
import ScoreBadge from '../components/ScoreBadge'
import { delpoeng, medEnhet, norskTid, utdatertTekst } from '../lib/format'

type Props = { sted: StedData; utdatert: boolean }

/** A definition list of label/value pairs; the div wrappers let CSS lay each pair out as one row. */
function Tall({ rader }: { rader: [string, string][] }) {
  return (
    <dl className="sted-tall">
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
export default function Sted({ sted, utdatert }: Props) {
  const { snowScore } = sted
  const grunnlag: [string, string][] = [
    ['Nysnø neste døgn', medEnhet(sted.nysnoCm, 'cm')],
    ['Temperatur, snitt', medEnhet(sted.temperatur, '°C')],
    ['Vind, maks', medEnhet(sted.vindMaks, 'm/s')],
    ['Skydekke, snitt', medEnhet(sted.skydekke, '%')],
    ['Høyde', medEnhet(sted.hoyde, 'moh.')],
    ['NVE-nysnø siste døgn', medEnhet(sted.nveNysnoSisteDognMm, 'mm')],
  ]

  return (
    <article className="sted">
      <h1 className="sted-navn">{sted.navn}</h1>
      {utdatert && <p className="utdatert">{utdatertTekst(sted.kildeTidspunkt)}</p>}
      <div className="sted-kolonner">
        <section className="sted-kort" aria-labelledby="sted-snowscore">
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
        </section>
        <section className="sted-kort" aria-labelledby="sted-grunnlag">
          <h2 id="sted-grunnlag">Grunnlag</h2>
          <Tall rader={grunnlag} />
          <p className="sted-kilde">
            {sted.kildeTidspunkt === null
              ? 'Prognosen fra MET mangler for dette stedet.'
              : `Prognose fra MET, oppdatert ${norskTid(sted.kildeTidspunkt)}`}
          </p>
        </section>
      </div>
      <Lenke to={{ name: 'utforsk', visning: 'kart' }} tilbake>
        Tilbake
      </Lenke>
    </article>
  )
}
