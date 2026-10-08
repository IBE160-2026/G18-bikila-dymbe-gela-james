# Dataordbok

Feltene SnowFinder leser fra de eksterne kildene og feltene i den publiserte datafila. Skjemaene i
denne mappa er fasiten; denne fila forklarer dem (AD-11). Endrer du et skjema, oppdaterer du tabellen
her i samme commit.

Felles regler:

- Alle tidsstempler er UTC i ISO 8601 (`2026-10-07T20:30:29Z`).
- Et svar som bryter skjemaet, avvises i sin helhet og registreres i kjøringsrapporten med sted,
  kilde og årsak. Det rettes aldri automatisk.
- Ukjente felt i kildesvarene ignoreres, fordi MET og NVE legger til felt uten ny versjon. Alle felt
  vi leser, er påkrevde og sjekkes mot gyldig område.
- `npm run data` henter svarene live (`scripts/pipeline/fetch.ts`, krever nett): ett kall per sted og
  kilde, høyst 5 samtidige kall per kilde, 20 s tidsavbrudd og ingen nye forsøk. Et kall som feiler
  (nettverksfeil, tidsavbrudd, HTTP-feil eller svar som ikke er JSON), gir ikke noe svar, og årsaken
  står i kjøringsrapporten, for eksempel `HTTP 503` eller `Tidsavbrudd etter 20 s`. Kjøringen skriver
  `public/data/latest.json` når minst 95 % av stedene har gyldig MET-svar, ellers står forrige fil urørt.

## MET Locationforecast 2.0 compact (`met.ts`)

Kilde: `GET https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=…&lon=…&altitude=…`, med
identifiserende User-Agent.

| Felt | Enhet | Gyldig område | Merknad |
| --- | --- | --- | --- |
| `type` | – | `"Feature"` | |
| `geometry.coordinates` | [lon, lat, m] | tre tall | |
| `properties.meta.updated_at` | ISO 8601 UTC | gyldig tidspunkt | Blir `kildeTidspunkt` i datafila. |
| `properties.meta.units.air_temperature` | – | `"celsius"` | Avvises ved annen enhet. |
| `properties.meta.units.precipitation_amount` | – | `"mm"` | |
| `properties.meta.units.wind_speed` | – | `"m/s"` | |
| `properties.meta.units.cloud_area_fraction` | – | `"%"` | |
| `properties.timeseries[]` | – | minst ett steg, strengt stigende tid | |
| `timeseries[].time` | ISO 8601 UTC | på hel time | |
| `…data.instant.details.air_temperature` | °C | −70 til 50 | Temperatur i timen (Tₕ). |
| `…data.instant.details.wind_speed` | m/s | 0 til 100 | |
| `…data.instant.details.cloud_area_fraction` | % | 0 til 100 | |
| `…data.next_1_hours.details.precipitation_amount` | mm | 0 til 200 | Nedbør i timen (pₕ). `next_1_hours` finnes bare de første 2–3 døgnene; mangler den, regnes timen som manglende. |

## NVE GridTimeSeries, seNorge «nysnø siste døgn» (`nve.ts`)

Kilde: `GET https://gts.nve.no/api/GridTimeSeries/{x}/{y}/{fra}/{til}/fsw.json`. `x` og `y` er
UTM sone 33 (EPSG:25833) i meter, regnet ut fra stedets lat/lon med `shared/geo.ts`. Et punkt uten
rutecelle (for eksempel på sjøen) gir HTTP 400 med `{"Error": …}`, som avvises. Perioden er de seks
døgnene før referansedatoen og selve datoen.

| Felt | Enhet | Gyldig område | Merknad |
| --- | --- | --- | --- |
| `Theme` | – | `"fsw"` | |
| `Unit` | – | `"mm"` | |
| `TimeResolution` | minutter | `1440` | Én verdi per døgn. |
| `NoDataValue` | – | tall (i praksis 255) | Dager med denne verdien blir `null`. |
| `X`, `Y` | m (UTM33) | tall | Rutecellen NVE brukte. |
| `StartDate`, `EndDate` | `dd.MM.yyyy HH:mm:ss` | gyldig dato | Leses som UTC. seNorge-døgnet går fra 06 til 06 UTC. |
| `Data[]` | mm vannekvivalent | 0 til 1000 | Én verdi per døgn fra `StartDate`; antallet må stemme med perioden. |

## Publisert datafil (`published.ts`)

