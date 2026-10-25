---
title: 'Story 3.6: Filtrer på avstand'
type: 'feature'
created: '2026-10-25'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '49d530c2ecd834adcf19e741e9d59dd86e37fdc0'
context:
  - '{project-root}/project-workspace/implementation-artifacts/epic-3-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Filteret dekker bare vær (nysnø, vind, temperatur, skydekke). Brukeren kan ikke avgrense til steder som faktisk er i nærheten av seg selv (FR-23).

**Approach:** Et femte krav, **maks avstand** i km fra brukerens egen posisjon, kombinert med OG som de andre. `avstandKm`/`Posisjon` flyttes til `shared/` (AD-6: delt logikk skal kunne importeres av datapipelinen uten `src/`; `src/lib/sortering.ts` importerer dem derfra i stedet, uendret oppførsel). Posisjonen spørres bare ved et eksplisitt trykk på slideren (aldri automatisk ved lasting eller fra en lenke), ligger bare i komponenttilstand, og sendes og lagres aldri (NFR-Privacy).

**Spenn (Kelly, 2026-10-25):** 0–200 km, steg 10, «Alle» ved 200. FR-23 sier «steder som faktisk er i nærheten» — et dagsturs-/nærmiljø-scenario. Et spenn på 500 km ville sjelden filtrert ut noe, siden de fleste stedene i katalogen ligger innenfor det av hverandre; 200 km gjør at slideren faktisk endrer treffene.

## Boundaries & Constraints

**Always:**
- Posisjon spørres først når brukeren selv flytter avstandsslideren bort fra «Alle» og posisjon ikke allerede er kjent. Aldri automatisk ved lasting, ved en adresse med `avstand` satt, eller ved navigasjon.
- Uten kjent posisjon (ikke spurt, avslått, eller utilgjengelig) har kravet ingen effekt — det skjuler ikke stedene, i motsetning til et sted som mangler en verdi.
- `maksAvstandKm` (selve grensen, ikke posisjonen) er et vanlig filterparameter: den ligger i adressen som de andre kravene (AD-12), så en delt lenke bærer valgt grense videre.
- Et nettverkstest-funn skal vise at ingen utgående forespørsel inneholder posisjonens lat/lon (NFR-Privacy, FR-23).

**Never:** Ingen ny avhengighet. Ikke endre `avstandKm` eller sorteringen i `sortering.ts`. Ingen avstand vist på kartet. `ListeVisning.tsx`s egen posisjon for sortering røres ikke — avstandsfilteret har sin egen, uavhengige posisjonstilstand (en nettleser som allerede har gitt tillatelse, svarer på den andre forespørselen uten å spørre igjen).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Trykk | «Alle», dra slideren til en verdi, posisjon ikke spurt før | Nettleseren spør om posisjon; innvilget gir treff innenfor avstanden på kart og liste | N/A |
| Avslag | Samme som over, posisjon avslått | Kravet har ingen effekt; en tekst forklarer at posisjonen ikke ble delt | Ingen feil, ingen tom visning utover det andre krav gir |
| Lenke | Adressen har `avstand=X` | Slideren vises på X, men posisjon spørres ikke automatisk — bare ved at brukeren selv rører slideren | N/A |
| Null treff | Avstand aktivt, kjent posisjon, null treff | Forslaget (3.3) kan lempe avstanden som de andre kravene | N/A |
| Nettverk | Avstand aktivt, kjent posisjon | Ingen utgående forespørsel inneholder lat/lon | N/A |

</frozen-after-approval>

## Code Map

