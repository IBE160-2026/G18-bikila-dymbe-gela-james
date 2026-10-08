import type { Sted } from '../../shared/contracts/published'
import KartVisning from '../components/KartVisning'
import ListeVisning from '../components/ListeVisning'
import VisningVeksler from '../components/VisningVeksler'
import type { Visning } from '../lib/router'

// AD-8: one route for map and list; both get the same places from App's single useSteder().
export default function Utforsk({ steder, visning }: { steder: Sted[]; visning: Visning }) {
  return (
    <>
      <h1 className="visually-hidden">Snøforhold i Norge</h1>
      <VisningVeksler valgt={visning} />
      {visning === 'liste' ? <ListeVisning steder={steder} /> : <KartVisning steder={steder} />}
    </>
  )
}
