# Sprint Change Proposal: Ekte data som standard, demomodus bare når den velges

**Dato:** 2026-10-31
**Utløst av:** Aksels presiseringer etter rundebordet 2026-10-31. Rundebordet fant at testplanen krever demodata, mens `npm run dev` i PR #78 kan vise ekte data.
**Erstatter:** `sprint-change-proposal-2026-10-31-datagren.md`, som feilaktig sa at UX ikke ble berørt.
**Modus:** batch, gjennomføres stegvis
**Omfang:** Moderat. Kode, workflow, krav, arkitektur og testplan endres.
**Godkjent:** Aksel (2026-10-31). Gjennomføres stegvis, med godkjenning for hvert steg.

## 1. Beslutningene fra Aksel

1. `npm run dev` viser ekte værdata som standard.
2. Demodata brukes bare når demomodus velges eksplisitt.
3. `npm run data:hent` oppdaterer værdata lokalt, uten at noe må gjøres for hånd i den publiserte appen.
4. `npm run build && npm run preview` og `npm run dev` bruker samme datagrunnlag i vanlig drift.
5. Generalprøven skal bruke et fast, dokumentert testdatasett, så resultatene kan gjentas.
6. FR-30, AD-10, testplanen og arkitekturen oppdateres så de stemmer overens.
7. Ingenting merges før relevante tester er bestått.
8. Publisering verifiseres på den faktiske nettsiden, ikke bare med grønn workflow.
9. Endringene gjennomføres stegvis, med godkjenning for hvert steg.

Dette er ikke alternativ B fra rundebordet, der `npm run dev` alltid viste demodata. Det er en ny løsning.

## 2. Foreslått løsning

### Datakilder

| Kommando | Datakilde | Uten data |
|---|---|---|
| `npm run dev` | `public/data/latest.json`, hentet automatisk først | Melding med `npm run dev:demo` |
| `npm run build && npm run preview` | Samme fil, hentet automatisk først | Samme melding |
| `npm run dev:demo` | `public/data/demo.json` | Finnes alltid |
| `npm run build:demo && npm run preview` | `public/data/demo.json` (brukes av CI og E2E) | Finnes alltid |
| Publisert app | `latest.json` fra timesjobben | Bygget feiler, og forrige publisering står |

- **`npm run data:hent`** laster ned fila fra grenen `data`, sjekker den mot `PublishedData` og erstatter den lokale fila bare hvis den er nyere. Feiler hentingen, står den lokale fila urørt, og kommandoen sier fra. Den kjører automatisk før `dev` og `build` (`predev`, `prebuild`).
- **Appen leser aldri en ekstern adresse.** Lesingen fra `raw.githubusercontent.com` i PR #78 fjernes, så appen bare leser én lokal fil.
- **Ingen automatisk reserve til demodata.** Vite-modus (`--mode demo`) velger fil ved bygging. Normal modus kan derfor aldri vise demodata.
- **Timesjobben skriver alltid til grenen `data`**, og i tillegg til Pages når Pages er på. Da finnes én kilde, og grenen blir ikke gammel når Pages slås på.

### Verifisering av publisering

- Etter publisering leser jobben fila tilbake fra den faktiske adressen og sammenligner `runId` med kjøringen. Stemmer den ikke innen noen minutter, blir kjøringen rød.
- Det gjelder både grenen `data` og Pages-adressen.
- Når Pages er bekreftet på, blir «Pages er av» rød i stedet for en advarsel.
- For hånd: åpne nettsiden og en direkte lenke til `/sted/<id>`, og se at tidspunktet endrer seg etter neste timeskjøring.

## 3. Konsekvenser