- `shared/filter.ts` -- `FilterParams` får `maksAvstandKm: number | null`; `FILTER_GRENSER.maksAvstandKm = { min: 0, max: 200, steg: 10, standard: 200 }`, lagt til i `FILTER_KRAV` og `FILTER_PARAMETRE` (param `avstand`). `Filtrerbar` (linje 71) må også ha `lat`/`lon` fra `Sted`. `FELT`-oppslaget dekker ikke avstand (den avhenger av brukerens posisjon, ikke et feltnavn på stedet): gi `oppfyller` og `filtrerSteder` et nytt, valgfritt `posisjon?: Posisjon`-parameter. I `oppfyller`, når `krav === 'maksAvstandKm'`: uten posisjon, returner `true` (ingen effekt); med posisjon, bruk `avstandKm(posisjon, sted)` mot grensen. `forslagVedNullTreff` får samme valgfrie parameter og sender det videre til sine egne `filtrerSteder`-kall.
- `shared/avstand.ts` (ny) -- `avstandKm` og `Posisjon`, flyttet fra `src/lib/sortering.ts` (AD-6: ingen avhengighet fra `shared/` til `src/`). Rene funksjoner, ingen oppførselsendring.
- `src/lib/sortering.ts` -- importerer `avstandKm`/`Posisjon` fra `../../shared/avstand` i stedet for å definere dem selv; re-eksporterer dem videre slik at `ListeVisning.tsx`s eksisterende import ikke må endres.
- `src/pages/Utforsk.tsx` -- egen, lokal tilstand for avstandsfilterets posisjon og statustekst, etter samme mønster som `ListeVisning.tsx` (men en egen instans, ikke delt med listens sortering). Sender `posisjon`, status og en `beOmPosisjon`-funksjon ned til `FilterPanel`, og `posisjon` inn i `filtrerSteder`-kallet.
- `src/components/FilterPanel.tsx` -- femte slider for `maksAvstandKm` via `KRAV_TEKST`/`FILTER_KRAV`-mønsteret. Når brukeren endrer slideren bort fra «Alle» og posisjon ikke er kjent, kaller den `beOmPosisjon`. Statusteksten vises med samme `HINT`-mønster som skydekkets hjelpetekst.
- `tests/golden/filter.json`, `shared/filter.test.ts` -- `steder` får `lat`/`lon`, en fast `brukerposisjon` i fasiten, og nye `tilfeller` for avstand alene og kombinert med et annet krav. Alle `filter`-objekter får `maksAvstandKm: null`.
- `src/components/FilterPanel.test.tsx` -- tekst og `aria-valuetext` for det nye kravet.
- `tests/e2e/filter.spec.ts` -- matrisen: innvilget posisjon smaler inn treffene, avslag gir ingen effekt og statustekst, en lenke med `avstand` satt spør ikke automatisk, og en test som fanger alle forespørsler og sjekker at ingen inneholder lat/lon.
- `README.md` -- det nye kravet, spennet, og at posisjonen aldri lagres eller sendes.

## Tasks & Acceptance

**Execution:**
- [x] `shared/filter.ts`, `shared/filter.test.ts`, `tests/golden/filter.json` -- `maksAvstandKm`, `lat`/`lon` på `Filtrerbar`, posisjon gjennom `oppfyller`/`filtrerSteder`/`forslagVedNullTreff`.
- [x] `src/pages/Utforsk.tsx` -- egen posisjonstilstand og kobling til filteret.
- [x] `src/components/FilterPanel.tsx`, `FilterPanel.test.tsx` -- femte slider, statustekst, trigger for posisjonsforespørsel.
- [x] `tests/e2e/filter.spec.ts` -- matrisen ved 1280 og 375 px, inkludert nettverkstesten.
- [x] `README.md` -- kravet og spennet.

**Acceptance Criteria:**
- Given filterpanelet, when jeg drar avstandsslideren og gir posisjon, then smales treffene inn til steder innenfor avstanden, på både kart og liste.
- Given avstandsslideren er aktiv, when posisjon er avslått eller ukjent, then har kravet ingen effekt, og en tekst forklarer hvorfor.
- Given en adresse med `avstand` satt, when siden lastes, then spørres det ikke automatisk om posisjon.
- Given lint, typecheck, test, build og `npm run test:e2e`, when de kjøres, then er alle grønne.

## Implementation Notes