Skrives av `scripts/pipeline/publish.ts` til `public/data/demo.json` (demo) eller
`public/data/latest.json` (live), og leses av `src/lib/data/`.

### `PublishedData`

| Felt | Enhet | Gyldig område | Merknad |
| --- | --- | --- | --- |
| `mode` | – | `"demo"` eller `"live"` | Brukes bare til demobanneret. |
| `referenceTime` | ISO 8601 UTC | | Kjøringens «nå». I demo: nyeste `updated_at` blant MET-fixturene som består skjemaet. |
| `runId` | – | ikke tom | `"demo"` i demo. |
| `generert` | ISO 8601 UTC | | Når fila ble laget. I demo lik `referenceTime`. |
| `report` | – | `RunReport` | Rapporten for kjøringen som laget fila. |
| `steder[]` | – | `Sted` | Ett per sted i katalogen, sortert som katalogen. |

### `Sted`

Katalogfeltene (`id`, `navn`, `lat`, `lon`, `hoyde`, `type`, `kilde`, se `catalog.ts`) og:

| Felt | Enhet | Gyldig område | Merknad |
| --- | --- | --- | --- |
| `kildeTidspunkt` | ISO 8601 UTC | eller `null` | METs `updated_at`. `null` når MET-svaret manglet eller ble avvist. |
| `runId` | – | ikke tom | Kjøringen som laget posten. |
| `snowScore` | – | se under | Resultatet fra `computeSnowScore` over vinduet, uavrundede delpoeng. |
| `nysnoCm` | cm | ≥ 0 eller `null` | S omregnet med `mmToCm`. `null` når resultatet er ufullstendig. |
| `temperatur` | °C | tall eller `null` | T̄ over timene som finnes. `null` når resultatet er ufullstendig. |
| `vindMaks` | m/s | ≥ 0 eller `null` | Høyeste `wind_speed` i vinduet. `null` når ingen time finnes. |
| `skydekke` | % | 0–100 eller `null` | Snitt av `cloud_area_fraction` i vinduet. `null` når ingen time finnes. |
| `nveNysnoSisteDognMm` | mm | ≥ 0 eller `null` | NVEs siste døgnverdi kl. 06 UTC på eller før `referenceTime`. `null` ved `NoDataValue` eller manglende/avvist svar. |

**Vinduet** er de 24 timene fra og med timen som inneholder `referenceTime`. En time mangler når
MET-serien ikke har steget, eller steget mangler `next_1_hours`. Mangler mer enn 10 % av timene, er
`snowScore` `{ "kind": "incomplete", "missingShare": … }` uten tall. Et sted der MET-svaret manglet
eller ble avvist, får `missingShare: 1`, og ingen verdier fra tidligere kjøringer.

`snowScore` er enten `{ kind: "score", score (heltall 0–100), a (0–60), b (0–25), c (0–15),
newSnowMm, precipitationMm, meanTemperatureC }` eller `{ kind: "incomplete", missingShare (0–1) }`.

### `RunReport`

| Felt | Enhet | Gyldig område | Merknad |
| --- | --- | --- | --- |
| `runId`, `mode` | – | | Som i datafila. |
| `start` | ISO 8601 UTC | | Når kjøringen startet. I demo lik `referenceTime`. |
| `varighetMs` | ms | heltall ≥ 0 | 0 i demo. |
| `antallSteder` | – | heltall ≥ 0 | Steder i katalogen. |
| `andelGyldige` | andel | 0–1 | Steder med gyldig MET-svar. Ufullstendige steder teller som gyldige; NVE teller ikke, fordi SnowScore bare bygger på MET. Under 0,95 publiseres ingenting. |
| `avvistePerKilde` | – | `{ met, nve }` | Antall avviste eller manglende svar per kilde. |
| `antallUfullstendige` | – | heltall ≥ 0 | Steder med gyldig MET-svar der mer enn 10 % av timene mangler (`snowScore.kind = "incomplete"`). Steder med avvist eller manglende MET-svar vises også som ufullstendige i datafila, men telles i `avvistePerKilde`, ikke her. |
| `publisert` | – | boolsk | |
| `ikkePublisertFordi` | – | tekst eller `null` | Årsaken når kjøringen ikke ble publisert. |
| `avviste[]` | – | `{ stedId, kilde, arsak }` | Hvert avviste eller manglende svar. Årsaken er skjemafeilen, feilen fra kallet (live), eller `Mangler svar`. |
