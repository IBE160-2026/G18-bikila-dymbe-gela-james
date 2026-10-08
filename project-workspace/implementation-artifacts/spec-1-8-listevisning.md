---
title: 'Story 1.8: Bruk tilgjengelig listevisning i stedet for kart'
type: 'feature'
created: '2026-10-08'
status: 'done'
baseline_commit: '07e9ecec19163069e7682d64cf1b25493155eb5d'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-1-context.md'
  - '{project-root}/project-workspace/implementation-artifacts/spec-1-7-se-norgeskartet.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Kartet (Story 1.7) kan ikke brukes med tastatur eller skjermleser, og score vises som farge. Brukere uten mus, touch eller fargesyn har ingen fullverdig måte å utforske stedene på (FR-13, NFR-7, UJ-3).

**Approach:** Utforsk (`/`) får en kart/liste-veksler rett under toppnavigasjonen, og `visning=liste` i URL-en viser en tilgjengelig liste over de samme stedene fra samme `useSteder()`-hook. Hver rad viser navn, score som tall og etikett, og nysnø/vind/temperatur. Hele raden er en lenke til stedssiden. Listen sorteres med en ordinær `<select>` på score (standard), avstand og navn. En axe-test i Playwright krever null kritiske WCAG 2.1 AA-brudd på listesiden.

**Beslutninger (fra planene, 2026-10-08):**
- Vekslingen er to lenker, «Kart» og «Liste», rett under navigasjonen, med `aria-current` på den valgte (arkitekturens toggle; EXPERIENCE åpent spørsmål 1). Uten `visning` er standard `kart`.
- Avstand bruker nettleserens posisjon og bare når brukeren velger «Avstand» (PRD FR-13 «hvis posisjon er delt»). Posisjonen sendes aldri noe sted. Avslår brukeren, vises en melding, og sorteringen går tilbake til score.

## Boundaries & Constraints

**Always:**
- AD-8: én rute og én hook. Kart og liste bruker samme `useSteder()`, og ingen annen komponent laster data.
- Score vises aldri bare som farge: badge med tall og etikett («82 · Svært godt», fra `scoreText`/`ScoreBadge`). Ufullstendige data vises som teksten «Ufullstendige data», aldri som 0, og sorteres sist ved score-sortering.
- Navigasjon med Tab og Enter. Synlig fokusring i `accent`, trykkmål ≥ 44 px, kontrast ≥ 4,5:1, og hele raden er klikkmålet. Tallene bruker `tnum`.
- Rekkefølgen er stabil: lik score sorteres på navn (`localeCompare` med `nb`).
- `visning` leses fra og skrives til URL-en, og Tilbake-knappen virker. Vekslingen mellom kart og liste laster ikke data på nytt.
- Ny avhengighet `@axe-core/playwright` med eksakt versjon (siste, minst 7 dager gammel). Den kreves av storyens akseptansekriterium.

**Never:**
- Ingen filtre (Epic 3) og ingen aldersgrenser for data (Story 1.9).
- Ingen dra-og-slipp, og posisjon lagres ikke (heller ikke i `localStorage`).
- Ingen endring i kartvisningens oppførsel utover vekslingen.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Standard | `/` | Kartet vises; «Kart» har `aria-current` | N/A |
| Liste | `/?visning=liste` | 24 rader i demo, sortert på score synkende | N/A |
| Ukjent visning | `/?visning=noe` | Behandles som `kart` | N/A |
| Ufullstendig sted | `trondheim` | Raden viser «Ufullstendige data», sist ved score-sortering | Aldri «0» |
| Navn | Velg «Navn» | Alfabetisk på norsk (Ø og Å sist) | N/A |
| Avstand, tillatt | Posisjon gitt | Nærmeste først, avstand i km på hver rad | N/A |
| Avstand, avslått | Geolokasjon avslått eller ikke tilgjengelig | Melding i `role="status"`; sortering tilbake til score | Ingen krasj |
| Tastatur | Tab til en rad, Enter | Åpner `/sted/:id` | N/A |
| Tilbake | Liste → sted → Tilbake | Tilbake til listen, samme `visning=liste` | N/A |

</frozen-after-approval>

## Code Map

- `src/lib/router.ts` -- `parseRoute`, `href`, `navigate`, `useRoute`. Bare `pathname` i dag. Utvid med søkeparametre (`visning`). `navigate` må sammenligne hele stien med søk, ellers blir et gammelt `?visning=` liggende (funn 21 i 1.7-gjennomgangen).
- `src/pages/Utforsk.tsx` -- viser i dag `KartVisning`. Les `visning` her, vis veksleren og velg `KartVisning` eller ny `ListeVisning`.
- `src/components/Lenke.tsx` -- lenken i appen (preventDefault + `navigate`, hopper over modifikator-klikk). Bruk den for veksleren og radene.
- `src/components/ScoreBadge.tsx`, `src/lib/scoreTier.ts` (`scoreText`, `INCOMPLETE_LABEL`) -- gjenbruk dem, ikke kopier.
- `src/hooks/useSteder.ts` -- uendret.
- `shared/contracts/published.ts` -- `Sted` har `nysnoCm`, `vindMaks`, `temperatur` (alle kan være `null`), `lat`, `lon` og `snowScore`.
- `src/App.tsx`, `src/App.css` -- skjelettet og `.kart`-høyden. Listen trenger et eget skjelett i `surface-sunken`.
- `tests/e2e/kart.spec.ts` -- mønster for E2E: all trafikk utenom localhost stoppes, og `latest.json` får 404. Ny fil: `tests/e2e/liste.spec.ts`.
- `.github/workflows/e2e.yml` -- kjører allerede `npm run test:e2e` på PR.