- `shared/filter.ts` importerer `avstandKm`/`Posisjon` fra `../src/lib/sortering` (begge mapper ligger i samme TS-prosjekt via `tsconfig.app.json`s `include: ["src", "shared"]`, så dette er trygt for typecheck/build/Vitest). `sortering.ts` er uendret.
- Avstanden sammenlignes **uavrundet** mot grensen (`avstandKm(posisjon, sted) <= grense`), ulikt de andre kravene som avrundes til én desimal før sammenligning: avstanden vises aldri noe sted, så det finnes ingen visning å være konsistent med.
- `FilterPanel` fikk tre nye, påkrevde prop: `posisjonKjent`, `posisjonStatus` og `beOmPosisjon`. Statusteksten for avstand gjenbruker samme `hint`/`aria-describedby`-mekanisme som skydekkets statiske hjelpetekst, men verdien kommer nå inn som prop i stedet for et fast oppslag, slik at den kan være tom, «Henter posisjonen din …» eller avslagsteksten.
- `Utforsk.tsx` har sin egen, lokale posisjonstilstand (`avstandPosisjon`/`avstandStatus`) etter samme `navigator.geolocation`-mønster som `ListeVisning.tsx`, men en helt egen instans — ingen tilstand er delt mellom de to. Posisjonen spørres bare fra `FilterPanel`s `onEndre`-wrapper når brukeren selv flytter avstandsslideren bort fra «Alle» og posisjonen ikke er kjent; ingen `useEffect` ser på `filter.maksAvstandKm`, så en lenke med `?avstand=` satt aldri trigger en automatisk forespørsel.
- Fasiten (`tests/golden/filter.json`) fikk en fast `brukerposisjon: { lat: 60, lon: 10 }` og `lat`/`lon` på alle åtte steder, valgt langs samme lengdegrad som brukerposisjonen slik at avstandene er enkle å verifisere for hånd (ren meridian-avstand). To nye vanlige tilfeller (avstand alene, avstand kombinert med vindkravet) og ett nytt null-treff-tilfelle (avstand lempes til 30 km) ble lagt til. Testhåndteringen i `shared/filter.test.ts` sender `golden.brukerposisjon` til **alle** golden-kall; det endrer ikke noe eksisterende tilfelle siden `maksAvstandKm` er `null` i dem, og dermed aldri aktivt.
- Et eget `describe('maksAvstandKm without a known position', ...)`-block i `shared/filter.test.ts` dekker edge-case-matrisens «uten kjent posisjon har kravet ingen effekt»-rad direkte på enhetsnivå, i tillegg til E2E-testen for avslag.
- `tests/e2e/filter.spec.ts` fikk to nye describe-blokker («the distance filter at 1280px/375px») som dekker hele I/O- og edge-case-matrisen: trykk+innvilget (smaler inn kart og liste), avslag (ingen effekt + statustekst), lenke med `avstand` satt (ingen automatisk forespørsel), null treff med kjent posisjon (forslag om å lempe avstanden), og en egen nettverkstest som fanger alle utgående forespørsler og sjekker at ingen inneholder brukerens lat/lon. Posisjonen for "null treff"-testen er et punkt langt til havs vest for Norge, slik at ingen demosted er innenfor den videste aktive grensen (190 km).
- `src/App.test.tsx` og `src/lib/router.test.ts` (utenfor spec-ens Code Map) måtte også få `maksAvstandKm: null` lagt til i sine håndskrevne `FilterParams`-literaler, siden feltet nå er obligatorisk. `router.test.ts` fikk også én ny test for at `avstand` ligger sist av kravene i adressen (etter `sky`, før `sortering`) og at verken `lat`, `lon` eller `posisjon` noensinne forekommer i adressen.

**Verifisert:** `npm run lint && npm run typecheck && npm test && npm run build` er grønne (516/516 enhetstester), og `npm run test:e2e` er grønn (85/85, inkludert alle 56 i `filter.spec.ts`).

**Ingenting utsatt eller usikkert** utover det som allerede sto i spec-ens Boundaries & Constraints.

## Spec Change Log

- **Utløst av:** review-funnet om at `shared/filter.ts` importerte `avstandKm`/`Posisjon` fra `src/lib/sortering.ts`, i strid med AD-6 (ingen avhengighet fra `shared/` til `src/`; bekreftet at `tsconfig.scripts.json` ikke har `src` i sin `include`, så pipelinen ville feile om den senere importerte `shared/filter.ts`). **Endret:** Approach og Code Map, til å flytte `avstandKm`/`Posisjon` til en ny `shared/avstand.ts`, med `src/lib/sortering.ts` importerende (og re-eksporterende) derfra. **Kjent-dårlig tilstand unngått:** `shared/` ville forblitt avhengig av `src/`, et brudd på en bindende arkitekturbeslutning uten noen reell motstridende begrunnelse. **KEEP:** alt annet i spec-en — spennet (0–200 km, steg 10), at posisjonen bare spørres ved et eksplisitt sliderdrag, at `ListeVisning.tsx` ikke røres, og at avstanden sammenlignes uavrundet — er uendret og fungerte bra. Godkjent av Kelly, 2026-10-25.

