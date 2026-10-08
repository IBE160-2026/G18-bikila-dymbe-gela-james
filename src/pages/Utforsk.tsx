import type { Sted } from '../../shared/contracts/published'
import KartVisning from '../components/KartVisning'
import ListeVisning from '../components/ListeVisning'
import VisningVeksler from '../components/VisningVeksler'
import type { Visning } from '../lib/router'

// AD-8: one route for map and list; both show the same places from the shared useSteder() store.
export const INGEN_FERSKE = 'Ingen ferske data'
export const INGEN_STEDER = 'Ingen steder har ferske nok data akkurat nå. Last inn siden på nytt for å hente de nyeste dataene.'

type Props = { steder: Sted[]; utdatert: ReadonlySet<string>; visning: Visning }

export default function Utforsk({ steder, utdatert, visning }: Props) {
  return (
    <>
      <h1 className="visually-hidden">Snøforhold i Norge</h1>
      {steder.length > 0 && <VisningVeksler valgt={visning} />}
      {steder.length === 0 ? (
        // EXPERIENCE.md: never an empty surface without an explanation and an action. There is nothing
        // to switch between, so the map/list switch is left out.
        <section className="tom-tilstand" aria-labelledby="tom-overskrift">
          <h2 id="tom-overskrift">{INGEN_FERSKE}</h2>
          <p>{INGEN_STEDER}</p>
          <button type="button" className="knapp" onClick={() => window.location.reload()}>
            Last inn på nytt
          </button>
        </section>
      ) : visning === 'liste' ? (
        <ListeVisning steder={steder} utdatert={utdatert} />
      ) : (
        <KartVisning steder={steder} />
      )}
    </>
  )
}
