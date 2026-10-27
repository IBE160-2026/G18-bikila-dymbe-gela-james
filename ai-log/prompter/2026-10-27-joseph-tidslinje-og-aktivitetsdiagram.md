# 2026-10-27: Synlig PR for Story 3.7, tidslinje, milepæler og aktivitetsdiagram

**Hvem:** Joseph
**Verktøy / agent:** Claude Code (Opus 5.5), `bmad-project-context` (AGENTS.md) og `sesjonslogg`
**Fase:** Gjennomføring
**Resultat:**
- PR #65 (Senas Story 3.7) startet ingen sjekker fordi kontoen hennes er flagget av GitHub. En synlig kopi ble åpnet som PR #66, og CI og E2E er grønne.
- `milepæler.md` har fått datoer for alle milepælene, og fasemilepæler F1–F5. Datoene er merket nådd, vedtatt eller forslag.
- `fremdriftsplan.md` har fått seksjonen «Tidslinje» med et Gantt-diagram og en datotabell. Story 3.4 og 3.6 er satt til `done`.
- Nytt `3-Gjennomføringsfasen/aktivitetsdiagram.md` med arbeidsflyten fram til levering 2026-11-25.
- `AGENTS.md` har fått regelen om at tidslinjen, milepælene og aktivitetsdiagrammet oppdateres i samme PR.

## Prompter

### 1
> [skjermbilde av en tidligere konklusjon om at sjekkene på PR #65 ikke startet] hva betyr dette ?

**Svar (kort):** Forklarte konklusjonen: GitHub hadde trolig ikke startet hendelsen, og bare en administrator kan se innstillingene.

### 2
> kan du fikse problemmet ?

**Svar (kort):** Den første forklaringen var feil. PR #65 er Senas, og kontoen hennes er flagget, så PR-en er usynlig og starter ingen sjekker. Greinen `story/3-7-filtrer-pa-stedstype-pr` peker på Senas commits, og PR #66 er åpnet fra den med review fra Aksel. CI og E2E er grønne.

### 3
> Kan du gi meg en oppsummering av alle arbeidet som gjenstår på Git som må godkjennes ?

**Svar (kort):** Bare #66 venter på godkjenning. Skjulte PR-er, 3.6 som står som `review`, greiner som kan slettes og lokale loggcommits ble listet opp.

### 4
> commit og push dem.

**Svar (kort):** Loggcommitene var allerede committet. Greinen `docs/sesjonslogg-joseph` ble pushet, og PR #67 ble åpnet med grønne sjekker.

### 5
> did you clean up all of the project files ?

**Svar (kort):** Nei. Ferdige greiner på GitHub og lokalt og 3.6 som står som `review` ble listet opp. Sletting av greiner venter på et ja.

### 6
> can you run test on all implementations til now ?

**Svar (kort):** Lint, typecheck, test, build og E2E kjørt på `main` (519 enhetstester, 87 E2E) og på PR #66 (545 og 99). Alt grønt.

### 7
> how many stories and epics do we have in this project ?

**Svar (kort):** 5 epics og 29 stories, 23 i v1. 18 ferdige, 3.6 og 3.7 underveis, 1.11, 3.8 og 4.2 gjenstår.

### 8
> where is the project srs

**Svar (kort):** Prosjektet har ingen egen SRS. PRD-en brukes som kravdokument (besluttet 2026-10-07).

### 9
> is the implementation an app or a website ?

**Svar (kort):** En statisk webapp (nettside) på GitHub Pages som også virker på mobil. PWA er «Ikke i v1».

### 10
> COULD YOU ORGANIZE THIS PROJECT AND DRAW THE TIMELINE AND MILESTONES WITH DATES  AND PLACE THEM IN PROPER PROJECT PHASE FOLDERS AND MAKE A RULES IN AGENT.MD THAT THEY SHOULD BE UPDATED ?

**Svar (kort):** Milepælene fikk datoer (nådd fra PR-historikken, framtidige som forslag), fremdriftsplanen fikk en tidslinje, og `AGENTS.md` fikk regelen via `bmad-project-context`. Status står fortsatt bare i fremdriftsplanen.

### 11
> MAKE AN ACTIVITY DIAGRAM WE SHOULD FOLLOW TIL THE DEADLINE AND PLACE IT IN THE APPROPRIATE FOLDER

**Svar (kort):** `3-Gjennomføringsfasen/aktivitetsdiagram.md` med tre parallelle spor (stories, Story 1.11, steg 8c) som samles i brukertest, sluttrapport og levering. Begge diagrammene er sjekket med Mermaid-parseren.
