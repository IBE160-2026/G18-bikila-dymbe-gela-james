---
title: 'Story 1.10: Kjør SnowFinder lokalt med demodata'
type: 'feature'
created: '2026-10-07'
status: 'done'
baseline_commit: '79ed66f50caf7493fb91452bbe75234c2fa8324b'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-1-context.md'
  - '{project-root}/project-workspace/implementation-artifacts/spec-1-4-bygg-den-delte-snowscore-modulen.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Et rent klon viser ingenting, og sensor har verken nøkler eller ferske data. Kart, liste og stedsside (1.7–1.9) trenger en datafil å bygge mot (FR-30, AD-10).

**Approach:** Bygg kjernen i dataprogrammet (`run.ts` → validate → score → publish) mot lagrede MET- og NVE-svar, og publiser et committet `public/data/demo.json` med `npm run data:demo`. Appen laster `latest.json` med `demo.json` som reserve, med én klokke og et demobanner.

## Decisions (2026-10-07, Aksel)

- SnowScore regnes over **neste 24 timer** fra referansetiden.
- **MET og NVE** tas med nå: NVE seNorge «nysnø siste døgn» (`fsw`) lagres per sted (brukes av FR-25 senere).

## Boundaries & Constraints

**Always:**
- Demokatalog: 24 steder (8 skisteder, 8 fjelltopper, 8 byer, spredt over landet) hentet fra `data/catalog.json`, lagret i `tests/contract/fixtures/demo-catalog.json`.
- Fixtures: ett ekte MET Locationforecast 2.0 compact-svar og ett NVE GridTimeSeries `fsw`-svar per demosted, tatt opp én gang med et opptaksskript og committet. Ett sted får fjernet timer så >10 % mangler (ufullstendig), og ett får `meta.updated_at` flyttet >3 t bak referansetiden (utdatert). Endringene dokumenteres i `tests/contract/fixtures/README.md`.
- Svar valideres med Zod-skjemaer i `shared/contracts/` (`met.ts`, `nve.ts`) og dokumenteres i `shared/contracts/data-dictionary.md`. Ugyldige svar avvises og registreres i kjøringsrapporten.
- Stegene sender data bare via `RunContext` (`shared/contracts/run.ts`). `run.ts` er eneste inngang og skriver rapporten i `finally`.
- Demo er deterministisk: `referenceTime` = nyeste `updated_at` i fixtures, `runId` = `demo`, varighet 0. To kjøringer gir byte-lik fil.
- `publish.ts` validerer mot `PublishedData`, krever ≥95 % gyldige steder (ufullstendige teller som gyldige), og skriver atomisk.
- `src/lib/clock.ts` er eneste kilde til «nå» i `src/`; ESLint forbyr `Date.now()` og `new Date()` uten argument ellers i `src/`.
- Demobanneret «Demodata – ikke ekte prognoser» vises når fila har `mode: "demo"` (UX-DR16, `banner-demo` i DESIGN.md).

**Never:**
- Ingen nettverkskall i `npm run data:demo`, i tester eller i appen ved oppstart (utenom å hente egne JSON-filer).
- Ingen live henting (`fetch.ts`, Story 1.3), ingen kart/liste/stedsside (1.7–1.9).
- Ingen formel utenfor `shared/snowscore.ts`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Demokjøring | 24 fixtures | `demo.json` med 24 steder, `mode: "demo"`, rapport innebygd | N/A |
| Ufullstendig sted | >10 % av 24 timer mangler | Stedet har `snowScore.kind = "incomplete"`, ingen tall | Teller som gyldig |
| Utdatert sted | `updated_at` >3 t før referansetid | Stedets `kildeTidspunkt` er eldre; data publiseres | N/A |
| Ugyldig svar | Et svar feiler Zod | Avvist i rapporten (sted, kilde, årsak) | Under 95 % → ingen fil skrives, forrige står urørt, exit ≠ 0 |
| Uten `latest.json` | Rent klon | Appen laster `demo.json` og viser demobanneret | N/A |
| Ødelagt datafil | Fila feiler `PublishedData` | Appen viser en feilmelding, ikke en tom side | N/A |

</frozen-after-approval>

## Code Map

