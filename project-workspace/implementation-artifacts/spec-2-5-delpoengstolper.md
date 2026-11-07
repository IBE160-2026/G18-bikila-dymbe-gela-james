---
title: 'Story 2.5: Delpoengstolper i SnowScore-kortet, regneeksemplet og kalkulatoren'
type: 'feature'
created: '2026-11-08'
status: 'ready-for-dev'
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
- [ ] `src/components/Delpoengliste.tsx` -- ny komponent som tar `a`, `b`, `c` og rendrer `dl.tall-liste` med tre rader. Hver `dd` inneholder først `<span class="delpoeng-stolpe" aria-hidden="true"><span style="width: N%"></span></span>`, så `delpoeng()`-teksten. Eksporter en ren `fyllProsent(verdi, maks)` -- én kilde for alle tre flatene, og stolpen ligger i `dd` så HTML-en i `dl` er gyldig.
- [ ] `src/pages/Sted.tsx` og `src/components/Kalkulator.tsx` -- bruk `Delpoengliste` i stedet for de tre A/B/C-radene -- samme tekst og vilkår som før.
- [ ] `src/components/Regneeksempel.tsx` -- legg `Delpoengliste` med `a`, `b`, `c` etter C-formelen, før «Summen» -- Aksels valg.
- [ ] `src/App.css` -- `.delpoeng-stolpe`: `flex: 1`, `min-width: 2rem`, `max-width: 10rem`, skinne og fyll fra tokenene. `dd` med stolpe blir flex med `gap`, verdien `white-space: nowrap`.
- [ ] `src/components/Delpoengliste.test.tsx` -- matrisen: `fyllProsent` for 50 %, 100 %, 0 % og avgrensning, og at markupen har `aria-hidden` og uendret `dd`-tekst.
- [ ] `tests/e2e/sted.spec.ts` og `tests/e2e/forklaring.spec.ts` -- Gaustatoppen: tre stolper med riktig fyllbredde, sjekket i `style`-attributtet til fyllet (for eksempel `width: 50%`), ikke ved å måle piksler; Trondheim: ingen stolper; kalkulatoren: stolpene følger inndata (20 mm, −14 °C gir A og B fulle) og forsvinner ved ugyldig verdi; 320 px uten sideveis rulling; axe uten nye brudd.
- [ ] `project-phase-folders/2-Planleggingsfasen/SnowFinder-Epics-og-Stories.md`, `sprintplan.md`, `sprint-status.yaml` -- Story 2.5 (realiserer FR-16 og UX-forbedring steg 3) og avviksnotat.

**Acceptance Criteria:**
- Given stedssiden for et sted med score, when siden åpnes, then A, B og C har hver sin stolpe fylt mot 60, 25 og 15, og teksten er uendret.
- Given kalkulatoren, when brukeren skriver nye tall, then stolpene følger tallene uten omlasting, og ved ugyldig verdi vises ingen stolper.
- Given en skjermleser, when den leser delpoenglista, then den hører bare etikett og «x av N».
- Given 320 px bredde, when stedssiden og forklaringssiden vises, then ingen sideveis rulling.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Verification

**Commands:**
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build:demo` -- alle grønne.
- `npm run test:e2e` -- alle grønne, også de eksisterende testene som leser `dd`-teksten.
