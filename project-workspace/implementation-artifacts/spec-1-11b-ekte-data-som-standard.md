---
title: 'Story 1.11b: Ekte data som standard, demomodus når den velges'
type: 'feature'
created: '2026-10-31'
status: 'done'
baseline_commit: '574d7d7e85eba315616ab763b8eaa2c07739274f'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Appen i PR #78 leser grenen `data` selv og faller tilbake til demodata, så `npm run dev` kan vise demodata uten at noen har valgt det, og testplanen får ikke faste data. Aksel har besluttet at `npm run dev` skal vise ekte data som standard, og at demodata bare skal vises når demomodus velges (`sprint-change-proposal-2026-10-31-ekte-data-som-standard.md`, FR-30 og AD-10 v6).

**Approach:** Appen laster bare én lokal fil, valgt ved bygging: `demo.json` med `--mode demo`, ellers `latest.json`. `npm run data:hent` laster ned siste publiserte fil fra grenen `data` før `dev` og `build`.

## Boundaries & Constraints

**Always:** Normal modus leser aldri `demo.json`, og demomodus leser aldri `latest.json`. `data:hent` stopper aldri `dev` eller `build`: kommandoen avslutter med kode 0 selv når hentingen feiler. Den erstatter den lokale fila bare med en gyldig `PublishedData` med `mode: "live"` og nyere `generert`, og skriver atomisk. `npm run dev:demo` og `npm run build:demo` bruker verken nett eller `data:hent`.

**Never:** Appen leser ingen ekstern adresse. Ingen miljøvariabel styrer atferd. Ingen nye avhengigheter. Ingen endring av `tests/e2e/`, `ci.yml`, `.githooks/pre-push` (steg 3) eller `data.yml` (steg 4). Ingen retting av funnene fra PR #77.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Normal modus, fil finnes | `latest.json` gyldig | Ekte data, uten demobanner. `demo.json` hentes aldri | – |
| Normal modus, ingen fil | 404 eller `index.html` fra Vite | Melding: «Fant ingen værdata. Sjekk nettet og start på nytt, eller kjør `npm run dev:demo`.» | Aldri demodata |
| Normal modus, ødelagt fil | Ikke JSON, feil skjema eller HTTP-feil | Dagens feilmelding | `console.error` |
| Demomodus | `mode` er `demo` | `demo.json` med demobanner. `latest.json` hentes aldri, selv om den finnes | – |
| Henting, ingen lokal fil | Gyldig fil på grenen | Fila skrives | Logg |
| Henting, nyere publisert | `generert` er nyere enn lokalt | Fila erstattes | Logg |
| Henting, lik eller eldre publisert | For eksempel etter `npm run data` | Lokal fil står byte-lik | Logg |
| Henting, lokal fil ødelagt | Lokal fil kan ikke leses | Erstattes av en gyldig publisert fil | Logg |
| Henting, uten nett eller tregt svar | Avvist kall eller over 15 s | Lokal fil står byte-lik, exit 0 | Tydelig logglinje |
| Henting, ingen fil på grenen | 404 | Lokal fil står byte-lik, exit 0 | Tydelig logglinje |
| Henting, ugyldig svar | Ikke JSON, feil skjema eller `mode: "demo"` | Lokal fil står byte-lik, exit 0 | Tydelig logglinje |

</frozen-after-approval>

## Code Map

