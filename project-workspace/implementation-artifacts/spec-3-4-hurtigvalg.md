---
title: 'Story 3.4: Bruk hurtigvalg for vanlige kombinasjoner'
type: 'feature'
created: '2026-10-25'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'e4c49496ffa4393c0c9b596b5fe8185ef31c242f'
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-3-context.md'
  - '{project-root}/project-workspace/implementation-artifacts/spec-3-5-filtrer-pa-sol.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Brukeren må stille inn flere slidere hver gang for vanlige søk. FR-15 ber om snarveiene «Pudderdag» og «Sol etter snøfall», som fyller filteret med én handling og med en fast, dokumentert kombinasjon. Ingen skjult heuristikk.

**Approach:**
- **Verdiene (Joseph, 2026-10-25: «A: Ekte pudder»):** «Pudderdag» = nysnø minst 10 cm, vind høyst 8 m/s, temperatur høyst −2 °C. «Sol etter snøfall» = nysnø minst 5 cm, skydekke i dagslys høyst 30 %. Demodataene gir null treff for begge, så E2E viser forslaget fra 3.3.
- **Erstatt (Joseph, 2026-10-25):** Et valg setter hele filteret. Krav det ikke nevner går til «Alle», så samme valg alltid gir samme resultat.
- `shared/filter.ts` får en konstant `HURTIGVALG` med de to valgene, hvert med navn og faste verdier. Konstanten er eneste kilde. Panelet, README og testene leser den.
- Filterpanelet viser valgene som chips (knapper) øverst i det åpne panelet. Et trykk setter filteret og oppdaterer kart, liste, antall treff og adressen i samme handling, uten dialog. Adressen bruker de vanlige parameterne (`nysno`, `vind`, `temp`, `sky`), og det kommer ingen ny parameter.
- En chip er merket som valgt (`aria-pressed="true"`) når filteret er nøyaktig lik kombinasjonen. Flytter brukeren en slider etterpå, er den ikke lenger valgt.
- Hver chip viser hva den setter, for eksempel med teksten under navnet eller en `title`/beskrivelse koblet med `aria-describedby`, så kombinasjonen kan etterprøves i appen.

## Boundaries & Constraints

**Always:**
- Alle verdiene i et hurtigvalg er gyldige sliderverdier (innenfor spennet og på et steg). En test viser at `parseFilter(serializeFilter(valg))` gir valget tilbake.
- Trykkmål på minst 44×44 px, fokusring i `accent` og ingen sidelengs rulling ved 375 px.
- Etter et trykk står fokus fortsatt på chipen.
- README beskriver begge valgene med verdiene.

**Never:** Ingen ny URL-parameter, ingen lagring, ingen ny avhengighet. Ingen endring i filterreglene eller i fasittabellens eksisterende tilfeller. Ingen egne hurtigvalg laget av brukeren.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Trykk | Filteret står på «Alle», trykk «Pudderdag» | Filteret har valgets verdier, resultatet og adressen er oppdatert, og chipen er valgt | N/A |
| Andre krav | Temperatur høyst 0 °C er satt, trykk «Sol etter snøfall» | Temperatur går til «Alle»; filteret er nøyaktig valget | N/A |
| Justering | Valget er aktivt, brukeren flytter en slider | Chipen er ikke lenger valgt, og filteret beholder resten | N/A |
| Lenke | Adressen har nøyaktig valgets verdier | Chipen vises som valgt | N/A |
| Null treff | Valget gir null treff (for eksempel i demodata) | Banneret med forslaget fra 3.3 vises som vanlig | N/A |

</frozen-after-approval>

## Code Map

- `shared/filter.ts` -- `FilterParams`, `FILTER_GRENSER`, `STANDARD_FILTER`, `parseFilter`/`serializeFilter`. Legg `Hurtigvalg`-typen og `HURTIGVALG` her, ved siden av grensene. Ikke endre filterreglene.
- `shared/filter.test.ts` -- test at valgene er gyldige og overlever adressen.
- `src/components/FilterPanel.tsx` -- `FilterPanel` (åpent innhold under `filter-tittel-linje`), `KRAV_TEKST` og `verdiTekst`/`kravTekst` for å vise verdiene. `onEndre` tar et helt `FilterParams`, så et valg er ett kall. Bunn-arket under 768 px viser innholdet bare når det er åpent; hurtigvalgene ligger i innholdet.
- `src/components/FilterPanel.test.tsx` -- rendring av chips, `aria-pressed` og teksten med verdiene.
- `src/styles/filter.css` -- gjenbruk utseendet fra `.filter-chip` og knappene (`.filter-nullstill`), med trykkmål på 44 px.
- `src/pages/Utforsk.tsx` -- trenger ingen endring: `settFilter` erstatter adressen og alt annet følger.
- `tests/e2e/filter.spec.ts` -- nytt `describe` for hurtigvalg ved 1280 og 375 px, etter mønsteret i de andre (axe med `serious` som feil, ingen sidelengs rulling med bred skrift).
- `README.md` (avsnittet om filteret, linje 42–57) -- valgene og verdiene.

