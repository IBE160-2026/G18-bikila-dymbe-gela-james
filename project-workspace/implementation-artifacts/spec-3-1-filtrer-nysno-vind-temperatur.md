---
title: 'Story 3.1: Filtrer på nysnø, vind og temperatur'
type: 'feature'
created: '2026-10-22'
status: 'done'
baseline_commit: 'b65a750353f477bf5e8184f622e7db047cc3b1ee'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-3-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Utforsk viser alle stedene på kartet og i listen, men brukeren kan ikke si hva hen krever. Den som vil ha minst 10 cm nysnø, lite vind og kulde, må lete selv. FR-20 og UJ-1 steg 2 krever et flerkriteriefilter.

**Approach:** Et filterpanel med tre krav, kombinert med OG: **nysnø minst X cm**, **vind høyst Y m/s** og **temperatur høyst Z °C**. Kart og liste viser bare stedene som oppfyller alle aktive krav. Filterlogikken ligger i `shared/filter.ts` og låses av en fasittabell. Panelet er et fast venstre sidepanel fra 768 px og et bunn-ark under 768 px.

**Beslutninger (Aksel, 2026-10-22):**
- **Temperatur** er én grense: høyst Z °C (snittemperaturen i vinduet, feltet `temperatur`).
- **Spenn og standard:** nysnø 0–30 cm, vind 0–25 m/s og temperatur −20 til +10 °C, alle med steg 1. Hvert krav står som standard i ytterpunktet som betyr «ingen grense» (nysnø 0, vind 25, temperatur +10), og vises da som «Alle». Ingen steder skjules før brukeren endrer noe.
- **Manglende verdi:** Er et krav aktivt og stedet mangler verdien (`null`, for eksempel ved ufullstendige data), vises ikke stedet, fordi vi ikke kan si at det oppfyller kravet. Uten aktive krav vises alle.
- **Bunn-arket åpnes med en knapp, ikke ved å dra.** Lukket viser det knappen «Filter» og de aktive kravene som chips. Avviket fra «kan dras opp» i EXPERIENCE.md er bevisst: en knapp virker med tastatur og skjermleser og er stabil å teste.

## Boundaries & Constraints

**Always:**
- Grensene er inkluderende: nysnø ≥ X, vind ≤ Y, temperatur ≤ Z. Det sammenlignes med verdien avrundet til én desimal, slik appen viser den (`tall()` i `src/lib/format.ts`). Da stemmer filteret med tallet brukeren ser.
- `shared/filter.ts` er den eneste filterlogikken (AD-6). Den er ren, uten React og DOM, og importerer bare typer fra `shared/contracts/`. Kart og liste bruker samme filtrerte liste.
- Steder som allerede er fjernet for alder (over 12 t) blir aldri synlige igjen. Filteret legges på listen `Utforsk` får i dag.
- Kartet beholder zoom og utsnitt når filteret endres. Bare markørene byttes.
- Kontrollene er ordinære skjemafelt: `<input type="range">` med synlig `<label>`, verdien vises ved siden av, og `aria-valuetext` gir en lesbar verdi («minst 10 cm», «Alle»). Trykkmål er minst 44 px. Fokusring og aktiv verdi bruker `accent`. Bare variabler fra `tokens.css`.
- «Nullstill» er synlig når minst ett krav er aktivt, og setter alle tre tilbake til standard.
- Null treff gir aldri en tom flate. Teksten «Ingen steder oppfyller alle kravene.» vises med «Nullstill». Forslaget om hvilket krav som bør lempes, og antall treff mens man justerer, kommer i Story 3.3.
- Filteret overlever bytte mellom kart og liste i samme økt. Det skal ligge i URL-en, men først i Story 3.2.
- Bunn-arket bruker `rounded.lg` og den svake skyggen fra DESIGN.md. `prefers-reduced-motion` slår av animasjonen. Siden ruller ikke sidelengs ved 320 og 375 px, heller ikke med bred font.

