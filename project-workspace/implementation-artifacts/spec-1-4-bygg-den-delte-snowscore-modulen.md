---
title: 'Story 1.4: Bygg den delte SnowScore-modulen'
type: 'feature'
created: '2026-10-07'
status: 'done'
baseline_commit: '8c92e631a71c0f57a646a4ec4f959cfedfc3d81e'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** SnowScore er kjernen i appen, men formelen finnes bare i briefen. Dataprogrammet (1.5), forklaringssiden (Epic 2) og filteret (Epic 3) trenger én felles, testet implementasjon (FR-7, AD-6).

**Approach:** Ren TypeScript-modul `shared/snowscore.ts` som tar en liste med timesverdier og gir enten SnowScore med delpoeng eller «ufullstendige data». Egenskapstester med fast-check og en fasittabell i `tests/golden/snowscore.json` låser formelen.

## Boundaries & Constraints

**Always:**
- Formelen er nøyaktig briefens: f(T) = min(1, max(0, (2 − T)/2)); S = Σ pₕ·f(Tₕ); P = Σ pₕ; T̄ = snitt av Tₕ; A = 60·min(1, S/20); B = 25·min(1, max(0, (2 − T̄)/16)); C = 15·S/P; B = C = 0 når P < 0,5 mm; score = round(A + B + C).
- Ufullstendige data: en time mangler når nedbør eller temperatur er `null`. Mangler mer enn 10 % av timene (strengt større), eller er lista tom, er resultatet «ufullstendig» uten tall — aldri 0. Ellers beregnes alt over timene som finnes.
- Delpoengene returneres uavrundet; bare totalen avrundes. Omregningen 1 mm ≈ 1 cm eksporteres herfra og ingen andre steder.
- Ingen tredjepartsimport i modulen. `src/lib/snowscore.ts` bare re-eksporterer den.
- `fast-check` 4.10.1 legges til som dev-avhengighet, pinnet eksakt.

**Never:**
- Ingen integrasjon i dataprogrammet, ingen UI og ingen valg av tidsvindu (Story 1.5).
- Ingen kopi av formelen andre steder.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Briefens eksempel | 6 timer, p = 1,3,4,3,1,0; T = −1,−3,−4,−3,−2,−1 | A = 36, B ≈ 6,77, C = 15, score 58 | N/A |
| Tørt og kaldt | P < 0,5 mm, T̄ = −20 | B = C = 0, A = 60·S/20 (høyst 1,5) | N/A |
| Grense nedbør | P = 0,5 mm nøyaktig | B og C beregnes (grensen er inklusiv for P ≥ 0,5) | N/A |
| Snøandel-grenser | T = 0 og T = 2 | f = 1 ved T ≤ 0, f = 0 ved T ≥ 2, lineært mellom | N/A |
| Tak | S ≥ 20 mm, T̄ ≤ −14 °C, all nedbør som snø | A = 60, B = 25, C = 15, score 100 | N/A |
| Akkurat 10 % mangler | 10 timer, 1 med `null` | Beregnes over de 9 timene | N/A |
| Over 10 % mangler | 10 timer, 2 med `null`; eller tom liste | `{ kind: 'incomplete' }` med andel som mangler | Ingen score |
| Ugyldig verdi | negativ nedbør eller `NaN`/`Infinity` | — | Kaster `RangeError` (data skal være validert i 1.3) |

</frozen-after-approval>

## Code Map

- `shared/contracts/catalog.ts` -- eksisterende mønster for `shared/`: én fil, engelske navn, `// AD-…`-kommentarer for hvorfor.
- `shared/contracts/catalog.test.ts` -- mønster for å lese en committet JSON-fil i test (`readFileSync(new URL(..., import.meta.url))`).
- `vite.config.ts` -- Vitest inkluderer allerede `shared/**/*.test.ts`; ingen endring trengs.
- `tsconfig.app.json` -- inkluderer `src` og `shared`; ingen endring trengs.
- `src/lib/supabase/`, `supabase/` -- ikke rør (fjernes i Story 1.10).

## Tasks & Acceptance

**Execution:**
- [x] `package.json`, `package-lock.json` -- legg til `fast-check` 4.10.1 (dev, eksakt).
- [x] `shared/snowscore.ts` -- eksporter `HourlyValue` (`{ precipitationMm: number | null; temperatureC: number | null }`), `computeSnowScore(hours)` som gir `{ kind: 'score'; score; a; b; c; newSnowMm; precipitationMm; meanTemperatureC }` eller `{ kind: 'incomplete'; missingShare }`, `snowFraction(t)`, `mmToCm(mm)` og konstantene (60/25/15, 20 mm, 16, 0,5 mm, 10 %) samlet i ett eksportert objekt.
- [x] `src/lib/snowscore.ts` -- `export * from '../../shared/snowscore'`.
- [x] `tests/golden/snowscore.json` -- fasittabell med matrisens tilfeller (inndata time for time, forventet A/B/C/score eller «incomplete»), og en `grenser`-tekst som sier hvilke grenser som er inklusive.
- [x] `shared/snowscore.test.ts` -- kjører hver rad i fasittabellen (A/B/C med toleranse 1e-9, score eksakt); egenskapstester med fast-check (`numRuns: 1000`): score 0–100 og heltall; mer nedbør i én time med T ≤ 0 senker aldri A; lavere temperatur i alle timer senker aldri B; P < 0,5 gir B = C = 0; samme inndata gir samme resultat; dessuten `RangeError`-tilfellene og at `src/lib/snowscore.ts` eksporterer samme funksjon.

