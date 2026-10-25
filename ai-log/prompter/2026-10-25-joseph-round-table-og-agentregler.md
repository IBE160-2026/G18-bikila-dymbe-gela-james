# 2026-10-25: Status, round table og opprydding i agentreglene

**Hvem:** Joseph
**Verktøy / agent:** Claude Code (Opus 5.5), `bmad-build` (spec for Story 3.4), `bmad-party-mode` (alle agentene) og `bmad-project-context` (AGENTS.md)
**Fase:** Gjennomføring
**Resultat:**
- Spec for Story 3.4 (hurtigvalg) er godkjent og står som `ready-for-dev` på greina `story/3-4-hurtigvalg`. Den leveres i egen PR.
- Round table med agentene om feil og svakheter i prosjektet.
- `AGENTS.md` er ryddet opp, og regelen om review fra et gruppemedlem før merge er innført.
- `sprintplan.md` noterer at 3.5 ble bygget før 3.4. `fremdriftsplan.md` noterer den nye review-regelen.

## Prompter

### 1
> connnect to https://github.com/IBE160-2026/G18-bikila-dymbe-gela-james

**Svar (kort):** Repoet var allerede koblet. Lokal `main` lå 83 commits bak og ble spolt fram.

### 2
> hvor er vi nå ?

**Svar (kort):** Epic 1 og 2 og Må ha i Epic 3 er ferdige, og 3.5 er ferdig. Neste er 3.4. 1.11 venter på faglærer.

### 3
> kjør neste story

**Svar (kort):** `bmad-build` lagde en spec for 3.4. Joseph valgte verdiene «Ekte pudder» (Pudderdag: nysnø ≥ 10 cm, vind ≤ 8 m/s, temp ≤ −2 °C; Sol etter snøfall: nysnø ≥ 5 cm, skydekke ≤ 30 %) og at et hurtigvalg erstatter hele filteret.

### 4
> godkjenn og stopp

**Svar (kort):** Specen står som `ready-for-dev`, og ingen kode er skrevet.

### 5
> du må nå samle alle agentene på en round table discussion om arbeidet vi gjør. vi vil at de kommer med noen anbefalinger og hvis evt. vi har gjørt noe feil mens vi jobbet  med prosjektet frem til nå.

**Svar (kort):** Funn: skjev fordeling av commits (Aksel 67, Joseph 34, Bård 3, Kelly 1), ingen møtereferater, steg 8c (wireframes og brukertestplan) ikke startet, UX-dokumentene har glidd fra koden, appen er ikke publisert, og E2E var rød i PR #33–#38 uten at noen så det.

### 6
> sjekk også evt. svakheter

**Svar (kort):** MET-hentingen respekterer ikke `Expires`/`If-Modified-Since` og håndterer ikke `429`. Ingen side setter `document.title` (WCAG 2.4.2). SnowScore er aldri sjekket mot observert snø. Hurtigvalgene gir null treff i demodata. Bussfaktor 1.

### 7
> hva er feilen her [AGENTS.md limt inn]

**Svar (kort):** Ni motsigelser og utdaterte linjer, blant annet grennavn, språket i story-specs, «planleggingen er ferdig», commit-stil og «lim resultatet inn i PR-en».

### 8
> Kan du fikse dette ? hva med våres mappestruktur på git ? er den greit ?

**Svar (kort):** `bmad-project-context` rettet AGENTS.md etter Josephs valg: commit-meldinger med prefiks og norsk beskrivelse, og `CONTRIBUTING.md` slettes. Mappestrukturen er god for koden. Svakhetene er gamle greiner på GitHub, tomme fasemapper og to kopier av planleggingsdokumentene.

**Hva vi gjorde med det:**
- Claude trakk tilbake påstanden om at kursets skjermkrav sa imot forbudet mot kontoer, fordi AGENTS.md allerede sier at slike funksjoner aldri skal bygges.

### 9
> hvor har vi filen for de faste regler agentene skal følge ?

**Svar (kort):** `AGENTS.md` i rota. `CLAUDE.md` importerer den.

### 10
> kan du oppdatere disse reglene i agent.md slik at andre i gruppen ta review etter en story er ferdig ?

**Svar (kort):** En story-PR krever nå godkjenning fra et annet gruppemedlem, og vi bytter på hvem som tar review. `docs/`-PR-er er unntatt.

**Hva vi gjorde med det:**
- SM-8 i PRD-en sier fortsatt at godkjenning er fjernet. Den skal oppdateres via `bmad-correct-course`.
- Regelen håndheves ikke av GitHub før faglærer slår på grenbeskyttelse.

### 11
> ja , committe den og push til git
