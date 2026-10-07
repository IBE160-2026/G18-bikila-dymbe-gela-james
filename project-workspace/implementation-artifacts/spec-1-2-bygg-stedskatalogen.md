---
title: 'Story 1.2: Bygg stedskatalogen'
type: 'feature'
created: '2026-10-07'
status: 'ready-for-dev'
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
- [ ] `package.json`, `package-lock.json` -- legg til `zod` 4.6.5, `tsx` 4.23.13 og scriptet `catalog`.
- [ ] `eslint.config.js`, `tsconfig.json`, `tsconfig.scripts.json`, `vite.config.ts` -- Node-globaler, typesjekk og testdekning for `scripts/`.
- [ ] `shared/contracts/catalog.ts` -- Zod `Sted`-for-katalog (`CatalogEntry`) og `Catalog` (`{ generert: ISO-UTC, steder: CatalogEntry[] }`), med unike `id`, 4-desimals-sjekk og Norge-boks (lat 57,9–71,2, lon 4,5–31,2). Bare `zod`-import (AD-6).
- [ ] `shared/contracts/catalog.test.ts` -- gyldig katalog godtas; duplikat-id, 5 desimaler, utenfor boks og ukjent type avvises.
- [ ] `scripts/build-catalog/seeds.json` -- manuelt kvalitetssikret liste: `{ navn, type, kommune }` for fjelltopper og byer, pluss `ekskluder`/`inkluder` for OSM-skisteder.
- [ ] `scripts/build-catalog/` (`index.ts`, `osm.ts`, `kartverket.ts`, `build.ts`) -- henting med nye forsøk/speil, normalisering, slug-id, avrunding, dedup, validering, atomisk skriving, oppsummering til konsollen. Ren logikk i `build.ts` uten nettverk.
- [ ] `scripts/build-catalog/build.test.ts` -- dekker matrisens rader med innebygde svar.
- [ ] `data/catalog.json` -- kjør `npm run catalog` og commit resultatet.
- [ ] `README.md` -- kort avsnitt om `npm run catalog`.

**Acceptance Criteria:**
- Given et rent klon, when `npm ci && npm run lint && npm run typecheck && npm test && npm run build` kjøres, then alt går grønt uten nettverk.
- Given `data/catalog.json`, when den parses med `Catalog`, then den er gyldig og har 250–350 steder.
- Given kodebasen, when man søker etter importer av `scripts/build-catalog`, then finnes ingen utenfor mappen.

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
