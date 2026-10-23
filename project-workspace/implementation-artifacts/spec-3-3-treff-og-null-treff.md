---
title: 'Story 3.3: Få hjelp ved null treff og se antall treff live'
type: 'feature'
created: '2026-10-23'
status: 'done'
baseline_commit: '33496fd22808079a4f40ece295d915ba52269d7f'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-3-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Brukeren ser ikke hvor mange steder filteret gir før hen ser på kart eller liste. En skjermleserbruker som flytter en slider, får ikke høre resultatet. Ved null treff sier appen bare at ingen steder passer, ikke hva som bør endres (FR-14, FR-26, UX-DR4).

**Approach:**
- **Treff-antall:** Panelet viser hele tiden antall treff («24 treff», «1 treff», «Ingen treff»), også på den lukkede bunn-arklinjen på mobil. Én levende region (`aria-live="polite"`) leser det opp når det endres.
- **Forslag ved null treff (Aksel, 2026-10-23):** For hvert aktivt krav finner appen den nærmeste verdien på sliderens steg, i retning «Alle», som gir minst ett treff når de andre kravene står. Den foreslår kravet som da gir flest treff. Ved likhet vinner minst endring (færrest steg), og deretter panelets rekkefølge (nysnø, vind, temperatur). Gir ingen enkeltendring treff, foreslår appen «Nullstill».
- **Knapp (Aksel, 2026-10-23):** Banneret sier for eksempel «Ingen treff. Prøv vind høyst 8 m/s.» og har knappen «Bruk forslaget», som setter verdien med ett trykk. Er den nærmeste verdien som gir treff, ytterpunktet («Alle»), sier forslaget «Prøv uten vindkravet». «Nullstill» står fortsatt i banneret.

## Boundaries & Constraints

**Always:**
- Forslaget regnes ut i `shared/filter.ts` med `filtrerSteder`, så det følger nøyaktig de samme reglene som filteret (AD-6). Det låses i fasittabellen `tests/golden/filter.json`, med forventet forslag for hvert tilfelle med null treff.
- Det finnes bare én levende region for antall og forslag, så skjermleseren ikke leser opp det samme to ganger. Banneret selv er ikke levende.
- «Bruk forslaget» går gjennom samme vei som en slider-endring (adressen erstattes, Story 3.2). Fokus flyttes til slideren for kravet som ble endret, eller til «Filter» når bunn-arket er lukket.
- Tekstene bruker samme form som panelet («minst 12 cm», «høyst 8 m/s»). Tonen er rolig og lover aldri snø.
- Trykkmål er minst 44 px, og knappen virker med tastatur. Siden ruller ikke sidelengs ved 320 og 375 px, heller ikke med bred font.

**Never:** Ingen endring i filterreglene eller i resultatet av eksisterende fasittilfeller. Ingen ny avhengighet. Ingen hurtigvalg (Story 3.4). Ingen forslag når det finnes treff.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Uten krav | Demodata, alle «Alle» | «24 treff» i panelet | N/A |
| Ett treff | Nysnø minst 12 | «1 treff» (Trysil) | N/A |
| Null treff, ett krav | Nysnø minst 13 | «Ingen treff. Prøv nysnø minst 12 cm.» Knappen gir «1 treff» | N/A |
| Null treff, flere krav | To krav som hver for seg kunne lempes | Kravet som gir flest treff når det lempes nærmest mulig; ved likhet færrest steg, så panelets rekkefølge | N/A |
| Bare «Alle» hjelper | Det nærmeste som gir treff, er ytterpunktet | «Prøv uten vindkravet» (eller tilsvarende krav) | N/A |
| Ingen enkeltendring hjelper | Hvert krav må lempes sammen med et annet for å gi treff | Forslaget er «Nullstill» | N/A |
| Skjermleser | Slider endres | Regionen leser det nye antallet én gang | N/A |

</frozen-after-approval>

## Code Map

- `shared/filter.ts` -- `filtrerSteder`, `FILTER_GRENSER` (heltall, steg 1), `aktiveKrav`. Legg til en ren funksjon, for eksempel `forslagVedNullTreff(steder, params)`, som gir `{ krav, verdi, antall }` eller `null` (ingen enkeltendring hjelper, eller det finnes treff).
- `tests/golden/filter.json` og `shared/filter.test.ts` -- legg til `forventetForslag` på tilfellene med null treff, og nye tilfeller for likhet, ytterpunkt og «ingen enkeltendring hjelper». Behold fixture-stedene og de gamle forventningene.
- `src/components/FilterPanel.tsx` -- `verdiTekst` og `kravTekst` gir tekstene. Antall treff skal vises i panelet og på den lukkede bunn-arklinjen. Panelet får antallet som prop.
- `src/pages/Utforsk.tsx:60–70` -- dagens `role="status"`-region med null-treff-banneret. Flytt den levende delen til én region for antall og forslag. Banneret får forslaget og knappen «Bruk forslaget» i tillegg til «Nullstill».
- `src/styles/filter.css` -- stil for antall og banner. Bruk tokens.
- `tests/e2e/filter.spec.ts` -- E2E for matrisen (i demo: nysnø minst 13 → forslag 12 → knapp → 1 treff), ved 1280 og 375 px, med axe.
- Demodata: nysnø maks 12,6 cm (Trysil), vind 2,7–17,5 m/s, temperatur −10,2 til +9,6 °C.

