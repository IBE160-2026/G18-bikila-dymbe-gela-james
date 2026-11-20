# SnowFinder – arkitektur, teknologi og nøkler

Oversikt over SnowFinder (IBE160, gruppe G18), skrevet for å kunne gjenskape oppsettet. Dokumentet følger
oppbygningen i faglærers eksempel [`technology.md`](technology.md).

Alt er hentet fra repoet: `package.json`, `vercel.json`, `.github/workflows/`, `.githooks/pre-push`, `README.md`,
`AGENTS.md` og arkitekturen ([`SnowFinder-Arkitektur.md`](../../../project-phase-folders/2-Planleggingsfasen/SnowFinder-Arkitektur.md),
AD-1 til AD-12). Begrunnelsene for valgene står i arkitekturen og gjentas ikke her. **Ingen hemmeligheter er lest
eller gjengitt.** Repoet har ingen `.env`-filer.

---

## 1. Hva systemet er

En statisk webapp som rangerer ~300 steder i Norge etter prognostiserte snøforhold, med en forklarbar poengsum
(SnowScore, 0–100). Brukeren ser stedene på et kart eller i en liste, filtrerer på egne krav, søker på stedsnavn og
åpner en stedsside med full poengsum. Et dataprogram henter værdata omtrent én gang i timen og publiserer **én
JSON-datafil**, som appen leser.

Det finnes ingen backend, ingen database, ingen brukerkontoer og ingen skrivbare endepunkter (AD-1, PRD NFR-5).

**Viktigste prinsipp:** *statiske filer, ingen nøkler, demodata som eget valg.*
- Appen er statiske filer som bare leser datafila. Dataprogrammet er et Node-script uten tilstand mellom
  kjøringene.
- Ingen del av systemet trenger nøkler. Datakildene er åpne API-er, og MET krever bare en identifiserende
  User-Agent.
- Demomodus (`npm ci && npm run dev:demo`) kjører uten nett og uten nøkler på et committet demodatasett. Den er
  **ikke** en automatisk reserve: modusen velges når appen bygges, og en vanlig bygg viser aldri demodata. Uten
  datafil sier appen fra og viser kommandoen for demomodus (AD-10).

---

## 2. Tjenestene (runtime-arkitektur)

```
 Datakilder (åpne API-er, ingen nøkler)
 ┌──────────────────────────────┐   ┌────────────────────────────────────┐
 │ MET Locationforecast 2.0     │   │ Kartverket Stedsnavn + Kommuneinfo │
 │ NVE seNorge (GridTimeSeries) │   │ OpenStreetMap (Overpass)           │
 └──────────────┬───────────────┘   └─────────────────┬──────────────────┘
                │ hver time                            │ bare når katalogen bygges for hånd
                ▼                                      ▼
 ┌──────────────────────────────┐        npm run catalog → data/catalog.json
 │ GitHub Actions               │        (committet, leses av dataprogrammet, AD-5)
 │ data.yml: npm run data       │
 │ data-timer.yml: neste kjøring│
 └──────────────┬───────────────┘
                │ git push --force (bare latest.json)
                ▼
 ┌──────────────────────────────┐
 │ grenen data: latest.json     │
 └──────────────┬───────────────┘
                │ vercel.json-rewrite: /data/latest.json → raw.githubusercontent.com/…/data/latest.json
                ▼
 ┌──────────────────────────────┐        ┌───────────────────────────────────┐
 │ Vercel: statisk app fra main │ ◄────── │ Nettleser: kart (Leaflet), liste, │
 │ snowfinder-seven.vercel.app  │         │ filter, søk, stedsside            │
 └──────────────────────────────┘        └─────────────────┬─────────────────┘
                                                            │ kartfliser
                                                            ▼
                                          Kartverket topo (cache.kartverket.no, WMTS)
```

| Del | Rolle | Offentlig? |
| --- | --- | --- |
| Appen på Vercel | Statisk Vite/React-bygg fra `main`. Leser `/data/latest.json` | ja |
| Grenen `data` | Holder bare `latest.json`. Skrives bare av `data.yml` og skal aldri slettes eller committes til for hånd | ja (offentlig repo-fil) |
| `data.yml` | Kjører dataprogrammet og publiserer `latest.json` til grenen `data`, leser fila tilbake fra grenen og fra nettsiden | nei |
| `data-timer.yml` | Venter til dataene er rundt 55 minutter gamle og starter `data.yml` på nytt | nei |
| `data/catalog.json` | Stedskatalogen (~300 steder), bygget for hånd og committet (AD-5) | i repoet |
| `public/data/demo.json` | Demodatasettet, committet (AD-10) | i repoet |

### Datakilder

