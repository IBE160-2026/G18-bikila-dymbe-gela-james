---
title: 'Story 1.2: Bygg stedskatalogen'
type: 'feature'
created: '2026-10-07'
status: 'done'
baseline_commit: 'abf88dd2f9fb83ed84e0d0fef4d6f6fc28a963fd'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Dataprogrammet (Story 1.3) trenger en fast, kvalitetssikret liste med ~300 norske steder. Ingen katalog eller katalogkontrakt finnes ennå.

**Approach:** Et frittstående Node/TypeScript-skript i `scripts/build-catalog/` som kjøres for hånd. Det henter skisteder fra OpenStreetMap (Overpass) og slår opp fjelltopper og byer fra en committet, manuelt kvalitetssikret navneliste i Kartverkets stedsnavn-API. Høyde hentes fra Kartverkets høyde-API. Skriptet skriver `data/catalog.json`, validert mot Zod-skjemaet `Catalog` i `shared/contracts/` (FR-1, AD-5, AD-12).

## Decisions (2026-10-07, Aksel)

- Bygges nå, etter arkitektur v4 og PRD v3 (fil, ikke database). Akseptkriteriene for 1.2 i epics-filen (SQL-migrering, `locations`) er utdaterte; John skriver dem om i steg 8d.
- Fordeling: ca. 150 skisteder (OSM), 100 fjelltopper og 50 byer (Kartverket).
- Amelia lager førsteutkastet til navnelista (`seeds.json`), spredt over hele landet og med kommune. Gruppa går gjennom den i PR-en.
- Den genererte `data/catalog.json` committes i denne PR-en. Er Overpass nede, prøves det igjen før PR.
- Spesifikasjonen beholdes samlet (~2100 tokens).

## Boundaries & Constraints

**Always:**
- Hvert sted: `id` (stabil slug), `navn`, `lat`/`lon` med 4 desimaler, `hoyde` (heltall meter), `type` (`skisted` | `fjelltopp` | `by`), `kilde` (`osm` | `kartverket`). camelCase. Unike `id` og unike koordinater.
- Skriptet validerer resultatet mot `Catalog` før det skriver, og skriver atomisk (midlertidig fil + rename). Ved feil står forrige `data/catalog.json` urørt.
- Identifiserende User-Agent på alle kall. Begrenset samtidighet mot Kartverket.
- Nye avhengigheter pinnes eksakt: `zod` 4.6.5, `tsx` 4.23.13 (dev).

**Never:**
- Ingenting utenfor `scripts/build-catalog/` importerer skriptet. Appen og dataprogrammet kaller aldri OSM eller Kartverket.
- Ingen filer i `supabase/` eller `src/lib/supabase/`. Ingen demokatalog eller demo-fixtures (Story 1.10).
- Ingen nettverkskall i tester; tester bruker små innebygde svar.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Normal kjøring | Alle kilder svarer | `data/catalog.json` med ~300 steder, sortert på `id` | N/A |
| Overpass opptatt | HTML/5xx/timeout fra Overpass | Nye forsøk med økende ventetid, så neste speil | Alle feiler → avbryt med tydelig melding, ingen fil skrives |
| Navn ikke funnet | Seed-navn uten treff i Kartverket | Ingen fil skrives | Liste over alle navn som feilet |
| Flertydig navn | Flere treff for et seed-navn | Treff med riktig `navneobjekttype` og kommune fra seed | Fortsatt flertydig → feil, som over |
| Duplikat | Samme sted fra to kilder, eller lik slug | Ett sted beholdes; slug får kommune-suffiks | Skjemaet avviser gjenværende duplikater |
| Ugyldig verdi | Koordinat utenfor Norge-boks, manglende høyde | Stedet avvises | Rapporteres i oppsummeringen |

</frozen-after-approval>

## Code Map

