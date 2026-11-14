---
title: 'Story 3.9: Søk etter et sted ved navn'
type: 'feature'
created: '2026-11-04'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '135e49ab70912f2c2b8dc1cf22e5104e317d2a59'
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-3-context.md'
  - '{project-root}/project-workspace/planning-artifacts/sprint-change-proposal-2026-11-04-sok.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Den som vet hvilket sted hen vil se, må lete på kartet eller bla i listen. Tre av fem oppgaver i brukertesten ber deltakeren finne et bestemt sted (FR-32, UJ-4).

**Approach:** Et søkefelt med forslag (ARIA-combobox) på Utforsk, mellom Kart | Liste-vekslingen og kartet eller listen, på alle bredder. Søket er én ren funksjon i `shared/` med fasittabell. Det leser de samme stedene som kart og liste, før filteret. Et valgt forslag åpner stedssiden med søket i adressen, som en listerad gjør.

**Treffregel (FR-32):** Navn og søketekst normaliseres likt: små bokstaver, æ → ae, ø → o, å → a, og andre aksenter fjernes («Jiehkkevárri» → «jiehkkevarri»). Mellomrom i søketeksten trimmes og slås sammen. Et sted er treff når den normaliserte teksten står i starten av navnet eller rett etter et tegn som ikke er bokstav eller tall (mellomrom, bindestrek, parentes, & og lignende). *(Endret av Aksel i review 2026-11-04: før bare mellomrom og bindestrek, så «granvin» ikke fant «Haugsåsen (Granvin Alpin)».)* Treff i starten av hele navnet kommer først, deretter i alfabetisk rekkefølge (`Intl.Collator('nb')`, som sorteringen «Navn»), og høyst 8. Tom søketekst gir ingen forslag.

**Status i forslaget:** stedsnavn og score-badge (`ScoreBadge`, som allerede viser «Ufullstendige data» uten tall). Står stedet ikke i trefflisten fra filteret, står «Oppfyller ikke filteret» i tillegg.

**Tastatur:** Pil ned og opp flytter markeringen (`aria-activedescendant`) og åpner listen. Enter åpner det markerte forslaget, eller det første når ingen er markert. Escape lukker listen, og trykket etter tømmer feltet. Listen lukkes når fokus forlater feltet.

## Boundaries & Constraints

**Always:**
- Søketeksten bor bare i komponenten. Den endrer aldri filteret, trefftallet, `role="status"`-teksten for treff eller adressen.
- Steder med data eldre enn 12 timer finnes ikke i søket (de er borte fra `steder` allerede, NFR-3). Når `steder` er tom, vises ikke feltet, som resten av verktøylinjen.
- Synlig etikett «Søk etter sted». Antall forslag annonseres i en egen `aria-live="polite"`-region: «N steder» eller teksten for ingen treff. Trykkmål på minst 44 px, fokusring i `accent`, ingen alvorlige axe-funn ved 1280 og 375 px med åpen liste.
- Ingen treff: «Fant ingen steder som heter «<tekst>». SnowFinder dekker N steder i Norge.», der N er `steder.length`.

**Never:** Ingen ny avhengighet, ingen søketjeneste, ingen endring i dataprogrammet, katalogen eller datakontrakten. Feltet ligger aldri i bunn-arket. Fargeforklaringen for kartet er utsatt (deferred-work).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Prefiks | «beito» i katalogen / «gaus» i demodata | Beitostølen Skisenter / Gaustatoppen | N/A |
| Uten særtegn | «tromso» | Tromsø, så Tromsø Alpinpark | N/A |
| Ord inni navnet | «skisenter» | Hemsedal skisenter, Oppdal Skisenter, Sirdal Skisenter | N/A |
| Store bokstaver | «TRYSIL» | Trysil | N/A |
| Aksent | «jiehkkevarri» | Jiehkkevárri | N/A |
| Ikke midt i et ord | «sen» | Ikke «Hemsedal skisenter» | N/A |
| Etter parentes | «granvin» / «senteret» i katalogen | Haugsåsen (Granvin Alpin) / Uvdal alpinsenter (Senteret) | N/A |
| Rangering | «t» | Navn som starter med t, alfabetisk, høyst 8 | N/A |
| Skjult av filter | nysnø minst 20 cm, søk «oslo» | Oslo med «Oppfyller ikke filteret» | N/A |
| Ufullstendige data | «trondheim» | Trondheim med «Ufullstendige data» | N/A |
| Ingen treff | «xyz» | Teksten for ingen treff med N = 24 i demodata | N/A |
| Tomt | «   » | Ingen liste | N/A |