## Review Triage Log

Tre lag: Blind Hunter (10 funn), Edge Case Hunter (2 funn) og Verification Gap (1 funn).

- **medium → patch** (alle tre lag, samme rotårsak) — `beOmAvstandPosisjon` spør om posisjon på *hver* endring av slideren mens posisjonen er ukjent (verifisert live: 6 trykk ga 6 separate `getCurrentPosition`-kall), ikke bare «først» som frosset tekst krever. Samme rotårsak gjør at `avstandStatus` aldri tømmes når `maksAvstandKm` går tilbake til `null` (direkte, «Nullstill» eller en hurtigvalg-chip), så en avslagstekst blir stående under en slider som ikke lenger har noe aktivt krav. Retting: en effekt i `Utforsk.tsx` som tømmer `avstandStatus` når `filter.maksAvstandKm` er `null`, og en utvidet vakt i `beOmAvstandPosisjon` (`if (avstandPosisjon || avstandStatus === AVSTAND_POSISJON_HENTES) return`).
- **medium → patch** (Blind Hunter) — statusteksten under avstandsslideren er en vanlig `<p>` uten `aria-live`/`role="status"`, så en skjermleser som står på slideren ikke nødvendigvis hører at forespørselen ble avslått. Skydekkets statiske hjelpetekst har samme mangel, men endrer seg aldri; denne gjør det. Retting: `role="status"` på avstandens hint-tekst.
- **medium → intent_gap** (Blind Hunter) — `shared/filter.ts` importerer nå `avstandKm`/`Posisjon` fra `../src/lib/sortering`, og det er eneste sted noe i `shared/` når inn i `src/`. AD-6 i arkitekturen binder nettopp `shared/**`, `src/lib/**` og `scripts/pipeline/**`, og sier delt logikk i `shared/` skal kunne importeres av datapipelinen uten `src/`. Bekreftet konkret: `tsconfig.scripts.json` (pipelinens prosjekt) har ikke `src` i `include`, så en fremtidig import av `shared/filter.ts` fra `scripts/pipeline/**` ville feile typecheck. Rotårsaken er en linje i spec-ens frosne Approach («Gjenbruker avstandKm/Posisjon fra src/lib/sortering.ts uendret»), satt av Claude under planleggingen, ikke en forretningsbeslutning Kelly tok — men den står likevel i det frosne avsnittet, så den kan ikke rettes uten at mennesket godkjenner det. Se spørsmål til Kelly nedenfor.
- **false** (Blind Hunter) — `sprint-status.yaml` viser `in-progress` mens spec-en viser `in-review`. Som i story 3.4: step-05 (Present) setter sprint-status til `review` før noe committes, så denne mellomtilstanden rekker aldri å bli en del av det som skipes.
- **low → avvist** (Blind Hunter) — tidsavbrudd og eksplisitt avslag gir samme tekst, og tidsavbrudd er utestet. Samme, allerede godtatte mønster finnes i `ListeVisning.tsx`s `posisjonAvslatt` (brukes for alle feilutfall der òg). Ikke et nytt problem denne storyen innfører; fiksen (simulere tidsavbrudd i en test) er mer enn en direkte retting.
- **low → avvist, utenfor omfang** (Blind Hunter) — to uavhengige konstanter for 10-sekunders tidsavbrudd (`AVSTAND_POSISJON_TIMEOUT_MS` og `POSISJON_TIMEOUT_MS`). En felles konstant ville krevd å endre `ListeVisning.tsx`, som det frosne Never-avsnittet eksplisitt sier skal stå urørt («`ListeVisning.tsx`s egen posisjon for sortering røres ikke»). Intenten utelukker selv denne fiksen.
- **low → avvist** (Edge Case Hunter, Verification Gap) — ingen opprydding av det ventende `getCurrentPosition`-kallet ved avmontering (navigasjon bort mens svaret ventes). I React 18 er `setState` etter avmontering en stille no-op, ikke en synlig feil. Usannsynlig å møtes i vanlig bruk, og fiksen (en mounted-vakt) er mer enn en direkte retting.

**Avventer:** det `intent_gap`-klassifiserte funnet (lagdeling) er lagt fram for Kelly før noe rettes eller rulles tilbake.

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: alle grønne
- `npm run test:e2e` -- expected: alle grønne
