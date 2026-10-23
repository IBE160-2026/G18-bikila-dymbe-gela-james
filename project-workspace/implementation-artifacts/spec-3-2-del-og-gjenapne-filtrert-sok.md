---
title: 'Story 3.2: Del og gjenåpne et filtrert søk'
type: 'feature'
created: '2026-10-23'
status: 'done'
baseline_commit: '9cdb33b5d709c2e19bfe695819d1623ad88b6378'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-3-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Filteret fra Story 3.1 ligger bare i minnet i `Utforsk`. Et søk kan ikke deles, og filteret nullstilles når brukeren åpner en stedsside og går tilbake (utsatt fra 3.1). FR-21 og UJ-1 steg 6 krever at en delt lenke gjenskaper nøyaktig samme filter og samme visning.

**Approach:** Filteret og visningen ligger i nettadressen, og `Utforsk` leser dem derfra. `shared/filter.ts` eier `FilterParams` og de eneste funksjonene som oversetter mellom adresse og filter (AD-12). Ruteren bærer filteret i `utforsk`-ruten, men tolker det ikke selv.

**Beslutninger (Claude, 2026-10-23; ingen av dem endrer et krav):**
- **Parametre:** `nysno`, `vind` og `temp`, for eksempel `/?visning=liste&nysno=5&vind=10&temp=-2`. Et krav som står på «Alle», skrives ikke. Rekkefølgen er alltid `visning`, `nysno`, `vind`, `temp` og `sortering`, så samme filter gir samme adresse.
- **Ugyldige verdier:** En verdi som ikke er et heltall innenfor spennet, eller som ikke ligger på et steg, gjør kravet til «Alle». Siden krasjer aldri, og andre gyldige krav beholdes.
- **Historikk:** En endring i filteret erstatter adressen (`replaceState`) og lager ikke et nytt steg. Tilbake-knappen går da til forrige side, ikke til forrige slider-verdi. Bytte mellom kart og liste og åpning av et sted lager nye steg, som i dag.
- **Kart/liste-veksleren beholder filteret og sorteringen.** «SnowFinder» i toppen går til et kart uten filter, som en hjem-knapp.
- **Sortering:** `sortering=navn` lagres i adressen. `score` er standard og skrives ikke. `avstand` lagres ikke, fordi en delt lenke da ville bedt mottakeren om posisjon uten at hen har valgt det.

## Boundaries & Constraints

**Always:**
- `parse` og `serialize` for filteret finnes bare i `shared/filter.ts`. For alle gyldige `FilterParams` gir `parse(serialize(p))` det samme `p`.
- Mangler `visning`, brukes `kart` (som i dag).
- Tilbake fra en stedsside viser samme filter, visning og sortering som før.
- Filteret i adressen styrer panelet, kart og liste. Det finnes ingen kopi i `useState` som kan gli fra adressen.
- Lenker til Utforsk fra andre sider (toppnavigasjon, «Gå til kartet», stedssidens tilbake-lenke når siden er åpnet direkte) går til kart uten filter, som i dag.

**Never:** Ingen ny avhengighet, ingen `localStorage`. Ingen endring i filterreglene eller fasittabellens tilfeller. Ingen treff-teller eller forslag ved null treff (Story 3.3). `avstand` havner aldri i adressen, og posisjonen sendes aldri noe sted.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Delt lenke, liste | `/?visning=liste&nysno=2&temp=0` i ny økt | Listen, nysnø «minst 2 cm», temperatur «høyst 0 °C», vind «Alle», seks steder | N/A |
| Uten visning | `/?nysno=2&temp=0` | Kartet med samme filter og seks markører | N/A |
| Ugyldig verdi | `/?nysno=abc&vind=99&temp=0` | Nysnø og vind «Alle», temperatur «høyst 0 °C» | Ingen feil, ingen krasj |
| Standardverdi | Sett nysnø til 0 | `nysno` forsvinner fra adressen | N/A |
| Slider endres | Vind fra «Alle» til 10 | Adressen får `vind=10`, og historikken får ikke et nytt steg | N/A |
| Kart → liste | Filter satt, trykk «Liste» | Listen med samme filter, og `visning=liste` er lagt til | N/A |
| Sted og tilbake | Filter satt, åpne et sted, trykk Tilbake | Samme filter, visning og treff | N/A |
| Sortering | Liste sortert etter navn, kopier adressen | Adressen har `sortering=navn`, og lenken åpner listen sortert etter navn | N/A |
| Avstand | Velg «Avstand» | `sortering` står ikke i adressen | N/A |

