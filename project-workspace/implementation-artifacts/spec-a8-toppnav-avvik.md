---
title: 'A8: rett aria-current for «SnowFinder» på listen, og lukk menyen fra «Fant ikke siden»'
type: 'bugfix'
created: '2026-10-22'
status: 'done'
baseline_commit: '36a2a9b7d137d8f937d97ca802eb77657899ac9e'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Retrospektiven for Epic 2 (R9, tiltak A8) fant to avvik i toppnavigasjonen. (1) «SnowFinder» får `aria-current="page"` også på `/?visning=liste`, selv om lenken går til kartet. En skjermleser sier da at brukeren er på siden lenken åpner, når hen er på listen. (2) Menyen ☰ lukkes ikke når brukeren går fra «Fant ikke siden» til kartet. Menyen er knyttet til `href(route)`, og `href({ name: 'ikke-funnet' })` er roten, akkurat som kartet, så overgangen ser ikke ut som en ny adresse.

**Approach:** «SnowFinder» er gjeldende side bare på kartet (`utforsk` med `visning: 'kart'`). På listen er ingen lenke i toppnavigasjonen gjeldende, fordi listen ikke har en egen lenke der (valget Kart/Liste på siden markerer listen). Menyen knyttes til rutens navn i tillegg til adressen, så hver rutetype er en egen adresse.

## Boundaries & Constraints

**Always:** Menyen lukkes fortsatt ved enhver ruteendring (lenke i menyen, lenke på siden, Tilbake og Fram), og åpner seg ikke igjen når brukeren går tilbake til en adresse. Valget Kart/Liste på siden beholder sin `aria-current`.

**Never:** Ingen ny avhengighet. Ikke les `window` i komponenten: `App.test.tsx` rendrer den statisk uten nettleser. Ingen ny lenke til listen i toppnavigasjonen.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Kart | `/` | «SnowFinder» har `aria-current="page"` | N/A |
| Liste | `/?visning=liste` | Ingen lenke i toppnavigasjonen har `aria-current`; «Liste» på siden har det | N/A |
| Forklaring | `/slik-beregner-vi-snowscore` | Bare «Slik beregner vi SnowScore» har `aria-current` (uendret) | N/A |
| Fant ikke siden → kart | 375 px, `/finnes-ikke`, menyen åpen, trykk «SnowFinder» | Kartet vises, menyen er lukket (`aria-expanded="false"`) | N/A |

</frozen-after-approval>

## Code Map

- `src/components/Toppnavigasjon.tsx` -- `current` på «SnowFinder» (linje ~21) og menyens `adresse` (linje ~12). Mønsteret «juster state under rendering» beholdes.
- `src/lib/router.ts` -- `href` gir roten for `ikke-funnet` (linje ~53). Endres ikke: andre lenker bruker den.
- `src/App.test.tsx` -- statiske tester av navigasjonen (linje ~28, ~186–198, ~208–217). Legg til liste-tilfellet her.
- `tests/e2e/forklaring.spec.ts` -- E2E for ☰ ved 375 px (`test.describe('at 375px')`, linje ~105). Legg til overgangen fra «Fant ikke siden».

## Tasks & Acceptance

**Execution:**
- [x] `src/components/Toppnavigasjon.tsx` -- `current` på «SnowFinder» blir `route.name === 'utforsk' && route.visning === 'kart'`; menyens nøkkel blir rutenavnet pluss adressen, med en kommentar om hvorfor -- retter R9.
- [x] `src/App.test.tsx` -- test at listen ikke markerer «SnowFinder», og at «Liste» fortsatt er markert -- dekker avvik 1.
- [x] `tests/e2e/forklaring.spec.ts` -- E2E ved 375 px: på `/finnes-ikke`, åpne menyen, trykk «SnowFinder», og se at menyen er lukket på kartet -- dekker avvik 2, som bare kan sees i nettleseren.

**Acceptance Criteria:**
- Given rettingen, when lint, typecheck, test, build og `npm run test:e2e` kjøres, then er alle grønne, og `gh pr checks` er grønn før merge.

## Implementation Notes

- **Endring:** «SnowFinder» er gjeldende bare på kartet. Menyens nøkkel er rutenavnet pluss adressen (`nokkel`), så «Fant ikke siden» og kartet er to nøkler selv om begge lenker til roten.
- **Bevist:** Med den gamle komponenten feilet både den nye enhetstesten og den nye E2E-testen (`aria-expanded` var "true"). Med rettingen består begge.
- **Kjent begrensning:** To ulike ukjente adresser deler nøkkel. Går brukeren med Tilbake mellom dem, blir menyen stående åpen. Det skjer sjelden, og rettingen ville krevd at `App` sender inn den faktiske adressen. Kommentaren i komponenten sier det.
- **Sjekker lokalt:** lint, typecheck, test (384), build og `npm run test:e2e` (28) er grønne.
- **Under kjøringen:** En E2E-test i `kart.spec.ts` gikk over tidsgrensen én gang lokalt i full kjøring og besto ved ny kjøring. Den er ikke endret.

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: alle grønne
- `npm run test:e2e` -- expected: alle grønne, også den nye testen

## Review Triage Log

Tre lag: Blind Hunter (9 funn), Edge Case Hunter (0 funn) og Verification Gap (ingen hull: hver endring er dekket av en test som feiler uten rettingen).

| # | Lag | Funn | Vurdering | Rute | Begrunnelse |
|---|-----|------|-----------|------|-------------|
| 1 | Blind | Menyen blir stående åpen mellom to ukjente adresser, og kommentaren lover «enhver ruteendring» | low | patch (kommentar) | Atferden er avvist: den krever at `App` sender inn adressen, og man kommer sjelden fra én ukjent adresse til en annen med Tilbake. Kommentaren er rettet så den ikke lover mer. |
| 2 | Blind | Ingen statisk test av navigasjonen på «Fant ikke siden» | low | patch | Testen for «Fant ikke siden» sjekker nå at «SnowFinder» ikke er markert. En enhetstest for menyen krever DOM-testing, som prosjektet ikke har; E2E dekker den. |
| 3 | Blind | Tellingen av `aria-current` gjelder hele siden og er skjør | low | patch | Avgrenset til `<nav class="toppnav">`. |
| 4 | Blind | Ingen test av overgangen fra liste til kart | low | avvist | Markeringen er en ren funksjon av ruten, og kartruten er testet (`App.test.tsx:28`). Menyen lukkes fordi adressen endres, som de eksisterende E2E-testene dekker. |
| 5 | Blind | A8 er ikke lukket i `sprint-status.yaml` | false | avvist | Gjøres ved leveringen. |
| 6 | Blind | KI-logg mangler | false | avvist | Gjøres ved leveringen. |
| 7 | Blind | Notater og triagelogg mangler i spec-en | false | avvist | Skrives her. |
| 8 | Blind | Sjekken `meny.nokkel === nokkel` i `apen` er overflødig | false | avvist | Den fantes før og holder den første, forkastede renderingen riktig. Ikke en feil. |
| 9 | Blind | Ordlyden i JSX-kommentaren er uklar | low | patch | Omformulert. |
