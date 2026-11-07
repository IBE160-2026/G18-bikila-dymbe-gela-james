---
title: 'Story 1.6b: Rettinger etter review av Story 1.6'
type: 'bugfix'
created: '2026-11-07'
status: 'done'
baseline_commit: 'df8b70260180356207792663892e9f191f7f8021'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Reviewen av PR #77 i etterkant ([kommentar](https://github.com/IBE160-2026/G18-bikila-dymbe-gela-james/pull/77#issuecomment-6546891809)) fant fire feil. Skjermlesere hører ofte ikke banneret ved første lasting. En vert som ikke svarer, prøves tre ganger. En fane som står åpen over 90 min, viser banneret selv om jobben går fint. Over 12 t står banneret over «Ingen ferske data». I tillegg mangler tester for NVE og for at ventetiden faktisk ventes ut, og dokumentene sier fortsatt «Ikke bygget ennå».

**Approach:** Små, separate rettinger i samme PR, ett steg om gangen med godkjenning fra Aksel mellom stegene: (a) statusregionen, (b) tidsavbrudd ved tilkobling, (c) banneret i en fane som har stått lenge åpen, (d) testhullene, (e) dokumentene.

## Boundaries & Constraints

**Always:** Alder regnes via `now()` i `src/lib/clock.ts` og `shared/freshness.ts`. Hvert forsøk går gjennom kildens `startGate`. Demodata eldes aldri og hentes aldri på nytt (AD-10). Siste gyldige fil og 95 %-terskelen er uendret.

**Never:** Ingen nye avhengigheter, ingen endringer i datafilens skjema, ingen kretsbryter eller tilstand mellom kjøringer. Ikke budsjett for nye forsøk per kjøring (funn 3), som føres i `deferred-work.md`.

**Beslutninger (Aksel, 2026-11-07):** Planen a–e er godkjent, og hvert steg godkjennes før neste. Funn 3 utsettes. En frossen prognose fra MET gir ikke banner: banneret følger når fila sist ble publisert (`generert`), og DESIGN.md og EXPERIENCE.md presiseres slik.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Første lasting, gammel fil | Utforsk eller stedssiden, mens data lastes og etterpå | Bannerets tomme statusregion finnes fra første tegning, og teksten fylles inn når dataene kommer | – |
| Vert svarer ikke | `fetch` avviser med `cause.code === 'UND_ERR_CONNECT_TIMEOUT'` | Ett forsøk | «Tidsavbrudd ved tilkobling» |
| Fane åpen over 90 min, jobben går | Live-fil passerer 90 min, og en nyere fil finnes | Fila hentes på nytt, de nye dataene vises, og ingen banner | – |
| Fane åpen, jobben har stoppet | Live-fil passerer 90 min, og ny henting gir samme eller eldre `generert` | Banneret vises som før | Mislykket ny henting: banneret vises, dataene beholdes |
| Ingen ferske data | Alle steder er eldre enn 12 t | Bare «Ingen ferske data», ikke banneret | – |

</frozen-after-approval>

## Code Map

- `src/App.tsx:55-57` -- `GamleDataBanner` monteres først når `result.status === 'ok'`. Skal monteres på `utforsk` og `sted` fra første tegning. `statusMelding` (linje 43) sier når Utforsk viser `INGEN_FERSKE`.
- `src/components/GamleDataBanner.tsx` -- regionen er alltid `role="status"`. Gjør `generert` og `naa` valgfrie, eller send `vis=false` mens data lastes.
- `src/App.test.tsx:108-130` -- bannertestene. Linje 128 låser «ingen region mens data lastes», og den skal snus.
- `scripts/pipeline/fetch.ts:95` -- `isTimeout` gjenkjenner bare `TimeoutError`. `describeError` (linje 97) og `getOnce` (linje 132) bruker den. Den nye regelen skal ha sin egen tekst.
- `scripts/pipeline/fetch.test.ts` -- mønstrene for tidsavbrudd (linje 190), nye forsøk (91) og kallraten (305). NVE testes bare med 400.
- `src/hooks/useSteder.ts:81-136` -- `createStederStore`: `sjekk()` regner bare alderen på nytt for `raw`. Legg til en ny henting via `loadFn` når live-data passerer 90 min, høyst én om gangen, og bytt `raw` bare når den nye fila har nyere `generert`. `KartVisning` beholder zoom når `steder` endres, fordi kartet lages én gang.
- `src/hooks/useSteder.test.ts:14-120` -- store-testene med falsk `loadFn` og falske timere.
- `src/lib/data/loadPublishedData.ts:27` -- henter allerede med `cache: 'no-cache'`, så en ny henting er fersk.
- `project-phase-folders/2-Planleggingsfasen/SnowFinder-DESIGN.md:275`, `SnowFinder-EXPERIENCE.md:93,113` og kopiene i `project-workspace/planning-artifacts/ux-*/` -- fjern «Ikke bygget ennå», rett «Alle flater» til Utforsk og stedssiden, og presiser `generert`.
- `SnowFinder-Arkitektur.md:117` og `ARCHITECTURE-SPINE.md` -- AD-2 sier «one attempt».
- `project-workspace/implementation-artifacts/deferred-work.md` -- oppføringen om bannerfargene (funnet viste at den er utgått) og ny oppføring for funn 3.

