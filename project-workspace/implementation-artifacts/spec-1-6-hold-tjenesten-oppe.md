---
title: 'Story 1.6: Hold tjenesten oppe når en datakilde er nede'
type: 'feature'
created: '2026-10-29'
status: 'done'
baseline_commit: '217318111da636e61125b275d4e3ca7e1992b5b7'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Dataprogrammet gjør ett forsøk per sted og kilde, så et kortvarig brudd hos MET eller NVE gir unødvendige hull, eller ingen publisering i det hele tatt. Appen sier heller ikke fra når hele datafila er gammel, for eksempel fordi kjøringene har stoppet (FR-6b, NFR-3, UX-DR10).

**Approach:** `fetch.ts` prøver et feilende kall på nytt et fast antall ganger med økende ventetid, uten tilstand mellom kjøringer. Appen viser `banner-stale-data` øverst på Utforsk og stedssiden når datafila er mer enn 90 minutter gammel, uten å blokkere resten av siden.

## Boundaries & Constraints

**Always:** Hvert nytt forsøk går gjennom kildens `startGate`, så taket på ett kall per 100 ms per kilde holder. Alder regnes via `now()` i `src/lib/clock.ts` og en grense i `shared/freshness.ts`. Banneret oppdateres av den eksisterende sjekken hvert minutt i live. Siste gyldige fil og 95 %-terskelen (Story 1.5) er uendret.

**Never:** Kretsbryter, tilstand mellom kjøringer, varsling, nye avhengigheter, endringer i datafilens skjema. Banneret vises ikke på forklaringssiden og kan ikke lukkes.

**Beslutning (2026-10-29): bannerets farger.** DESIGN.md sin `warning`-bakgrunn med `ink-primary`-tekst gir kontrast 2,92:1, under WCAG AA. Banneret får derfor lys bakgrunn (`surface-raised`), en tykk kant til venstre i `warning` og tekst i `ink-primary` (16,6:1). DESIGN.md (begge kopier) rettes senere via `bmad-ux`, og det føres et punkt om det i `deferred-work.md`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Kortvarig feil | MET gir 503, deretter 200 | Svaret brukes, ingen avvisning | – |
| Kilde nede | Hvert forsøk gir nettverksfeil, 5xx eller 429 | 3 forsøk, ventetid 1 s og så 2 s, gjennom porten | Årsak med «(etter 3 forsøk)» i rapporten |
| Fast feil | HTTP 400 (NVE «No cell») eller 404 | Ett forsøk | Årsak som i dag |
| Tidsavbrudd | Ingen svar på 20 s | Ett forsøk | «Tidsavbrudd etter 20 s» |
| MET nede i hele kjøringen | Alle MET-kall feiler | Ingen publisering, forrige fil står byte-lik | Rapport i loggen, exit 1 |
| Fersk fil | `generert` er 90 min eller mindre før nå | Ikke noe banner | – |
| Gammel fil | `generert` er mer enn 90 min før nå | Banner: «Viser siste kjente data fra kl. HH:MM» | – |
| Fanen står åpen | Live-fil som passerer 90 min | Banneret dukker opp ved neste sjekk, uten at kartet bygges på nytt | – |

</frozen-after-approval>

## Code Map

- `scripts/pipeline/fetch.ts` -- `getOnce` (linje 99) gjør ett forsøk. `fetchAll` kaller `metGate()`/`nveGate()` én gang før `getOnce`. Toppkommentaren sier «retries are Story 1.6». `describeError` gjenkjenner `TimeoutError`.
- `scripts/build-catalog/http.ts` -- `getJson` har samme regel for nye forsøk (nettverksfeil, 429, 5xx; `base * 2 ** (n-1)`). Den følges, men importeres ikke: modulene har hver sin User-Agent og ulike feiltyper.
- `scripts/pipeline/fetch.test.ts` -- testen på linje 75 («one attempt each») må skrives om. Tidsavbrudd testes på linje 114.
- `scripts/pipeline/run.test.ts` -- live-tester med forrige fil byte-lik ved 75 %. Mønsteret gjenbrukes for «MET helt nede».
- `shared/freshness.ts` -- `UTDATERT_ETTER_MS`, `dataAlderMs`. Den nye grensen legges her.
- `src/hooks/useSteder.ts` -- `medFerskhet` lager `utdatert`/`fjernet`. `oppdaterFerskhet` returnerer `previous` når ingenting har endret seg, så et nytt felt må også sammenlignes der.
- `src/App.tsx` -- `AppView` viser `DemoBanner` over `<main>`. Det nye banneret vises der for rutene `utforsk` og `sted`.
- `src/components/DemoBanner.tsx`, `src/App.css` (`.banner-demo`) -- mønster for komponent og stil.
- `src/lib/format.ts` -- `norskTid` gir dato + «kl.». Banneret trenger bare `HH:MM`, eller dato når fila er fra en annen dag.
- `public/data/demo.json` -- `generert` = `referenceTime`, så demoen viser aldri banneret. E2E endrer `generert` i en kopi, slik `tests/e2e/sted.spec.ts:122` gjør.