| Kilde | Brukes til | Når | Adresse |
| --- | --- | --- | --- |
| MET Locationforecast 2.0 | Prognose: nedbør, temperatur, vind, skydekke | hver kjøring av dataprogrammet | `api.met.no/weatherapi/locationforecast/2.0/compact` |
| NVE seNorge | Modellert nysnø siste døgn (tilleggsdata, inngår ikke i SnowScore) | hver kjøring | `gts.nve.no/api/GridTimeSeries/` |
| Kartverket Stedsnavn og Kommuneinfo | Navn og kommune for steder i katalogen | bare `npm run catalog` | `api.kartverket.no/stedsnavn/v1/`, `api.kartverket.no/kommuneinfo/v1/` |
| OpenStreetMap via Overpass | Vintersportsområder med navn (`landuse=winter_sports`) til katalogen | bare `npm run catalog` | `overpass-api.de`, `overpass.kumi.systems` |
| Kartverket topografisk kart | Bakgrunnskartet i appen | i nettleseren | `cache.kartverket.no/v1/wmts/…/topo/` |

### Flyt og tillitsmodell

- Appen kaller bare sin egen adresse for data. Den eneste eksterne forespørselen fra nettleseren er kartflisene fra
  Kartverket (AD-5).
- Hver datafil har nøyaktig én skriver (AD-1): `data.yml` skriver grenen `data`, `npm run data:demo` skriver
  `demo.json`, og `npm run catalog` skriver `catalog.json`.
- Dataprogrammet publiserer bare når minst 95 % av stedene har en poengsum. Ellers beholder grenen siste gyldige fil
  (AD-2, AD-10).
- Hver publisert verdi har kjørings-ID og kildens tidsstempel, og hver kjøring skriver en kvalitetsrapport (AD-11).
- Posisjon brukes bare i nettleseren til avstandsfilteret og sendes aldri noe sted (PRD FR-23).

---

## 3. Dataprogrammet (`scripts/pipeline/`)

| Område | Valg |
| --- | --- |
| Språk/runtime | TypeScript på **Node 24** (eller 26+; Node 25 støttes ikke av Vitest), kjørt med **tsx** |
| Kommandoer | `npm run data` (ekte API-er), `npm run data:demo` (lagrede svar i `tests/contract/fixtures/`), `npm run data:hent` (henter siste `latest.json` fra grenen `data`) |
| Steg | Henting → validering → SnowScore → publisering, som egne filer med én felles kjøringskontrakt (AD-2) |
| Validering | **Zod**-skjemaer i `shared/contracts/` for alt som krysser en grense (AD-12) |
| Delt logikk | SnowScore, filter, søk, skivindu og solhøyde i `shared/`, brukt av både dataprogram og app (AD-6) |
| Kallrate | Høyst 10 kall i sekundet per kilde, med begrenset samtidighet og identifiserende User-Agent (AD-2) |
| Katalog | `npm run catalog` (`scripts/build-catalog/`), kjøres for hånd. Ingen annen kode importerer det (AD-5) |

---

## 4. Frontend (`src/`)

| Område | Valg |
| --- | --- |
| Rammeverk | **React 19** med **Vite 8**, TypeScript 6.0 |
| Kart | **Leaflet 1.9** med Kartverkets topografiske fliser, uten nøkkel |
| Data | Én datahook for kart og liste (AD-8). Fila velges ved bygg: `demo.json` med `--mode demo`, ellers `latest.json` (AD-10) |
| Validering | **Zod** (samme skjemaer som dataprogrammet) |
| Stil | Designtokens med én kilde i koden (AD-9) |
| Tilstand i adressen | Filteret står i URL-en, så et søk kan deles (PRD FR-21) |
| Avhengigheter | Bare fire i kjøretid: `react`, `react-dom`, `leaflet`, `zod`. Alle versjoner er låst eksakt, uten `^` |

---

## 5. Testing

| Nivå | Verktøy | Hvor |
| --- | --- | --- |
| Enhets- og egenskapstester | **Vitest** og **fast-check** | ved siden av koden (AD-4) |
| Fasittabeller | Vitest mot JSON-fasit | `tests/golden/` |
| Kontraktstester | Vitest mot lagrede MET- og NVE-svar (`npm run fixtures:record` tar opp nye) | `tests/contract/` |
| E2E og tilgjengelighet | **Playwright** og **@axe-core/playwright** | `tests/e2e/` |

- `npm run test:e2e` kjører Chromium på demodata og prosjektet `normalmodus` mot et eget bygg i normal modus.
- `npm run test:e2e:nettlesere` kjører slidertestene i Firefox og WebKit.
- E2E bruker portene 4173 og 4174 og kjører uten nett.

---

## 6. CI og drift

