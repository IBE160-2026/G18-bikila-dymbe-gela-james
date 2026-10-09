---
title: 'Story 2.1: Les «Kort fortalt» og «Steg for steg»'
type: 'feature'
created: '2026-10-09'
status: 'done'
baseline_commit: '75dc121b5936ea295b6cebbb6232acea264dde96'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-2-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** SnowScore vises på kart, liste og stedsside, men ingen steder forklarer hva tallet måler eller hvordan det regnes ut (FR-8).

**Approach:** En ny side «Slik beregner vi SnowScore» på `/slik-beregner-vi-snowscore` med «Kort fortalt», «Steg for steg» (formel og én SVG-illustrasjon per delpoeng A/B/C) og «Endringslogg». Siden nås fra toppnavigasjonen og fra en lenke ved hver score-visning. Alle tall og parametere kommer fra `shared/snowscore.ts`.

## Boundaries & Constraints

**Always:**
- Tall i tekst, formel og illustrasjoner leses fra `SNOWSCORE` (og `WINDOW_HOURS`), aldri skrevet for hånd. En test bekrefter at teksten følger konstantene.
- Versjonen bor ett sted: `SNOWSCORE_VERSION` ved siden av `SNOWSCORE`. Endringsloggens nyeste rad har samme versjon (test).
- Siden venter ikke på data: den vises med en gang, også mens data lastes og når lastingen feiler.
- Toppnavigasjonen: «SnowFinder» · «Slik beregner vi SnowScore». Under 768 px kollapser lenkene bak en ☰-knapp (`aria-expanded`, `aria-controls`). Den aktive lenken har `aria-current="page"`.
- Lenker fra score-visninger: én lenke på Utforsk som gjelder både kart og liste (ved visningsveksleren), og én i SnowScore-kortet på stedssiden. `ScoreBadge` forblir en `span`, og tooltip-teksten endres ikke.
- Hver illustrasjon er `role="img"` med et tekstalternativ som sier det samme som grafen. Ingen informasjon bare med farge. Trykkmål ≥ 44 px, fokusring i `accent`, bare tokens fra `tokens.css`.

**Never:**
- Regneeksempel (2.2), datakilder, begrensninger og datakvalitet (2.3) eller kalkulator (2.4).
- Endre formelen, `ScoreBadge`, `kartMarkor.ts` eller nye avhengigheter.
- Gjøre badgen eller listeraden om til nestede lenker.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Direkte adresse | `/slik-beregner-vi-snowscore` og med avsluttende `/` | Forklaringssiden | N/A |
| Under base-sti | base `/G18/`, sti `/G18/slik-beregner-vi-snowscore` | Forklaringssiden; `href` gir samme sti | N/A |
| Ukjent understi | `/slik-beregner-vi-snowscore/x` | «Fant ikke siden» | N/A |
| Data laster/feiler | `result` er `null` eller `error` | Forklaringen vises, uten skjelett eller feilmelding | N/A |
| Tom Utforsk | Ingen ferske steder | Ingen score vises, derfor ingen forklaringslenke ved veksleren | N/A |

</frozen-after-approval>

## Code Map

- `shared/snowscore.ts` -- `SNOWSCORE`, `WINDOW_HOURS`, `snowFraction`. Legg til `SNOWSCORE_VERSION = '1.0'`. Formelen røres ikke.
- `src/lib/router.ts` -- `Route`, `parseRoute`, `href`. Ny variant `{ name: 'forklaring' }`.
- `src/lib/router.test.ts` -- tester for ruten etter mønsteret som finnes.
- `src/App.tsx` -- `AppView`/`Innhold`. Forklaringen rutes før `result === null`-sjekken. Headeren får navigasjonen.
- `src/App.test.tsx` -- render-tester med `renderToStaticMarkup` (ingen DOM).
- `src/components/Lenke.tsx` -- bruk den for alle interne lenker (`current` gir `aria-current`).
- `src/pages/Utforsk.tsx` -- veksleren vises bare når det finnes steder. Legg lenken der.
- `src/pages/Sted.tsx` -- SnowScore-kortet (`#sted-snowscore`). Lenken legges under delpoengene.
- `src/lib/scoreTier.ts` -- trinngrensene. Siden kan forklare trinnene ved hjelp av `ScoreBadge` med eksempelverdier.
- `src/App.css`, `src/styles/tokens.css` -- `.app-header`, `.sted-kort`, `.knapp`. Bare variabler.
- `tests/e2e/sted.spec.ts` -- mønster for nettverksisolering og axe-test.

