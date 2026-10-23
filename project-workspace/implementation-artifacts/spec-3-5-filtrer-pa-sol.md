---
title: 'Story 3.5: Filtrer på sol (maks skydekke i dagslystimer)'
type: 'feature'
created: '2026-10-23'
status: 'done'
baseline_commit: 'd6e895c4725e0f93155a49a5adb88a2409b02b1b'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-3-context.md'
  - '{project-root}/project-workspace/implementation-artifacts/spec-3-3-treff-og-null-treff.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** En turgåer vil finne steder med utsikt til sol, ikke bare snø (FR-22: «maks skydekke i dagslystimer»). Datafila har bare skydekket som snitt over hele døgnet, natt inkludert, så den kan ikke si noe om sol.

**Approach (Aksel, 2026-10-23: «Dagslystimer, som FR-22»):**
- **Dataprogrammet** regner et nytt felt per sted, `skydekkeDagslys`: snittet av `cloud_area_fraction` i timene i vinduet der solen er over horisonten på stedet. Solhøyden regnes med en enkel, kjent formel (deklinasjon og timevinkel), uten ny avhengighet. Finnes ingen dagslystime i vinduet (mørketid), eller mangler timene, er feltet `null`.
- **Filteret** får et fjerde krav, **skydekke i dagslys høyst X %**, kombinert med OG som de andre. Spennet er 0–100 % med steg 10, og standard er 100, som betyr «Alle». Et sted uten verdi skjules når kravet er aktivt, som for de andre kravene. I mørketid betyr det at nordlige steder skjules når solkravet er på.
- **Adressen** får parameteren `sky`, i fast rekkefølge etter `temp`.
- **Forslaget ved null treff** (3.3) dekker det nye kravet automatisk, og panelets rekkefølge er nysnø, vind, temperatur, skydekke.
- **Stedssiden** viser «Skydekke i dagslys» i tallisten. Feltet viser «–» når verdien mangler.

## Boundaries & Constraints

**Always:**
- Solhøyden ligger i én ren funksjon i `shared/` (for eksempel `shared/sol.ts`), testet mot kjente verdier. Eksempler: Oslo ved sommersolverv kl. 11:20 UTC gir om lag 53–54°. Tromsø ved vintersolverv kl. 11 UTC gir under 0°.
- En time teller som dagslys når solhøyden ved timens tidspunkt (stegets `time`) er over 0°. Snittet tar bare med timer som har data.
- Kontrakten (`shared/contracts/published.ts`) får `skydekkeDagslys: 0–100 eller null`. En gammel `latest.json` uten feltet leses fortsatt (feltet blir `null`), så appen ikke feiler før neste kjøring av dataprogrammet.
- `npm run data:demo` regenererer `public/data/demo.json`. Testen for at demodataene er byte-like, og SnowScore-fasittabellen, består uendret bortsett fra det nye feltet.
- Filterreglene, avrundingen og fasittabellens eksisterende tilfeller endres ikke. Det nye kravet får egne tilfeller i `tests/golden/filter.json`.
- `data-dictionary.md`, AD-12 (adressen) og README beskriver det nye feltet og parameteren. PRD-en endres ikke, fordi FR-22 allerede sier dagslystimer.

**Never:** Ingen ny avhengighet. Ikke endre `skydekke`-feltet eller SnowScore. Ingen hurtigvalg (Story 3.4).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Dagslys | Sted i Sør-Norge i oktober, sol i deler av vinduet | `skydekkeDagslys` = snitt av dagslystimene, ikke av alle 24 | N/A |
| Mørketid | Sted nord for polarsirkelen ved vintersolverv | `skydekkeDagslys: null` | N/A |
| Manglende timer | Ingen dagslystime med data | `null` | N/A |
| Gammel datafil | `latest.json` uten feltet | Leses, feltet er `null`, solkravet skjuler stedet | Ingen feil |
| Filter | Skydekke høyst 60 % | Bare steder med avrundet `skydekkeDagslys` ≤ 60 | N/A |
| Adresse | `/?sky=60` | Kravet «høyst 60 %», gjenskapt fra lenken | Ugyldig verdi (`sky=65`, `sky=abc`) gir «Alle» |
| Null treff | Skydekke høyst 0 % i demo | Forslaget gjelder skydekke (nærmeste steg som gir treff) | N/A |

</frozen-after-approval>

## Code Map

- `scripts/pipeline/score.ts:25–48` -- `weatherFromForecast` bruker `selectWindow` og regner `skydekke` over alle timer. Regn `skydekkeDagslys` her, med stedets `lat`/`lon` (sendes inn fra `score()`, som har `entry`).
- `shared/snowscore.ts:140` -- `selectWindow` gir stegene i vinduet (24 timer fra referansetimen). Ikke endre.
- `shared/contracts/published.ts:58–74` -- `Sted` er `strictObject`. Legg til `skydekkeDagslys` som `z.number().min(0).max(100).nullable()`, slik at et manglende felt blir `null` (for eksempel med `.default(null)`).
- `shared/contracts/data-dictionary.md` -- ny rad ved `skydekke`.
- `shared/filter.ts` -- `FilterParams`, `FILTER_GRENSER`, `FILTER_KRAV`, `Filtrerbar`, `parseFilter`/`serializeFilter` og `forslagVedNullTreff`. Legg til `maksSkydekkeDagslys` (spenn 0–100, steg 10, standard 100) og parameteren `sky`.
- `tests/golden/filter.json`, `shared/filter.test.ts` -- de faste stedene får `skydekkeDagslys`. Nye tilfeller for kravet, for grensen og for `null`. Gamle forventninger er uendret.
- `src/components/FilterPanel.tsx` -- `KRAV_TEKST` får skydekke («Skydekke i dagslys», «høyst», «%»). Panelet viser fire slidere.
- `src/pages/Sted.tsx:30–44` -- tallisten får «Skydekke i dagslys».
- `src/lib/router.ts` -- adressen bruker `serializeFilter`, så `sky` kommer med automatisk. Sjekk rekkefølgen.
- `project-phase-folders/2-Planleggingsfasen/SnowFinder-Arkitektur.md` (AD-12) og kopien -- `sky` i rekkefølgen.
- `tests/e2e/filter.spec.ts` -- E2E for kravet, adressen og forslaget. Ved 375 px må bunn-arket med fire slidere ikke rulle sidelengs.

