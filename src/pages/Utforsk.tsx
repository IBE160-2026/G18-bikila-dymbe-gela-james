import type { Sted } from '../../shared/contracts/published'
import KartVisning from '../components/KartVisning'
import ListeVisning from '../components/ListeVisning'
import VisningVeksler from '../components/VisningVeksler'
import type { Visning } from '../lib/router'

// AD-8: one route for map and list; both get the same places from App's single useSteder().
type Props = { steder: Sted[]; utdatert: ReadonlySet<string>; visning: Visning }

export default function Utforsk({ steder, utdatert, visning }: Props) {
  return (
    <>
      <h1 className="visually-hidden">Snøforhold i Norge</h1>
      <VisningVeksler valgt={visning} />
      {visning === 'liste' ? <ListeVisning steder={steder} utdatert={utdatert} /> : <KartVisning steder={steder} />}
    </>
  )
}