## Tasks & Acceptance

**Execution:**
- [x] `shared/snowscore.ts` -- legg til `SNOWSCORE_VERSION` med kommentar om at den økes ved hver parameterendring -- én kilde for versjonen.
- [x] `src/lib/router.ts` + `router.test.ts` -- legg til ruten `forklaring` i `parseRoute`/`href`, og test matrisens rader -- siden må kunne lenkes og deles.
- [x] `src/components/Toppnavigasjon.tsx` -- ny: «SnowFinder» og «Slik beregner vi SnowScore» med `aria-current`, og en ☰-knapp under 768 px som viser og skjuler lenkene. Menyen lukkes når en lenke velges -- EXPERIENCE.md-navigasjonen.
- [x] `src/components/ForklaringIllustrasjon.tsx` -- ny: tre små inline SVG-grafer der punktene regnes ut fra `SNOWSCORE`. A: 0→`maxA` ved S = `fullSnowMm`, så flat. B: 0 ved T̄ ≥ `noSnowAtOrAboveC`, `maxB` ved `noSnowAtOrAboveC − coldRangeC`. C: lineær i S/P fra 0 til `maxC`. Aksetitler og `aria-label` -- én illustrasjon per delpoeng.
- [x] `src/pages/SlikBeregnerViSnowScore.tsx` -- ny: `h1`, seksjonene «Kort fortalt» (tre setninger om hva tallet måler og ikke måler, 24-timersvinduet), «Steg for steg» (f(T), S, P, T̄, A, B, C, sum, regelen om P < `minPrecipitationMm`, 1 mm ≈ 1 cm, de fire trinnene vist med `ScoreBadge`) og «Endringslogg» (tabell: versjon, endring, begrunnelse). Første rad: B-nevneren endret fra 6 til `coldRangeC`, med briefens begrunnelse -- FR-8.
- [x] `src/pages/SlikBeregnerViSnowScore.test.tsx` -- ny: rendrer siden og sjekker at maks-poengene, `fullSnowMm`, `coldRangeC` og −14 kommer fra konstantene, at det finnes tre `role="img"` med tekst, og at loggens siste versjon er `SNOWSCORE_VERSION`.
- [x] `src/App.tsx` + `App.test.tsx` -- bruk `Toppnavigasjon`, rut `forklaring`, og test at siden vises ved `null`, `error` og `ok`.
- [x] `src/pages/Utforsk.tsx`, `src/pages/Sted.tsx` -- lenken «Slik beregner vi SnowScore» ved veksleren og i SnowScore-kortet -- FR-8 sier at siden skal være lenket fra hver score.
- [x] `src/App.css` -- stil for nav, meny, forklaringsside, figurer og tabell, og et brytpunkt ved 768 px.
- [x] `tests/e2e/forklaring.spec.ts` -- ny: nås fra navigasjonen, fra listen og fra stedssiden. ☰-menyen fungerer i 375 px bredde. Axe gir ingen `serious`/`critical` brudd.

**Acceptance Criteria:**
- Given jeg er på kart, liste eller stedsside, when jeg trykker på «Slik beregner vi SnowScore» (nav eller lenken ved scoren), then åpnes forklaringssiden og navigasjonslenken har `aria-current="page"`.
- Given forklaringssiden, when den vises, then ser jeg «Kort fortalt», «Steg for steg» med formelen og tre illustrasjoner (A, B, C) med tekstalternativ, og «Endringslogg» med versjon 1.0 og nevner-endringen 6 → 16.
- Given en skjerm smalere enn 768 px, when jeg trykker på ☰, then vises lenkene og knappen har `aria-expanded="true"`.
- Given axe kjøres på siden (bred og smal), then er det ingen `serious` eller `critical` WCAG 2.1 AA-brudd.

## Implementation Notes

- Utenfor Code Map: `TIERS` i `scoreTier.ts` er eksportert, så trinnspennene ikke skrives for hånd. `tall()` i `format.ts` er ny, og `medEnhet` bruker den.
- På mobil er «SnowFinder» synlig på alle bredder. Bare de andre lenkene ligger bak ☰.

## Spec Change Log

## Review Triage Log

Blind Hunter, Edge Case Hunter og Verification Gap, runde 1. Til sammen 23 funn, slått sammen til 16 rader.

