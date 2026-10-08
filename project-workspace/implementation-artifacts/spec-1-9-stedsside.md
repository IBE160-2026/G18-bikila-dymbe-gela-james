---
title: 'Story 1.9: Åpne en stedsside med full poengsum'
type: 'feature'
created: '2026-10-08'
status: 'done'
baseline_commit: 'beda16d5c588ae82914e8151af0e4792de429b6a'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-1-context.md'
  - '{project-root}/project-workspace/implementation-artifacts/spec-1-8-listevisning.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Stedssiden viser bare navn og score. Brukeren ser ikke hvorfor stedet scorer som det gjør, og appen viser data uansett hvor gamle de er (FR-16, NFR-3, UJ-1 klimaks).

**Approach:** `/sted/:id` viser hele poengsummen og grunnlaget for den:
- SnowScore-badge og delpoengene A Nysnøpotensial (av 60), B Kuldebonus (av 25) og C Snøandel (av 15);
- nysnø, temperatur, vind, skydekke, høyde og NVE-nysnø siste døgn;
- kildens tidsstempel i norsk tid.

En ny `shared/freshness.ts` vurderer dataalderen mot `src/lib/clock.ts`:
- eldre enn 3 t gir merket «Utdatert» med tidsstempel på stedssiden og i listeraden;
- eldre enn 12 t fjerner stedet fra kart, liste og stedssiden.

En axe-test krever null alvorlige eller kritiske brudd på stedssiden.

## Boundaries & Constraints

**Always:**
- Alderen er `now(data) − kildeTidspunkt` (AD-10: i demo er «nå» filens `referenceTime`). Grensene er åpne: nøyaktig 3 t er fersk, og over 3 t er utdatert. Nøyaktig 12 t er utdatert, og over 12 t fjernes stedet.
- Et sted uten `kildeTidspunkt` (MET feilet) har ukjent alder. Det vises som «Ufullstendige data» og verken merkes eller fjernes.
- Fjerningen skjer ett sted: i `useSteder()` (AD-8), så kart, liste og stedsside alltid ser den samme mengden. Åpnes et fjernet sted direkte, vises «Dataene for dette stedet er for gamle til å vises» med en lenke til kartet, ikke «Fant ikke stedet».
- Ufullstendige data vises som tekst, aldri som tallbadge eller som 0. Delpoengene vises da ikke.
- Tall formateres norsk (komma, `tnum`, «–» når verdien mangler). Delpoengene har én desimal («19,2 av 60»), og tidsstempelet vises i `Europe/Oslo` med `Intl`, uten nye pakker.
- Én kolonne på mobil og to fra 768 px (EXPERIENCE). Siden har én `h1` (stedsnavnet), og «Tilbake» virker som før.

**Never:**
- Ingen forklaringsside eller lenke dit (Epic 2), ingen skivindu (Bør ha) og ingen endring i kartets eller listens oppførsel utover fjerning og «Utdatert»-merket.
- Ingen ny avhengighet (date-fns-tz trengs ikke).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Fullt sted | `gaustatoppen` i demo | Badge, A/B/C med «av 60/25/15», rådata, høyde og tidsstempel i norsk tid | N/A |
| Ufullstendig | `trondheim` | «Ufullstendige data» som tekst, ingen delpoeng og ingen badge | Aldri 0 |
| Utdatert | `kirkenes` (kilde > 3 t eldre enn demo-nå) | Merket «Utdatert» med tidsstempel på siden og i listeraden | N/A |
| Grense 3 t | Alder nøyaktig 3 t / 3 t + 1 ms | Fersk / Utdatert | N/A |
| Grense 12 t | Alder nøyaktig 12 t / 12 t + 1 ms | Utdatert / fjernet | N/A |
| Ukjent alder | `kildeTidspunkt: null` | Vises, verken merket eller fjernet | N/A |
| For gammelt sted, direkte lenke | `/sted/<id>` for et fjernet sted | «Dataene for dette stedet er for gamle til å vises» + lenke til kartet | N/A |
| Mangler verdi | `vindMaks: null` | «–» | N/A |