**Never:** Ingen ny avhengighet. Ingen URL-parametre ennå (Story 3.2). Ingen treff-teller med `aria-live` og ikke noe forslag ved null treff (Story 3.3). Ingen hurtigvalg, sol, avstand, stedstype eller NVE-filter (Story 3.4–3.8). Ingen dra-bevegelse i bunn-arket. Planleggingsdokumentene endres ikke her: avviket i bunn-arket meldes til `bmad-ux` via `deferred-work.md`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Ingen krav | Alle tre i standard | Alle steder vises, også ufullstendige | N/A |
| Ett krav | Nysnø minst 3 cm | Steder med `nysnoCm` avrundet ≥ 3 | N/A |
| Grense | Nysnø minst 3, sted med 3,000000000000001 eller 2,96 | Begge vises (avrundet 3,0) | N/A |
| Kombinert med OG | Nysnø ≥ 2, vind ≤ 10, temperatur ≤ 0 | Bare steder som oppfyller alle tre | N/A |
| Manglende verdi | Vind ≤ 10, sted med `vindMaks: null` | Stedet vises ikke | N/A |
| Ufullstendig sted | Ingen krav, deretter temperatur ≤ 0 | Vises uten krav, skjules med kravet | N/A |
| Null treff | Krav ingen oppfyller | Teksten om null treff og «Nullstill»; kartet viser ingen markører | N/A |
| Nullstill | Etter null treff, trykk «Nullstill» | Alle steder igjen, alle krav «Alle», knappen skjult | N/A |

</frozen-after-approval>

## Code Map