## Tasks & Acceptance

**Execution:**
- [x] `src/App.tsx`, `src/components/GamleDataBanner.tsx`, `src/App.test.tsx` -- (a) regionen monteres på `utforsk` og `sted` fra første tegning, også mens data lastes. Banneret skjules når `statusMelding` gir `INGEN_FERSKE`.
- [x] `scripts/pipeline/fetch.ts`, `fetch.test.ts` -- (b) `isConnectTimeout` for `cause.code === 'UND_ERR_CONNECT_TIMEOUT'`, ikke nytt forsøk, og teksten «Tidsavbrudd ved tilkobling».
- [x] `src/hooks/useSteder.ts`, `useSteder.test.ts` -- (c) ny henting når live-data passerer 90 min, med test for nyere fil, samme fil og feil.
- [x] `scripts/pipeline/fetch.test.ts` -- (d) NVE med 5xx, 429 og nettverksfeil prøves tre ganger. Neste forsøk starter ikke før `sleep` er ferdig.
- [x] DESIGN.md, EXPERIENCE.md, arkitekturen (begge kopier) og `deferred-work.md` -- (e) som i Code Map.

**Acceptance Criteria:**
- Given en gammel live-fil, when Utforsk lastes, then finnes bannerets statusregion før dataene kommer, og den får teksten etterpå.
- Given NVE eller MET som svarer 503 to ganger, when neste forsøk venter, then gjøres ikke noe nytt kall før ventetiden er over.
- Given at alle stegene er gjort, when `lint`, `typecheck`, `test`, `build:demo` og `test:e2e` kjøres, then er alt grønt.

## Implementation Notes

- Aksel godkjente specen 2026-11-07 og ba om å bygge videre mens han var borte i to timer. Stegene a–e bygges derfor i én økt, med én commit per steg, uten push. Aksel godkjenner før push.
- Etter KI-gjennomgangen: 8 funn rettet i `db17f53`, 2 utsatt i `deferred-work.md`, 8 avvist. Verifisert lokalt på Windows: lint, typecheck, 687 enhetstester, `build:demo` og 135 E2E-tester er grønne.

## Spec Change Log

## Review Triage Log

Gjennomgang med Blind Hunter (12 funn), Edge Case Hunter (8) og Verification Gap (1). Ingen funn ga intent_gap eller bad_spec.