## Tasks & Acceptance

**Execution:**
- [x] `scripts/pipeline/fetch.ts` -- legg til `getWithRetries`: inntil `DEFAULT_ATTEMPTS = 3`, ventetid `DEFAULT_RETRY_BASE_MS * 2 ** (n-1)` (1000 ms), `gate()` før hvert forsøk, og nytt forsøk bare ved nettverksfeil, 429 og 5xx. `FetchOptions` får `attempts`, `retryBaseMs` og `sleep`. Oppdater toppkommentaren.
- [x] `scripts/pipeline/fetch.test.ts` -- test hver rad i matrisen som gjelder henting, med falsk `fetchFn` og `sleep` som registrerer ventetidene. Test også at forsøkene holder seg innenfor kallraten.
- [x] `scripts/pipeline/run.test.ts` -- test at en live-kjøring med MET nede (hvert forsøk 503) ikke publiserer, og at forrige fil står byte-lik.
- [x] `shared/freshness.ts` (+ test) -- `GAMLE_DATA_ETTER_MS = 90 min` og `erGamleData(generert, now)`, streng `>`.
- [x] `src/hooks/useSteder.ts` (+ test) -- `gamleData: boolean` i ok-resultatet. Ta det med i sammenligningen i `oppdaterFerskhet`, uten å bytte ut `data`.
- [x] `src/components/GamleDataBanner.tsx` + `src/App.css` -- `role="status"`, teksten «Viser siste kjente data fra kl. HH:MM», og fargene fra beslutningen (lys bakgrunn, kant i `warning`).
- [x] `src/App.tsx` (+ `App.test.tsx`) -- vis banneret over `<main>` på `utforsk` og `sted` når `gamleData`.
- [x] `tests/e2e/sted.spec.ts` eller ny `tests/e2e/gamle-data.spec.ts` -- en datafil med `generert` 2 t før gir banner på Utforsk og stedssiden, ikke på forklaringssiden, og ingen axe-brudd.
- [x] `README.md`, `shared/contracts/data-dictionary.md` -- nye forsøk og banneret i én setning hver. Før en oppføring i `deferred-work.md` om at AD-2 (linje 110, «one attempt») og DESIGN.md skal oppdateres via `bmad-architecture`/`bmad-ux`.

**Acceptance Criteria:**
- Given at MET eller NVE simuleres utilgjengelig i test, when dataprogrammet kjører, then prøves et feilende kall på nytt et fast antall ganger med økende ventetid.
- Given at MET er nede i hele kjøringen, when den er ferdig, then viser appen fortsatt siste gyldige fil, aldri en tom eller delvis.
- Given en datafil der `generert` er mer enn 90 min gammel, when Utforsk eller stedssiden åpnes, then står banneret øverst, og kart, liste og filter virker som før.

## Implementation Notes

- `fetch.ts`: `getWithRetries` kaller `gate()` før hvert forsøk. `getOnce` returnerer `retryable` (nettverksfeil, 429, 5xx). Årsaken får « (etter N forsøk)» når mer enn ett forsøk ble gjort. `run.ts` sender `retryBaseMs` videre, slik at run-testene kan slå av ventetiden.
- `useSteder.ts`: `gamleData` i ok-resultatet. `oppdaterFerskhet` beholder `data` når bare «Utdatert» eller banneret endrer seg.
- `format.ts`: `gamleDataTekst` legger til dato når fila er fra en annen dag i norsk tid.
- `App.tsx`: banneret ligger over demobanneret, bare på `utforsk` og `sted`.
- `epic-1-context.md` ble laget på nytt i steg 1 og rettet etter gjennomgangen (bannerdesign, ingen årsak, status, og bindende krav som hadde falt ut).
- Verifisert før gjennomgangen: lint, typecheck, test (625), build og `npm run test:e2e` (124, med 3 nye) er grønne lokalt på Windows.

## Spec Change Log

## Review Triage Log

Gjennomgang med Blind Hunter (14 funn), Edge Case Hunter (7) og Verification Gap (1). Ingen funn ga intent_gap eller bad_spec.

