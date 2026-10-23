import Lenke from '../components/Lenke'
import { utforsk } from '../lib/router'

export default function IkkeFunnet({ melding }: { melding: string }) {
  return (
    <>
      <h1 className="sted-navn">{melding}</h1>
      <Lenke to={utforsk()}>Gå til kartet</Lenke>
    </>
  )
}
