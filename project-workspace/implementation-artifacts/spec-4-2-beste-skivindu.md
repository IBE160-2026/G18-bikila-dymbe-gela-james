---
title: 'Story 4.2: Se beste skivindu på stedssiden'
type: 'feature'
created: '2026-10-28'
status: 'done'
baseline_commit: '404ac4a5b02d7001525c9c9f631addfc663c1e73'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-4-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Stedssiden sier hvor snøen er (SnowScore), men ikke når det er best å dra (FR-17).

**Approach:** Dataprogrammet regner ut beste skivindu for hvert sted med en ren funksjon i `shared/skivindu.ts` og skriver det i datafilen sammen med flagget `skivinduUtenDagslys` (AD-2). Stedssiden viser et kort «Beste skivindu» som bare leser feltene og aldri regner mørketid selv.

**Regelen:** Vurder 48 hele timer fra timen som inneholder `referenceTime`. En time er kandidat når den har vind og skydekke, ligger etter siste time med snøfall i perioden, og er en dagslystime (`erDagslystime`). Har perioden ingen dagslystimer i det hele tatt (mørketid), er alle timer med data etter snøfallet kandidater, og flagget settes. Vinduet er fire sammenhengende kandidattimer.

**For få timer (Aksel, 2026-10-28, A):** Finnes det ikke fire sammenhengende kandidattimer, vises det beste sammenhengende vinduet med færre timer (lengste mulige lengde), med teksten «Bare N sammenhengende dagslystimer». Kortet forsvinner aldri.

**Rangering (Aksel, 2026-10-28, A):** Lavest snittvind avrundet til hele m/s vinner. Ved lik vind vinner lavest snittskydekke, deretter det tidligste vinduet.

**Mørketid i demo (Aksel, 2026-10-28, A):** Demodataene gjelder 7. oktober, da det ikke er mørketid noe sted i Norge. Vi legger ikke til et fiktivt demosted. Mørketid dekkes av fasittabellen, enhetstester og en E2E-test med tilpassede data. Avviket fra FR-30 («ett sted i mørketid i demodata») føres i `deferred-work.md` for `bmad-correct-course`.

## Boundaries & Constraints

**Always:** Samme funksjon brukes av dataprogrammet og fasittabellen. Tidsstempler i datafilen er UTC (ISO 8601); norsk tid bare i UI. Appen leser `skivinduUtenDagslys` direkte. Tokens fra `tokens.css`, ingen literal hex/px. Demodata regenereres med `npm run data:demo`, aldri for hånd.

**Never:** Ikke endre `WINDOW_HOURS` (24) eller SnowScore. Ingen ny avhengighet. Ingen dagslysregel utenom `shared/sol.ts`. Ikke tell dagslystimer i `src/`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Vanlig dag | Ingen snø, flere dagslysperioder | De fire sammenhengende dagslystimene med lavest avrundet snittvind; flagg `false` | N/A |
| Snøfall slutter midt i | Snø til time 20 | Vinduet starter tidligst time 21; `etterSnofall: true` | N/A |
| For få timer | Lengste sammenhengende kandidatrekke er 2 timer | Vindu på 2 timer, kortet sier «Bare 2 sammenhengende dagslystimer» | N/A |
| Mørketid | Ingen dagslystime i de 48 timene | Fire timer valgt blant alle timer; flagg `true`; kortet viser «Mørketid – vindu vist uten dagslys» | N/A |
| Snør hele perioden / ingen data | Ingen kandidattimer, eller MET mangler | `skivindu: null`; kortet sier at det ikke fant noe skivindu de neste 48 timene | Ingen feil |
| Lik vind | To vinduer med samme avrundede snittvind | Lavest snittskydekke vinner, deretter tidligst | N/A |

</frozen-after-approval>

## Code Map