| # | Funn | Vurdering | Rute | Begrunnelse |
|---|------|-----------|------|-------------|
| 1 | Rad 1.0 i endringsloggen leser `coldRangeC`/`noSnowAtOrAboveC`, så historikken skriver seg om ved neste endring. Testen låser dette (BH, ECH ×2, VG) | medium | patch | Raden er et historisk faktum. Den skrives med faste tall, og testen sjekker at den står fast når konstantene endres. |
| 2 | Testen «følger konstantene» varierer ikke `noSnowAtOrAboveC`, `allSnowAtOrBelowC`, `minPrecipitationMm`, `maxMissingShare`, `cmPerMm` eller `WINDOW_HOURS` (BH) | low | patch | Rett utvidelse av testen. Ellers ville et håndskrevet «2», «0,5» eller «24» ikke blitt fanget. |
| 3 | ☰-menyen blir stående åpen etter Tilbake/Fram eller en lenke i innholdet (BH, ECH ×2) | medium | patch | Åpen-tilstanden knyttes til ruten, så enhver ruteendring lukker menyen. `onNavigate` i `Lenke` fjernes. |
| 4 | Ingen E2E-test åpner siden via lenken ved veksleren på kartvisningen (BH) | low | patch | Kriteriet nevner kart. Én ekstra test fra `/`. |
| 5 | «Gjeldende versjon» bruker stedssidens klasse `sted-kilde` (BH) | low | patch | Egen klasse, så sidene ikke henger sammen gjennom stilene. |
| 6 | Åpning og lukking av ☰ testes bare i Playwright, som ikke kjører ved push (VG) | medium | defer | Repoet har ikke komponenttester med DOM, og en ny avhengighet krever `bmad-correct-course`. E2E kjøres lokalt og resultatet limes inn i PR-en. |
| 7 | ☰ skjuler bare én lenke, så brukeren må trykke én gang ekstra (BH) | low | defer | Følger EXPERIENCE.md. Spørsmålet går til Sally (`bmad-ux`). |
| 8 | `document.title` og fokus endres ikke ved navigasjon i appen (BH) | medium | defer | Fantes før denne storyen, for alle ruter (også `/sted/:id`). |
| 9 | Escape og klikk utenfor lukker ikke menyen (BH, ECH) | low | avvist | Menyen er en avsløringsknapp (disclosure), ikke en dialog. Knappen lukker den, og ruteendring lukker den etter rad 3. |
| 10 | C-formelen vises som `15 · S / P`, mens koden bruker `min(1, S / P)` (BH, ECH) | false | avvist | f(T) ≤ 1, så S ≤ P alltid. `min` er bare et vern mot flyttallsavrunding, og uttrykkene er like. P < 0,5 mm er forklart rett under. |
| 11 | Deling på null i grafene hvis en maksverdi er 0 (ECH) | false | avvist | `SNOWSCORE` er `as const`, og ingen verdi er 0. Tilstanden kan ikke nås. |
| 12 | To lenker med `aria-current="page"` på kartvisningen (ECH) | false | avvist | Begge peker til samme side, og det er tillatt etter ARIA. |
| 13 | Grafteksten krymper på smal skjerm (BH) | false | avvist | Ved 375 px er figuren ~311 px bred mot viewBox 320, altså 97 % skala. Skjermbildet ved 375 px viste lesbar tekst. |
| 14 | B-grafen mangler tall på de flate delene (BH) | false | avvist | De flate linjene vises, og y-aksen er merket med 0 og 25. Grafen sier det samme som teksten. |
| 15 | Trinnlisten forutsetter rekkefølgen i `TIERS` uten test (BH) | low | avvist | `tierFor` har alltid forutsatt samme rekkefølge. Siden innfører ingen ny forutsetning. |
| 16 | KI-logg, fremdriftsplan og sporing mangler (BH) | false | avvist | Det skrives ved leveringen, før PR-en. |

## Design Notes

Lenker fra score: tooltipen i Leaflet er bare hover-tekst og listeraden er allerede en lenke, så lenken settes ved siden av, ikke inni. Én lenke ved veksleren dekker både kart og liste. Det avviker fra ordlyden «kart-tooltip, listerad», men oppfyller FR-8 («lenket fra hver SnowScore-visning»), slik epic-konteksten ber spec-en avklare.

Versjon 1.0 er den første publiserte formelen. Nevner-endringen skjedde i planleggingen, før noe ble publisert, og står derfor som rad 1.0 med «B-nevneren 6 → 16».

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: alt grønt.
- `npx playwright test` -- expected: alle E2E-tester grønne, også den nye `forklaring.spec.ts`.

**Manual checks (if no CLI):**
- `npm run dev`: åpne siden fra nav, liste og stedsside i bred og 375 px bredde, og sjekk at grafene er lesbare og fokusringen synlig.
