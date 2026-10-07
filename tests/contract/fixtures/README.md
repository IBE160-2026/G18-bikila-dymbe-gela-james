# Fixtures for demo og kontraktstester

Denne mappa er kilden til demodataene (`npm run data:demo` → `public/data/demo.json`) og til
kontraktstestene i `tests/contract/`. Ingenting her hentes fra nettet når testene eller demoen
kjører.

## Innhold

- `demo-catalog.json`: demokatalogen. 24 steder kopiert uendret fra `data/catalog.json`: 8 skisteder,
  8 fjelltopper og 8 byer, spredt fra Sirdal og Stavanger i sør til Kirkenes i nordøst.
- `met/<id>.json`: ett ekte MET Locationforecast 2.0 compact-svar per sted.
- `nve/<id>.json`: ett ekte NVE GridTimeSeries-svar for `fsw` (nysnø siste døgn) per sted, for de
  siste sju dagene før opptaket.

Svarene ble tatt opp 2026-10-07 rundt kl. 20:30 UTC med `npm run fixtures:record`
(`tests/contract/record-fixtures.ts`). Skriptet godtar bare svar som består skjemaene i
`shared/contracts/`, og lagrer råsvaret med alle felt.

## Endringer etter opptaket

Skriptet gjør to endringer, slik at demoen har ett ufullstendig og ett utdatert sted. Alle andre
filer er uendret.

| Sted | Endring | Hvorfor |
| --- | --- | --- |
| `trondheim` (`met/trondheim.json`) | Timene 6, 7, 8 og 9 i SnowScore-vinduet er fjernet fra `timeseries` (4 av 24 timer, 16,7 %). | Mer enn 10 % mangler, så stedet får «ufullstendige data» uten tall. |
| `kirkenes` (`met/kirkenes.json`) | `properties.meta.updated_at` er satt 4 timer bak det nyeste `updated_at` blant de andre stedene. | Stedet er eldre enn 3 timer og skal merkes «utdatert». Prognosen er ellers uendret og publiseres. |

Vinduet er de 24 timene fra og med timen som inneholder referansetiden. Referansetiden er det
nyeste `updated_at` i fixturene, etter endringen av `kirkenes`.

Bodø var først med i demokatalogen, men NVE har ingen rutecelle for Bodøs koordinater («No cell
exists», HTTP 400). Den ble byttet ut med Mo i Rana.

## Ta opp på nytt

```sh
npm run fixtures:record   # krever nett; skriver met/ og nve/ på nytt
npm run data:demo         # lager public/data/demo.json fra de nye fixturene
npm test
```

Se over endringene før du committer. Når fixturene endres, endres også `public/data/demo.json`, og
determinismetesten i `scripts/pipeline/run.test.ts` feiler til demo.json er laget på nytt.
