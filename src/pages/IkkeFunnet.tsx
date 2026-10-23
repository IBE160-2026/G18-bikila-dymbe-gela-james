import Lenke from '../components/Lenke'
import { utforsk, type UtforskRoute } from '../lib/router'

/** `sok` is the search a place link carried (Story 3.2b), so «Gå til kartet» keeps it; else the plain map. */
export default function IkkeFunnet({ melding, sok = utforsk() }: { melding: string; sok?: UtforskRoute }) {
  return (
    <>
      <h1 className="sted-navn">{melding}</h1>
      <Lenke to={sok}>Gå til kartet</Lenke>
    </>
  )
}