- `shared/contracts/published.ts` -- `Sted` med `nysnoCm` (cm, 1 mm ≈ 1 cm, allerede omregnet av dataprogrammet), `vindMaks`, `temperatur`. Alle kan være `null`. Ikke endre kontrakten.
- `shared/snowscore.ts` og `shared/snowscore.test.ts:34` -- mønsteret for delt logikk og fasittabell (`tests/golden/snowscore.json` med feltet `grenser` som forklarer grensene i klartekst). Følg det for `shared/filter.ts`, `shared/filter.test.ts` og `tests/golden/filter.json`.
- `src/lib/format.ts:16` -- `tall()` runder til én desimal. Filteret må runde likt. Importer ikke fra `src/` inn i `shared/`: gjør avrundingen i `shared/filter.ts`, og la gjerne `tall()` bruke den samme hjelpefunksjonen.
- `src/pages/Utforsk.tsx` -- får `steder` (alder allerede filtrert) og `visning`. Her bor filtertilstanden (`useState`), filtreringen og layouten med panelet. `App.tsx:31` rendrer `Utforsk` på samme plass for kart og liste, så tilstanden overlever byttet.
- `src/components/KartVisning.tsx` -- bygger hele kartet på nytt når `steder` endres (effekten avhenger av `[steder]`, og `fitBounds` kjører hver gang). Del opp: kart, fliser og `fitBounds` én gang, og et markørlag (`L.layerGroup`) som tømmes og fylles når `steder` endres. Zoom-håndteringen skal virke på de nye markørene. `data-sted-id` beholdes.
- `src/components/ListeVisning.tsx` -- får den filtrerte listen. Sortering og posisjon er urørt.
- `src/App.css` -- ny stil kan ligge i en egen fil, for eksempel `src/styles/filter.css`, importert i `src/main.tsx` etter `App.css` (A7). Gjenbruk `.kort` der et kort passer. Brytpunkt 768 px som resten av appen.
- `tests/e2e/liste.spec.ts` og `tests/e2e/forklaring.spec.ts` -- mønster for axe (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`; `serious` og `critical` feiler), test ved 375 px og bred font (`BRED_FONT`).
- Demodata (`public/data/demo.json`, 24 steder): nysnø 0–12,6 cm, vind 2,7–17,5 m/s, temperatur −10,2 til +9,6 °C. Trondheim er ufullstendig. For eksempel gir nysnø ≥ 2 og temperatur ≤ 0 seks steder.

## Tasks & Acceptance

**Execution:**
- [x] `shared/filter.ts` -- `FilterParams` (tre grenser, `null` = av), `FILTER_GRENSER` (spenn, steg, standard per krav), `STANDARD_FILTER`, `aktiveKrav(params)` og `filtrerSteder(steder, params)` etter reglene over -- den eneste filterlogikken.
- [x] `tests/golden/filter.json` og `shared/filter.test.ts` -- 5–8 steder og minst seks kombinasjoner som dekker matrisen. Feltet `grenser` forklarer inkludering, avrunding og manglende verdier. Legg også til en test for at 300 steder filtreres langt under 2 s (NFR-1) -- CI-blokkerende, slik `npm test` er.
- [x] `src/components/FilterPanel.tsx` (og en eventuell liten `Filterfelt`-komponent) -- tre slidere med label, verdi og `aria-valuetext`, «Nullstill», og bunn-ark med knappen «Filter» (`aria-expanded`, `aria-controls`) og chips for aktive krav under 768 px.
- [x] `src/pages/Utforsk.tsx` -- filtertilstand, filtrering før kart og liste, layout med sidepanel eller bunn-ark, og null-treff-teksten. «Slik beregner vi SnowScore» og kart/liste-veksleren beholdes.
- [x] `src/components/KartVisning.tsx` -- kartet opprettes én gang, og markørlaget oppdateres når `steder` endres, uten ny `fitBounds`.
- [x] Stil -- sidepanel fra 768 px, bunn-ark under, `prefers-reduced-motion`, ingen sideveis rulling.
- [x] Enhetstester for panelet med `renderToStaticMarkup` (labels, standardverdier som «Alle», «Nullstill» skjult uten aktive krav).
- [x] `tests/e2e/filter.spec.ts` -- ved 1280 og 375 px: panelets plassering (venstre sidepanel eller bunn-ark), at et krav reduserer listeradene og kartmarkørene til riktig antall, at null treff viser teksten og «Nullstill» virker, at zoom beholdes når et krav endres, at filteret overlever bytte til liste, axe uten alvorlige brudd, og ingen sideveis rulling med bred font ved 375 px.
- [x] `project-workspace/implementation-artifacts/deferred-work.md` -- én oppføring til `bmad-ux`: bunn-arket åpnes med knapp, ikke ved å dra; EXPERIENCE.md bør oppdateres.

**Acceptance Criteria:**
- Given Utforsk med demodata, when brukeren setter nysnø minst 2 cm og temperatur høyst 0 °C, then viser både kart og liste de samme seks stedene.
- Given fasittabellen, when `npm test` kjøres, then kjøres den mot `shared/filter.ts`, og en endret regel får testen til å feile.
- Given 375 px og 1280 px, when siden lastes, then ligger panelet som bunn-ark eller som fast venstre sidepanel, og Playwright bekrefter det.
- Given rettingen, when lint, typecheck, test, build og `npm run test:e2e` kjøres, then er alle grønne.

## Implementation Notes

- `aktiveKrav` treats a limit equal to its range's default (nysnø 0, vind 25, temperatur 10) as off, same as `null`, so a slider at «Alle» never hides incomplete places. The golden table locks this ("Grenser i ytterpunktet er av").
- `tall()` in `src/lib/format.ts` and `shared/filter.ts` both use `rundTilEnDesimal` from `shared/avrunding.ts`, so display and filter cannot drift apart.
- «Nullstill» also sits on the closed bottom sheet next to the chips, so it is visible whenever a requirement is active. After a reset, focus moves to the first slider, or to «Filter» when the sheet is closed.
- The bottom sheet is `position: sticky` at the end of Utforsk rather than `fixed`, so it never covers the last list row. `.kart` gets `isolation: isolate` so Leaflet's z-indexes stay under the sheet.
- `kart.spec.ts`: the narrower map (side panel) lowers the first zoom, which exposed a latent flake: Leaflet ignores a second «Zoom in» during the 250 ms animation. `tests/e2e/kartZoom.ts` waits for each zoom step; both map tests use it.

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: alle grønne
- `npm run test:e2e` -- expected: alle grønne, også `filter.spec.ts`

**Manual checks (if no CLI):**
- `npm run dev`: sjekk ved 375 og 1280 px at panelet ser riktig ut, at sliderne kan betjenes med piltaster, og at kartet ikke hopper når et krav endres.

## Review Triage Log

Tre lag: Blind Hunter (13 funn), Edge Case Hunter (2 funn) og Verification Gap (1 hull).

| # | Lag | Funn | Vurdering | Rute | Begrunnelse |
|---|-----|------|-----------|------|-------------|
| 1 | VG, Blind | Null treff i listevisningen er ikke testet | medium | patch | Ny E2E i listevisningen: nysnø 30 gir teksten og 0 rader, «Nullstill» gir 24. Listen er det tilgjengelige alternativet til kartet. |
| 2 | Blind | Fasittilfellet for ytterpunktene beviser ingenting, fordi ingen steder går forbi 25 m/s eller +10 °C | medium | patch | Fixture-steder har nå vind 30 og temperatur 12, og de er med når grensene står i ytterpunktet. |
| 3 | Blind | Ingen negativ temperaturgrense, og ingen sak som skiller nysnø 0 fra `null` | low | patch | Nye tilfeller: −5 mot −5,04 og −4,96, og nysnø ≥ 1 mot 0. |
| 4 | Blind | `grenser` sier «x,x5 rundes opp», som ikke stemmer med flyttall | low | patch | Omformulert til `Math.round(verdi × 10) / 10`, samme som visningen. |
| 5 | Blind | Null treff annonseres ikke for skjermleser | medium | patch | Meldingen har `role="status"`. Treff-antallet kommer i 3.3. |
| 6 | Blind | Tidstesten for 300 steder er svak | low | avvist | Spec-en krever en test for NFR-1. Filteret er en ren funksjon som bruker under 1 ms, så grensen på 200 ms gir god margin. |
| 7 | Blind | En test sjekker prosaen og antall fixture-steder, ikke koden | low | patch | Fjernet. |
| 8 | Blind, Edge | Filteret nullstilles etter en tur til stedssiden | medium | defer | Følger av at tilstanden ligger i `Utforsk` til Story 3.2 legger den i URL-en. Ført i `deferred-work.md` med krav om E2E i 3.2. |
| 9 | Blind | Bunn-arket mangler Escape og fokusflytting | low | avvist | Arket er en utvidbar seksjon (disclosure), ikke en modal. Det dekker ikke siden, og fokus ligger på «Filter», som lukker det. |
| 10 | Blind | «Nullstill» kan vises to ganger ved null treff | low | avvist | Begge gjør det samme og står i hvert sitt område (panelet og meldingen). Det er ikke et WCAG-brudd. |
| 11 | Blind | `format.ts` avhenger av filtermodulen; `.kart { isolation }` ligger i `filter.css` | low | patch (første del) | Avrundingen er flyttet til en nøytral modul. `isolation` er der på grunn av bunn-arket og hører hjemme i filterstilen. |
| 12 | Blind | KI-logg mangler | false | avvist | Gjøres ved leveringen. |
| 13 | Blind | Zoom-hjelperen i E2E henger ved maks zoom | low | avvist | Testene klikker bare to steg fra landsnivå. En feil gir tidsavbrudd med tydelig testnavn. |
| 14 | Edge | Hvert slider-steg bygger alle markører på nytt, også når treffene er de samme, og kommentaren lover noe annet | low | patch (kommentar) | 24–300 markører bygges på noen millisekunder. Kommentaren beskriver nå hva som skjer. |

Sjekker lokalt etter gjennomgangen: lint, typecheck, test (404), build og `npm run test:e2e` (36) er grønne.
