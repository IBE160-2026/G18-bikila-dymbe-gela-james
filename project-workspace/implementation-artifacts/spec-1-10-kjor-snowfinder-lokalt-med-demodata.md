---
title: 'Story 1.10: Kjør SnowFinder lokalt med demodata'
type: 'feature'
created: '2026-10-07'
status: 'ready-for-dev'
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
- [ ] `shared/contracts/met.ts`, `nve.ts`, `run.ts`, `published.ts`, `data-dictionary.md` -- Zod-skjemaer for MET-subsettet, NVE-svaret, `RunContext`, `RunReport`, `Sted` og `PublishedData` (`mode`, `referenceTime`, `runId`, `generert`, `report`, `steder`). `Sted`: katalogfeltene + `kildeTidspunkt`, `runId`, `snowScore` (resultatet fra modulen), `nysnoCm` (S omregnet), `temperatur` (T̄), `vindMaks` (maks i vinduet), `skydekke` (snitt %), `nveNysnoSisteDognMm` (eller `null`).
- [ ] `shared/geo.ts` -- WGS84 → UTM33 (ren TS, ingen avhengighet) med test mot kjente punkter (±1 m).
- [ ] `scripts/pipeline/run.ts`, `validate.ts`, `score.ts`, `publish.ts`, `sources/fixtures.ts` -- `run.ts --demo` leser demokatalog og fixtures; rapport i `finally`.
- [ ] `tests/contract/record-fixtures.ts` + `npm run fixtures:record` -- tar opp fixtures for demokatalogen (kjøres for hånd).
- [ ] `tests/contract/fixtures/` -- `demo-catalog.json`, `met/<id>.json`, `nve/<id>.json`, `README.md`.
- [ ] `package.json` -- `data:demo` (`tsx scripts/pipeline/run.ts --demo`), `fixtures:record`.
- [ ] `public/data/demo.json` -- generert og committet; `.gitignore` får `public/data/latest.json`.
- [ ] `src/lib/clock.ts`, `src/lib/data/` (laster, parser med `PublishedData`, reserve), `src/components/DemoBanner.tsx`, `src/App.tsx` -- skall som viser banneret og «24 steder lastet».
- [ ] Tester: kontraktstester for fixtures, score/publish (terskel, atomisk, ufullstendig), determinisme (byte-lik), lasteren (reserve, ødelagt fil) og klokka.
- [ ] Rydd `supabase/`, `src/lib/supabase/`, `vite.config.ts`; README «Kom i gang» med demo og `npm run data:demo`.

**Acceptance Criteria:**
- Given et rent klon, when `npm ci && npm run lint && npm run typecheck && npm test && npm run build` kjøres uten nett, then alt er grønt.
- Given `npm run dev`, when appen åpnes, then vises demobanneret og «24 steder lastet».

## Design Notes

- Vind og skydekke aggregeres over samme 24-timersvindu: `vindMaks` = høyeste `wind_speed` (filteret «maks vind» skal være konservativt), `skydekke` = snitt av `cloud_area_fraction`.
- `nveNysnoSisteDognMm` er NVEs siste daglige verdi før referansetiden; `NoDataValue` blir `null`.

## Verification

**Commands:**
- `npm run data:demo && git diff --exit-code public/data/demo.json` -- expected: ingen endring (deterministisk).
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: alt exit 0.