- `src/lib/data/loadPublishedData.ts` -- fjern `readDatagren`, `DATAGREN_URL`, kilden `datagren`, `DATAGREN_TIMEOUT_MS` og importene av `freshness` og `clock`. `tryFetch`, `medNyereFelt` og `PublishedData.safeParse` beholdes. Tredje parameter blir `source: DataSource = 'latest'`. Ny `dataKilde(mode: string): DataSource` og `INGEN_DATAFIL_MESSAGE`. Oppdater toppkommentaren.
- `src/lib/data/loadPublishedData.test.ts` -- fjern `describe` for grenen. Testene om fallback fra `latest` til `demo` skrives om. Mønsteret `fakeFetch` beholdes.
- `src/hooks/useSteder.ts:138-141` -- `loadPublishedData(undefined, import.meta.env.BASE_URL, dataKilde(import.meta.env.MODE))`. `LOAD_ERROR_MESSAGE` brukes i `.catch` på linje 119 og beholdes.
- `src/App.tsx` -- `result.status === 'error'` viser allerede `result.message` med `role="alert"`, så meldingen trenger ingen ny komponent.
- `scripts/pipeline/publish.ts:63-71` -- mønster for atomisk skriving. Kopier mønsteret i den nye fila hvis funksjonen ikke er eksportert; eksporter den ellers.
- `scripts/pipeline/run.ts` -- `LIVE_OUT_PATH` og mønsteret for inngang (`process.argv[1]`). Skriv ikke ny logikk her.
- `scripts/pipeline/hent-data.ts` -- ny. `hentData({ fetchFn, outPath, log })` er testbar uten nett. `HENT_URL = https://raw.githubusercontent.com/IBE160-2026/G18-bikila-dymbe-gela-james/data/latest.json`. Svaret er `text/plain`, så innholdstypen sjekkes ikke. Tidsavbrudd 15 s med `AbortSignal.timeout`.
- `package.json` -- `data:hent`, `predev` og `prebuild` (`npm run --silent data:hent`), `dev:demo` (`vite --mode demo`), `build:demo` (`tsc -b && vite build --mode demo`). npm kjører ikke `predev` for `dev:demo`.
- `shared/contracts/data-dictionary.md` -- sjekk om den omtaler rekkefølgen av filer eller reserve, og rett det.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/data/loadPublishedData.ts` -- last bare den valgte fila, og gi `INGEN_DATAFIL_MESSAGE` når den mangler -- AD-10 v6.
- [x] `src/lib/data/loadPublishedData.test.ts` -- test de fire appradene i matrisen, og `dataKilde` for `demo`, `development` og `production` -- vilkåret må ha en test.
- [x] `src/hooks/useSteder.ts` -- send kilden fra `dataKilde(import.meta.env.MODE)`.
- [x] `scripts/pipeline/hent-data.ts` -- `hentData` og inngang som alltid gir exit 0.
- [x] `scripts/pipeline/hent-data.test.ts` -- én test per henterad i matrisen, med falsk `fetchFn` og midlertidig mappe.
- [x] `package.json` -- de fem skriptene. Rør ikke låsefila.
- [x] `shared/contracts/data-dictionary.md` -- rett hvis den beskriver reserven. Den gjør ikke det, så fila er uendret.

**Acceptance Criteria:**
- Given et rent klon med nett og en fil på grenen, when `npm run dev` startes, then viser appen ekte data uten demobanner.
- Given et rent klon uten nett, when `npm run dev` startes, then starter serveren, og appen viser meldingen om manglende data.
- Given et rent klon uten nett, when `npm run dev:demo` startes, then viser appen demodata med demobanneret.
- Given at `npm run data` nettopp er kjørt, when `npm run dev` startes, then blir den ferske fila stående.

## Implementation Notes

- Meldingen vises som ren tekst i `<p role="alert">`, så `INGEN_DATAFIL_MESSAGE` har ikke backticks rundt `npm run dev:demo`. De er markdown i matrisen.
- `INGEN_DATAFIL_MESSAGE` gis også hvis `demo.json` mangler i demomodus, slik oppgaven sier. Fila er committet, så det skjer bare i et ødelagt klon.
- `writeAtomically` er eksportert fra `publish.ts` og gjenbrukt, ikke kopiert.
- Utdaterte kommentarer om reserven er rettet i `scripts/pipeline/run.ts` og `.gitignore`. `tests/e2e/kart.spec.ts:13` har samme type kommentar, men `tests/e2e/` hører til steg 3.

## Spec Change Log

## Review Triage Log

Gjennomgang med Blind Hunter (12 funn), Edge Case Hunter (7) og Verification Gap (5, inkludert andre funn). Ingen funn ga intent_gap eller bad_spec.

| # | Lag | Funn | Vurdering | Rute | Begrunnelse |
|---|-----|------|-----------|------|-------------|
| 1 | BH, ECH, VG | `hent-data` godtar ikke filer uten nyere felt, og kan overskrive en lokal fil med en eldre | medium | patch | Stemmer: appen legger på standardverdier, men hentingen gjorde det ikke. `medNyereFelt` er flyttet til `shared/`, og tester er lagt til. |
| 2 | BH, VG | Testen for feil skjema kan ikke se om skjemasjekken finnes | low | patch | En direkte retting: den lokale fila får nyere `generert`. |
| 3 | BH, ECH | Feil ved lasting av modulene gir kode ulik 0 og stopper `dev` og `build` | medium | patch | Bryter «stopper aldri». `|| exit 0` i `predev` og `prebuild`, som `prepare` allerede gjør. |
| 4 | BH | Vite tømmer skjermen, så logglinja forsvinner | medium | patch | `vite --clearScreen false` på `dev`. |
| 5 | BH | Hente fra `latest` under base-URL er ikke testet | low | patch | Én test. Det er adressen Pages bruker. |
| 6 | BH, ECH | `latest.json` med `mode: "demo"` vises i normal modus | low | avvist | Krever at noen kopierer fila for hånd. Datakilden i appen er likevel riktig, og banneret sier at det er demodata. |
| 7 | BH | Gammel publisert fil gir «Ingen ferske data» uten hint om demomodus | medium | defer | Reelt for sensor hvis timesjobben stopper. Teksten på den siden er ikke med i dette steget. Står i `deferred-work.md`. |
| 8 | BH, ECH | Lokal `generert` i framtiden stopper oppdateringer | low | avvist | Krever feil klokke eller en håndredigert fil, og `npm run data` eller sletting løser det. |
| 9 | BH, ECH | Meldingen passer dårlig i demomodus og produksjon | low | avvist | Demomodus uten `demo.json` krever et ødelagt klon, og publisering feiler uten `latest.json`, så brukere ser den aldri. |
| 10 | BH, VG | Koblingen `dataKilde` i `useSteder` og `build:demo` har ingen automatisk test | medium | defer | Dekkes i steg 3 av endringsforslaget. Bekreftet for hånd i Chromium i dette steget. |
| 11 | BH, VG | `predev`, `prebuild` og `HENT_URL` kjøres ikke av noen test | medium | defer | Krever at grenen `data` finnes. Dekkes av steg 6 på et rent klon. |
| 12 | ECH | Sjekken av inngangen kan slå feil med liten stasjonsbokstav eller symlenke, og da hentes ingenting uten logglinje | maybe-false | defer | Samme mønster som `run.ts`. Prøvd i PowerShell, som normaliserer stasjonsbokstaven, så det ble ikke avgjort. Avgjøres i steg 6 fra terminalen i VS Code. |
| 13 | BH | 404 kan ha flere årsaker, men gir én melding | low | avvist | En ny melding gir lite: repoet er offentlig, og adressen ligger i koden. |
| 14 | BH | Spec-en er unøyaktig om hvorfor E2E er rød | low | avvist | Retting av spec-en. E2E er uansett rød til steg 3. |
| 15 | BH | KI-logg og fremdriftsplan mangler i diffen | false | avvist | De skrives ved leveringen. |

## Design Notes

- **Fila hentes før start, ikke mens siden er åpen.** En åpen `npm run dev` får ikke nyere data før den startes på nytt. Den publiserte appen får nye data ved hver publisering.
- **`--mode` er ikke en miljøvariabel.** Valget gjøres på kommandolinja ved bygging, så ingen fil kan tilfeldig slå det på (AD-10).
- **E2E vil være rød til steg 3.** Playwright bygger i normal modus uten datafil. Det er forventet i utkastet og rettes i neste steg.

## Verification

**Commands:**
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run build:demo` -- expected: grønt

**Manual checks:**
- `npm run dev:demo` viser demobanneret og 24 steder. `npm run dev` uten fil på grenen viser meldingen om manglende data.
