import type { Sted } from '../../shared/contracts/published'
import KartVisning from '../components/KartVisning'
import ListeVisning from '../components/ListeVisning'
import VisningVeksler from '../components/VisningVeksler'
import type { Visning } from '../lib/router'

// AD-8: one route for map and list; both get the same places from App's single useSteder().
export const INGEN_STEDER = 'Ingen steder har ferske nok data akkurat nå. Last inn siden på nytt for å hente de nyeste dataene.'

type Props = { steder: Sted[]; utdatert: ReadonlySet<string>; visning: Visning }

export default function Utforsk({ steder, utdatert, visning }: Props) {
  return (
    <>
      <h1 className="visually-hidden">Snøforhold i Norge</h1>
      <VisningVeksler valgt={visning} />
      {steder.length === 0 ? (
        // EXPERIENCE.md: never an empty surface without an explanation (e.g. every place older than 12 h).
        <div className="tom-tilstand" role="status">
          <p>{INGEN_STEDER}</p>
          <button type="button" className="knapp" onClick={() => window.location.reload()}>
            Last inn på nytt
          </button>
        </div>
      ) : visning === 'liste' ? (
        <ListeVisning steder={steder} utdatert={utdatert} />
      ) : (
        <KartVisning steder={steder} />
      )}
    </>
  )
}