</frozen-after-approval>

## Code Map

- `shared/filter.ts` -- `FilterParams`, `FILTER_GRENSER` (heltall, steg 1), `STANDARD_FILTER`. Legg til `parseFilter(search: URLSearchParams): FilterParams` og `serializeFilter(params): [navn, verdi][]` (eller tilsvarende) med parameternavnene over. Ingen DOM. Fasittabellen og `filtrerSteder` endres ikke.
- `src/lib/router.ts` -- `Route` `utforsk` får `filter: FilterParams` og `sortering: 'score' | 'navn'`. `parseRoute` bruker `parseFilter`. `href` bygger spørringen i fast rekkefølge med `serializeFilter`. `navigate` sammenligner allerede `pathname + search`. Legg til `replace(route)` som bruker `history.replaceState` (behold markeringen `IN_APP_STATE` fra forrige steg) og sender samme interne hendelse som `navigate`.
- Alle steder som lager `{ name: 'utforsk', visning }` (`Toppnavigasjon.tsx`, `VisningVeksler.tsx`, `IkkeFunnet.tsx`, `Sted.tsx:71`, testene) -- legg til standardfilter og standardsortering, eller lag en hjelper (for eksempel `utforsk(visning)`) så de slipper å gjenta det. `VisningVeksler` får gjeldende filter og sortering, så byttet beholder dem.
- `src/pages/Utforsk.tsx` -- `useState` for filteret fjernes. Filteret kommer fra ruten, og `onEndre` kaller `replace` med ny rute. `App.tsx:31` sender ruten (eller filter og sortering) inn.
- `src/components/ListeVisning.tsx` -- `sortering` kommer fra ruten for `score` og `navn`. `avstand` ligger fortsatt i komponentens tilstand, sammen med posisjonen, og adressen viser da ikke `sortering`. Når brukeren går fra avstand til et annet valg, oppdateres adressen.
- `src/components/Toppnavigasjon.tsx` -- menyens nøkkel bruker `href(route)`, så hver slider-endring ville lukket ☰-menyen. Bruk nøkkel uten spørringen for `utforsk` (rutenavn og visning), så filterendringer ikke lukker menyen.
- `src/lib/router.test.ts`, `shared/filter.test.ts` -- rundtur og ugyldige verdier.
- `tests/e2e/filter.spec.ts` -- E2E for matrisen. `deferred-work.md` (oppføringen fra 3.1) krever testen kart → sted → Tilbake med filteret i behold.
- `README.md` -- linjen «Filteret lagres ennå ikke i nettadressen» oppdateres.

## Tasks & Acceptance

**Execution:**
- [x] `shared/filter.ts` og `shared/filter.test.ts` -- `parseFilter`, `serializeFilter`, rundtur for alle steg i alle tre spenn, og ugyldige verdier (tekst, desimal, utenfor spennet, tom, flere like parametre).
- [x] `src/lib/router.ts` og `router.test.ts` -- filter og sortering i `utforsk`-ruten, fast rekkefølge i `href`, `replace`, og tester for parse, href og rundtur.
- [x] Alle steder som lager en `utforsk`-rute -- standardfilter og standardsortering, og veksleren beholder dem.
- [x] `src/pages/Utforsk.tsx`, `src/App.tsx` -- filteret fra ruten, endringer via `replace`.
- [x] `src/components/ListeVisning.tsx` -- sorteringen fra ruten, unntatt `avstand`.
- [x] `src/components/Toppnavigasjon.tsx` -- menyens nøkkel tåler filterendringer.
- [x] `tests/e2e/filter.spec.ts` -- hver rad i matrisen. Tell historikken med `history.length` før og etter en slider-endring.
- [x] `README.md` -- beskriv at filter, visning og sortering ligger i adressen og kan deles.

**Acceptance Criteria:**
- Given rettingen, when lint, typecheck, test, build og `npm run test:e2e` kjøres, then er alle grønne, og `gh pr checks` er grønn før merge.