## Tasks & Acceptance

**Execution:**
- [x] `package.json`, `package-lock.json` -- legg til `@axe-core/playwright` med eksakt versjon.
- [x] `src/lib/router.ts` (+ test) -- legg til søkeparametre i ruting og navigasjon; `visning` (`kart` | `liste`, standard `kart`).
- [x] `src/lib/sortering.ts` (+ test) -- en ren `sorterSteder(steder, valg, posisjon?)` for score (synkende, ufullstendige sist), navn (`nb`) og avstand (haversine, km). Lik verdi sorteres på navn.
- [x] `src/components/VisningVeksler.tsx` -- lenkene «Kart» og «Liste» med `aria-current`.
- [x] `src/components/ListeVisning.tsx` -- `<select>` med etikett «Sorter etter», og en liste (`<ol>`) der hver rad er én lenke med navn, badge og nysnø/vind/temp med enhet (eller «–»). Avstand vises ved avstandssortering. Geolokasjon hentes bare ved valg; ved avslag vises en status og sorteringen går tilbake til score.
- [x] `src/pages/Utforsk.tsx`, `src/App.css`, `src/App.tsx` (+ tester) -- veksler, valg av visning og skjelett for listen.
- [x] `tests/e2e/liste.spec.ts` -- med tastatur fra toppen: Tab til «Liste», Enter, sjekk 24 rader og at første rad har høyest score. Velg «Navn» og sjekk rekkefølgen, Tab til en rad, Enter åpner stedssiden, Tilbake gir listen. axe (`wcag2a`, `wcag2aa`) på `/?visning=liste` har ingen brudd med `impact` `critical`.
- [x] `README.md` -- én setning om listevisningen.

**Acceptance Criteria:**
- Given et rent klon, when `npm ci && npm run lint && npm run typecheck && npm test && npm run build` kjøres uten nett, then alt er grønt.
- Given installert Chromium, when `npm run test:e2e` kjøres, then kart-, liste- og axe-testene er grønne.

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: alt exit 0.
- `npm run test:e2e` -- expected: alle E2E-tester passerer, axe uten kritiske brudd.

**Manual checks:**
- `npm run dev`: bytt til «Liste» med tastatur, sorter på avstand (tillat posisjon), og åpne et sted med Enter.

## Review Triage Log

Tre lag: Blind Hunter (B), Edge Case Hunter (E) og Verification Gap (V). 21 funn.

| # | Lag | Funn | Vurdering | Rute | Begrunnelse |
|---|-----|------|-----------|------|-------------|
| 1 | V, B | Ingen test av liste → kart (rettingen av `navigate`) | medium | patch | Det stemmer. E2E aktiverer nå «Kart» fra listen. |
| 2 | E | Lokatoren `'Kart'` treffer også «Kartverket» | medium | patch | Det gir ustabile tester. Rettet med `exact: true`. |
| 3 | E | Lokatoren `'Kart'` i testen for ukjent visning | medium | patch | Samme rot som rad 2. |
| 4 | B | axe stopper bare på `critical`, så kontrast (`serious`) sjekkes ikke | medium | patch | Testen stopper nå også på `serious`. |
| 5 | B, E | Et sent geolokasjonssvar overstyrer et senere valg | low | patch | Det stemmer. Svaret brukes nå bare mens «Avstand» er valgt. |
| 6 | B, E | Ingen timeout på `getCurrentPosition` | medium | patch | Meldingen kunne bli stående for alltid. Nå er timeouten 10 s. |
| 7 | B | Radenes tilgjengelige navn flyter sammen | medium | patch | Det rammer skjermleserbrukere, som storyen er laget for. Det er nå skilletegn mellom delene. |
| 8 | B, E, V | «Tilbake til kartet» sender listebrukere til kartet | medium | patch | Lenken går nå tilbake i historikken når siden ble åpnet i appen. |
| 9 | B | `VISNINGER`/`SORTERINGER` er død kode | low | patch | Det er en direkte retting: de brukes nå til validering. |
| 10 | B, E, V | Sorteringsvalget går tapt etter Tilbake | low | defer | Specen la bare `visning` i URL-en. Sortering i URL-en hører hjemme sammen med filter-URL-en (FR-21, Epic 3). |
| 11 | E | Samtidige posisjonsforespørsler | low | avvist | Det har ingen synlig virkning når svarene bare brukes ved «Avstand» (rad 5). |
| 12 | E | Stien `//` kan gi feil tolkning | low | avvist | Brukeren må skrive en slik URL selv. Det gir ingen påvist krasj. |
| 13 | E | `#hash` ignoreres i sammenligningen | low | avvist | Appen bruker ingen hash. |
| 14 | E | `selectOption` er ikke ekte tastaturbruk | low | avvist | En vanlig `<select>` kan alltid brukes med tastatur. |
| 15 | B | KI-loggen og fremdriftsplanen mangler | false | avvist | De skrives ved leveringen. |
| 16 | B | Statusen i specen og `sprint-status` er ulik | false | avvist | `sprint-status` settes til `review` ved leveringen. |
| 17 | B | `navigate`/`useRoute` har ingen enhetstester | low | avvist | E2E dekker dem (rad 1) og kjører på PR. |
| 18 | B | `ListeVisning` har ingen enhetstester for status og avslag | low | avvist | E2E dekker avslag og avstand og kjører på PR. |
| 19 | V | Sorteringen går tapt (annen formulering) | low | defer | Samme som rad 10. |
| 20 | E | Avslag kan overstyre et senere valg (påstand) | low | patch | Samme som rad 5. |
| 21 | E | Tilbake-lenken på stedssiden (påstand) | medium | patch | Samme som rad 8. |