</frozen-after-approval>

## Code Map

- `src/lib/clock.ts` -- `now(data)`, eneste kilde til «nå» i `src/` (lint forbyr `Date.now()`/`new Date()` andre steder). `shared/` har ingen klokke: `shared/freshness.ts` får «nå» som argument.
- `shared/contracts/published.ts` -- `Sted`: `kildeTidspunkt` (ISO eller `null`), `hoyde`, `nysnoCm`, `temperatur`, `vindMaks`, `skydekke`, `nveNysnoSisteDognMm`, `snowScore` (`a`, `b`, `c`, `score` eller `incomplete`), `runId`.
- `src/hooks/useSteder.ts` -- delt loader. Legg til ferskhetsfiltreringen her (eller i en ren hjelper den kaller), og ta vare på hvilke id-er som ble fjernet, så stedssiden kan si «for gamle».
- `src/pages/Sted.tsx` -- nå bare navn, badge og «Tilbake». `src/App.tsx` velger siden ut fra ruten og viser `IkkeFunnet` for ukjente id-er.
- `src/components/ListeVisning.tsx` -- raden har navn, badge og detaljer med skjulte skilletegn for skjermlesere. Legg «Utdatert» inn på samme måte, med skilletegn.
- `src/components/ScoreBadge.tsx`, `src/lib/scoreTier.ts` -- gjenbruk dem. `medEnhet`/tallformatering finnes allerede (sjekk `ListeVisning`/`App.test.tsx`), så gjenbruk eller flytt den, ikke kopier.
- `shared/snowscore.ts` -- `SNOWSCORE.maxA/maxB/maxC` (60/25/15). Bruk konstantene, ikke hardkod tallene.
- `public/data/demo.json` -- `kirkenes` er utdatert mot demo-nå. Ingen demosted er over 12 t, så fjerning testes i enhetstester.
- `tests/e2e/liste.spec.ts` -- mønster for axe (`serious`/`critical`) og for å stoppe nettverkstrafikk. Ny fil: `tests/e2e/sted.spec.ts`.

## Tasks & Acceptance

**Execution:**
- [x] `shared/freshness.ts` (+ test) -- `dataAlderMs(kildeTidspunkt, nå)` og `ferskhet(...)`, som gir `fersk` | `utdatert` | `for-gammel` | `ukjent`, med konstantene `UTDATERT_ETTER_MS` (3 t) og `FJERNES_ETTER_MS` (12 t). Testen dekker alle grensene i matrisen.
- [x] `src/hooks/useSteder.ts` (+ test) -- fjern steder som er `for-gammel` (alderen regnes med `now(data)`), og ta vare på de fjernede id-ene.
- [x] `src/pages/Sted.tsx`, `src/App.tsx`, `src/App.css` (+ `App.test.tsx`) -- full stedsside: badge, delpoengtabell (`<dl>` eller tabell med overskrifter), rådata med enheter, høyde, tidsstempel i norsk tid og «Utdatert»-merket. Ufullstendige data vises som tekst. Et fjernet sted får egen melding.
- [x] `src/components/ListeVisning.tsx` -- «Utdatert» i raden når stedet er utdatert, med skilletegn for skjermleser.
- [x] `tests/e2e/sted.spec.ts` -- åpne Gaustatoppen fra listen og sjekk A/B/C og rådata. Åpne `kirkenes` og sjekk «Utdatert». Åpne `trondheim` og sjekk «Ufullstendige data» uten badge. axe på stedssiden uten `serious`/`critical`.
- [x] `README.md` -- én setning om stedssiden og aldersgrensene.

**Acceptance Criteria:**
- Given et rent klon, when `npm ci && npm run lint && npm run typecheck && npm test && npm run build` kjøres uten nett, then alt er grønt.
- Given installert Chromium, when `npm run test:e2e` kjøres, then alle E2E-tester, inkludert axe på stedssiden, er grønne.

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: alt exit 0.
- `npm run test:e2e` -- expected: alle tester passerer.

