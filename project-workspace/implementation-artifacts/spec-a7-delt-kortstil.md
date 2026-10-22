---
title: 'A7: én Formel-komponent, en delt kortklasse og en delt talliste'
type: 'refactor'
created: '2026-10-22'
status: 'done'
baseline_commit: 'db96a4254142822bc53291007f456f850b8b35f5'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Retrospektiven for Epic 2 (R7, R8, tiltak A7) fant at samme kode og stil er skrevet flere ganger. `Formel` er definert i to filer. Kortstilen (kant, `rounded-md`, `surface-raised`) står i fire klasser: `.sted-kort`, `.datakvalitet`, `.kalkulator-resultat` og `.forklaring-figur`. Kalkulatoren låner stedssidens `.sted-tall`. Filterpanelet i Epic 3 vil trenge de samme kortene og tallistene, og da vil kopiene bli flere.

**Approach:**
- `Formel` blir én komponent i `src/components/`, brukt av begge sidene.
- En nøytral klasse `.kort` får den delte kortstilen. De fire elementene får `kort` i tillegg til sin egen klasse, og den egne klassen beholder bare det som er særegent (for eksempel figurens mindre utfylling).
- `.sted-tall` får det nøytrale navnet `.tall-liste`, og både stedssiden og kalkulatoren bruker det.
- **Beslutning:** `App.css` deles ikke opp nå. Seksjonene ligger om hverandre (navigasjonen etter stedssiden), og rekkefølgen styrer hvilken regel som vinner, så en oppdeling er en egen risiko uten gevinst for brukeren. Ny stil for filterpanelet i Epic 3 kan ligge i en egen fil.
- Ingenting skal se annerledes ut.

## Boundaries & Constraints

**Always:** Utseendet er uendret: kant, hjørner, bakgrunn og utfylling på de fire kortene og tallistene er de samme før og etter. Bare variabler fra `tokens.css` (AD-9). `.kort` står i `App.css` før de fire kortklassene, så en kortklasse fortsatt kan overstyre den.

**Never:** Ingen ny avhengighet, ingen CSS-moduler eller nytt verktøy. Ikke del opp `App.css`. Ikke endre tekst, struktur eller tilgjengelighet (roller, `aria-*`, overskrifter).

</frozen-after-approval>

## Code Map

- `src/components/Regneeksempel.tsx:40` og `src/pages/SlikBeregnerViSnowScore.tsx:59` -- de to like `Formel`-funksjonene (`<p className="formel">`). Flyttes til `src/components/Formel.tsx`.
- `src/App.css:272` (`.sted-kort`), `:506` (`.forklaring-figur`, utfylling `spacing-3`), `:625` (`.datakvalitet`), `:689` (`.kalkulator-resultat`, `display: block`) -- de fire kortene. `:299–318` -- `.sted-tall` med `div` og `dd`.
- `src/pages/Sted.tsx:12, 43, 61`, `src/components/Kalkulator.tsx:153, 155`, `src/components/Datakvalitet.tsx:53`, `src/components/ForklaringIllustrasjon.tsx:115` -- markup som får `kort` eller `tall-liste`.
- Tester som matcher klassestrenger: `src/App.test.tsx:182, 205`, `src/components/Datakvalitet.test.tsx:74`, `tests/e2e/sted.spec.ts:16` (`.sted-tall div`). E2E-lokatorene `.sted-kort` og `.kalkulator-resultat` virker fortsatt, fordi klassene beholdes.

## Tasks & Acceptance

**Execution:**
- [x] `src/components/Formel.tsx` -- ny komponent med samme markup; importer den i `Regneeksempel.tsx` og `SlikBeregnerViSnowScore.tsx`, og fjern de lokale kopiene.
- [x] `src/App.css` -- legg `.kort` (kant, `rounded-md`, `surface-raised`, utfylling `spacing-4`) før kortklassene, fjern de delte deklarasjonene fra de fire, og gi `.sted-tall` med under-regler navnet `.tall-liste`.
- [x] Markupen i `Sted.tsx`, `Kalkulator.tsx`, `Datakvalitet.tsx` og `ForklaringIllustrasjon.tsx` -- legg til `kort` og bruk `tall-liste`.
- [x] Testene over -- oppdater klassestrengene; `sted.spec.ts` bruker `.tall-liste div`.