</frozen-after-approval>

## Code Map

- `shared/filter.ts` -- mønster for en ren, delt funksjon. Ikke endre filterreglene.
- `src/lib/sortering.ts` -- `navnCollator` (`Intl.Collator('nb')`). Bruk samme sammenligning i søket, med `id` som siste skille.
- `src/pages/Utforsk.tsx` -- har `steder` (etter alder), `treff` (etter filter) og `route`. Feltet settes inn rett etter `.utforsk-verktoy` og før `.utforsk`, inne i grenen der `steder.length > 0`.
- `src/components/ScoreBadge.tsx` -- badge og «Ufullstendige data». Gjenbrukes.
- `src/lib/router.ts` -- `navigate(sted(id, route))` åpner stedssiden med søket (Story 3.2b), slik `ListeVisning` lenker.
- `src/App.css` -- `.kalkulator-felt input` og `select:focus-visible` viser stilen for felt og fokus. Legg søkets stil i `src/styles/filter.css`, ved siden av Utforsk.
- `tests/golden/filter.json` og `shared/filter.test.ts` -- mønster for fasittabell og test.
- `tests/e2e/liste.spec.ts` -- `isolate`, `tabTo` og axe med `wcag2a`, `wcag2aa`, `wcag21a` og `wcag21aa`.
- `public/data/demo.json` -- 24 steder, blant dem Tromsø og Tromsø Alpinpark, tre «…Skisenter», Jiehkkevárri og Trondheim (ufullstendig).

## Tasks & Acceptance

**Execution:**
- [x] `shared/sok.ts` -- `normaliserNavn` og `sokSteder(steder, tekst, maks = 8)` etter treffregelen -- én delt søkelogikk (AD-6)
- [x] `tests/golden/sok.json` og `shared/sok.test.ts` -- fasittabell med egne steder pluss matrisen over, og egenskapstester (aldri over 8, hvert treff matcher, samme svar uansett store bokstaver og særtegn) -- AD-4
- [x] `src/components/StedSok.tsx` og `src/components/StedSok.test.tsx` -- combobox med forslag, status, tastatur og live-region. Testene dekker tastaturet, Escape i to trinn, Enter uten markering, ingen treff, at søket ikke endrer adressen, og at museklikk åpner stedssiden
- [x] `src/pages/Utforsk.tsx` -- sett inn `StedSok` med `steder`, ID-ene i `treff` og `route`
- [x] `src/styles/filter.css` -- felt, flytende forslagsliste over kartet (z-index over Leaflet, under bunn-arket) og markert forslag som ikke bare bygger på farge
- [x] `tests/e2e/sok.spec.ts` -- søk «gaus» → Enter → stedssiden → Tilbake, «oslo» med filter, ingen treff, og axe med åpen liste ved 1280 og 375 px
- [x] `README.md` -- nevn søket der Utforsk beskrives

**Acceptance Criteria:**
- Given Utforsk i kart- eller listevisning, when brukeren skriver i søkefeltet, then vises forslag etter fasittabellen, og adressen og trefftallet er uendret.
- Given åpen forslagsliste, when brukeren velger et forslag med mus, berøring eller Enter, then åpnes `/sted/<id>` med filteret og visningen i adressen, og Tilbake viser Utforsk som før.
- Given 375 px bredde, when bunn-arket er lukket eller åpent, then er søkefeltet synlig over kartet og ikke dekket av arket.

## Implementation Notes

- Bygget i en sky-økt fra claude.ai med Node 24. Der fantes bare Chromium for Playwright, så `npm run test:e2e:nettlesere` (Firefox og WebKit) er ikke kjørt lokalt for denne storyen. Den kjøres i CI.

## Spec Change Log

