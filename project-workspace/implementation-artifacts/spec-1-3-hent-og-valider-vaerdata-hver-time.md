---
title: 'Story 1.3: Hent og valider værdata hver time'
type: 'feature'
created: '2026-10-07'
status: 'ready-for-dev'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-1-context.md'
  - '{project-root}/project-workspace/implementation-artifacts/spec-1-10-kjor-snowfinder-lokalt-med-demodata.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Dataprogrammet kan bare kjøre på innspilte svar (`npm run data:demo`). Det finnes ingen henting av ekte MET- og NVE-data for de 300 stedene i katalogen (FR-2, FR-3).

**Approach:** Nytt steg `scripts/pipeline/fetch.ts` som henter MET Locationforecast og NVE `fsw` for hvert sted i `data/catalog.json` og legger svarene i `RunContext.raw`. `npm run data` kjører fetch → validate → score og skriver ut kvalitetsrapporten. Publisering til `latest.json` kommer i Story 1.5.

## Boundaries & Constraints

**Always:**
- Identifiserende User-Agent på alle kall, uten nøkler. Begrenset samtidighet (høyst 5 kall samtidig per kilde) og tidsavbrudd per kall (20 s).
- Ett forsøk per sted og kilde i v1 (nye forsøk er Bør ha, Story 1.6). Ingen tilstand mellom kjøringer: ingen `If-Modified-Since`/`Expires`, ingen gjenopptakelse.
- Et kall som feiler (nettverk, tidsavbrudd, HTTP-feil, ikke-JSON) gir ingen data for den kilden; `validate.ts` registrerer det som avvist med sted, kilde og årsak. Ingenting rettes automatisk.
- Live-kjøringens referansetid er starttidspunktet (veggklokka), og kjørings-ID-en er unik per kjøring.
- URL-byggerne for MET og NVE ligger ett sted (`fetch.ts`); `tests/contract/record-fixtures.ts` bruker dem i stedet for egne kopier.
- `fetch.ts` tar `fetch`-funksjonen som avhengighet, så testene aldri bruker nettverket.

**Never:**
- Ingen skriving av `latest.json` eller andre filer i denne storyen (Story 1.5).
- Ingen nye forsøk, kretsbryter eller varsling.
- Ingen endring i `npm run data:demo` eller `public/data/demo.json`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Normal kjøring | Alle kall svarer 200 med gyldig JSON | Alle 300 steder har rå MET- og NVE-svar i `ctx.raw`; rapporten skrives ut | N/A |
| MET feiler for ett sted | Nettverksfeil, 5xx, 429 eller tidsavbrudd | Ingen MET-data for stedet | Avvist i rapporten (`kilde: met`, årsak med status/feil); kjøringen fortsetter |
| NVE uten rute | HTTP 400 «No cell exists» (kyst) | `nveNysnoSisteDognMm` blir `null` | Avvist som NVE i rapporten; teller ikke mot terskelen |
| Ugyldig svar | JSON som feiler Zod | Avvist av `validate.ts` | Registreres i rapporten, aldri rettet |
| Samtidighet | 300 steder | Høyst 5 kall i gang per kilde | N/A |
| Avbrutt kjøring | Prosessen stoppes midtveis | Ingenting skrives | Neste kjøring starter på nytt |

</frozen-after-approval>

## Code Map

- `scripts/pipeline/run.ts` -- `runDemo` er mønsteret: tom kontekst, steg i rekkefølge, rapport i `finally`. Legg til `runLive` og la `main` kjøre den uten `--demo`; i dag gir manglende `--demo` exit 2.
- `scripts/pipeline/sources/fixtures.ts` -- `readFixtures(ctx)` fyller `ctx.raw` (`RawResponses`: `stedId`, `met`, `nve`); `fetch.ts` skal gi samme form.
- `shared/contracts/run.ts` -- `RunContext`, `RawResponses`; `shared/geo.ts` -- UTM33 for NVE.
- `tests/contract/record-fixtures.ts` -- har egne `metUrl`, `nveUrl`, `getJson` og User-Agent; flytt URL-byggerne til `fetch.ts`.
- `data/catalog.json` + `shared/contracts/catalog.ts` -- live-katalogen (300 steder), parses med `Catalog`.
- `scripts/build-catalog/http.ts` -- har `mapLimit`, men AD-5 forbyr import utenfra; lag en egen liten begrenser i `scripts/pipeline/`.

## Tasks & Acceptance

**Execution:**
- [ ] `scripts/pipeline/fetch.ts` -- `metUrl`, `nveUrl`, `fetchAll(ctx, { fetchFn, concurrency, timeoutMs })`; feil blir manglende svar med årsak.
- [ ] `scripts/pipeline/validate.ts` -- registrer manglende svar (ikke bare ugyldige) som avvist med årsaken fra fetch.
- [ ] `scripts/pipeline/run.ts` -- `runLive`: les `data/catalog.json`, fetch → validate → score, skriv rapporten (ikke publiser); `main` kjører den uten `--demo`.
- [ ] `package.json` -- `"data": "tsx scripts/pipeline/run.ts"`.
- [ ] `tests/contract/record-fixtures.ts` -- bruk URL-byggerne fra `fetch.ts`.
- [ ] `scripts/pipeline/fetch.test.ts`, `run.test.ts` -- falsk `fetchFn`: normal kjøring, MET-feil, NVE 400, tidsavbrudd, ikke-JSON, samtidighetsgrense (aldri over 5), og at User-Agent sendes.
- [ ] `shared/contracts/data-dictionary.md`, `README.md` -- kort om `npm run data` (krever nett, skriver ingen fil ennå).

**Acceptance Criteria:**
- Given et rent klon, when `npm ci && npm run lint && npm run typecheck && npm test && npm run build` kjøres uten nett, then alt er grønt.
- Given nettilgang, when `npm run data` kjøres, then hentes alle 300 steder og kvalitetsrapporten skrives ut, og ingen fil endres.

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: alt exit 0.
- `npm run data` (med nett) -- expected: rapport med ~300 steder og `git status` uendret.