| Del | Valg |
| --- | --- |
| CI (`ci.yml`) | På hver PR og push til `main`: lint, typecheck, `npm test` og `npm run build:demo` på Node 24 |
| E2E (`e2e.yml`) | På hver PR og push til `main`: jobbene `e2e` (Chromium og normal modus) og `nettlesere` (Firefox og WebKit) |
| Pre-push-hook (`.githooks/pre-push`) | Kjører de samme fire sjekkene som CI og avviser push når sporede filer har endringer som ikke er committet. Slås på av `npm ci` (`prepare`) |
| Dataprogram (`data.yml`) | Timeplan hvert 10. minutt med en aldersgrense (`gate`) som reserve, startet av `data-timer.yml` omtrent hver time, ved push til `main` og manuelt. Én kjøring om gangen (`concurrency`). Jobbene `data` → `branch` → `verify` (AD-2) |
| Timer (`data-timer.yml`) | Startes av `data.yml`. Venter til dataene er rundt 55 minutter gamle (minst 30) og starter `data.yml` med `workflow_dispatch` |
| Hosting | **Vercel**, eneste publiseringsløsning emnet støtter. Bygger `main` til produksjon og hver PR til en forhåndsvisning. `npm run build --ignore-scripts`, og datafilene fjernes fra `dist/`, så nettsiden bare viser fila på grenen `data` |
| Overvåking | En rød kjøring vises i Actions-fanen, og GitHub sender e-post. Ingen egen varslingstjeneste (PRD NFR-6) |

---

## 7. Nøkler og miljøvariabler

**SnowFinder trenger ingen nøkler eller hemmeligheter.** Grunnene:
- MET, NVE, Kartverket og Overpass er åpne API-er uten nøkkel. MET krever bare en identifiserende User-Agent, som står
  i koden (`scripts/pipeline/fetch.ts`, `scripts/build-catalog/http.ts`).
- Appen har ingen backend og ingen kontoer, så det finnes ingenting å autentisere mot.
- Vercel-oppsettet i `vercel.json` bruker bare offentlige adresser.

Repoet skal ikke ha `.env` med ekte verdier (AGENTS.md).

| Variabel | Type | Hvor den kommer fra | Merknad |
| --- | --- | --- | --- |
| `GH_TOKEN` (= `github.token`) | settes av GitHub | automatisk i hver workflow-kjøring | Brukes i `data.yml` og `data-timer.yml` til å lese grenen `data` og starte `data.yml`. Ikke en hemmelighet gruppa lager eller lagrer |
| `import.meta.env.MODE` | bygg | Vite | `demo` med `--mode demo`, ellers normal modus. Velger datafil |
| `import.meta.env.BASE_URL` | bygg | Vite | Rotstien til appen |
| `process.env.CI` | kjøring | settes av GitHub Actions | Brukes av Playwright-oppsettet |
| `EXPECTED_RUN_ID`, `READBACK_LIMIT_SECONDS`, `READBACK_INTERVAL_SECONDS`, `URL` | workflow | `data.yml` | Konfigurasjon for tilbakelesingen, ikke hemmelig |

Rettighetene til `GITHUB_TOKEN` er satt per jobb: `contents: read` som standard, `contents: write` bare i jobben som
skriver grenen `data`, og `actions: write` bare i timeren.

---

## 8. Kontoer og tjenester du må ha for å gjenskape oppsettet

| # | Tjeneste | Brukes til | Påkrevd? |
| --- | --- | --- | --- |
| 1 | **GitHub** | repo, PR-er, Actions (CI, E2E, dataprogrammet) og grenen `data` | ja. Actions må være slått på i repoet |
| 2 | **Vercel** | hosting av appen fra `main`, forhåndsvisning per PR | ja for nettsiden. Ett prosjekt, eid av ett gruppemedlem på Hobby-kontoen |
| 3 | MET, NVE, Kartverket, OpenStreetMap | datakildene | nei, ingen konto eller nøkkel |

For å kjøre lokalt trengs bare Node 24 (eller 26+) og nett, eller ikke engang nett med `npm run dev:demo`.

---

## 9. Sjekkliste ved gjenskaping

1. Installer Node 24 (eller 26+). Kjør `npm ci`, som også slår på pre-push-hooken.
2. Prøv `npm run dev:demo`. Den virker uten nett og nøkler.
3. Bytt User-Agent i `scripts/pipeline/fetch.ts` og `scripts/build-catalog/http.ts` til din egen identifikasjon,
   slik MET krever.
4. Slå på GitHub Actions i repoet, og la `data.yml` kjøre på `main`. Den lager grenen `data` ved første vellykkede
   kjøring.
5. Bytt repo-adressen i rewriten i `vercel.json` og nettsideadressen i jobben `verify` i `data.yml` til dine egne.
6. Opprett **ett** Vercel-prosjekt som bygger fra `main`, med innstillingene i `vercel.json`. Ingen miljøvariabler
   trengs.
7. Sjekk at `/data/latest.json` på nettsiden svarer, og at `verify` i `data.yml` er grønn.
8. Bygg katalogen på nytt med `npm run catalog` bare hvis du vil ha andre steder. Fila committes.