## Tasks & Acceptance

**Execution:**
- [x] `shared/filter.ts`, `shared/filter.test.ts` -- `HURTIGVALG` og testen av gyldige verdier.
- [x] `src/components/FilterPanel.tsx`, `src/styles/filter.css`, `FilterPanel.test.tsx` -- chipene, valgt-tilstand og verdiene som tekst.
- [x] `tests/e2e/filter.spec.ts` -- matrisen ved 1280 og 375 px, med axe.
- [x] `README.md` -- valgene.

**Acceptance Criteria:**
- Given Utforsk-siden med filterpanelet, when jeg trykker en hurtigvalg-chip, then fylles filteret med chipens faste, dokumenterte kombinasjon i én handling, og resultatet oppdateres umiddelbart.
- Given rettingen, when lint, typecheck, test, build og `npm run test:e2e` kjøres, then er alle grønne.

## Implementation Notes

`HURTIGVALG` lives in `shared/filter.ts` next to `FILTER_GRENSER`/`FILTER_KRAV`. Each chip's description is a sibling `<span>` (not a child of the `<button>`), referenced with `aria-describedby`, so the button's accessible name stays the short name («Pudderdag») while the description is still announced; the chip stays pressed/un-pressed by comparing the whole `FilterParams` against the chip's fixed combination on every render, so moving any slider afterwards un-presses it automatically. Both quick picks give zero hits on the committed demo data (confirmed in the new E2E tests), so the Story 3.3 banner is what a user actually sees after pressing either chip — as the Intent anticipated.

Checked locally after implementation: lint, typecheck, test (502, up from 498), build and `npm run test:e2e` (77, up from 70) are all green.

## Spec Change Log

## Review Triage Log

- **false** (blind-hunter + verification-gap, samme rotårsak) — `sprint-status.yaml` viser `in-progress` mens spec-en viser `in-review`. Dette er en mellomtilstand i selve byggeflyten: step-05 (Present) setter sprint-status til `review` før noe committes, så denne uoverensstemmelsen rekker aldri å bli en del av det som skipes.
- **false** (blind-hunter) — hevder begrunnelsen for de valgte verdiene («Ekte pudder») ikke er dokumentert i spec-en. Den står allerede i `## Intent`: «Verdiene (Joseph, 2026-10-25: «A: Ekte pudder»)». `## Spec Change Log` er for endringer en review-loop utløser, ikke for den opprinnelige planleggingsbegrunnelsen.
- **low → patch** (blind-hunter) — README bruker «uendret» i parentesene om kravene en chip ikke nevner («skydekke uendret, «Alle»»), men koden erstatter hele filteret, så et tidligere satt krav nullstilles alltid til «Alle» – det bevares ikke. Ordet kan lede leseren til å tro verdien beholdes. Rettes til ordlyd som sier «settes til», ikke «uendret».
- **low → patch** (blind-hunter) — CSS-kommentaren over `.filter-hurtigvalg-chip` sier den «gjenbruker» `.filter-chip` og `.filter-nullstill`, men regelen dupliserer verdiene i egne deklarasjoner (og `padding` er faktisk forskjellig fra `.filter-nullstill`) i stedet for å dele en selector. Kommentaren rettes til å beskrive samsvarende verdier, ikke gjenbruk.
- **low → avvist** (blind-hunter) — mangler en E2E-test der «Pudderdag» overskriver et tidligere satt skydekke-krav (motstykket til testen som gjør dette for «Sol etter snøfall»). Samme kodevei (`onEndre({ ...verdier })`) er allerede bevist riktig av den eksisterende testen; usannsynlig å møte i praksis, og fiksen er ny testkode, ikke en direkte retting.
- **low → avvist** (blind-hunter) — `aria-pressed` antyder normalt en av/på-knapp, men å trykke en allerede valgt chip gjør ingenting; avvalg skjer bare ved å flytte en slider. Dette er nøyaktig det `<frozen-after-approval>`-avsnittet spesifiserer («Flytter brukeren en slider etterpå, er den ikke lenger valgt»), så det er et bevisst, godkjent valg, ikke en mangel i byggingen. Usannsynlig å møtes i vanlig bruk, og fiksen (ekte av/på-logikk) er mer enn en direkte retting.
- **low → avvist** (blind-hunter) — mangler en test på at `HURTIGVALG` har nøyaktig to, distinkte oppføringer. Spekulativ fremtidig regresjonsvakt for et problem som ikke finnes i dagens kode; fiksen legger til ny kompleksitet for et scenario som ikke kan inntreffe nå.
- **avvist, fiksen er å redigere spec-en** (blind-hunter) — mener akseptansekriteriene burde nevne null-treff-banneret explisitt. Matrisens rad 5 dekker allerede dette, og testene bekrefter det; fiksen ville vært å redigere `{spec_file}`, som er avvist per regel.
- (edge-case-hunter: ingen funn.)

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: alle grønne
- `npm run test:e2e` -- expected: alle grønne
