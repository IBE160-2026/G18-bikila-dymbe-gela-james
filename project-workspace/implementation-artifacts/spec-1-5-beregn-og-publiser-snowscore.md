---
title: 'Story 1.5: Beregn og publiser SnowScore i dataprogrammet'
type: 'feature'
created: '2026-10-08'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `npm run data` henter, validerer og scorer alle 300 steder (Story 1.3), men skriver ingen datafil. Appen kan derfor bare vise demodata (FR-4, FR-5, FR-6a, NFR-DQ2, NFR-DQ3).

**Approach:** La `runLive` i `scripts/pipeline/run.ts` kalle den eksisterende `publish.ts` (samme steg som demoen bruker), med `public/data/latest.json` som mål og veggklokka som sluttid. Publisering skjer atomisk og bare når minst 95 % av stedene har gyldige MET-data. Ellers står forrige fil urørt, og rapporten havner i loggen. `main` gir exit 1 når en live-kjøring ikke ble publisert. Plassholderen `LIVE_NOT_PUBLISHED` fra Story 1.3 fjernes. Tester dekker publisert kjøring (`mode: "live"`, kjørings-ID og kildetidsstempel per sted, feilet sted som «ufullstendige data» uten gamle verdier) og kjøring under terskelen (forrige fil står byte-lik). README og dataordboken sier at `npm run data` nå skriver `latest.json`.

</frozen-after-approval>

## Implementation Notes

- `scripts/pipeline/run.ts`: `runLive` kaller `publish(ctx, { outPath, now: clock() })`, og målet er `LIVE_OUT_PATH` (`public/data/latest.json`, som er gitignored). `outPath` kan settes i testene. `main` har nå samme regel for demo og live: exit 1 når kjøringen ikke ble publisert. `LIVE_NOT_PUBLISHED` er fjernet. Under 95 % gyldige følger dermed av `publish.ts`, ikke av en egen sjekk.
- `scripts/pipeline/run.test.ts`: live-testene er skrevet om.
  - Publisering gir fil med `mode: "live"`, samme `runId` og kildetidsstempel på hvert sted, og ingen midlertidig fil blir liggende.
  - Ved nøyaktig 95 % (20 steder, 1 MET-feil) publiseres fila. Det feilede stedet står som `incomplete` med `missingShare: 1` og bare `null`-verdier, og den forrige fila blir overskrevet.
  - Ved 75 % står forrige fil byte-lik, og rapporten logges.
  - NVE «no cell» stopper ikke publiseringen.
  - En manglende katalog gir rapport og ingen fil.
- **Overraskelse:** den første ekte `npm run data` publiserte ikke. Skjemasjekken avviste fila fordi ett sted fikk `c = 15.000000000000002`, men `PublishedData` krever c ≤ 15. Årsaken var `(15 × N) / P` i `shared/snowscore.ts` (Story 1.4) når N = P, for eksempel P = 0,7 mm. Den er rettet til `15 × min(1, N / P)`. Det er en ren flyttallsretting, uten endring i formelen.
  - `shared/snowscore.test.ts` har fått en fast test (P = 0,7 mm helt som snø gir c = 15). Egenskapstesten sjekker nå også a ≤ 60, b ≤ 25 og c ≤ 15. Begge feilet før rettingen.
  - `public/data/demo.json` er generert på nytt: to c-verdier gikk fra 14.999999999999998 til 15, og én endret seg i siste desimal fordi delingen nå skjer først (1.1470588235294112 → 1.1470588235294115). Poengsummene er uendret.
- README og dataordboken sier at `npm run data` skriver `latest.json` når minst 95 % er gyldige, og avslutter med feilkode 1 ellers.
- Verifisert: lint, typecheck, test (215) og build er grønne. `npm run data` mot ekte kilder publiserte 300 steder med 100 % gyldige, 4 NVE avvist og `mode: "live"`. `npm run data:demo` gir byte-lik fil ved ny kjøring.
- Etter gjennomgangen:
  - `writeRunReport` i `publish.ts` logger nå hvert avviste svar også for publiserte kjøringer, så årsakene havner i jobbloggen. Det er testet i `run.test.ts`.
  - README sier at en gammel `latest.json` blir liggende til neste vellykkede kjøring.

## Review Triage Log

Gjennomgang med Blind Hunter (oneshot). 10 funn.

| # | Funn | Vurdering | Rute | Begrunnelse |
|---|------|-----------|------|-------------|
| 1 | Ingen test for at et ufullstendig sted teller som gyldig | false | avvist | Det dekkes av `publish.test.ts` («counts incomplete places as valid towards the threshold»). Det er samme `publish` som `runLive` kaller. |
| 2 | Exit-koden til `main()` er ikke testet | low | avvist | Testen er allerede utsatt til Story 1.11 (punktene fra 1.10 og 1.3). Regelen i punktet fra 1.3 (krasj eller under 95 % → 1) gjelder fortsatt. |
| 3 | Notatet sier feil om endringene i `demo.json` | low | patch | Det stemte: én av tre verdier gikk ikke til 15. Notatet er rettet. |
| 4 | KI-loggen mangler | false | avvist | Den skrives i samme commit, ved leveringen. |
| 5 | `fremdriftsplan.md` er ikke oppdatert | false | avvist | Den oppdateres i samme commit, ved leveringen. |
| 6 | Specen har ingen Review Triage Log og feil status | false | avvist | Loggen og `status: done` skrives i dette steget. |
| 7 | En publisert kjøring logger ikke lenger hvorfor svar ble avvist | medium | patch | Det stemte: bare sammendraget ble logget. Hver avvisning logges nå på egen linje. |
| 8 | README advarer ikke om at en gammel `latest.json` blir vist | low | patch | Det er en direkte retting: én setning i README. |
| 9 | Egenskapstesten sjekker ikke nedre grense ≥ 0, og ikke mot `PublishedData` | low | avvist | a, b og c er ≥ 0 per konstruksjon, og `publish` validerer mot skjemaet ved hver kjøring. |
| 10 | Ingen test like under 95 % | low | avvist | 19/20 er nøyaktig 0,95, og testen ved 75 % viser at terskelen stopper publisering. En test til gir lite. |
