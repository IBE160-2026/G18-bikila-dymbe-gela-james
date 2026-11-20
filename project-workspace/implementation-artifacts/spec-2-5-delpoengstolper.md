---
title: 'Story 2.5: Delpoengstolper i SnowScore-kortet, regneeksemplet og kalkulatoren'
type: 'feature'
created: '2026-11-08'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'cf4e21824443ab53efdebd7359cd8e92b1910ca8'
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-2-context.md'
  - '{project-root}/project-phase-folders/2-Planleggingsfasen/SnowFinder-DESIGN.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Delpoengene A, B og C står bare som tekst («18,0 av 60»). Det er tungt å se med et blikk hvilket delpoeng som trekker ned, og at maksene er ulike (60, 25, 15).

**Approach:** Steg 3 i UX-forbedringen (PR #93, Aksels valg 2026-11-07): én grå stolpe per delpoeng mellom etiketten og «x av N», fylt mot delpoengets eget maks. Samme komponent i SnowScore-kortet på stedssiden, i regneeksemplet og i kalkulatoren.

## Boundaries & Constraints

**Always:**
- Én felles komponent for de tre flatene. Fyllet er `verdi / maks`, avgrenset til 0–100 %, med maks fra `SNOWSCORE.maxA/maxB/maxC`.
- Stolpen er `aria-hidden="true"` og har ingen tekst. Teksten i `dd` er uendret («30,0 av 60»), så skjermlesere og eksisterende tester hører og ser det samme som før.
- Tokenene fra `{components.score-part-bar}`: høyde `--spacing-2`, avrundet, skinne `--color-surface-sunken`, fyll `--color-ink-secondary`.
- Etikett, stolpe og verdi står på én rad fra 320 px uten sideveis rulling. Stolpen krymper, verdien brytes aldri.
- Regneeksemplet (Aksels valg 2026-11-08): `Delpoengliste` står etter C-formelen og før «Summen», med samme A/B/C-tekst som SnowScore-kortet. Formlene er uendret.

**Never:**
- Ingen stolper ved ufullstendige data (stedssiden) eller ugyldig inndata (kalkulatoren).
- Ingen begrunnelsestekst per rad, ingen SnowScore-farger eller aksentblått, ingen mørk modus (den er «Ikke i v1»; `-dark`-tokenene brukes ikke).
- Ikke endre SnowScore-beregningen, `delpoeng()`-teksten, formlene i regneeksemplet eller `aria-live`-linjen i kalkulatoren.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Delvis fylt | A = 30, maks 60 | Fyll 50 %, tekst «30,0 av 60» | N/A |
| Fullt | C = 15, maks 15 | Fyll 100 % | N/A |
| Null | B = 0 | Bare skinnen, fyll 0 % | N/A |
| Utenfor område | verdi < 0 eller > maks | Fyll avgrenset til 0 % eller 100 % | Ingen feil kastes |
| Ufullstendige data | `snowScore.kind !== 'score'` | Ingen delpoengliste, ingen stolper (som i dag) | N/A |
| Ugyldig inndata | Kalkulatoren `kind: 'ugyldig'` | Ingen liste, ingen stolper (som i dag) | Feilmeldingen står som før |

</frozen-after-approval>

## Code Map

- `src/pages/Sted.tsx:14-25,60-67` -- `Tall` rendrer `dl.tall-liste` med `[navn, verdi]`. A/B/C sendes som tre rader når `snowScore.kind === 'score'`. Grunnlag-lista bruker samme `Tall` og skal ikke få stolper.
- `src/components/Kalkulator.tsx:153-169` -- egen `dl.tall-liste` med A/B/C når `utregning.kind === 'score'`. Maks fra `SNOWSCORE`.
- `src/components/Regneeksempel.tsx:106-112` -- «Delpoengene» med tre `Formel`-linjer; `a`, `b`, `c` og maksene er lokale variabler.
- `src/lib/format.ts:31` -- `delpoeng(verdi, maks)` gir «x,y av N». Gjenbrukes uendret.
- `src/App.css:357-377` -- `.tall-liste` (div er flex med `space-between`, `dd` i `numeric`). `src/styles/tokens.css` har `--spacing-2`, `--color-surface-sunken`, `--color-ink-secondary`.
- Tester som leser `dd`-teksten eksakt og må fortsatt bestå: `tests/e2e/sted.spec.ts:15-26`, `tests/e2e/forklaring.spec.ts:85-105`, `src/components/Kalkulator.test.tsx:129,159`.

## Tasks & Acceptance

**Execution:**
- [x] `src/components/Delpoengliste.tsx` -- ny komponent som tar `a`, `b`, `c` og rendrer `dl.tall-liste` med tre rader. Hver `dd` inneholder først `<span class="delpoeng-stolpe" aria-hidden="true"><span style="width: N%"></span></span>`, så `delpoeng()`-teksten. Eksporter en ren `fyllProsent(verdi, maks)` -- én kilde for alle tre flatene, og stolpen ligger i `dd` så HTML-en i `dl` er gyldig.
- [x] `src/pages/Sted.tsx` og `src/components/Kalkulator.tsx` -- bruk `Delpoengliste` i stedet for de tre A/B/C-radene -- samme tekst og vilkår som før.
- [x] `src/components/Regneeksempel.tsx` -- legg `Delpoengliste` med `a`, `b`, `c` etter C-formelen, før «Summen» -- Aksels valg.
- [x] `src/App.css` -- `.delpoeng-stolpe`: `flex: 1`, `min-width: 2rem`, `max-width: 10rem`, skinne og fyll fra tokenene. `dd` med stolpe blir flex med `gap`, verdien `white-space: nowrap`.
- [x] `src/components/Delpoengliste.test.tsx` -- matrisen: `fyllProsent` for 50 %, 100 %, 0 % og avgrensning, og at markupen har `aria-hidden` og uendret `dd`-tekst.
- [x] `tests/e2e/sted.spec.ts` og `tests/e2e/forklaring.spec.ts` -- Gaustatoppen: tre stolper med riktig fyllbredde, sjekket i `style`-attributtet til fyllet (for eksempel `width: 50%`), ikke ved å måle piksler; Trondheim: ingen stolper; kalkulatoren: stolpene følger inndata (20 mm, −14 °C gir A og B fulle) og forsvinner ved ugyldig verdi; 320 px uten sideveis rulling; axe uten nye brudd.
- [x] `project-phase-folders/2-Planleggingsfasen/SnowFinder-Epics-og-Stories.md`, `sprintplan.md`, `sprint-status.yaml` -- Story 2.5 (realiserer FR-16 og UX-forbedring steg 3) og avviksnotat.

**Acceptance Criteria:**
- Given stedssiden for et sted med score, when siden åpnes, then A, B og C har hver sin stolpe fylt mot 60, 25 og 15, og teksten er uendret.
- Given kalkulatoren, when brukeren skriver nye tall, then stolpene følger tallene uten omlasting, og ved ugyldig verdi vises ingen stolper.
- Given en skjermleser, when den leser delpoenglista, then den hører bare etikett og «x av N».
- Given 320 px bredde, when stedssiden og forklaringssiden vises, then ingen sideveis rulling.

## Implementation Notes

- `Delpoengliste` henter maks fra `SNOWSCORE` selv, så de tre flatene sender bare `a`, `b` og `c`. `delpoeng()` er uendret, og teksten står som en ren tekstnode etter stolpen i `dd`.
- To enhetstester leste HTML-en rundt `dd` eksakt og er justert, med samme tekst: `Kalkulator.test.tsx` sjekker nå `36,0 av 60</dd>` i stedet for `<dd>36,0 av 60</dd>`, og `App.test.tsx` slår sammen påfølgende tagger til én `|` før den sjekker etikett/verdi-parene.
- `dd.delpoeng-verdi` er flex med `flex: 1 0 auto` og `justify-content: flex-end`, så stolpen står mellom etiketten og verdien og krymper mot `min-width: 2rem`. `dd` krymper ikke under stolpens minimum pluss verdien. Med bred font (Verdana/DejaVu Sans, som på Linux i CI) får ikke alt plass på én linje ved 320 px; da brytes etiketten «A Nysnøpotensial» til to linjer, mens stolpe og verdi står på samme rad ved siden av. Fra 375 px står etiketten på én linje også med bred font. E2E-testen i `sted.spec.ts` sjekker begge breddene.

## Spec Change Log

## Review Triage Log

| # | Lag | Funn | Verdikt | Begrunnelse og rute |
|---|-----|------|---------|---------------------|
| 1 | VG, ECH | Forklaringssiden er ikke testet ved 320 px (regneeksemplet og kalkulatoren) | low | Kriteriet gjelder begge sidene, men bare stedssiden er testet. Patch: E2E ved 320 px med bred font. |
| 2 | BH | Stolpefyllet er tynt testet i regneeksemplet (bare A) og kalkulatoren (bare 100 %) | low | Riktig. Patch: B og C i eksemplet, startverdiene og 0 % ved regn i kalkulatoren. |
| 3 | ECH | Ved 320 px er det ingen grense for hvor mange linjer etiketten brytes over | low | Riktig. Patch: høyst to linjer. |
| 4 | BH, ECH | De løsere enhetstestene i Kalkulator.test og App.test ville bestått uten Delpoengliste | low | Riktig. Patch: krev tre stolper i begge. |
| 5 | BH | Vakten `!(maks > 0)` i `fyllProsent` er ikke testet | low | Patch: tilfellet maks 0. |
| 6 | BH | Story 2.5 nevner bare FR-16, ikke FR-9 og FR-10 | low | Patch i epics. |
| 7 | BH | Avviksnotatet i sprintplan gir feil dato for plasseringen i regneeksemplet | low | Patch: 2026-11-08 for plasseringen. |
| 8 | BH | Epic 2-konteksten lister ikke Story 2.5 | low | Patch. |
| 9 | BH | `epic-2` er `in-progress` mens `epic-2-retrospective` er `done` | low | Retrospektivet ble holdt før 2.5. Patch: merknad i `sprint-status.yaml`. |
| 10 | ECH | `fyllProsent(Infinity)` gir 0 i stedet for 100 | false | Delpoengene kommer fra `computeSnowScore`, som begrenser A, B og C til maks; uendelig kan ikke nå komponenten. |
| 11 | ECH | NaN gir tom stolpe ved «NaN av 60» | false | Samme grunn: verdiene er alltid endelige tall når `kind === 'score'`. |
| 12 | ECH | Eksakt `style`-treff kan feile på flyttallsstøy | false | 30/60, 15/15 og 36/60 gir eksakte prosenter, og B sjekkes med et mønster som tåler desimaler. Aksel ba om `style`-sjekk. |
| 13 | ECH | Etiketten brytes ved 320 px, mot «på én rad» | false | Etikett, stolpe og verdi står fortsatt i samme rad; stolpen krymper og verdien brytes ikke, som spec-en sier. |
| 14 | BH | Regneeksemplet viser «36,0 av 60» under formelen «36» | false | Spec-en krever samme tekst som SnowScore-kortet (`delpoeng()` uendret); det er Aksels valg. |
| 15 | BH | Ingen test av stolpen i mørk modus | false | Mørk modus er «Ikke i v1», og `-dark`-tokenene brukes ikke. |
| 16 | BH | `score-part-bar` finnes ikke i `tokens.css` | false | Komponenttokenene i DESIGN.md (som `score-badge`) står heller ikke i `tokens.css`; CSS bruker de grunnleggende tokenene. |
| 17 | BH | `fremdriftsplan.md` er ikke oppdatert | false | AGENTS.md krever det når storyen settes til `done`; det gjøres i samme PR ved avslutning. |
| 18 | BH | Sesjonsloggen og `issues.md` er utdaterte | false | Oppdateres ved avslutning av økten, før PR. |
| 19 | BH | Byggeøkten mangler i KI-loggen | false | Raden og promptene skrives ved avslutning, i samme PR. |
| 20 | BH | Spec-endringene er ikke med i diffen | false | Spec-en holdes utenfor gjennomgangen med vilje (den går bare til Edge Case Hunter som påstandsfil) og committes med koden. |
| 21–26 | BH, ECH | Gjentakelser av 1, 4 og 13 fra det andre laget | carried | Slått sammen med radene over. |

## Verification

**Commands:**
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build:demo` -- alle grønne.
- `npm run test:e2e` -- alle grønne, også de eksisterende testene som leser `dd`-teksten.