| # | Lag | Funn | Vurdering | Rute | Begrunnelse |
|---|-----|------|-----------|------|-------------|
| 1 | VG | HTTP 500 er aldri testet som noe som skal prøves på nytt | low | patch | Testene bruker bare 502, 503 og 429, så `> 500` ville passert. En 500-rad er lagt til. |
| 2 | ECH | `attempts` lik NaN gir en uendelig løkke | false | avvist | Ingen kaller sender `attempts`. `run.ts` sender den ikke, og standardverdien er 3. |
| 3 | ECH | Trege 5xx-svar like under 20 s gir likevel en kjøring på rundt en time | maybe-false | defer | Det samme som #15. Avgjøres med `varighetMs` fra ekte kjøringer i 1.11. Står i `deferred-work.md`. |
| 4 | ECH | `Retry-After` på 429 blir ignorert | low | avvist | Kallraten er 10/s, halvparten av det MET tillater, så 429 er usannsynlig. Å lese headeren gir ekstra forgreninger. Det samme som #16. |
| 5 | ECH | 501 og 505 prøves på nytt selv om de er varige feil | low | avvist | MET og NVE bruker ikke disse kodene. To ekstra kall i et slikt tilfelle skader ikke. |
| 6 | ECH | Banneret mangler dato etter midnatt på en fane som står åpen | low | avvist | Teksten oppdateres ved neste endring av ferskheten, og før 12 t er gått uansett. Å rette det krever ny tilstand i storen. |
| 7 | ECH | En `role="status"` som settes inn sammen med teksten, blir ofte ikke lest opp | medium | patch | Det stemmer, og `App.tsx` gjør det motsatte for sin egen statusmelding. Beholderen ligger nå alltid i DOM-en på Utforsk og stedssiden. |
| 8 | ECH | Banneret vises over «Fant ikke stedet» | low | avvist | Specen sier ruten `sted`, og banneret gir mening der også, for eksempel over «for gamle til å vises». |
| 9 | BH | `epic-1-context.md` beskriver bannerets farger i strid med beslutningen | low | patch | Konteksten er rettet: `surface-raised` med kant i `warning`. |
| 10 | BH | `epic-1-context.md` sier at banneret har en årsak, mens specen sier det ikke har det | low | patch | Det samme som #9, rettet i samme endring. |
| 11 | BH | Den nye `epic-1-context.md` mistet bindende krav (ytelse, testing, IA og mønstre, Leaflet-farger, byggerekkefølgen) | medium | patch | Det stemmer, og 1.11 ville lastet den som gyldig. Kravene er tatt med igjen fra forrige versjon. |
| 12 | BH | Statusen er ulik i sprint-status, spec og epic-kontekst | low | patch | Sprint-status og spec følger arbeidsflyten og synkes i steg 5. Epic-konteksten viser nå til `sprint-status.yaml`. |
| 13 | BH | KI-logg, fremdriftsplan og Review Triage Log mangler | false | avvist | De skrives ved leveringen, slik som i 1.5. Denne loggen er triage-loggen. |
| 14 | BH | 503 fulgt av tidsavbrudd gir «(etter 2 forsøk)», i strid med raden i tabellen | low | patch | Tabellraden gjelder tidsavbrudd på første forsøk, og tillegget i en blandet rekkefølge er riktig. Det var ikke testet, og en test er lagt til. |
| 15 | BH | Trege 5xx-svar bør ha et tidsbudsjett | maybe-false | defer | Samme rotårsak som #3. |
| 16 | BH | `Retry-After` blir ignorert | low | avvist | Som #4. |
| 17 | BH | Banneret blir ikke lest opp når det dukker opp underveis | medium | patch | Som #7. |
| 18 | BH | Reserveteksten i `gamleDataTekst` er ikke testet | low | patch | En direkte retting: én testlinje. |
| 19 | BH | `timedOut` gjentar sjekken for `TimeoutError` fra `describeError` | low | patch | Meldingen og valget om nytt forsøk kunne ha gått hver sin vei. Én hjelpefunksjon `isTimeout` brukes nå av begge. |
| 20 | BH | `slept.sort()` endrer lista og sorterer tall som tekst. «kl. 20:30» er hardkodet | low | patch / false | Sorteringen er rettet. Tidspunktet er fast: datoen i oktober og `Europe/Oslo` er satt, og React skriver attributtene i fast rekkefølge. |
| 21 | BH | Rekkefølgen er ikke bestemt når både demobanneret og banneret for gamle data vises | low | avvist | Det skjer bare med demodata som er gjort gamle i en test. Produksjon viser aldri demodata. |
| 22 | BH | README sier ikke hvordan man får se banneret | low | patch | Én setning: en `latest.json` som er mer enn 90 min gammel, viser det. |

Rader med samme rotårsak er gruppert: #3 og #15 (defer), #4 og #16 (avvist), #7 og #17 (én patch), og #9 og #10 (én patch).

## Design Notes

- **Alder fra `generert`, ikke fra `kildeTidspunkt`.** `generert` er når fila sist ble publisert, altså «siste kjente data». METs `updated_at` kan være opptil en time eldre enn kjøringen. Med timesjobb ville den gitt falske bannere i vanlig drift. Stedsvis «Utdatert» og fjerning beholder `kildeTidspunkt`.
- **Tidsavbrudd prøves ikke på nytt.** 300 steder × 3 × 20 s ÷ 5 parallelle kall er cirka én time, og da kolliderer kjøringen med neste timesjobb. En kilde som ikke svarer på 20 s er nede, ikke ustabil.
- **Ingen årsak i banneret** («MET svarer ikke nå»). Appen ser bare siste publiserte fil, ikke den mislykkede kjøringen.
- **Ikke med:** antall utdaterte og fjernede steder i datakvalitetspanelet (utsatt fra 2.3). Det står som utsatt videre.

## Verification

**Commands:**
- `npm run lint && npm run typecheck && npm test && npm run build` -- expected: alt grønt
- `npm run test:e2e` -- expected: grønt, også den nye bannertesten med axe