- `shared/snowscore.ts` -- `computeSnowScore(hours)`; bygg `HourlyValue[]` for de 24 timene fra referansetiden (`next_1_hours.details.precipitation_amount`, `instant.details.air_temperature`). Mangler en time i MET-serien → `null`.
- `shared/contracts/catalog.ts` -- `Catalog`/`CatalogEntry`; demokatalogen skal parse med samme skjema.
- `scripts/build-catalog/http.ts` -- mønster for User-Agent og nye forsøk; opptaksskriptet kan følge det, men ikke importere det (AD-5).
- `eslint.config.js` -- legg til `no-restricted-syntax` for `Date.now()` / `new Date()` uten argument i `src/**` unntatt `src/lib/clock.ts`; Node-globaler for `scripts/**` finnes allerede.
- `vite.config.ts` -- fjern `supabase/functions/**` fra Vitest-`include`.
- `src/App.tsx`, `src/main.tsx` -- minimalt skall; vis demobanneret og antall steder lastet. Utforsk bygges i 1.7.
- `supabase/`, `src/lib/supabase/` -- slett (tomme `.gitkeep`).
- MET: `GET https://api.met.no/weatherapi/locationforecast/2.0/compact?lat&lon&altitude`, krever identifiserende User-Agent; ~52 timer med `next_1_hours`.
- NVE: `GET https://gts.nve.no/api/GridTimeSeries/{x}/{y}/{fra}/{til}/fsw.json`, koordinater i UTM33 (EPSG:25833), `NoDataValue` 255, daglig verdi kl. 06.

## Tasks & Acceptance

**Execution:**
- [x] `shared/contracts/met.ts`, `nve.ts`, `run.ts`, `published.ts`, `data-dictionary.md` -- Zod-skjemaer for MET-subsettet, NVE-svaret, `RunContext`, `RunReport`, `Sted` og `PublishedData` (`mode`, `referenceTime`, `runId`, `generert`, `report`, `steder`). `Sted`: katalogfeltene + `kildeTidspunkt`, `runId`, `snowScore` (resultatet fra modulen), `nysnoCm` (S omregnet), `temperatur` (T̄), `vindMaks` (maks i vinduet), `skydekke` (snitt %), `nveNysnoSisteDognMm` (eller `null`).
- [x] `shared/geo.ts` -- WGS84 → UTM33 (ren TS, ingen avhengighet) med test mot kjente punkter (±1 m).
- [x] `scripts/pipeline/run.ts`, `validate.ts`, `score.ts`, `publish.ts`, `sources/fixtures.ts` -- `run.ts --demo` leser demokatalog og fixtures; rapport i `finally`.
- [x] `tests/contract/record-fixtures.ts` + `npm run fixtures:record` -- tar opp fixtures for demokatalogen (kjøres for hånd).
- [x] `tests/contract/fixtures/` -- `demo-catalog.json`, `met/<id>.json`, `nve/<id>.json`, `README.md`.
- [x] `package.json` -- `data:demo` (`tsx scripts/pipeline/run.ts --demo`), `fixtures:record`.
- [x] `public/data/demo.json` -- generert og committet; `.gitignore` får `public/data/latest.json`.
- [x] `src/lib/clock.ts`, `src/lib/data/` (laster, parser med `PublishedData`, reserve), `src/components/DemoBanner.tsx`, `src/App.tsx` -- skall som viser banneret og «24 steder lastet».
- [x] Tester: kontraktstester for fixtures, score/publish (terskel, atomisk, ufullstendig), determinisme (byte-lik), lasteren (reserve, ødelagt fil) og klokka.
- [x] Rydd `supabase/`, `src/lib/supabase/`, `vite.config.ts`; README «Kom i gang» med demo og `npm run data:demo`.

**Acceptance Criteria:**
- Given et rent klon, when `npm ci && npm run lint && npm run typecheck && npm test && npm run build` kjøres uten nett, then alt er grønt.
- Given `npm run dev`, when appen åpnes, then vises demobanneret og «24 steder lastet».

## Implementation Notes

- `WINDOW_HOURS = 24` og `selectWindow` ligger i `shared/snowscore.ts` (AD-6): timen som inneholder referansetiden og de neste 23.
- Et sted er gyldig for 95 %-terskelen når MET-svaret er gyldig; avviste NVE-svar rapporteres, men teller ikke.
- Bodø har ingen NVE-rute («No cell exists») og ble byttet med Mo i Rana i demokatalogen.
- `.gitattributes` tvinger LF for `public/data/*.json` og fixtures, så byte-sjekken holder på Windows.