**Acceptance Criteria:**
- Given et rent klon, when `npm ci && npm run lint && npm run typecheck && npm test && npm run build` kjøres, then alt er grønt.
- Given kodebasen, when man søker etter formelens konstanter (f.eks. `/ 16`, `60 *`), then finnes de bare i `shared/snowscore.ts`.

## Implementation Notes

- `SNOWSCORE` samler alle konstantene. En tom liste gir `incomplete` med `missingShare: 1`.
- Alle timer valideres før noe annet, også når resultatet ellers ville blitt «ufullstendig».
- Fasittabellen har norske feltnavn (`grenser`, `tilfeller`). `NaN`/`Infinity` testes i kode, fordi JSON ikke kan uttrykke dem.

## Spec Change Log

## Review Triage Log

**Gjennomgang 2026-10-07** (Blind Hunter, Edge Case Hunter, Verification Gap). Ingen intent_gap eller bad_spec, så ingen loopback.

| # | Lag | Funn | Verdikt | Rute | Begrunnelse |
|---|---|---|---|---|---|
| 1 | edge, blind | Timesverdier som summerer til nøyaktig 0,5 mm kan gi 0,49999999999999994, så B og C blir 0 ved den inklusive grensen | medium | patch | Bekreftet: ti timer med 0,05 mm gir 0,49999999999999994. Liten toleranse i sammenligningen og en test. |
| 2 | edge | Ekstremt store verdier gir overflyt til Infinity og NaN-score | low | reject | Fysisk umulige verdier; data valideres mot gyldig område i 1.3. |
| 3 | edge | Ingen øvre grense for nedbør | low | reject | Hører til valideringen i 1.3 (dataordboken). |
| 4 | edge, blind | `snowFraction(NaN)` gir NaN uten feil | low | reject | Krever ny vakt; ingen kaller den med ukontrollerte verdier ennå. |
| 5 | edge | `null`-element i lista gir TypeError, ikke RangeError | false | reject | Typen tillater det ikke, og feilen er uansett høylytt. |
| 6 | vg | `newSnowMm`, `precipitationMm` og `meanTemperatureC` sjekkes ikke mot verdier | medium | patch | Bekreftet: fasittabellen har bare a/b/c/score. Forklaringssiden skal vise disse. |
| 7 | vg, blind | RangeError testes bare i timer der begge verdiene finnes | low | patch | Rekkefølgen «valider før alt annet» er ikke låst av noen test. |
| 8 | vg, blind | Raden «akkurat 10 % mangler» kan ikke skille hvilke timer T̄ regnes over | low | patch | Alle timene har −7 °C. Gi den delvis manglende timen en annen temperatur. |
| 9 | blind | Fasittabellen mangler B = 0 ved vått og varmt, A-tak med blandede temperaturer, og total på nøyaktig x,5 | low | patch | Rene datatilføyelser som låser grensene. |
| 10 | blind | Ingen egenskapstest for at >10 % mangler alltid gir «incomplete» og ≤10 % alltid gir score | low | patch | Spesifikasjonens viktigste regel; én egenskapstest. |
| 11 | blind | Testen i `shared/` importerer fra `src/` | low | patch | Feil retning på avhengigheten; flytt re-eksport-testen til `src/lib/snowscore.test.ts` og sjekk alle eksportene. |
| 12 | blind | Parameteren `golden` skygger modulkonstanten | low | patch | Direkte omdøping. |
| 13 | blind | Ingen KI-logg, og ulik status i spesifikasjon og sprint-status | false | reject | Begge oppdateres i steg 5 før commit. |
| 14 | blind | `package-lock.json` mangler i diffen | false | reject | Utelatt med vilje fra gjennomgangsdiffen; fila er oppdatert med `fast-check` 4.10.1 pinnet. |
| 15 | blind | Determinismetesten sjekker ikke at input ikke endres | low | reject | Parameteren er `readonly`, og koden skriver ikke til lista. |

## Design Notes

- Tidsvinduets lengde (f.eks. neste 24 t) er ikke bestemt i planene og velges i Story 1.5. Modulen tar derfor hele lista den får som vinduet.
- Delpoeng returneres uavrundet så forklaringssiden kan vise utregningen nøyaktig; UI avrunder for visning.

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: alt exit 0, fasittabellen og egenskapstestene passerer.