**Manual checks:**
- `npm run dev` (demo): Gaustatoppen viser delpoeng og rådata; Kirkenes er merket «Utdatert»; Trondheim viser «Ufullstendige data».

## Implementation Notes

- Den ustabile zoomtesten fra Story 1.7b (`tests/e2e/kart.spec.ts`) feilet i 2 av 3 kjøringer. Kartet kan starte under zoom 5, der markørene allerede har minstestørrelsen, så én innzooming ga for liten vekst. Testen zoomer nå inn og ut to ganger, og den er grønn 3 av 3 ganger. Det er en ren testretting, gjort her fordi E2E må være grønn for akseptansekriteriet.
- Etter gjennomgangen feilet zoomtesten igjen: etter to innzoominger kunne Hemsedal ligge utenfor bildet, og Leaflet tegner ikke markører utenfor det synlige området. Testen måler nå den største synlige markøren, og den var grønn i 3 av 3 kjøringer av hele E2E-pakken.

## Review Triage Log

Tre lag: Blind Hunter (B), Edge Case Hunter (E) og Verification Gap (V). 17 funn.

| # | Lag | Funn | Vurdering | Rute | Begrunnelse |
|---|-----|------|-----------|------|-------------|
| 1 | B, E | Ferskhet regnes bare ved lasting, så en fane åpen i flere timer blir ikke merket | medium | defer | Det stemmer, men gjelder bare live når fanen står åpen lenge. Story 1.6 (banner for gamle data) tar dataalder under bruk. |
| 2 | B, V | Ingen test for alder i live-modus mot veggklokka | medium | patch | Testen er lagt til i `useSteder.test.ts`. |
| 3 | B, E | Kildetid langt fram i tid regnes som fersk | low | avvist | MET sin `updated_at` er validert mot ISO. Det finnes ingen påvist kilde til tider langt fram. |
| 4 | B | `delpoeng` kan vise «−0,0» | false | avvist | `a`/`b`/`c` har `min(0)` i kontrakten, så negative verdier når aldri siden. |
| 5 | B, V | Teksten for manglende MET-prognose er ikke testet | medium | patch | En test med `kildeTidspunkt: null` er lagt til. |
| 6 | V | Testen for live-data er datoavhengig | low | avvist | Den sjekker bare kartet og at banneret mangler. Rad 2 dekker filtreringen i live. |
| 7 | B | Statusen er ulik, og 1.8 flyttes til `done` | false | avvist | Det er etablert praksis. `sprint-status` settes ved leveringen. |
| 8 | B | KI-loggen, fremdriftsplanen og triage-loggen mangler | false | avvist | De skrives ved leveringen. |
| 9 | B | Endringen i `kart.spec.ts` er utenfor omfanget | low | avvist | Den er forklart i Implementation Notes og trengs for grønn E2E. |
| 10 | B | `toHaveLength(23)` er hardkodet | low | patch | Bruker nå `demo.steder.length - 1`. |
| 11 | B | Ingen test for at et fjernet sted mangler på kartet | low | avvist | Fjerningen skjer sentralt i `useSteder`, som kart og liste deler. Listen og stedssiden er testet. |
| 12 | B | «For gammelt»-visningen har ingen h1- eller axe-sjekk | low | avvist | Den bruker `IkkeFunnet`, som er testet i 1.7. |
| 13 | E | En `kildeTidspunkt` som ikke kan tolkes, gir «oppdatert –» | false | avvist | Kontrakten (`isoUtc`) avviser slike verdier før appen ser dem. |
| 14 | E | Ferskhet bare ved lasting (påstand) | medium | defer | Samme som rad 1. |
| 15 | E | Tid langt fram (påstand) | low | avvist | Samme som rad 3. |
| 16 | V | Teksten for manglende prognose (annen formulering) | medium | patch | Samme som rad 5. |
| 17 | V | Ingen test av alder i live (annen formulering) | medium | patch | Samme som rad 2. |