- `shared/skivindu.ts` (ny) -- ren funksjon. Inndata: timer `{ time, vindMs|null, skydekke|null, nedborMm|null, temperaturC|null }` og `lat/lon`. Utdata: `{ skivindu, skivinduUtenDagslys }`. Snøfall i en time = `nedborMm × snowFraction(temperaturC) ≥ 0,1 mm` (`snowFraction` i `shared/snowscore.ts` L61). Manglende nedbør teller som ikke snø; manglende vind eller skydekke gjør timen til ikke-kandidat og bryter rekken.
- `shared/sol.ts` L49 `erDagslystime(time, lat, lon)` -- gjenbruk.
- `scripts/pipeline/score.ts` -- `Weather` (L10–17) og `NO_WEATHER` (L20) får de to feltene. `weatherFromForecast` (L54–80) bygger 48 timer fra `timeseries` (`instant.details.wind_speed`, `cloud_area_fraction`, `air_temperature`, `next_1_hours.details.precipitation_amount`), med samme start som `cloudInDaylight` (L39–51). Ikke bruk `selectWindow` (24 t).
- `shared/contracts/published.ts` L58–80 -- `Sted` er `strictObject`: legg til `skivindu: z.strictObject({ start: iso, timer: int 1–4, snittVindMs, snittSkydekke, etterSnofall: boolean }).nullable()` og `skivinduUtenDagslys: z.boolean()`, med JSDoc.
- `shared/contracts/data-dictionary.md` `### Sted` (L74) -- nye rader.
- `src/lib/data/loadPublishedData.ts` L40–46 -- eldre filer uten feltene får `skivindu: null`, `skivinduUtenDagslys: false` (som `skydekkeDagslys`), med test i `loadPublishedData.test.ts`.
- `src/lib/format.ts` -- ny `tidsrom(startIso, timer)` → «lørdag 10–14» (nb-NO, Europe/Oslo), ved siden av `norskTid` (L36).
- `src/pages/Sted.tsx` L53–80 og `src/App.css` L260–282 -- nytt kort `section.sted-kort.kort.skivindu` med `surface-sunken`. Mobil: under SnowScore-kortet. ≥768 px: høyre kolonne ved siden av SnowScore og Grunnlag (grid-områder).
- `tests/golden/skivindu.json` (ny) og `shared/skivindu.test.ts` -- mønster fra `shared/filter.test.ts` L32–46: `grenser` + `tilfeller`.
- `tests/e2e/sted.spec.ts` -- kortet i demo; mørketid via `page.route` som setter flagget i datafilen.
- `public/data/demo.json` -- regenereres; byte-testen i `scripts/pipeline/run.test.ts` L27–36 må bestå.

## Tasks & Acceptance

**Execution:**
- [x] `shared/skivindu.ts`, `shared/skivindu.test.ts`, `tests/golden/skivindu.json` -- funksjonen, fasittabellen med matrisens seks tilfeller, og enhetstester for grensene (0,1 mm, avrunding av vind, brudd i rekken).
- [x] `shared/contracts/published.ts`, `data-dictionary.md` -- kontrakten.
- [x] `scripts/pipeline/score.ts` (+ test) -- 48 timer og feltene; `NO_WEATHER` gir `null`/`false`.
- [x] `src/lib/data/loadPublishedData.ts` (+ test) -- bakoverkompatibilitet.
- [x] `src/lib/format.ts` (+ test), `src/pages/Sted.tsx`, `src/App.css` -- kortet og plasseringen.
- [x] `public/data/demo.json` -- `npm run data:demo`.
- [x] `tests/e2e/sted.spec.ts` -- kortet ved 1280 og 375 px, mørketid, axe, ingen horisontal rulling.
- [x] `README.md`, `deferred-work.md` -- stedssiden viser skivindu; avviket fra FR-30.

**Acceptance Criteria:**
- Given stedssiden for et demosted med data, when den lastes, then viser kortet «Beste skivindu» et tidsrom i norsk tid og en begrunnelse med snittvind og skydekke.
- Given en datafil der `skivinduUtenDagslys` er `true`, when stedssiden vises, then står «Mørketid – vindu vist uten dagslys» i kortet.
- Given fasittabellen, when testen kjøres, then gir `shared/skivindu.ts` forventet vindu for alle tilfeller.
- Given lint, typecheck, test, build og `npm run test:e2e`, when de kjøres, then er alle grønne.

## Implementation Notes

- Kortet er en egen komponent, `src/components/Skivindukort.tsx` (med `Skivindukort.test.tsx`), som `Sted.tsx` setter inn mellom SnowScore- og Grunnlag-kortet. Kortene fikk klassene `snowscore` og `grunnlag` for grid-områdene; `App.test.tsx` sin regex for SnowScore-kortet er oppdatert til den nye klassen.
- Fasittabellen har sju tilfeller: matrisens seks, der «Snør hele perioden / ingen data» er delt i to. Timene står én per linje; `grenser` beskriver reglene. Snitt sammenlignes med `toBeCloseTo`, fordi de lagres uavrundet.
- Manglende temperatur teller som ikke snø, som manglende nedbør (MET har alltid temperatur i et steg som finnes).
- `skivinduUtenDagslys` er sant når ingen av de 48 timene er dagslystimer, også når det ikke finnes noe vindu (for eksempel snø hele mørketidsperioden). Kortet viser da både «Fant ikke noe skivindu …» og mørketidsteksten. Ved `NO_WEATHER` er flagget `false`.
- Kortet viser vind og skydekke avrundet til hele tall, siden rangeringen sammenligner hele m/s. I mørketid sier et kort vindu «Bare N sammenhengende timer» (ikke «dagslystimer»); entall «dagslystime» ved N = 1.
- `tidsrom` viser to sifre for timen («fredag 07–09»), «24» når vinduet slutter ved midnatt, og begge dagene når det krysser midnatt.
- I demo har fem steder `skivindu: null` (snø gjennom perioden), blant dem Gaustatoppen; E2E bruker Hafjell for kortet med vindu og Gaustatoppen for meldingen uten vindu.
- `loadPublishedData` fyller nå alle nyere felt fra ett oppslag (`NYERE_FELT`), også `skydekkeDagslys` fra 3.5.