## Tasks & Acceptance

**Execution:**
- [x] `shared/filter.ts`, `shared/filter.test.ts`, `tests/golden/filter.json` -- forslaget etter regelen over, låst i fasittabellen.
- [x] `src/components/FilterPanel.tsx` (+ test) -- antall treff i panelet og på bunn-arklinjen.
- [x] `src/pages/Utforsk.tsx` -- én levende region, banner med forslag, «Bruk forslaget» og «Nullstill», og fokus etter knappen.
- [x] `src/styles/filter.css` -- stil.
- [x] `tests/e2e/filter.spec.ts` -- hver rad i matrisen som kan vises med demodata, ved begge bredder.
- [x] `README.md` -- én setning om antall treff og forslaget.

**Acceptance Criteria:**
- Given rettingen, when lint, typecheck, test, build og `npm run test:e2e` kjøres, then er alle grønne, og `gh pr checks` er grønn før merge.

## Implementation Notes

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: alle grønne
- `npm run test:e2e` -- expected: alle grønne

## Review Triage Log

Tre lag: Blind Hunter (12 funn), Edge Case Hunter (3 funn) og Verification Gap (ingen hull).

| # | Lag | Funn | Vurdering | Rute | Begrunnelse |
|---|-----|------|-----------|------|-------------|
| 1 | Blind | Regelen avviker fra FR-14 («hvis fjernet»), og planen er ikke oppdatert | medium | patch (dokument) | Storyen sier «hvis lempet» og gir eksempelet «Prøv vind under 8 m/s». FR-14 er presisert med Aksels valg i begge kopiene av PRD-en, og den gamle teksten er beholdt. |
| 2 | Blind | KI-logg mangler | false | avvist | Skrives ved leveringen. |
| 3 | Blind | Kommentarene viser til FR-26, som bare er en henvisning til FR-14 | low | patch | Viser nå til FR-14 og UX-DR4. |
| 4 | Blind | Testene av «én levende region» teller `aria-live`, men `role="status"` er også levende, og attributtet er overflødig | low | patch | `aria-live` er fjernet. Testene sjekker at teksten står i nøyaktig én `role="status"`. |
| 5 | Blind | Ingen null-treff-sak i fasittabellen der en manglende verdi betyr noe | low | patch | Fasittabellen har nå «vind høyst 2», der stedet uten vindverdi hoppes over mens kravet lempes. Med de faste stedene finnes ingen sak som ender i «uten kravet», fordi «dyp» alltid gir treff før det. Derfor ligger det tilfellet i en enhetstest med egne steder. |
| 6 | Blind, Edge | Steg-løkken kan henge ved `steg: 0` eller en grense som er `NaN` | low | patch | Løkken er begrenset av spennet, og grenser som ikke er tall hoppes over. Testet. |
| 7 | Blind | Fokus etter «Bruk forslaget» er bare testet for nysnø | low | patch | Ny E2E der forslaget gjelder et annet krav. |
| 8 | Blind | Antallet leses opp ved hvert slider-steg | low | avvist | `polite` venter til skjermleseren er ledig. Å utsette oppdateringen ville gitt et antall som ikke stemmer med kartet. |
| 9 | Blind | Teksten for null treff bygges ved hver rendering | low | patch | Bygges bare når det er null treff. |
| 10 | Blind | Dobbel blank linje i `FilterPanel.test.tsx` | low | patch | Fjernet. |
| 11 | Blind | Testene sammenligner hele markup-strenger | low | avvist | Det er mønsteret i prosjektets statiske tester (`App.test.tsx`). Det fanger også utilsiktede endringer i tilgjengelighet. |
| 12 | Blind | README forklarer ikke hvorfor forslaget er 12 cm og ikke 12,6 | low | patch | Én setning om at forslagene bruker sliderens hele steg. |
| 13 | Edge | Bannerets varianter er bare testet ved 1280 px | low | avvist | Banneret er samme komponent ved begge bredder. Oppsettet ved 375 px er testet med det vanligste forslaget og med bred font. |
| 14 | Edge | Ingen E2E velger mellom to krav | low | avvist | Valget gjøres av en ren funksjon som fasittabellen låser med tilfeller for likhet. Nettleseren viser bare resultatet. |

Sjekker lokalt etter gjennomgangen: lint, typecheck, test (464), build og `npm run test:e2e` (63) er grønne.