## Spec Change Log

## Review Triage Log

**Gjennomgang 2026-10-07** (Blind Hunter, Edge Case Hunter, Verification Gap). Ingen intent_gap eller bad_spec, så ingen loopback.

| # | Lag | Funn | Verdikt | Rute | Begrunnelse |
|---|---|---|---|---|---|
| 1 | blind, edge | 5xx eller nettverksfeil på `latest.json` gir demodata | medium | patch | Bekreftet i `tryFetch`: alt som ikke er `ok` blir «missing». Bare 404 og HTML-svar skal regnes som manglende. |
| 2 | blind | `latest.json` hentes uten cache-styring | low | patch | Direkte rettelse: `cache: 'no-cache'`. |
| 3 | vg, blind | Ingen test renderer appen (banner, «24 steder lastet», feil) | medium | patch | Akseptkriterium 2 er bare sjekket for hånd. Ren `AppView` + `renderToStaticMarkup` i node-miljøet. |
| 4 | blind | Siden mangler `h1`, og skjelettet leses ikke opp | medium | patch | Bekreftet: tittelen er en `span`; `aria-label` på `div` uten rolle. |
| 5 | vg | Gyldig MET uten timer i vinduet er ikke testet (`Math.max([])`) | low | patch | Én test; hindrer at ett sted stopper hele publiseringen. |
| 6 | blind, edge | `parseNveDate` godtar måned 13 og time 25 | low | patch | Direkte rettelse: sjekk alle feltene. |
| 7 | blind, edge | `NoDataValue` utenfor 0–1000 avviser hele NVE-svaret | medium | patch | Temalista bruker både 255 og 65535. |
| 8 | vg, edge | Demoens referansetid kan komme fra et svar som senere avvises | low | patch | Bruk bare svar som validerer. |
| 9 | blind | `antallUfullstendige` teller også avviste steder | low | patch | Tell bare gyldige steder med hull; presiser i ordboka. |
| 10 | edge | `main()` uten `.catch`, og «Kjøringen feilet: undefined» | low | patch | Direkte rettelser. |
| 11 | blind | Ordboka sier «før», koden «på eller før»; README-lenke og ordvalg | low | patch | Tekstrettelser; nevn at «Utdatert»-merking kommer i 1.9. |
| 12 | vg | Exit-koden til `npm run data:demo` er ikke testet | medium | defer | Ingen bruker den ennå; hører til 1.11 når CI avhenger av den. |
| 13 | vg | Ingen test av at klokke-lint-regelen slår til | low | defer | Billig å legge til med ESLints Node-API senere. |
| 14 | blind, edge | Lint-regelen stopper ikke `Date()` eller `performance.now()` | low | reject | Krever flere selektorer; AD-10 nevner `Date.now()` og `new Date()`. |
| 15 | edge | Midlertidig filnavn kan kollidere ved samtidig publisering | false | reject | Én kjøring om gangen (AD-2). |
| 16 | edge | `varighetMs` kan bli NaN | false | reject | Tidene kommer fra koden selv, aldri fra eksterne data. |
| 17 | edge | Opptaksskriptet mangler vakter mot delvis skriving | low | reject | Kjøres for hånd, og resultatet gjennomgås i git. |
| 18 | edge | `baseUrl` uten skråstrek | false | reject | Vite sin `BASE_URL` slutter alltid med `/`. |
| 19 | vg | `Math.max` med `null`-tidspunkt i en test | low | reject | Gjelder ikke dagens fixtures. |
| 20 | blind | Status, KI-logg og fixtures mangler i diffen | false | reject | Status og logg tas i steg 5; fixtures ble utelatt med vilje og er sjekket med kontraktstester. |

## Design Notes

- Vind og skydekke aggregeres over samme 24-timersvindu: `vindMaks` = høyeste `wind_speed` (filteret «maks vind» skal være konservativt), `skydekke` = snitt av `cloud_area_fraction`.
- `nveNysnoSisteDognMm` er NVEs siste daglige verdi før referansetiden; `NoDataValue` blir `null`.

## Verification

**Commands:**
- `npm run data:demo && git diff --exit-code public/data/demo.json` -- expected: ingen endring (deterministisk).
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: alt exit 0.
