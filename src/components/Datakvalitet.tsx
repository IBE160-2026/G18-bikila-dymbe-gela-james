import type { StederResult } from '../hooks/useSteder'
import { norskTid } from '../lib/format'

// Story 2.3 (NFR-DQ2): the last published run's quality report in plain words. It reads the data the app
// already loaded (AD-8); in demo mode it describes the demo data set instead. Plain numbers, no colours.

export const KVALITET_LASTER = 'Henter kvalitetsrapporten for siste kjøring …'
export const KVALITET_FEIL = 'Kvalitetsrapporten kunne ikke lastes. Last inn siden på nytt for å prøve igjen.'

/** «1 sted», «24 steder». */
function steder(antall: number): string {
  return `${antall} ${antall === 1 ? 'sted' : 'steder'}`
}

/** The report as sentences, so the panel reads the same on screen and in a screen reader. */
export function kvalitetLinjer(result: StederResult | null): string[] {
  if (result === null) return [KVALITET_LASTER]
  if (result.status === 'error') return [KVALITET_FEIL]
  const { report, generert, mode } = result.data
  const { antallSteder, antallUfullstendige, avvistePerKilde } = report
  const ufullstendige =
    antallUfullstendige === 0
      ? 'Ingen steder har ufullstendige data.'
      : `${steder(antallUfullstendige)} har ufullstendige data og vises uten poengsum.`
  if (mode === 'demo') {
    return [
      'Du ser demodata: innspilte svar fra MET og NVE, ikke ferske prognoser.',
      `Datasettet ble bygget ${norskTid(generert)} og har ${steder(antallSteder)}.`,
      ufullstendige,
    ]
  }
  // The contract counts incomplete places as valid (their MET answer was valid but had too many gaps),
  // so the text says they are part of the valid ones instead of listing them as a separate group.
  const gyldige = Math.round(report.andelGyldige * antallSteder)
  const avviste = avvistePerKilde.met + avvistePerKilde.nve
  return [
    `Siste publiserte kjøring: ${norskTid(generert)}.`,
    `${gyldige} av ${steder(antallSteder)} hadde gyldige data fra MET.`,
    avviste === 0
      ? 'Ingen svar fra MET eller NVE ble avvist.'
      : `Avviste svar: ${avvistePerKilde.met} fra MET og ${avvistePerKilde.nve} fra NVE.`,
    antallUfullstendige === 0
      ? ufullstendige
      : `${steder(antallUfullstendige)} av de gyldige har ufullstendige data og vises uten poengsum.`,
  ]
}

export default function Datakvalitet({ result }: { result: StederResult | null }) {
  return (
    <section aria-labelledby="datakvalitet">
      <h2 id="datakvalitet">Datakvalitet</h2>
      {/* A status region, so the text is read out when the report arrives after the page has opened. */}
      <div className="datakvalitet" role="status">
        {kvalitetLinjer(result).map((linje) => (
          <p key={linje}>{linje}</p>
        ))}
      </div>
    </section>
  )
}