- `eslint.config.js` -- én blokk med `globals.browser` for alle filer. Legg til en blokk for `scripts/**` med `globals.node` (utsatt fra 1.1, se `deferred-work.md`).
- `tsconfig.app.json` -- inkluderer `src`, `shared`. Ny `tsconfig.scripts.json` (samme mønster som `tsconfig.node.json`, `include: ["scripts"]`, `types: ["node"]`, egen `tsBuildInfoFile`), og en referanse i `tsconfig.json`.
- `vite.config.ts` -- Vitest `include` mangler `scripts/**/*.test.ts` (AD-4). `supabase/functions/**` kan stå (1.10 rydder).
- `package.json` -- legg til script `catalog` = `tsx scripts/build-catalog/index.ts`. Ikke legg det inn i `build`/`test`.
- `scripts/build-catalog/.gitkeep`, `shared/.gitkeep` -- fjern når mappene får filer.
- `.githooks/pre-push` -- kjører lint/typecheck/test/build; nye filer må passere den.
- Kartverket stedsnavn: `GET https://api.kartverket.no/stedsnavn/v1/sted?sok=<navn>&navneobjekttype=<Fjell|By|...>&utkoordsys=4258` → `navn[].representasjonspunkt.{nord,øst}`, `kommuner[].kommunenavn`. Wildcard-søk alene er ikke tillatt.
- Kartverket høyde: `GET https://ws.geonorge.no/hoydedata/v1/punkt?koordsys=4258&nord=<lat>&ost=<lon>&geojson=false` → `punkter[0].z`.
- Overpass: `nwr["landuse"="winter_sports"]["name"]` innenfor Norge-område, `out center tags`. Speil: `overpass-api.de`, `overpass.kumi.systems`. Begge var overbelastet 2026-10-07.

## Tasks & Acceptance

**Execution:**
- [x] `package.json`, `package-lock.json` -- legg til `zod` 4.6.5, `tsx` 4.23.13 og scriptet `catalog`.
- [x] `eslint.config.js`, `tsconfig.json`, `tsconfig.scripts.json`, `vite.config.ts` -- Node-globaler, typesjekk og testdekning for `scripts/`.
- [x] `shared/contracts/catalog.ts` -- Zod `Sted`-for-katalog (`CatalogEntry`) og `Catalog` (`{ generert: ISO-UTC, steder: CatalogEntry[] }`), med unike `id`, 4-desimals-sjekk og Norge-boks (lat 57,9–71,2, lon 4,5–31,2). Bare `zod`-import (AD-6).
- [x] `shared/contracts/catalog.test.ts` -- gyldig katalog godtas; duplikat-id, 5 desimaler, utenfor boks og ukjent type avvises.
- [x] `scripts/build-catalog/seeds.json` -- manuelt kvalitetssikret liste: `{ navn, type, kommune }` for fjelltopper og byer, pluss `ekskluder`/`inkluder` for OSM-skisteder.
- [x] `scripts/build-catalog/` (`index.ts`, `osm.ts`, `kartverket.ts`, `build.ts`) -- henting med nye forsøk/speil, normalisering, slug-id, avrunding, dedup, validering, atomisk skriving, oppsummering til konsollen. Ren logikk i `build.ts` uten nettverk.
- [x] `scripts/build-catalog/build.test.ts` -- dekker matrisens rader med innebygde svar.
- [x] `data/catalog.json` -- kjør `npm run catalog` og commit resultatet.
- [x] `README.md` -- kort avsnitt om `npm run catalog`.

**Acceptance Criteria:**
- Given et rent klon, when `npm ci && npm run lint && npm run typecheck && npm test && npm run build` kjøres, then alt går grønt uten nettverk.
- Given `data/catalog.json`, when den parses med `Catalog`, then den er gyldig og har 250–350 steder.
- Given kodebasen, when man søker etter importer av `scripts/build-catalog`, then finnes ingen utenfor mappen.

## Implementation Notes

- La til `http.ts` (User-Agent, nye forsøk, samtidighetsgrense) og oppslag i Kartverkets `kommuneinfo` for OSM-steder med lik slug.
- `navneobjekttype`-filteret i stedsnavn-API-et gir ingen treff for f.eks. Molde som `By`, så typen filtreres i koden.
- Overpass-området for Norge inkluderer Svalbard; skisteder utenfor Norge-boksen forkastes før rangering.
- Skriptet nekter å skrive hvis antallet havner utenfor 250–350.
- Noen steder har Kartverkets skrivemåte (Trysil sentrum heter «Innbygda»).

## Spec Change Log

## Review Triage Log

**Gjennomgang 2026-10-07** (Blind Hunter, Edge Case Hunter, Verification Gap). Ingen intent_gap eller bad_spec, så ingen loopback.

