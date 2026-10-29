import { gamleDataTekst } from '../lib/format'

// Story 1.6 (banner-stale-data, UX-DR10): shown on Utforsk and the place page when the whole data file
// is more than 90 min old. It cannot be closed and blocks nothing. No cause is given: the app only sees
// the last published file, not the run that failed.
// The status region is always mounted (empty, taking no space) and only its content changes, so a screen
// reader announces the banner when an open tab passes 90 min; a region inserted with its text often is not.
export default function GamleDataBanner({ generert, naa, vis }: { generert: string; naa: Date; vis: boolean }) {
  return <div role="status">{vis && <div className="banner-stale-data">{gamleDataTekst(generert, naa)}</div>}</div>
}