## Tasks & Acceptance

**Execution:**
- [x] `shared/sol.ts` (+ test) -- solhøyde.
- [x] `scripts/pipeline/score.ts` (+ test) -- `skydekkeDagslys`, med tester for dagslys, mørketid og manglende timer.
- [x] `shared/contracts/published.ts`, `data-dictionary.md` -- feltet, også for gamle filer.
- [x] `public/data/demo.json` -- regenerert med `npm run data:demo`.
- [x] `shared/filter.ts`, `filter.test.ts`, `tests/golden/filter.json` -- det fjerde kravet, adressen og forslaget.
- [x] `src/components/FilterPanel.tsx`, `src/pages/Sted.tsx` (+ tester) -- slider og visning.
- [x] `tests/e2e/filter.spec.ts` -- matrisen som kan vises med demodata, ved 1280 og 375 px.
- [x] Arkitektur (begge kopier) og README.

**Acceptance Criteria:**
- Given rettingen, when lint, typecheck, test, build og `npm run test:e2e` kjøres, then er alle grønne, og `gh pr checks` er grønn før merge.

## Implementation Notes

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: alle grønne
- `npm run data:demo && git diff --stat public/data/demo.json` -- expected: bare det nye feltet endres
- `npm run test:e2e` -- expected: alle grønne

## Review Triage Log

Tre lag: Blind Hunter (11 funn), Edge Case Hunter (2 funn) og Verification Gap (ingen hull, ett annet funn).

| # | Lag | Funn | Vurdering | Rute | Begrunnelse |
|---|-----|------|-----------|------|-------------|
| 1 | Blind | Demodataene er ikke i diffen, så det er uklart om verdiene er regnet eller skrevet inn | false | avvist | `run.test.ts` krever at `demo.json` er byte-lik det dataprogrammet lager (bekreftet av VG). Diffen viser bare det nye feltet. |
| 2 | Blind | PRD, UX, epics, KI-logg og fremdriftsplan er ikke oppdatert | low | delvis | PRD og epics trenger ingen endring: FR-22 sier allerede dagslystimer. KI-logg og fremdriftsplan skrives ved leveringen. Den fjerde slideren føres inn i oppføringen til `bmad-ux` i `deferred-work.md`. |
| 3 | Blind | `.default(null)` i kontrakten svekker sjekken av det dataprogrammet skriver | medium | patch | Feltet er påkrevd i `Sted`. Gamle filer får `null` bare når appen leser dem. |
| 4 | Blind | Brukeren får ingen forklaring når steder forsvinner i mørketid | medium | patch | Hjelpetekst under slideren, koblet med `aria-describedby`. |
| 5 | Blind | Tre navn på samme krav | low | patch | README bruker «skydekkekravet», som appen. |
| 6 | Blind | README sier «døgnet», men verdien gjelder de neste 24 timene | low | patch | Rettet. Raden på stedssiden og spennet er nevnt. |
| 7 | Blind | Testtimene ligger innenfor formelens feilmargin | low | patch | Testene bruker timer langt fra horisonten. At «over 0°» er geometrisk, er dokumentert. |
| 8 | Blind | Tester mangler for midnattssol, årsskifte og skuddår | low | patch | Lagt til. NaN i `lat`/`lon` er avvist som funn, fordi katalogen valideres før dataprogrammet kjører. |
| 9 | Blind, VG | Testnavnet «all three requirements» er utdatert | low | patch | Testen setter nå alle fire. |
| 10 | Blind | README beskriver ikke spennet for `sky` | low | patch | Står i README. Omskrivingen av `sky=100` følger regelen for standardverdier i AD-12. |
| 11 | Blind | Rotete linjebrudd i en kommentar og i arkitekturen | low | patch | Brutt om, og begge kopiene er like. |
| 12 | Edge | Én målt dagslystime kan avgjøre filteret | low | patch | Samme regel som SnowScore: mangler mer enn 10 % av dagslystimene, blir verdien `null`. |
| 13 | Edge | En kort vinterdag nær polarsirkelen kan falle mellom to hele timer | low | patch | En time teller som dagslys hvis solen er oppe ved timen eller en halvtime senere. Testet. |

Sjekker lokalt etter gjennomgangen: lint, typecheck, test (498), build og `npm run test:e2e` (70) er grønne. Halvtimesregelen ga nye dagslysverdier for 12 demosteder (Bergen fra 7,9 til 11,2 %). `demo.json` er regenerert, og testen for byte-likhet består.