- **2026-11-04, review runde 1:** Blind Hunter og Edge Case Hunter fant at «granvin» og «senteret» ikke ga treff, fordi treffregelen bare godtok mellomrom og bindestrek som ordgrense. Aksel valgte at alle tegn som ikke er bokstav eller tall, er ordgrense, og at det rettes i koden i stedet for å bygge på nytt. Endret: treffregelen og en ny rad i matrisen. Unngår: steder med parentes i navnet kan ikke finnes på ordet inni parentesen. KEEP: resten av søkefunksjonen, komponenten og testene.

## Review Triage Log

### Runde 1

| # | Lag | Funn | Vurdering | Begrunnelse | Rute |
|---|---|---|---|---|---|
| 1 | Blind, Edge | Parentes er ikke ordgrense, så «granvin» og «senteret» gir null treff | medium | To katalognavn har parentes (målt i `data/catalog.json`). Roten var treffregelen i den frosne delen | intent_gap → Aksel: rettes i koden |
| 2 | Blind | Ingen test viser at steder eldre enn 12 timer er borte fra søket | low | Søket får `steder` etter alder fra Utforsk, men ingen test låser det | patch |
| 3 | Blind | Røyktesten i `kart.spec.ts` er ikke utvidet | low | `sok.spec.ts` søker opp et sted i demomodus, som storyen krever. Bare plasseringen avviker | avvist |
| 4 | Blind, Edge | Bunn-arket kan dekke forslagene på mobil | medium | Målt ved 375×560: listen går til y 611, mens det lukkede arket starter på y 479 og ligger over (samme z-index, senere i siden). Åpent ark og åpen liste kan ikke finnes samtidig, fordi listen lukkes når fokus forlater feltet | patch |
| 5 | Blind | Flyt 5 sier at Mari kan nullstille filteret, men forslaget har ingen knapp | false | «Nullstill» står i filterpanelet og på bunn-arket, og flyten krever ikke en knapp i forslaget | avvist |
| 6 | Blind | Spec og sprint-status har forskjellig status | false | `bmad-build` setter sprint-status til `review` i steg 5. Akkurat nå er det riktig at de er ulike | avvist |
| 7 | Blind | Miljønotatet fra økta står i spec-en | low | Riktig, men fiksen er å endre denne spec-en. Hovedøkta fjerner notatet før commit | avvist (spec) |
| 8 | Blind | KI-loggen mangler for bygget | false | Loggen føres ved slutten av økta, før commit | avvist |
| 9 | Blind, Edge | Spec-en lover enhetstester for klikk og uendret adresse, men de finnes bare i E2E | low | Vitest kjører uten DOM, og et DOM-bibliotek ville vært en ny avhengighet. E2E dekker begge | avvist (spec) |
| 10 | Blind | Egenskapstestene sjekker ikke alfabetisk rekkefølge | low | Fasittabellen låser rekkefølgen med flere tilfeller. Å legge til mer er ikke en direkte retting | avvist |
| 11 | Blind | «oe» og «aa» gir ikke treff | false | Den frosne treffregelen sier hvilke omskrivinger som skal støttes, og disse er ikke med | avvist |
| 12 | Blind | «N steder» kan forveksles med filterets «N treff» | low | Teksten står i den frosne delen | avvist |
| 13 | Edge | Et markert forslag utenfor synlig del av listen rulles ikke fram | medium | Listen har `max-height: 60vh` og egen rulling. På en lav skjerm kan pil ned markere en rad som ikke vises | patch |
| 14 | Edge | Escape med bare mellomrom i feltet ser ut til å ikke gjøre noe | low | `apen` er sann mens listen er skjult, så første Escape lukker en usynlig liste. Fiksen er å bruke `vises` | patch |
| 15 | Edge | Enter under IME-komposisjon åpner første forslag | low | Lite sannsynlig med norsk tastatur, og fiksen er et nytt vern | avvist |
| 16 | Edge | «dekker 1 steder» når bare ett sted er ferskt | low | Skjer nesten aldri: demo har 24 og katalogen 300 | avvist |
| 17 | Gap | Ingen test på den ekte siden viser at et sted som filteret viser, ikke er merket | medium | Gap-laget har lest testene: bare tilfellet «merket» er testet gjennom Utforsk | patch |

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm test && npm run build:demo` -- expected: alt grønt
- `npm run test:e2e` -- expected: alle grønne, også `sok.spec.ts`
