// Story 2.3 (FR-11): where the data comes from, under which licence, and what SnowScore is not.

export const VARSOM_URL = 'https://www.varsom.no/'

const KILDER: readonly { navn: string; url: string; bruk: string; lisens: string; lisensUrl: string }[] = [
  {
    navn: 'MET Norway (Meteorologisk institutt), Locationforecast',
    url: 'https://api.met.no/',
    bruk: 'værprognosen time for time: nedbør, temperatur, vind og skydekke',
    lisens: 'CC BY 4.0',
    lisensUrl: 'https://api.met.no/doc/License',
  },
  {
    navn: 'NVE seNorge',
    url: 'https://www.senorge.no/',
    bruk: 'nysnø siste døgn, vist på stedssiden',
    lisens: 'NLOD',
    lisensUrl: 'https://data.norge.no/nlod/no/2.0',
  },
  {
    navn: 'Kartverket',
    url: 'https://www.kartverket.no/',
    bruk: 'bakgrunnskartet og navn på fjelltopper og tettsteder i stedskatalogen',
    lisens: 'CC BY 4.0',
    lisensUrl: 'https://creativecommons.org/licenses/by/4.0/',
  },
  {
    navn: 'OpenStreetMap',
    url: 'https://www.openstreetmap.org/',
    bruk: 'skianlegg og langrennsarenaer i stedskatalogen, © OpenStreetMap contributors',
    lisens: 'ODbL',
    lisensUrl: 'https://opendatacommons.org/licenses/odbl/',
  },
]

export default function Datakilder() {
  return (
    <section aria-labelledby="datakilder">
      <h2 id="datakilder">Datakilder og begrensninger</h2>
      <ul className="forklaring-kilder">
        {KILDER.map(({ navn, url, bruk, lisens, lisensUrl }) => (
          <li key={navn}>
            <a href={url}>{navn}</a>: {bruk}. Lisens: <a href={lisensUrl}>{lisens}</a>.
          </li>
        ))}
      </ul>
      <p>
        SnowScore er en prognose og en modell. Tallet regnes ut fra værvarselet og er verken målt snø eller en garanti
        for snø. Varselet kan bomme, og forholdene på stedet kan være annerledes enn modellen tror.
      </p>
      <p>
        SnowFinder er ikke en skredfarevurdering og sier ingenting om hvor trygt det er å ferdes. Skal du til fjells,
        sjekk skredvarselet på <a href={VARSOM_URL}>Varsom.no</a>.
      </p>
    </section>
  )
}