| # | Lag | Funn | Verdikt | Rute | Begrunnelse |
|---|---|---|---|---|---|
| 1 | blind | OSM-utvalget har stadioner, hoppbakker, skileik, en skiklubb og et sommerskisenter, mens Kvitfjell, Oppdal, Myrkdalen, Narvikfjellet, Kongsberg, Gaustablikk, Sjusjøen og Bjorli mangler | medium | patch | Bekreftet i `data/catalog.json`. Kurateringen er laget for dette (`ekskluder`/`inkluder` i `seeds.json`); lista må fylles og skriptet kjøres på nytt. |
| 2 | blind, edge | Samme anlegg to ganger under ulike navn (Alphapark/Voss Resort 0,45 km, Ringkollen alpinbakke/skistadion 0,51 km) | medium | patch | Bekreftet: to OSM-par under 1 km. OSM-dedup krever likt navn. Par på tvers av typer (Geilo by / Ski Geilo) er forskjellige stedstyper og beholdes. |
| 3 | blind, edge | Fjelltopp eller by fra `seeds.json` som avvises i `finalize` (høyde/boks), forsvinner med bare en konsollinje | medium | patch | Bekreftet i `index.ts`: bare `printRejections`. Strider mot «Navn ikke funnet → ingen fil skrives» og README. |
| 4 | blind, edge | Skisteder som avvises etter utvalget, fylles ikke opp | low | reject | Skjer ikke i dagens kjøring (150 av 150); ville kreve reserveliste. |
| 5 | blind | Id-er er ikke stabile over gjenoppbygginger (suffiks bare ved kollisjon i samme kjøring) | low | reject | Ny bygging er manuell og id-endringer synes i PR-diffen; ingen bruker id-er ennå. Løsningen krever ny mekanisme. |
| 6 | blind, edge, vg | `fetchKommune` sluker alle feil, ikke bare 404 | low | patch | Bekreftet: bar `catch`. Liten rettelse: kast videre alt annet enn HTTP 404. |
| 7 | blind, edge | Navnesøk henter bare første side (100 treff) | low | reject | Feiler høylytt med «ingen treff» for seeden; alle dagens seeds løses. |
| 8 | blind | `hoyde` betyr ulikt for skisted (terreng i områdets senter), topp og by | low | patch | Ikke dokumentert noe sted; en kommentar på feltet i `catalog.ts` holder. |
| 9 | blind | Status i spesifikasjon og `sprint-status.yaml` er ulike, og KI-loggen mangler | false | reject | Begge oppdateres i steg 5 av arbeidsflyten, før commit. |
| 10 | blind, vg | `index.ts` (fatale stier, atomisk skriving) har ingen tester | medium | defer | Krever omskriving til `run(deps, paths)`. Skriptet kjøres for hånd og resultatet gjennomgås i PR. |
| 11 | vg | Ingen test sjekker den committede `data/catalog.json` mot `Catalog` og 250–350 | medium | patch | Bekreftet: ingen test leser fila. |
| 12 | blind, edge | `slugify` mangler đ/ŋ/ŧ, og regex-en har usynlige tegn | low | patch | Direkte rettelse: eksplisitte erstatninger og `̀-ͯ`. |
| 13 | blind | `shared/**` får nettleser-globaler i ESLint | low | patch | Direkte rettelse i `eslint.config.js`. |
| 14 | vg | Ingenting håndhever at bare `scripts/build-catalog/` importerer skriptet | low | patch | En `no-restricted-imports`-regel er en direkte konfig-rettelse. |
| 15 | edge | Samisk/kvensk kommunenavn: `.at(-1)` gir feil del for f.eks. Hamarøy | low | reject | Påvirker bare suffiks ved kollisjon; sjelden og kosmetisk. |
| 16 | edge | Suffiksert id kan fortsatt kollidere | false | reject | `Catalog.parse` kaster høylytt; det er riktig oppførsel. |
| 17 | edge | Treff uten `representasjonspunkt` gir TypeError | false | reject | Høylytt feil, ingen stille skade; API-et har alltid feltet i observerte svar. |
| 18 | blind | Navn i både `inkluder` og `ekskluder` forsvinner stille | low | reject | Usannsynlig; krever ny vakt. |
| 19 | blind | `getJson` tar ikke med svarteksten ved 4xx | low | reject | Kosmetisk; status og URL står i feilen. |

## Design Notes

- **Utvalg av skisteder:** OSM gir flere navngitte `winter_sports`-områder enn 150. Rangér deterministisk: først de med `wikidata`- eller `website`-tagg (et mål på hvor kjent stedet er), så med `piste:type`, deretter navn. Ta de 150 første etter `ekskluder`, og legg alltid til `inkluder`.
- **Kartverket-typer:** `fjelltopp` matcher `navneobjekttype` i {Fjell, Topp}; `by` matcher {By, Tettsted}. Galdhøpiggen er registrert som `Fjell`.
- **Slug:** små bokstaver, æ→ae, ø→o, å→a, andre tegn → `-`. Ved kollisjon legges kommunen til (`storhogna-engerdal`).

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: alt exit 0.
- `npm run catalog` -- expected: skriver `data/catalog.json` og en oppsummering per type; ved kildefeil exit ≠ 0 og fila er urørt.

**Manual checks (if no CLI):**
- Stikkprøv 10 steder i `data/catalog.json` mot norgeskart.no (navn, plassering, høyde ±50 m).