## Spec Change Log

## Review Triage Log

### Runde 1

Tre lag: Blind Hunter (13 funn), Edge Case Hunter (6 funn) og Verification Gap (1 gap og 1 annet funn). Ingen intent_gap eller bad_spec, så det ble ingen loopback.

- **medium → patch** (Verification Gap, pre-verifisert): Grensene på 48 timer i `skivinduTimer` var ikke festet av noen test. Ny test i `score.test.ts` med et rolig vindu før referansetimen og etter time 48.
- **low → avvist** (Verification Gap): «Bare N sammenhengende dagslystimer» gir feil grunn når rekken brytes av manglende MET-data. Teksten er fastsatt i den frosne intensjonen, og manglende timer midt i perioden er sjeldne.
- **low → avvist** (Edge Case Hunter): Et vindu kan være passert når dataene er opptil 12 timer gamle. Dataprogrammet kjører hver time, og gamle data har eget banner (1.6). En retting krever ny logikk mot klokka i kortet.
- **low → avvist** (Edge Case Hunter): Første time kan være opptil 59 minutter forbi. Perioden starter i timen som inneholder `referenceTime` etter den frosne intensjonen, samme som SnowScore.
- **low → patch** (Edge Case Hunter, Blind Hunter): Et snitt som er 2,5 i desimal, kan bli 2,4999… i flyttall og rundes ned. Snittet avrundes nå til fast presisjon før `Math.round`, med test.
- **false** (Edge Case Hunter, Blind Hunter): Vindu over overgang til eller fra sommertid. Overgangen skjer kl. 02–03 om natta, da det ikke er dagslys i oktober eller mars, og mørketid (desember–januar) har ingen overgang. Et vindu kan derfor ikke krysse den.
- **low → avvist** (Edge Case Hunter, Blind Hunter): Meldingen uten vindu sier ikke om årsaken er snø eller manglende data. Krever et nytt felt i kontrakten. Steder uten MET-data er allerede merket «Ufullstendige data».
- **low → avvist** (Edge Case Hunter, Blind Hunter): Ukjent nedbør teller som ikke snø. Beslutningen står i Code Map, og MET har `next_1_hours` for hele perioden på 48 timer i både demo og drift.
- **low → defer** (Blind Hunter): I mørketid kan vinduet havne midt på natta. Det følger FR-17 og den frosne intensjonen, så endringen går til `bmad-correct-course` via `deferred-work.md`.
- **false** (Blind Hunter): Dagslys før snøfallet nær mørketid gir `null`. Den frosne intensjonen definerer mørketid som ingen dagslystime i perioden, og kortet vises fortsatt med meldingen uten vindu. Det forsvinner ikke.
- **false** (Blind Hunter): En liten byge sent i perioden sletter gode timer før den. Regelen «etter siste snøfall» er FR-17, og den frosne intensjonen sier det samme.
- **low → avvist** (Blind Hunter): Ingen terskel for fullstendige data som i SnowScore. Det ville vært en ny regel som verken FR-17 eller spec-en har, og manglende timer er sjeldne.
- **low → patch** (Blind Hunter): README beskrev rangeringen som om vind og skydekke teller sammen. Rettet, og det korte vinduet og meldingen uten vindu er nevnt.
- **false** (Blind Hunter): Statusen i spec-en og `sprint-status.yaml` er ulik. Steg 5 synker `sprint-status` til `review` før commit, og loggen fylles nå.
- **low → defer** (Blind Hunter): AD-12 og UX-dokumentene mangler de nye feltene og tekstene. Ført i `deferred-work.md` for `bmad-architecture` og `bmad-ux`. KI-loggen skrives før commit.
- **low → patch** (Blind Hunter): Teksten `grenser` i fasittabellen sa «dagslystimer» også i mørketid. Rettet så den stemmer med `Skivindukort.tsx`.
- **false** (Blind Hunter): `if (beste === null)` er død kode. Den trengs for typeinnsnevringen i TypeScript. `HOUR_MS` var definert i flere filer allerede før denne storyen.
- **low → patch** (Blind Hunter): E2E-testen for mørketid brukte et dagslysvindu sammen med flagget, en tilstand dataprogrammet ikke kan lage. Testen setter nå et nattvindu.
- **low → avvist** (Blind Hunter): Mørketidsteksten er like dempet som begrunnelsen. Det er et designvalg uten en navngitt skade, og teksten er synlig og lest av skjermleser.

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: alle grønne
- `npm run data:demo && git diff --stat public/data/demo.json` -- expected: bare de nye feltene endret
- `npm run test:e2e` -- expected: grønn, inkludert nye skivindu-tester