| Område | Konsekvens |
|---|---|
| **Sensor (størst risiko)** | `npm ci && npm run dev` krever nå nett og en fungerende timesjobb for å vise data. Uten dem vises en melding, ikke appen. Stopper jobben, for eksempel etter 60 dager uten aktivitet i repoet, viser standardkommandoen «Ingen ferske data» når sensor åpner den. Faglærer ba om lokal demomodus som Må ha, og sensorveiledningen vurderer kjøring uten gruppens egne tjenester (README og kjørbarhet, 10 %). `npm run dev:demo` oppfyller kravet, men er ikke lenger standard. Kommandoen må stå øverst i README. |
| FR-30 | Må skrives om: demomodus er fortsatt Må ha, men må velges. SM-14 endres tilsvarende. |
| AD-10 | Må skrives om: to moduser valgt ved bygging, ingen reserve til demodata. |
| Epics | Story 1.10 og 1.11 får merknad om endringen. Story 1.10 sa «uten nøkler og nettverk» med `npm run dev`. |
| Testplan og UX | Brukertesten bruker `npm run build:demo && npm run preview`. Oppgavene (Trysil 12,6 cm, Gaustatoppen 58, Kirkenes 4 t) gjelder demodatasettet, så de kan stå. UJ-teksten i EXPERIENCE.md om demobanneret må endres. |
| Kode | `loadPublishedData.ts` blir enklere. Ny `scripts/pipeline/hent-data.ts` med tester. Melding for manglende data. |
| Tester | `playwright.config.ts`, `ci.yml` og `.githooks/pre-push` bruker `build:demo`. E2E-testene som endrer `latest.json` (`gamle-data`, `tom`, `sted` og flere av de åtte spec-filene), må endre `demo.json` eller få en egen kjøring. Dette er den største arbeidsposten. |
| `data.yml` | Bygger uten `prebuild`, skriver alltid til `data`, og får verifisering. |
| README og `AGENTS.md` | Kom i gang, Demomodus og Live-data skrives om. Sensorregelen i `AGENTS.md` endres via `bmad-project-context`. |
| Tidsplan | Timesjobben må gå i minst én uke før sluttrapporten (ferskhet i PRD §9), altså senest 16. november. Stegene under bør være ferdige før brukertesten starter 12. november. |

## 4. Implementeringsplan

Hvert steg er én commit på PR #78 og stopper for godkjenning fra Aksel.

| Steg | Innhold | Bevis før neste steg |
|---|---|---|
| 0 | Sett PR #78 til utkast, og si fra til Joseph | PR-en kan ikke merges ved et uhell |
| 1 | Dokumenter: FR-30, SM-14, AD-10, epics, testplan, generalprøve, README (begge kopier der de finnes) | Kopiene er like |
| 2 | Kode: demomodus, `data:hent`, melding for manglende data, enhetstester | `lint`, `typecheck`, `test`, `build` |
| 3 | E2E, `ci.yml`, `pre-push` mot `build:demo`, pluss en test av at normal modus aldri leser `demo.json` | Hele E2E grønn lokalt |
| 4 | `data.yml`: alltid `data`, verifisering av `runId` | `data.yml` grønn på PR-en, som ikke publiserer |
| 5 | Review fra Joseph, merge når alt er grønt | `gh pr checks --watch` og godkjenning |
| 6 | Kjør for hånd på `main`, og sjekk grenen `data` på ekte. Sjekk rent klon med `npm run dev` | `runId` stemmer, og `generert` endrer seg etter en time |
| 7 | *Erstattet 2026-11-01 av `sprint-change-proposal-2026-11-01-vercel.md`, fordi Pages er slått av i emnet.* Pages når faglærer har slått det på: nettsiden, direkte lenke, og at tidspunktet endrer seg. Gjør «Pages er av» rød | Nettsiden oppdateres |

## 5. Valg tatt 2026-10-31

1. **Datoer:** brukertesten bruker det faste datasettet fra 12. november. Generalprøven er fortsatt 24. november og kjører begge veier: `npm run dev:demo` og `npm run dev`.
2. **Faglærer:** Aksel spør Bård om det er greit at demomodus krever en egen kommando. Svaret stopper ikke steg 0 og 1, men kan endre standardvalget i FR-30.
3. **Forslaget og steg 0 er godkjent.** Steg 1 og utover venter på egen godkjenning.