## Implementation Notes

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: alle grønne
- `npm run test:e2e` -- expected: alle grønne

## Review Triage Log

Tre lag: Blind Hunter (10 funn), Edge Case Hunter (4 funn) og Verification Gap (1 hull og 2 andre funn).

| # | Lag | Funn | Vurdering | Rute | Begrunnelse |
|---|-----|------|-----------|------|-------------|
| 1 | Alle tre | ☰-menyens nye nøkkel (`utforsk ${visning}`) lar menyen stå åpen når brukeren trykker «SnowFinder» fra et filtrert kart, eller går Tilbake/Fram mellom to filtrerte kart. Ingen test dekker det | medium | patch | Tilbake til nøkkelen med hele adressen. En slider-endring lukker da menyen, som er vanlig når man gjør noe annet på siden. Ny E2E ved 375 px: `/?nysno=2`, åpne ☰, «SnowFinder» → menyen lukket. Testhullet i VG forsvinner med endringen. |
| 2 | Blind | En lenke med ugyldige eller standardverdier beholder dem i adressen til brukeren flytter en slider | medium | patch | `Utforsk` skriver adressen om til ren form én gang når den avviker. Ny E2E: `/?nysno=abc&vind=99&temp=0` blir `/?temp=0`. |
| 3 | Blind | «Avstand» skriver `score` til adressen før posisjonen er kjent, så «Navn» går tapt ved avslag | low | patch | `score` skrives først når posisjonen er gitt. |
| 4 | Edge | Gjentatt `sortering` bruker første verdi, mens et gjentatt filterkrav gir standard | low | patch | Gjentatt `sortering` gir nå `score`, med en test. |
| 5 | Blind | `FILTER_PARAMETRE` er eksportert, men brukes bare i modulen | low | patch | Gjort privat. |
| 6 | Blind | Adressekontrakten står ikke i arkitekturen | medium | patch | AD-12 beskriver nå parametrene, rekkefølgen, standardverdier, ugyldige verdier, historikken og regelen for avstand, i begge kopiene. AD-8 sier ikke lenger at `visning` er det eneste som leses. |
| 7 | Blind | To punkter i `deferred-work.md` er løst, men ikke merket | low | patch | Merket som løst (sortering fra 1.8 og filter etter stedssiden fra 3.1). |
| 8 | Blind | UJ-1 steg 6 («URL har filter + sted») er ikke dekket for stedssidens adresse | medium | defer | Stedsadressen bærer ikke filteret. Tilbake fra et sted som er åpnet i appen, virker. Ført i `deferred-work.md` til vurdering i `bmad-correct-course`. |
| 9 | Blind | KI-logg mangler | false | avvist | Skrives ved leveringen. |
| 10 | Blind | Ingen URL-test ved 375 px | low | avvist | Med nøkkelen fra funn 1 er det ingen mobilspesifikk adresselogikk igjen. Ny E2E ved 375 px dekker menyen. |
| 11 | Blind | `settFilter` bygger på ruten fra forrige rendering, så to endringer i samme tikk kan miste den første | low | avvist | Hver kontroll endrer én ting om gangen. Hurtigvalg i 3.4 vil sette alle verdiene i ett kall. |
| 12 | Blind | `replace()` har ingen enhetstest | low | avvist | Prosjektet har ikke DOM-testing. E2E dekker historikk-lengden og Tilbake fra stedssiden, som avhenger av at tilstanden beholdes. |
| 13 | Edge | En `#hash` forsvinner ved første slider-endring | low | avvist | Appen bruker ikke hasher. |
| 14 | Edge | `parse(serialize(p))` gir `null` for en verdi i ytterpunktet (for eksempel vind 25) | false | avvist | `null` og ytterpunktet betyr det samme («Alle»), og filteret behandler dem likt. Rundturen gjelder normalisert form. |
| 15 | VG (annet) | «Avstand» kan bli stående når brukeren går Tilbake/Fram til en annen liste | maybe-false | avvist | Ville bare vært `low`: sorteringen er riktig når siden lastes, og adressen viser ikke avstand. |

Sjekker lokalt etter gjennomgangen: lint, typecheck, test (419), build og `npm run test:e2e` (47) er grønne.