| # | Lag | Funn | Vurdering | Rute | Begrunnelse |
|---|-----|------|-----------|------|-------------|
| 1 | ECH | En ny henting som aldri svarer, holder banneret tilbake for alltid og stopper nye hentinger | medium | patch | `loadPublishedData` har ingen tidsgrense, så `henter` kan bli stående `true`. Matrisen sier at en mislykket henting gir banner. Hentingen får en tidsgrense. |
| 2 | VG | Grenen som holder banneret tilbake mens «Utdatert» endres, er ikke testet | low | patch | Stemmer: testen krysser aldri 3 t. Ny test der stedet blir «Utdatert» i samme sjekk som hentingen starter. |
| 3 | ECH, BH | Falske tidtakere og abonnementer lekker mellom rundene i løkketesten | low | patch | En feil i én runde ville gitt følgefeil i andre tester. Rundene gjøres til egne tester med opprydding. |
| 4 | BH | Kommentarene i `useSteder.ts` lover fortsatt at fila lastes én gang | low | patch | Filhodet og JSDoc sier «loads the file once». Rettes. |
| 5 | BH | AD-2 sier at det ikke finnes budsjett for nye forsøk «because there is no state between runs», og regelen for tidsavbrudd begrunnes med at verten er nede | low | patch | Et budsjett per kjøring trenger ingen tilstand, og grunnen til å ikke prøve på nytt er tidskostnaden. AD-2 (begge kopier) og kommentaren i `getOnce` rettes. |
| 6 | BH | AD-8 sier ikke at storen henter fila på nytt | low | patch | Én setning i AD-8 i begge kopiene. |
| 7 | BH | Likhetstesten av HTML i `App.test.tsx` er skjør og vanskelig å lese | low | patch | Den bryter ved enhver endring før regionen. Byttes med en sjekk av strukturen. E2E-testen viser allerede at elementet er det samme. |
| 8 | BH | `deferred-work.md` merker fargedelen utgått, men koden bruker fortsatt fargene fra 1.6 | low | patch | `App.css` har lys bakgrunn med kant i `warning`, mens DESIGN.md sier `warning`-bakgrunn med hvit tekst. Fargevalget er åpent, så raden rettes til åpen. |
| 9 | ECH, BH | `ETIMEDOUT` eller en `AggregateError` fra flere adresser regnes ikke som tidsavbrudd ved tilkobling | maybe-false | defer | Reviewen av #77 målte `UND_ERR_CONNECT_TIMEOUT` på Node 24. Om de andre formene forekommer mot MET og NVE, avgjøres med `varighetMs` og årsakene fra ekte kjøringer. Oppførselen er som før 1.6b. |
| 10 | BH | NFR-3 og FR-6b i PRD-en er ikke presisert som DESIGN.md og EXPERIENCE.md | low | defer | En endring i PRD-en går via `bmad-correct-course`. Presiseringen endrer ikke kravet. |
| 11 | BH | Story 1.6b mangler i `sprintplan.md`, epics, `fremdriftsplan.md` og KI-loggen | low | patch | Føres inn når storyen leveres, i samme PR. |
| 12 | ECH | Ugyldig `generert` gir at en nyere fil aldri tas i bruk | false | avvist | `generert` valideres som tidspunkt av skjemaet i `loadPublishedData` før storen får fila. |
| 13 | ECH | En henting som blir ferdig etter at alle har gått, oppdaterer storen | low | avvist | Det er bortkastet arbeid uten synlig følge, og det ville krevd en ekstra vakt. |
| 14 | ECH | På stedssiden vises banneret over «for gamle til å vises» når alt er eldre enn 12 t | false | avvist | Raden i matrisen gjelder «Ingen ferske data», som bare Utforsk viser. På stedssiden er banneret riktig, slik 1.6 bestemte (#8 der). |
| 15 | ECH | E2E-testen holder tilbake demofila, ikke en live-fil | low | avvist | Regionen tegnes likt i begge modusene. Live-veien er dekket i `App.test.tsx`. |
| 16 | ECH | En side som åpnes på en gammel fil, viser banneret med en gang | false | avvist | Fila er nettopp hentet med `cache: 'no-cache'`, så en ny henting ville gitt den samme fila. |
| 17 | BH | `.then` i `hentPaNytt` har ingen `.catch` | low | avvist | Fila er validert før `.then`, så den kaster ikke i praksis. Tidsgrensen i #1 sikrer uansett at `henter` blir nullstilt. |
| 18 | BH | E2E dekker ikke kartet, stedssiden eller ny henting | low | avvist | Regionen er den samme komponenten på alle rutene og er testet i `App.test.tsx`. Ny henting avhenger av tid og er enhetstestet. |

## Design Notes

- **Ny henting i stedet for alder fra veggklokka:** appen kan ikke vite om jobben går, bare om det finnes en nyere fil. En ny henting ved 90 min koster ett kall per fane i timen og gir både ferske data og et riktig banner.
- **Tilkoblingstidsavbrudd prøves ikke på nytt**, av samme grunn som `TimeoutError` (Design Notes i 1.6). Det får sin egen tekst, fordi det kommer etter rundt 10 s, ikke 20 s.

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm test && npm run build:demo` -- expected: alt grønt
- `npm run test:e2e` -- expected: grønt, også `gamle-data.spec.ts`
