import type { Sted } from '../../shared/contracts/published'
import KartVisning from '../components/KartVisning'

export default function Utforsk({ steder }: { steder: Sted[] }) {
  return (
    <>
      <h1 className="visually-hidden">Snøforhold i Norge</h1>
      <KartVisning steder={steder} />
    </>
  )
}