**Acceptance Criteria:**
- Given forsiden, en stedsside (`/sted/gaustatoppen`) og forklaringssiden, when de beregnede stilene (`border`, `border-radius`, `background-color`, `padding`, `display`) for de fire kortene og tallistene sammenlignes før og etter, then er de like.
- Given rettingen, when lint, typecheck, test, build og `npm run test:e2e` kjøres, then er alle grønne.

## Implementation Notes

- `.sted-kort` hadde ingen egen stil utover kortstilen, så grunnregelen ble selve `.kort` (samme plass i `App.css`, før de tre andre kortklassene). `.sted-kort h2` og `.sted-kort .forklaring-lenke` er beholdt. `.forklaring-figur` beholder `max-width`, `margin` og utfyllingen `spacing-3` og `.datakvalitet` `font-feature-settings`. Regelen `.kalkulator-resultat { display: block; }` er fjernet etter gjennomgangen, fordi den bare gjentok standarden for en `div`; `.kalkulator-resultat p` og `dl + .kalkulator-sum` er beholdt.
- Stilsammenligning: et midlertidig Playwright-skript (slettet, ikke committet) leste 18 beregnede egenskaper (border på alle sider, border-radius, background-color, padding, margin, display, gap, font-*, justify-content, max-width, width, height) for 34 elementer på `/`, `/?visning=liste`, `/sted/gaustatoppen` og `/slik-beregner-vi-snowscore`: begge stedskortene, datakvalitetspanelet, kalkulatorresultatet, de tre figurene og tallistene med `div` og `dd`. JSON-utskriften før og etter var byte-identisk.
- lint, typecheck, test (384), build og `npm run test:e2e` (28) er grønne lokalt på Windows.

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: alle grønne
- `npm run test:e2e` -- expected: alle grønne

**Manual checks (if no CLI):**
- Sammenlign beregnede stiler før og etter med et midlertidig Playwright-skript (ikke committet), og skriv resultatet i Implementation Notes.

## Review Triage Log

Tre lag: Blind Hunter (10 funn), Edge Case Hunter (0 funn) og Verification Gap (ingen hull).

| # | Lag | Funn | Vurdering | Rute | Begrunnelse |
|---|-----|------|-----------|------|-------------|
| 1 | Blind | `.liste-rad` har også kant, hjørner og `surface-raised` | low | avvist | Stemmer, men listeraden er en lenke med egen utfylling og fokusstil, og retrospektiven nevnte de fire kortene. Å flytte den ville endret markup i listen uten gevinst nå. |
| 2 | Blind | A7 er ikke lukket i sporingen | false | avvist | Gjøres ved leveringen (`sprint-status.yaml`). |
| 3 | Blind | KI-logg mangler | false | avvist | Gjøres ved leveringen. |
| 4 | Blind | Ingen test låser at kalkulatoren får `kort` og `tall-liste` | low | patch | `Kalkulator.test.tsx` sjekker begge klassene. Stedssiden og datakvalitetspanelet er låst i `App.test.tsx` og `Datakvalitet.test.tsx`. |
| 5 | Blind | `.kalkulator-resultat { display: block }` er standard for en `div` | low | patch | Regelen er fjernet. |
| 6 | Blind | Rekkefølgen `.kort` før kortklassene håndheves bare av en kommentar | low | avvist | Alt ligger i én fil, kommentaren sier hvorfor, og den beregnede stilen er sjekket. Høyere spesifisitet ville vært mer kompleksitet. |
| 7 | Blind | `.sted-kort` er bare en krok, uten kommentar | low | patch | Kommentar lagt til. |
| 8 | Blind | Importen av `Formel` står mellom `../lib`-importene | low | patch | Flyttet. |
| 9 | Blind | Kommentaren i `Formel.tsx` gjentar CSS-en | low | patch | Beskriver nå hva komponenten er til. |
| 10 | Blind | Seksjonskommentaren over `.datakvalitet` sier «raised card» | low | patch | Peker nå til `.kort`. |

Sjekker lokalt etter gjennomgangen: lint, typecheck, test (385) og build er grønne. `npm run test:e2e`: første kjøring hadde 27 grønne og én ustabil (`kart.spec.ts`, kartmarkører, som også hang under A8 og ikke er endret her). Andre kjøring hadde 28 av 28 grønne.
